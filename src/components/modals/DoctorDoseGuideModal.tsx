import React, { useState, useEffect } from 'react';
import { X, Pill, Bell, Check, AlertTriangle, Clock, Info, ShieldAlert, Sparkles } from 'lucide-react';

interface DoctorDoseGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  latestSys?: number;
  latestDia?: number;
}

export const DoctorDoseGuideModal: React.FC<DoctorDoseGuideModalProps> = ({
  isOpen,
  onClose,
  latestSys,
  latestDia,
}) => {
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(() => {
    return localStorage.getItem('pulsivio_dose_reminders_active') === 'true';
  });
  const [morningTime, setMorningTime] = useState<string>(() => {
    return localStorage.getItem('pulsivio_reminder_morning_time') || '07:30';
  });
  const [noonTime, setNoonTime] = useState<string>(() => {
    return localStorage.getItem('pulsivio_reminder_noon_time') || '13:00';
  });
  const [eveningTime, setEveningTime] = useState<string>(() => {
    return localStorage.getItem('pulsivio_reminder_evening_time') || '19:30';
  });
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [notificationPermission, setNotificationPermission] = useState<string>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleReminders = async () => {
    const nextVal = !remindersEnabled;
    setRemindersEnabled(nextVal);
    localStorage.setItem('pulsivio_dose_reminders_active', String(nextVal));

    if (nextVal && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        try {
          const perm = await Notification.requestPermission();
          setNotificationPermission(perm);
          if (perm === 'granted') {
            new Notification('Pulsivio: Powiadomienia włączone', {
              body: 'System przypomni Ci o kontroli ciśnienia i dawkach leków!',
              icon: '/icons/icon-192x192.png'
            });
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  const handleSaveTimes = () => {
    localStorage.setItem('pulsivio_reminder_morning_time', morningTime);
    localStorage.setItem('pulsivio_reminder_noon_time', noonTime);
    localStorage.setItem('pulsivio_reminder_evening_time', eveningTime);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Check current status based on latest reading
  let currentDoseStatus = null;
  if (latestSys !== undefined && latestDia !== undefined) {
    if (latestSys >= 140 || latestDia >= 90) {
      currentDoseStatus = {
        type: 'high',
        title: 'Ciśnienie ≥ 140/90 mmHg',
        dose: 'Cała tabletka (1.0 tabl.)',
        bg: 'bg-rose-500/10 border-rose-500/40 text-rose-200',
        badge: 'bg-rose-600 text-white',
        desc: 'Zgodnie z wytycznymi Twojej lekarki przy ciśnieniu 140/90 lub wyższym'
      };
    } else if (latestSys >= 130 || latestDia >= 80) {
      currentDoseStatus = {
        type: 'medium',
        title: 'Ciśnienie 130–139 / 80–89 mmHg',
        dose: 'Połówka tabletki (½ tabl.)',
        bg: 'bg-amber-500/10 border-amber-500/40 text-amber-200',
        badge: 'bg-amber-500 text-slate-950 font-black',
        desc: 'Zgodnie z wytycznymi Twojej lekarki przy ciśnieniu 130/80 do 139/89'
      };
    } else {
      currentDoseStatus = {
        type: 'normal',
        title: 'Ciśnienie < 130/80 mmHg',
        dose: 'Brak dodatkowej dawki',
        bg: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200',
        badge: 'bg-emerald-600 text-white',
        desc: 'Ciśnienie optymalne/prawidłowe. Przyjmuj tylko stałe leki poranne według wskazań.'
      };
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl text-white my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4 bg-gradient-to-r from-rose-900/40 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400">
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                Wytyczne Lekarki i Dawkowanie Leku
              </h2>
              <p className="text-xs text-slate-400">
                Spersonalizowana reguła zalecona przez lekarza prowadzącego
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Current reading contextual card */}
          {currentDoseStatus && (
            <div className={`p-4 rounded-2xl border ${currentDoseStatus.bg} space-y-2`}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Twój ostatni pomiar: {latestSys}/{latestDia} mmHg
                </span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold shadow-xs ${currentDoseStatus.badge}`}>
                  {currentDoseStatus.dose}
                </span>
              </div>
              <div className="text-sm font-semibold text-white">
                {currentDoseStatus.title}
              </div>
              <div className="text-xs text-slate-300">
                {currentDoseStatus.desc}
              </div>
            </div>
          )}

          {/* Two main rules */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Twoja osobista tabela dawek:</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Box 1: 130/80 - half pill */}
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">Stan pośredni</span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-500 text-black text-xs font-black">
                    ½ tabletki
                  </span>
                </div>
                <div className="text-lg font-black text-white">
                  130/80 – 139/89
                  <span className="text-xs font-normal text-slate-400 ml-1">mmHg</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Gdy ciśnienie wynosi 130/80 lub więcej (ale poniżej 140/90), przyjmujesz <strong>połówkę tabletki</strong>.
                </p>
              </div>

              {/* Box 2: 140/90 - whole pill */}
              <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-300">Nadciśnienie</span>
                  <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-xs font-black">
                    1 cała tabletka
                  </span>
                </div>
                <div className="text-lg font-black text-white">
                  ≥ 140/90
                  <span className="text-xs font-normal text-slate-400 ml-1">mmHg</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Gdy ciśnienie wynosi 140/90 lub więcej, przyjmujesz <strong>całą tabletkę</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Reminders setup */}
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">
                    Powiadomienia i przypomnienia o lekach
                  </div>
                  <div className="text-xs text-slate-400">
                    Powiadomienia przeglądarkowe w godzinach pomiarów
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggleReminders}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                  remindersEnabled
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {remindersEnabled ? 'Włączone ✓' : 'Włącz'}
              </button>
            </div>

            {remindersEnabled && (
              <div className="space-y-3 pt-2 border-t border-slate-700/60 animate-fade-in">
                <span className="text-xs text-slate-400 block">
                  Godziny kontroli ciśnienia i przyjęcia leków:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-amber-300 block mb-1">
                      ☀️ Rano
                    </label>
                    <input
                      type="time"
                      value={morningTime}
                      onChange={e => setMorningTime(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-cyan-300 block mb-1">
                      🌤️ Południe
                    </label>
                    <input
                      type="time"
                      value={noonTime}
                      onChange={e => setNoonTime(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-purple-300 block mb-1">
                      🌙 Wieczór
                    </label>
                    <input
                      type="time"
                      value={eveningTime}
                      onChange={e => setEveningTime(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-mono text-center"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">
                    Status uprawnień systemowych:{' '}
                    <span className="font-bold text-sky-400">
                      {notificationPermission === 'granted' ? 'Zezwolono' : 'Wymaga akceptacji'}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={handleSaveTimes}
                    className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors"
                  >
                    {savedSuccess ? 'Zapisano ✓' : 'Zapisz godziny'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Medical disclaimer */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
            <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <p>
              Aplikacja podpowiada dawkowanie ściśle według instrukcji Twojej lekarki. W razie nagłego skoku ciśnienia (&gt;180/110 mmHg), duszności lub bólu w klatce piersiowej niezwłocznie wezwij pogotowie ratunkowe (112).
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            Plan leczenia zsynchronizowany z dziennikiem
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm"
          >
            Rozumiem, dziękuję
          </button>
        </div>

      </div>
    </div>
  );
};
