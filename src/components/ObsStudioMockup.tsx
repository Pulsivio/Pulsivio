import { useState, useEffect } from 'react';
import { KickObsDock } from './KickObsDock';
import { 
  Monitor, 
  Layers, 
  Sliders, 
  Settings, 
  Video, 
  Disc, 
  ArrowLeft,
  Tv,
  CheckCircle2,
  Volume2
} from 'lucide-react';

interface ObsStudioMockupProps {
  channelSlug: string;
  onExitMockup: () => void;
}

export function ObsStudioMockup({ channelSlug, onExitMockup }: ObsStudioMockupProps) {
  // Symulowane poziomy audio w mikserze OBS
  const [audioMeter1, setAudioMeter1] = useState<number>(65);
  const [audioMeter2, setAudioMeter2] = useState<number>(45);

  useEffect(() => {
    const interval = setInterval(() => {
      setAudioMeter1(Math.floor(40 + Math.random() * 45));
      setAudioMeter2(Math.floor(20 + Math.random() * 60));
    }, 250);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full min-h-screen bg-[#14171d] text-slate-200 flex flex-col font-sans select-none overflow-hidden text-xs">
      {/* 1. PASEK TYTUŁU OKNA WINDOWS / OBS STUDIO */}
      <div className="bg-[#1c212b] border-b border-slate-800 px-3 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-slate-600 flex items-center justify-center text-[8px] font-bold text-black">
            ●
          </span>
          <span className="text-slate-300 font-medium text-[11px]">
            OBS 30.2.2 (64-bit, Windows) - Profil: Kick Stream - Kolekcja scen: GTA RP
          </span>
        </div>

        {/* PRZYCISK POWROTU DO CZYSTEGO PANELU */}
        <div className="flex items-center gap-2">
          <button
            onClick={onExitMockup}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#53fc18] hover:bg-[#53fc18]/90 text-slate-950 font-bold rounded text-xs transition shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Wróć do czystego panelu</span>
          </button>
        </div>
      </div>

      {/* 2. MENU GÓRNE OBS (PANELE / DOKI) */}
      <div className="bg-[#161a22] border-b border-slate-800 px-3 py-1 flex items-center gap-3 text-slate-300 text-[11px]">
        <span className="hover:text-white cursor-pointer">Plik</span>
        <span className="hover:text-white cursor-pointer">Edycja</span>
        <span className="hover:text-white cursor-pointer">Widok</span>
        <span className="hover:text-white cursor-pointer">Profile</span>
        <span className="hover:text-white cursor-pointer">Kolekcja scen</span>
        <span className="hover:text-white cursor-pointer">Narzędzia</span>
        <span className="text-[#53fc18] font-bold bg-[#53fc18]/10 px-2 py-0.5 rounded border border-[#53fc18]/30 cursor-pointer flex items-center gap-1">
          Panele (Doki) ★
        </span>
        <span className="hover:text-white cursor-pointer">Pomoc</span>

        <div className="ml-auto text-slate-400 text-[11px] hidden sm:flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#53fc18]" />
          <span>Podgląd: Tak wygląda panel zadokowany w OBS Studio</span>
        </div>
      </div>

      {/* 3. GŁÓWNA PRZESTRZEŃ OBS: EKRAN STREAMU + DOKI */}
      <div className="flex-1 grid grid-cols-12 gap-1.5 p-1.5 overflow-hidden min-h-0 bg-[#0f1217]">
        {/* LEWA STRONA: PODGLĄD SCENY STREAMU ORAZ STEROWANIE */}
        <div className="col-span-12 lg:col-span-7 xl:col-span-8 flex flex-col gap-1.5 min-h-0">
          {/* EKRAN STREAMU (CANVAS 16:9) */}
          <div className="flex-1 bg-black rounded-lg border border-slate-800 relative flex items-center justify-center overflow-hidden min-h-[220px]">
            {/* Symulowana grafika streamu */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-black flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#53fc18]/10 border border-[#53fc18]/30 flex items-center justify-center mb-3">
                <Tv className="w-8 h-8 text-[#53fc18]" />
              </div>
              <h2 className="text-base font-bold text-white mb-1">
                Podgląd Sceny OBS Studio (1920x1080 @ 60 FPS)
              </h2>
              <p className="text-xs text-slate-400 max-w-md">
                Scena: <span className="text-[#53fc18] font-mono">GTA RP Live Stream</span> • Przechwytywanie gry + Kamera
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#53fc18]/20 text-[#53fc18] border border-[#53fc18]/40 text-[10px] font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#53fc18] animate-pulse" />
                  Na żywo na Kick
                </span>
                <span className="text-[11px] text-slate-400">
                  kick.com/{channelSlug}
                </span>
              </div>
            </div>

            {/* Kamera w rogu (PIP) */}
            <div className="absolute bottom-3 right-3 w-36 h-24 rounded bg-slate-800/80 border border-slate-700 flex flex-col items-center justify-center text-[10px] text-slate-400 shadow-xl">
              <Video className="w-5 h-5 text-slate-500 mb-1" />
              <span>Kamera Logitech C920</span>
            </div>
          </div>

          {/* DOLNE DOKI OBS: SCENY, ŹRÓDŁA, MIKSER, KONTROLA */}
          <div className="h-44 grid grid-cols-2 sm:grid-cols-4 gap-1.5 shrink-0">
            {/* Sceny */}
            <div className="bg-[#161a22] border border-slate-800 rounded-lg p-2 flex flex-col">
              <span className="text-[10px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                <Layers className="w-3 h-3 text-slate-400" /> Sceny
              </span>
              <div className="flex-1 bg-black/40 rounded p-1 space-y-1 text-[11px]">
                <div className="px-2 py-1 bg-blue-600/30 text-blue-300 font-semibold rounded border border-blue-500/40">
                  GTA RP Gra (Aktywna)
                </div>
                <div className="px-2 py-0.5 text-slate-400 hover:text-white">
                  Just Chatting
                </div>
                <div className="px-2 py-0.5 text-slate-400 hover:text-white">
                  Przerwa BRB
                </div>
              </div>
            </div>

            {/* Źródła */}
            <div className="bg-[#161a22] border border-slate-800 rounded-lg p-2 flex flex-col">
              <span className="text-[10px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                <Monitor className="w-3 h-3 text-slate-400" /> Źródła
              </span>
              <div className="flex-1 bg-black/40 rounded p-1 space-y-1 text-[11px]">
                <div className="px-2 py-0.5 text-slate-300">Przechwytywanie gry</div>
                <div className="px-2 py-0.5 text-slate-300">Kamera główna</div>
                <div className="px-2 py-0.5 text-[#53fc18] font-medium">AlertBox Widget</div>
              </div>
            </div>

            {/* Mikser dźwięku */}
            <div className="bg-[#161a22] border border-slate-800 rounded-lg p-2 flex flex-col">
              <span className="text-[10px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                <Sliders className="w-3 h-3 text-slate-400" /> Mikser dźwięku
              </span>
              <div className="flex-1 flex flex-col justify-around py-1 text-[10px]">
                <div>
                  <div className="flex justify-between text-slate-400 mb-0.5">
                    <span>Dźwięk pulpitu</span>
                    <span>-12 dB</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-500 rounded-full transition-all duration-200" 
                      style={{ width: `${audioMeter1}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-0.5">
                    <span>Mikrofon/Aux</span>
                    <span>-6 dB</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 via-yellow-400 to-red-500 rounded-full transition-all duration-200" 
                      style={{ width: `${audioMeter2}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Elementy sterujące */}
            <div className="bg-[#161a22] border border-slate-800 rounded-lg p-2 flex flex-col justify-between">
              <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                <Settings className="w-3 h-3 text-slate-400" /> Sterowanie
              </span>
              <div className="space-y-1 my-auto">
                <button className="w-full py-1 bg-red-600/30 border border-red-500/40 text-red-300 font-bold rounded text-[10px]">
                  Zatrzymaj stream
                </button>
                <button className="w-full py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">
                  Rozpocznij nagrywanie
                </button>
                <button className="w-full py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">
                  Ustawienia
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PRAWA STRONA: ZADOKOWANY WŁASNY PANEL PRZEGLĄDARKI KICK LIVE CHAT STAT */}
        <div className="col-span-12 lg:col-span-5 xl:col-span-4 flex flex-col rounded-lg border-2 border-[#53fc18]/60 shadow-2xl overflow-hidden bg-[#0a0d14] relative">
          {/* Belka zadokowanego panelu w OBS */}
          <div className="bg-[#1a202c] border-b border-[#53fc18]/40 px-3 py-1.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#53fc18] animate-ping" />
              <span className="font-bold text-[#53fc18] text-xs">
                Własny panel OBS: ChatStream Analytics Live
              </span>
            </div>
            <span className="text-[10px] text-slate-400 bg-black/40 px-2 py-0.5 rounded border border-slate-700">
              Zadokowany w OBS
            </span>
          </div>

          {/* Rzeczywisty, działający na żywo komponent KickObsDock w trybie zadokowanym */}
          <div className="flex-1 overflow-y-auto">
            <KickObsDock
              defaultChannel={channelSlug}
              isCompactMode={true}
              hideObsPreviewToggle={true}
            />
          </div>
        </div>
      </div>

      {/* 4. DOLNY PASEK STANU OBS STUDIO */}
      <div className="bg-[#161a22] border-t border-slate-800 px-3 py-1 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
        <div className="flex items-center gap-4">
          <span className="text-emerald-400 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            NA ŻYWO: 01:24:12
          </span>
          <span>REC: 00:00:00</span>
          <span>CPU: 2.3%, 60.00 fps</span>
          <span>Utrata klatek: 0 (0.0%)</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-300">Przepływność: 6200 kb/s</span>
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" title="Jakość połączenia ze streamem: Dobra" />
        </div>
      </div>
    </div>
  );
}
