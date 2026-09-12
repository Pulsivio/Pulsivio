import React, { useState, useEffect } from 'react';
import { Plus, Mic, Check, AlertCircle, Heart, Clock, Calendar, ShieldCheck, SunMedium, Sun, Sunset, PlusCircle, Info, X } from 'lucide-react';
import { Measurement, Language, TimePeriod, Feeling } from '../types';
import { translations } from '../i18n';
import { classifyBloodPressure } from '../utils/bpClassification';

interface MeasurementFormProps {
  onSave: (data: Omit<Measurement, 'id' | 'timestamp'>) => void;
  lang: Language;
  onOpenVoiceAssistant?: () => void;
  initialDate?: string;
  onCancel?: () => void;
  onClose?: () => void;
}

export const MeasurementForm: React.FC<MeasurementFormProps> = ({
  onSave,
  lang,
  onOpenVoiceAssistant,
  initialDate,
  onCancel,
  onClose,
}) => {
  const handleClose = onClose || onCancel;
  const t = translations[lang] || translations.pl;

  const now = new Date();
  const defaultDate = initialDate || now.toISOString().split('T')[0];

  const getAutoPeriod = (): TimePeriod => {
    const hr = now.getHours();
    if (hr >= 5 && hr < 11) return 'morning';
    if (hr >= 11 && hr < 17) return 'noon';
    if (hr >= 17 && hr < 22) return 'evening';
    return 'extra';
  };

  // Puste pola na start z przykładowymi placeholderami (np. 120, 80, 72)
  const [systolic, setSystolic] = useState<string>('');
  const [diastolic, setDiastolic] = useState<string>('');
  const [pulse, setPulse] = useState<string>('');
  const [bloodSugar, setBloodSugar] = useState<string>('');
  const [arm, setArm] = useState<'left' | 'right'>('left');
  const [date, setDate] = useState<string>(defaultDate);
  // Wyzerowana godzina na start - do ręcznego wpisania lub kliknięcia "+ Wstaw teraz"
  const [time, setTime] = useState<string>('');
  const [period, setPeriod] = useState<TimePeriod>(getAutoPeriod());
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [feeling, setFeeling] = useState<Feeling>('normal');
  const [notes, setNotes] = useState<string>('');
  const [justSaved, setJustSaved] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');

  // Synchronize time with period
  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (newTime) {
      const parts = newTime.split(':');
      if (parts.length >= 1) {
        const hr = parseInt(parts[0], 10);
        if (!isNaN(hr)) {
          if (hr >= 5 && hr < 11) setPeriod('morning');
          else if (hr >= 11 && hr < 17) setPeriod('noon');
          else if (hr >= 17 && hr < 22) setPeriod('evening');
          else setPeriod('extra');
        }
      }
    }
  };

  const handleSetCurrentTime = () => {
    const n = new Date();
    const current = `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`;
    handleTimeChange(current);
  };

  const setDateToday = () => {
    setDate(new Date().toISOString().split('T')[0]);
  };

  const setDateYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    setDate(d.toISOString().split('T')[0]);
  };

  const setDateDayBefore = () => {
    const d = new Date();
    d.setDate(d.getDate() - 2);
    setDate(d.toISOString().split('T')[0]);
  };

  useEffect(() => {
    if (initialDate) {
      setDate(initialDate);
    }
  }, [initialDate]);

  const numSys = parseInt(systolic, 10);
  const numDia = parseInt(diastolic, 10);
  const hasBpValues = !isNaN(numSys) && !isNaN(numDia) && numSys > 0 && numDia > 0;
  const currentClassification = hasBpValues ? classifyBloodPressure(numSys, numDia, lang) : null;

  const availableTags = [
    { id: 'before_meds', label: t.tagBeforeMeds },
    { id: 'after_meds', label: t.tagAfterMeds },
    { id: 'resting', label: t.tagResting },
    { id: 'after_walk', label: t.tagAfterWalk },
    { id: 'coffee', label: t.tagCoffee },
    { id: 'stress', label: t.tagStress },
  ];

  const feelings: { id: Feeling; label: string }[] = [
    { id: 'great', label: t.feelingGreat },
    { id: 'normal', label: t.feelingNormal },
    { id: 'weak', label: t.feelingWeak },
    { id: 'dizzy', label: t.feelingDizzy },
    { id: 'headache', label: t.feelingHeadache },
    { id: 'stressed', label: t.feelingStressed },
  ];

  const toggleTag = (tagLabel: string) => {
    if (selectedTags.includes(tagLabel)) {
      setSelectedTags(selectedTags.filter((tg) => tg !== tagLabel));
    } else {
      setSelectedTags([...selectedTags, tagLabel]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nSys = parseInt(systolic, 10);
    const nDia = parseInt(diastolic, 10);
    const nPulse = pulse ? parseInt(pulse, 10) : undefined;

    if (isNaN(nSys) || isNaN(nDia)) {
      setValidationError(lang === 'pl' ? 'Wpisz wartości ciśnienia (SYS i DIA).' : 'Please enter blood pressure values (SYS and DIA).');
      return;
    }

    if (nSys < 50 || nSys > 280 || nDia < 30 || nDia > 180) {
      setValidationError(lang === 'pl' ? 'Wprowadzone wartości ciśnienia wykraczają poza standardowy zakres.' : 'Blood pressure values out of range.');
      return;
    }

    setValidationError('');

    onSave({
      systolic: nSys,
      diastolic: nDia,
      pulse: nPulse,
      bloodSugar: bloodSugar ? parseFloat(bloodSugar) : undefined,
      arm,
      date,
      time,
      period,
      tags: selectedTags,
      notes,
      feeling,
    });

    setSystolic('');
    setDiastolic('');
    setPulse('');
    setTime(''); // reset/zero-out time for next entry
    setNotes('');
    setBloodSugar('');
    setSelectedTags([]);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 3000);
  };

  return (
    <div className="mx-auto max-w-2xl px-3 py-4 sm:px-6 sm:py-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        
        {/* Form Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t.formTitle}
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {t.formSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            {onOpenVoiceAssistant && (
              <button
                type="button"
                onClick={onOpenVoiceAssistant}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs sm:text-sm font-semibold text-rose-700 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-900/50 cursor-pointer transition-colors"
                title={lang === 'pl' ? 'Podyktuj pomiar głosem' : 'Dictate measurement'}
              >
                <Mic className="h-4 w-4 animate-pulse text-rose-600 dark:text-rose-400" />
                <span>{t.dictateValues}</span>
              </button>
            )}
            {handleClose && (
              <button
                type="button"
                onClick={handleClose}
                aria-label={lang === 'pl' ? 'Zamknij formularz' : 'Close form'}
                title={lang === 'pl' ? 'Zamknij i wróć do dziennika' : 'Close and return to diary'}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {validationError && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-amber-800 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300 text-xs sm:text-sm font-semibold">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
            <span>{validationError}</span>
          </div>
        )}

        {justSaved && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 text-sm font-semibold animate-fade-in">
            <Check className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>{t.measurementSaved}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-6">
          
          {/* Main Triple Values: SYS / DIA / PULSE */}
          <div className="grid grid-cols-1 xs:grid-cols-3 gap-3">
            
            {/* Systolic */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-700 dark:bg-slate-800/50">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                {t.sysLabel}
              </label>
              <div className="flex items-center justify-between gap-1">
                <input
                  type="number"
                  min="50"
                  max="280"
                  required
                  placeholder={lang === 'pl' ? 'np. 120' : 'e.g. 120'}
                  value={systolic}
                  onChange={(e) => {
                    setSystolic(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  className="w-full text-2xl sm:text-3xl font-black text-slate-900 dark:text-white bg-transparent outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 placeholder:font-normal"
                />
                <span className="text-xs font-semibold text-slate-400">mmHg</span>
              </div>
              <div className="mt-2 flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const cur = parseInt(systolic, 10) || 120;
                    setSystolic(String(Math.max(50, cur - 5)));
                    if (validationError) setValidationError('');
                  }}
                  className="flex-1 rounded-lg bg-white py-1 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-100 dark:bg-slate-700 dark:text-white cursor-pointer"
                >
                  -5
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const cur = parseInt(systolic, 10) || 120;
                    setSystolic(String(Math.min(280, cur + 5)));
                    if (validationError) setValidationError('');
                  }}
                  className="flex-1 rounded-lg bg-white py-1 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-100 dark:bg-slate-700 dark:text-white cursor-pointer"
                >
                  +5
                </button>
              </div>
            </div>

            {/* Diastolic */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-700 dark:bg-slate-800/50">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                {t.diaLabel}
              </label>
              <div className="flex items-center justify-between gap-1">
                <input
                  type="number"
                  min="30"
                  max="180"
                  required
                  placeholder={lang === 'pl' ? 'np. 80' : 'e.g. 80'}
                  value={diastolic}
                  onChange={(e) => {
                    setDiastolic(e.target.value);
                    if (validationError) setValidationError('');
                  }}
                  className="w-full text-2xl sm:text-3xl font-black text-slate-900 dark:text-white bg-transparent outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 placeholder:font-normal"
                />
                <span className="text-xs font-semibold text-slate-400">mmHg</span>
              </div>
              <div className="mt-2 flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const cur = parseInt(diastolic, 10) || 80;
                    setDiastolic(String(Math.max(30, cur - 5)));
                    if (validationError) setValidationError('');
                  }}
                  className="flex-1 rounded-lg bg-white py-1 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-100 dark:bg-slate-700 dark:text-white cursor-pointer"
                >
                  -5
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const cur = parseInt(diastolic, 10) || 80;
                    setDiastolic(String(Math.min(180, cur + 5)));
                    if (validationError) setValidationError('');
                  }}
                  className="flex-1 rounded-lg bg-white py-1 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-100 dark:bg-slate-700 dark:text-white cursor-pointer"
                >
                  +5
                </button>
              </div>
            </div>

            {/* Pulse */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-700 dark:bg-slate-800/50">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">
                {t.pulseLabel}
              </label>
              <div className="flex items-center justify-between gap-1">
                <input
                  type="number"
                  min="30"
                  max="220"
                  placeholder={lang === 'pl' ? 'np. 72' : 'e.g. 72'}
                  value={pulse}
                  onChange={(e) => setPulse(e.target.value)}
                  className="w-full text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 bg-transparent outline-none placeholder:text-rose-300/60 dark:placeholder:text-rose-900/60 placeholder:font-normal"
                />
                <span className="text-xs font-semibold text-slate-400">bpm</span>
              </div>
              <div className="mt-2 flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const cur = parseInt(pulse, 10) || 72;
                    setPulse(String(Math.max(30, cur - 5)));
                  }}
                  className="flex-1 rounded-lg bg-white py-1 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-100 dark:bg-slate-700 dark:text-white cursor-pointer"
                >
                  -5
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const cur = parseInt(pulse, 10) || 72;
                    setPulse(String(Math.min(220, cur + 5)));
                  }}
                  className="flex-1 rounded-lg bg-white py-1 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-100 dark:bg-slate-700 dark:text-white cursor-pointer"
                >
                  +5
                </button>
              </div>
            </div>

          </div>

          {/* Live Classification Feedback Card */}
          {currentClassification ? (
            <div className={`rounded-2xl p-3 sm:p-3.5 border transition-all ${currentClassification.bgLight} ${currentClassification.borderClass}`}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className={`h-5 w-5 ${currentClassification.color}`} />
                  <span className={`text-xs sm:text-sm font-black ${currentClassification.color}`}>
                    {currentClassification.label}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white/80 dark:bg-black/40 border border-current/20">
                  {numSys}/{numDia} mmHg
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-1">
                {currentClassification.level === 'optimal'
                  ? '💚 Doskonały wynik! Twoje ciśnienie jest w strefie optymalnej (< 120/80 mmHg). Serce pracuje w idealnych warunkach.'
                  : currentClassification.level === 'normal'
                  ? '✅ Prawidłowe ciśnienie krwi (120-129 / 80-84 mmHg). Wszystko w bezpiecznej normie.'
                  : currentClassification.level === 'high_normal'
                  ? '⚠️ Ciśnienie wysokie prawidłowe (130-139 / 85-89 mmHg). Odpocznij, zadbaj o spokój i nawodnienie.'
                  : currentClassification.level === 'hypertension_1'
                  ? '🟠 Łagodne nadciśnienie (I stopień). Jeśli wynik powtarza się w kolejnych dniach, skonsultuj z lekarzem.'
                  : currentClassification.level === 'hypertension_2'
                  ? '🔴 Nadciśnienie II stopnia. Usiądź spokojnie, odpocznij i porozmawiaj z lekarzem o dobraniu dawek leków.'
                  : currentClassification.level === 'hypertension_3'
                  ? '🚨 Znacznie podwyższone ciśnienie (III stopień). Odpocznij 15 min w ciszy. W razie duszności lub bólu głowy pilnie wezwij pomoc.'
                  : '💧 Niskie ciśnienie. Wypij szklankę wody i unikaj nagłego wstawania.'}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl p-3.5 border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30 flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
              <Info className="h-4 w-4 shrink-0 text-sky-500" />
              <span className="text-xs">
                {lang === 'pl'
                  ? 'Wpisz swoje wartości ciśnienia (np. 120 i 80), aby zobaczyć ocenę PTNT.'
                  : 'Enter your blood pressure values (e.g. 120 and 80) to see PTNT classification.'}
              </span>
            </div>
          )}

          {/* Date, Time, Arm & Period (Responsive wrap) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-rose-500" />
                  <span>{t.dateLabel}</span>
                </label>
              </div>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
              {/* Quick Date Shortcuts */}
              <div className="mt-1.5 flex gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={setDateToday}
                  className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Dzisiaj
                </button>
                <button
                  type="button"
                  onClick={setDateYesterday}
                  className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Wczoraj
                </button>
                <button
                  type="button"
                  onClick={setDateDayBefore}
                  className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Przedwczoraj
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-blue-500" />
                  <span>Godzina</span>
                  <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">(ręcznie)</span>
                </label>
                {time ? (
                  <button
                    type="button"
                    onClick={() => setTime('')}
                    className="text-[11px] text-rose-500 hover:text-rose-600 dark:text-rose-400 font-bold cursor-pointer transition-colors"
                  >
                    Wyzeruj
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSetCurrentTime}
                    className="text-[11px] text-sky-600 hover:text-sky-700 dark:text-sky-400 font-bold cursor-pointer transition-colors"
                  >
                    + Wstaw teraz
                  </button>
                )}
              </div>
              <input
                type="time"
                value={time}
                placeholder="--:--"
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  {time ? `Wpisano: ${time}` : 'Wyzerowana • wpisz z palca'}
                </span>
                {!time && (
                  <button
                    type="button"
                    onClick={handleSetCurrentTime}
                    className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                  >
                    Użyj aktualnej
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {t.armLabel}
              </label>
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setArm('left')}
                  className={`rounded-xl py-2 text-xs font-bold transition-colors ${
                    arm === 'left'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {t.armLeft}
                </button>
                <button
                  type="button"
                  onClick={() => setArm('right')}
                  className={`rounded-xl py-2 text-xs font-bold transition-colors ${
                    arm === 'right'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {t.armRight}
                </button>
              </div>
            </div>
          </div>

          {/* Time of Day Periods (Pills that do NOT overflow) */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
              {t.periodLabel}
            </label>
            <div className="grid grid-cols-2 xs:grid-cols-4 gap-1.5">
              {(['morning', 'noon', 'evening', 'extra'] as TimePeriod[]).map((p) => {
                const isSelected = period === p;
                const label =
                  p === 'morning'
                    ? t.periodMorning
                    : p === 'noon'
                    ? t.periodNoon
                    : p === 'evening'
                    ? t.periodEvening
                    : (t.periodExtra || 'Dodatkowy');

                const getPeriodStyle = () => {
                  if (p === 'morning') {
                    return isSelected
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                      : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
                  }
                  if (p === 'noon') {
                    return isSelected
                      ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-xs'
                      : 'bg-sky-50 text-sky-900 border border-sky-200 hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800';
                  }
                  if (p === 'evening') {
                    return isSelected
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xs'
                      : 'bg-indigo-50 text-indigo-900 border border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800';
                  }
                  return isSelected
                    ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-xs'
                    : 'bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800';
                };

                const getPeriodIcon = () => {
                  if (p === 'morning') return <SunMedium className="h-3.5 w-3.5 shrink-0" />;
                  if (p === 'noon') return <Sun className="h-3.5 w-3.5 shrink-0" />;
                  if (p === 'evening') return <Sunset className="h-3.5 w-3.5 shrink-0" />;
                  return <PlusCircle className="h-3.5 w-3.5 shrink-0" />;
                };

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-1.5 text-xs font-bold transition-all cursor-pointer truncate ${getPeriodStyle()}`}
                  >
                    {getPeriodIcon()}
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feelings Selector (Responsive Pills) */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
              {t.feelingLabel}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {feelings.map((f) => {
                const isSelected = feeling === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFeeling(f.id)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                      isSelected
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Tags (Pills strictly wrapped for mobile) */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
              {t.tagsLabel}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map((tg) => {
                const isChecked = selectedTags.includes(tg.label);
                return (
                  <button
                    key={tg.id}
                    type="button"
                    onClick={() => toggleTag(tg.label)}
                    className={`rounded-xl px-2.5 py-1 text-xs font-semibold border transition-all ${
                      isChecked
                        ? 'bg-sky-50 border-sky-300 text-sky-800 dark:bg-sky-950/60 dark:border-sky-700 dark:text-sky-200'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {isChecked ? '✓ ' : '+ '}
                    {tg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Blood Sugar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                {t.sugarLabel}
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  placeholder="np. 95"
                  value={bloodSugar}
                  onChange={(e) => setBloodSugar(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
                <span className="text-xs font-semibold text-slate-400 shrink-0">mg/dL</span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                {t.notesLabel}
              </label>
              <input
                type="text"
                placeholder={t.notesPlaceholder}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
            <button
              type="submit"
              id="save-measurement-submit-btn"
              className="w-full flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 py-3.5 text-base font-bold text-white shadow-md shadow-sky-500/25 hover:from-sky-400 hover:to-blue-500 active:scale-98 transition-all cursor-pointer"
            >
              <Plus className="h-5 w-5" />
              <span>{t.saveMeasurement}</span>
            </button>
            {handleClose && (
              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 font-semibold text-xs sm:text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {lang === 'pl' ? 'Wróć do dziennika' : 'Cancel'}
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};
