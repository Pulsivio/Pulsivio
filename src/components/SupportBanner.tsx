import React, { useState } from 'react';
import { Coffee, ExternalLink, QrCode, X } from 'lucide-react';

export const SupportBanner: React.FC = () => {
  const [showQr, setShowQr] = useState(false);
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('pulsivio_support_banner_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem('pulsivio_support_banner_dismissed', 'true');
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="rounded-2xl border border-emerald-300/80 dark:border-emerald-800/70 bg-gradient-to-br from-emerald-50/70 via-teal-50/30 to-amber-50/30 p-3.5 dark:from-slate-900 dark:via-slate-850 dark:to-emerald-950/30 space-y-3 shadow-xs mt-6 relative">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5 flex-1 min-w-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-600 text-white shadow-xs shrink-0 mt-0.5">
            <Coffee className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
                Podoba Ci się Pulsivio? Wesprzyj projekt ☕
              </h3>
              <span className="rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-1.5 py-0.5">
                PL + Świat
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug mt-0.5">
              Wspieraj rozwój darmowej aplikacji dla serca. Płatność BLIK lub karta.
            </p>
          </div>
        </div>

        {/* Dismiss button with large touch target */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Ukryj powiadomienie o wsparciu"
          className="min-w-[44px] min-h-[44px] -mr-2 -mt-2 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-xl transition-colors cursor-pointer touch-manipulation"
          title="Ukryj to okno"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
        <a
          href="https://buycoffee.to/pulsivio"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3 py-2 text-xs font-black shadow-xs cursor-pointer transition-all active:scale-95 text-center"
          title="Wpłata przez BLIK (Polska)"
        >
          <span>🇵🇱 BLIK (buycoffee.to)</span>
          <ExternalLink className="h-3 w-3 opacity-80" />
        </a>

        <a
          href="https://buymeacoffee.com/pulsivio"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white px-3 py-2 text-xs font-black shadow-xs cursor-pointer transition-all active:scale-95 text-center"
          title="Wpłata kartą / Apple Pay / Zagranica"
        >
          <span>🌍 Karta / Apple Pay</span>
          <ExternalLink className="h-3 w-3 opacity-80" />
        </a>

        <button
          type="button"
          onClick={() => setShowQr(!showQr)}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-100/70 hover:bg-emerald-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-emerald-800 dark:text-emerald-300 px-3 py-2 text-xs font-bold shadow-2xs transition-all cursor-pointer text-center"
          title="Pokaż kody QR do zeskanowania telefonem"
        >
          <QrCode className="h-3.5 w-3.5" />
          <span>{showQr ? 'Ukryj QR' : 'Kody QR (BLIK)'}</span>
        </button>
      </div>

      {showQr && (
        <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800">
            <div className="h-16 w-16 shrink-0 bg-white p-1 rounded-lg border border-slate-200 flex items-center justify-center">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https%3A%2F%2Fbuycoffee.to%2Fpulsivio"
                alt="QR BuyCoffee Pulsivio"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Zeskanuj telefonem (BLIK)
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                buycoffee.to/pulsivio
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800">
            <div className="h-16 w-16 shrink-0 bg-white p-1 rounded-lg border border-slate-200 flex items-center justify-center">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https%3A%2F%2Fbuymeacoffee.com%2Fpulsivio"
                alt="QR BuyMeACoffee Pulsivio"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                BuyMeACoffee (Karta)
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                buymeacoffee.com/pulsivio
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
