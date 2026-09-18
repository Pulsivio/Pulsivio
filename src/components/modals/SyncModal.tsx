import React, { useState } from 'react';
import { X, Smartphone, Monitor, RefreshCw, Check, Copy, ArrowRight, Download, Upload, Cloud, FileJson } from 'lucide-react';
import { Measurement, PatientProfile } from '../../types';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncCode: string;
  measurements: Measurement[];
  profile: PatientProfile;
  onApplySyncedData: (measurements: Measurement[], profile: PatientProfile) => void;
  onOpenGoogleAuth?: () => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  syncCode,
  measurements,
  profile,
  onApplySyncedData,
  onOpenGoogleAuth
}) => {
  const [activeTab, setActiveTab] = useState<'code' | 'google' | 'file'>('google');
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [inputCode, setInputCode] = useState('');

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(syncCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Push current data to cloud under this device's syncCode
  const handlePushSync = async () => {
    setIsSyncing(true);
    setStatusMsg('');
    try {
      const res = await fetch(`/api/sync/${syncCode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ measurements, profile })
      });
      if (res.ok) {
        setStatusMsg('Wysłano pomiary do chmury! Wpisz ten kod na drugim urządzeniu.');
      } else {
        setStatusMsg('Wystąpił błąd synchronizacji.');
      }
    } catch (e) {
      setStatusMsg('Błąd połączenia z serwerem synchronizacji.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Pull data from cloud using another code
  const handlePullFromCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = inputCode.trim().toUpperCase();
    if (!code) return;

    setIsSyncing(true);
    setStatusMsg('');
    try {
      const res = await fetch(`/api/sync/${code}`);
      const data = await res.json();
      if (data && Array.isArray(data.measurements) && data.measurements.length > 0) {
        onApplySyncedData(data.measurements, data.profile || profile);
        setStatusMsg(`Pomyślnie pobrano ${data.measurements.length} pomiarów z urządzenia ${code}!`);
      } else {
        setStatusMsg(`Brak danych dla kodu ${code} lub kod jeszcze nie wysłał danych.`);
      }
    } catch (e) {
      setStatusMsg('Nie udało się pobrać danych.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Export JSON file
  const handleExportJSON = () => {
    const dataStr = JSON.stringify({ measurements, profile, exportDate: new Date().toISOString() }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pulsivio-historia-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMsg('Pobrano plik kopii zapasowej. Prześlij go na nowy telefon i wgraj!');
  };

  // Import JSON file
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.measurements)) {
          onApplySyncedData(parsed.measurements, parsed.profile || profile);
          setStatusMsg(`Przywrócono ${parsed.measurements.length} pomiarów z pliku!`);
        } else if (Array.isArray(parsed)) {
          onApplySyncedData(parsed, profile);
          setStatusMsg(`Przywrócono ${parsed.length} pomiarów z pliku!`);
        }
      } catch (err) {
        setStatusMsg('Błąd: nieprawidłowy format pliku JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-indigo-600 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <Monitor className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-black text-base">Synchronizacja & Przenoszenie Historii</h3>
              <p className="text-xs text-sky-100">Telefon ↔ PC ↔ Nowy telefon</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/15 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('google')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'google'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            ☁️ Konto Google
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'code'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            📱 Kod 6-znakowy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'file'
                ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            📁 Plik kopii zapasowej
          </button>
        </div>

        <div className="p-5 space-y-4">
          
          {/* TAB 1: Google Account */}
          {activeTab === 'google' && (
            <div className="space-y-3.5">
              <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>Automatyczna chmura Google (Najwygodniejsza)</span>
                </div>
                <p>
                  Wystarczy, że zalogujesz się swoim kontem Google na telefonie oraz na komputerze. Każdy nowy pomiar jest natychmiast synchronizowany!
                </p>
                {profile.googleAccount ? (
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 font-medium border border-sky-300 dark:border-sky-700 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">Połączone konto:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{profile.googleAccount.email}</span>
                    </div>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">✓ Aktywne</span>
                  </div>
                ) : (
                  <div className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-xl border border-amber-200 dark:border-amber-900">
                    ⚠️ Nie jesteś jeszcze zalogowany kontem Google.
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenGoogleAuth) onOpenGoogleAuth();
                }}
                className="w-full py-3 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span>{profile.googleAccount ? 'Zarządzaj kontem Google' : 'Zaloguj przez konto Google'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TAB 2: 6-char Device Code */}
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-2xl p-4 text-center">
                <span className="text-xs font-bold text-sky-700 dark:text-sky-300 uppercase tracking-wider block mb-1">
                  Twój aktywny kod urządzenia:
                </span>
                <div className="text-3xl font-mono font-black text-slate-900 dark:text-white tracking-widest my-2">
                  {syncCode}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-sky-100 transition-colors cursor-pointer shadow-2xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Skopiowano kod' : 'Kopiuj kod'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePushSync}
                    disabled={isSyncing}
                    className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Wyślij do chmury</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handlePullFromCode} className="space-y-2 bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Pobierz historię z drugiego urządzenia:
                </label>
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={e => setInputCode(e.target.value.toUpperCase())}
                    placeholder="np. AB12CD"
                    maxLength={8}
                    className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase outline-hidden focus:border-sky-500"
                  />
                  <button
                    type="submit"
                    disabled={!inputCode.trim() || isSyncing}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Pobierz</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: File Backup */}
          {activeTab === 'file' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2">
                  <FileJson className="w-4 h-4 text-emerald-500" />
                  <span>Kopia zapasowa w pliku (.json)</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Idealne do bezpowrotnego przeniesienia na nowy telefon lub przesłania mailem/WhatsAppem:
                </p>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>1. Pobierz plik historii</span>
                  </button>

                  <label className="flex-1 py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs text-center">
                    <Upload className="w-4 h-4" />
                    <span>2. Wgraj plik na nowym urządzeniu</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportFile}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Feedback Status */}
          {statusMsg && (
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 text-center animate-fade-in border border-slate-200 dark:border-slate-700">
              {statusMsg}
            </div>
          )}

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 py-1 cursor-pointer"
            >
              Zamknij
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

