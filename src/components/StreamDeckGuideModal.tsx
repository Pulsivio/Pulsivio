import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Copy, 
  Check, 
  Tv, 
  Layers, 
  CheckCircle2,
  X,
  Keyboard,
  ExternalLink
} from 'lucide-react';

interface StreamDeckGuideModalProps {
  channelSlug: string;
  onClose: () => void;
}

export function StreamDeckGuideModal({ channelSlug, onClose }: StreamDeckGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'hotkey' | 'slide' | 'browser'>('hotkey');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const overlayUrl = `${origin}${path}?channel=${encodeURIComponent(channelSlug)}&mode=overlay-stats`;
  const dockUrl = `${origin}${path}?channel=${encodeURIComponent(channelSlug)}`;

  // Obsługa klawisza Escape do natychmiastowego zamknięcia
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  return (
    <div 
      onClick={(e) => {
        // Kliknięcie w ciemne tło (backdrop) zamyka okno
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150 select-none overflow-y-auto"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#162030] border border-[#53fc18]/60 rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-[0_0_40px_rgba(83,252,24,0.15)] text-slate-100 text-xs overflow-hidden box-border"
      >
        
        {/* Nagłówek (zawsze widoczny na górze) */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-700 bg-[#1c283c] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#53fc18]/25 border border-[#53fc18]/60 flex items-center justify-center text-[#53fc18] shrink-0">
              <Sliders className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-xs sm:text-sm text-white truncate flex items-center gap-1.5">
                <span>Sterowanie Stream Deck & OBS</span>
              </h3>
              <p className="text-[11px] text-slate-300 truncate">
                Skróty fizyczne, animacje wyjeżdżania i gotowe linki do skopiowania
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij okno"
            className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white border border-slate-600 transition shrink-0 flex items-center gap-1 font-semibold text-[11px] cursor-pointer"
            title="Zamknij okno (Esc)"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Zamknij</span>
          </button>
        </div>

        {/* Zakładki nawigacyjne */}
        <div className="p-2 border-b border-slate-700 bg-[#131b29] shrink-0">
          <div className="flex gap-1 bg-[#0e1522] p-1 rounded-xl border border-slate-700 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveTab('hotkey')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1 transition truncate cursor-pointer ${
                activeTab === 'hotkey' 
                  ? 'bg-[#53fc18] text-slate-950 shadow-md' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">1. Skróty Stream Deck</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('slide')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1 transition truncate cursor-pointer ${
                activeTab === 'slide' 
                  ? 'bg-[#53fc18] text-slate-950 shadow-md' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">2. Animacja wyjeżdżania</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('browser')}
              className={`flex-1 py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1 transition truncate cursor-pointer ${
                activeTab === 'browser' 
                  ? 'bg-[#53fc18] text-slate-950 shadow-md' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              <Tv className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">3. Link Doku OBS</span>
            </button>
          </div>
        </div>

        {/* Treść z własnym przewijaniem (nie ucieka poza ekran) */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-3.5 flex-1 min-h-0">
          
          {/* Zakładka 1: Skróty klawiszowe dla Stream Decka */}
          {activeTab === 'hotkey' && (
            <div className="space-y-3">
              <div className="bg-[#1c283c] border border-slate-600 p-3 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-[#53fc18] font-bold text-xs">
                  <Keyboard className="w-4 h-4 shrink-0" />
                  <span>Jak przypisać przyciski na Stream Decku (2 proste kroki):</span>
                </div>
                
                <ol className="list-decimal list-inside space-y-1.5 text-slate-200 text-[11px] leading-relaxed">
                  <li>W aplikacji <strong>Elgato Stream Deck</strong> po prawej stronie znajdź kategorię <strong>System</strong> i przeciągnij <strong>Hotkey (Klawisz skrótu)</strong> na wolny przycisk.</li>
                  <li>Kliknij w pole skrótu i wciśnij jedną z poniższych kombinacji:</li>
                </ol>
              </div>

              {/* Tabela skrótów z przyciskami do szybkiego kopiowania / podglądu */}
              <div className="space-y-2">
                {/* Alt + R - Reset */}
                <div className="bg-[#1c283c] border border-rose-500/60 p-3 rounded-xl space-y-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <kbd className="px-2.5 py-1 bg-rose-900 text-white border border-rose-400 rounded font-mono font-bold text-xs shadow-sm">
                        Alt + R
                      </kbd>
                      <strong className="text-white text-xs font-bold">Reset statystyk sesji</strong>
                    </div>
                    <span className="text-[10.5px] text-rose-200 font-bold bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/50">
                      Główna akcja
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Otwiera okno potwierdzenia w OBS. Wciśnięcie klawisza <strong>Enter</strong> natychmiast zatwierdza reset.
                  </p>
                </div>

                {/* Alt + G - Zerowanie celu */}
                <div className="bg-[#1c283c] border border-cyan-500/60 p-3 rounded-xl space-y-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <kbd className="px-2.5 py-1 bg-cyan-950 text-white border border-cyan-400 rounded font-mono font-bold text-xs shadow-sm">
                        Alt + G
                      </kbd>
                      <strong className="text-white text-xs font-bold">Zerowanie samego celu wiadomości</strong>
                    </div>
                    <span className="text-[10.5px] text-cyan-200 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/50">
                      Pasek celu
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Zeruje pasek celu bez ruszania łącznej liczby wiadomości, słów czy rankingu widzów.
                  </p>
                </div>

                {/* Alt + T - Test */}
                <div className="bg-[#1c283c] border border-amber-500/60 p-3 rounded-xl space-y-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <kbd className="px-2.5 py-1 bg-amber-900 text-white border border-amber-400 rounded font-mono font-bold text-xs shadow-sm">
                        Alt + T
                      </kbd>
                      <strong className="text-white text-xs font-bold">Włącz / Wyłącz symulację czatu (Test)</strong>
                    </div>
                    <span className="text-[10.5px] text-amber-200 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/50">
                      Przed streamem
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Pozwala przetestować animację i zliczanie wiadomości bez konieczności pisania na czacie.
                  </p>
                </div>

                {/* Alt + L - Status Live */}
                <div className="bg-[#1c283c] border border-emerald-500/60 p-3 rounded-xl space-y-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <kbd className="px-2.5 py-1 bg-emerald-900 text-white border border-emerald-400 rounded font-mono font-bold text-xs shadow-sm">
                        Alt + L
                      </kbd>
                      <strong className="text-white text-xs font-bold">Odśwież status LIVE</strong>
                    </div>
                    <span className="text-[10.5px] text-emerald-200 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/50">
                      Kick API
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Sprawdza czy stream jest Online/Offline i aktualizuje liczbę widzów.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Zakładka 2: Efekt wyjeżdżania (OBS Slide) */}
          {activeTab === 'slide' && (
            <div className="space-y-3 bg-[#1c283c] border border-slate-600 p-3 rounded-xl">
              <div className="flex items-center gap-2 text-[#53fc18] font-bold text-xs">
                <Layers className="w-4 h-4 shrink-0" />
                <span>Jak ustawić wyjeżdżanie widgetu na streamie przyciskiem?</span>
              </div>

              <p className="text-slate-200 leading-relaxed text-[11px]">
                W OBS Studio możesz ustawić animację <strong>„Przesunięcie” (Slide)</strong> dla źródła przeglądarki, 
                a na Stream Decku przypisać przycisk <strong>OBS Studio ➔ Toggle Source Visibility</strong>.
              </p>

              {/* Box z gotowym linkiem i przyciskiem kopiuj obok */}
              <div className="bg-[#0e1522] border border-slate-600 p-3 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-200">
                  <span className="font-bold text-[#53fc18]">Link przezroczystej nakładki na stream:</span>
                  <span className="text-slate-300 font-semibold">360 x 320 px</span>
                </div>

                <div className="flex items-center gap-2 bg-[#0a0e17] p-2 rounded-lg border border-slate-600">
                  <input
                    readOnly
                    type="text"
                    value={overlayUrl}
                    className="w-full bg-transparent text-[#53fc18] font-mono text-[11px] focus:outline-none truncate selection:bg-[#53fc18] selection:text-black cursor-text"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(overlayUrl, 'overlay')}
                    className="px-3.5 py-1.5 bg-[#53fc18] hover:bg-[#53fc18]/90 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1 shrink-0 transition shadow-md active:scale-95 cursor-pointer"
                    title="Kopiuj link do schowka"
                  >
                    {copiedLink === 'overlay' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-slate-950" />
                        <span>Skopiowano!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-950" />
                        <span>Kopiuj</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-[11px] text-slate-200">
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#53fc18] text-slate-950 font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                  <div>
                    W OBS dodaj <strong>Źródło przeglądarki</strong>, wklej powyższy link i ustaw np. szerokość <strong>360</strong>, wysokość <strong>320</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#53fc18] text-slate-950 font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                  <div>
                    Kliknij prawym przyciskiem myszy na to źródło w OBS ➔ <strong>Przejście przy pokazywaniu</strong> ➔ wybierz <strong>Przesunięcie (Slide)</strong> lub <strong>Przenikanie</strong> (np. 300 ms).
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#53fc18] text-slate-950 font-black flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                  <div>
                    W aplikacji Stream Deck: przeciągnij <strong>OBS Studio ➔ Źródło (Source)</strong>, wybierz scenę i to źródło, a tryb ustaw na <strong>Przełącz (Toggle)</strong>.
                  </div>
                </div>
              </div>

              <div className="bg-[#53fc18]/15 border border-[#53fc18]/40 p-2.5 rounded-lg text-emerald-200 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#53fc18]" />
                <span>Guzik na Stream Decku wysuwa licznik na ekran i chowa go ponownym kliknięciem.</span>
              </div>
            </div>
          )}

          {/* Zakładka 3: Link Doku OBS */}
          {activeTab === 'browser' && (
            <div className="space-y-3 bg-[#1c283c] border border-slate-600 p-3 rounded-xl">
              <div className="flex items-center gap-2 text-[#53fc18] font-bold text-xs">
                <Tv className="w-4 h-4 shrink-0" />
                <span>Stały panel doku w OBS Studio (Dla Ciebie)</span>
              </div>

              <p className="text-slate-200 leading-relaxed text-[11px]">
                Link do wklejenia w menu <strong>Doki ➔ Własne doki przeglądarki...</strong> w Twoim OBS Studio:
              </p>

              {/* Box z gotowym linkiem i przyciskiem kopiuj obok */}
              <div className="bg-[#0e1522] border border-slate-600 p-3 rounded-xl space-y-2">
                <span className="font-bold text-[#53fc18] text-[11px] block">Twój link Doku OBS:</span>

                <div className="flex items-center gap-2 bg-[#0a0e17] p-2 rounded-lg border border-slate-600">
                  <input
                    readOnly
                    type="text"
                    value={dockUrl}
                    className="w-full bg-transparent text-[#53fc18] font-mono text-[11px] focus:outline-none truncate selection:bg-[#53fc18] selection:text-black cursor-text"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(dockUrl, 'dock')}
                    className="px-3.5 py-1.5 bg-[#53fc18] hover:bg-[#53fc18]/90 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1 shrink-0 transition shadow-md active:scale-95 cursor-pointer"
                    title="Kopiuj link doku OBS"
                  >
                    {copiedLink === 'dock' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-slate-950" />
                        <span>Skopiowano!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-950" />
                        <span>Kopiuj</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <ol className="list-decimal list-inside space-y-1.5 text-slate-200 text-[11px]">
                <li>W OBS kliknij: <strong>Doki ➔ Własne doki przeglądarki...</strong></li>
                <li>Wpisz nazwę: <code className="text-[#53fc18] font-bold font-mono">Stats Chat Kick</code></li>
                <li>Wklej skopiowany wyżej link i kliknij <strong>Zastosuj</strong>.</li>
                <li>Panel pojawi się w OBS — możesz go zadokować w dowolnym miejscu!</li>
              </ol>
            </div>
          )}

        </div>

        {/* Stopka modala z dużym, wygodnym przyciskiem ZAMKNIJ (zawsze widocznym) */}
        <div className="flex items-center justify-between p-3 border-t border-slate-700 bg-[#1c283c] text-[11px] shrink-0">
          <span className="text-slate-300 text-[11px]">
            Naciśnij <kbd className="px-1.5 py-0.5 bg-slate-700 border border-slate-500 rounded text-white font-mono text-[10px]">Esc</kbd> lub kliknij obok
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg text-xs transition border border-slate-600 flex items-center gap-1.5 active:scale-95 shadow cursor-pointer"
          >
            <X className="w-3.5 h-3.5 text-slate-300" />
            <span>Zamknij</span>
          </button>
        </div>

      </div>
    </div>
  );
}
