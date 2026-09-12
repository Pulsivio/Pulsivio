import React, { useState } from 'react';
import { Volume2, Mic, Plus, PhoneCall, CheckCircle, AlertTriangle, AlertCircle, Heart, ChevronRight, X, ArrowLeft } from 'lucide-react';
import { Measurement, Language, UserProfile } from '../types';
import { translations } from '../i18n';
import { classifyBloodPressure } from '../utils/bpClassification';
import { speakText } from '../utils/speech';

interface SeniorViewProps {
  measurements: Measurement[];
  onAddMeasurement: (m: Omit<Measurement, 'id' | 'timestamp'>) => void;
  onOpenAssistant: () => void;
  lang: Language;
  profile: UserProfile;
  onExitSeniorMode: () => void;
  onOpenCaregivers?: () => void;
}

export const SeniorView: React.FC<SeniorViewProps> = ({
  measurements,
  onAddMeasurement,
  onOpenAssistant,
  lang,
  profile,
  onExitSeniorMode,
  onOpenCaregivers,
}) => {
  const t = translations[lang] || translations.pl;
  const lastMeasurement = measurements[0] || null;
  const classification = lastMeasurement
    ? classifyBloodPressure(lastMeasurement.systolic, lastMeasurement.diastolic, lang)
    : null;

  // Senior Quick Add Modal State
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [sys, setSys] = useState<number>(120);
  const [dia, setDia] = useState<number>(80);
  const [pul, setPul] = useState<number>(70);
  const [period, setPeriod] = useState<'morning' | 'noon' | 'evening' | 'extra'>('morning');

  // Handle TTS Readout of latest measurement
  const handleReadLatest = () => {
    if (!lastMeasurement) {
      speakText('Brak zapisanych pomiarów w dzienniku.', lang, true);
      return;
    }
    const textToSpeak = `${t.seniorLastReading}: ${lastMeasurement.systolic} na ${lastMeasurement.diastolic}. ${t.seniorPulseLabel}: ${lastMeasurement.pulse || 'brak'}. ${classification?.label || ''}. ${classification?.advice || ''}`;
    speakText(textToSpeak, lang, true);
  };

  const handleSaveQuick = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    onAddMeasurement({
      systolic: sys,
      diastolic: dia,
      pulse: pul,
      arm: 'left',
      date: dateStr,
      time: timeStr,
      period: period,
      tags: ['W spoczynku'],
      notes: 'Zapisano w trybie seniora',
      feeling: 'normal',
    });

    setShowQuickAdd(false);
    speakText(`Zapisano pomiar: ${sys} na ${dia}, puls ${pul}.`, lang, true);
  };

  return (
    <div className="mx-auto max-w-3xl px-3 py-4 sm:px-6 sm:py-6 space-y-6">
      
      {/* Top Banner with Easy Exit and Pulsivio Avatar */}
      <div className="flex items-center justify-between gap-2 rounded-2xl bg-amber-500/15 border border-amber-500/30 p-3.5 dark:bg-amber-950/40">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl overflow-hidden shadow-xs ring-1 ring-amber-500/30 bg-slate-950">
            <img
              src="/pulsify_avatar.png"
              alt="Pulsivio"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white">
              Pulsivio • {t.seniorMode}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {t.seniorTitle}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onExitSeniorMode}
          className="rounded-xl bg-white px-3 py-2 text-xs sm:text-sm font-bold text-slate-800 shadow hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-all active:scale-95"
        >
          {t.seniorModeExit}
        </button>
      </div>

      {/* Main Big Voice Button (Primary Requirement) */}
      <div className="rounded-3xl bg-gradient-to-br from-rose-600 via-red-600 to-rose-700 p-5 sm:p-6 text-white shadow-xl shadow-rose-600/20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-rose-100">
              <Mic className="h-4 w-4 animate-pulse text-white" />
              {t.seniorVoiceAssistantPill || (lang === 'pl' ? 'Asystent Głosowy' : 'Voice Assistant')}
            </span>
            <h3 className="mt-2 text-xl sm:text-2xl font-black tracking-tight">
              {t.seniorVoiceBigBtn}
            </h3>
            <p className="mt-1 text-sm text-rose-100 max-w-md">
              {t.seniorVoiceSub}
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenAssistant}
            id="senior-voice-assistant-main-btn"
            className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 text-base sm:text-lg font-extrabold text-rose-700 shadow-lg hover:bg-rose-50 active:scale-98 transition-all cursor-pointer"
          >
            <Mic className="h-6 w-6 text-rose-600 animate-bounce" />
            <span>{t.seniorVoicePressToSpeak || (lang === 'pl' ? 'Naciśnij i mów' : 'Tap and speak')}</span>
          </button>
        </div>
      </div>

      {/* Latest Reading Large Display Card */}
      {lastMeasurement ? (
        <div className="rounded-3xl border-2 border-slate-200 bg-white p-5 sm:p-6 shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">
              {t.seniorLastReading} ({lastMeasurement.date} {lastMeasurement.time})
            </span>
            <button
              type="button"
              onClick={handleReadLatest}
              id="senior-read-loud-btn"
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              <Volume2 className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              <span>{t.seniorSpeakReadingBtn}</span>
            </button>
          </div>

          {/* Huge Numbers */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-5 text-center">
            {/* Systolic */}
            <div className="rounded-2xl bg-slate-50 p-3 sm:p-4 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
              <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 block">
                {t.seniorSystolicLabel}
              </span>
              <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                {lastMeasurement.systolic}
              </span>
              <span className="text-xs font-semibold text-slate-400 block mt-0.5">mmHg</span>
            </div>

            {/* Diastolic */}
            <div className="rounded-2xl bg-slate-50 p-3 sm:p-4 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
              <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 block">
                {t.seniorDiastolicLabel}
              </span>
              <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                {lastMeasurement.diastolic}
              </span>
              <span className="text-xs font-semibold text-slate-400 block mt-0.5">mmHg</span>
            </div>

            {/* Pulse */}
            <div className="col-span-2 sm:col-span-1 rounded-2xl bg-slate-50 p-3 sm:p-4 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
              <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 block">
                {t.seniorPulseLabel}
              </span>
              <span className="text-4xl sm:text-5xl font-black text-rose-600 dark:text-rose-400 tracking-tight flex items-center justify-center gap-1">
                <Heart className="h-6 w-6 fill-rose-500 text-rose-500 inline" />
                {lastMeasurement.pulse || '--'}
              </span>
              <span className="text-xs font-semibold text-slate-400 block mt-0.5">ud./min</span>
            </div>
          </div>

          {/* Simple Colored Status Banner */}
          {classification && (
            <div className={`rounded-2xl p-4 sm:p-5 border flex items-start gap-3.5 ${classification.bgLight} ${classification.borderClass}`}>
              {classification.level === 'optimal' || classification.level === 'normal' ? (
                <CheckCircle className="h-7 w-7 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              ) : (
                <AlertTriangle className="h-7 w-7 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              )}
              <div>
                <span className={`inline-block text-sm sm:text-base font-black ${classification.color}`}>
                  {classification.label}
                </span>
                <p className="mt-1 text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
                  {classification.advice}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-3xl border-2 border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
          <p className="text-lg font-bold text-slate-600 dark:text-slate-300">
            {t.listEmpty}
          </p>
        </div>
      )}

      {/* Two Big Action Buttons: Add Reading + Call Caregiver */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        
        {/* Large Add Measurement Button */}
        <button
          type="button"
          onClick={() => setShowQuickAdd(true)}
          id="senior-add-measurement-btn"
          className="flex items-center justify-center gap-3 rounded-2xl bg-emerald-600 p-5 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 active:scale-98 transition-all cursor-pointer text-left"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
            <Plus className="h-7 w-7 text-white stroke-[3]" />
          </div>
          <div>
            <div className="text-base sm:text-lg font-black tracking-tight leading-snug">
              {t.seniorAddManualBtnShort || (lang === 'pl' ? 'DODAJ POMIAR' : 'ADD READING')}
            </div>
            <div className="text-xs sm:text-sm text-emerald-100 font-medium">
              {t.seniorAddManualSub || (lang === 'pl' ? 'Duże, wygodne przyciski' : 'Large, comfortable buttons')}
            </div>
          </div>
        </button>

        {/* Emergency / Caregiver Quick Phone */}
        <div className="flex flex-col gap-1.5">
          <a
            href={`tel:${profile.emergencyPhone || '112'}`}
            id="senior-call-caregiver-btn"
            className="flex items-center justify-center gap-3 rounded-2xl bg-blue-600 p-5 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 active:scale-98 transition-all cursor-pointer text-left"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
              <PhoneCall className="h-7 w-7 text-white" />
            </div>
            <div className="min-w-0">
              <div className="text-base sm:text-lg font-black tracking-tight leading-snug truncate">
                {t.seniorCallCaregiver}
              </div>
              <div className="text-xs sm:text-sm text-blue-100 font-medium truncate">
                {profile.emergencyName || 'Opiekun'}: {profile.emergencyPhone || '112'}
              </div>
            </div>
          </a>
          {onOpenCaregivers && (
            <button
              type="button"
              onClick={onOpenCaregivers}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline text-center cursor-pointer py-1"
            >
              {lang === 'pl' ? '⚙️ Zmień numer lub dodaj opiekuna' : '⚙️ Change number or add caregiver'}
            </button>
          )}
        </div>
      </div>

      {/* Recent Days History (High contrast, simplified) */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        <h4 className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-300 mb-3">
          {t.seniorRecentListTitle}
        </h4>
        <div className="space-y-2.5">
          {measurements.slice(0, 4).map((m) => {
            const c = classifyBloodPressure(m.systolic, m.diastolic, lang);
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
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                      mmHg
                    </span>
                    <span className="ml-2 text-sm font-bold text-rose-600 dark:text-rose-400">
                      ❤️ {m.pulse}
                    </span>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold border ${c.badgeClass}`}>
                  {c.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal for Senior Quick Add with Big Numeric Steppers */}
      {showQuickAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-3 overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 sm:p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {t.seniorQuickAddTitle || (lang === 'pl' ? 'Wprowadź pomiar' : 'Enter Reading')}
              </h3>
              <button
                type="button"
                onClick={() => setShowQuickAdd(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuick} className="mt-4 space-y-4">
              
              {/* Systolic Stepper */}
              <div className="rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {t.seniorSystolicLabel}
                  </span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {sys} <span className="text-xs font-normal text-slate-400">mmHg</span>
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setSys((v) => Math.max(70, v - 5))}
                    className="rounded-xl bg-slate-200 py-2.5 text-sm font-black text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-white"
                  >
                    -5
                  </button>
                  <button
                    type="button"
                    onClick={() => setSys((v) => Math.max(70, v - 1))}
                    className="rounded-xl bg-slate-200 py-2.5 text-sm font-black text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-white"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => setSys((v) => Math.min(240, v + 1))}
                    className="rounded-xl bg-slate-200 py-2.5 text-sm font-black text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-white"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => setSys((v) => Math.min(240, v + 5))}
                    className="rounded-xl bg-slate-200 py-2.5 text-sm font-black text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-white"
                  >
                    +5
                  </button>
                </div>
              </div>

              {/* Diastolic Stepper */}
              <div className="rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {t.seniorDiastolicLabel}
                  </span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {dia} <span className="text-xs font-normal text-slate-400">mmHg</span>
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setDia((v) => Math.max(40, v - 5))}
                    className="rounded-xl bg-slate-200 py-2.5 text-sm font-black text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-white"
                  >
                    -5
                  </button>
                  <button
                    type="button"
                    onClick={() => setDia((v) => Math.max(40, v - 1))}
                    className="rounded-xl bg-slate-200 py-2.5 text-sm font-black text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-white"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => setDia((v) => Math.min(150, v + 1))}
                    className="rounded-xl bg-slate-200 py-2.5 text-sm font-black text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-white"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => setDia((v) => Math.min(150, v + 5))}
                    className="rounded-xl bg-slate-200 py-2.5 text-sm font-black text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-white"
                  >
                    +5
                  </button>
                </div>
              </div>

              {/* Pulse Stepper */}
              <div className="rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {t.seniorPulseLabel}
                  </span>
                  <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                    {pul} <span className="text-xs font-normal text-slate-400">ud./min</span>
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setPul((v) => Math.max(40, v - 5))}
                    className="rounded-xl bg-slate-200 py-2.5 text-sm font-black text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-white"
                  >
                    -5
                  </button>
                  <button
                    type="button"
                    onClick={() => setPul((v) => Math.max(40, v - 1))}
                    className="rounded-xl bg-slate-200 py-2.5 text-sm font-black text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-white"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => setPul((v) => Math.min(180, v + 1))}
                    className="rounded-xl bg-slate-200 py-2.5 text-sm font-black text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-white"
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() => setPul((v) => Math.min(180, v + 5))}
                    className="rounded-xl bg-slate-200 py-2.5 text-sm font-black text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-white"
                  >
                    +5
                  </button>
                </div>
              </div>

              {/* Time of Day */}
              <div className="grid grid-cols-4 gap-1.5">
                {(['morning', 'noon', 'evening', 'extra'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`rounded-xl py-2 text-xs sm:text-sm font-bold border transition-colors ${
                      period === p
                        ? 'bg-rose-500 text-white border-rose-600'
                        : 'bg-white text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {p === 'morning'
                      ? (t.morningLabel || 'Rano')
                      : p === 'noon'
                      ? (t.noonLabel || 'Południe')
                      : p === 'evening'
                      ? (t.eveningLabel || 'Wieczór')
                      : (t.extraLabel || 'Dodatkowy')}
                  </button>
                ))}
              </div>

              {/* Big Save Button */}
              <button
                type="submit"
                className="w-full rounded-2xl bg-emerald-600 py-4 text-lg font-black text-white shadow-lg hover:bg-emerald-500 active:scale-98 transition-all cursor-pointer"
              >
                {t.seniorSaveBtn || (lang === 'pl' ? 'ZAPISZ WYNIK' : 'SAVE READING')}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
