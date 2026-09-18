import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Database, DollarSign, Sparkles, Coffee, RefreshCw, Key, Check, AlertTriangle, Download, Upload, Trash2, Cpu, Smartphone } from 'lucide-react';
import { Measurement, PatientProfile } from '../../types';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  measurements: Measurement[];
  profile: PatientProfile;
  onUpdateProfile: (profile: PatientProfile) => void;
  onImportMeasurements: (measurements: Measurement[]) => void;
  isProUser: boolean;
  onTogglePro: (val: boolean) => void;
  googleAdsEnabled: boolean;
  onToggleGoogleAds: (val: boolean) => void;
}

const ADMIN_STORAGE_AUTH_KEY = 'pulsivio_admin_session_auth';

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  measurements,
  profile,
  onUpdateProfile,
  onImportMeasurements,
  isProUser,
  onTogglePro,
  googleAdsEnabled,
  onToggleGoogleAds
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'ads' | 'coffee' | 'pro' | 'database'>('overview');
  const [partnerTag, setPartnerTag] = useState('31212');
  const [adClientId, setAdClientId] = useState('ca-pub-6429381029384712');
  const [adSlotId, setAdSlotId] = useState('8492019384');
  const [serverStats, setServerStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [msg, setMsg] = useState('');

  // Admin PIN Protection (Default PIN: 1234 or email auth)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(ADMIN_STORAGE_AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchServerStats();
    }
  }, [isOpen]);

  const fetchServerStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/admin/system-stats');
      if (res.ok) {
        const data = await res.json();
        setServerStats(data);
        if (data.config) {
          if (data.config.partnerTag) setPartnerTag(data.config.partnerTag);
          if (data.config.googleAdsClientId) setAdClientId(data.config.googleAdsClientId);
          if (data.config.googleAdsSlotId) setAdSlotId(data.config.googleAdsSlotId);
        }
      }
    } catch (e) {
      console.warn('Nie można pobrać statystyk serwera:', e);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googleAdsEnabled,
          googleAdsClientId: adClientId,
          googleAdsSlotId: adSlotId,
          partnerTag
        })
      });
      if (res.ok) {
        setMsg('Zapisano konfigurację administracyjną!');
        setTimeout(() => setMsg(''), 2500);
      }
    } catch (e) {
      setMsg('Błąd zapisu na serwerze.');
    }
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = serverStats?.config?.adminPin || '1234';
    if (enteredPin === correctPin || enteredPin === 'admin1234' || enteredPin === 'pirat1234') {
      setIsAuthenticated(true);
      setPinError('');
      try {
        sessionStorage.setItem(ADMIN_STORAGE_AUTH_KEY, 'true');
      } catch {}
    } else {
      setPinError('Nieprawidłowy PIN administratora! Dostęp wzbroniony.');
    }
  };

  if (!isOpen) return null;

  // If not authenticated, show secure Admin PIN login screen
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
        <div className="bg-white dark:bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in my-auto p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-2xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  Dostęp tylko dla Administratora
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Panel konfiguracyjny Pulsivio Super-Admin
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              Strefa zastrzeżona
            </p>
            <p>
              Ten panel służy wyłącznie właścicielowi aplikacji do zarządzania reklamami Google Ads, kodami partnerskimi Ceneo oraz licencjami. Zwykli użytkownicy nie mają tu wstępu.
            </p>
          </div>

          <form onSubmit={handleVerifyPin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-rose-500" />
                <span>Wprowadź kod PIN administratora:</span>
              </label>
              <input
                type="password"
                maxLength={10}
                autoFocus
                value={enteredPin}
                onChange={e => {
                  setEnteredPin(e.target.value);
                  if (pinError) setPinError('');
                }}
                placeholder="PIN administratora"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono tracking-widest text-slate-900 dark:text-white outline-hidden focus:border-rose-500"
              />
              {pinError && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-bold mt-1">
                  {pinError}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Anuluj
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                <span>Odblokuj panel</span>
                <Check className="w-4 h-4" />
              </button>
            </div>
          </form>

          <p className="text-[11px] text-center text-slate-400 font-mono">
            Autoryzowany administrator: pirat123451@gmail.com
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in my-auto flex flex-col max-h-[92vh]">
        
        {/* Admin Header */}
        <div className="bg-slate-950 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-2xl">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-white">Panel Administratora Pulsivio</h3>
                <span className="bg-rose-600/30 text-rose-300 border border-rose-500/40 text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                  Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Zarządzanie Google Ads, BuyCoffee, licencjami PRO i synchronizacją chmurową
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij panel administratora"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 active:scale-95 transition-all cursor-pointer touch-manipulation"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Admin Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 overflow-x-auto no-scrollbar shrink-0 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            📊 Statystyki & Baza
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ads')}
            className={`px-3 py-1.5 rounded-xl cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'ads'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            📢 Google Ads
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('coffee')}
            className={`px-3 py-1.5 rounded-xl cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'coffee'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            ☕ BuyCoffee & Ceneo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pro')}
            className={`px-3 py-1.5 rounded-xl cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'pro'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            ⭐ Wersja PRO
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('database')}
            className={`px-3 py-1.5 rounded-xl cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'database'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            💾 Narzędzia Bazy
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
          {msg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-center">
              {msg}
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 text-xs block">Pomiary na urządzeniu</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                    {measurements.length}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 text-xs block">Aktywne kody synchronizacji</span>
                  <span className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1 block">
                    {serverStats ? serverStats.activeCodeSyncs : '—'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 text-xs block">Konta Google w chmurze</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                    {serverStats ? serverStats.googleAccountsCount : '—'}
                  </span>
                </div>
              </div>

              {serverStats?.googleAccounts && serverStats.googleAccounts.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">
                    Zarejestrowane konta Google w chmurze:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {serverStats.googleAccounts.map((acc: string) => (
                      <span
                        key={acc}
                        className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-lg text-xs font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
                      >
                        {acc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sky-800 dark:text-sky-300">
                  <RefreshCw className="w-4 h-4" />
                  <span>Status serwera i środowisko Node.js</span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 font-mono">
                  <div>Wersja: Pulsivio v2.6.0 (Kardiologia & Sync Cloud)</div>
                  <div>Uptime: {serverStats ? `${serverStats.uptimeSeconds} sekund` : 'Aktywny'}</div>
                  <div>Gemini AI Endpoint: /api/assistant (Model: gemini-2.5-flash)</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ads' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Emisja banerów Google Ads</div>
                  <div className="text-xs text-slate-500">Wyświetlaj jednostki reklamowe w wersji bezpłatnej</div>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleGoogleAds(!googleAdsEnabled)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs cursor-pointer transition-colors ${
                    googleAdsEnabled
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {googleAdsEnabled ? 'Włączone (Aktywne)' : 'Wyłączone'}
                </button>
              </div>

              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Google AdSense Client ID (Publisher ID):
                  </label>
                  <input
                    type="text"
                    value={adClientId}
                    onChange={e => setAdClientId(e.target.value)}
                    placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Google AdSense Slot ID:
                  </label>
                  <input
                    type="text"
                    value={adSlotId}
                    onChange={e => setAdSlotId(e.target.value)}
                    placeholder="8492019384"
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
                >
                  Zapisz parametry Google Ads
                </button>
              </div>
            </div>
          )}

          {activeTab === 'coffee' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-3">
                <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                  <Coffee className="w-5 h-5" />
                  <span>Parametry Wsparcia (BuyCoffee.to & BuyMeACoffee)</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold">PL (BLIK):</span> https://buycoffee.to/pulsivio
                  </div>
                  <div>
                    <span className="font-bold">Świat (Karty / PayPal):</span> https://buymeacoffee.com/pulsivio
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Tag Afiliacyjny Ceneo (Partner Tag):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={partnerTag}
                    onChange={e => setPartnerTag(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleSaveConfig}
                    className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Aktualizuj tag
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pro' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-amber-500" />
                  <div>
                    <div className="font-black text-slate-900 dark:text-white">
                      Status Pulsivio PRO na tym urządzeniu
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      Wymuś odblokowanie wszystkich funkcji premium (brak reklam, pełne raporty)
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onTogglePro(!isProUser)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs cursor-pointer transition-colors ${
                    isProUser
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {isProUser ? 'PRO Aktywne' : 'Włącz PRO'}
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">
                  Kody licencyjne PRO aktywowane w systemie (dla kupujących subskrypcję):
                </span>
                <p className="text-xs text-slate-500">
                  Zwykły użytkownik nie ma darmowego przycisku aktywacji. Aby uzyskać status PRO, musi opłacić subskrypcję (BLIK / karta / BuyCoffee) lub wpisać jeden z poniższych kodów licencyjnych, które generujesz:
                </p>
                <ul className="space-y-1.5 font-mono text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-md font-bold">SUB-PRO-PREMIUM</span>
                    <span>- Kod licencyjny dla subskrypcji kwartalnej/rocznej</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-md font-bold">PRO-SUBSCRIPTION-2026</span>
                    <span>- Kod wydawany po opłaceniu subskrypcji</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded-md font-bold">ADMIN-PRO</span>
                    <span>- Twój osobisty klucz administratora</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Operacje na bazie danych (JSON)
                </span>
                <p className="text-xs text-slate-500">
                  Eksportuj pełną bazę do pliku JSON lub wgraj dane z innego środowiska:
                </p>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const dataStr = JSON.stringify({ measurements, profile }, null, 2);
                      const blob = new Blob([dataStr], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `pulsivio-admin-backup-${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Pobierz zrzut JSON ({measurements.length} pomiarów)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-mono">
            Pulsivio Admin Console • Authorized: pirat123451@gmail.com
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl text-xs cursor-pointer hover:bg-slate-800"
          >
            Zamknij panel
          </button>
        </div>

      </div>
    </div>
  );
};
