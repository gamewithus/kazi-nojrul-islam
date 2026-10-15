import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { ChapterDrawer } from './components/ChapterDrawer';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { StoryReader } from './components/StoryReader';
import { StoryModal } from './components/StoryModal';
import { ShareQuoteModal } from './components/ShareQuoteModal';
import { CHAPTERS, STORY_METADATA } from './data/storyData';
import { Chapter, ThemeMode } from './types';
import { ttsService } from './utils/ttsService';
import { ambientEngine } from './utils/ambientAudio';

export default function App() {
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [theme, setTheme] = useState<ThemeMode>('nocturne');
  const [fontSize, setFontSize] = useState<number>(18);
  const [isChapterDrawerOpen, setIsChapterDrawerOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [quoteToShare, setQuoteToShare] = useState<string | null>(null);

  // TTS State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [playingChapterId, setPlayingChapterId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState('Fenrir');
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [continuousPlay, setContinuousPlay] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadToast, setDownloadToast] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Ambient Audio State
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const [ambientVolume, setAmbientVolume] = useState(0.35);

  const currentChapter: Chapter = CHAPTERS[currentChapterIndex] || CHAPTERS[0];

  // Map ambient mode to readable Bengali title
  const ambientLabels: Record<string, string> = {
    flute: 'বাঁশির সুর',
    wind: 'গিরিবাতাস',
    river: 'ঝিলম নদী',
    tanpura: 'তানপুরা',
    war: 'রণসংগীত',
    elegy: 'সমাধি সুর',
  };

  // Setup TTS callbacks
  useEffect(() => {
    ttsService.setCallbacks({
      onStart: () => {
        setIsPlaying(true);
        setIsLoading(false);
        setErrorMessage(null);
      },
      onPause: () => {
        setIsPlaying(false);
      },
      onProgress: (pct, cur, dur) => {
        setProgress(pct);
        setCurrentTime(cur);
        setDuration(dur);
      },
      onEnd: () => {
        setIsPlaying(false);
        setProgress(100);

        // Continuous play to next chapter
        if (continuousPlay && currentChapterIndex < CHAPTERS.length - 1) {
          const nextIndex = currentChapterIndex + 1;
          setCurrentChapterIndex(nextIndex);
          const nextChapter = CHAPTERS[nextIndex];
          setTimeout(() => {
            playChapterTTS(nextChapter);
          }, 600);
        } else {
          setPlayingChapterId(null);
        }
      },
      onError: (msg) => {
        setIsLoading(false);
        setIsPlaying(false);
        setErrorMessage(msg);
      },
      onLoading: (loading) => {
        setIsLoading(loading);
      },
      onDownloadStatus: (status, message) => {
        if (status === 'success') {
          setDownloadToast({ type: 'success', text: message || 'ডাউনলোড সম্পন্ন হয়েছে!' });
          setTimeout(() => setDownloadToast(null), 3500);
        } else if (status === 'error') {
          setDownloadToast({ type: 'error', text: message || 'ডাউনলোডে সমস্যা হয়েছে।' });
          setTimeout(() => setDownloadToast(null), 4000);
        } else if (status === 'downloading') {
          setDownloadToast({ type: 'info', text: message || 'অডিও প্রস্তুত হচ্ছে...' });
        }
      },
    });

    return () => {
      ttsService.stop();
      ambientEngine.stop();
    };
  }, [continuousPlay, currentChapterIndex]);

  // Sync ambient sound when chapter changes
  useEffect(() => {
    if (isAmbientPlaying) {
      ambientEngine.switchMode(currentChapter.ambientSound);
    }
  }, [currentChapter, isAmbientPlaying]);

  // Prepare text for TTS reading
  const prepareChapterText = (ch: Chapter): string => {
    const titlePart = `${ch.title}। ${ch.subtitle}।`;
    const paragraphsPart = ch.paragraphs.join('\n\n');
    return `${titlePart}\n\n${paragraphsPart}`;
  };

  // Play a specific chapter
  const playChapterTTS = useCallback(
    (ch: Chapter) => {
      setErrorMessage(null);
      setPlayingChapterId(ch.id);
      ttsService.setVoice(selectedVoice);
      ttsService.setPlaybackRate(playbackRate);

      const fullText = prepareChapterText(ch);
      const stylePrompt =
        'Poignant, evocative Bengali literary narration with emotional depth, melancholic pacing, and reverence for Kazi Nazrul Islam’s prose.';

      ttsService.speakText(fullText, ch.id, stylePrompt);
    },
    [selectedVoice, playbackRate]
  );

  // Toggle play/pause for currently viewed chapter
  const handleTogglePlay = () => {
    if (isLoading) return;

    if (isPlaying) {
      ttsService.pause();
      setIsPlaying(false);
    } else {
      if (playingChapterId === currentChapter.id) {
        ttsService.resume();
        setIsPlaying(true);
      } else {
        playChapterTTS(currentChapter);
      }
    }
  };

  const handleSeek = (pct: number) => {
    setProgress(pct);
    ttsService.seek(pct);
  };

  const handleNextChapter = () => {
    if (currentChapterIndex < CHAPTERS.length - 1) {
      const nextIdx = currentChapterIndex + 1;
      setCurrentChapterIndex(nextIdx);
      if (isPlaying) {
        playChapterTTS(CHAPTERS[nextIdx]);
      }
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
      const prevIdx = currentChapterIndex - 1;
      setCurrentChapterIndex(prevIdx);
      if (isPlaying) {
        playChapterTTS(CHAPTERS[prevIdx]);
      }
    }
  };

  const handleSelectChapter = (chapterId: string) => {
    const index = CHAPTERS.findIndex((c) => c.id === chapterId);
    if (index !== -1) {
      setCurrentChapterIndex(index);
      if (isPlaying) {
        playChapterTTS(CHAPTERS[index]);
      }
    }
  };

  const handleSelectVoice = (voiceId: string) => {
    setSelectedVoice(voiceId);
    ttsService.setVoice(voiceId);
    if (isPlaying) {
      // Re-trigger with new voice
      playChapterTTS(currentChapter);
    }
  };

  const handleChangePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    ttsService.setPlaybackRate(rate);
  };

  const handleToggleAmbient = () => {
    const newState = ambientEngine.toggle();
    setIsAmbientPlaying(newState);
    if (newState) {
      ambientEngine.switchMode(currentChapter.ambientSound);
    }
  };

  const handleChangeAmbientVolume = (vol: number) => {
    setAmbientVolume(vol);
    ambientEngine.setVolume(vol);
  };

  const handleOpenAmbientForCue = (cueType: string) => {
    ambientEngine.start(cueType as any);
    setIsAmbientPlaying(true);
  };

  const handleDownloadAudio = async (chapter?: Chapter) => {
    const targetChapter = chapter || currentChapter;
    setIsDownloading(true);
    setErrorMessage(null);

    const fullText = prepareChapterText(targetChapter);
    const safeTitle = targetChapter.number === 0 ? 'Intro' : `Chapter_${targetChapter.number}`;
    const filename = `Meher-Negar_${safeTitle}_${selectedVoice}.wav`;
    const stylePrompt =
      'Poignant, evocative Bengali literary narration with emotional depth, melancholic pacing, and reverence for Kazi Nazrul Islam’s prose.';

    await ttsService.downloadAudio(fullText, targetChapter.id, filename, stylePrompt);
    setIsDownloading(false);
  };

  return (
    <div className="min-h-screen relative selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navigation */}
      <Navbar
        currentChapterTitle={currentChapter.title}
        theme={theme}
        onThemeChange={setTheme}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        onOpenSidebar={() => setIsChapterDrawerOpen(true)}
        onOpenInfo={() => setIsInfoModalOpen(true)}
        isAmbientPlaying={isAmbientPlaying}
        onToggleAmbient={handleToggleAmbient}
        ambientModeName={ambientLabels[currentChapter.ambientSound] || 'আবহসুর'}
      />

      {/* Toast Alert Notification for Download & System */}
      {downloadToast && (
        <div className="fixed top-20 right-4 z-50 animate-fade-in pointer-events-none">
          <div
            className={`px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md text-xs font-medium border flex items-center gap-2 ${
              downloadToast.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40 shadow-emerald-950/50'
                : downloadToast.type === 'error'
                ? 'bg-rose-950/90 text-rose-200 border-rose-500/40 shadow-rose-950/50'
                : 'bg-amber-950/90 text-amber-200 border-amber-500/40 shadow-amber-950/50'
            }`}
          >
            <span>{downloadToast.text}</span>
          </div>
        </div>
      )}

      {/* Main Story Content */}
      <main>
        <StoryReader
          chapter={currentChapter}
          theme={theme}
          fontSize={fontSize}
          isPlaying={isPlaying && playingChapterId === currentChapter.id}
          isDownloading={isDownloading}
          activeProgress={playingChapterId === currentChapter.id ? progress : 0}
          onPlayChapter={handleTogglePlay}
          onDownloadChapter={() => handleDownloadAudio(currentChapter)}
          onPrevChapter={handlePrevChapter}
          onNextChapter={handleNextChapter}
          hasPrev={currentChapterIndex > 0}
          hasNext={currentChapterIndex < CHAPTERS.length - 1}
          onOpenAmbientForCue={handleOpenAmbientForCue}
          onShareQuote={(q) => setQuoteToShare(q)}
        />
      </main>

      {/* Floating Bottom Audio Player Bar */}
      <AudioPlayerBar
        currentChapter={currentChapter}
        isPlaying={isPlaying && playingChapterId === currentChapter.id}
        isLoading={isLoading}
        isDownloading={isDownloading}
        progress={playingChapterId === currentChapter.id ? progress : 0}
        currentTime={playingChapterId === currentChapter.id ? currentTime : 0}
        duration={playingChapterId === currentChapter.id ? duration : 0}
        onTogglePlay={handleTogglePlay}
        onSeek={handleSeek}
        onNextChapter={handleNextChapter}
        onPrevChapter={handlePrevChapter}
        selectedVoice={selectedVoice}
        onSelectVoice={handleSelectVoice}
        playbackRate={playbackRate}
        onChangePlaybackRate={handleChangePlaybackRate}
        isAmbientPlaying={isAmbientPlaying}
        onToggleAmbient={handleToggleAmbient}
        ambientVolume={ambientVolume}
        onChangeAmbientVolume={handleChangeAmbientVolume}
        continuousPlay={continuousPlay}
        onToggleContinuousPlay={() => setContinuousPlay(!continuousPlay)}
        onDownloadAudio={() => handleDownloadAudio(currentChapter)}
        errorMessage={errorMessage}
        onRetry={() => playChapterTTS(currentChapter)}
      />

      {/* Chapter Drawer / Table of Contents */}
      <ChapterDrawer
        isOpen={isChapterDrawerOpen}
        onClose={() => setIsChapterDrawerOpen(false)}
        chapters={CHAPTERS}
        currentChapterId={currentChapter.id}
        onSelectChapter={handleSelectChapter}
        playingChapterId={playingChapterId}
        isPlaying={isPlaying}
        onPlayChapter={(ch) => {
          handleSelectChapter(ch.id);
          playChapterTTS(ch);
        }}
      />

      {/* Story & Author Context Modal */}
      <StoryModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />

      {/* Share / Copy Quote Modal */}
      <ShareQuoteModal
        quote={quoteToShare}
        onClose={() => setQuoteToShare(null)}
      />
    </div>
  );
}
