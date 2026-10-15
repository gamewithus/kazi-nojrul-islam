import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Sliders,
  Sparkles,
  Loader2,
  RotateCcw,
  Music,
  Headphones,
  Check,
  Download,
} from 'lucide-react';
import { Chapter, VoiceOption } from '../types';
import { VOICE_OPTIONS } from '../data/storyData';

interface AudioPlayerBarProps {
  currentChapter: Chapter;
  isPlaying: boolean;
  isLoading: boolean;
  isDownloading?: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onSeek: (pct: number) => void;
  onNextChapter: () => void;
  onPrevChapter: () => void;
  selectedVoice: string;
  onSelectVoice: (voiceId: string) => void;
  playbackRate: number;
  onChangePlaybackRate: (rate: number) => void;
  isAmbientPlaying: boolean;
  onToggleAmbient: () => void;
  ambientVolume: number;
  onChangeAmbientVolume: (vol: number) => void;
  continuousPlay: boolean;
  onToggleContinuousPlay: () => void;
  onDownloadAudio: () => void;
  errorMessage: string | null;
  onRetry: () => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  currentChapter,
  isPlaying,
  isLoading,
  progress,
  currentTime,
  duration,
  onTogglePlay,
  onSeek,
  onNextChapter,
  onPrevChapter,
  selectedVoice,
  onSelectVoice,
  playbackRate,
  onChangePlaybackRate,
  isAmbientPlaying,
  onToggleAmbient,
  ambientVolume,
  onChangeAmbientVolume,
  continuousPlay,
  onToggleContinuousPlay,
  onDownloadAudio,
  isDownloading = false,
  errorMessage,
  onRetry,
}) => {
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showAudioSettings, setShowAudioSettings] = useState(false);

  const formatTime = (secs: number): string => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentVoiceObj = VOICE_OPTIONS.find((v) => v.id === selectedVoice) || VOICE_OPTIONS[0];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-1 pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="mb-2 px-4 py-2 rounded-xl bg-rose-950/90 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between shadow-xl backdrop-blur-md animate-fade-in">
            <span className="truncate pr-2">{errorMessage}</span>
            <button
              onClick={onRetry}
              className="px-2.5 py-1 rounded-lg bg-rose-800/80 hover:bg-rose-700 text-rose-100 font-medium text-[11px] shrink-0"
            >
              পুনরায় চেষ্টা
            </button>
          </div>
        )}

        {/* Main Floating Bar */}
        <div className="rounded-3xl p-3 sm:p-4 shadow-2xl backdrop-blur-xl border transition-all duration-300
          bg-stone-900/95 border-amber-500/30 text-stone-100 shadow-amber-950/50"
        >
          {/* Top Row: Progress Bar Scrubber */}
          <div className="flex items-center gap-2 mb-2 px-1">
            <span className="text-[10px] font-mono text-stone-400 w-9 text-right">
              {formatTime(currentTime)}
            </span>
            <div
              className="flex-1 h-2 bg-stone-800 rounded-full cursor-pointer relative overflow-hidden group py-1"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const newPct = (clickX / rect.width) * 100;
                onSeek(Math.max(0, Math.min(100, newPct)));
              }}
            >
              <div
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all group-hover:brightness-110"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-stone-400 w-9">
              {formatTime(duration)}
            </span>
          </div>

          {/* Bottom Row: Controls & Info */}
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Left: Chapter name & voice info */}
            <div className="flex items-center gap-3 min-w-0 max-w-[35%] sm:max-w-[32%]">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Headphones className="w-4 h-4 text-amber-400" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold font-serif-bn truncate text-stone-100">
                  {currentChapter.title}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-amber-300/80 truncate">
                  <span>Gemini 3.8 Flash TTS</span>
                  <span>•</span>
                  <span className="text-amber-400">{currentVoiceObj.name}</span>
                </div>
              </div>
            </div>

            {/* Center: Playback Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={onPrevChapter}
                className="p-2 rounded-xl text-stone-300 hover:text-amber-300 hover:bg-stone-800 transition"
                title="পূর্ববর্তী অধ্যায়"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={onTogglePlay}
                disabled={isLoading}
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 active:scale-95 text-stone-950 font-bold flex items-center justify-center shadow-lg shadow-amber-500/30 transition disabled:opacity-50"
                title={isPlaying ? 'বিরতি দিন' : 'শুনুন'}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={onNextChapter}
                className="p-2 rounded-xl text-stone-300 hover:text-amber-300 hover:bg-stone-800 transition"
                title="পরবর্তী অধ্যায়"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Audio Features (Voice, Speed, Ambient, Continuous) */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Voice Selector button */}
              <div className="relative">
                <button
                  onClick={() => setShowVoiceModal(!showVoiceModal)}
                  className="px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-xs text-amber-300 flex items-center gap-1 transition"
                  title="কণ্ঠস্বর পরিবর্তন করুন"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline font-sans-bn">{currentVoiceObj.name}</span>
                </button>

                {/* Voice Modal popup */}
                {showVoiceModal && (
                  <div className="absolute right-0 bottom-full mb-3 w-64 sm:w-72 p-3 rounded-2xl bg-stone-950/95 border border-amber-900/60 shadow-2xl backdrop-blur-xl z-50 animate-fade-in text-stone-100">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-800 text-xs font-semibold text-amber-300">
                      <span>Gemini TTS কণ্ঠ নির্বাচন</span>
                      <span className="text-[10px] text-stone-400 font-normal">৫টি ভয়েস</span>
                    </div>
                    <div className="space-y-1.5 max-h-60 overflow-y-auto">
                      {VOICE_OPTIONS.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => {
                            onSelectVoice(v.id);
                            setShowVoiceModal(false);
                          }}
                          className={`w-full text-left p-2 rounded-xl text-xs transition flex items-start justify-between gap-2 ${
                            selectedVoice === v.id
                              ? 'bg-amber-500/20 border border-amber-500/40 text-amber-200'
                              : 'hover:bg-stone-800 text-stone-300'
                          }`}
                        >
                          <div>
                            <div className="font-semibold flex items-center gap-1.5">
                              <span>{v.label}</span>
                            </div>
                            <p className="text-[11px] text-stone-400 mt-0.5 line-clamp-1">{v.description}</p>
                          </div>
                          {selectedVoice === v.id && (
                            <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Playback speed toggle */}
              <button
                onClick={() => {
                  const rates = [0.8, 1.0, 1.25];
                  const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
                  onChangePlaybackRate(rates[nextIndex]);
                }}
                className="px-2 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-mono text-stone-300 transition"
                title="পাঠের গতি পরিবর্তন"
              >
                {playbackRate}x
              </button>

              {/* Download Audio Button */}
              <button
                onClick={onDownloadAudio}
                disabled={isDownloading}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-300 transition disabled:opacity-50"
                title="এই অধ্যায়ের অডিও ডাউনলোড করুন (.wav)"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </button>

              {/* Ambient BGM & Volume Settings Toggle */}
              <div className="relative">
                <button
                  onClick={() => setShowAudioSettings(!showAudioSettings)}
                  className={`p-2 rounded-xl transition ${
                    isAmbientPlaying
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                  title="আবহসুর ও সাউন্ড সেটিংস"
                >
                  <Music className="w-4 h-4" />
                </button>

                {showAudioSettings && (
                  <div className="absolute right-0 bottom-full mb-3 w-64 p-3.5 rounded-2xl bg-stone-950/95 border border-amber-900/60 shadow-2xl backdrop-blur-xl z-50 text-xs text-stone-100">
                    <div className="font-semibold text-amber-300 mb-2 pb-1 border-b border-stone-800 flex items-center justify-between">
                      <span>আবহসংগীত সেটিংস</span>
                      <button
                        onClick={onToggleAmbient}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300"
                      >
                        {isAmbientPlaying ? 'অন' : 'অফ'}
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-[11px] text-stone-400 mb-1">
                          <span>আবহ ভলিউম</span>
                          <span>{Math.round(ambientVolume * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={ambientVolume}
                          onChange={(e) => onChangeAmbientVolume(parseFloat(e.target.value))}
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                      </div>

                      <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between">
                        <span className="text-[11px] text-stone-300">একটানা অধ্যায় পাঠ</span>
                        <button
                          onClick={onToggleContinuousPlay}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                            continuousPlay ? 'bg-amber-500' : 'bg-stone-700'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white transition-transform ${
                              continuousPlay ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
