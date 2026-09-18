import React, { useState } from 'react';
import { Measurement, PatientProfile, getPTNTClassification, Period } from '../types';
import { Mic, Volume2, Plus, Phone, CheckCircle2, AlertCircle, Heart, X, Minus } from 'lucide-react';

interface Props {
  measurements: Measurement[];
  onAddMeasurement: (data: Omit<Measurement, 'id' | 'createdAt'>) => void;
  onOpenAssistant: () => void;
  lang?: string;
  profile: PatientProfile;
  onExitSeniorMode: () => void;
  onOpenCaregivers: () => void;
}

export const SeniorModeView: React.FC<Props> = ({
  measurements,
  onAddMeasurement,
  onOpenAssistant,
  profile,
  onExitSeniorMode,
  onOpenCaregivers,
}) => {
  const latest = measurements[0] || null;
  const classification = latest ? getPTNTClassification(latest.systolic, latest.diastolic) : null;

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [systolic, setSystolic] = useState<number>(120);
  const [diastolic, setDiastolic] = useState<number>(80);
  const [pulse, setPulse] = useState<number>(70);
  const [period, setPeriod] = useState<Period>('rano');

  // Text-to-speech reader for senior
  const speakReading = () => {
    if (!latest) {
      readAloud("Brak zapisanych pomiarów w dzienniku.");
      return;
    }
    const text = `Ostatni pomiar ciśnienia: ${latest.systolic} na ${latest.diastolic}. Puls: ${latest.pulse || "brak"}. ${classification?.label || ""}. ${classification?.advice || ""}`;
    readAloud(text);
  };

  const readAloud = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pl-PL';
      utterance.rate = 0.9; // Slightly slower and clearer for seniors
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSaveSenior = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    onAddMeasurement({
      systolic,
      diastolic,
      pulse,
      arm: 'lewa',
      date: dateStr,
      time: timeStr,
      period,
      tags: ['W spoczynku'],
      notes: 'Zapisano w trybie seniora',
      feeling: 'normal',
    });

    setIsQuickAddOpen(false);
    readAloud(`Zapisano pomiar: ${systolic} na ${diastolic}, puls ${pulse}.`);
  };

  return (
    <div className="mx-auto max-w-3xl px-3 py-4 sm:px-6 sm:py-6 space-y-6">
      
      {/* Senior Mode Banner */}
      <div className="flex items-center justify-between gap-2 rounded-2xl bg-amber-500/15 border border-amber-500/30 p-3.5 dark:bg-amber-950/40">
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-xs ring-1 ring-amber-500/30 bg-slate-950">
            <img
              src="/avatars/pulsivio_official_brand.jpg"
              alt="Pulsivio"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white">
              Pulsivio • Tryb Seniora
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              Twój Osobisty Dziennik Zdrowia (Duże cyfry i prosty widok)
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onExitSeniorMode}
          className="rounded-xl bg-slate-900 px-3.5 py-2 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-slate-800 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-all active:scale-95"
        >
          Tryb standardowy
        </button>
      </div>

      {/* Voice Assistant Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-rose-600 via-red-600 to-rose-700 p-5 sm:p-6 text-white shadow-xl shadow-rose-600/20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-rose-100">
              <Mic className="h-4 w-4 animate-pulse text-white" />
              Asystent Głosowy
            </span>
            <h3 className="mt-2 text-xl sm:text-2xl font-black tracking-tight">
              NACIŚNIJ I MÓW DO ASYSTENTA
            </h3>
            <p className="mt-1 text-sm text-rose-100 max-w-md">
              Podyktuj swój pomiar (np. „120 na 80 puls 70”) lub zadaj dowolne pytanie o ciśnienie
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAssistant}
            id="senior-voice-assistant-main-btn"
            className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-2xl bg-rose-950/90 border border-rose-400/40 px-6 py-4 text-base sm:text-lg font-extrabold text-white shadow-lg hover:bg-rose-950 active:scale-98 transition-all cursor-pointer"
          >
            <Mic className="h-6 w-6 text-rose-400 animate-bounce" />
            <span>Naciśnij i mów</span>
          </button>
        </div>
      </div>

      {/* Latest Reading Card */}
      {latest ? (
        <div className="rounded-3xl border-2 border-slate-200 bg-white p-5 sm:p-6 shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">
              OSTATNI POMIAR CIŚNIENIA ({latest.date} {latest.time})
            </span>
            <button
              type="button"
              onClick={speakReading}
              id="senior-read-loud-btn"
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              <Volume2 className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              <span>PRZECZYTAJ WYNIK NA GŁOS</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-5 text-center">
            <div className="rounded-2xl bg-slate-50 p-3.5 sm:p-4 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
              <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 block">
                Skurczowe (Górne)
              </span>
              <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                {latest.systolic}
              </span>
              <span className="text-xs font-semibold text-slate-400 block mt-0.5">mmHg</span>
            </div>

            <div className="rounded-2xl bg-slate-50 p-3.5 sm:p-4 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
              <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 block">
                Rozkurczowe (Dolne)
              </span>
              <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                {latest.diastolic}
              </span>
              <span className="text-xs font-semibold text-slate-400 block mt-0.5">mmHg</span>
            </div>

            <div className="col-span-2 sm:col-span-1 rounded-2xl bg-slate-50 p-3.5 sm:p-4 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
              <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 block">
                Puls (Tętno)
              </span>
              <span className="text-4xl sm:text-5xl font-black text-rose-600 dark:text-rose-400 tracking-tight flex items-center justify-center gap-1.5">
                <Heart className="h-7 w-7 fill-rose-500 text-rose-500 inline" />
                {latest.pulse || '--'}
              </span>
              <span className="text-xs font-semibold text-slate-400 block mt-0.5">ud./min</span>
            </div>
          </div>

          {classification && (
            <div className={`rounded-2xl p-4 sm:p-5 border flex items-start gap-3.5 ${classification.bgClass} ${classification.borderClass}`}>
              {classification.isNormalHome ? (
                <CheckCircle2 className="h-7 w-7 shrink-0 text-emerald-500 mt-0.5" />
              ) : (
                <AlertCircle className="h-7 w-7 shrink-0 text-amber-500 mt-0.5" />
              )}
              <div>
                <span className={`inline-block text-base font-black ${classification.colorClass}`}>
                  {classification.label}
                </span>
                <p className="mt-1 text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200">
                  {classification.advice}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-3xl border-2 border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
          <p className="text-lg font-bold text-slate-600 dark:text-slate-300">
            Brak pomiarów w dzienniku. Dodaj swój pierwszy pomiar poniżej!
          </p>
        </div>
      )}

      {/* Big Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <button
          type="button"
          onClick={() => setIsQuickAddOpen(true)}
          id="senior-add-measurement-btn"
          className="flex items-center justify-center gap-3.5 rounded-2xl bg-emerald-600 p-5 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 active:scale-98 transition-all cursor-pointer text-left"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
            <Plus className="h-7 w-7 text-white stroke-[3]" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-black tracking-tight leading-snug">
              DODAJ NOWY POMIAR
            </div>
            <div className="text-xs sm:text-sm text-emerald-100 font-medium">
              Duże, wygodne przyciski
            </div>
          </div>
        </button>

        <div className="flex flex-col gap-1.5">
          <a
            href={`tel:${profile.emergencyPhone || '112'}`}
            id="senior-call-caregiver-btn"
            className="flex items-center justify-center gap-3.5 rounded-2xl bg-blue-600 p-5 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 active:scale-98 transition-all cursor-pointer text-left"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <Phone className="h-7 w-7 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-base sm:text-lg font-black tracking-tight leading-snug truncate">
                ZADZWOŃ DO BLISKIEGO
              </div>
              <div className="text-xs sm:text-sm text-blue-100 font-medium truncate">
                {profile.emergencyName || 'Opiekun'}: {profile.emergencyPhone || '112'}
              </div>
            </div>
          </a>
          <button
            type="button"
            onClick={onOpenCaregivers}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline text-center cursor-pointer py-1"
          >
            ⚙️ Zmień numer lub dodaj opiekuna
          </button>
        </div>
      </div>

      {/* Recent Measurements List */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <h4 className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-300 mb-3">
          OSTATNIE POMIARY
        </h4>
        <div className="space-y-2.5">
          {measurements.slice(0, 4).map(m => {
            const info = getPTNTClassification(m.systolic, m.diastolic);
            return (
              <div
                key={`senior-m-${m.id}`}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/60"
              >
                <div>
                  <div className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                    {m.date} • {m.time}
                  </div>
                  <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                    {m.systolic} / {m.diastolic}{' '}
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400">mmHg</span>
                    <span className="ml-2 text-sm font-bold text-rose-600 dark:text-rose-400">
                      ❤️ {m.pulse}
                    </span>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold border ${info.badgeClass}`}>
                  {info.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Senior Stepper Add Modal */}
      {isQuickAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-3 overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 sm:p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-auto animate-fade-in space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                Wprowadź pomiar
              </h3>
              <button
                type="button"
                onClick={() => setIsQuickAddOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSenior} className="space-y-4">
              
              {/* Stepper SYS */}
              <div className="rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Skurczowe (Górne)
                  </span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {systolic} mmHg
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSystolic(prev => Math.max(60, prev - 5))}
                    className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-base font-black hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    -5
                  </button>
                  <button
                    type="button"
                    onClick={() => setSystolic(prev => Math.max(60, prev - 1))}
                    className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-base font-black hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => setSystolic(prev => Math.min(240, prev + 1))}
                    className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-base font-black hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => setSystolic(prev => Math.min(240, prev + 5))}
                    className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-base font-black hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    +5
                  </button>
                </div>
              </div>

              {/* Stepper DIA */}
              <div className="rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Rozkurczowe (Dolne)
                  </span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {diastolic} mmHg
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDiastolic(prev => Math.max(40, prev - 5))}
                    className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-base font-black hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    -5
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiastolic(prev => Math.max(40, prev - 1))}
                    className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-base font-black hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiastolic(prev => Math.min(150, prev + 1))}
                    className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-base font-black hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiastolic(prev => Math.min(150, prev + 5))}
                    className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-base font-black hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    +5
                  </button>
                </div>
              </div>

              {/* Stepper Pulse */}
              <div className="rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Puls (Tętno)
                  </span>
                  <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                    {pulse} bpm
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPulse(prev => Math.max(30, prev - 5))}
                    className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-base font-black hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    -5
                  </button>
                  <button
                    type="button"
                    onClick={() => setPulse(prev => Math.max(30, prev - 1))}
                    className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-base font-black hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => setPulse(prev => Math.min(200, prev + 1))}
                    className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-base font-black hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => setPulse(prev => Math.min(200, prev + 5))}
                    className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-base font-black hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    +5
                  </button>
                </div>
              </div>

              {/* Period selection */}
              <div className="flex items-center gap-2 pt-1">
                {(['rano', 'poludnie', 'wieczor'] as Period[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                      period === p
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {p === 'rano' ? '☀️ Rano' : p === 'poludnie' ? '🌤️ Południe' : '🌙 Wieczór'}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsQuickAddOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-base shadow-lg cursor-pointer transition-all"
                >
                  Zapisz pomiar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
