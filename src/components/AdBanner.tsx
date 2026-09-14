import React, { useEffect } from 'react';

interface AdBannerProps {
  slot?: string; // Slot ID z panelu AdSense (opcjonalny dla Auto Ads)
  format?: 'auto' | 'horizontal' | 'rectangle';
  className?: string;
  clientId?: string; // np. ca-pub-XXXXXXXXXXXXXXXX
  isPro?: boolean; // Jeśli true, wszystkie reklamy AdSense są natychmiast wyłączone
}

export const AdBanner: React.FC<AdBannerProps> = ({
  slot = '',
  format = 'auto',
  className = '',
  clientId = 'ca-pub-5529697511853714',
  isPro = false,
}) => {
  useEffect(() => {
    if (isPro) return;
    // Bezpieczne ładowanie AdSense bez błędów w konsoli jeśli adblock lub brak skryptu
    try {
      if (typeof window !== 'undefined') {
        const w = window as any;
        w.adsbygoogle = w.adsbygoogle || [];
        w.adsbygoogle.push({});
      }
    } catch (e) {
      // Ignoruj błędy zablokowanych reklam / adblocka
    }
  }, [isPro]);

  // Użytkownicy PRO mają całkowicie wyłączone reklamy
  if (isPro) {
    return null;
  }

  // W środowisku deweloperskim lub gdy brak slotu/klienta, renderujemy elegancki, subtelny placeholder
  // który nie psuje wyglądu aplikacji
  const isAdConfigured = Boolean(clientId && slot);

  return (
    <div
      className={`print:hidden my-3 w-full overflow-hidden transition-all ${className}`}
      id="adsense-container"
    >
      <div className="mx-auto max-w-4xl rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 p-2 text-center text-[10px] text-slate-400 dark:text-slate-500">
        <div className="flex items-center justify-between px-2 pb-1 mb-1 border-b border-slate-200/40 dark:border-slate-800/40">
          <span className="font-semibold uppercase tracking-wider text-[9px] text-slate-400">Reklama / Sponsor</span>
          <a
            href="https://buycoffee.to/pulsivio"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] text-rose-500 dark:text-rose-400 hover:underline"
          >
            Usuń reklamy / Wesprzyj projekt
          </a>
        </div>

        {isAdConfigured ? (
          <ins
            className="adsbygoogle"
            style={{ display: 'block', textAlign: 'center' }}
            data-ad-layout="in-article"
            data-ad-format={format}
            data-ad-client={clientId}
            data-ad-slot={slot}
          />
        ) : (
          <div className="py-2.5 px-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-500 dark:text-slate-400">
            <div className="text-left text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">Pulsivio jest darmowe dzięki reklamom i wsparciu społeczności.</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Nieinwazyjna przestrzeń na jednostkę reklamową Google AdSense.</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="https://buycoffee.to/pulsivio"
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors"
              >
                ☕ Postaw kawę (BLIK)
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
