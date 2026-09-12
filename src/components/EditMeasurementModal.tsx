import React, { useState, useEffect } from 'react';
import { X, Check, Clock, Calendar, ShieldCheck, SunMedium, Sun, Sunset, PlusCircle, Heart, AlertCircle, Info } from 'lucide-react';
import { Measurement, Language, TimePeriod, Feeling } from '../types';
import { translations } from '../i18n';
import { classifyBloodPressure } from '../utils/bpClassification';

interface EditMeasurementModalProps {
  measurement: Measurement | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Measurement) => void;
  lang: Language;
}

export const EditMeasurementModal: React.FC<EditMeasurementModalProps> = ({
  measurement,
  isOpen,
  onClose,
  onSave,
  lang,
}) => {
  if (!isOpen || !measurement) return null;

  const t = translations[lang] || translations.pl;

  const [systolic, setSystolic] = useState<number>(measurement.systolic);
  const [diastolic, setDiastolic] = useState<number>(measurement.diastolic);
  const [pulse, setPulse] = useState<number>(measurement.pulse || 70);
  const [bloodSugar, setBloodSugar] = useState<string>(measurement.bloodSugar ? String(measurement.bloodSugar) : '');
  const [arm, setArm] = useState<'left' | 'right'>(measurement.arm || 'left');
  const [date, setDate] = useState<string>(measurement.date || '');
  const [time, setTime] = useState<string>(measurement.time || '');
  const [period, setPeriod] = useState<TimePeriod>(
    measurement.period === 'night' ? 'extra' : (measurement.period || 'morning')
  );
  const [feeling, setFeeling] = useState<Feeling>(measurement.feeling || 'normal');
  const [notes, setNotes] = useState<string>(measurement.notes || '');
  const [tags, setTags] = useState<string[]>(measurement.tags || []);

  // Update when measurement prop changes
  useEffect(() => {
    if (measurement) {
      setSystolic(measurement.systolic);
      setDiastolic(measurement.diastolic);
      setPulse(measurement.pulse || 70);
      setBloodSugar(measurement.bloodSugar ? String(measurement.bloodSugar) : '');
      setArm(measurement.arm || 'left');
      setDate(measurement.date || '');
      setTime(measurement.time || '');
      setPeriod(measurement.period === 'night' ? 'extra' : (measurement.period || 'morning'));
      setFeeling(measurement.feeling || 'normal');
      setNotes(measurement.notes || '');
      setTags(measurement.tags || []);
    }
  }, [measurement]);

  const classification = classifyBloodPressure(systolic, diastolic, lang);

  // Friendly reassurance message
  const getFriendlyFeedback = () => {
    if (classification.level === 'optimal') {
      return {
        badge: '💚 Wzorcowe / Bardzo dobre',
        text: 'Twoje ciśnienie jest w doskonałym przedziale (< 120/80 mmHg). Serce i naczynia krwionośne pracują lekko i bez przeciążeń.',
        bg: 'bg-teal-50 border-teal-200 text-teal-900 dark:bg-teal-950/40 dark:border-teal-800 dark:text-teal-200',
      };
    }
    if (classification.level === 'normal') {
      return {
        badge: '✅ Prawidłowe / Dobre',
        text: 'Prawidłowe ciśnienie w normie zdrowego człowieka (120-129 / 80-84 mmHg). Wszystko jest w bezpiecznym porządku.',
        bg: 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200',
      };
    }
    if (classification.level === 'high_normal') {
      return {
        badge: '⚠️ Wysokie prawidłowe',
        text: 'Wartość tuż przed progiem nadciśnienia (130-139 / 85-89 mmHg). Zadbaj o nawodnienie, ogranicz sól i unikaj stresu.',
        bg: 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-200',
      };
    }
    if (classification.level === 'hypertension_1') {
      return {
        badge: '🟠 Łagodne nadciśnienie (I st.)',
        text: 'Wynik powyżej 140/90 mmHg. Pojedynczy wyższy pomiar bywa wynikiem zmęczenia. Jeśli powtarza się stale, skonsultuj z lekarzem.',
        bg: 'bg-orange-50 border-orange-200 text-orange-900 dark:bg-orange-950/40 dark:border-orange-800 dark:text-orange-200',
      };
    }
    if (classification.level === 'hypertension_2') {
      return {
        badge: '🔴 Umiarkowane nadciśnienie (II st.)',
        text: 'Wyraźnie podwyższone ciśnienie. Usiądź wygodnie, pooddychaj spokojnie 10 minut i skonsultuj ten wynik ze swoim lekarzem.',
        bg: 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200',
      };
    }
    if (classification.level === 'hypertension_3') {
      return {
        badge: '🚨 Bardzo wysokie (III st.)',
        text: 'Bardzo wysoki wynik (≥ 180 / 110 mmHg). Odpocznij w ciszy i powtórz badanie. Jeśli towarzyszy mu ból głowy lub klatki, pilnie wezwij pomoc.',
        bg: 'bg-rose-100 border-rose-300 text-rose-950 dark:bg-rose-950 dark:border-rose-700 dark:text-rose-100',
      };
    }
    return {
      badge: '💧 Niskie ciśnienie (niedociśnienie)',
      text: 'Ciśnienie poniżej 90/60 mmHg. Pij dużo płynów, wstawaj powoli i unikaj gwałtownych ruchów.',
      bg: 'bg-sky-50 border-sky-200 text-sky-900 dark:bg-sky-950/40 dark:border-sky-800 dark:text-sky-200',
    };
  };

  const feedback = getFriendlyFeedback();

  const handleToggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let timestamp = measurement.timestamp;
    if (date) {
      const dateStr = time ? `${date}T${time}` : `${date}T12:00:00`;
      const parsed = new Date(dateStr).getTime();
      if (!isNaN(parsed)) {
        timestamp = parsed;
      }
    }

    const updated: Measurement = {
      ...measurement,
      systolic,
      diastolic,
      pulse: pulse || 70,
      bloodSugar: bloodSugar ? parseFloat(bloodSugar) : undefined,
      arm,
      date,
      time,
      period,
      feeling,
      notes: notes.trim(),
      tags,
      timestamp,
    };

    onSave(updated);
    onClose();
  };

  const commonTags = [
    'Przed lekiem',
    'Po leku',
    'W spoczynku',
    'Po kawie',
    'Stres',
    'Po spacerze',
    'Ból głowy',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 sm:px-6 py-4 bg-slate-50/80 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-xs shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                {lang === 'pl' ? 'Edytuj pomiar ciśnienia' : 'Edit Measurement'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {date} {time ? `• ${time}` : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
            title="Zamknij"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-5 space-y-4 text-slate-800 dark:text-slate-200">
          
          {/* Live Blood Pressure Interpretation Card */}
          <div className={`rounded-2xl p-3.5 border transition-all ${feedback.bg}`}>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-bold tracking-wide">
                {feedback.badge}
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-white/70 dark:bg-black/30 border border-current/20">
                {systolic} / {diastolic} mmHg
              </span>
            </div>
            <p className="text-xs leading-relaxed opacity-95">
              {feedback.text}
            </p>
          </div>

          {/* Blood Pressure Values Inputs */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {/* SYS */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-2.5 sm:p-3 dark:border-slate-800 dark:bg-slate-800/60">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                SYS (Skurczowe)
              </label>
              <input
                type="number"
                min={50}
                max={260}
                value={systolic}
                onChange={(e) => setSystolic(parseInt(e.target.value) || 0)}
                className="w-full text-center text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white bg-white dark:bg-slate-900 rounded-xl py-1 border border-slate-200 dark:border-slate-700"
                required
              />
              <span className="block text-center text-[10px] text-slate-400 font-semibold mt-1">mmHg</span>
            </div>

            {/* DIA */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-2.5 sm:p-3 dark:border-slate-800 dark:bg-slate-800/60">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                DIA (Rozkurczowe)
              </label>
              <input
                type="number"
                min={30}
                max={160}
                value={diastolic}
                onChange={(e) => setDiastolic(parseInt(e.target.value) || 0)}
                className="w-full text-center text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white bg-white dark:bg-slate-900 rounded-xl py-1 border border-slate-200 dark:border-slate-700"
                required
              />
              <span className="block text-center text-[10px] text-slate-400 font-semibold mt-1">mmHg</span>
            </div>

            {/* PUL */}
            <div className="rounded-2xl border border-rose-200/80 bg-rose-50/50 p-2.5 sm:p-3 dark:border-rose-950 dark:bg-rose-950/20">
              <label className="text-[11px] font-bold text-rose-700 dark:text-rose-400 block mb-1">
                PUL (Puls)
              </label>
              <input
                type="number"
                min={35}
                max={220}
                value={pulse}
                onChange={(e) => setPulse(parseInt(e.target.value) || 0)}
                className="w-full text-center text-xl sm:text-2xl font-black font-mono text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 rounded-xl py-1 border border-rose-200 dark:border-rose-900/60"
              />
              <span className="block text-center text-[10px] text-rose-500/80 font-semibold mt-1">/min</span>
            </div>
          </div>

          {/* Date, Time & Arm Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Data
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Godzina (opcjonalnie)
                </label>
                {time ? (
                  <button
                    type="button"
                    onClick={() => setTime('')}
                    className="text-[11px] text-slate-400 hover:text-rose-600 font-medium cursor-pointer"
                  >
                    Wyczyść
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const n = new Date();
                      setTime(`${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`);
                    }}
                    className="text-[11px] text-sky-600 font-bold cursor-pointer"
                  >
                    + Bieżąca
                  </button>
                )}
              </div>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
                Ramię
              </label>
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setArm('left')}
                  className={`py-2 text-xs font-bold rounded-xl border transition-colors ${
                    arm === 'left'
                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                  }`}
                >
                  Lewa
                </button>
                <button
                  type="button"
                  onClick={() => setArm('right')}
                  className={`py-2 text-xs font-bold rounded-xl border transition-colors ${
                    arm === 'right'
                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                  }`}
                >
                  Prawa
                </button>
              </div>
            </div>
          </div>

          {/* Period of Day */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
              Pora dnia
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['morning', 'noon', 'evening', 'extra'] as TimePeriod[]).map((p) => {
                const isSelected = period === p;
                const label =
                  p === 'morning'
                    ? (t.periodMorning || 'Rano')
                    : p === 'noon'
                    ? (t.periodNoon || 'Południe')
                    : p === 'evening'
                    ? (t.periodEvening || 'Wieczór')
                    : (t.periodExtra || 'Dodatkowy');

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {p === 'morning' && <SunMedium className="h-3.5 w-3.5" />}
                    {p === 'noon' && <Sun className="h-3.5 w-3.5" />}
                    {p === 'evening' && <Sunset className="h-3.5 w-3.5" />}
                    {p === 'extra' && <PlusCircle className="h-3.5 w-3.5" />}
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feeling */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
              Samopoczucie
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {[
                { id: 'great', label: 'Świetne 😊' },
                { id: 'normal', label: 'Normalne 😐' },
                { id: 'weak', label: 'Osłabienie 🥱' },
                { id: 'dizzy', label: 'Zawroty głowy 💫' },
                { id: 'headache', label: 'Ból głowy 🤕' },
                { id: 'stressed', label: 'Stres / Nerwy ⚡' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFeeling(item.id as Feeling)}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition-colors text-center truncate ${
                    feeling === item.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Blood Sugar (optional) */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              Poziom cukru (opcjonalnie, mg/dL)
            </label>
            <input
              type="number"
              value={bloodSugar}
              onChange={(e) => setBloodSugar(e.target.value)}
              placeholder="np. 95"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Common Tags */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
              Okoliczności / Tagi
            </label>
            <div className="flex flex-wrap gap-1.5">
              {commonTags.map((tag) => {
                const isChecked = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      isChecked
                        ? 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                    }`}
                  >
                    {isChecked ? '✓ ' : '+ '}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1">
              Notatki dla lekarza lub uwagi
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="np. po zażyciu leku, przed posiłkiem..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white px-5 py-2.5 text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Check className="h-4 w-4" />
              <span>Zapisz zmiany</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
