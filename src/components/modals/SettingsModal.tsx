import React, { useState } from 'react';
import { X, Settings, Download, Upload, Trash2, RefreshCw, Check, Heart, ShieldCheck, User, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Measurement, PatientProfile } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  setPatientName: (name: string) => void;
  measurements: Measurement[];
  onImportMeasurements: (measurements: Measurement[]) => void;
  onResetData: () => void;
  isSeniorMode: boolean;
  onToggleSeniorMode: () => void;
  onOpenAvatarSelector: () => void;
  onOpenRecommendedMonitors: () => void;
  onOpenCaregivers: () => void;
  onOpenNamingIdeas: () => void;
  onOpenDoctorGuide?: () => void;
  onOpenPrivacyPolicy?: () => void;
  onOpenAdminPanel?: () => void;
  onOpenProUpgrade?: () => void;
  onOpenGoogleAuth?: () => void;
  isProUser?: boolean;
  currentAvatar: string;
  profile: PatientProfile;
  onUpdateProfile: (profile: PatientProfile) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  patientName,
  setPatientName,
  measurements,
  onImportMeasurements,
  onResetData,
  isSeniorMode,
  onToggleSeniorMode,
  onOpenAvatarSelector,
  onOpenRecommendedMonitors,
  onOpenCaregivers,
  onOpenNamingIdeas,
  onOpenDoctorGuide,
  onOpenPrivacyPolicy,
  onOpenAdminPanel,
  onOpenProUpgrade,
  onOpenGoogleAuth,
  isProUser = false,
  currentAvatar,
  profile,
  onUpdateProfile
}) => {
  const [nameInput, setNameInput] = useState(patientName || profile.name || '');
  const [birthYear, setBirthYear] = useState(profile.birthYear || '1954');
  const [meds, setMeds] = useState(profile.medications || 'Prestarium 5mg (rano), Nebilet 5mg (rano)');
  const [doctorName, setDoctorName] = useState(profile.doctorName || 'Dr n. med. A. Wiśniewska');
  const [savedMsg, setSavedMsg] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setPatientName(nameInput);
    onUpdateProfile({
      ...profile,
      name: nameInput,
      birthYear,
      medications: meds,
      doctorName
    });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const handleExportJSON = () => {
    const backupObj = {
      measurements,
      profile: {
        ...profile,
        name: nameInput,
        birthYear,
        medications: meds,
        doctorName
      },
      exportedAt: new Date().toISOString()
    };
    const dataStr = JSON.stringify(backupObj, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pulsivio-kopia-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportMeasurements(parsed);
          alert(`Pomyślnie zaimportowano ${parsed.length} pomiarów!`);
          onClose();
        } else if (parsed && Array.isArray(parsed.measurements)) {
          onImportMeasurements(parsed.measurements);
          if (parsed.profile) {
            onUpdateProfile(parsed.profile);
            setNameInput(parsed.profile.name || '');
          }
          alert(`Pomyślnie zaimportowano kopię zapasową (${parsed.measurements.length} pomiarów)!`);
          onClose();
        } else {
          alert('Błędny format pliku JSON.');
        }
      } catch (err) {
        alert('Nie udało się odczytać pliku JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-fade-in my-auto">
        
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-800/60 px-5 py-4 text-slate-900 dark:text-white flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-500/15 text-sky-600 dark:text-sky-400 rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base">Ustawienia Pulsivio</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Personalizacja i zarządzanie danymi</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij okno ustawień"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all cursor-pointer touch-manipulation"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs sm:text-sm max-h-[75vh] overflow-y-auto">
          
          {/* Senior Mode Quick Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/60 dark:bg-amber-950/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400">
                <Heart className="w-5 h-5 fill-amber-500" />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">
                  Tryb Seniora (Duże przyciski i lektor)
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  Upraszcza interfejs, powiększa cyfry i umożliwia odczyt na głos
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleSeniorMode}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                isSeniorMode
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {isSeniorMode ? 'Włączony' : 'Wyłączony'}
            </button>
          </div>

          {/* Special Quick Actions Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={onOpenAvatarSelector}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden ring-1 ring-slate-300 dark:ring-slate-700">
                <img src={currentAvatar} alt="Awatar" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </div>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Zmień awatar</span>
            </button>

            <button
              type="button"
              onClick={onOpenCaregivers}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Opiekun / Telefon</span>
            </button>

            <button
              type="button"
              onClick={onOpenRecommendedMonitors}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Atestowane aparaty</span>
            </button>

            {onOpenDoctorGuide && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDoctorGuide();
                }}
                className="p-3 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm">
                  💊
                </div>
                <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200">Dawki i leki (130/140)</span>
              </button>
            )}

            {onOpenPrivacyPolicy && (
              <button
                type="button"
                onClick={onOpenPrivacyPolicy}
                className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Polityka prywatności</span>
              </button>
            )}

            {onOpenProUpgrade && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenProUpgrade();
                }}
                className="p-3 rounded-2xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs">
                  ★
                </div>
                <span className="text-[11px] font-bold text-amber-900 dark:text-amber-200">
                  {isProUser ? 'Wersja PRO (Aktywna)' : 'Pulsivio PRO'}
                </span>
              </button>
            )}

            {onOpenGoogleAuth && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenGoogleAuth();
                }}
                className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center p-1.5 border border-slate-200 dark:border-slate-600">
                  <svg className="w-full h-full" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Konto Google</span>
              </button>
            )}

            {onOpenAdminPanel && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdminPanel();
                }}
                className="p-3 rounded-2xl border border-rose-300 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs text-xs font-black">
                  ⚙️
                </div>
                <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300">Panel Admina</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenNamingIdeas}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Pomysły na nazwę</span>
            </button>
          </div>

          {/* Patient Profile Form */}
          <form onSubmit={handleSaveProfile} className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
              Dane do Raportu Lekarskiego A4:
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                  Imię i nazwisko pacjenta:
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="np. Janina Kowalska"
                  className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                  Rok urodzenia / Wiek:
                </label>
                <input
                  type="text"
                  value={birthYear}
                  onChange={(e) => setBirthYear(e.target.value)}
                  placeholder="np. 1954 (72 lata)"
                  className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-hidden focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                Lekarz prowadzący:
              </label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="np. Lek. Kardiolog Anna Wiśniewska"
                className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-hidden focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                Przyjmowane leki na nadciśnienie:
              </label>
              <input
                type="text"
                value={meds}
                onChange={(e) => setMeds(e.target.value)}
                placeholder="np. Prestarium 5mg (rano), Nebilet 5mg (rano)"
                className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-hidden focus:border-rose-500"
              />
            </div>

            <div className="pt-1 flex items-center justify-between">
              {savedMsg ? (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Dane zapisane pomyślnie!
                </span>
              ) : <span />}
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
              >
                Zapisz profil
              </button>
            </div>
          </form>

          {/* Backup & Restore */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5">
            <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
              Kopia zapasowa i Eksport:
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Twoje dane są bezpiecznie zapisane w pamięci przeglądarki. Możesz pobrać plik kopii zapasowej, aby przenieść pomiary na inny komputer lub telefon.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-sky-500" />
                <span>Pobierz kopię JSON ({measurements.length} wpisów)</span>
              </button>

              <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer">
                <Upload className="w-4 h-4 text-emerald-500" />
                <span>Przywróć z pliku JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Reset / Clear Data */}
          <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20 space-y-2">
            <h4 className="font-bold text-red-600 dark:text-red-400 text-xs sm:text-sm">
              Zarządzanie danymi i reset:
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Możesz w każdej chwili przywrócić początkowe dane przykładowe z 7 dni.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Czy na pewno chcesz przywrócić domyślne 21 pomiarów przykładowych?')) {
                    onResetData();
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs font-bold cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/40"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Przywróć dane demo (21 wpisów wg PTNT)</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
