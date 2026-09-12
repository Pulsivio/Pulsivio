import React, { useState } from 'react';
import {
  X,
  Smartphone,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Share2,
  RefreshCw,
  Cloud,
  CheckCircle2,
  KeyRound,
  ArrowRight,
  Info
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Language } from '../types';

interface RunOnPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  syncCode: string;
  onSetSyncCode: (code: string) => void;
  onManualSync: () => Promise<void>;
  isSyncing: boolean;
  lastSyncTime: number;
  measurementsCount: number;
}

export const RunOnPhoneModal: React.FC<RunOnPhoneModalProps> = ({
  isOpen,
  onClose,
  lang,
  syncCode,
  onSetSyncCode,
  onManualSync,
  isSyncing,
  lastSyncTime,
  measurementsCount,
}) => {
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [inputCode, setInputCode] = useState<string>('');
  const [platform, setPlatform] = useState<'android' | 'ios'>('android');
  const [isSuccessMessage, setIsSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://pulsivio.health';
  const syncUrl = `${baseUrl}/?sync=${syncCode}`;

  const handleCopyUrl = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(syncUrl);
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  const handleCopyCode = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(syncCode);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  const handleConnectWithCode = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputCode.trim().toUpperCase();
    if (clean.length < 4) return;
    onSetSyncCode(clean);
    setIsSuccessMessage(`Połączono z kodem: ${clean}! Trwa pobieranie pomiarów...`);
    setInputCode('');
    setTimeout(() => {
      setIsSuccessMessage(null);
      onManualSync();
    }, 1500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Pulsivio - Synchronizacja z telefonem',
          text: `Otwórz mój dziennik ciśnienia Pulsivio (kod synchronizacji: ${syncCode}):`,
          url: syncUrl,
        });
      } catch {
        // Cancelled
      }
    } else {
      handleCopyUrl();
    }
  };

  const formatLastSync = (ts: number) => {
    if (!ts) return 'Jeszcze nie synchronizowano';
    const diffSeconds = Math.round((Date.now() - ts) / 1000);
    if (diffSeconds < 10) return 'Przed chwilą';
    if (diffSeconds < 60) return `${diffSeconds} sek. temu`;
    const diffMinutes = Math.round(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} min temu`;
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 transition-all max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 shadow-inner">
              <Cloud className="h-5 w-5 text-white" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black leading-tight">
                Synchronizacja PC ↔ Telefon
              </h2>
              <p className="text-xs text-sky-100 font-medium">
                Pomiary wpisane na komputerze są od razu na telefonie (i na odwrót)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 space-y-4">
          
          {/* Status banner */}
          <div className="flex items-center justify-between gap-3 bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 truncate">
                  Chmura Pulsivio aktywna
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  Ostatnia synchronizacja: {formatLastSync(lastSyncTime)} • Pomiarów: {measurementsCount}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onManualSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-xs cursor-pointer transition-all disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Odświeżam...' : 'Odśwież'}</span>
            </button>
          </div>

          {isSuccessMessage && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold animate-fade-in flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <span>{isSuccessMessage}</span>
            </div>
          )}

          {/* QR Code & Scan Section */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-sky-50/70 dark:bg-sky-950/30 p-4 rounded-2xl border border-sky-100 dark:border-sky-900/50">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 shrink-0">
              <QRCodeSVG
                value={syncUrl}
                size={135}
                level="M"
                includeMargin={false}
              />
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200 text-xs font-bold">
                <QrCode className="h-3.5 w-3.5" />
                <span>Sposób 1: Zeskanuj aparatem</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Skieruj aparat telefonu na ten kod QR. Kliknij żółty dymek z linkiem – aplikacja otworzy się na telefonie i <strong>automatycznie połączy oba urządzenia</strong>!
              </p>

              {/* Sync Code Box */}
              <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-sky-200 dark:border-sky-800 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block leading-tight">
                    Twój kod synchronizacji:
                  </span>
                  <span className="text-sm font-black font-mono tracking-wider text-sky-700 dark:text-sky-300">
                    {syncCode}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-100 dark:bg-sky-900/60 hover:bg-sky-200 text-sky-800 dark:text-sky-200 text-xs font-bold transition-all cursor-pointer"
                >
                  {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedCode ? 'Skopiowano' : 'Kopiuj'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sposób 2: Manual Code Input */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Sposób 2: Masz kod z drugiego urządzenia?
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Wpisz kod widoczny na Twoim komputerze lub drugim telefonie, aby pobrać i połączyć te same pomiary:
            </p>

            <form onSubmit={handleConnectWithCode} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="np. PUL-8492"
                maxLength={10}
                className="flex-1 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-xs sm:text-sm font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="submit"
                disabled={inputCode.trim().length < 4}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold shadow-xs cursor-pointer transition-all disabled:opacity-50"
              >
                <span>Połącz</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>

          {/* Platform Switcher (Android vs iPhone) for PWA desktop icon */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Jak dodać ikonę na pulpit telefonu:
              </span>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPlatform('android')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    platform === 'android'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  Android
                </button>
                <button
                  type="button"
                  onClick={() => setPlatform('ios')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    platform === 'ios'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  iPhone
                </button>
              </div>
            </div>

            {platform === 'android' ? (
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-[11px] shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      Otwórz link w przeglądarce Chrome
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Kliknij trzy pionowe kropki <strong>(⋮)</strong> w prawym górnym rogu ekranu.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-[11px] shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      Wybierz „Zainstaluj aplikację” lub „Dodaj do ekranu głównego”
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Pojawi się ikona <strong>Pulsivio</strong> bezpośrednio na pulpicie Twojego telefonu.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-[11px] shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      Otwórz link w przeglądarce Safari
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Kliknij ikonę udostępniania na dole ekranu (kwadrat ze strzałką w górę).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-[11px] shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      Wybierz „Do ekranu początkowego”
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Ikona Pulsivio pojawi się obok innych Twoich aplikacji.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 px-5 py-3 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Wyślij link</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-xs transition-all cursor-pointer active:scale-95"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
