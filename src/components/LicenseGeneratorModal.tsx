import { useState, useEffect } from 'react';
import { generateStreamerKey } from '../config';
import { Key, Copy, Check, X, ShieldCheck, Send, ExternalLink, Play, Radio } from 'lucide-react';

interface LicenseGeneratorModalProps {
  currentChannel: string;
  onSwitchChannel: (channel: string) => void;
  onClose: () => void;
}

export function LicenseGeneratorModal({ currentChannel, onSwitchChannel, onClose }: LicenseGeneratorModalProps) {
  const [streamerNick, setStreamerNick] = useState<string>(currentChannel || 'pisicelarp');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedMsg, setCopiedMsg] = useState<boolean>(false);
  const [copiedKeyOnly, setCopiedKeyOnly] = useState<boolean>(false);
  const [switchedToast, setSwitchedToast] = useState<boolean>(false);

  const rawOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const origin = rawOrigin.includes('ais-dev-') ? rawOrigin.replace('ais-dev-', 'ais-pre-') : rawOrigin;
  const path = typeof window !== 'undefined' ? window.location.pathname : '';

  const cleanNick = streamerNick.trim().toLowerCase().replace(/^@/, '');
  const generatedKey = cleanNick ? generateStreamerKey(cleanNick) : '';
  const fullObsUrl = cleanNick && generatedKey 
    ? `${origin}${path}?channel=${encodeURIComponent(cleanNick)}&key=${encodeURIComponent(generatedKey)}`
    : '';

  const readyMessage = `Cześć! Przygotowałem dla Ciebie dedykowany widget panelu statystyk czatu na żywo (KickStats Pro Live) do OBS Studio:

🔗 Twój link do OBS (Źródło przeglądarki lub Własny dok):
${fullObsUrl}

🔑 Twój unikalny klucz licencyjny: ${generatedKey}

Instrukcja dodania w OBS (zajmuje 15 sekund):
Opcja 1 (Własny Dok / Panel boczny w OBS):
1. W OBS Studio kliknij w górnym menu: Doki (lub Panele) -> Własne doki przeglądarki...
2. Wpisz nazwę: Czat Statystyki
3. Wklej powyższy link i kliknij Zastosuj.

Opcja 2 (Źródło przeglądarki bezpośrednio na scenie OBS):
1. W sekcji Źródła kliknij "+" i wybierz: Przeglądarka (Browser Source).
2. Wklej powyższy link, ustaw szerokość 420 i wysokość 620.`;

  // Escape zamyka okno
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleCopyLink = () => {
    if (!fullObsUrl) return;
    navigator.clipboard.writeText(fullObsUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyMessage = () => {
    if (!readyMessage) return;
    navigator.clipboard.writeText(readyMessage);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2500);
  };

  const handleCopyKeyOnly = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopiedKeyOnly(true);
    setTimeout(() => setCopiedKeyOnly(false), 2500);
  };

  const handleDoSwitch = (target: string) => {
    const clean = target.trim().toLowerCase().replace(/^@/, '');
    if (!clean) return;
    onSwitchChannel(clean);
    setSwitchedToast(true);
    setTimeout(() => setSwitchedToast(false), 2500);
  };

  return (
    <div 
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 select-none animate-in fade-in duration-200"
    >
      <div className="bg-[#121620] border border-cyan-500/40 rounded-2xl max-w-lg w-full p-4 sm:p-5 shadow-2xl text-xs space-y-3.5 max-h-[92vh] overflow-y-auto">
        
        {/* Nagłówek */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-1.5">
                <span>Generator Licencji i Podgląd Kanału</span>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.2 rounded font-mono font-bold">
                  GodShaker
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Wpisz nick streamera, wygeneruj klucz lub od razu przełącz swój dok na jego czat
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formularz - wpisanie nicku */}
        <div className="space-y-2 bg-[#0a0d14] p-3 rounded-xl border border-slate-800">
          <label className="text-[11px] font-bold text-slate-200 flex items-center justify-between">
            <span>1. Wpisz nick streamera na Kick:</span>
            <span className="text-[10px] text-slate-400 font-normal">np. pisicelarp, aspentv</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold text-sm">@</span>
            <input
              type="text"
              value={streamerNick}
              onChange={(e) => setStreamerNick(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && cleanNick) {
                  e.preventDefault();
                  handleDoSwitch(cleanNick);
                }
              }}
              placeholder="pisicelarp"
              className="flex-1 bg-black/80 border border-cyan-500/60 rounded-lg px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-cyan-400 font-mono"
              autoFocus
            />
            {cleanNick && cleanNick !== currentChannel && (
              <button
                type="button"
                onClick={() => handleDoSwitch(cleanNick)}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition active:scale-95 shrink-0 flex items-center gap-1 cursor-pointer"
                title="Przełącz aktywny dok w tle na ten kanał"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Przełącz dok</span>
              </button>
            )}
          </div>

          {/* Wybór streamera - wyłącznie pisicelarp oraz aspentv */}
          <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-400 flex-wrap">
            <span>Dedykowani streamerzy:</span>
            <button
              type="button"
              onClick={() => {
                setStreamerNick('pisicelarp');
                handleDoSwitch('pisicelarp');
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition border flex items-center gap-1.5 cursor-pointer ${
                cleanNick === 'pisicelarp' || cleanNick === 'pisicel'
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60 shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
              }`}
            >
              <span className="font-mono font-bold">@pisicelarp</span>
              {(currentChannel === 'pisicelarp' || currentChannel === 'pisicel') && (
                <span className="text-[9px] text-emerald-400 font-bold">• aktywny</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setStreamerNick('aspentv');
                handleDoSwitch('aspentv');
              }}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition border flex items-center gap-1.5 cursor-pointer ${
                cleanNick === 'aspentv'
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60 shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
              }`}
            >
              <span className="font-mono font-bold">@aspentv</span>
              {currentChannel === 'aspentv' && (
                <span className="text-[9px] text-emerald-400 font-bold">• aktywny</span>
              )}
            </button>
          </div>
        </div>

        {/* WIDOK KANAŁU OBOK / POD SPODEM: Status i natychmiastowe przełączenie */}
        {cleanNick && (
          <div className="bg-[#0f1422] border border-cyan-500/30 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#53fc18]/15 border border-[#53fc18]/40 flex items-center justify-center text-[#53fc18] font-bold text-sm shrink-0">
                K
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-sm text-[#53fc18] font-mono">
                    @{cleanNick}
                  </span>
                  <a 
                    href={`https://kick.com/${cleanNick}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-slate-400 hover:text-cyan-300 underline flex items-center gap-0.5"
                    title="Otwórz kanał bezpośrednio na Kick.com"
                  >
                    <span>kick.com/{cleanNick}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <p className="text-[10.5px] text-slate-400 mt-0.5">
                  {cleanNick === currentChannel ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Ten kanał jest teraz aktywny i zbiera statystyki w Twoim doku
                    </span>
                  ) : (
                    <span>Aktywny kanał w Twoim doku to obecnie: <strong className="text-slate-200">@{currentChannel}</strong></span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
              {cleanNick === currentChannel ? (
                <span className="w-full sm:w-auto text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/50 px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Aktywny w doku</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleDoSwitch(cleanNick)}
                  className="w-full sm:w-auto px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-white font-bold text-xs rounded-lg shadow transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Radio className="w-3.5 h-3.5 text-white animate-pulse" />
                  <span>Przełącz dok na @{cleanNick}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {switchedToast && (
          <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-semibold text-center animate-in fade-in">
            ✓ Twój panel został natychmiast przełączony na kanał @{cleanNick}!
          </div>
        )}

        {/* Wynik: Wygenerowany klucz i link */}
        {cleanNick ? (
          <div className="space-y-2.5 bg-[#0a0d14] p-3 rounded-xl border border-slate-800">
            {/* Wygenerowany klucz */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400 font-medium text-[11px]">Wygenerowany klucz:</span>
              <div className="flex items-center gap-1.5">
                <code className="px-2 py-0.5 bg-cyan-950/80 border border-cyan-500/40 rounded text-cyan-300 font-mono font-bold text-[11px]">
                  {generatedKey}
                </code>
                <button
                  type="button"
                  onClick={handleCopyKeyOnly}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold flex items-center gap-1 transition cursor-pointer"
                  title="Kopiuj sam klucz"
                >
                  {copiedKeyOnly ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKeyOnly ? 'OK' : 'Klucz'}</span>
                </button>
              </div>
            </div>

            {/* Pełny link do OBS */}
            <div className="space-y-1">
              <span className="text-slate-400 font-medium text-[11px]">2. Gotowy link do wklejenia w OBS streamera:</span>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={fullObsUrl}
                  className="flex-1 bg-black/90 border border-slate-700 rounded-lg px-2.5 py-1.5 text-[11px] text-slate-200 font-mono select-all truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shrink-0 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Skopiowano!' : 'Kopiuj link'}</span>
                </button>
              </div>
            </div>

            {/* Przycisk kopiowania gotowej wiadomości z instrukcją */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleCopyMessage}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
              >
                {copiedMsg ? <Check className="w-4 h-4 text-white" /> : <Send className="w-4 h-4" />}
                <span>{copiedMsg ? 'Skopiowano całą wiadomość!' : 'Kopiuj gotową wiadomość z instrukcją dla streamera'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-slate-400 text-xs">
            Wpisz nick streamera powyżej, aby wygenerować unikalny link.
          </div>
        )}

        {/* Wyjaśnienie bezpieczeństwa dla twórcy */}
        <div className="p-2.5 rounded-xl bg-cyan-950/25 border border-cyan-500/30 text-[11px] text-cyan-200/90 space-y-1 leading-normal">
          <div className="flex items-center gap-1.5 font-bold text-cyan-300">
            <ShieldCheck className="w-4 h-4" />
            <span>Jak to działa pod maską?</span>
          </div>
          <p>
            Klucz jest szyfrowany i powiązany <strong>wyłącznie z podanym kanałem</strong>. Możesz w każdej chwili wpisać dowolnego streamera, przełączyć dok na jego czat i wygenerować mu gotowy link.
          </p>
        </div>

      </div>
    </div>
  );
}
