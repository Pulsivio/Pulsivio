import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, ShieldCheck, ArrowRight, X, EyeOff } from 'lucide-react';

interface GoogleAdsBannerProps {
  isProUser?: boolean;
  onOpenProModal?: () => void;
  onOpenRecommendedMonitors?: () => void;
  clientId?: string;
  slotId?: string;
  format?: 'horizontal' | 'rectangle';
}

const STORAGE_DISMISSED_KEY = 'pulsivio_ad_banner_dismissed';

export const GoogleAdsBanner: React.FC<GoogleAdsBannerProps> = ({
  isProUser = false,
  onOpenProModal,
  onOpenRecommendedMonitors,
  clientId = 'ca-pub-6429381029384712',
  slotId = '8492019384',
  format = 'horizontal'
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_DISMISSED_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // If user is PRO or dismissed, do not show
  if (isProUser || dismissed) {
    return null;
  }

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        setAdLoaded(true);
      }
    } catch (e) {
      setAdLoaded(false);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_DISMISSED_KEY, 'true');
    } catch (e) {
      console.error('Could not save dismissal state', e);
    }
  };

  return (
    <div
      ref={adRef}
      id="google-ads-container"
      className="w-full my-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 sm:p-4 shadow-xs overflow-hidden relative"
    >
      {/* Top Header Bar with touch-friendly controls */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80 mb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] sm:text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
            Reklama
          </span>
          <span className="text-[10px] text-slate-300 dark:text-slate-700">•</span>
          <button
            type="button"
            onClick={onOpenProModal}
            className="text-[11px] sm:text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-1 min-h-[36px] py-1 touch-manipulation"
          >
            <Sparkles className="w-3 h-3 shrink-0" />
            <span>Wyłącz reklamy w PRO</span>
          </button>
        </div>

        {/* Big Mobile-friendly Close Button with minimum 44x44px touch target */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Zamknij reklamę"
          className="relative z-20 min-w-[44px] min-h-[44px] -mr-2 -my-2 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-slate-100/80 hover:bg-slate-200/90 dark:bg-slate-800/80 dark:hover:bg-slate-700 active:scale-95 transition-all cursor-pointer touch-manipulation"
          title="Zamknij reklamę na telefonie i komputerze"
        >
          <span className="text-[11px] font-bold sm:inline hidden">Zamknij</span>
          <X className="w-4 h-4 text-slate-600 dark:text-slate-300 stroke-[2.5]" />
        </button>
      </div>

      {/* Actual Google AdSense element */}
      <div className="w-full overflow-hidden min-h-[50px] relative z-10">
        <ins
          className="adsbygoogle"
          style={{ display: 'block', textAlign: 'center' }}
          data-ad-client={clientId}
          data-ad-slot={slotId}
          data-ad-format={format === 'horizontal' ? 'horizontal' : 'auto'}
          data-full-width-responsive="true"
        />
      </div>

      {/* Fallback sponsored recommendation when ad is pending or blocked */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-gradient-to-r from-sky-50 via-slate-50 to-indigo-50 dark:from-sky-950/30 dark:via-slate-900 dark:to-indigo-950/30 border border-sky-100 dark:border-sky-900/50 mt-2">
        <div className="flex items-center gap-3 text-left w-full sm:w-auto">
          <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
              Szukasz rzetelnego ciśnieniomierza z atestem kardiologicznym?
            </div>
            <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Certyfikowane modele OMRON, Microlife i Tech-Med z atestem PTNT
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenRecommendedMonitors}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer touch-manipulation"
        >
          <span>Ranking cenowy</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Explicit Mobile Bottom Close Bar (easy thumb access on smartphones) */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="hidden xs:inline text-[10px]">Reklamy wspierają utrzymanie bezpłatnego serwisu</span>
        <button
          type="button"
          onClick={handleDismiss}
          className="w-full sm:w-auto min-h-[38px] flex items-center justify-center gap-1 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 font-semibold py-1 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer touch-manipulation transition-colors ml-auto"
        >
          <EyeOff className="w-3.5 h-3.5" />
          <span>Ukryj to ogłoszenie</span>
        </button>
      </div>
    </div>
  );
};
