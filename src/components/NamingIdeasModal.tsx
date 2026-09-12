import React from 'react';
import { Sparkles, X, Check, Heart, ShieldCheck, Star } from 'lucide-react';
import { Language } from '../types';
import { namingSuggestions, translations } from '../i18n';

interface NamingIdeasModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const NamingIdeasModal: React.FC<NamingIdeasModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const t = translations[lang] || translations.pl;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 sm:p-4">
      <div className="flex h-full max-h-[580px] w-full max-w-lg flex-col rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 py-3.5 dark:border-slate-800 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {t.namingModalTitle}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {t.namingModalDesc}
          </p>

          <div className="space-y-2.5">
            {namingSuggestions.map((item, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border p-3.5 transition-all ${
                  item.selected
                    ? 'border-rose-400 bg-rose-50/60 dark:border-rose-700 dark:bg-rose-950/40 shadow-xs ring-2 ring-rose-300 dark:ring-rose-800'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {item.name}
                    </span>
                    {item.selected && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        <Check className="h-3 w-3" />
                        Aktywna nazwa
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400">
                    #{idx + 1}
                  </span>
                </div>

                <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.desc}
                </p>

                <div className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Zaleta:</span>
                  <span>{item.advantage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50/50 p-3 text-right dark:border-slate-800 dark:bg-slate-800/30">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600"
          >
            Zamknij
          </button>
        </div>

      </div>
    </div>
  );
};
