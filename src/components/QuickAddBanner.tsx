import React from 'react';
import { Heart, Plus, ShieldCheck, Mic, Pill } from 'lucide-react';

interface QuickAddBannerProps {
  onOpenAddModal: () => void;
  onOpenRecommendedMonitors?: () => void;
  onOpenVoiceModal?: () => void;
  onOpenDoctorGuide?: () => void;
  lang?: string;
}

export const QuickAddBanner: React.FC<QuickAddBannerProps> = ({
  onOpenAddModal,
  onOpenRecommendedMonitors,
  onOpenVoiceModal,
  onOpenDoctorGuide
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-rose-700 p-4 sm:p-5 text-white shadow-xl shadow-rose-900/20 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-rose-400/30">
      <div className="flex items-center gap-3.5 text-center md:text-left">
        <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-inner border border-white/30">
          <Heart className="h-6 w-6 fill-white" />
        </div>
        <div>
          <div className="flex items-center justify-center md:justify-start gap-2 mb-0.5 flex-wrap">
            <h2 className="text-base sm:text-lg font-black tracking-tight">
              Dodaj nowy pomiar ciśnienia
            </h2>
            <span className="bg-white/25 text-white text-[11px] font-bold px-2 py-0.5 rounded-full border border-white/30">
              Szybki zapis
            </span>
          </div>
          <p className="text-xs text-rose-100 font-medium">
            Zapisz badanie poranne, południowe lub wieczorne zgodnie z wytycznymi PTNT
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-center shrink-0">
        {onOpenDoctorGuide && (
          <button
            type="button"
            onClick={onOpenDoctorGuide}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-300/40 px-3.5 py-2.5 text-xs font-black text-amber-100 transition-all cursor-pointer backdrop-blur-xs active:scale-95"
            title="Dawkowanie lekarki: 130/80 - ½ tabl., ≥140/90 - cała tabletka & powiadomienia"
          >
            <Pill className="h-4 w-4 text-amber-300" />
            <span>Dawki lekarki (130/80 & 140/90)</span>
          </button>
        )}

        {onOpenRecommendedMonitors && (
          <button
            type="button"
            onClick={onOpenRecommendedMonitors}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/30 px-3.5 py-2.5 text-xs font-bold text-white transition-all cursor-pointer backdrop-blur-xs active:scale-95"
            title="Sprawdź certyfikowane ciśnieniomierze naramienne z atestem ESH i CE"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
            <span>Polecane aparaty</span>
          </button>
        )}

        {onOpenVoiceModal && (
          <button
            type="button"
            onClick={onOpenVoiceModal}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-rose-950/70 hover:bg-rose-950 border border-rose-400/40 px-3.5 py-2.5 text-xs font-bold text-rose-100 transition-all cursor-pointer shadow-md active:scale-95"
            title="Podyktuj pomiar głosem"
          >
            <Mic className="h-4 w-4 text-rose-400 animate-pulse" />
            <span>Podyktuj głosem</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenAddModal}
          id="quick-add-btn"
          className="inline-flex items-center gap-2 rounded-2xl bg-white text-rose-600 hover:bg-rose-50 px-4 py-2.5 text-xs sm:text-sm font-black shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-95"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>Dodaj pomiar teraz</span>
        </button>
      </div>
    </div>
  );
};
