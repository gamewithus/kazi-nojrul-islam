import React from 'react';
import {
  Volume2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Music,
  Quote,
  Heart,
  Share2,
  BookmarkCheck,
  Download,
  Loader2,
} from 'lucide-react';
import { Chapter, ThemeMode } from '../types';

interface StoryReaderProps {
  chapter: Chapter;
  theme: ThemeMode;
  fontSize: number;
  isPlaying: boolean;
  isDownloading?: boolean;
  activeProgress: number;
  onPlayChapter: () => void;
  onDownloadChapter?: () => void;
  onPrevChapter: () => void;
  onNextChapter: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  onOpenAmbientForCue: (cueType: string) => void;
  onShareQuote: (quote: string) => void;
}

export const StoryReader: React.FC<StoryReaderProps> = ({
  chapter,
  theme,
  fontSize,
  isPlaying,
  isDownloading = false,
  activeProgress,
  onPlayChapter,
  onDownloadChapter,
  onPrevChapter,
  onNextChapter,
  hasPrev,
  hasNext,
  onOpenAmbientForCue,
  onShareQuote,
}) => {
  // Theme-specific styling classes
  const themeContainerClasses: Record<ThemeMode, string> = {
    nocturne: 'bg-[#151210] text-[#E8DCCF]',
    parchment: 'bg-[#F9F4EB] text-[#2C241E]',
    oled: 'bg-[#000000] text-[#E4E4E7]',
    dawn: 'bg-[#FFF9F6] text-[#342426]',
  };

  const themeBorderClasses: Record<ThemeMode, string> = {
    nocturne: 'border-[#3D2C20]',
    parchment: 'border-[#E2D5C4]',
    oled: 'border-[#27272A]',
    dawn: 'border-[#F1DEDC]',
  };

  const themeAccentClasses: Record<ThemeMode, string> = {
    nocturne: 'text-[#F59E0B]',
    parchment: 'text-[#92400E]',
    oled: 'text-[#FBBF24]',
    dawn: 'text-[#BE185D]',
  };

  // Estimate active paragraph index based on progress percentage
  const activeParagraphIndex = isPlaying
    ? Math.min(
        chapter.paragraphs.length - 1,
        Math.floor((activeProgress / 100) * chapter.paragraphs.length)
      )
    : -1;

  return (
    <article
      className={`min-h-screen transition-colors duration-300 py-10 px-4 sm:px-6 md:px-8 pb-36 ${themeContainerClasses[theme]}`}
    >
      <div className="max-w-3xl mx-auto">
        {/* Top Header Card */}
        <header className="text-center mb-10 pt-4 pb-8 border-b border-dashed transition-colors duration-300 border-amber-500/20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-wide uppercase mb-3 bg-amber-500/15 text-amber-700 dark:text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>কাজী নজরুল ইসলাম • মেহের-নেগার</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-serif-bn tracking-tight mt-2 mb-3 leading-snug">
            {chapter.title}
          </h1>

          <p className="text-sm sm:text-base font-sans-bn opacity-80 max-w-xl mx-auto font-light">
            {chapter.subtitle}
          </p>

          {/* Quick Play & Info bar */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onPlayChapter}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-xs sm:text-sm shadow-md transition hover:scale-105 active:scale-95 bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isPlaying ? 'অধ্যায় শুনছেন (Gemini TTS)' : 'এই অধ্যায় শুনুন'}</span>
            </button>

            {onDownloadChapter && (
              <button
                onClick={onDownloadChapter}
                disabled={isDownloading}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full font-medium text-xs sm:text-sm border border-amber-500/40 hover:bg-amber-500/15 transition active:scale-95 text-amber-800 dark:text-amber-200 disabled:opacity-50"
                title="এই অধ্যায়ের অডিও ডাউনলোড করুন (.wav)"
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                ) : (
                  <Download className="w-4 h-4 text-amber-500" />
                )}
                <span>অডিও ডাউনলোড</span>
              </button>
            )}
          </div>
        </header>

        {/* Stage Direction Cue (if present) */}
        {chapter.stageCue && (
          <div className="my-8 p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 bg-amber-500/10 border-amber-500/30">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-serif-bn italic text-amber-800 dark:text-amber-300">
              <Music className="w-4 h-4 shrink-0 text-amber-500 animate-pulse" />
              <span>{chapter.stageCue}</span>
            </div>
            <button
              onClick={() => onOpenAmbientForCue(chapter.ambientSound)}
              className="px-3 py-1 rounded-xl text-xs font-medium transition bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-200 shrink-0"
              title="এই সুর শুনুন"
            >
              সুর শুনুন
            </button>
          </div>
        )}

        {/* Story Paragraphs */}
        <div
          className="space-y-6 sm:space-y-7 font-sans-bn font-normal leading-relaxed text-justify transition-all"
          style={{ fontSize: `${fontSize}px`, lineHeight: 1.85 }}
        >
          {chapter.paragraphs.map((p, pIdx) => {
            const isHighlighted = activeParagraphIndex === pIdx;
            const isFirst = pIdx === 0 && chapter.id === 'intro';

            return (
              <div
                key={pIdx}
                className={`relative p-3 rounded-2xl transition-all duration-300 ${
                  isHighlighted
                    ? 'bg-amber-500/15 border-l-4 border-amber-500 pl-4 shadow-sm'
                    : 'hover:bg-amber-500/5'
                }`}
              >
                <p>
                  {isFirst ? (
                    <>
                      <span className="float-left text-4xl sm:text-5xl font-serif-bn font-bold mr-2 leading-none text-amber-600 dark:text-amber-400">
                        {p.charAt(0)}
                      </span>
                      {p.slice(1)}
                    </>
                  ) : (
                    p
                  )}
                </p>
              </div>
            );
          })}
        </div>

        {/* Special Chapter 8 Epitaph Card (Grave Message) */}
        {chapter.id === 'ch8' && (
          <div className="my-10 p-6 sm:p-8 rounded-3xl border-2 text-center relative overflow-hidden shadow-2xl bg-stone-900 text-stone-100 border-amber-600/40">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-80" />
            <div className="text-[11px] uppercase tracking-widest text-amber-400 font-semibold mb-2">
              সমাধিফলকের অন্তিম বাণী
            </div>
            <p className="text-lg sm:text-xl md:text-2xl font-serif-bn font-bold leading-relaxed text-amber-200 max-w-xl mx-auto my-3 italic">
              “পথিক, আমাকে ঘৃণা কোরো না। অপেক্ষা কোরো সেই পরকালের মিলনের জন্য, যেখানে হয়তো আমাদের আবার দেখা হবে।”
            </p>
            <div className="text-xs text-stone-400 font-sans-bn mt-3">
              — মেহের-নেগার (গুলশান)-এর অন্তিম আকুতি
            </div>
            <button
              onClick={() =>
                onShareQuote(
                  '“পথিক, আমাকে ঘৃণা কোরো না। অপেক্ষা কোরো সেই পরকালের মিলনের জন্য, যেখানে হয়তো আমাদের আবার দেখা হবে।” — মেহের-নেগার, কাজী নজরুল ইসলাম'
                )
              }
              className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>উদ্ধৃতি কপি করুন</span>
            </button>
          </div>
        )}

        {/* Pull Quote Card (if any and not Ch 8) */}
        {chapter.keyQuote && chapter.id !== 'ch8' && (
          <div className="my-10 p-6 rounded-2xl border transition-all duration-300 relative bg-amber-500/5 border-amber-500/20">
            <Quote className="w-8 h-8 text-amber-500/30 absolute -top-4 -left-2" />
            <blockquote className="text-base sm:text-lg font-serif-bn font-semibold italic text-amber-800 dark:text-amber-200 leading-snug pl-4">
              “{chapter.keyQuote}”
            </blockquote>
            <div className="mt-3 pl-4 flex items-center justify-between text-xs text-amber-700/70 dark:text-amber-400/70">
              <span>মূল ভাবার্থ</span>
              <button
                onClick={() => onShareQuote(`“${chapter.keyQuote}” — মেহের-নেগার, কাজী নজরুল ইসলাম`)}
                className="hover:text-amber-500 flex items-center gap-1 transition"
                title="উদ্ধৃতি কপি করুন"
              >
                <Share2 className="w-3 h-3" />
                <span>কপি</span>
              </button>
            </div>
          </div>
        )}

        {/* Bottom Chapter Navigation */}
        <nav className="mt-14 pt-8 border-t border-amber-500/20 flex items-center justify-between gap-4">
          <button
            onClick={onPrevChapter}
            disabled={!hasPrev}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-medium transition disabled:opacity-30 disabled:pointer-events-none bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>পূর্ববর্তী অধ্যায়</span>
          </button>

          <span className="text-xs text-stone-400 font-mono">
            {chapter.number === 0 ? 'সূচনা' : chapter.number === 9 ? 'সমাপ্তি' : `অধ্যায় ${chapter.number}`}
          </span>

          <button
            onClick={onNextChapter}
            disabled={!hasNext}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-medium transition disabled:opacity-30 disabled:pointer-events-none bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300"
          >
            <span>পরবর্তী অধ্যায়</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      </div>
    </article>
  );
};
