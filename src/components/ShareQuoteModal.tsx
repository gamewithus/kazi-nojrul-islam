import React, { useState } from 'react';
import { X, Copy, Check, Quote, Sparkles } from 'lucide-react';

interface ShareQuoteModalProps {
  quote: string | null;
  onClose: () => void;
}

export const ShareQuoteModal: React.FC<ShareQuoteModalProps> = ({ quote, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!quote) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(quote);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border z-10 bg-stone-900 border-amber-800/40 text-stone-100">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-800">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber-400 font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>অমর সাহিত্যের উদ্ধৃতি</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quote display */}
        <div className="relative my-4 p-5 rounded-2xl bg-amber-950/20 border border-amber-900/30">
          <Quote className="w-8 h-8 text-amber-500/20 absolute -top-3 -left-2" />
          <p className="text-base sm:text-lg font-serif-bn font-medium italic leading-relaxed text-amber-200">
            {quote}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-stone-400 hover:text-stone-200"
          >
            বাতিল
          </button>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition active:scale-95 shadow-md shadow-amber-500/20"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-stone-950" />
                <span>কপি হয়েছে!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>উদ্ধৃতি কপি করুন</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
