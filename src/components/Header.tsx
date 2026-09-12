import React from 'react';
import { Heart, Mic, Smartphone, Settings, Stethoscope, Crown, QrCode, Cloud, RefreshCw, Sparkles, Compass } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../i18n';

interface HeaderProps {
  lang: Language;
  isSeniorMode: boolean;
  onOpenAssistant: () => void;
  onOpenSettings: () => void;
  onOpenDoctorShare?: () => void;
  onOpenPro?: () => void;
  onOpenRunOnPhone?: () => void;
  onOpenLandingPage?: () => void;
  syncCode?: string;
  isSyncing?: boolean;
  currentAvatar?: string;
  onOpenAvatarSelector?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  isSeniorMode,
  onOpenAssistant,
  onOpenSettings,
  onOpenDoctorShare,
  onOpenPro,
  onOpenRunOnPhone,
  onOpenLandingPage,
  syncCode,
  isSyncing,
  currentAvatar,
  onOpenAvatarSelector,
}) => {
  const t = translations[lang] || translations.pl;

  return (
    <header className="no-print sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-colors">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:px-6 sm:py-2.5">
        
        {/* App Branding - Simple & Focused */}
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onOpenAvatarSelector || onOpenSettings}
            className="group relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-xs border border-slate-300/80 dark:border-slate-700 bg-slate-950 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Kliknij, aby zmienić awatar aplikacji"
          >
            <img
              src={currentAvatar || '/pulsify_avatar.png'}
              alt="Pulsivio Logo"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-center"
            />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 translate="no" className="notranslate text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white truncate">
                {t.appName}
              </h1>
              {isSeniorMode && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-extrabold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  👴 {t.seniorBadge}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Clean, Focused Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

          {/* Quick "Synchronizacja PC <-> Telefon" button */}
          {onOpenRunOnPhone && (
            <button
              type="button"
              onClick={onOpenRunOnPhone}
              id="header-run-on-phone-btn"
              className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-2 sm:px-2.5 py-1.5 text-xs sm:text-sm font-bold text-sky-700 hover:bg-sky-100 dark:border-sky-900 dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-900/50 transition-colors cursor-pointer shadow-2xs"
              title={lang === 'pl' ? 'Synchronizacja PC ↔ Telefon (Kod / QR)' : 'Sync PC ↔ Phone (Code / QR)'}
            >
              <Cloud className={`h-4 w-4 text-sky-600 dark:text-sky-400 ${isSyncing ? 'animate-pulse' : ''}`} />
              <span className="hidden sm:inline">PC ↔ Telefon</span>
              {syncCode && (
                <span className="hidden lg:inline text-[10px] font-mono font-bold bg-sky-200 dark:bg-sky-900 text-sky-800 dark:text-sky-200 px-1.5 py-0.5 rounded-md">
                  {syncCode}
                </span>
              )}
            </button>
          )}

          {/* Doctor Share Quick Button */}
          {onOpenDoctorShare && (
            <button
              type="button"
              onClick={onOpenDoctorShare}
              id="header-doctor-share-btn"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-2 sm:px-2.5 py-1.5 text-xs sm:text-sm font-bold text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors cursor-pointer"
              title={lang === 'pl' ? 'Udostępnij lekarzowi' : 'Share with doctor'}
            >
              <Stethoscope className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline whitespace-nowrap">{lang === 'pl' ? 'Lekarz' : 'Doctor'}</span>
            </button>
          )}

          {/* Voice Assistant Quick Mic */}
          <button
            type="button"
            onClick={onOpenAssistant}
            id="header-voice-assistant-btn"
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-2 sm:px-2.5 py-1.5 text-xs sm:text-sm font-bold text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-900/50 transition-colors cursor-pointer"
            title={t.assistantVoiceBtn}
          >
            <Mic className="h-4 w-4 animate-pulse text-rose-600 dark:text-rose-400" />
            <span className="hidden sm:inline whitespace-nowrap">{t.assistantVoiceBtn}</span>
          </button>

          {/* Landing / Presentation Page Quick Link */}
          {onOpenLandingPage && (
            <button
              type="button"
              onClick={onOpenLandingPage}
              id="header-landing-btn"
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/90 px-2 sm:px-2.5 py-1.5 text-xs sm:text-sm font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60 transition-all cursor-pointer shadow-2xs active:scale-95"
              title={lang === 'pl' ? 'O projekcie i funkcjach (Prezentacja)' : 'About project'}
            >
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden lg:inline whitespace-nowrap">{lang === 'pl' ? 'O Pulsivio' : 'About'}</span>
            </button>
          )}

          {/* Settings Button - Opens dedicated settings modal */}
          <button
            type="button"
            onClick={onOpenSettings}
            id="header-settings-btn"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 sm:px-2.5 py-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 shadow-xs cursor-pointer transition-all active:scale-95"
            title={t.settingsTitle || 'Ustawienia'}
          >
            <Settings className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            <span className="hidden md:inline">
              {t.settingsBtn || 'Ustawienia'}
            </span>
          </button>

        </div>

      </div>
    </header>
  );
};
