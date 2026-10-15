import React from 'react';
import { BookOpen, Sparkles, Volume2, VolumeX, Menu, Palette, TextQuote, Info } from 'lucide-react';
import { ThemeMode } from '../types';

interface NavbarProps {
  currentChapterTitle: string;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  onOpenSidebar: () => void;
  onOpenInfo: () => void;
  isAmbientPlaying: boolean;
  onToggleAmbient: () => void;
  ambientModeName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentChapterTitle,
  theme,
  onThemeChange,
  fontSize,
  onFontSizeChange,
  onOpenSidebar,
  onOpenInfo,
  isAmbientPlaying,
  onToggleAmbient,
  ambientModeName,
}) => {
  const themes: { id: ThemeMode; label: string; iconBg: string }[] = [
    { id: 'nocturne', label: 'রাত্রির মায়া', iconBg: 'bg-amber-900/60 border-amber-600/40 text-amber-200' },
    { id: 'parchment', label: 'পাণ্ডুলিপি', iconBg: 'bg-amber-100 border-amber-300 text-amber-900' },
    { id: 'oled', label: 'কালিমা', iconBg: 'bg-neutral-900 border-neutral-700 text-neutral-200' },
    { id: 'dawn', label: 'ভোরবেলা', iconBg: 'bg-rose-50 border-rose-200 text-rose-950' },
  ];

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md border-b transition-colors duration-300 select-none
      bg-opacity-85 dark:bg-opacity-85
      border-amber-950/20 dark:border-amber-500/10"
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Left: Menu & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            aria-label="সূচিপত্র খুলুন"
            className="p-2 rounded-xl transition hover:bg-amber-500/15 active:scale-95 flex items-center gap-2"
          >
            <Menu className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline text-xs font-medium tracking-wide uppercase text-amber-800 dark:text-amber-300/80">
              সূচিপত্র
            </span>
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-lg md:text-xl font-bold font-serif-bn tracking-tight text-amber-950 dark:text-amber-100">
                মেহের-নেগার
              </span>
              <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 font-medium">
                নজরুল
              </span>
            </div>
            <span className="text-[11px] truncate max-w-[140px] xs:max-w-[200px] sm:max-w-xs text-amber-900/70 dark:text-amber-400/70 font-medium">
              {currentChapterTitle}
            </span>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Ambient BGM Quick Toggle */}
          <button
            onClick={onToggleAmbient}
            title={isAmbientPlaying ? 'আবহসুর বন্ধ করুন' : 'আবহসুর চালু করুন'}
            className={`px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all ${
              isAmbientPlaying
                ? 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                : 'bg-amber-500/5 hover:bg-amber-500/10 text-amber-900/60 dark:text-amber-400/50'
            }`}
          >
            {isAmbientPlaying ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span className="hidden md:inline font-sans-bn">আবহসুর: {ambientModeName}</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span className="hidden md:inline font-sans-bn">আবহসুর</span>
              </>
            )}
          </button>

          {/* Font Size Adjuster */}
          <div className="hidden sm:flex items-center rounded-xl bg-amber-500/10 p-0.5 border border-amber-500/20 text-xs">
            <button
              onClick={() => onFontSizeChange(Math.max(15, fontSize - 1))}
              disabled={fontSize <= 15}
              className="px-2 py-1 rounded-lg hover:bg-amber-500/20 disabled:opacity-30 transition font-bold"
              title="হরফ ছোট করুন"
            >
              অ-
            </button>
            <span className="px-1.5 text-[11px] font-mono text-amber-800 dark:text-amber-300">
              {fontSize}
            </span>
            <button
              onClick={() => onFontSizeChange(Math.min(26, fontSize + 1))}
              disabled={fontSize >= 26}
              className="px-2 py-1 rounded-lg hover:bg-amber-500/20 disabled:opacity-30 transition font-bold"
              title="হরফ বড় করুন"
            >
              অ+
            </button>
          </div>

          {/* Theme Selector Dropdown */}
          <div className="relative group">
            <button
              className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition flex items-center gap-1"
              title="পড়ার আবহ ও থিম নির্বাচন"
            >
              <Palette className="w-4 h-4 text-amber-700 dark:text-amber-300" />
            </button>
            <div className="absolute right-0 mt-2 w-36 py-2 rounded-2xl shadow-2xl border backdrop-blur-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50
              bg-amber-950/90 text-amber-100 border-amber-800/40"
            >
              <div className="text-[10px] uppercase font-bold tracking-wider px-3 pb-1 text-amber-400/70 border-b border-amber-800/30">
                থিম পছন্দ করুন
              </div>
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onThemeChange(t.id)}
                  className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition hover:bg-amber-500/20 ${
                    theme === t.id ? 'text-amber-300 font-semibold bg-amber-500/15' : 'text-amber-200/80'
                  }`}
                >
                  <span>{t.label}</span>
                  {theme === t.id && <Sparkles className="w-3 h-3 text-amber-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Story & Context Info */}
          <button
            onClick={onOpenInfo}
            className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition"
            title="গল্পের পটভূমি ও চরিত্রসমূহ"
          >
            <Info className="w-4 h-4 text-amber-700 dark:text-amber-300" />
          </button>
        </div>
      </div>
    </header>
  );
};
