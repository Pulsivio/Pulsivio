import { useState, useEffect, FormEvent, useMemo, useRef } from 'react';
import { KickStatsSnapshot, kickChatService } from '../services/kickChatService';
import { KICK_CONFIG, validateLicense, LicenseValidationResult, generateStreamerKey, MASTER_WHITELIST_KEYS } from '../config';
import { StreamDeckGuideModal } from './StreamDeckGuideModal';
import { ResetConfirmModal } from './ResetConfirmModal';
import { LicenseGeneratorModal } from './LicenseGeneratorModal';
import { 
  RotateCcw, 
  Check, 
  Copy, 
  Zap, 
  Trophy, 
  Smile, 
  Clock, 
  ExternalLink, 
  Target, 
  FileText, 
  Sliders, 
  Play, 
  Pause, 
  MessageSquare, 
  Link2,
  AtSign,
  ShieldAlert,
  Key,
  Eye,
  EyeOff,
  Edit2
} from 'lucide-react';

function safeLocalGet(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch (e) {}
  return null;
}

function safeLocalSet(key: string, val: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, val);
    }
  } catch (e) {}
}

interface KickObsDockProps {
  defaultChannel?: string;
  isCompactMode?: boolean;
  hideObsPreviewToggle?: boolean;
  onOpenObsMockup?: () => void;
}

function formatDuration(seconds: number): string {
  const safeSec = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(safeSec / 3600);
  const m = Math.floor((safeSec % 3600) / 60);
  const s = safeSec % 60;
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function KickObsDock({
  defaultChannel = KICK_CONFIG.DEFAULT_CHANNEL,
}: KickObsDockProps) {
  // 1. Obsługa aktywnego kanału (z URL, zapamiętanego lub domyślny)
  const [activeChannel, setActiveChannel] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const chan = params.get('channel');
      if (chan && chan.trim()) return chan.trim().toLowerCase().replace(/^@/, '');
      const savedChan = safeLocalGet('CS_ACTIVE_CHANNEL');
      if (savedChan && savedChan.trim()) return savedChan.trim().toLowerCase().replace(/^@/, '');
    }
    return (defaultChannel || 'pisicelarp').trim().toLowerCase().replace(/^@/, '');
  });

  // 2. Obsługa klucza licencyjnego z URL lub zapamiętanego w localStorage
  const [licenseKeyInput, setLicenseKeyInput] = useState<string>('');
  const [activeKey, setActiveKey] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const k = params.get('key');
      if (k && k.trim()) return k.trim();
      // Jeśli link podaje konkretny kanał, ale brak klucza -> wygeneruj klucz streamera (brak uprawnień Master!)
      const chan = params.get('channel');
      if (chan && chan.trim()) {
        return generateStreamerKey(chan);
      }
      const saved = safeLocalGet('CS_ACTIVE_KEY');
      if (saved && saved.trim()) return saved.trim();
    }
    return 'MASTER-GODSHAKER';
  });

  // Weryfikacja licencji
  const licenseResult: LicenseValidationResult = useMemo(() => {
    return validateLicense(activeKey, activeChannel);
  }, [activeKey, activeChannel]);

  const initialSnap = kickChatService.getSnapshot();
  const [stats, setStats] = useState<KickStatsSnapshot>(initialSnap);

  const [channelInput, setChannelInput] = useState<string>(activeChannel);
  const [isEditingChannel, setIsEditingChannel] = useState<boolean>(false);

  // Goal State
  const [isGoalEnabled, setIsGoalEnabled] = useState<boolean>(() => {
    const saved = safeLocalGet('CS_GOAL_ENABLED');
    return saved !== null ? saved === 'true' : true;
  });
  const [goalInput, setGoalInput] = useState<string>(String(initialSnap.messageGoal || 0));
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);

  // Toasty i modale
  const [copiedOverlay, setCopiedOverlay] = useState<boolean>(false);
  const [copiedPopoutLink, setCopiedPopoutLink] = useState<boolean>(false);
  const [showStreamDeckModal, setShowStreamDeckModal] = useState<boolean>(false);
  const [showLicenseGenModal, setShowLicenseGenModal] = useState<boolean>(false);
  const [showPopoutBlockedModal, setShowPopoutBlockedModal] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [resetSuccessToast, setResetSuccessToast] = useState<boolean>(false);
  const [goalResetToast, setGoalResetToast] = useState<boolean>(false);
  const [testModeActive, setTestModeActive] = useState<boolean>(false);

  // Bezpieczna i trwała zmiana kanału
  const changeChannel = (newNick: string) => {
    const clean = newNick.trim().toLowerCase().replace(/^@/, '');
    if (!clean) return;

    setActiveChannel(clean);
    setChannelInput(clean);

    let newKey = activeKey;
    if (!MASTER_WHITELIST_KEYS.has(activeKey.toUpperCase())) {
      newKey = generateStreamerKey(clean);
      setActiveKey(newKey);
    }

    safeLocalSet('CS_ACTIVE_CHANNEL', clean);
    safeLocalSet('CS_ACTIVE_KEY', newKey);

    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('channel', clean);
        url.searchParams.set('key', newKey);
        window.history.replaceState({}, '', url.toString());
      } catch (e) {}
    }

    kickChatService.connectChannel(clean, false);
    setIsEditingChannel(false);
  };

  // Połączenie z czatem - reaguje wyłącznie na realną zmianę activeChannel
  useEffect(() => {
    if (!licenseResult.isValid) return;

    const unsubscribe = kickChatService.subscribe((newStats) => {
      setStats(newStats);
      setTestModeActive(!!newStats.isTestMode);
    });

    kickChatService.connectChannel(activeChannel, false);

    return () => {
      unsubscribe();
    };
  }, [licenseResult.isValid, activeChannel]);

  useEffect(() => {
    if (typeof stats.messageGoal === 'number' && !isEditingGoal) {
      setGoalInput(String(stats.messageGoal));
    }
  }, [stats.messageGoal, isEditingGoal]);

  const handleConfirmReset = () => {
    kickChatService.resetCounters();
    setShowResetConfirm(false);
    setResetSuccessToast(true);
    setTimeout(() => setResetSuccessToast(false), 2500);
  };

  const handleResetGoal = () => {
    kickChatService.resetGoalProgress();
    setGoalResetToast(true);
    setTimeout(() => setGoalResetToast(false), 2500);
  };

  const handleSaveGoal = (e: FormEvent) => {
    e.preventDefault();
    const cleanDigits = goalInput.trim().replace(/\D/g, '');
    const parsed = cleanDigits ? parseInt(cleanDigits, 10) : 0;
    if (!isNaN(parsed) && parsed >= 0) {
      kickChatService.setMessageGoal(parsed);
      setIsEditingGoal(false);
    }
  };

  const handleToggleGoalEnabled = () => {
    const next = !isGoalEnabled;
    setIsGoalEnabled(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('CS_GOAL_ENABLED', String(next));
    }
  };

  const handleSwitchChannel = (e: FormEvent) => {
    e.preventDefault();
    changeChannel(channelInput);
  };

  const handleToggleTest = () => {
    const active = kickChatService.toggleTestSimulation();
    setTestModeActive(active);
  };

  // Skróty klawiszowe (Alt+R, Alt+G, Alt+T)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if ((e.altKey && (e.key === 'r' || e.key === 'R')) || (e.ctrlKey && e.shiftKey && (e.key === 'r' || e.key === 'R'))) {
        e.preventDefault();
        if (e.shiftKey) {
          handleConfirmReset();
        } else {
          setShowResetConfirm(true);
        }
      }

      if ((e.altKey && (e.key === 'g' || e.key === 'G')) || (e.ctrlKey && e.shiftKey && (e.key === 'g' || e.key === 'G'))) {
        e.preventDefault();
        handleResetGoal();
      }

      if (e.altKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        handleToggleTest();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Obliczenia celu
  const currentGoal = stats.messageGoal ?? 0;
  const goalCount = stats.goalMessagesCount || 0;
  const progressPercent = currentGoal > 0 ? Math.min(100, Math.round((goalCount / currentGoal) * 100)) : 0;
  const isGoalReached = currentGoal > 0 && goalCount >= currentGoal;
  const remainingMessages = Math.max(0, currentGoal - goalCount);

  // Linki (Z konwersją ais-dev- do publicznego ais-pre- dla pełnej kompatybilności z OBS)
  const rawOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const origin = rawOrigin.includes('ais-dev-') ? rawOrigin.replace('ais-dev-', 'ais-pre-') : rawOrigin;
  const path = typeof window !== 'undefined' ? window.location.pathname : '';

  // Dla linku streamera wygeneruj bezpieczny klucz streamera (bez uprawnień Master!)
  const streamerKey = licenseResult.isMaster ? generateStreamerKey(stats.channelSlug) : activeKey;
  const keyParamQuery = streamerKey ? `&key=${encodeURIComponent(streamerKey)}` : '';

  // Dedykowany link panelu do OBS (Własny Dok Przeglądarki lub Źródło Przeglądarki - ładuje pełny panel streamera bez Mastera!)
  const obsMainUrl = `${origin}${path}?channel=${encodeURIComponent(stats.channelSlug)}${keyParamQuery}`;
  const overlayUrl = `${origin}${path}?channel=${encodeURIComponent(stats.channelSlug)}${keyParamQuery}&mode=overlay-stats`;
  const popoutObsUrl = `${origin}${path}?channel=${encodeURIComponent(stats.channelSlug)}${keyParamQuery}&mode=popout`;

  const handleCopyObsLink = () => {
    navigator.clipboard.writeText(obsMainUrl);
    setCopiedOverlay(true);
    setTimeout(() => setCopiedOverlay(false), 2500);
  };

  const handleOpenFloatingWindow = () => {
    try {
      const w = 380;
      const h = 580;
      const left = window.screen.width ? (window.screen.width - w) / 2 : 100;
      const top = window.screen.height ? (window.screen.height - h) / 2 : 100;
      const newWin = window.open(
        popoutObsUrl,
        `KickStats_${stats.channelSlug}`,
        `width=${w},height=${h},top=${top},left=${left},scrollbars=yes,resizable=yes,status=no,toolbar=no,menubar=no`
      );
      if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
        setShowPopoutBlockedModal(true);
      }
    } catch (e) {
      setShowPopoutBlockedModal(true);
    }
  };

  const handleActivateKey = (e: FormEvent) => {
    e.preventDefault();
    const clean = licenseKeyInput.trim().toUpperCase();
    if (clean) {
      setActiveKey(clean);
      const match = clean.match(/^(?:KP|CS)-([A-Za-z0-9_]+)-([A-Fa-f0-9]{6})$/);
      let targetChan = activeChannel;
      if (match) {
        targetChan = match[1].toLowerCase();
        setActiveChannel(targetChan);
        setChannelInput(targetChan);
        kickChatService.connectChannel(targetChan, false);
      }
      safeLocalSet('CS_ACTIVE_KEY', clean);
      if (match) {
        safeLocalSet('CS_ACTIVE_CHANNEL', targetChan);
      }
      if (typeof window !== 'undefined') {
        try {
          const url = new URL(window.location.href);
          url.searchParams.set('key', clean);
          url.searchParams.set('channel', targetChan);
          window.history.replaceState({}, '', url.toString());
        } catch (e) {}
      }
    }
  };

  // Badge rankingu dla Top 5 czatujących
  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return {
          badge: 'bg-amber-400/25 text-amber-300 font-extrabold border border-amber-400/60',
          wrapper: 'bg-amber-950/20 border-amber-500/30 text-amber-200',
        };
      case 1:
        return {
          badge: 'bg-slate-300/25 text-slate-200 font-bold border border-slate-300/50',
          wrapper: 'bg-slate-900/30 border-slate-700/60 text-slate-200',
        };
      case 2:
        return {
          badge: 'bg-amber-700/30 text-amber-300 font-bold border border-amber-600/50',
          wrapper: 'bg-amber-950/15 border-amber-700/30 text-amber-300',
        };
      default:
        return {
          badge: 'bg-slate-800 text-slate-400 border border-slate-700',
          wrapper: 'bg-slate-950/30 border-slate-800 text-slate-300',
        };
    }
  };

  // -------------------------------------------------------------
  // EKRAN BLOKADY LICENCJI (Brak lub nieprawidłowy klucz)
  // -------------------------------------------------------------
  if (!licenseResult.isValid) {
    return (
      <div className="w-full min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col items-center justify-center p-3 sm:p-4 select-none">
        <div className="bg-[#121620] border border-slate-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Key className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
              KickStats Pro Live
            </h1>
            <p className="text-xs text-amber-300/90 font-medium mt-1">
              Wymagana aktywna licencja
            </p>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Dostęp do panelu statystyk czatu na żywo wymaga autoryzowanego klucza licencyjnego.
            </p>
          </div>

          {licenseResult.errorReason && (
            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-[11px] text-left flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{licenseResult.errorReason}</span>
            </div>
          )}

          <form onSubmit={handleActivateKey} className="space-y-2 pt-1 text-left">
            <label className="text-[10.5px] font-semibold text-slate-300 block">
              Wprowadź klucz licencyjny:
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={licenseKeyInput}
                onChange={(e) => setLicenseKeyInput(e.target.value)}
                placeholder="np. PROJEKT-TEST-123"
                className="flex-1 bg-black/60 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono focus:outline-none focus:border-cyan-500 transition"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold text-xs rounded-xl shadow transition active:scale-95 cursor-pointer"
              >
                Aktywuj
              </button>
            </div>
          </form>

          <div className="pt-2 border-t border-slate-800/80 text-[10.5px] text-slate-400 leading-normal space-y-1">
            <div>
              Skontaktuj się z autorem (<strong className="text-slate-200">GodShaker</strong>) w celu wygenerowania licencji dla Twojego kanału.
            </div>
            <button
              type="button"
              onClick={() => {
                setLicenseKeyInput('MASTER-GODSHAKER');
              }}
              className="text-[10px] text-cyan-400/90 hover:text-cyan-300 hover:underline transition block mx-auto pt-1"
            >
              Jesteś twórcą (GodShaker)? Wstaw klucz Master
            </button>
          </div>

          <div className="text-[9.5px] text-slate-400 font-mono">
            ChatStream Analytics Live • by GodShaker
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // GŁÓWNY PANEL WIDGETU (AUTORYZOWANY)
  // -------------------------------------------------------------
  return (
    <div className="w-full min-h-screen bg-[#0a0d14] text-slate-100 p-2 sm:p-3 select-none font-sans text-xs box-border overflow-x-hidden flex justify-center">
      <div className="w-full max-w-[560px] flex flex-col gap-2.5">
      
      {/* Toast powiadomienie o resecie sesji */}
      {resetSuccessToast && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 bg-rose-950/95 border border-rose-500 text-rose-100 px-3 py-1.5 rounded-lg shadow-xl text-xs font-bold flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2">
          <RotateCcw className="w-3.5 h-3.5 text-rose-300" />
          <span>Statystyki sesji zostały wyzerowane!</span>
        </div>
      )}

      {/* Toast powiadomienie o resecie celu */}
      {goalResetToast && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 bg-cyan-950/95 border border-cyan-500 text-cyan-100 px-3 py-1.5 rounded-lg shadow-xl text-xs font-bold flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2">
          <Target className="w-3.5 h-3.5 text-cyan-300" />
          <span>Pasek celu został wyzerowany!</span>
        </div>
      )}

      {/* 1. NAGŁÓWEK DOKU: NAZWA, STATUS WEBSOCKET, KICK NICK (@), LIVE I PRZEJRZYSTY PASEK NARZĘDZI */}
      <header className="bg-[#121620] border border-slate-800/80 rounded-xl p-3 shadow-sm space-y-2.5">
        {/* Wiersz 1: Nazwa, status WebSocket, przycisk Klucze (Master) oraz Live/Offline + Czas */}
        <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          {/* Nazwa widgetu, wskaźnik WebSocket i Klucze (Master) */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-black text-sm text-white tracking-tight shrink-0">
              KickStats Pro Live
            </span>
            
            {/* Minimalistyczny wskaźnik statusu WebSocket */}
            {stats.connectionState === 'connected' ? (
              <span 
                className="inline-flex items-center gap-1.5 text-[9.5px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full shrink-0" 
                title="WebSocket: Połączono z czatem Kick w czasie rzeczywistym"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
                <span>Connected</span>
              </span>
            ) : stats.connectionState === 'connecting' || stats.connectionState === 'reconnecting' ? (
              <span 
                className="inline-flex items-center gap-1.5 text-[9.5px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded-full shrink-0" 
                title="WebSocket: Łączenie z serwerem czatu Kick..."
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span>Łączenie</span>
              </span>
            ) : (
              <span 
                className="inline-flex items-center gap-1.5 text-[9.5px] font-semibold text-rose-400 bg-rose-950/60 border border-rose-500/40 px-2 py-0.5 rounded-full shrink-0" 
                title="WebSocket: Błąd połączenia z czatem Kick"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>Offline WS</span>
              </span>
            )}

            {/* Klucz przeniesiony na górny pasek - nie koliduje z nickiem ani pigułkami */}
            {licenseResult.isMaster && (
              <button
                type="button"
                onClick={() => setShowLicenseGenModal(true)}
                className="text-[10px] bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded-md font-bold transition flex items-center gap-1 cursor-pointer active:scale-95 shadow-sm"
                title="Generator kluczy i podgląd kanałów (Master)"
              >
                <Key className="w-3 h-3 text-cyan-400 shrink-0" />
                <span>Klucze</span>
              </button>
            )}
          </div>

          {/* Status LIVE i czas sesji */}
          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            {stats.isTestMode ? (
              <button
                type="button"
                onClick={handleToggleTest}
                title="Tryb Testu: Pełna symulacja czatu na żywo (offline). Kliknij, aby zatrzymać."
                className="text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/60 px-2 py-0.5 rounded-full flex items-center gap-1.5 transition active:scale-95 shadow-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>Test Live</span>
              </button>
            ) : stats.isStreamLive ? (
              <button
                type="button"
                onClick={() => kickChatService.checkChannelLiveStatus()}
                title="Status: ONLINE (Na żywo). Kliknij, aby odświeżyć."
                className="text-[10px] font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-500/60 px-2 py-0.5 rounded-full flex items-center gap-1.5 transition active:scale-95 shadow-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => kickChatService.checkChannelLiveStatus()}
                title="Status: OFFLINE. Kliknij, aby sprawdzić czy stream wystartował."
                className="text-[10px] font-bold bg-rose-950/70 text-rose-300 border border-rose-500/60 px-2 py-0.5 rounded-full flex items-center gap-1.5 transition active:scale-95 shadow-sm"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                <span>Offline</span>
              </button>
            )}

            <span className="text-[10.5px] text-slate-200 bg-slate-900 border border-slate-700/80 px-2 py-0.5 rounded-md font-mono flex items-center gap-1.5 font-bold shadow-inner">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>{formatDuration(stats.sessionDurationSeconds)}</span>
            </span>
          </div>
        </div>

        {/* Wiersz 2: Kanał streamera z dużą ikoną Kicka - pełny nick streamera, 100% czytelności bez nachodzenia */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/70">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Zielona ikonka Kick w ramce */}
            <div 
              className="w-7 h-7 rounded-lg bg-[#53fc18]/15 border border-[#53fc18]/40 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(83,252,24,0.25)]"
              title="Kanał Kick"
            >
              <svg 
                className="w-4 h-4 text-[#53fc18]" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M4 3h5v6h2V3h5v8h-3v2h3v8h-5v-6h-2v6H4V3z" />
              </svg>
            </div>

            {isEditingChannel ? (
              <form onSubmit={handleSwitchChannel} className="flex gap-1.5 items-center flex-1">
                <input
                  type="text"
                  value={channelInput}
                  onChange={(e) => setChannelInput(e.target.value)}
                  placeholder="nick streamera"
                  className="bg-black/90 border border-cyan-400 rounded px-2.5 py-1 text-xs text-white font-bold focus:outline-none w-36"
                  autoFocus
                />
                <button type="submit" className="text-[11px] bg-cyan-600 hover:bg-cyan-500 px-2.5 py-1 rounded text-white font-bold transition">
                  Zmień
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setChannelInput(activeChannel);
                    setIsEditingChannel(false);
                  }}
                  className="text-[11px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-300"
                >
                  ✕
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                {/* Cały nick streamera z @ w jaskrawym odcieniu Kicka */}
                <span 
                  onClick={() => setIsEditingChannel(true)}
                  className="font-black text-base text-[#53fc18] tracking-tight hover:underline cursor-pointer transition select-text drop-shadow-[0_0_8px_rgba(83,252,24,0.3)] truncate"
                  title="Kliknij, aby zmienić kanał Kick"
                >
                  @{activeChannel}
                </span>

                <button
                  type="button"
                  onClick={() => setIsEditingChannel(true)}
                  className="text-slate-400 hover:text-cyan-300 transition p-1 hover:bg-slate-800 rounded"
                  title="Zmień kanał Kick"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                {licenseResult.isMaster && (
                  <span className="text-[9.5px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.5 rounded font-black tracking-wider uppercase">
                    Master
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Wiersz 3: Dedykowany, uporządkowany pasek 4 pigułek - nic nie nachodzi, nic nie wychodzi poza ekran */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {/* Link OBS */}
          <button
            id="btn-copy-widget"
            type="button"
            onClick={handleCopyObsLink}
            className="py-1 px-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center justify-center gap-1 font-semibold text-[10.5px] active:scale-95 shadow-sm"
            title="Kopiuj link panelu do OBS (Własny dok przeglądarki lub Źródło przeglądarki)"
          >
            {copiedOverlay ? <Check className="w-3 h-3 text-emerald-400 shrink-0" /> : <Copy className="w-3 h-3 text-slate-400 shrink-0" />}
            <span className="truncate">{copiedOverlay ? 'OK' : 'OBS'}</span>
          </button>

          {/* Stream Deck Guide */}
          <button
            id="btn-streamdeck"
            type="button"
            onClick={() => setShowStreamDeckModal(true)}
            className="py-1 px-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 transition flex items-center justify-center gap-1 font-semibold text-[10.5px] active:scale-95 shadow-sm"
            title="Instrukcja konfiguracji Stream Decka i skrótów klawiszowych"
          >
            <Sliders className="w-3 h-3 text-cyan-400 shrink-0" />
            <span className="truncate">Deck</span>
          </button>

          {/* Test offline */}
          <button
            id="btn-test-mode"
            type="button"
            onClick={handleToggleTest}
            className={`py-1 px-1.5 rounded-lg border transition flex items-center justify-center gap-1 font-semibold text-[10.5px] active:scale-95 shadow-sm ${
              testModeActive 
                ? 'bg-amber-950/90 text-amber-300 border-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.25)]' 
                : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Pełna symulacja czatu na żywo w trybie offline (Alt+T)"
          >
            {testModeActive ? <Pause className="w-3 h-3 text-amber-400 shrink-0" /> : <Play className="w-3 h-3 text-slate-400 shrink-0" />}
            <span className="truncate">{testModeActive ? 'Stop' : 'Test'}</span>
          </button>

          {/* Pop-out */}
          <button
            id="btn-floating-window"
            type="button"
            onClick={handleOpenFloatingWindow}
            className="py-1 px-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center justify-center gap-1 font-semibold text-[10.5px] active:scale-95 shadow-sm"
            title="Otwórz w osobnym oknie na drugim monitorze"
          >
            <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">Pop-out</span>
          </button>
        </div>
      </header>

      {/* 2. GŁÓWNA STATYSTYKA: ŁĄCZNA ILOŚĆ WIADOMOŚCI + ZINTEGROWANE TOP 5 NA CZACIE */}
      <section className="bg-[#121620] border border-slate-800/80 rounded-xl p-2.5 shadow-sm space-y-2">
        {/* Górna część: Wszystkie wiadomości, Pik, Średnia słów i unikalni widzowie */}
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
          <span className="flex items-center gap-1.5 text-slate-100 font-bold">
            <MessageSquare className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-white text-xs">Wszystkie wiadomości</span>
          </span>
          <span className="text-slate-300 text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            Pik: <strong className="text-white font-bold tabular-nums">{stats.peakMessagesPerMinute}/min</strong>
          </span>
        </div>

        {/* DUŻA, CZYTELNA CYFRA ŁĄCZNYCH WIADOMOŚCI - MIEŚCI NAWET 7 CYFR */}
        <div 
          id="stat-total-messages"
          className="text-[44px] sm:text-[50px] font-black tracking-tight text-white my-1 tabular-nums text-center leading-none drop-shadow-[0_2px_14px_rgba(6,182,212,0.25)]"
        >
          {stats.totalMessages.toLocaleString()}
        </div>

        <div className="text-[10.5px] text-slate-400 flex items-center justify-between pt-1 pb-1.5 border-t border-slate-800/70 flex-wrap gap-1">
          <span>Średnio: <strong className="text-slate-200 tabular-nums">{stats.avgWordsPerMessage} słów</strong>/wiad.</span>
          <span>Unikalni: <strong className="text-cyan-300 font-bold tabular-nums">{stats.uniqueChattersCount}</strong> widzów</span>
        </div>

        {/* Dolna część: Kompaktowe Top 5 czatu z POWIĘKSZONĄ ilością wiadomości każdego widza */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-200 text-[11px]">
              <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Top 5 na czacie</span>
            </div>
            <span className="text-[9.5px] text-slate-400 font-medium">% udziału / wiadomości</span>
          </div>

          {stats.topChatters && stats.topChatters.length > 0 ? (
            <div className="space-y-1">
              {stats.topChatters.slice(0, 5).map((user, idx) => {
                const style = getRankBadge(idx);

                return (
                  <div
                    key={user.username}
                    className={`rounded-lg px-2.5 py-1.5 border flex items-center justify-between gap-2 transition text-[11px] leading-tight ${style.wrapper}`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className={`w-4 h-4 rounded flex items-center justify-center text-[9.5px] font-black shrink-0 ${style.badge}`}>
                        {idx + 1}
                      </span>
                      <span
                        className="font-bold truncate max-w-[170px] sm:max-w-[200px]"
                        style={{ color: user.color || '#e2e8f0' }}
                        title={user.username}
                      >
                        {user.username}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-slate-400 text-[10px] font-mono">
                        {user.percentage}%
                      </span>
                      {/* POWIĘKSZONA CYFRA WIADOMOŚCI DANEGO WIDZA */}
                      <strong 
                        className="text-cyan-300 text-xs sm:text-[13.5px] font-black tabular-nums bg-slate-900/90 border border-cyan-500/30 px-2 py-0.5 rounded shadow-sm min-w-[36px] text-center"
                        title={`Liczba wiadomości: ${user.count}`}
                      >
                        {user.count.toLocaleString()}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-2.5 text-center text-slate-400 text-[10.5px] italic">
              Oczekiwanie na wiadomości widzów...
            </div>
          )}
        </div>
      </section>

      {/* 3. WYRÓŻNIONE METRYKI ZE ZRÓŻNICOWANĄ KOLORYSTYKĄ */}
      {/* 3A. TEMPO WIADOMOŚCI NA MINUTĘ (CZYTELNY LICZNIK I PIK SESJI BEZ ZBĘDNYCH WYKRESÓW) */}
      <section className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10.5px] font-bold text-amber-300/90 block">
              Tempo wiadomości na minutę
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <strong className="text-amber-200 text-2xl font-black tabular-nums">
                {stats.messagesPerMinute}
              </strong>
              <span className="text-[11px] text-amber-400/80 font-medium">wiad./min</span>
            </div>
          </div>
        </div>

        <div className="text-right shrink-0 bg-slate-900/80 border border-amber-500/30 px-3 py-1.5 rounded-lg shadow-inner">
          <span className="text-[9.5px] text-slate-400 block font-medium">Pik w sesji</span>
          <strong className="text-amber-200 text-sm font-black tabular-nums">
            {stats.peakMessagesPerMinute} <span className="text-[10px] text-slate-400 font-normal">/min</span>
          </strong>
        </div>
      </section>

      {/* 3B. CZTERY KAFLE METRYK: SŁOWA (SKY BLUE), EMOTKI (WARM ORANGE), LINKI (EMERALD), OZNACZENIA STREAMERA (CYAN) */}
      {/* Zaprojektowane z miejscem na 6-cyfrowe liczby (np. 150,000, 999,999) */}
      <div className="grid grid-cols-4 gap-1.5 text-center">
        {/* Słowa (Sky Blue) */}
        <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl py-2 px-1 flex flex-col justify-center min-h-[58px]">
          <span className="text-sky-300/90 text-[10px] font-bold flex items-center justify-center gap-1">
            <FileText className="w-3 h-3 text-sky-400 shrink-0" />
            <span>Słowa</span>
          </span>
          <strong className="text-sky-100 text-xs sm:text-[13px] font-black tabular-nums block my-0.5 whitespace-nowrap tracking-tight">
            {stats.totalWords.toLocaleString()}
          </strong>
          <span className="text-[8px] text-slate-400 block">
            napisane
          </span>
        </div>

        {/* Emotki (Warm Orange) */}
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl py-2 px-1 flex flex-col justify-center min-h-[58px]">
          <span className="text-orange-300/90 text-[10px] font-bold flex items-center justify-center gap-1">
            <Smile className="w-3 h-3 text-orange-400 shrink-0" />
            <span>Emotki</span>
          </span>
          <strong className="text-orange-100 text-xs sm:text-[13px] font-black tabular-nums block my-0.5 whitespace-nowrap tracking-tight">
            {stats.totalEmotes.toLocaleString()}
          </strong>
          <span className="text-[8px] text-slate-400 block">
            suma
          </span>
        </div>

        {/* Linki (Emerald) */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl py-2 px-1 flex flex-col justify-center min-h-[58px]">
          <span className="text-emerald-300/90 text-[10px] font-bold flex items-center justify-center gap-1">
            <Link2 className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>Linki</span>
          </span>
          <strong className="text-emerald-100 text-xs sm:text-[13px] font-black tabular-nums block my-0.5 whitespace-nowrap tracking-tight">
            {stats.linksSharedCount.toLocaleString()}
          </strong>
          <span className="text-[8px] text-slate-400 block">
            wklejone
          </span>
        </div>

        {/* Oznaczenia streamera (Cyan) */}
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl py-2 px-1 flex flex-col justify-center min-h-[58px]">
          <span className="text-cyan-300/90 text-[10px] font-bold flex items-center justify-center gap-1" title={`Oznaczenia streamera @${stats.channelSlug}`}>
            <AtSign className="w-3 h-3 text-cyan-400 shrink-0" />
            <span>Oznaczenia</span>
          </span>
          <strong className="text-cyan-100 text-xs sm:text-[13px] font-black tabular-nums block my-0.5 whitespace-nowrap tracking-tight">
            {stats.streamerMentionsCount.toLocaleString()}
          </strong>
          <span className="text-[8px] text-slate-400 block truncate">
            @{stats.channelSlug}
          </span>
        </div>
      </div>

      {/* 4. DYNAMIKA CELU (DOMYŚLNIE WYRÓWNANY DO 0, MOŻLIWOŚĆ WPISANIA DOWOLNEJ LICZBY) */}
      <section className="bg-[#121620] border border-slate-800/80 rounded-xl p-2.5 shadow-sm space-y-1.5">
        {isGoalEnabled ? (
          <>
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-200">
                <Target className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="font-bold text-[11px]">Cel:</span>
                {currentGoal > 0 ? (
                  <>
                    <span className="text-cyan-300 font-black tabular-nums">{goalCount.toLocaleString()}</span>
                    <span className="text-slate-500 font-bold">/</span>
                    <span className="text-slate-200 font-bold tabular-nums">{currentGoal.toLocaleString()}</span>
                    <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                      {progressPercent}%
                    </span>
                  </>
                ) : (
                  <span className="text-slate-300 font-medium text-[11px]">
                    0 <span className="text-slate-400 font-normal">(wyzerowany)</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {currentGoal > 0 && (
                  <button
                    id="btn-reset-goal"
                    type="button"
                    onClick={handleResetGoal}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 transition active:scale-95"
                    title="Zeruje wyłącznie licznik postępu celu (Alt+G)"
                  >
                    Zeruj
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsEditingGoal(!isEditingGoal)}
                  className="text-[10px] text-slate-200 hover:text-cyan-300 transition flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded-md border border-slate-700 font-medium"
                  title="Wpisz dowolną wartość celu"
                >
                  <Edit2 className="w-3 h-3 text-cyan-400" />
                  <span>{currentGoal === 0 ? 'Ustaw cel' : 'Edytuj'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleToggleGoalEnabled}
                  className="text-[10px] text-slate-400 hover:text-rose-400 transition ml-1 px-1 py-0.5"
                  title="Wyłącz pasek celu"
                >
                  Ukryj
                </button>
              </div>
            </div>

            {/* Pasek postępu - gradient cyan do emerald */}
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 shadow-inner">
              <div 
                className="h-full rounded-full transition-all duration-300 ease-out bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-400 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>
                {currentGoal === 0 ? (
                  <span>
                    Cel jest wyzerowany. Kliknij <strong className="text-cyan-300 hover:underline cursor-pointer" onClick={() => setIsEditingGoal(true)}>Ustaw cel</strong>, aby wpisać dowolną liczbę wiadomości.
                  </span>
                ) : isGoalReached ? (
                  <strong className="text-emerald-400 font-bold">Cel osiągnięty! 🎉</strong>
                ) : (
                  <span>Do celu: <strong className="text-cyan-300 font-bold tabular-nums">{remainingMessages.toLocaleString()}</strong> wiad.</span>
                )}
              </span>
              <span className="text-[9.5px] text-slate-400 font-mono">Alt+G</span>
            </div>

            {/* Formularz wpisania dowolnej liczby celu */}
            {isEditingGoal && (
              <form onSubmit={handleSaveGoal} className="mt-1 pt-1.5 border-t border-slate-800/80 flex gap-1.5">
                <input
                  type="number"
                  min="0"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  placeholder="Wpisz dowolną liczbę celu (np. 1000)"
                  className="flex-1 bg-black/60 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-cyan-400 tabular-nums font-bold"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded text-xs transition"
                >
                  Zapisz
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingGoal(false)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition"
                >
                  Anuluj
                </button>
              </form>
            )}
          </>
        ) : (
          <div className="flex items-center justify-between py-1">
            <span className="text-[10.5px] text-slate-400 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-slate-400" />
              <span>Cel wiadomości: <strong className="text-slate-400 font-normal">Wyłączony</strong></span>
            </span>
            <button
              type="button"
              onClick={handleToggleGoalEnabled}
              className="text-[10.5px] text-cyan-400 hover:underline font-bold"
            >
              Włącz cel
            </button>
          </div>
        )}
      </section>

      {/* 5. PRZYCISK RESETOWANIA (JASNY, RZUCAJĄCY SIĘ W OCZY, ZE SKRÓTEM Alt+R) */}
      <div className="flex items-center justify-center my-0.5">
        <button
          id="btn-reset-counter"
          type="button"
          onClick={() => setShowResetConfirm(true)}
          className="w-full py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-black border border-rose-400 shadow-[0_0_14px_rgba(225,29,72,0.4)] text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          title="Zresetuj wszystkie statystyki bieżącej sesji (Skrót: Alt + R)"
        >
          <RotateCcw className="w-3.5 h-3.5 text-white shrink-0" />
          <span>Resetuj statystyki</span>
          <span className="text-[10px] text-rose-100 font-mono opacity-90">(Alt+R)</span>
        </button>
      </div>

      {/* 6. STOPKA: ELEGANCKI PODPIS TWÓRCY "by GodShaker" */}
      <footer className="mt-0.5 bg-[#0a0d14] border border-slate-800/80 rounded-lg px-3 py-1.5 text-[10.5px] text-slate-400 flex items-center justify-between shadow-sm">
        <span className="font-semibold text-slate-400">
          KickStats Pro Live • by{' '}
          <strong className="text-slate-200 font-bold tracking-wide">
            {KICK_CONFIG.CREATOR_NAME}
          </strong>
        </span>
        <span className="text-[10px] text-slate-300 font-medium flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
          <span>&lt;0.05% CPU • 0 FPS drop</span>
        </span>
      </footer>
      </div>

      {/* MODAL INSTRUKCJI STREAM DECKA (ZAMYKANY, BEZ WYCHODZENIA POZA EKRAN) */}
      {showStreamDeckModal && (
        <StreamDeckGuideModal
          channelSlug={stats.channelSlug}
          onClose={() => setShowStreamDeckModal(false)}
        />
      )}

      {/* MODAL POTWIERDZENIA RESETU STATYSTYK */}
      {showResetConfirm && (
        <ResetConfirmModal
          channelSlug={stats.channelSlug}
          totalMessages={stats.totalMessages}
          onConfirm={handleConfirmReset}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}

      {/* MODAL W PRZYPADKU ZABLOKOWANIA POP-OUT PRZEZ OBS */}
      {showPopoutBlockedModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 select-none animate-in fade-in duration-200">
          <div className="bg-[#121620] border border-cyan-500/40 rounded-xl max-w-sm w-full p-4 text-xs shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-cyan-400" />
                <span>Pływające okno (Pop-out)</span>
              </span>
              <button
                type="button"
                onClick={() => setShowPopoutBlockedModal(false)}
                className="text-slate-400 hover:text-white font-bold px-1.5 py-0.5"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-300 leading-relaxed text-xs">
              Wbudowana przeglądarka OBS domyślnie blokuje nowe okienka. Skopiuj poniższy link i wklej go w zwykłej przeglądarce (Chrome, Edge) na drugim monitorze:
            </p>

            <div className="space-y-2">
              <input
                type="text"
                readOnly
                value={popoutObsUrl}
                className="w-full bg-black/70 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-300 font-mono truncate"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(popoutObsUrl);
                    setCopiedPopoutLink(true);
                    setTimeout(() => setCopiedPopoutLink(false), 2500);
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  {copiedPopoutLink ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPopoutLink ? 'Skopiowano!' : 'Kopiuj link okna'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.open(popoutObsUrl, '_blank');
                    setShowPopoutBlockedModal(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition"
                >
                  Otwórz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GENERATORA LICENCJI DLA STREAMERÓW (GODSHAKER) */}
      {showLicenseGenModal && (
        <LicenseGeneratorModal 
          currentChannel={activeChannel}
          onSwitchChannel={(nick) => changeChannel(nick)}
          onClose={() => setShowLicenseGenModal(false)} 
        />
      )}

    </div>
  );
}
