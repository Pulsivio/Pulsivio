import React, { useState, useEffect } from 'react';
import { X, Edit3, Trash2, Heart, Clock, Calendar, Check, AlertCircle } from 'lucide-react';
import { Measurement, Period, getPTNTClassification } from '../../types';

interface EditMeasurementModalProps {
  measurement: Measurement | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Measurement) => void;
  onDelete?: (id: string) => void;
}

export const EditMeasurementModal: React.FC<EditMeasurementModalProps> = ({
  measurement,
  isOpen,
  onClose,
  onSave,
  onDelete
}) => {
  if (!isOpen || !measurement) return null;

  const [systolic, setSystolic] = useState<number | string>(measurement.systolic);
  const [diastolic, setDiastolic] = useState<number | string>(measurement.diastolic);
  const [pulse, setPulse] = useState<number | string>(measurement.pulse || '');
  const [bloodSugar, setBloodSugar] = useState<string>(
    measurement.bloodSugar ? String(measurement.bloodSugar) : ''
  );
  const [arm, setArm] = useState<'lewa' | 'prawa'>(
    measurement.arm === 'prawa' || (measurement.arm as any) === 'right' ? 'prawa' : 'lewa'
  );
  const [date, setDate] = useState<string>(measurement.date || '');
  const [time, setTime] = useState<string>(measurement.time || '');
  const [period, setPeriod] = useState<Period>(measurement.period || 'rano');
  const [feeling, setFeeling] = useState<string>(measurement.feeling || 'normal');
  const [notes, setNotes] = useState<string>(measurement.notes || '');
  const [tags, setTags] = useState<string[]>(measurement.tags || []);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (measurement) {
      setSystolic(measurement.systolic);
      setDiastolic(measurement.diastolic);
      setPulse(measurement.pulse || '');
      setBloodSugar(measurement.bloodSugar ? String(measurement.bloodSugar) : '');
      setArm(measurement.arm === 'prawa' || (measurement.arm as any) === 'right' ? 'prawa' : 'lewa');
      setDate(measurement.date || '');
      setTime(measurement.time || '');
      setPeriod(measurement.period || 'rano');
      setFeeling(measurement.feeling || 'normal');
      setNotes(measurement.notes || '');
      setTags(measurement.tags || []);
      setError(null);
    }
  }, [measurement]);

  const insertCurrentTime = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    setTime(`${hh}:${mm}`);
  };

  const sysNum = typeof systolic === 'number' ? systolic : parseInt(systolic as string, 10);
  const diaNum = typeof diastolic === 'number' ? diastolic : parseInt(diastolic as string, 10);
  const pulNum = typeof pulse === 'number' ? pulse : parseInt(pulse as string, 10);

  const ptnt = !isNaN(sysNum) && !isNaN(diaNum) ? getPTNTClassification(sysNum, diaNum) : null;

  const toggleTag = (tag: string) => {
    setTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
  };

  const availableTags = [
    'Przed lekiem',
    'Po leku',
    'W spoczynku',
    'Po kawie',
    'Stres',
    'Po spacerze',
    'Ból głowy'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(sysNum) || isNaN(diaNum)) {
      setError('Wpisz prawidłowe wartości skurczowe i rozkurczowe.');
      return;
    }
    if (sysNum < 40 || sysNum > 300 || diaNum < 30 || diaNum > 200) {
      setError('Podaj realistyczne wartości ciśnienia (np. 120 / 80).');
      return;
    }

    let ts = measurement.createdAt || Date.now();
    if (date) {
      const dtStr = time ? `${date}T${time}` : `${date}T12:00:00`;
      const parsed = new Date(dtStr).getTime();
      if (!isNaN(parsed)) ts = parsed;
    }

    const updated: Measurement = {
      ...measurement,
      systolic: sysNum,
      diastolic: diaNum,
      pulse: !isNaN(pulNum) ? pulNum : 70,
      bloodSugar: bloodSugar ? parseFloat(bloodSugar) : undefined,
      arm,
      date,
      time: time || '',
      period,
      feeling: feeling as any,
      notes: notes.trim(),
      tags,
      createdAt: ts
    };

    onSave(updated);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Czy na pewno chcesz usunąć ten pomiar z dziennika?')) {
      if (onDelete && measurement.id) {
        onDelete(measurement.id);
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4 bg-slate-50/80 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-sm">
              <Edit3 className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Edycja pomiaru ciśnienia
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Możesz skorygować wartości, datę lub dodać notatkę
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij okno edycji"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 active:scale-95 transition-all cursor-pointer touch-manipulation"
          >
            <X className="h-5 w-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 text-xs sm:text-sm">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Blood Pressure Numbers */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Skurczowe (SYS)
              </label>
              <input
                type="number"
                value={systolic}
                onChange={e => setSystolic(e.target.value)}
                placeholder="np. 120"
                min="40"
                max="300"
                required
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-center text-lg font-black text-rose-600 dark:text-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Rozkurczowe (DIA)
              </label>
              <input
                type="number"
                value={diastolic}
                onChange={e => setDiastolic(e.target.value)}
                placeholder="np. 80"
                min="30"
                max="200"
                required
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-center text-lg font-black text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Puls (bpm)
              </label>
              <input
                type="number"
                value={pulse}
                onChange={e => setPulse(e.target.value)}
                placeholder="np. 70"
                min="30"
                max="250"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-center text-lg font-black text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* PTNT Live classification preview */}
          {ptnt && (
            <div className="space-y-2">
              <div className={`p-3 rounded-xl border text-xs font-semibold ${ptnt.bgClass} ${ptnt.borderClass}`}>
                <div className="flex items-center justify-between">
                  <span>Ocena kliniczna PTNT:</span>
                  <span className={`font-bold ${ptnt.colorClass}`}>{ptnt.label}</span>
                </div>
              </div>

              {/* Zalecenie dawkowania lekarki */}
              {sysNum >= 140 || diaNum >= 90 ? (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">💊</span>
                    <div>
                      <span className="font-bold text-rose-700 dark:text-rose-300 block">
                        Zalecenie lekarki (≥140/90):
                      </span>
                      <span className="text-slate-600 dark:text-slate-300">
                        Przyjmij całą tabletkę (1.0 tabl.)
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-rose-600 text-white font-bold rounded-lg text-[11px] shrink-0">
                    Cała tabletka
                  </span>
                </div>
              ) : sysNum >= 130 || diaNum >= 80 ? (
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">💊</span>
                    <div>
                      <span className="font-bold text-amber-700 dark:text-amber-300 block">
                        Zalecenie lekarki (130-139 / 80-89):
                      </span>
                      <span className="text-slate-600 dark:text-slate-300">
                        Przyjmij połówkę tabletki (½ tabl.)
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-500 text-black font-bold rounded-lg text-[11px] shrink-0">
                    ½ tabletki
                  </span>
                </div>
              ) : null}
            </div>
          )}

          {/* Date, Time, Arm */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Data
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Godzina
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={insertCurrentTime}
                    className="text-[10px] text-rose-600 dark:text-rose-400 font-bold hover:underline cursor-pointer"
                  >
                    Teraz
                  </button>
                  {time && (
                    <button
                      type="button"
                      onClick={() => setTime('')}
                      className="text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      Wyczyść
                    </button>
                  )}
                </div>
              </div>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Ręka pomiaru
              </label>
              <select
                value={arm}
                onChange={e => setArm(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
              >
                <option value="lewa">Lewa ręka</option>
                <option value="prawa">Prawa ręka</option>
              </select>
            </div>
          </div>

          {/* Period and Feeling */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Pora dnia
              </label>
              <select
                value={period}
                onChange={e => setPeriod(e.target.value as Period)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
              >
                <option value="rano">Rano (na czczo)</option>
                <option value="poludnie">Południe</option>
                <option value="wieczor">Wieczór</option>
                <option value="dodatkowy">Dodatkowy pomiar</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                Samopoczucie
              </label>
              <select
                value={feeling}
                onChange={e => setFeeling(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
              >
                <option value="great">Świetne 😊</option>
                <option value="normal">Normalne 😐</option>
                <option value="weak">Osłabienie 🥱</option>
                <option value="dizzy">Zawroty głowy 💫</option>
                <option value="headache">Ból głowy 🤕</option>
                <option value="stressed">Stres ⚡</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
              Oznaczenia kontekstowe:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map(tag => {
                const active = tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      active
                        ? 'bg-rose-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              Notatki i uwagi (np. nazwa leku, objawy):
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Wpisz swoje uwagi..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            {onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>Usuń pomiar</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Anuluj
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="h-4 w-4" />
                <span>Zapisz zmiany</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
