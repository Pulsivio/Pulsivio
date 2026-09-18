import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { QuickAddBanner } from './components/QuickAddBanner';
import { FilterBar } from './components/FilterBar';
import { WeekTimelineCard } from './components/WeekTimelineCard';
import { DayMeasurementsCard } from './components/DayMeasurementsCard';
import { AddMeasurementModal } from './components/AddMeasurementModal';
import { DoctorReportA4 } from './components/DoctorReportA4';
import { ChartsTrendsView } from './components/ChartsTrendsView';
import { SeniorModeView } from './components/SeniorModeView';
import { SupportBanner } from './components/SupportBanner';

// Modals
import { SyncModal } from './components/modals/SyncModal';
import { AboutModal } from './components/modals/AboutModal';
import { SocialCardModal } from './components/modals/SocialCardModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { VoiceAssistantModal } from './components/modals/VoiceAssistantModal';
import { RecommendedMonitorsModal } from './components/modals/RecommendedMonitorsModal';
import { CaregiversModal } from './components/modals/CaregiversModal';
import { AvatarSelectorModal } from './components/modals/AvatarSelectorModal';
import { NamingIdeasModal } from './components/modals/NamingIdeasModal';
import { BuyCoffeeModal } from './components/modals/BuyCoffeeModal';
import { EditMeasurementModal } from './components/modals/EditMeasurementModal';
import { PrivacyPolicyModal } from './components/modals/PrivacyPolicyModal';
import { SocialKitModal } from './components/modals/SocialKitModal';
import { PresentationLandingModal } from './components/modals/PresentationLandingModal';
import { GoogleAdsBanner } from './components/GoogleAdsBanner';
import { AdminPanelModal } from './components/modals/AdminPanelModal';
import { ProUpgradeModal } from './components/modals/ProUpgradeModal';
import { GoogleAuthModal } from './components/modals/GoogleAuthModal';
import { DoctorDoseGuideModal } from './components/modals/DoctorDoseGuideModal';

import { Measurement, Period, PatientProfile, getPTNTClassification } from './types';
import { INITIAL_MEASUREMENTS } from './data/initialData';
import { BookOpen, TrendingUp, FileText, Bot, Edit3, Trash2 } from 'lucide-react';

// Exact localStorage keys matching production Pulsivio (pulsivio.onrender.com)
const STORAGE_V4 = 'pulsify_measurements_v4';
const STORAGE_V3 = 'kardio_measurements_v3';
const STORAGE_V2 = 'pulsivio_measurements_v2';
const PROFILE_KEY = 'kardio_profile_v1';
const SENIOR_MODE_KEY = 'kardio_senior_mode_v1';
const AVATAR_KEY = 'pulsivio_avatar_v1';
const SYNC_CODE_KEY = 'pulsivio_sync_code_v1';
const DARK_MODE_KEY = 'pulsivio_dark_mode_v2';

export default function App() {
  // Load measurements with fallback across all storage versions
  const [measurements, setMeasurements] = useState<Measurement[]>(() => {
    try {
      const v4 = localStorage.getItem(STORAGE_V4);
      if (v4) {
        const p = JSON.parse(v4);
        if (Array.isArray(p) && p.length > 0) return p;
      }
      const v3 = localStorage.getItem(STORAGE_V3);
      if (v3) {
        const p = JSON.parse(v3);
        if (Array.isArray(p) && p.length > 0) return p;
      }
      const v2 = localStorage.getItem(STORAGE_V2);
      if (v2) {
        const p = JSON.parse(v2);
        if (Array.isArray(p) && p.length > 0) return p;
      }
    } catch (e) {
      console.error('Failed to load measurements from localStorage', e);
    }
    return INITIAL_MEASUREMENTS;
  });

  // Load patient profile
  const [profile, setProfile] = useState<PatientProfile>(() => {
    const defaultProfile: PatientProfile = {
      name: '',
      birthYear: '',
      weight: '',
      doctorName: '',
      doctorEmail: '',
      clinicName: '',
      emergencyPhone: '',
      emergencyName: '',
      notesForDoctor: '',
      medications: ''
    };

    try {
      const saved = localStorage.getItem(PROFILE_KEY) || localStorage.getItem('pulsivio_profile_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultProfile, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load profile', e);
    }
    return defaultProfile;
  });

  // Senior mode state
  const [isSeniorMode, setIsSeniorMode] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem(SENIOR_MODE_KEY) || localStorage.getItem('pulsivio_senior_mode');
      return v === 'true';
    } catch {
      return false;
    }
  });

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem(DARK_MODE_KEY);
      return v === null ? true : v === 'true';
    } catch {
      return true;
    }
  });

  // Avatar state
  const [currentAvatar, setCurrentAvatar] = useState<string>(() => {
    try {
      const av = localStorage.getItem(AVATAR_KEY) || localStorage.getItem('pulsivio_avatar');
      return av && !av.includes('pulsify_avatar') ? av : '/avatars/pulsivio_official_brand.jpg';
    } catch {
      return '/avatars/pulsivio_official_brand.jpg';
    }
  });

  // Sync code state
  const [syncCode] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(SYNC_CODE_KEY);
      if (saved) return saved;
      const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let r = '';
      for (let i = 0; i < 4; i++) r += letters.charAt(Math.floor(Math.random() * letters.length));
      const code = `PUL-${r}`;
      localStorage.setItem(SYNC_CODE_KEY, code);
      return code;
    } catch {
      return 'PUL-SM32';
    }
  });

  // Active navigation tab ('diary' | 'trends' | 'report')
  const [activeTab, setActiveTab] = useState<'diary' | 'trends' | 'report'>('diary');

  // Filters & search
  const [selectedPeriod, setSelectedPeriod] = useState<Period | 'all'>('all');
  const [viewMode, setViewMode] = useState<'dni' | 'lista'>('dni');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<Measurement | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [addModalDefaultDate, setAddModalDefaultDate] = useState<string | undefined>(undefined);
  const [addModalDefaultPeriod, setAddModalDefaultPeriod] = useState<Period | undefined>(undefined);

  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(() => {
    try {
      return typeof window !== 'undefined' && window.location.hash.includes('admin');
    } catch {
      return false;
    }
  });

  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isGoogleAuthModalOpen, setIsGoogleAuthModalOpen] = useState(false);
  const [isProUser, setIsProUser] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pulsivio_pro_active') === 'true';
    } catch {
      return false;
    }
  });

  const [googleAdsEnabled, setGoogleAdsEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pulsivio_ads_enabled') !== 'false';
    } catch {
      return true;
    }
  });

  const [googleAccount, setGoogleAccount] = useState<{ email: string; name: string } | null>(() => {
    try {
      const s = localStorage.getItem('pulsivio_google_account');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  });
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash.includes('admin')) {
        setIsAdminModalOpen(true);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isMonitorsModalOpen, setIsMonitorsModalOpen] = useState(false);
  const [isCaregiversModalOpen, setIsCaregiversModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isNamingModalOpen, setIsNamingModalOpen] = useState(false);
  const [isBuyCoffeeModalOpen, setIsBuyCoffeeModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isSocialKitModalOpen, setIsSocialKitModalOpen] = useState(false);
  const [isPresentationModalOpen, setIsPresentationModalOpen] = useState(false);
  const [isDoctorDoseModalOpen, setIsDoctorDoseModalOpen] = useState(false);

  // Sync state with local storage
  useEffect(() => {
    try {
      const dataStr = JSON.stringify(measurements);
      localStorage.setItem(STORAGE_V4, dataStr);
      localStorage.setItem(STORAGE_V3, dataStr);
      localStorage.setItem(STORAGE_V2, dataStr);
    } catch (e) {
      console.error('Failed to save measurements to localStorage', e);
    }
  }, [measurements]);

  useEffect(() => {
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(SENIOR_MODE_KEY, String(isSeniorMode));
    } catch (e) {
      console.error('Failed to save senior mode', e);
    }
  }, [isSeniorMode]);

  useEffect(() => {
    try {
      localStorage.setItem(DARK_MODE_KEY, String(isDarkMode));
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error('Failed to save dark mode', e);
    }
  }, [isDarkMode]);

  useEffect(() => {
    try {
      localStorage.setItem(AVATAR_KEY, currentAvatar);
    } catch (e) {
      console.error('Failed to save avatar', e);
    }
  }, [currentAvatar]);

  // Auto-sync with cloud when Google account is logged in
  useEffect(() => {
    if (!googleAccount?.email) return;

    const timer = setTimeout(async () => {
      try {
        await fetch(`/api/user-sync/${encodeURIComponent(googleAccount.email)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: googleAccount.email,
            name: googleAccount.name,
            measurements,
            profile,
          }),
        });
      } catch (e) {
        console.warn('Silent cloud sync warning:', e);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [measurements, profile, googleAccount]);

  const handleGoogleSignIn = async (email: string, name: string) => {
    setIsCloudSyncing(true);
    const acc = { email, name };
    setGoogleAccount(acc);
    localStorage.setItem('pulsivio_google_account', JSON.stringify(acc));

    try {
      const res = await fetch(`/api/user-sync/${encodeURIComponent(email)}`);
      if (res.ok) {
        const cloudData = await res.json();
        if (cloudData.data?.measurements && cloudData.data.measurements.length > 0) {
          if (measurements.length <= INITIAL_MEASUREMENTS.length) {
            setMeasurements(cloudData.data.measurements);
          } else {
            const existingIds = new Set(measurements.map(m => m.id));
            const newOnes = cloudData.data.measurements.filter((m: Measurement) => !existingIds.has(m.id));
            if (newOnes.length > 0) {
              setMeasurements(prev => [...newOnes, ...prev]);
            }
          }
        }
        if (cloudData.data?.profile) {
          setProfile(prev => ({ ...prev, ...cloudData.data.profile }));
        }
      } else {
        await fetch(`/api/user-sync/${encodeURIComponent(email)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            name,
            measurements,
            profile,
          }),
        });
      }
    } catch (e) {
      console.error('Failed to sync with cloud on login', e);
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const handleGoogleSignOut = () => {
    setGoogleAccount(null);
    localStorage.removeItem('pulsivio_google_account');
  };

  const handleManualSyncNow = async () => {
    if (!googleAccount?.email) return;
    setIsCloudSyncing(true);
    try {
      await fetch(`/api/user-sync/${encodeURIComponent(googleAccount.email)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: googleAccount.email,
          name: googleAccount.name,
          measurements,
          profile,
        }),
      });
    } catch (e) {
      console.error('Manual sync failed', e);
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const VALID_PRO_KEYS = ['PULSIVIO-PRO-2026', 'ADMIN-PRO', 'VIP-CARDIO', 'SUB-PRO-PREMIUM', 'PRO-SUBSCRIPTION-2026'];

  const handleActivatePro = (code?: string): boolean => {
    // If called without code (e.g. from Admin Panel toggle), direct activate
    if (!code) {
      setIsProUser(true);
      localStorage.setItem('pulsivio_pro_active', 'true');
      setProfile(prev => ({ ...prev, isProUser: true, proActivatedAt: new Date().toISOString() }));
      return true;
    }

    const cleanCode = code.trim().toUpperCase();
    if (VALID_PRO_KEYS.includes(cleanCode)) {
      setIsProUser(true);
      localStorage.setItem('pulsivio_pro_active', 'true');
      setProfile(prev => ({ ...prev, isProUser: true, proActivatedAt: new Date().toISOString() }));
      return true;
    }

    return false;
  };

  // Handle measurement save / edit
  const handleSaveMeasurement = (
    data: Omit<Measurement, 'id' | 'createdAt'>,
    editId?: string
  ) => {
    if (editId) {
      setMeasurements(prev =>
        prev.map(m => (m.id === editId ? { ...m, ...data } : m))
      );
    } else {
      let ts = Date.now();
      if (data.date) {
        const dt = data.time ? `${data.date}T${data.time}` : `${data.date}T12:00:00`;
        const parsed = new Date(dt).getTime();
        if (!isNaN(parsed)) ts = parsed;
      }
      const newMeasurement: Measurement = {
        ...data,
        id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: ts
      };
      setMeasurements(prev => [newMeasurement, ...prev]);
    }
  };

  const handleDeleteMeasurement = (id: string) => {
    setMeasurements(prev => prev.filter(m => m.id !== id));
  };

  const handleDeleteDayMeasurements = (date: string) => {
    setMeasurements(prev => prev.filter(m => m.date !== date));
  };

  const handleOpenAddModal = (date?: string, period?: Period) => {
    setEditingMeasurement(null);
    setAddModalDefaultDate(date);
    setAddModalDefaultPeriod(period);
    setIsAddModalOpen(true);
  };

  const handleEditMeasurement = (m: Measurement) => {
    setEditingMeasurement(m);
    setIsEditModalOpen(true);
  };

  // Filtered measurements
  const filteredMeasurements = useMemo(() => {
    return measurements.filter(m => {
      if (selectedPeriod !== 'all' && m.period !== selectedPeriod) {
        return false;
      }
      if (selectedDayFilter && m.date !== selectedDayFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNotes = m.notes ? m.notes.toLowerCase().includes(q) : false;
        const matchDate = m.date.includes(q);
        const matchPeriod = m.period.toLowerCase().includes(q);
        if (!matchNotes && !matchDate && !matchPeriod) {
          return false;
        }
      }
      return true;
    });
  }, [measurements, selectedPeriod, selectedDayFilter, searchQuery]);

  // Group by date (descending)
  const groupedByDate = useMemo(() => {
    const groups: Record<string, Measurement[]> = {};
    filteredMeasurements.forEach(m => {
      if (!groups[m.date]) {
        groups[m.date] = [];
      }
      groups[m.date].push(m);
    });
    const sortedDates = Object.keys(groups).sort().reverse();
    return sortedDates.map(date => ({
      date,
      measurements: groups[date]
    }));
  }, [filteredMeasurements]);

  // Tabs configuration: single doctor report, quick-add banner is the sole entry for adding measurements
  const navTabs = [
    { id: 'diary', label: 'Pomiary', icon: <BookOpen className="h-4 w-4 shrink-0" /> },
    { id: 'trends', label: 'Wykresy i trendy', icon: <TrendingUp className="h-4 w-4 shrink-0" /> },
    { id: 'report', label: 'Raport dla lekarza', icon: <FileText className="h-4 w-4 shrink-0" /> },
    { id: 'assistant', label: 'Asystent głosowy', icon: <Bot className="h-4 w-4 shrink-0 text-rose-500 animate-pulse" /> }
  ];

  const handleSelectNavTab = (tabId: string) => {
    if (tabId === 'assistant') {
      setIsVoiceModalOpen(true);
    } else {
      setActiveTab(tabId as any);
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white transition-colors ${isSeniorMode ? 'large-font' : ''}`}>
      
      {/* Top Header with Avatar, Brand, Facebook and BuyCoffee */}
      <Header
        onOpenAddModal={() => handleOpenAddModal()}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenAboutModal={() => setIsPresentationModalOpen(true)}
        onOpenSocialModal={() => setIsSocialKitModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenBuyCoffeeModal={() => setIsBuyCoffeeModalOpen(true)}
        onOpenRecommendedMonitors={() => setIsMonitorsModalOpen(true)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onOpenProModal={() => setIsProModalOpen(true)}
        onOpenGoogleAuth={() => setIsGoogleAuthModalOpen(true)}
        isProUser={isProUser}
        googleAccount={googleAccount}
        syncCode={syncCode}
        isSeniorMode={isSeniorMode}
        currentAvatar={currentAvatar}
        onOpenAvatarSelector={() => setIsAvatarModalOpen(true)}
      />

      {/* Main Clean Navigation Tabs */}
      {!isSeniorMode && (
        <nav className="no-print hidden sm:block mx-auto max-w-7xl px-3 sm:px-6 pt-3 pb-1 w-full">
          <div className="grid grid-cols-4 gap-2 rounded-2xl bg-slate-100/90 p-1.5 dark:bg-slate-900/90">
            {navTabs.map(t => {
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectNavTab(t.id)}
                  id={`nav-tab-${t.id}`}
                  className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm font-extrabold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {t.icon}
                  <span className="truncate">{t.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {/* Main View Area */}
      <main className="flex-1 w-full pb-24 sm:pb-8">
        
        {/* SENIOR MODE VIEW */}
        {isSeniorMode ? (
          <SeniorModeView
            measurements={measurements}
            onAddMeasurement={data => handleSaveMeasurement(data)}
            onOpenAssistant={() => setIsVoiceModalOpen(true)}
            profile={profile}
            onExitSeniorMode={() => setIsSeniorMode(false)}
            onOpenCaregivers={() => setIsCaregiversModalOpen(true)}
          />
        ) : (
          <>
            {/* TAB: DIARY / POMIARY */}
            {activeTab === 'diary' && (
              <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-5 space-y-4">
                
                {/* 4 Stats Cards */}
                <StatsCards measurements={measurements} />

                {/* Quick Add Banner with buttons for Add, Certified Monitors, Voice Dictation */}
                <QuickAddBanner
                  onOpenAddModal={() => handleOpenAddModal()}
                  onOpenRecommendedMonitors={() => setIsMonitorsModalOpen(true)}
                  onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
                  onOpenDoctorGuide={() => setIsDoctorDoseModalOpen(true)}
                />

                {/* Filter and Search Bar */}
                <FilterBar
                  selectedPeriod={selectedPeriod}
                  setSelectedPeriod={setSelectedPeriod}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onOpenAddModal={() => handleOpenAddModal(undefined, 'dodatkowy')}
                />

                {/* Week Timeline Calendar */}
                <WeekTimelineCard
                  measurements={measurements}
                  onOpenAddModalWithDate={date => handleOpenAddModal(date)}
                  onSelectDayFilter={date => {
                    setSelectedDayFilter(prev => (prev === date ? null : date));
                  }}
                  selectedDay={selectedDayFilter}
                />

                {/* Filter chip indicator if a day is selected */}
                {selectedDayFilter && (
                  <div className="flex items-center justify-between bg-sky-100 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-700/60 px-4 py-2.5 rounded-2xl text-xs sm:text-sm text-sky-900 dark:text-sky-200">
                    <span>
                      Filtrowanie wyników dla wybranego dnia: <strong>{selectedDayFilter}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedDayFilter(null)}
                      className="bg-sky-600 hover:bg-sky-500 text-white font-bold px-3 py-1 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Pokaż wszystkie dni
                    </button>
                  </div>
                )}

                {/* Grouped Days View */}
                {viewMode === 'dni' && (
                  <div className="space-y-4">
                    {groupedByDate.length > 0 ? (
                      groupedByDate.map(({ date, measurements: dayMeas }) => (
                        <DayMeasurementsCard
                          key={date}
                          date={date}
                          measurements={dayMeas}
                          onOpenAddModalWithDate={(d, p) => handleOpenAddModal(d, p)}
                          onEditMeasurement={handleEditMeasurement}
                          onDeleteMeasurement={handleDeleteMeasurement}
                          onDeleteDayMeasurements={handleDeleteDayMeasurements}
                        />
                      ))
                    ) : (
                      <div className="bg-white dark:bg-slate-850/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center text-slate-500 dark:text-slate-400">
                        <p className="text-sm font-bold mb-2">Brak zapisanych pomiarów w wybranym filtrze.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPeriod('all');
                            setSearchQuery('');
                            setSelectedDayFilter(null);
                          }}
                          className="text-xs text-sky-600 dark:text-sky-400 font-bold hover:underline cursor-pointer"
                        >
                          Wyczyść filtry i pokaż wszystkie
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Flat List View */}
                {viewMode === 'lista' && (
                  <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700/80 font-bold">
                            <th className="p-3.5">Data i Godzina</th>
                            <th className="p-3.5">Pora dnia</th>
                            <th className="p-3.5">Ciśnienie (SYS/DIA)</th>
                            <th className="p-3.5">Puls</th>
                            <th className="p-3.5">Norma PTNT</th>
                            <th className="p-3.5">Leki</th>
                            <th className="p-3.5">Notatki</th>
                            <th className="p-3.5 text-right">Akcje</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                          {filteredMeasurements.map(m => {
                            const ptnt = getPTNTClassification(m.systolic, m.diastolic);
                            return (
                              <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">
                                  {m.date} {m.time}
                                </td>
                                <td className="p-3.5 capitalize text-slate-700 dark:text-slate-300">
                                  {m.period}
                                </td>
                                <td className="p-3.5 font-black text-slate-900 dark:text-white text-base">
                                  {m.systolic}/{m.diastolic} <span className="text-xs text-slate-400 font-normal">mmHg</span>
                                </td>
                                <td className="p-3.5 text-rose-600 dark:text-rose-400 font-bold">
                                  ❤️ {m.pulse} bpm
                                </td>
                                <td className="p-3.5">
                                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${ptnt.badgeClass}`}>
                                    {ptnt.shortLabel}
                                  </span>
                                </td>
                                <td className="p-3.5">
                                  {m.medsTaken ? (
                                    <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold">Tak</span>
                                  ) : (
                                    <span className="text-slate-400 text-xs">Nie</span>
                                  )}
                                </td>
                                <td className="p-3.5 text-slate-500 dark:text-slate-400 italic text-xs max-w-xs truncate">
                                  {m.notes || '-'}
                                </td>
                                <td className="p-3.5 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleEditMeasurement(m)}
                                      className="p-1.5 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer"
                                      title="Edytuj pomiar"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteMeasurement(m.id)}
                                      className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                                      title="Usuń pomiar"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Google Ads Banner (when enabled and not PRO) */}
                {googleAdsEnabled && !isProUser && (
                  <GoogleAdsBanner
                    isProUser={isProUser}
                    onOpenProModal={() => setIsProModalOpen(true)}
                    onOpenRecommendedMonitors={() => setIsMonitorsModalOpen(true)}
                  />
                )}

                {/* BuyCoffee / Support Project Widget Banner */}
                <SupportBanner />
              </div>
            )}

            {/* TAB: TRENDS & CHARTS */}
            {activeTab === 'trends' && (
              <ChartsTrendsView
                measurements={measurements}
                onBack={() => setActiveTab('diary')}
              />
            )}

            {/* TAB: REPORT A4 */}
            {activeTab === 'report' && (
              <DoctorReportA4
                measurements={measurements}
                onBack={() => setActiveTab('diary')}
                patientName={profile.name || ''}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Floating Bottom Bar */}
      {!isSeniorMode && (
        <div className="no-print sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom,0.5rem))] backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 shadow-lg">
          <div className="grid grid-cols-4 gap-1 text-center">
            {navTabs.map(t => {
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectNavTab(t.id)}
                  className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'text-sky-600 dark:text-sky-400 font-black'
                      : 'text-slate-500 dark:text-slate-400 font-medium'
                  }`}
                >
                  <div className="p-1">{t.icon}</div>
                  <span className="text-[10px] leading-tight truncate max-w-[62px]">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="no-print w-full border-t border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 py-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <span>© {new Date().getFullYear()} Pulsivio • Dziennik Ciśnienia i Zdrowia zgodny ze standardem PTNT</span>
          <div className="flex items-center gap-2.5 flex-wrap justify-center">
            <button
              type="button"
              onClick={() => setIsBuyCoffeeModalOpen(true)}
              className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              ☕ Postaw kawę
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsProModalOpen(true)}
              className="text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
            >
              ★ {isProUser ? 'Wersja PRO' : 'Pulsivio PRO'}
            </button>
            <span>•</span>
            <a
              href="https://www.facebook.com/pulsivio/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1877F2] font-bold hover:underline cursor-pointer"
            >
              Facebook
            </a>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsMonitorsModalOpen(true)}
              className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              Polecane aparaty
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(true)}
              className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              Ustawienia
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsAdminModalOpen(true)}
              className="text-rose-600 dark:text-rose-400 font-bold hover:underline cursor-pointer"
              title="Panel zarządzania aplikacją, reklamami i afiliacją"
            >
              ⚙️ Admin
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsPrivacyModalOpen(true)}
              className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              Polityka prywatności
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <AddMeasurementModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingMeasurement(null);
        }}
        onSave={handleSaveMeasurement}
        initialData={editingMeasurement}
        defaultDate={addModalDefaultDate}
        defaultPeriod={addModalDefaultPeriod}
      />

      <EditMeasurementModal
        measurement={editingMeasurement}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingMeasurement(null);
        }}
        onSave={updated => {
          handleSaveMeasurement(updated, updated.id);
        }}
        onDelete={id => {
          handleDeleteMeasurement(id);
        }}
      />

      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onAddMeasurement={data => handleSaveMeasurement(data)}
        recentReadings={measurements}
      />

      <BuyCoffeeModal
        isOpen={isBuyCoffeeModalOpen}
        onClose={() => setIsBuyCoffeeModalOpen(false)}
      />

      <RecommendedMonitorsModal
        isOpen={isMonitorsModalOpen}
        onClose={() => setIsMonitorsModalOpen(false)}
      />

      <DoctorDoseGuideModal
        isOpen={isDoctorDoseModalOpen}
        onClose={() => setIsDoctorDoseModalOpen(false)}
        latestSys={measurements[0]?.systolic}
        latestDia={measurements[0]?.diastolic}
      />

      <CaregiversModal
        isOpen={isCaregiversModalOpen}
        onClose={() => setIsCaregiversModalOpen(false)}
        profile={profile}
        onUpdateProfile={newProf => setProfile(newProf)}
        latestReading={measurements[0]}
      />

      <AvatarSelectorModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={currentAvatar}
        onSelectAvatar={av => setCurrentAvatar(av)}
      />

      <NamingIdeasModal
        isOpen={isNamingModalOpen}
        onClose={() => setIsNamingModalOpen(false)}
      />

      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        syncCode={syncCode}
        measurements={measurements}
        profile={profile}
        onApplySyncedData={(newMeas, newProf) => {
          if (newMeas && newMeas.length > 0) setMeasurements(newMeas);
          if (newProf) setProfile(newProf);
        }}
      />

      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      <SocialCardModal
        isOpen={isSocialModalOpen}
        onClose={() => setIsSocialModalOpen(false)}
        measurements={measurements}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        patientName={profile.name}
        setPatientName={name => setProfile(prev => ({ ...prev, name }))}
        measurements={measurements}
        onImportMeasurements={newMeas => setMeasurements(newMeas)}
        onResetData={() => setMeasurements(INITIAL_MEASUREMENTS)}
        isSeniorMode={isSeniorMode}
        onToggleSeniorMode={() => setIsSeniorMode(prev => !prev)}
        onOpenAvatarSelector={() => setIsAvatarModalOpen(true)}
        onOpenRecommendedMonitors={() => setIsMonitorsModalOpen(true)}
        onOpenCaregivers={() => setIsCaregiversModalOpen(true)}
        onOpenNamingIdeas={() => setIsNamingModalOpen(true)}
        onOpenDoctorGuide={() => setIsDoctorDoseModalOpen(true)}
        onOpenPrivacyPolicy={() => setIsPrivacyModalOpen(true)}
        onOpenAdminPanel={() => setIsAdminModalOpen(true)}
        onOpenProUpgrade={() => setIsProModalOpen(true)}
        onOpenGoogleAuth={() => setIsGoogleAuthModalOpen(true)}
        isProUser={isProUser}
        currentAvatar={currentAvatar}
        profile={profile}
        onUpdateProfile={newProf => setProfile(newProf)}
      />

      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      <SocialKitModal
        isOpen={isSocialKitModalOpen}
        onClose={() => setIsSocialKitModalOpen(false)}
      />

      <PresentationLandingModal
        isOpen={isPresentationModalOpen}
        onClose={() => setIsPresentationModalOpen(false)}
        onOpenApp={() => setActiveTab('diary')}
      />

      {/* Admin Panel Modal */}
      <AdminPanelModal
        isOpen={isAdminModalOpen}
        onClose={() => {
          setIsAdminModalOpen(false);
          if (typeof window !== 'undefined' && window.location.hash.includes('admin')) {
            window.history.pushState('', document.title, window.location.pathname + window.location.search);
          }
        }}
        measurements={measurements}
        profile={profile}
        onUpdateProfile={newProf => setProfile(newProf)}
        onImportMeasurements={newMeas => setMeasurements(newMeas)}
        isProUser={isProUser}
        onTogglePro={handleActivatePro}
        googleAdsEnabled={googleAdsEnabled}
        onToggleGoogleAds={val => {
          setGoogleAdsEnabled(val);
          localStorage.setItem('pulsivio_ads_enabled', String(val));
        }}
      />

      {/* Pro Upgrade Modal */}
      <ProUpgradeModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        isProUser={isProUser}
        onActivatePro={handleActivatePro}
        onOpenBuyCoffee={() => {
          setIsProModalOpen(false);
          setIsBuyCoffeeModalOpen(true);
        }}
      />

      {/* Google Auth & Cloud Sync Modal */}
      <GoogleAuthModal
        isOpen={isGoogleAuthModalOpen}
        onClose={() => setIsGoogleAuthModalOpen(false)}
        currentUser={googleAccount}
        onSignIn={handleGoogleSignIn}
        onSignOut={handleGoogleSignOut}
        onSyncNow={handleManualSyncNow}
        isSyncing={isCloudSyncing}
        totalMeasurements={measurements.length}
      />

    </div>
  );
}
