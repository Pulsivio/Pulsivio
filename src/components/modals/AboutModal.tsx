import React from 'react';
import { X, Heart, ShieldCheck, Award, BookOpen } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#0b142f] border border-sky-800/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 fill-white" />
            <span className="font-bold">O Pulsivio • Dziennik Ciśnienia</span>
          </div>
          <button onClick={onClose} className="p-1 text-white/80 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed max-h-[80vh] overflow-y-auto">
          <div className="bg-[#0f1b3d] p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xl shrink-0">
              P
            </div>
            <div>
              <h4 className="font-extrabold text-white text-base">Pulsivio v2.4</h4>
              <p className="text-xs text-slate-400">
                Polska aplikacja do domowej kontroli ciśnienia tętniczego i pulsu zgodna ze standardami PTNT.
              </p>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-white mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Zgodność z Polskim Towarzystwem Nadciśnienia Tętniczego:
            </h5>
            <p className="text-xs text-slate-400">
              Aplikacja stosuje wytyczne PTNT dotyczące pomiarów domowych (HBPM). Granica prawidłowego ciśnienia w domu wynosi <strong>&lt; 135/85 mmHg</strong> (w odróżnieniu od 140/90 mmHg w gabinecie lekarskim).
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-[#0e1836] p-2.5 rounded-lg border border-slate-800">
              <span className="font-bold text-emerald-400 block mb-0.5">Optymalne:</span>
              <span>&lt; 120 / &lt; 80 mmHg</span>
            </div>
            <div className="bg-[#0e1836] p-2.5 rounded-lg border border-slate-800">
              <span className="font-bold text-emerald-300 block mb-0.5">Prawidłowe:</span>
              <span>120–129 / 80–84 mmHg</span>
            </div>
            <div className="bg-[#0e1836] p-2.5 rounded-lg border border-slate-800">
              <span className="font-bold text-yellow-300 block mb-0.5">Wysokie prawidłowe:</span>
              <span>130–139 / 85–89 mmHg</span>
            </div>
            <div className="bg-[#0e1836] p-2.5 rounded-lg border border-slate-800">
              <span className="font-bold text-red-400 block mb-0.5">Nadciśnienie st. 1:</span>
              <span>≥ 140 lub ≥ 90 mmHg</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Pulsivio © 2026 • Wszystkie dane zapisywane lokalnie</span>
            <button
              onClick={onClose}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
            >
              Zamknij
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
