import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Gamepad2, ArrowLeft, ShieldAlert } from 'lucide-react';

interface MobileAdManagerProps {
  isPro?: boolean;
}

export const MobileAdManager: React.FC<MobileAdManagerProps> = ({ isPro = false }) => {
  const [hasActiveAd, setHasActiveAd] = useState<boolean>(false);
  const [adSecondsOpen, setAdSecondsOpen] = useState<number>(0);
  const activeAdRef = useRef<HTMLElement | null>(null);

  // Funkcja awaryjnego usuwania i ukrywania pełnoekranowych nakładek reklamowych
  const dismissActiveAd = useCallback(() => {
    try {
      // 1. Przywróć naturalne przewijanie strony
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.position = '';

      // 2. Znajdź i ukryj wszelkie pełnoekranowe kontenery AdSense / winiety / iframes
      const adSelectors = [
        'iframe[id*="google_ads_iframe"]',
        'iframe[id*="aswift"]',
        'div[id*="aswift"]',
        'div[id*="google-rewarded"]',
        'div[class*="google-interstitial"]',
        'ins.adsbygoogle[data-ad-status="filled"][style*="fixed"]',
        'div[style*="z-index: 2147483647"]',
        'div[style*="z-index:2147483647"]',
        'div[style*="position: fixed"][style*="100%"]',
      ];

      adSelectors.forEach((sel) => {
        try {
          const elements = document.querySelectorAll(sel);
          elements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            // Sprawdź czy to faktycznie element reklamy, a nie nasz własny modal
            if (
              htmlEl.id?.includes('mobile-ad-escape') ||
              htmlEl.closest('#mobile-ad-escape-root')
            ) {
              return;
            }
            const rect = htmlEl.getBoundingClientRect();
            // Jeśli element zajmuje ponad 70% ekranu, to jest to pełnoekranowa reklama/gra
            if (rect.width > window.innerWidth * 0.7 && rect.height > window.innerHeight * 0.6) {
              htmlEl.style.setProperty('display', 'none', 'important');
              htmlEl.style.setProperty('opacity', '0', 'important');
              htmlEl.style.setProperty('pointer-events', 'none', 'important');
              htmlEl.style.setProperty('visibility', 'hidden', 'important');
            }
          });
        } catch {
          // Ignoruj błędy pojedynczego selektora
        }
      });

      // 3. Sprawdź czy Google utworzyło backdrop/overlay
      const overlays = document.querySelectorAll('div');
      overlays.forEach((div) => {
        const style = window.getComputedStyle(div);
        if (
          (style.position === 'fixed' || style.position === 'absolute') &&
          parseInt(style.zIndex, 10) > 9999 &&
          !div.closest('#root') &&
          !div.closest('#mobile-ad-escape-root')
        ) {
          const rect = div.getBoundingClientRect();
          if (rect.width >= window.innerWidth * 0.8 && rect.height >= window.innerHeight * 0.8) {
            div.style.setProperty('display', 'none', 'important');
            div.style.setProperty('pointer-events', 'none', 'important');
          }
        }
      });

      setHasActiveAd(false);
      setAdSecondsOpen(0);
      activeAdRef.current = null;
    } catch (err) {
      console.warn('Błąd podczas zamykania reklamy:', err);
      setHasActiveAd(false);
    }
  }, []);

  // Monitoruj obecność pełnoekranowych reklam i iframes w DOM
  useEffect(() => {
    if (isPro) return;

    const checkFullscreenAd = () => {
      try {
        let detected = false;

        // 1. Sprawdź iframes
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach((f) => {
          const id = (f.id || '').toLowerCase();
          const name = (f.name || '').toLowerCase();
          const src = (f.src || '').toLowerCase();

          if (
            id.includes('google') ||
            id.includes('aswift') ||
            name.includes('google') ||
            src.includes('google') ||
            src.includes('doubleclick')
          ) {
            const rect = f.getBoundingClientRect();
            if (rect.width > window.innerWidth * 0.75 && rect.height > window.innerHeight * 0.65) {
              detected = true;
              activeAdRef.current = f;
            }
          }
        });

        // 2. Sprawdź kontenery nakładkowe AdSense
        if (!detected) {
          const overlays = document.querySelectorAll(
            '[class*="google-interstitial"], [id*="google-rewarded"], div[id*="aswift_"][id*="_host"]'
          );
          overlays.forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.width > window.innerWidth * 0.75 && rect.height > window.innerHeight * 0.65) {
              detected = true;
              activeAdRef.current = el as HTMLElement;
            }
          });
        }

        // 3. Sprawdź czy body ma zablokowany scroll przez reklamę
        if (!detected) {
          const bOverflow = document.body.style.overflow;
          if (bOverflow === 'hidden' && !document.querySelector('.fixed.inset-0.z-50')) {
            // Jeśli body ma overflow:hidden ale nie ma otwartego żadnego z naszych modali aplikacji
            const suspicious = document.querySelector('iframe, ins.adsbygoogle');
            if (suspicious) {
              detected = true;
            }
          }
        }

        setHasActiveAd(detected);
      } catch {
        // cichy fallback
      }
    };

    // Szybkie sprawdzanie co 800ms
    const interval = setInterval(checkFullscreenAd, 800);

    // MutationObserver dla natychmiastowego wykrywania wstrzyknięcia reklamy przez AdSense
    const observer = new MutationObserver(() => {
      checkFullscreenAd();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'data-ad-status'],
    });

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, [isPro]);

  // Licznik sekund trwania reklamy (aby po 5 sekundach podświetlić przycisk zamknięcia)
  useEffect(() => {
    let timer: any;
    if (hasActiveAd) {
      timer = setInterval(() => {
        setAdSecondsOpen((s) => s + 1);
      }, 1000);
    } else {
      setAdSecondsOpen(0);
    }
    return () => clearInterval(timer);
  }, [hasActiveAd]);

  // Obsługa komunikatów postMessage od gier i reklam (Playable Ads Redirect & Return)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        if (!event.data) return;

        let parsed = event.data;
        if (typeof event.data === 'string') {
          try {
            parsed = JSON.parse(event.data);
          } catch {
            // zwykły string
          }
        }

        const msgType = (parsed?.type || parsed?.action || parsed?.event || parsed?.msg || '').toString().toLowerCase();

        // 1. Wykrycie ukończenia gry / zamknięcia reklamy przez SDK
        if (
          msgType.includes('close') ||
          msgType.includes('finish') ||
          msgType.includes('dismiss') ||
          msgType.includes('complete') ||
          msgType.includes('gameover') ||
          msgType.includes('game_over')
        ) {
          dismissActiveAd();
        }

        // 2. Wykrycie przekierowania po kliknięciu w reklamę lub grę
        if (parsed?.url && typeof parsed.url === 'string' && parsed.url.startsWith('http')) {
          // Otwórz link docelowy w nowej karcie i zamknij nakładkę, by użytkownik wrócił do Pulsivio
          window.open(parsed.url, '_blank', 'noopener,noreferrer');
          dismissActiveAd();
        }
      } catch (err) {
        // Ignoruj błędy innych postMessage
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [dismissActiveAd]);

  if (isPro || !hasActiveAd) {
    return null;
  }

  return (
    <div id="mobile-ad-escape-root" className="no-print">
      {/* 1. GŁÓWNY, ZAWSZE WIDOCZNY PRZYCISK ZAMKNIĘCIA 'X' (GÓRNY PRAWY RÓG) */}
      {/* Używa env(safe-area-inset-top) aby nigdy nie chować się pod wcięciem aparatu/notchem */}
      <div
        id="mobile-ad-escape-btn-wrapper"
        style={{
          position: 'fixed',
          top: 'max(16px, env(safe-area-inset-top, 16px))',
          right: '16px',
          zIndex: 2147483647,
        }}
        className="animate-in fade-in zoom-in duration-200"
      >
        <button
          type="button"
          onClick={dismissActiveAd}
          id="btn-close-fullscreen-ad"
          className="group flex items-center gap-2 rounded-full bg-slate-950/95 text-white border-2 border-rose-500 shadow-2xl px-3.5 py-2 text-xs font-black tracking-wide hover:bg-rose-600 hover:border-white active:scale-95 transition-all cursor-pointer ring-4 ring-rose-500/30"
          title="Zamknij reklamę i wróć do Pulsivio"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white group-hover:bg-white group-hover:text-rose-600 transition-colors">
            <X className="h-3.5 w-3.5 stroke-[3]" />
          </span>
          <span className="text-white text-xs font-black drop-shadow-sm">
            {adSecondsOpen > 3 ? '✕ Zamknij i wróć' : '✕ Zamknij'}
          </span>
        </button>
      </div>

      {/* 2. DOLNY PASEK RATUNKOWY DLA GIER W REKLAMACH (PLAYABLE ADS) */}
      {/* Zapobiega uwięzieniu użytkownika po zakończeniu gry */}
      <div
        id="mobile-playable-return-bar"
        style={{
          position: 'fixed',
          bottom: 'max(16px, env(safe-area-inset-bottom, 16px))',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2147483647,
          width: 'calc(100% - 32px)',
          maxWidth: '420px',
        }}
        className="animate-in slide-in-from-bottom duration-300"
      >
        <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-950/95 border-2 border-sky-400 text-white shadow-2xl backdrop-blur-md ring-4 ring-sky-500/30">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-sky-500 text-white shrink-0 shadow-sm">
              <Gamepad2 className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-black text-white leading-tight truncate">
                Koniec gry lub reklamy?
              </p>
              <p className="text-[9px] text-slate-300 leading-none">
                Dotknij, aby powrócić do dziennika
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={dismissActiveAd}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-black text-xs shadow-md transition-all shrink-0 cursor-pointer active:scale-95"
          >
            <span>Wróć</span>
            <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};
