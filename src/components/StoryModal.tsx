import React, { useState } from 'react';
import { X, BookOpen, Users, Compass, Feather, Heart, Sparkles } from 'lucide-react';
import { CHARACTER_PROFILES, STORY_METADATA } from '../data/storyData';

interface StoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'about' | 'characters' | 'themes'>('about');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl max-h-[85vh] rounded-3xl shadow-2xl border flex flex-col overflow-hidden z-10
        bg-stone-900 border-amber-800/40 text-stone-100"
      >
        {/* Header */}
        <div className="p-5 border-b border-amber-900/30 flex items-center justify-between bg-stone-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Feather className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif-bn text-stone-100">
                মেহের-নেগার ও কাজী নজরুল ইসলাম
              </h2>
              <p className="text-xs text-amber-400/80 font-sans-bn">
                গল্পের প্রেক্ষাপট, চরিত্র ও সাহিত্যিক গুরুত্ব
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-amber-900/20 px-5 bg-stone-950/40 text-xs">
          <button
            onClick={() => setActiveTab('about')}
            className={`py-3 px-3 font-semibold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'about'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>মূল পরিচিতি</span>
          </button>
          <button
            onClick={() => setActiveTab('characters')}
            className={`py-3 px-3 font-semibold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'characters'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>চরিত্র পরিচিতি</span>
          </button>
          <button
            onClick={() => setActiveTab('themes')}
            className={`py-3 px-3 font-semibold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'themes'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>মূল দর্শন ও বার্তা</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 text-sm leading-relaxed text-stone-300 space-y-4 font-sans-bn">
          {activeTab === 'about' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-900/40">
                <h3 className="text-base font-bold font-serif-bn text-amber-200 mb-1">
                  {STORY_METADATA.title} — {STORY_METADATA.subtitle}
                </h3>
                <p className="text-xs text-stone-300">
                  {STORY_METADATA.synopsis}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-stone-100 font-serif-bn mb-1.5">
                  নজরুলের কথাসাহিত্যে প্রাচ্য রোমান্টিকতা:
                </h4>
                <p>
                  ‘মেহের-নেগার’ জাতীয় কবি কাজী নজরুল ইসলামের ছোটগল্প সংকলন ‘শিউলীমালা’ (বা যুগল রোমান্টিক আখ্যান)-এর এক অনন্য সংযোজন। নজরুলের গল্পে শুধু প্রেম থাকে না; থাকে সুর, বিপ্লব, নারীর অপার্থিব সম্মান এবং নির্মম সামাজিক বাস্তবতা। আফগানিস্তানের দুর্গম পাহাড়, ঝিলমের কলতান আর সংগীতের সুরের মায়ায় এ গল্প চিরন্তন হয়ে উঠেছে।
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/60">
                  <span className="text-amber-400 font-semibold block mb-0.5">রচয়িতা</span>
                  <span>{STORY_METADATA.author}</span>
                </div>
                <div className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/60">
                  <span className="text-amber-400 font-semibold block mb-0.5">প্রেক্ষাপট</span>
                  <span>{STORY_METADATA.setting}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'characters' && (
            <div className="space-y-4">
              {CHARACTER_PROFILES.map((c, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-stone-800/70 border border-stone-700/70 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold font-serif-bn text-amber-300">
                      {c.name}
                    </h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium">
                      {c.role}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400">
                    <strong className="text-stone-300">আবাস:</strong> {c.origin}
                  </p>
                  <p className="text-xs text-stone-300 leading-normal">
                    {c.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {c.traits.map((t, tidx) => (
                      <span
                        key={tidx}
                        className="px-2 py-0.5 rounded-lg text-[10px] bg-stone-900 text-stone-400 border border-stone-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'themes' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-stone-800/60 border border-stone-700/60 space-y-2">
                <h3 className="text-sm font-bold text-amber-300 font-serif-bn">
                  ১. প্রেম বনাম আত্মমর্যাদা
                </h3>
                <p className="text-xs text-stone-300">
                  গুলশান ইউসুফকে ভালোবাসলেও তার নিজের সামাজিক অবজ্ঞাত পরিচয় নিয়ে কুণ্ঠিত ছিল। সে চায়নি তার অস্তিত্ব ইউসুফের মর্যাদাকে কলঙ্কিত করুক। প্রেম এখানে আত্মবিসর্জনের মাধ্যমে আত্মমর্যাদাকে বড় করেছে।
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-800/60 border border-stone-700/60 space-y-2">
                <h3 className="text-sm font-bold text-amber-300 font-serif-bn">
                  ২. সুর ও আত্মার নিভৃত মিলন
                </h3>
                <p className="text-xs text-stone-300">
                  ইউসুফের কাছে সংগীত কেবল সুর নয়, আত্মিক সন্ধান। মেহের-নেগার তার সুরের দেবী—যা বাস্তব জগতের সীমা ছাড়িয়ে পরকালের অনন্তলোকে পৌঁছে যায়।
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-800/60 border border-stone-700/60 space-y-2">
                <h3 className="text-sm font-bold text-amber-300 font-serif-bn">
                  ৩. ভালোবাসার সত্যিকারের মৃত্যু কোথায়?
                </h3>
                <p className="text-xs text-stone-300">
                  গল্পের চূড়ান্ত বার্তা—ভালোবাসার মৃত্যু শারীরিক বিচ্ছেদে ঘটে না; ঘটে প্রিয়জনের স্মৃতি হৃদয় থেকে মুছে গেলে। যতদিন স্মৃতি অমর, ভালোবাসা চিরন্তন।
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-amber-900/30 bg-stone-950/80 text-center">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition"
          >
            পাঠ শুরু করুন
          </button>
        </div>
      </div>
    </div>
  );
};
