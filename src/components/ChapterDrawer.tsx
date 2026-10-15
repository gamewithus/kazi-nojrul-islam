import React from 'react';
import { X, Play, Volume2, Sparkles, Music, Wind, Waves, ShieldAlert, HeartHandshake } from 'lucide-react';
import { Chapter } from '../types';

interface ChapterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  chapters: Chapter[];
  currentChapterId: string;
  onSelectChapter: (chapterId: string) => void;
  playingChapterId: string | null;
  isPlaying: boolean;
  onPlayChapter: (chapter: Chapter) => void;
}

export const ChapterDrawer: React.FC<ChapterDrawerProps> = ({
  isOpen,
  onClose,
  chapters,
  currentChapterId,
  onSelectChapter,
  playingChapterId,
  isPlaying,
  onPlayChapter,
}) => {
  if (!isOpen) return null;

  const toBengaliNumeral = (num: number): string => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num
      .toString()
      .split('')
      .map((d) => bengaliDigits[parseInt(d, 10)] ?? d)
      .join('');
  };

  const getAmbientIcon = (type: string) => {
    switch (type) {
      case 'flute':
        return <Music className="w-3.5 h-3.5 text-amber-400" />;
      case 'wind':
        return <Wind className="w-3.5 h-3.5 text-sky-400" />;
      case 'river':
        return <Waves className="w-3.5 h-3.5 text-cyan-400" />;
      case 'war':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <HeartHandshake className="w-3.5 h-3.5 text-amber-300" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-sm sm:max-w-md h-full shadow-2xl flex flex-col z-10 overflow-hidden
        bg-stone-900 border-r border-amber-900/40 text-stone-100"
      >
        {/* Header */}
        <div className="p-5 border-b border-amber-900/40 flex items-center justify-between bg-stone-950/60">
          <div>
            <div className="text-xs uppercase tracking-widest text-amber-400 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> সূচিপত্র ও অধ্যায়সমূহ
            </div>
            <h2 className="text-xl font-bold font-serif-bn text-stone-100 mt-0.5">
              মেহের-নেগার (কাহিনিক্রম)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Story progress / quick stats */}
        <div className="px-5 py-3 bg-amber-950/20 border-b border-amber-900/20 flex items-center justify-between text-xs text-amber-300/80">
          <span>মোট ১০টি অংশ ও অধ্যায়</span>
          <span>কাজী নজরুল ইসলাম রচিত</span>
        </div>

        {/* Chapter List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {chapters.map((ch, idx) => {
            const isCurrent = currentChapterId === ch.id;
            const isPlayingThis = playingChapterId === ch.id && isPlaying;

            return (
              <div
                key={ch.id}
                onClick={() => {
                  onSelectChapter(ch.id);
                  onClose();
                }}
                className={`group relative p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isCurrent
                    ? 'bg-amber-950/40 border-amber-500/50 shadow-lg shadow-amber-950/30'
                    : 'bg-stone-900/80 hover:bg-stone-800/80 border-stone-800/70 hover:border-amber-800/40'
                }`}
              >
                {/* Number & Info */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 font-serif-bn ${
                      isCurrent
                        ? 'bg-amber-500 text-stone-950'
                        : 'bg-stone-800 text-amber-300/80 group-hover:bg-amber-900/50'
                    }`}
                  >
                    {idx === 0 ? 'সূ' : idx === chapters.length - 1 ? 'উপ' : toBengaliNumeral(idx)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3
                      className={`text-sm font-semibold truncate font-serif-bn ${
                        isCurrent ? 'text-amber-300' : 'text-stone-200 group-hover:text-amber-100'
                      }`}
                    >
                      {ch.title}
                    </h3>
                    <p className="text-xs text-stone-400 truncate mt-0.5 font-sans-bn">
                      {ch.subtitle}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-stone-500">
                      <span className="flex items-center gap-1">
                        {getAmbientIcon(ch.ambientSound)}
                        <span className="capitalize">{ch.ambientSound}</span>
                      </span>
                      <span>•</span>
                      <span className="truncate">{ch.emotionalTone}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Play Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayChapter(ch);
                  }}
                  title={isPlayingThis ? 'বিরতি দিন' : 'এই অধ্যায় শুনুন'}
                  className={`p-2.5 rounded-xl transition shrink-0 ${
                    isPlayingThis
                      ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                      : 'bg-stone-800 group-hover:bg-amber-600/20 text-amber-300 hover:text-amber-200'
                  }`}
                >
                  {isPlayingThis ? (
                    <Volume2 className="w-4 h-4 animate-bounce" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-amber-900/30 bg-stone-950/80 text-center text-xs text-stone-400">
          <p className="font-serif-bn">Gemini 3.8 Flash TTS হাইপার-রিয়্যালিস্টিক কণ্ঠস্বর চালিত</p>
        </div>
      </div>
    </div>
  );
};
