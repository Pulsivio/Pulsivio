import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { SeniorView } from './components/SeniorView';
import { MeasurementForm } from './components/MeasurementForm';
import { MeasurementsList } from './components/MeasurementsList';
import { ChartsView } from './components/ChartsView';
import { PrintableReport } from './components/PrintableReport';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { NamingIdeasModal } from './components/NamingIdeasModal';
import { SettingsModal } from './components/SettingsModal';
import { DoctorShareModal } from './components/DoctorShareModal';
import { CaregiverModal } from './components/CaregiverModal';
import { PulsivioProModal } from './components/PulsivioProModal';
import { RunOnPhoneModal } from './components/RunOnPhoneModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { RecommendedDevicesModal } from './components/RecommendedDevicesModal';
import { AvatarSelectorModal } from './components/AvatarSelectorModal';
import { EditMeasurementModal } from './components/EditMeasurementModal';
import { DoctorStandaloneView } from './components/DoctorStandaloneView';
import { LandingPageModal } from './components/LandingPageModal';
import { SocialMediaKitModal } from './components/SocialMediaKitModal';
import { AdBanner } from './components/AdBanner';
import { MobileAdManager } from './components/MobileAdManager';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { decodeDoctorData } from './utils/urlSharing';
import { ActiveTab, Language, Measurement, UserProfile } from './types';
import {
  getStoredLanguage,
  setStoredLanguage,
  getStoredSeniorMode,
  setStoredSeniorMode,
  getStoredLargeFont,
  setStoredLargeFont,
  getStoredProfile,
  setStoredProfile,
  getStoredMeasurements,
  setStoredMeasurements,
  clearStoredMeasurements,
  loadSampleMeasurements,
  getStoredSyncCode,
  setStoredSyncCode,
  generateSyncCode,
  getStoredSyncTimestamp,
  setStoredSyncTimestamp,
  getStoredAvatar,
  setStoredAvatar,
  getStoredDarkMode,
  setStoredDarkMode,
  getStoredProStatus,
  setStoredProStatus,
} from './utils/storage';
import { Plus, Mic, Heart, Smartphone } from 'lucide-react';
import { translations } from './i18n';

export default function App() {
  // State initialization
  const [lang, setLang] = useState<Language>(() => (getStoredLanguage() as Language) || 'pl');
  const [isSeniorMode, setIsSeniorMode] = useState<boolean>(() => getStoredSeniorMode());
  const [isLargeFont, setIsLargeFont] = useState<boolean>(() => getStoredLargeFont());
  const [isRunOnPhoneOpen, setIsRunOnPhoneOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => getStoredDarkMode());
  const [activeTab, setActiveTab] = useState<ActiveTab>('diary');
  const [prefilledDate, setPrefilledDate] = useState<string | undefined>(undefined);
  const [measurements, setMeasurements] = useState<Measurement[]>(() => getStoredMeasurements());
  const [profile, setProfile] = useState<UserProfile>(() => getStoredProfile());
  const [isDoctorView, setIsDoctorView] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.location.hash.includes('doctor') || window.location.search.includes('doctor_code');
  });

  // PRO Subscription status (removes AdSense ads & unlocks advanced reports)
  const [isPro, setIsPro] = useState<boolean>(() => getStoredProStatus().isPro);

  const handleTogglePro = (active: boolean, plan?: string) => {
    setIsPro(active);
    setStoredProStatus({
      isPro: active,
      plan: (plan as any) || 'yearly',
      activatedAt: Date.now(),
    });
  };

  // Cross-device sync state (PC <-> Phone)
  const [syncCode, setSyncCode] = useState<string>(() => {
    const existing = getStoredSyncCode();
    if (existing) return existing;
    const generated = generateSyncCode();
    setStoredSyncCode(generated);
    return generated;
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<number>(() => getStoredSyncTimestamp());

  // Modals
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [isNamingOpen, setIsNamingOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isDoctorShareOpen, setIsDoctorShareOpen] = useState<boolean>(false);
  const [isCaregiverOpen, setIsCaregiverOpen] = useState<boolean>(false);
  const [isProOpen, setIsProOpen] = useState<boolean>(false);
  const [isDevicesModalOpen, setIsDevicesModalOpen] = useState<boolean>(false);
  const [isLandingPageOpen, setIsLandingPageOpen] = useState<boolean>(false);
  const [isSocialKitOpen, setIsSocialKitOpen] = useState<boolean>(false);
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState<boolean>(false);
  const [avatar, setAvatar] = useState<string>(() => getStoredAvatar());
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = useState<boolean>(false);
  const [editingMeasurement, setEditingMeasurement] = useState<Measurement | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [showOnlineToast, setShowOnlineToast] = useState<boolean>(false);

  // Online / Offline synchronization listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineToast(true);
      setTimeout(() => setShowOnlineToast(false), 4000);
      const code = getStoredSyncCode();
      if (code) {
        pullFromServer(code);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync theme with document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Sync large font with document element
  useEffect(() => {
    if (isLargeFont) {
      document.documentElement.classList.add('large-font');
    } else {
      document.documentElement.classList.remove('large-font');
    }
  }, [isLargeFont]);

  const handleToggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    setStoredDarkMode(next);
  };

  const handleToggleLargeFont = () => {
    const next = !isLargeFont;
    setIsLargeFont(next);
    setStoredLargeFont(next);
  };

  const handleSelectLang = (newLang: Language) => {
    setLang(newLang);
    setStoredLanguage(newLang);
  };

  const handleToggleSeniorMode = () => {
    const next = !isSeniorMode;
    setIsSeniorMode(next);
    setStoredSeniorMode(next);
  };

  // Cloud Sync Functions (PC <-> Phone)
  const pushToServer = async (code: string, currentMeasurements: Measurement[], currentProfile: UserProfile) => {
    if (!code) return;
    try {
      setIsSyncing(true);
      const res = await fetch(`/api/sync/${code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ measurements: currentMeasurements, profile: currentProfile }),
      });
      if (res.ok) {
        const data = await res.json();
        const ts = data.lastUpdated || Date.now();
        setLastSyncTime(ts);
        setStoredSyncTimestamp(ts);
      }
    } catch (e) {
      console.warn('Sync push skipped (offline/error):', e);
    } finally {
      setIsSyncing(false);
    }
  };

  const pullFromServer = async (code: string, forceOverwrite = false) => {
    if (!code) return;
    try {
      setIsSyncing(true);
      const res = await fetch(`/api/sync/${code}`);
      if (res.ok) {
        const data = await res.json();
        if (data.measurements && Array.isArray(data.measurements)) {
          if (data.measurements.length > 0) {
            // Intelligent bidirectional merge: don't wipe local data, merge by ID!
            setMeasurements((prev) => {
              const map = new Map<string, Measurement>();
              prev.forEach((m) => map.set(m.id, m));
              data.measurements.forEach((m: Measurement) => map.set(m.id, m));
              const merged = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
              setStoredMeasurements(merged);
              return merged;
            });
          } else if (measurements.length > 0) {
            // If server room has no data, upload our local measurements
            await pushToServer(code, measurements, profile);
          }
          if (data.profile && (data.profile.name || data.profile.birthYear)) {
            setProfile(data.profile);
            setStoredProfile(data.profile);
          }
          const ts = data.lastUpdated || Date.now();
          setLastSyncTime(ts);
          setStoredSyncTimestamp(ts);
        } else if (measurements.length > 0) {
          // If server room has no data, upload our local measurements
          await pushToServer(code, measurements, profile);
        }
      }
    } catch (e) {
      console.warn('Sync pull skipped (offline/error):', e);
    } finally {
      setIsSyncing(false);
    }
  };

  // Detect URL parameter ?sync=..., ?doctor_code=..., or embedded data in #doctor
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Check if full data snapshot was embedded in the URL (for offline / Netlify static hosting)
    const decoded = decodeDoctorData(window.location.href);
    if (decoded) {
      if (decoded.measurements && decoded.measurements.length > 0) {
        setMeasurements(decoded.measurements);
        setStoredMeasurements(decoded.measurements);
      }
      if (decoded.profile) {
        setProfile((prev) => ({ ...prev, ...decoded.profile }));
        setStoredProfile({ ...getStoredProfile(), ...decoded.profile });
      }
      if (decoded.syncCode) {
        setSyncCode(decoded.syncCode);
        setStoredSyncCode(decoded.syncCode);
      }
      setIsDoctorView(true);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const doctorCode = urlParams.get('doctor_code');
    const codeParam = urlParams.get('sync');

    if (doctorCode) {
      const clean = doctorCode.trim().toUpperCase();
      setSyncCode(clean);
      setStoredSyncCode(clean);
      setIsDoctorView(true);
      pullFromServer(clean, true);
    } else if (codeParam && codeParam.trim().length >= 3) {
      const clean = codeParam.trim().toUpperCase();
      setSyncCode(clean);
      setStoredSyncCode(clean);
      const newUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, newUrl);
      pullFromServer(clean, true);
    } else {
      pullFromServer(syncCode, false);
    }

    const handleHashChange = () => {
      if (window.location.hash.includes('doctor')) {
        setIsDoctorView(true);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Periodic polling & on-window-focus sync
  useEffect(() => {
    if (!syncCode) return;
    const interval = setInterval(() => {
      pullFromServer(syncCode, false);
    }, 10000);

    const onFocus = () => {
      pullFromServer(syncCode, false);
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [syncCode]);

  const handleSetSyncCode = (newCode: string) => {
    const clean = newCode.trim().toUpperCase();
    setSyncCode(clean);
    setStoredSyncCode(clean);
    pullFromServer(clean, true);
  };

  const handleAddMeasurement = (data: Omit<Measurement, 'id' | 'timestamp'>) => {
    let timestamp = Date.now();
    if (data.date) {
      const dateStr = data.time ? `${data.date}T${data.time}` : `${data.date}T12:00:00`;
      const parsed = new Date(dateStr).getTime();
      if (!isNaN(parsed)) {
        timestamp = parsed;
      }
    }

    const newMeasurement: Measurement = {
      ...data,
      id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp,
    };

    const updated = [newMeasurement, ...measurements];
    setMeasurements(updated);
    setStoredMeasurements(updated);
    pushToServer(syncCode, updated, profile);

    if (!isSeniorMode) {
      setActiveTab('diary');
    }
  };

  const handleDeleteMeasurement = (id: string) => {
    const updated = measurements.filter((m) => m.id !== id);
    setMeasurements(updated);
    setStoredMeasurements(updated);
    pushToServer(syncCode, updated, profile);
  };

  const handleUpdateMeasurement = (updated: Measurement) => {
    const nextList = measurements.map((m) => (m.id === updated.id ? updated : m));
    setMeasurements(nextList);
    setStoredMeasurements(nextList);
    pushToServer(syncCode, nextList, profile);
  };

  const handleSelectAvatar = (url: string) => {
    setAvatar(url);
    setStoredAvatar(url);
  };

  const handleClearAllMeasurements = () => {
    clearStoredMeasurements();
    setMeasurements([]);
    pushToServer(syncCode, [], profile);
  };

  const handleLoadSampleData = () => {
    const samples = loadSampleMeasurements();
    setMeasurements(samples);
    setStoredMeasurements(samples);
    pushToServer(syncCode, samples, profile);
  };

  const handleUpdateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    setStoredProfile(newProfile);
    pushToServer(syncCode, measurements, newProfile);
  };

  const handleImportBackup = (data: { measurements: Measurement[]; profile?: UserProfile }) => {
    if (data.measurements && Array.isArray(data.measurements)) {
      setMeasurements(data.measurements);
      setStoredMeasurements(data.measurements);
    }
    if (data.profile) {
      setProfile((prev) => ({ ...prev, ...data.profile }));
      setStoredProfile({ ...getStoredProfile(), ...data.profile });
    }
    pushToServer(syncCode, data.measurements || measurements, data.profile || profile);
  };

  const t = translations[lang] || translations.pl;

  // The Core Application Content
  const appContent = (
    <div className="w-full flex-1 flex flex-col pb-28 sm:pb-8 transition-colors">
      
      {/* Offline Status Warning Bar */}
      {!isOnline && (
        <div className="bg-amber-500 text-slate-950 font-bold text-xs py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-xs">
          <span>⚠️ Tryb offline: Brak połączenia z internetem. Twoje pomiary zapisują się bezpiecznie w pamięci telefonu.</span>
        </div>
      )}

      {/* Online Back Toast */}
      {showOnlineToast && (
        <div className="bg-emerald-600 text-white font-bold text-xs py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-xs animate-fade-in">
          <span>✅ Połączono z siecią: Twoje dane są zsynchronizowane.</span>
        </div>
      )}

      {/* PWA Mobile Install Banner - only shows when not running as installed app */}
      <PWAInstallBanner lang={lang} />

      {/* Header with clean, focused controls and Settings button */}
      <Header
        lang={lang}
        isSeniorMode={isSeniorMode}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenDoctorShare={() => setIsDoctorShareOpen(true)}
        onOpenPro={() => setIsProOpen(true)}
        onOpenRunOnPhone={() => setIsRunOnPhoneOpen(true)}
        onOpenLandingPage={() => setIsLandingPageOpen(true)}
        onOpenSocialKit={() => setIsSocialKitOpen(true)}
        syncCode={syncCode}
        isSyncing={isSyncing}
        currentAvatar={avatar}
        onOpenAvatarSelector={() => setIsAvatarSelectorOpen(true)}
      />

      {/* Main Content Area */}
      {isSeniorMode ? (
        // Dedicated, simplified, high-contrast Senior View
        <main className="flex-1 w-full animate-fade-in">
          <SeniorView
            measurements={measurements}
            onAddMeasurement={handleAddMeasurement}
            onOpenAssistant={() => setIsAssistantOpen(true)}
            lang={lang}
            profile={profile}
            onOpenCaregivers={() => setIsCaregiverOpen(true)}
            onExitSeniorMode={() => {
              setIsSeniorMode(false);
              setStoredSeniorMode(false);
            }}
          />
        </main>
      ) : (
        // Standard View with Responsive Tabs
        <>
          <Navigation
            activeTab={activeTab}
            onSelectTab={(tab) => {
              if (tab === 'assistant') {
                setIsAssistantOpen(true);
              } else {
                setActiveTab(tab);
              }
            }}
            lang={lang}
          />

          <main className="flex-1 w-full animate-fade-in pb-24 sm:pb-8">
            {activeTab === 'diary' && (
              <MeasurementsList
                measurements={measurements}
                onDelete={handleDeleteMeasurement}
                onEdit={(item) => setEditingMeasurement(item)}
                onAddNewToDate={(date) => {
                  setPrefilledDate(date);
                  setActiveTab('add');
                }}
                onOpenRecommendedDevices={() => setIsDevicesModalOpen(true)}
                lang={lang}
              />
            )}

            {activeTab === 'add' && (
              <MeasurementForm
                onSave={(data) => {
                  handleAddMeasurement(data);
                  setPrefilledDate(undefined);
                }}
                lang={lang}
                initialDate={prefilledDate}
                onOpenVoiceAssistant={() => setIsAssistantOpen(true)}
              />
            )}

            {activeTab === 'trends' && (
              <ChartsView
                measurements={measurements}
                lang={lang}
              />
            )}

            {activeTab === 'report' && (
              <PrintableReport
                measurements={measurements}
                lang={lang}
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
                currentAvatar={avatar}
                syncCode={syncCode}
                onPushSync={() => pushToServer(syncCode, measurements, profile)}
                isDarkMode={isDarkMode}
                onToggleDarkMode={handleToggleDarkMode}
                onOpenDoctorMode={() => setIsDoctorView(true)}
              />
            )}

            {/* Dyskretny baner reklamowy Google AdSense - w 100% wyłączony dla subskrybentów PRO */}
            <AdBanner isPro={isPro} />
          </main>

          {/* Dyskretna stopka z wymogami AdSense i linkami prawnymi */}
          <footer className="print:hidden w-full py-4 px-4 pb-28 sm:pb-4 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-5xl mx-auto">
            <div className="flex items-center gap-1.5">
              <span>© {new Date().getFullYear()} Pulsivio. Wszelkie prawa zastrzeżone.</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPrivacyPolicyOpen(true)}
                className="hover:text-slate-700 dark:hover:text-slate-300 underline cursor-pointer"
              >
                {lang === 'pl' ? 'Polityka prywatności i cookies' : 'Privacy & Cookies'}
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setIsLandingPageOpen(true)}
                className="hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
              >
                {lang === 'pl' ? 'O projekcie' : 'About'}
              </button>
              <span>•</span>
              <a
                href="https://buycoffee.to/pulsivio"
                target="_blank"
                rel="noopener noreferrer"
                className="text-rose-500 hover:text-rose-600 font-medium"
              >
                BuyCoffee.to
              </a>
              <span>•</span>
              <a
                href="https://www.facebook.com/pulsivio/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[#1877F2] dark:text-blue-400 hover:underline font-semibold"
                title="Oficjalny profil Pulsivio na Facebooku"
              >
                <svg className="h-3.5 w-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </a>
            </div>
          </footer>
        </>
      )}

      {/* Modals */}
      <VoiceAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        lang={lang}
        recentReadings={measurements}
        onAddMeasurement={handleAddMeasurement}
        onDeleteMeasurement={handleDeleteMeasurement}
      />

      <NamingIdeasModal
        isOpen={isNamingOpen}
        onClose={() => setIsNamingOpen(false)}
        lang={lang}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        lang={lang}
        onSelectLang={handleSelectLang}
        isSeniorMode={isSeniorMode}
        onToggleSeniorMode={handleToggleSeniorMode}
        isLargeFont={isLargeFont}
        onToggleLargeFont={handleToggleLargeFont}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenNaming={() => setIsNamingOpen(true)}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        onOpenDoctorShare={() => {
          setIsSettingsOpen(false);
          setIsDoctorShareOpen(true);
        }}
        onOpenCaregivers={() => {
          setIsSettingsOpen(false);
          setIsCaregiverOpen(true);
        }}
        measurements={measurements}
        onOpenPro={() => {
          setIsSettingsOpen(false);
          setIsProOpen(true);
        }}
        onOpenRunOnPhone={() => {
          setIsSettingsOpen(false);
          setIsRunOnPhoneOpen(true);
        }}
        onClearAllMeasurements={handleClearAllMeasurements}
        onLoadSampleData={handleLoadSampleData}
        onOpenRecommendedDevices={() => {
          setIsSettingsOpen(false);
          setIsDevicesModalOpen(true);
        }}
        currentAvatar={avatar}
        onOpenAvatarSelector={() => {
          setIsSettingsOpen(false);
          setIsAvatarSelectorOpen(true);
        }}
        onImportBackup={handleImportBackup}
        onOpenLandingPage={() => {
          setIsSettingsOpen(false);
          setIsLandingPageOpen(true);
        }}
        onOpenSocialKit={() => {
          setIsSettingsOpen(false);
          setIsSocialKitOpen(true);
        }}
      />

      {/* Avatar Selection Modal */}
      <AvatarSelectorModal
        isOpen={isAvatarSelectorOpen}
        onClose={() => setIsAvatarSelectorOpen(false)}
        currentAvatar={avatar}
        onSelectAvatar={handleSelectAvatar}
        lang={lang}
      />

      {/* Edit Measurement Modal */}
      {editingMeasurement && (
        <EditMeasurementModal
          measurement={editingMeasurement}
          isOpen={!!editingMeasurement}
          onClose={() => setEditingMeasurement(null)}
          onSave={handleUpdateMeasurement}
          lang={lang}
        />
      )}

      {/* Pulsivio PRO & Upgrades Modal */}
      <PulsivioProModal
        isOpen={isProOpen}
        onClose={() => setIsProOpen(false)}
        lang={lang}
        isPro={isPro}
        onTogglePro={handleTogglePro}
      />

      {/* Run On Phone & Cross-Device Sync Modal */}
      <RunOnPhoneModal
        isOpen={isRunOnPhoneOpen}
        onClose={() => setIsRunOnPhoneOpen(false)}
        lang={lang}
        syncCode={syncCode}
        onSetSyncCode={handleSetSyncCode}
        onManualSync={(overrideCode) => pullFromServer(overrideCode || syncCode, true)}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
        measurementsCount={measurements.length}
      />

      {/* Doctor Sharing & CSV Export Modal */}
      <DoctorShareModal
        isOpen={isDoctorShareOpen}
        onClose={() => setIsDoctorShareOpen(false)}
        measurements={measurements}
        lang={lang}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        onOpenReportView={() => {
          setIsDoctorShareOpen(false);
          setActiveTab('report');
        }}
        onOpenDoctorMode={() => {
          setIsDoctorShareOpen(false);
          setIsDoctorView(true);
        }}
        syncCode={syncCode}
        onPushSync={() => pushToServer(syncCode, measurements, profile)}
      />

      {/* Caregivers & SOS Contacts Modal */}
      <CaregiverModal
        isOpen={isCaregiverOpen}
        onClose={() => setIsCaregiverOpen(false)}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        lang={lang}
        latestReading={measurements[0] || null}
      />

      {/* Recommended Clinically Validated BP Monitors (Affiliate Monetization) */}
      <RecommendedDevicesModal
        isOpen={isDevicesModalOpen}
        onClose={() => setIsDevicesModalOpen(false)}
        lang={lang}
      />

      {/* Landing Page & Presentation Modal */}
      <LandingPageModal
        isOpen={isLandingPageOpen}
        onClose={() => setIsLandingPageOpen(false)}
        lang={lang}
        onOpenApp={() => setIsLandingPageOpen(false)}
      />

      {/* Social Media Kit Modal (Avatar & Banner Download) */}
      <SocialMediaKitModal
        isOpen={isSocialKitOpen}
        onClose={() => setIsSocialKitOpen(false)}
      />

      {/* Privacy Policy & Cookies Modal (AdSense & RODO Compliance) */}
      <PrivacyPolicyModal
        isOpen={isPrivacyPolicyOpen}
        onClose={() => setIsPrivacyPolicyOpen(false)}
        lang={lang}
      />

    </div>
  );

  if (isDoctorView) {
    return (
      <DoctorStandaloneView
        measurements={measurements}
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        syncCode={syncCode}
        onRefresh={() => pullFromServer(syncCode, true)}
        isSyncing={isSyncing}
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onExitDoctorMode={() => {
          setIsDoctorView(false);
          if (typeof window !== 'undefined' && window.location.hash.includes('doctor')) {
            window.location.hash = '';
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white transition-colors">
      {appContent}
      {/* Mobile Ad Emergency Close Button & Playable Ad Return Supervisor */}
      <MobileAdManager isPro={isPro} />
    </div>
  );
}
