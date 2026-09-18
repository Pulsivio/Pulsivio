import React, { useState } from 'react';
import { X, Check, Cloud, RefreshCw, LogOut, ArrowRight, ShieldCheck } from 'lucide-react';
import { Measurement, PatientProfile } from '../../types';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { email: string; name: string; picture?: string } | null;
  onSignIn: (email: string, name: string) => Promise<void>;
  onSignOut: () => void;
  onSyncNow: () => Promise<void>;
  isSyncing: boolean;
  totalMeasurements: number;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSignIn,
  onSignOut,
  onSyncNow,
  isSyncing,
  totalMeasurements
}) => {
  const [emailInput, setEmailInput] = useState('pirat123451@gmail.com');
  const [nameInput, setNameInput] = useState('Konto Google');
  const [statusMsg, setStatusMsg] = useState('');

  if (!isOpen) return null;

  const handleQuickSignIn = async (email: string, name: string) => {
    setStatusMsg('Łączenie z kontem Google i pobieranie danych...');
    try {
      await onSignIn(email, name);
      setStatusMsg('Pomyślnie połączono! Twoja historia jest zsynchronizowana.');
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (e) {
      setStatusMsg('Nie udało się zalogować.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in my-auto">
        
        {/* Header with Google Colors Accent */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-xs p-2">
              <svg className="w-full h-full" viewBox="0 0 24 24">
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
            <div>
              <h3 className="font-black text-base">Konto Google & Chmura</h3>
              <p className="text-xs text-slate-400">Automatyczna synchronizacja historii</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij okno logowania Google"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 active:scale-95 cursor-pointer transition-all touch-manipulation"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {currentUser ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-400/40 shrink-0">
                  {currentUser.email.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      Zalogowano przez Google
                    </span>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="text-sm font-black text-slate-900 dark:text-white truncate">
                    {currentUser.email}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Aktywnych pomiarów w chmurze: {totalMeasurements}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onSyncNow}
                  disabled={isSyncing}
                  className="flex-1 py-2.5 px-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Synchronizowanie...' : 'Wymuś synchronizację teraz'}</span>
                </button>

                <button
                  type="button"
                  onClick={onSignOut}
                  className="py-2.5 px-3 border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-900/60"
                  title="Wyloguj konto Google"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Wyloguj</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 text-xs text-sky-800 dark:text-sky-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Cloud className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>Dlaczego warto się zalogować?</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                  Gdy jesteś zalogowany kontem Google, <b>nie ważne na jakim telefonie, laptopie czy tablecie otworzysz Pulsivio — Twoja historia pomiarów wczyta się automatycznie!</b>
                </p>
              </div>

              {/* Quick 1-click Google Sign-in for user */}
              <button
                type="button"
                onClick={() => handleQuickSignIn('pirat123451@gmail.com', 'Użytkownik Google')}
                className="w-full py-3 px-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-sm flex items-center justify-center gap-3 cursor-pointer transition-all active:scale-98 group"
              >
                <div className="w-5 h-5 shrink-0">
                  <svg className="w-full h-full" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="text-xs font-black text-slate-900 dark:text-white">
                    Zaloguj: pirat123451@gmail.com
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    Kliknij, aby połączyć i wczytać historię
                  </div>
                </div>
              </button>

              {/* Custom Google Email input */}
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (emailInput.trim()) {
                    handleQuickSignIn(emailInput.trim(), nameInput.trim() || 'Użytkownik');
                  }
                }}
                className="space-y-2.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800"
              >
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Lub użyj innego adresu Gmail / Google:
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  placeholder="twoj-adres@gmail.com"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-hidden focus:border-sky-500"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
                >
                  Połącz z tym adresem Google
                </button>
              </form>
            </div>
          )}

          {statusMsg && (
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 text-center animate-fade-in border border-slate-200 dark:border-slate-700">
              {statusMsg}
            </div>
          )}

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              Zamknij
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
