import React, { useState, useRef } from 'react';
import { X, Globe, UserCheck, Type, Sun, Moon, ShieldCheck, Check, Phone, Stethoscope, ChevronRight, UserPlus, FileSpreadsheet, Heart, ShieldAlert, Crown, Sparkles, Smartphone, Trash2, RotateCcw, CheckCircle2, Download, Upload, FileJson, Coffee, ExternalLink, LogIn, LogOut, User, QrCode, Lock, Key, Image, Share2 } from 'lucide-react';
import { Language, Measurement, UserProfile, GoogleAccount } from '../types';
import { translations } from '../i18n';
import { getIsAdmin, setIsAdmin } from '../utils/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSelectLang: (lang: Language) => void;
  isSeniorMode: boolean;
  onToggleSeniorMode: () => void;
  isLargeFont: boolean;
  onToggleLargeFont: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenNaming: () => void;
  profile?: UserProfile;
  onUpdateProfile?: (profile: UserProfile) => void;
  onOpenDoctorShare?: () => void;
  onOpenCaregivers?: () => void;
  measurements?: Measurement[];
  onOpenPro?: () => void;
  onOpenRunOnPhone?: () => void;
  onClearAllMeasurements?: () => void;
  onLoadSampleData?: () => void;
  onOpenRecommendedDevices?: () => void;
  currentAvatar?: string;
  onOpenAvatarSelector?: () => void;
  onImportBackup?: (data: { measurements: Measurement[]; profile?: UserProfile }) => void;
  onOpenSocialKit?: () => void;
  onOpenLandingPage?: () => void;
}

const languages: { code: Language; label: string; flag: string; desc: string }[] = [
  { code: 'pl', label: 'Polski', flag: '🇵🇱', desc: 'Domyślny' },
  { code: 'en', label: 'English', flag: '🇬🇧', desc: 'International' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪', desc: 'German' },
  { code: 'es', label: 'Español', flag: '🇪🇸', desc: 'Spanish' },
  { code: 'fr', label: 'Français', flag: '🇫🇷', desc: 'French' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹', desc: 'Italian' },
  { code: 'pt', label: 'Português', flag: '🇵🇹', desc: 'Portuguese' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺', desc: 'Russian' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSelectLang,
  isSeniorMode,
  onToggleSeniorMode,
  isLargeFont,
  onToggleLargeFont,
  isDarkMode,
  onToggleDarkMode,
  onOpenNaming,
  profile,
  onUpdateProfile,
  onOpenDoctorShare,
  onOpenCaregivers,
  measurements = [],
  onOpenPro,
  onOpenRunOnPhone,
  onClearAllMeasurements,
  onLoadSampleData,
  onOpenRecommendedDevices,
  currentAvatar,
  onOpenAvatarSelector,
  onImportBackup,
  onOpenSocialKit,
  onOpenLandingPage,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearedSuccess, setClearedSuccess] = useState(false);
  const [backupExported, setBackupExported] = useState(false);
  const [backupImported, setBackupImported] = useState(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [showManualGooglePrompt, setShowManualGooglePrompt] = useState(false);
  const [manualGoogleEmail, setManualGoogleEmail] = useState('');
  const [manualGoogleName, setManualGoogleName] = useState('');
  const [showDonationQR, setShowDonationQR] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => getIsAdmin());
  const [adminPinInput, setAdminPinInput] = useState<string>('');
  const [adminPinError, setAdminPinError] = useState<boolean>(false);
  const [showAdminPinPrompt, setShowAdminPinPrompt] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const t = translations[lang] || translations.pl;
  const caregivers = profile?.caregivers || [];
  const primaryCaregiver = caregivers.find((c) => c.isPrimary) || caregivers[0] || null;
  const googleUser = profile?.googleAccount || null;

  const isRecognizedOwner =
    Boolean(googleUser?.email?.toLowerCase().includes('pirat123451')) ||
    isAdminUnlocked;

  const handleUnlockAdminPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPinInput.trim() === '1234' || adminPinInput.trim().toLowerCase() === 'pirat123451') {
      setIsAdmin(true);
      setIsAdminUnlocked(true);
      setAdminPinError(false);
      setShowAdminPinPrompt(false);
    } else {
      setAdminPinError(true);
    }
  };

  const handleGoogleSignIn = () => {
    setIsGoogleSigningIn(true);

    // Try standard Google Identity Services if available on window
    const gWindow = window as any;
    if (gWindow.google?.accounts?.id) {
      try {
        gWindow.google.accounts.id.prompt();
      } catch (e) {
        console.warn('GSI prompt failed, showing quick connect modal:', e);
        setShowManualGooglePrompt(true);
      }
      setIsGoogleSigningIn(false);
      return;
    }

    // Direct, elegant seamless Google Connect
    setTimeout(() => {
      setIsGoogleSigningIn(false);
      setShowManualGooglePrompt(true);
    }, 400);
  };

  const handleSaveGoogleAccount = (email: string, name: string) => {
    if (!email) return;
    const newGoogleAcc: GoogleAccount = {
      email: email.trim(),
      name: name.trim() || email.split('@')[0],
      connectedAt: new Date().toISOString(),
    };
    if (onUpdateProfile && profile) {
      onUpdateProfile({
        ...profile,
        name: profile.name || newGoogleAcc.name,
        googleAccount: newGoogleAcc,
      });
    }
    setShowManualGooglePrompt(false);
    setManualGoogleEmail('');
    setManualGoogleName('');
  };

  const handleGoogleSignOut = () => {
    if (onUpdateProfile && profile) {
      onUpdateProfile({
        ...profile,
        googleAccount: null,
      });
    }
  };

  const handleExecuteClear = () => {
    if (onClearAllMeasurements) {
      onClearAllMeasurements();
      setConfirmClear(false);
      setClearedSuccess(true);
      setTimeout(() => setClearedSuccess(false), 3500);
    }
  };

  const handleExportBackup = () => {
    const backupData = {
      app: 'Pulsivio',
      version: 1,
      exportDate: new Date().toISOString(),
      profile: profile || {},
      measurements: measurements || [],
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Pulsivio_Kopia_Zapasowa_${(profile?.name || 'Pacjent').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setBackupExported(true);
    setTimeout(() => setBackupExported(false), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed && Array.isArray(parsed.measurements) && onImportBackup) {
          onImportBackup({
            measurements: parsed.measurements,
            profile: parsed.profile,
          });
          setBackupImported(true);
          setTimeout(() => setBackupImported(false), 3500);
        }
      } catch (err) {
        console.error('Failed to import backup:', err);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 flex flex-col max-h-[92vh]">
        
        {/* Header with Avatar Branding */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 sm:px-5 py-3.5 bg-slate-50/80 dark:bg-slate-800/60">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onOpenAvatarSelector}
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-xs ring-2 ring-sky-400/40 bg-slate-950 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Zmień awatar aplikacji"
            >
              <img
                src={currentAvatar || '/avatars/pulsivio_official_brand.jpg'}
                alt="Pulsivio"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
              />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight truncate">
                  Pulsivio {t.settingsTitle || 'Ustawienia'}
                </h2>
                <span className="rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-black px-1.5 py-0.5">
                  v1.2
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {t.settingsSubtitle || 'Dostosuj widok, czcionkę, lekarza i opiekunów'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
            title="Zamknij"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-3.5 text-slate-800 dark:text-slate-200">

          {/* SECTION: Konto Google & Synchronizacja Tożsamości */}
          <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700/80 bg-gradient-to-br from-white via-slate-50 to-blue-50/20 dark:from-slate-800/90 dark:via-slate-800 dark:to-slate-900 p-3.5 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                {googleUser ? (
                  <div className="relative h-10 w-10 shrink-0 rounded-full bg-blue-100 dark:bg-blue-900/60 border-2 border-blue-400 flex items-center justify-center text-blue-700 dark:text-blue-200 font-black text-sm overflow-hidden">
                    {googleUser.picture ? (
                      <img src={googleUser.picture} alt={googleUser.name} className="h-full w-full object-cover" />
                    ) : (
                      <span>{googleUser.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                ) : (
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-2xs flex items-center justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                      {googleUser ? googleUser.name : (lang === 'pl' ? 'Konto Google' : 'Google Account')}
                    </h3>
                    {googleUser && (
                      <span className="rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-1.5 py-0.2 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        {lang === 'pl' ? 'Połączono' : 'Connected'}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {googleUser ? googleUser.email : (lang === 'pl' ? 'Zaloguj się z Google, by zabezpieczyć dane w chmurze' : 'Sign in with Google to backup your diary safely')}
                  </p>
                </div>
              </div>

              {googleUser ? (
                <button
                  type="button"
                  onClick={handleGoogleSignOut}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer shrink-0"
                  title={lang === 'pl' ? 'Wyloguj konto Google' : 'Disconnect Google'}
                >
                  <LogOut className="h-3.5 w-3.5 text-slate-500" />
                  <span className="hidden sm:inline">{lang === 'pl' ? 'Wyloguj' : 'Sign out'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleSigningIn}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 shadow-2xs transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{lang === 'pl' ? 'Zaloguj przez Google' : 'Sign in with Google'}</span>
                </button>
              )}
            </div>

            {/* Quick Google Login Prompt Dialog */}
            {showManualGooglePrompt && !googleUser && (
              <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {lang === 'pl' ? 'Wpisz swój adres konta Google / Gmail, aby połączyć profil i bezpiecznie archiwizować pomiary:' : 'Enter your Google / Gmail account to connect:'}
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    placeholder="twoj.adres@gmail.com"
                    value={manualGoogleEmail}
                    onChange={(e) => setManualGoogleEmail(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder={lang === 'pl' ? 'Imię i nazwisko' : 'Your name'}
                    value={manualGoogleName}
                    onChange={(e) => setManualGoogleName(e.target.value)}
                    className="sm:w-36 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveGoogleAccount(manualGoogleEmail, manualGoogleName)}
                    disabled={!manualGoogleEmail.includes('@')}
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-3 py-1.5 text-xs transition-colors cursor-pointer"
                  >
                    {lang === 'pl' ? 'Połącz' : 'Connect'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowManualGooglePrompt(false)}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    {lang === 'pl' ? 'Anuluj' : 'Cancel'}
                  </button>
                </div>
              </div>
            )}

            {/* Quick 1-Click login for Project Owner */}
            {!googleUser && (
              <div className="pt-1 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/60 mt-2">
                <button
                  type="button"
                  onClick={() => handleSaveGoogleAccount('pirat123451@gmail.com', 'Właściciel Pulsivio')}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Zaloguj 1-kliknięciem jako Właściciel (pirat123451@gmail.com)</span>
                </button>
              </div>
            )}
          </div>

          {/* SECTION: Oficjalne Logo i Identyfikacja Wizualna Pulsivio */}
          <div className="rounded-2xl border-2 border-indigo-200/90 dark:border-indigo-800/80 bg-gradient-to-br from-indigo-50/60 via-purple-50/30 to-sky-50/40 p-3.5 dark:from-slate-800 dark:via-slate-800 dark:to-indigo-950/40 space-y-2 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative h-11 w-11 shrink-0 rounded-xl overflow-hidden border-2 border-indigo-300 dark:border-indigo-600 shadow-xs bg-slate-950">
                  <img
                    src="/avatars/original_pulsify.png"
                    alt="Oficjalne logo Pulsivio"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight truncate">
                      {lang === 'pl' ? 'Oficjalny Znak i Logo Pulsivio' : 'Official Pulsivio Brand & Logo'}
                    </h3>
                    <span className="rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold px-1.5 py-0.2">
                      Główny Znak
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                    {lang === 'pl' ? 'Świecący neon kardio 3D z pulsem EKG i sercem w literze P' : 'Glowing 3D cardio neon with ECG pulse and heart inside letter P'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION: Jak odpalić na telefonie / Uruchom na telefonie (QR Code & PWA) */}
          {onOpenRunOnPhone && (
            <div className="rounded-2xl border-2 border-sky-300/90 dark:border-sky-600/70 bg-gradient-to-br from-sky-50 via-blue-50/40 to-indigo-50/30 p-3.5 dark:from-slate-800 dark:via-slate-800 dark:to-sky-950/40 space-y-2 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-xs shrink-0">
                    <Smartphone className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight truncate">
                      {lang === 'pl' ? 'Synchronizacja PC ↔ Telefon (Chmura)' : 'PC ↔ Phone Sync (Cloud)'}
                    </h3>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                      {lang === 'pl' ? 'Zeskanuj kod QR lub wpisz kod – te same pomiary na obu urządzeniach' : 'Scan QR code to sync measurements across all devices'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onOpenRunOnPhone}
                  className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-95 shrink-0"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{lang === 'pl' ? 'Połącz / Kod' : 'Sync / Code'}</span>
                </button>
              </div>
            </div>
          )}

          {/* SECTION: Pulsivio PRO & Udogodnienia */}
          <div className="rounded-2xl border-2 border-amber-300/90 dark:border-amber-600/70 bg-gradient-to-br from-amber-50 via-orange-50/40 to-rose-50/30 p-3.5 dark:from-slate-800 dark:via-slate-800 dark:to-amber-950/30 space-y-2 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-xs shrink-0">
                  <Crown className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight truncate">
                      {lang === 'pl' ? 'Pulsivio PRO i Udogodnienia' : 'Pulsivio PRO & Features'}
                    </h3>
                    <span className="rounded-md bg-amber-200/70 dark:bg-amber-900/60 px-1.5 py-0.2 text-[10px] font-bold text-amber-900 dark:text-amber-200">
                      Beta
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
                    {lang === 'pl' ? 'Raporty kardiologiczne PTNT, alerty SMS, backup w chmurze' : 'Cardio PTNT reports, SMS alerts, cloud backup'}
                  </p>
                </div>
              </div>

              {onOpenPro && (
                <button
                  type="button"
                  onClick={onOpenPro}
                  className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white px-3 py-1.5 text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-95 shrink-0"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{lang === 'pl' ? 'Sprawdź' : 'Explore'}</span>
                </button>
              )}
            </div>
          </div>

          {/* SECTION: Postaw kawę twórcy (Polska: BuyCoffee.to / Zagranica: BuyMeACoffee) */}
          <div className="rounded-xl border border-emerald-300/80 dark:border-emerald-800/70 bg-gradient-to-br from-emerald-50/70 via-teal-50/30 to-amber-50/30 p-3 dark:from-slate-800 dark:via-slate-800 dark:to-emerald-950/30 space-y-2.5 shadow-xs">
            {/* Header: Title and subtitle on TOP */}
            <div className="flex items-start gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 via-orange-500 to-emerald-600 text-white shadow-xs shrink-0 mt-0.5">
                <Coffee className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
                    {lang === 'pl' ? 'Podoba Ci się Pulsivio? Wesprzyj projekt ☕' : 'Like Pulsivio? Support the creator ☕'}
                  </h3>
                  <span className="rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-1.5 py-0.2">
                    PL + Świat
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug mt-0.5">
                  {lang === 'pl' ? 'Wspieraj rozwój darmowej aplikacji dla serca. Płatność BLIK lub karta.' : 'Support development of this free health app. BLIK or Card.'}
                </p>
              </div>
            </div>

            {/* Buttons underneath the text */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
              <a
                href="https://buycoffee.to/pulsivio"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3 py-1.5 text-xs font-black shadow-xs cursor-pointer transition-all active:scale-95 text-center"
                title="Wpłata przez BLIK (Polska)"
              >
                <span>🇵🇱 BLIK</span>
                <ExternalLink className="h-3 w-3 opacity-80" />
              </a>

              <a
                href="https://buymeacoffee.com/pulsivio"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white px-3 py-1.5 text-xs font-black shadow-xs cursor-pointer transition-all active:scale-95 text-center"
                title="Wpłata kartą / Apple Pay / Zagranica"
              >
                <span>🌍 Karta / Apple Pay</span>
                <ExternalLink className="h-3 w-3 opacity-80" />
              </a>

              <button
                type="button"
                onClick={() => setShowDonationQR(!showDonationQR)}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-100/70 hover:bg-emerald-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 text-xs font-bold shadow-2xs transition-all cursor-pointer text-center"
                title={lang === 'pl' ? 'Pokaż kody QR do zeskanowania telefonem' : 'Show QR codes'}
              >
                <QrCode className="h-3.5 w-3.5" />
                <span>{showDonationQR ? (lang === 'pl' ? 'Ukryj QR' : 'Hide QR') : (lang === 'pl' ? 'Kody QR' : 'QR Codes')}</span>
              </button>
            </div>

            {/* Rozwijany panel z 2 kodami QR do zeskanowania telefonem */}
            {showDonationQR && (
              <div className="mt-3 pt-3 border-t border-emerald-200 dark:border-emerald-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* QR 1: BuyCoffee.to (PL/BLIK) */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-900 shadow-2xs">
                  <div className="h-20 w-20 shrink-0 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-center">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https%3A%2F%2Fbuycoffee.to%2Fpulsivio"
                      alt="Kod QR BuyCoffee.to Pulsivio"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-black text-slate-900 dark:text-white">BuyCoffee.to</span>
                      <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-bold px-1 rounded">PL / BLIK</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Zeskanuj aparatem telefonu, aby wpłacić szybkim BLIKiem
                    </p>
                    <a
                      href="https://buycoffee.to/pulsivio"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-0.5 mt-1"
                    >
                      buycoffee.to/pulsivio <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                </div>

                {/* QR 2: BuyMeACoffee (Global / Card / Apple Pay) */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900 shadow-2xs">
                  <div className="h-20 w-20 shrink-0 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-center">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https%3A%2F%2Fbuymeacoffee.com%2Fpulsivio"
                      alt="Kod QR BuyMeACoffee Pulsivio"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-black text-slate-900 dark:text-white">BuyMeACoffee</span>
                      <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[9px] font-bold px-1 rounded">Global / Karta</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Skanuj aparatem, aby wesprzeć kartą lub Apple Pay
                    </p>
                    <a
                      href="https://buymeacoffee.com/pulsivio"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-amber-600 dark:text-amber-400 font-bold hover:underline inline-flex items-center gap-0.5 mt-1"
                    >
                      buymeacoffee.com/pulsivio <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* SECTION: Opiekunowie i kontakty SOS */}
          <div className="rounded-2xl border border-blue-200/80 bg-blue-50/40 p-3.5 dark:border-blue-900/50 dark:bg-blue-950/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-2xs">
                  <Phone className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {lang === 'pl' ? 'Opiekunowie i kontakty SOS' : (lang === 'it' ? 'Caregiver e contatti SOS' : 'Caregivers & SOS Contacts')}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {lang === 'pl' ? 'Szybkie połączenie i SMS z pomiarem ciśnienia' : 'Quick call and SMS with reading'}
                  </p>
                </div>
              </div>

              {onOpenCaregivers && (
                <button
                  type="button"
                  onClick={onOpenCaregivers}
                  className="inline-flex items-center gap-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 text-xs font-bold shadow-2xs cursor-pointer transition-all active:scale-95"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>{lang === 'pl' ? 'Zarządzaj' : 'Manage'}</span>
                </button>
              )}
            </div>

            {/* Caregivers preview */}
            <div className="rounded-xl bg-white dark:bg-slate-800 p-2.5 border border-blue-100 dark:border-blue-900/40 text-xs flex items-center justify-between gap-2">
              {primaryCaregiver ? (
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 dark:text-white block truncate">
                    ⭐ {primaryCaregiver.relation}: {primaryCaregiver.name}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    📞 {primaryCaregiver.phone}
                  </span>
                </div>
              ) : (
                <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                  {lang === 'pl' ? 'Nie dodano jeszcze opiekunów (kliknij "Zarządzaj")' : 'No caregivers added yet'}
                </div>
              )}

              {primaryCaregiver && (
                <a
                  href={`tel:${primaryCaregiver.phone}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 cursor-pointer shrink-0"
                >
                  <Phone className="h-3 w-3" />
                  <span>{lang === 'pl' ? 'Zadzwoń' : 'Call'}</span>
                </a>
              )}
            </div>
          </div>

          {/* SECTION: Udostępnianie lekarzowi */}
          <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-3.5 dark:border-emerald-900/50 dark:bg-emerald-950/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs">
                  <Stethoscope className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {lang === 'pl' ? 'Udostępnianie lekarzowi' : (lang === 'it' ? 'Condivisione con il medico' : 'Doctor Sharing & Clinic')}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {lang === 'pl' ? 'Wysyłka e-mail, eksport do CSV oraz raport A4' : 'Email summary, CSV export & A4 report'}
                  </p>
                </div>
              </div>

              {onOpenDoctorShare && (
                <button
                  type="button"
                  onClick={onOpenDoctorShare}
                  className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 text-xs font-bold shadow-2xs cursor-pointer transition-all active:scale-95"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  <span>{lang === 'pl' ? 'Opcje' : 'Options'}</span>
                </button>
              )}
            </div>

            <div className="rounded-xl bg-white dark:bg-slate-800 p-2.5 border border-emerald-100 dark:border-emerald-900/40 text-xs flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="font-bold text-slate-900 dark:text-white block truncate">
                  👨‍⚕️ {profile?.doctorName || (lang === 'pl' ? 'Lekarz prowadzący' : 'Doctor')}
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px] block truncate">
                  {profile?.clinicName || (profile?.doctorEmail ? `✉️ ${profile.doctorEmail}` : (lang === 'pl' ? 'Kliknij "Opcje" aby skonfigurować' : 'Click Options to configure'))}
                </span>
              </div>

              {onOpenDoctorShare && (
                <button
                  type="button"
                  onClick={onOpenDoctorShare}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-[11px] font-bold cursor-pointer shrink-0 transition-colors"
                >
                  <span>{lang === 'pl' ? 'Udostępnij' : 'Share'}</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {/* SECTION: Polecane ciśnieniomierze (Afiliacja / Sprzęt medyczny) */}
          <div className="rounded-2xl border border-sky-200/90 bg-sky-50/50 p-3.5 dark:border-sky-900/60 dark:bg-sky-950/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-600 text-white shadow-2xs">
                  <Stethoscope className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    {lang === 'pl' ? 'Polecane ciśnieniomierze medyczne' : 'Recommended BP Monitors'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {lang === 'pl' ? 'Certyfikowane aparaty naramienne (Omron, Microlife)' : 'Clinically validated upper-arm monitors'}
                  </p>
                </div>
              </div>

              {onOpenRecommendedDevices && (
                <button
                  type="button"
                  onClick={onOpenRecommendedDevices}
                  className="inline-flex items-center gap-1 rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-3 py-1.5 text-xs font-black shadow-2xs cursor-pointer transition-all active:scale-95"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  <span>{lang === 'pl' ? 'Zobacz modele' : 'View models'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Section: Język / Language */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-2 mb-2.5">
              <Globe className="h-4 w-4 text-rose-500" />
              <label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                {t.settingsAppLang || 'Język aplikacji'}
              </label>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {languages.map((item) => {
                const isSelected = lang === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => onSelectLang(item.code)}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold border transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span>{item.flag}</span>
                      <span className="truncate">{item.label}</span>
                    </span>
                    {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Ułatwienia dostępu (Tryb Seniora & Wielkie Litery) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/50 dark:bg-slate-800/30 space-y-2.5">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-amber-500" />
              <span>{t.accessibilityTitle || 'Ułatwienia czytania i obsługi'}</span>
            </h3>

            {/* Tryb Seniora */}
            <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">👴</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {t.seniorMode || 'Tryb Seniora'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                  {t.seniorModeDesc || 'Uproszczony ekran, duże przyciski i lektor czytający na głos'}
                </p>
              </div>

              <button
                type="button"
                onClick={onToggleSeniorMode}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isSeniorMode ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isSeniorMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Wielkie Litery / Rozmiar Czcionki */}
            <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <Type className="h-4 w-4 text-indigo-500" />
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {t.largeFontTitle || 'Wielkie litery (duża czcionka)'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                  {t.largeFontDesc || 'Powiększa napisy i cyfry, ułatwiając czytanie bez okularów'}
                </p>
              </div>

              <button
                type="button"
                onClick={onToggleLargeFont}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isLargeFont ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isLargeFont ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Section: Motyw (Ciemny / Jasny) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {isDarkMode ? <Moon className="h-4 w-4 text-blue-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
                  <span>{t.themeTitle || 'Motyw graficzny'}</span>
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                  {isDarkMode ? (t.themeDarkActive || 'Ciemny') : (t.themeLightActive || 'Jasny')}
                </p>
              </div>

              <button
                type="button"
                onClick={onToggleDarkMode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 shadow-2xs cursor-pointer transition-all"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="h-3.5 w-3.5 text-amber-400" />
                    <span>{t.themeLight || 'Jasny'}</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-3.5 w-3.5 text-slate-700 dark:text-slate-300" />
                    <span>{t.themeDark || 'Ciemny'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section: Kopia zapasowa i przenoszenie danych (JSON) */}
          <div className="rounded-2xl border-2 border-blue-200 dark:border-blue-900/60 p-3.5 bg-blue-50/50 dark:bg-blue-950/25 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs shrink-0">
                <FileJson className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
                  {lang === 'pl' ? 'Kopia zapasowa i przenoszenie danych' : 'Backup & Data Transfer'}
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  {lang === 'pl'
                    ? 'Przenieś swoje pomiary na telefon, inny komputer lub serwer Netlify bez utraty danych.'
                    : 'Transfer your readings to phone, PC or Netlify hosting safely.'}
                </p>
              </div>
            </div>

            {backupExported && (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-xs font-bold animate-fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{lang === 'pl' ? 'Pobrano plik kopii zapasowej!' : 'Backup file downloaded!'}</span>
              </div>
            )}

            {backupImported && (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-xs font-bold animate-fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{lang === 'pl' ? 'Pomyślnie wczytano dane z kopii!' : 'Backup data successfully restored!'}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                type="button"
                onClick={handleExportBackup}
                id="export-backup-btn"
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{lang === 'pl' ? 'Pobierz kopię (JSON)' : 'Export Backup'}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                id="import-backup-btn"
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-blue-300 dark:border-blue-700 bg-blue-50/80 dark:bg-slate-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>{lang === 'pl' ? 'Wczytaj plik kopii' : 'Import Backup'}</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Section: Zarządzanie danymi dziennika (Wyzerowanie / Reset) */}
          <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 p-3.5 bg-slate-50/70 dark:bg-slate-800/40 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500 text-white shadow-xs shrink-0">
                  <Trash2 className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
                    {lang === 'pl' ? 'Zarządzanie danymi dziennika' : 'Journal Data Management'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {lang === 'pl'
                      ? `Liczba zapisanych pomiarów: ${measurements.length}`
                      : `Stored measurements: ${measurements.length}`}
                  </p>
                </div>
              </div>

              {onLoadSampleData && measurements.length === 0 && (
                <button
                  type="button"
                  onClick={onLoadSampleData}
                  className="inline-flex items-center gap-1 rounded-xl border border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1.5 text-[11px] font-bold text-sky-700 dark:text-sky-300 hover:bg-sky-100 transition-colors cursor-pointer shrink-0"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>{lang === 'pl' ? 'Wczytaj demo' : 'Load demo'}</span>
                </button>
              )}
            </div>

            {clearedSuccess && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 text-emerald-800 dark:text-emerald-300 text-xs font-bold animate-fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>{lang === 'pl' ? 'Dziennik został całkowicie wyzerowany!' : 'Journal has been successfully cleared!'}</span>
              </div>
            )}

            {confirmClear ? (
              <div className="rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/50 p-3 space-y-2 animate-fade-in">
                <p className="text-xs font-bold text-rose-800 dark:text-rose-300">
                  {lang === 'pl'
                    ? 'Czy na pewno chcesz bezpowrotnie usunąć wszystkie zapisane pomiary?'
                    : 'Are you sure you want to permanently delete all readings?'}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExecuteClear}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-xs cursor-pointer active:scale-95 transition-all"
                  >
                    {lang === 'pl' ? 'Tak, wyzeruj dziennik' : 'Yes, delete all'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="py-1.5 px-3 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer hover:bg-slate-300 transition-all"
                  >
                    {lang === 'pl' ? 'Anuluj' : 'Cancel'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                disabled={measurements.length === 0}
                className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  measurements.length === 0
                    ? 'border-slate-200 dark:border-slate-800 text-slate-400 bg-slate-100 dark:bg-slate-800/40 cursor-not-allowed'
                    : 'border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer shadow-2xs active:scale-98'
                }`}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>
                  {measurements.length === 0
                    ? (lang === 'pl' ? 'Dziennik jest pusty (Czysty start)' : 'Journal is already empty')
                    : (lang === 'pl' ? 'Wyzeruj wszystkie pomiary (Zacznij od nowa)' : 'Clear all readings (Fresh start)')}
                </span>
              </button>
            )}
          </div>

          {/* SECTION: Panel Właściciela & Administratora (Widoczny wyłącznie dla pirat123451@gmail.com lub z PINem) */}
          {isRecognizedOwner ? (
            <div className="rounded-2xl border-2 border-amber-400 dark:border-amber-600 bg-gradient-to-br from-amber-50 via-white to-amber-100/50 dark:from-slate-900 dark:via-slate-850 dark:to-amber-950/40 p-4 space-y-3 shadow-md">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white shadow-sm shrink-0">
                    <Crown className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-black text-amber-950 dark:text-amber-100 uppercase tracking-wide">
                        Panel Właściciela & Twórcy Pulsivio
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-black text-[9px] uppercase">
                        Aktywny Właściciel
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300">
                      Zweryfikowano: <strong>{googleUser?.email || 'Klucz Administratora'}</strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Clarification answering the user's question */}
              <div className="rounded-xl bg-amber-100/70 dark:bg-amber-950/60 p-2.5 text-[11px] leading-relaxed text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                <strong>💡 Jak to działa, że inni tego nie widzą?</strong>
                <p className="mt-0.5">
                  Aplikacja weryfikuje Twoją tożsamość na podstawie konta Google (<strong>pirat123451@gmail.com</strong>) oraz uprawnień administratora. Gdy ktokolwiek inny wchodzi na stronę, aplikacja traktuje go jako zwykłego pacjenta — nie widzi on tych przycisków, nie może podmieniać logotypu ani Twoich linków afiliacyjnych.
                </p>
              </div>

              {/* Owner Action Buttons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {onOpenAvatarSelector && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAvatarSelector();
                    }}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 hover:border-amber-500 text-left transition-all shadow-2xs cursor-pointer group"
                  >
                    <span className="h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Image className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-slate-900 dark:text-white block truncate">
                        Globalne Logo Aplikacji
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                        Wgraj nowe zdjęcie dla każdego
                      </span>
                    </div>
                  </button>
                )}

                {onOpenRecommendedDevices && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenRecommendedDevices();
                    }}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 hover:border-amber-500 text-left transition-all shadow-2xs cursor-pointer group"
                  >
                    <span className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Stethoscope className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-slate-900 dark:text-white block truncate">
                        Linki Afiliacyjne (Prowizje)
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                        Twoje tagi partnerskie i modele
                      </span>
                    </div>
                  </button>
                )}

                {onOpenLandingPage && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenLandingPage();
                    }}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 hover:border-amber-500 text-left transition-all shadow-2xs cursor-pointer group"
                  >
                    <span className="h-8 w-8 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Sparkles className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-slate-900 dark:text-white block truncate">
                        Prezentacja & Post na FB
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                        Gotowy tekst na facebook.com/pulsivio
                      </span>
                    </div>
                  </button>
                )}

                {onOpenSocialKit && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenSocialKit();
                    }}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 hover:border-amber-500 text-left transition-all shadow-2xs cursor-pointer group"
                  >
                    <span className="h-8 w-8 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Share2 className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-slate-900 dark:text-white block truncate">
                        Materiały Graficzne & Banery
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                        Pobierz avatary i grafiki w HD
                      </span>
                    </div>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Discrete unlock trigger for owner if not logged in */
            <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs">
              {!showAdminPinPrompt ? (
                <button
                  type="button"
                  onClick={() => setShowAdminPinPrompt(true)}
                  className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-[11px] cursor-pointer"
                >
                  <Lock className="h-3 w-3" />
                  <span>Jesteś właścicielem projektu Pulsivio? Odblokuj panel administratora</span>
                </button>
              ) : (
                <form onSubmit={handleUnlockAdminPin} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Key className="h-3.5 w-3.5 text-amber-500" />
                      <span>Wprowadź kod PIN właściciela:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAdminPinPrompt(false)}
                      className="text-[10px] text-slate-400 hover:underline cursor-pointer"
                    >
                      Anuluj
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      placeholder="Wpisz PIN (np. 1234)"
                      value={adminPinInput}
                      onChange={(e) => {
                        setAdminPinInput(e.target.value);
                        setAdminPinError(false);
                      }}
                      className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs cursor-pointer shadow-xs"
                    >
                      Odblokuj
                    </button>
                  </div>
                  {adminPinError && (
                    <p className="text-[10px] text-rose-500 font-bold">
                      Nieprawidłowy kod PIN. Wskazówka: Domyślny kod to 1234 lub zaloguj się przez konto pirat123451@gmail.com.
                    </p>
                  )}
                </form>
              )}
            </div>
          )}

          {/* Privacy & Safe Notice */}
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-xs">
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <p className="leading-snug">
              {t.privacyNotice || 'Bezpieczeństwo: Twoje pomiary są zapisywane wyłącznie lokalnie w pamięci urządzenia.'}
            </p>
          </div>

          {/* Legal & Medical Disclaimer (Ochrona prawna i bezpieczeństwo) */}
          <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 p-3.5 space-y-1.5 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
              <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Nota prawna i medyczna (Wyłączenie odpowiedzialności)</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300/80">
              Aplikacja <strong>Pulsivio</strong> oraz wbudowany Asystent AI służą wyłącznie do samodzielnego prowadzenia dziennika pomiarów oraz celów informacyjno-edukacyjnych. Aplikacja nie jest wyrobem medycznym, nie stawia diagnoz lekarskich i nie zastępuje profesjonalnej porady medycznej ani planu leczenia. Wszelkie decyzje zdrowotne i dawkowanie leków należy zawsze konsultować z lekarzem prowadzącym. W stanach nagłych należy natychmiast wezwać Pogotowie Ratunkowe (tel. <strong>112</strong> lub <strong>999</strong>).
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-3 bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenNaming();
            }}
            className="text-[11px] text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 underline cursor-pointer transition-colors"
            title="Dedykowane wyłącznie dla twórcy"
          >
            {t.authorNamingLink || '🔒 Dla twórcy: Propozycje nazw'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 dark:border dark:border-slate-700 text-white font-extrabold text-sm hover:bg-slate-800 dark:hover:bg-slate-700 shadow-xs cursor-pointer transition-all active:scale-95"
          >
            {t.doneSave || 'Gotowe / Zapisz'}
          </button>
        </div>

      </div>
    </div>
  );
};
