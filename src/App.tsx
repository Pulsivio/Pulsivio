import { useState, useEffect } from 'react';
import { KickObsDock } from './components/KickObsDock';
import { KickOverlayWidget } from './components/KickOverlayWidget';
import { ObsStudioMockup } from './components/ObsStudioMockup';
import { KICK_CONFIG } from './config';

export default function App() {
  const [channelParam, setChannelParam] = useState<string>(KICK_CONFIG.DEFAULT_CHANNEL);
  const [isOverlayStatsMode, setIsOverlayStatsMode] = useState<boolean>(false);
  const [isPopoutMode, setIsPopoutMode] = useState<boolean>(false);
  const [isObsMockupOpen, setIsObsMockupOpen] = useState<boolean>(false);
  const [isCompactParam, setIsCompactParam] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const chan = params.get('channel') || KICK_CONFIG.DEFAULT_CHANNEL;
    const isCompact = params.get('compact') === 'true' || params.get('compact') === '1';

    setChannelParam(chan);
    setIsCompactParam(isCompact);

    const isOverlayStats = mode === 'overlay-stats';
    const isPopout = mode === 'popout';
    setIsOverlayStatsMode(isOverlayStats);
    setIsPopoutMode(isPopout);

    if (mode === 'obs-preview') {
      setIsObsMockupOpen(true);
    }

    if (isOverlayStats) {
      document.documentElement.classList.add('obs-transparent');
      document.body.classList.add('obs-transparent');
    } else {
      document.documentElement.classList.remove('obs-transparent');
      document.body.classList.remove('obs-transparent');
    }

    // Blokada narzędzi deweloperskich, inspekcji i skrótów podglądu kodu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDownSecurity = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (DevTools inspect)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // Ctrl+U (Wyświetl źródło strony)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      // Ctrl+S (Zapisz stronę jako HTML)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    window.addEventListener('contextmenu', handleContextMenu, { capture: true });
    window.addEventListener('keydown', handleKeyDownSecurity, { capture: true });

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      window.removeEventListener('keydown', handleKeyDownSecurity, { capture: true });
    };
  }, []);

  // Tryb przezroczystego widgetu na scenę OBS (jeśli ktoś użyje ?mode=overlay-stats)
  if (isOverlayStatsMode) {
    return (
      <div className="w-screen h-screen overflow-hidden obs-transparent flex items-start justify-start p-4">
        <KickOverlayWidget channelSlug={channelParam} />
      </div>
    );
  }

  // Tryb pływającego okna podręcznego (Pop-out na 2. monitor)
  if (isPopoutMode) {
    return (
      <main className="w-screen min-h-screen bg-[#0a0d14] flex flex-col justify-start">
        <div className="bg-[#121620] border-b border-slate-800 px-3 py-1.5 flex items-center justify-between text-xs text-slate-300 select-none">
          <div className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Pływające okno podręczne (Pop-out)</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">kick.com/{channelParam}</span>
        </div>
        <KickObsDock
          defaultChannel={channelParam}
          isCompactMode={true}
        />
      </main>
    );
  }

  // Podgląd panelu wewnątrz programu OBS Studio
  if (isObsMockupOpen) {
    return (
      <main className="w-screen min-h-screen bg-[#14171d] flex flex-col justify-start">
        <ObsStudioMockup
          channelSlug={channelParam}
          onExitMockup={() => setIsObsMockupOpen(false)}
        />
      </main>
    );
  }

  // Domyślny i główny widok: Gotowy panel Kick Live Chat Stat do OBS i przeglądarki
  return (
    <main className="w-screen min-h-screen bg-[#0a0d14] flex flex-col justify-start">
      <KickObsDock
        defaultChannel={channelParam}
        isCompactMode={isCompactParam}
        onOpenObsMockup={() => setIsObsMockupOpen(true)}
      />
    </main>
  );
}
