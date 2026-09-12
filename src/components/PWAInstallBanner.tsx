import React, { useState } from 'react';
import { Smartphone, Download, X, Share2, MoreVertical, Sparkles, CheckCircle2, ArrowDown, HelpCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Language } from '../types';

interface PWAInstallBannerProps {
  lang: Language;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ lang }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>(isIOS ? 'ios' : 'android');

  // If already running as an installed PWA on the phone home screen, don't show the install banner
  if (isInstalled || isDismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (!installed) {
        setShowInstructionsModal(true);
      }
    } else {
      setShowInstructionsModal(true);
    }
  };

  return (
    <>
      {/* Top Banner on Mobile & Desktop */}
      <aside aria-label="Instalacja aplikacji" className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 text-white px-3 sm:px-4 py-2 sm:py-2.5 shadow-md flex items-center justify-between gap-2 border-b border-sky-400/30">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-white/20 shadow-inner">
            <Smartphone className="h-4 w-4 text-white animate-pulse" />
          </span>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold truncate">
              {lang === 'pl'
                ? '📲 Zainstaluj Pulsivio jako ikonę na telefonie'
                : '📲 Install Pulsivio on your home screen'}
            </p>
            <p className="text-[11px] text-sky-100 hidden sm:block truncate">
              {lang === 'pl'
                ? 'Działa jak pełna aplikacja ze sklepu, otwiera się na pełnym ekranie i aktualizuje automatycznie!'
                : 'Runs full screen like a store app with automatic background updates!'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white text-blue-700 hover:bg-sky-50 px-3 py-1.5 text-xs font-black shadow-xs transition-all cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{lang === 'pl' ? 'Zainstaluj aplikację' : 'Install App'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            aria-label={lang === 'pl' ? 'Zamknij powiadomienie' : 'Dismiss notice'}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Guided Instruction Modal for Android & iOS */}
      {showInstructionsModal && (
        <div
          onClick={() => setShowInstructionsModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in cursor-pointer"
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 shadow-inner">
                  <Download className="h-5 w-5 text-white" />
                </span>
                <div>
                  <h3 className="text-base font-black leading-tight">
                    {lang === 'pl' ? 'Instrukcja: Dodaj ikonę Pulsivio' : 'How to install Pulsivio on Phone'}
                  </h3>
                  <p className="text-xs text-sky-100 font-medium">
                    {lang === 'pl' ? 'Wskazówka krok po kroku' : 'Step-by-step guidance'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowInstructionsModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                title={lang === 'pl' ? 'Zamknij okno' : 'Close'}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto p-5 space-y-4">
              {/* Informational banner explaining that this modal is just a tip */}
              <div className="p-3 bg-sky-50 dark:bg-sky-950/50 rounded-2xl border border-sky-200 dark:border-sky-800/60 flex items-center gap-2.5 text-xs text-sky-900 dark:text-sky-200">
                <Sparkles className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
                <span>
                  {lang === 'pl'
                    ? 'To okno to tylko instrukcja. Twoja aplikacja Pulsivio działa tuż pod spodem!'
                    : 'This is a quick guide. Your Pulsivio app is active right beneath!'}
                </span>
              </div>
              {/* Native Prompt Trigger Button (if Chrome supports it) */}
              {isInstallable && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    <p className="text-xs text-emerald-900 dark:text-emerald-200 font-bold">
                      {lang === 'pl'
                        ? 'Twoja przeglądarka obsługuje bezpośrednią instalację jednym kliknięciem!'
                        : 'Your browser supports 1-click direct installation!'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      await install();
                      setShowInstructionsModal(false);
                    }}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
                  >
                    {lang === 'pl' ? 'Zainstaluj teraz' : 'Install now'}
                  </button>
                </div>
              )}

              {/* OS Tabs */}
              <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('android')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'android'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  Telefon Android (Chrome)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ios')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'ios'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  iPhone / iPad (Safari)
                </button>
              </div>

              {/* Steps for Android */}
              {activeTab === 'android' && (
                <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-white font-black text-xs shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        W przeglądarce Chrome kliknij trzy pionowe kropki (⋮)
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                        Znajdziesz je w prawym górnym rogu ekranu telefonu.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-white font-black text-xs shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        Wybierz z menu: <span className="text-sky-600 dark:text-sky-400">„Zainstaluj aplikację”</span> lub <span className="text-sky-600 dark:text-sky-400">„Dodaj do ekranu głównego”</span>
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                        Pojawi się okienko z pytaniem czy dodać <strong>Pulsivio</strong> – kliknij <strong>Zainstaluj</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white font-black text-xs shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <p className="font-bold text-emerald-700 dark:text-emerald-400">
                        Gotowe! Ikona Pulsivio pojawi się na pulpicie telefonu
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                        Od teraz uruchamiasz ją klikając w tę ikonę na pulpicie – działa na pełnym ekranie jak każda inna aplikacja.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Steps for iOS */}
              {activeTab === 'ios' && (
                <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white font-black text-xs shrink-0 mt-0.5">
                      1
                    </span>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        Otwórz ten link w przeglądarce Safari na iPhone
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                        Na dole ekranu dotknij ikony <strong>Udostępnij</strong> (niebieski kwadracik ze strzałką w górę).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white font-black text-xs shrink-0 mt-0.5">
                      2
                    </span>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        Przewiń w dół i kliknij: <span className="text-blue-600 dark:text-blue-400">„Do ekranu początkowego”</span>
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                        (Angielska nazwa to <em>Add to Home Screen</em>).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white font-black text-xs shrink-0 mt-0.5">
                      3
                    </span>
                    <div>
                      <p className="font-bold text-emerald-700 dark:text-emerald-400">
                        Kliknij „Dodaj” w prawym górnym rogu
                      </p>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                        Na Twoim iPhone pojawi się kafelka z logo Pulsivio. Otwiera się bez pasków Safari!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Crucial reassurance about updates */}
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-3.5 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <div className="flex items-center gap-1.5 font-black text-amber-800 dark:text-amber-300">
                  <Sparkles className="h-4 w-4" />
                  <span>Ważne: Czy musisz instalować przy każdej poprawce?</span>
                </div>
                <p className="leading-relaxed">
                  <strong>NIE! Instalujesz tylko jeden raz.</strong> Za każdym razem, gdy zmienimy cokolwiek w kodzie, Twoja aplikacja na telefonie <strong>zaktualizuje się w 100% automatycznie</strong> przy kolejnym otwarciu. Wszystkie Twoje zapisane pomiary zostaną bezpiecznie w telefonie.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {lang === 'pl' ? 'Pulsivio jest gotowe do użycia' : 'Pulsivio is ready'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowInstructionsModal(false);
                  setIsDismissed(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{lang === 'pl' ? 'Rozumiem, zamknij i przejdź do Pulsivio' : 'Got it, open Pulsivio'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
