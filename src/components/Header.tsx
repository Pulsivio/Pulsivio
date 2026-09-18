import React from 'react';
import {
  Smartphone,
  Stethoscope,
  Mic,
  Sparkles,
  Image as ImageIcon,
  Settings,
  Heart,
  Cloud,
  Coffee,
  ShieldCheck,
  Crown,
  User
} from 'lucide-react';

interface HeaderProps {
  activeTab?: string;
  setActiveTab?: (tab: any) => void;
  onOpenAddModal?: () => void;
  onOpenSyncModal: () => void;
  onOpenVoiceModal: () => void;
  onOpenAboutModal: () => void;
  onOpenSocialModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenBuyCoffeeModal: () => void;
  onOpenRecommendedMonitors?: () => void;
  onOpenAdminModal?: () => void;
  onOpenProModal?: () => void;
  onOpenGoogleAuth?: () => void;
  isProUser?: boolean;
  googleAccount?: { email: string; name: string } | null;
  syncCode: string;
  isSyncing?: boolean;
  isSeniorMode: boolean;
  currentAvatar: string;
  onOpenAvatarSelector: () => void;
  lang?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSyncModal,
  onOpenVoiceModal,
  onOpenAboutModal,
  onOpenSocialModal,
  onOpenSettingsModal,
  onOpenBuyCoffeeModal,
  onOpenRecommendedMonitors,
  onOpenAdminModal,
  onOpenProModal,
  onOpenGoogleAuth,
  isProUser = false,
  googleAccount = null,
  syncCode,
  isSyncing = false,
  isSeniorMode,
  currentAvatar,
  onOpenAvatarSelector,
}) => {
  return (
    <header className="no-print sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:px-6 sm:py-2.5">
        
        {/* Brand & Avatar */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onOpenAvatarSelector}
            id="header-avatar-btn"
            className="group relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-xs border border-slate-300/80 dark:border-slate-700 bg-slate-950 hover:scale-105 active:scale-95 transition-all cursor-pointer ring-2 ring-transparent hover:ring-rose-500/40"
            title="Kliknij, aby zmienić awatar aplikacji"
          >
            <img
              src={currentAvatar || '/avatars/pulsivio_official_brand.jpg'}
              alt="Pulsivio Logo"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-center"
            />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="notranslate text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white truncate">
                Pulsivio
              </h1>
              
              {/* PRO status badge or upgrade button */}
              {isProUser ? (
                <button
                  type="button"
                  onClick={onOpenProModal}
                  className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-2xs cursor-pointer active:scale-95"
                  title="Pulsivio PRO jest aktywne"
                >
                  <Crown className="w-3 h-3 fill-slate-950" />
                  <span>PRO</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenProModal}
                  className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-bold text-[10px] px-1.5 py-0.5 rounded-md hover:bg-amber-100 transition-colors cursor-pointer"
                  title="Aktywuj wersję PRO (bez reklam, zaawansowane analizy)"
                >
                  <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                  <span>PRO</span>
                </button>
              )}

              {isSeniorMode && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-extrabold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  👴 Prosty widok
                </span>
              )}
            </div>
            <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
              Dziennik ciśnienia i zdrowia
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Polecane aparaty & Ceny */}
          {onOpenRecommendedMonitors && (
            <button
              type="button"
              onClick={onOpenRecommendedMonitors}
              id="header-recommended-monitors-btn"
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300/80 bg-emerald-50 px-2 sm:px-2.5 py-1.5 text-xs sm:text-sm font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer shadow-2xs"
              title="Polecane ciśnieniomierze z atestem wg cen (do 70 zł, do 130 zł, do 200 zł)"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden md:inline">Polecane aparaty</span>
              <span className="md:hidden">Aparaty</span>
            </button>
          )}

          {/* Konto Google */}
          {onOpenGoogleAuth && (
            <button
              type="button"
              onClick={onOpenGoogleAuth}
              id="header-google-auth-btn"
              className={`inline-flex items-center gap-1.5 rounded-xl border px-2 sm:px-2.5 py-1.5 text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-2xs ${
                googleAccount
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
              }`}
              title={googleAccount ? `Zalogowano jako ${googleAccount.email}` : 'Zaloguj przez konto Google dla ciągłej synchronizacji'}
            >
              <div className="w-3.5 h-3.5 shrink-0">
                <svg className="w-full h-full" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <span className="hidden sm:inline">
                {googleAccount ? 'Google: Połączono' : 'Google'}
              </span>
            </button>
          )}

          {/* PC <-> Telefon */}
          <button
            type="button"
            onClick={onOpenSyncModal}
            id="header-run-on-phone-btn"
            className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-2 sm:px-2.5 py-1.5 text-xs sm:text-sm font-bold text-sky-700 hover:bg-sky-100 dark:border-sky-900 dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-900/50 transition-colors cursor-pointer shadow-2xs"
            title="Synchronizacja PC ↔ Telefon (Kod / QR / Google)"
          >
            <Cloud className={`h-4 w-4 text-sky-600 dark:text-sky-400 ${isSyncing ? 'animate-pulse' : ''}`} />
            <span className="hidden sm:inline">PC ↔ Telefon</span>
            {syncCode && (
              <span className="hidden lg:inline text-[10px] font-mono font-bold bg-sky-200 dark:bg-sky-900 text-sky-800 dark:text-sky-200 px-1.5 py-0.5 rounded-md">
                {syncCode}
              </span>
            )}
          </button>

          {/* Postaw kawę (BuyCoffee / BLIK) */}
          <button
            type="button"
            onClick={onOpenBuyCoffeeModal}
            id="header-buycoffee-btn"
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300/80 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-2 sm:px-2.5 py-1.5 text-xs sm:text-sm font-bold shadow-2xs transition-all active:scale-95 cursor-pointer"
            title="Postaw kawę / Wesprzyj projekt (BLIK, Karta)"
          >
            <Coffee className="h-4 w-4 text-amber-200" />
            <span className="hidden sm:inline">Kawa (BLIK)</span>
          </button>

          {/* Asystent głosowy */}
          <button
            type="button"
            onClick={onOpenVoiceModal}
            id="header-voice-assistant-btn"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-2 sm:px-2.5 py-1.5 text-xs sm:text-sm font-bold text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-900/50 transition-colors cursor-pointer"
            title="Mów do asystenta zdrowia i ciśnienia"
          >
            <Mic className="h-4 w-4 animate-pulse text-rose-600 dark:text-rose-400" />
            <span className="hidden md:inline whitespace-nowrap">Asystent</span>
          </button>

          {/* Settings Cog */}
          <button
            type="button"
            onClick={onOpenSettingsModal}
            id="header-settings-btn"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 px-2 sm:px-2.5 py-1.5 text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 shadow-xs cursor-pointer transition-all active:scale-95"
            title="Ustawienia aplikacji"
          >
            <Settings className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            <span className="hidden lg:inline">Ustawienia</span>
          </button>

        </div>
      </div>
    </header>
  );
};
