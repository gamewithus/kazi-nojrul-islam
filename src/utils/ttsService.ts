/**
 * Client-side TTS Service
 * Connects to server-side Gemini 3.8 Flash TTS endpoint (/api/tts)
 * Handles audio playback, caching, progress tracking, interruption handling, and download.
 */

import { ambientEngine } from './ambientAudio';

export interface TTSPlaybackCallbacks {
  onStart?: () => void;
  onPause?: () => void;
  onProgress?: (progress: number, currentTime: number, duration: number) => void;
  onEnd?: () => void;
  onError?: (errMessage: string) => void;
  onLoading?: (isLoading: boolean) => void;
  onDownloadStatus?: (status: 'downloading' | 'success' | 'error', message?: string) => void;
}

class TTSService {
  private currentAudio: HTMLAudioElement | null = null;
  private playPromise: Promise<void> | null = null;
  private abortController: AbortController | null = null;
  private cache: Map<string, string> = new Map();
  private isBrowserSpeaking = false;
  private currentVoice = 'Fenrir';
  private playbackRate = 1.0;
  private callbacks: TTSPlaybackCallbacks = {};
  private activeCacheKey: string | null = null;

  public setCallbacks(cbs: TTSPlaybackCallbacks) {
    this.callbacks = cbs;
  }

  public setVoice(voice: string) {
    this.currentVoice = voice;
  }

  public getVoice(): string {
    return this.currentVoice;
  }

  public setPlaybackRate(rate: number) {
    this.playbackRate = rate;
    if (this.currentAudio) {
      this.currentAudio.playbackRate = rate;
    }
  }

  public getPlaybackRate(): number {
    return this.playbackRate;
  }

  public getCachedBlobUrl(cacheKey: string): string | undefined {
    const fullCacheKey = `${cacheKey}_${this.currentVoice}`;
    return this.cache.get(fullCacheKey);
  }

  /**
   * Fetch audio blob URL from cache or server
   */
  public async getOrFetchAudio(
    text: string,
    cacheKey: string,
    stylePrompt?: string,
    signal?: AbortSignal
  ): Promise<string> {
    const fullCacheKey = `${cacheKey}_${this.currentVoice}`;
    const cached = this.cache.get(fullCacheKey);
    if (cached) {
      return cached;
    }

    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voiceName: this.currentVoice,
        style: stylePrompt,
      }),
      signal,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${res.status}`);
    }

    const data = await res.json();
    if (!data.audio) {
      throw new Error('No audio returned by server');
    }

    // Convert base64 WAV to Blob URL
    const byteCharacters = atob(data.audio);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: data.mimeType || 'audio/wav' });
    const blobUrl = URL.createObjectURL(blob);
    this.cache.set(fullCacheKey, blobUrl);
    return blobUrl;
  }

  public async speakText(
    text: string,
    cacheKey: string,
    stylePrompt?: string
  ): Promise<void> {
    this.stop();

    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    this.activeCacheKey = cacheKey;
    this.callbacks.onLoading?.(true);

    try {
      const audioBlobUrl = await this.getOrFetchAudio(text, cacheKey, stylePrompt, signal);

      if (signal.aborted) return;

      this.callbacks.onLoading?.(false);
      this.playAudioUrl(audioBlobUrl);
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        // Intentional cancellation
        return;
      }
      console.warn('Gemini TTS failed or API key absent, attempting Web Speech API fallback:', error);
      this.callbacks.onLoading?.(false);

      if ('speechSynthesis' in window) {
        this.fallbackWebSpeech(text, error.message);
      } else {
        this.callbacks.onError?.(error.message || 'কণ্ঠ ধারণ করতে ব্যর্থ হয়েছে');
      }
    }
  }

  private playAudioUrl(url: string) {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.src = '';
      } catch (e) {
        // ignore
      }
    }

    this.currentAudio = new Audio(url);
    this.currentAudio.playbackRate = this.playbackRate;

    this.currentAudio.onplay = () => {
      ambientEngine.setDucked(true);
      this.callbacks.onStart?.();
    };

    this.currentAudio.onpause = () => {
      ambientEngine.setDucked(false);
      this.callbacks.onPause?.();
    };

    this.currentAudio.ontimeupdate = () => {
      if (this.currentAudio) {
        const cur = this.currentAudio.currentTime;
        const dur = this.currentAudio.duration || 1;
        const pct = (cur / dur) * 100;
        this.callbacks.onProgress?.(pct, cur, dur);
      }
    };

    this.currentAudio.onended = () => {
      this.playPromise = null;
      ambientEngine.setDucked(false);
      this.callbacks.onEnd?.();
    };

    this.currentAudio.onerror = (e) => {
      this.playPromise = null;
      ambientEngine.setDucked(false);
      // Only report genuine network/playback errors, ignore abort
      if (this.currentAudio?.error?.code !== 20) {
        this.callbacks.onError?.('অডিও প্লে করতে সমস্যা হয়েছে');
      }
    };

    // Safely track play() promise to prevent uncaught "interrupted by pause()" error
    this.playPromise = this.currentAudio.play();
    if (this.playPromise) {
      this.playPromise
        .then(() => {
          this.playPromise = null;
        })
        .catch((err: any) => {
          this.playPromise = null;
          // Normal browser behavior when interrupted by pause() or stop()
          if (
            err?.name === 'AbortError' ||
            err?.message?.includes('interrupted') ||
            err?.message?.includes('pause')
          ) {
            return;
          }
          console.error('Audio playback initiation error:', err);
          ambientEngine.setDucked(false);
          this.callbacks.onError?.('অডিও শুরু করা যায়নি। স্ক্রিনে ক্লিক করে আবার চেষ্টা করুন।');
        });
    }
  }

  public pause() {
    if (this.currentAudio) {
      if (this.playPromise) {
        this.playPromise
          .then(() => {
            this.currentAudio?.pause();
          })
          .catch(() => {});
      } else {
        this.currentAudio.pause();
      }
    }
    if (this.isBrowserSpeaking && 'speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
    ambientEngine.setDucked(false);
  }

  public resume() {
    if (this.currentAudio) {
      this.playPromise = this.currentAudio.play();
      if (this.playPromise) {
        this.playPromise
          .then(() => {
            this.playPromise = null;
          })
          .catch((err: any) => {
            this.playPromise = null;
            if (
              err?.name === 'AbortError' ||
              err?.message?.includes('interrupted') ||
              err?.message?.includes('pause')
            ) {
              return;
            }
            console.error('Audio resume error:', err);
          });
      }
      ambientEngine.setDucked(true);
    }
    if (this.isBrowserSpeaking && 'speechSynthesis' in window) {
      window.speechSynthesis.resume();
      ambientEngine.setDucked(true);
    }
  }

  public seek(pct: number) {
    if (this.currentAudio && this.currentAudio.duration) {
      this.currentAudio.currentTime = (pct / 100) * this.currentAudio.duration;
    }
  }

  public stop() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    if (this.currentAudio) {
      const audio = this.currentAudio;
      this.currentAudio = null;

      if (this.playPromise) {
        this.playPromise
          .then(() => {
            try {
              audio.pause();
              audio.currentTime = 0;
            } catch (e) {}
          })
          .catch(() => {});
      } else {
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch (e) {}
      }
      this.playPromise = null;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isBrowserSpeaking = false;
    ambientEngine.setDucked(false);
  }

  private fallbackWebSpeech(text: string, originalError: string) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = this.playbackRate * 0.95;

      const voices = window.speechSynthesis.getVoices();
      const bnVoice = voices.find((v) => v.lang.startsWith('bn'));
      if (bnVoice) {
        utterance.voice = bnVoice;
      }

      utterance.onstart = () => {
        this.isBrowserSpeaking = true;
        ambientEngine.setDucked(true);
        this.callbacks.onStart?.();
      };

      utterance.onend = () => {
        this.isBrowserSpeaking = false;
        ambientEngine.setDucked(false);
        this.callbacks.onEnd?.();
      };

      utterance.onerror = (e) => {
        this.isBrowserSpeaking = false;
        ambientEngine.setDucked(false);
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          this.callbacks.onError?.(originalError);
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      this.callbacks.onError?.(originalError);
    }
  }

  /**
   * Download the chapter's TTS audio as a .wav file
   */
  public async downloadAudio(
    text: string,
    cacheKey: string,
    filename: string,
    stylePrompt?: string
  ): Promise<void> {
    this.callbacks.onDownloadStatus?.('downloading', 'অডিও প্রস্তুত হচ্ছে...');
    try {
      const blobUrl = await this.getOrFetchAudio(text, cacheKey, stylePrompt);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename.endsWith('.wav') ? filename : `${filename}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      this.callbacks.onDownloadStatus?.('success', 'ডাউনলোড সম্পন্ন হয়েছে!');
    } catch (err: any) {
      console.error('Download error:', err);
      this.callbacks.onDownloadStatus?.(
        'error',
        err?.message || 'অডিও ডাউনলোড করতে সমস্যা হয়েছে'
      );
    }
  }
}

export const ttsService = new TTSService();
