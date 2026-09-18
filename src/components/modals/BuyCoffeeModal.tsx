import React, { useState } from 'react';
import { X, Coffee, ExternalLink, QrCode, CheckCircle2, Heart } from 'lucide-react';

interface BuyCoffeeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BuyCoffeeModal: React.FC<BuyCoffeeModalProps> = ({ isOpen, onClose }) => {
  const [showQr, setShowQr] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-5 sm:p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white shadow-md">
              <Coffee className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Wesprzyj Pulsivio ☕
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Darmowa aplikacja tworzona z pasji do zdrowia
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij okno wsparcia"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer touch-manipulation"
          >
            <X className="h-5 w-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4">
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm">
            <p className="font-semibold mb-1">
              Dziękujemy, że korzystasz z Pulsivio! ❤️
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-xs">
              Aplikacja jest bezpłatna, bezpieczna dla Twoich danych i wolna od uciążliwych reklam. Jeśli pomaga Ci w codziennym dbaniu o serce, możesz postawić wirtualną kawę twórcy.
            </p>
          </div>

          {/* Quick Payment Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="https://buycoffee.to/pulsivio"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white p-3.5 text-sm font-black shadow-md transition-all active:scale-95 text-center"
            >
              <span>🇵🇱 BLIK (buycoffee.to)</span>
              <ExternalLink className="h-4 w-4 opacity-80" />
            </a>

            <a
              href="https://buymeacoffee.com/pulsivio"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white p-3.5 text-sm font-black shadow-md transition-all active:scale-95 text-center"
            >
              <span>🌍 Karta / Apple Pay</span>
              <ExternalLink className="h-4 w-4 opacity-80" />
            </a>
          </div>

          {/* QR Codes Section */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50 dark:bg-slate-800/60">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <QrCode className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Zeskanuj telefonem, aby zapłacić BLIK-iem
              </span>
              <button
                type="button"
                onClick={() => setShowQr(!showQr)}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                {showQr ? 'Ukryj' : 'Pokaż'}
              </button>
            </div>

            {showQr && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
                <div className="flex flex-col items-center">
                  <div className="h-28 w-28 bg-white p-1.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https%3A%2F%2Fbuycoffee.to%2Fpulsivio"
                      alt="QR BuyCoffee Pulsivio"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-1.5">
                    buycoffee.to/pulsivio
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
