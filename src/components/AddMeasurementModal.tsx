import React, { useState, useEffect } from 'react';
import { X, Heart, Activity, Pill, Check, Sparkles } from 'lucide-react';
import { Measurement, Period, getPTNTClassification } from '../types';

interface AddMeasurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (m: Omit<Measurement, 'id' | 'createdAt'>, editId?: string) => void;
  initialData?: Measurement | null;
  defaultDate?: string;
  defaultPeriod?: Period;
}

export const AddMeasurementModal: React.FC<AddMeasurementModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultDate,
  defaultPeriod
}) => {
  const [systolic, setSystolic] = useState<number | string>('');
  const [diastolic, setDiastolic] = useState<number | string>('');
  const [pulse, setPulse] = useState<number | string>('');
  const [period, setPeriod] = useState<Period>('rano');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [arm, setArm] = useState<'lewa' | 'prawa'>('lewa');
  const [medsTaken, setMedsTaken] = useState<boolean>(true);
  const [arrhythmia, setArrhythmia] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setSystolic(initialData.systolic);
      setDiastolic(initialData.diastolic);
      setPulse(initialData.pulse || '');
      setPeriod(initialData.period);
      setDate(initialData.date);
      setTime(initialData.time || '');
      setArm(initialData.arm || 'lewa');
      setMedsTaken(initialData.medsTaken ?? true);
      setArrhythmia(initialData.arrhythmia ?? false);
      setNotes(initialData.notes || '');
      setError('');
    } else {
      const now = new Date();
      const todayStr = defaultDate || now.toISOString().split('T')[0];
      
      let detectedPeriod: Period = defaultPeriod || 'rano';
      if (!defaultPeriod) {
        const h = now.getHours();
        if (h >= 5 && h < 11) detectedPeriod = 'rano';
        else if (h >= 11 && h < 17) detectedPeriod = 'poludnie';
        else detectedPeriod = 'wieczor';
      }

      // Zeroed / empty inputs - nothing forced on user
      setSystolic('');
      setDiastolic('');
      setPulse('');
      setPeriod(detectedPeriod);
      setDate(todayStr);
      setTime(''); // completely empty / wyzerowany
      setArm('lewa');
      setMedsTaken(true);
      setArrhythmia(false);
      setNotes('');
      setError('');
    }
  }, [initialData, defaultDate, defaultPeriod, isOpen]);

  const insertCurrentTime = () => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    setTime(`${h}:${m}`);
  };

  if (!isOpen) return null;

  const numSys = Number(systolic) || 0;
  const numDia = Number(diastolic) || 0;
  const hasValues = numSys > 0 && numDia > 0;
  const ptnt = hasValues ? getPTNTClassification(numSys, numDia) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numSys || !numDia) {
      setError('Wpisz wartości ciśnienia skurczowego (SYS) i rozkurczowego (DIA).');
      return;
    }
    if (numSys < 50 || numSys > 280 || numDia < 30 || numDia > 180) {
      setError('Wprowadzone wartości ciśnienia wykraczają poza standardowy zakres fizjologiczny.');
      return;
    }

    onSave(
      {
        date: date || new Date().toISOString().split('T')[0],
        time: time.trim() || undefined,
        period,
        systolic: numSys,
        diastolic: numDia,
        pulse: pulse ? Number(pulse) : undefined,
        arm,
        medsTaken,
        arrhythmia,
        notes: notes.trim() ? notes.trim() : undefined
      },
      initialData ? initialData.id : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#0b142f] border border-sky-800/80 rounded-2xl w-full max-w-lg shadow-2xl shadow-black/60 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Heart className="w-4 h-4 fill-white text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg tracking-tight">
                {initialData ? 'Edytuj Pomiar Ciśnienia' : 'Nowy Pomiar Ciśnienia i Pulsu'}
              </h3>
              <span className="text-xs text-rose-100">
                Pulsivio • Zgodne ze standardem PTNT
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij okno pomiaru"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded-xl text-white/90 hover:text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer touch-manipulation"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/80 border border-red-500/80 rounded-xl text-xs font-bold text-red-200">
              ⚠️ {error}
            </div>
          )}

          {/* Live PTNT Status Box */}
          {ptnt ? (
            <div className="space-y-2">
              <div className={`p-3.5 rounded-xl border ${ptnt.bgClass} ${ptnt.borderClass} flex items-center justify-between transition-all`}>
                <div>
                  <span className="text-xs text-slate-300 block font-medium">
                    Ocena pomiaru domowego wg PTNT:
                  </span>
                  <span className={`text-sm sm:text-base font-extrabold ${ptnt.colorClass}`}>
                    {ptnt.label}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold px-2 py-1 rounded-md border ${ptnt.badgeClass}`}>
                    {ptnt.isNormalHome ? '✓ W normie domowej' : '⚠️ Powyżej normy'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Norma domowa: &lt;135/85 mmHg
                  </span>
                </div>
              </div>

              {/* Zalecenie dawkowania lekarki */}
              {numSys >= 140 || numDia >= 90 ? (
                <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-600/70 flex items-center justify-between gap-3 text-rose-150 animate-fade-in">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">💊</span>
                    <div>
                      <div className="text-xs font-black text-rose-200 uppercase tracking-wide">
                        Zalecenie lekarki (Ciśnienie ≥ 140/90 mmHg):
                      </div>
                      <div className="text-sm font-extrabold text-white">
                        Przyjmij całą tabletkę (1.0 tabl.)
                      </div>
                      <div className="text-[10px] text-rose-300/90">
                        Zgodnie z planem leczenia od Twojego lekarza
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-rose-600 text-white font-black text-xs rounded-lg shadow-sm shrink-0">
                    Cała tabletka
                  </span>
                </div>
              ) : numSys >= 130 || numDia >= 80 ? (
                <div className="p-3 rounded-xl bg-amber-950/70 border border-amber-600/70 flex items-center justify-between gap-3 text-amber-150 animate-fade-in">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">💊</span>
                    <div>
                      <div className="text-xs font-black text-amber-300 uppercase tracking-wide">
                        Zalecenie lekarki (Ciśnienie 130–139 / 80–89 mmHg):
                      </div>
                      <div className="text-sm font-extrabold text-white">
                        Przyjmij połówkę tabletki (½ tabl.)
                      </div>
                      <div className="text-[10px] text-amber-300/90">
                        Zgodnie z planem leczenia od Twojego lekarza
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-500 text-black font-black text-xs rounded-lg shadow-sm shrink-0">
                    ½ tabletki
                  </span>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-600/40 flex items-center justify-between gap-2 text-emerald-200">
                  <div className="flex items-center gap-2">
                    <span className="text-base">✨</span>
                    <span className="text-xs font-semibold">
                      Ciśnienie optymalne/niskie (&lt;130/80 mmHg) — brak wskazania do dodatkowej dawki
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 rounded-xl border border-dashed border-slate-700 bg-slate-900/50 flex items-center justify-between text-xs text-slate-400">
              <span>Wpisz skurczowe (SYS) i rozkurczowe (DIA) poniżej:</span>
              <span className="text-[10px] text-sky-400 font-bold">Norma PTNT: &lt;135/85 mmHg</span>
            </div>
          )}

          {/* Measurements sliders / inputs */}
          <div className="grid grid-cols-2 gap-3">
            {/* SYS (Skurczowe) */}
            <div className="bg-[#0f1b3d] p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300">
                  SYS (Skurczowe)
                </label>
                <span className="text-xs font-mono text-sky-400 font-bold">mmHg</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="60"
                  max="250"
                  placeholder="np. 120"
                  value={systolic}
                  onChange={(e) => {
                    setSystolic(e.target.value === '' ? '' : Number(e.target.value));
                    setError('');
                  }}
                  className="w-full bg-[#070e24] border border-sky-800/80 rounded-lg p-2 text-2xl font-black text-white text-center focus:outline-none focus:border-sky-500 placeholder:text-slate-600"
                />
              </div>
              {/* Presets */}
              <div className="flex flex-wrap gap-1 mt-2">
                {[115, 120, 130, 135, 140, 150].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => { setSystolic(v); setError(''); }}
                    className="text-[10px] bg-slate-800 hover:bg-sky-700 text-slate-300 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* DIA (Rozkurczowe) */}
            <div className="bg-[#0f1b3d] p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300">
                  DIA (Rozkurczowe)
                </label>
                <span className="text-xs font-mono text-sky-400 font-bold">mmHg</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="40"
                  max="160"
                  placeholder="np. 80"
                  value={diastolic}
                  onChange={(e) => {
                    setDiastolic(e.target.value === '' ? '' : Number(e.target.value));
                    setError('');
                  }}
                  className="w-full bg-[#070e24] border border-sky-800/80 rounded-lg p-2 text-2xl font-black text-white text-center focus:outline-none focus:border-sky-500 placeholder:text-slate-600"
                />
              </div>
              {/* Presets */}
              <div className="flex flex-wrap gap-1 mt-2">
                {[70, 75, 80, 85, 90, 95].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => { setDiastolic(v); setError(''); }}
                    className="text-[10px] bg-slate-800 hover:bg-sky-700 text-slate-300 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pulse (Tętno) */}
          <div className="bg-[#0f1b3d] p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500" />
                <span>Puls (Tętno)</span>
              </label>
              <span className="text-[11px] text-slate-400">Opcjonalnie (bpm)</span>
            </div>
            <div className="flex items-center gap-2 w-36">
              <input
                type="number"
                min="35"
                max="220"
                placeholder="np. 72"
                value={pulse}
                onChange={(e) => setPulse(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-[#070e24] border border-rose-800/80 rounded-lg p-1.5 text-xl font-black text-rose-400 text-center focus:outline-none focus:border-rose-500 placeholder:text-slate-600"
              />
              <span className="text-xs text-rose-300 font-mono">bpm</span>
            </div>
          </div>

          {/* Period selector (Rano, Południe, Wieczór, Dodatkowy) */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Pora dnia:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'rano' as Period, label: 'Rano', icon: '☀️' },
                { id: 'poludnie' as Period, label: 'Południe', icon: '🌤️' },
                { id: 'wieczor' as Period, label: 'Wieczór', icon: '🌙' },
                { id: 'dodatkowy' as Period, label: 'Dodatkowy', icon: '➕' }
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPeriod(p.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    period === p.id
                      ? 'bg-sky-600 text-white border-sky-400 shadow-md'
                      : 'bg-[#0f1b3d] text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className="text-base mb-0.5">{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Data pomiaru:
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#070e24] border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-300">
                  Godzina:
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={insertCurrentTime}
                    className="text-[10px] text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
                  >
                    Teraz
                  </button>
                  {time && (
                    <button
                      type="button"
                      onClick={() => setTime('')}
                      className="text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      Wyczyść
                    </button>
                  )}
                </div>
              </div>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-[#070e24] border border-slate-700 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Arm, Meds, Arrhythmia */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {/* Arm */}
            <div className="bg-[#0f1b3d] p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between">
              <span className="text-[11px] text-slate-400 font-semibold mb-1 block">Ręka:</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setArm('lewa')}
                  className={`flex-1 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    arm === 'lewa' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Lewa
                </button>
                <button
                  type="button"
                  onClick={() => setArm('prawa')}
                  className={`flex-1 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    arm === 'prawa' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Prawa
                </button>
              </div>
            </div>

            {/* Meds taken */}
            <button
              type="button"
              onClick={() => setMedsTaken(!medsTaken)}
              className={`p-2.5 rounded-xl border flex flex-col justify-between text-left transition-all cursor-pointer ${
                medsTaken
                  ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300'
                  : 'bg-[#0f1b3d] border-slate-800 text-slate-400'
              }`}
            >
              <span className="text-[11px] font-semibold flex items-center gap-1">
                <Pill className="w-3 h-3 text-emerald-400" />
                Leki
              </span>
              <div className="flex items-center gap-1 text-xs font-bold mt-1">
                <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${medsTaken ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-slate-600'}`}>
                  {medsTaken && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span>{medsTaken ? 'Przyjęte' : 'Nie'}</span>
              </div>
            </button>

            {/* Arrhythmia */}
            <button
              type="button"
              onClick={() => setArrhythmia(!arrhythmia)}
              className={`p-2.5 rounded-xl border flex flex-col justify-between text-left transition-all cursor-pointer ${
                arrhythmia
                  ? 'bg-red-950/40 border-red-600/50 text-red-300'
                  : 'bg-[#0f1b3d] border-slate-800 text-slate-400'
              }`}
            >
              <span className="text-[11px] font-semibold flex items-center gap-1">
                <Activity className="w-3 h-3 text-red-400" />
                Arytmia
              </span>
              <div className="flex items-center gap-1 text-xs font-bold mt-1">
                <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${arrhythmia ? 'bg-red-500 border-red-400 text-white' : 'border-slate-600'}`}>
                  {arrhythmia && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span>{arrhythmia ? 'Wykryta' : 'Brak'}</span>
              </div>
            </button>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              Notatki / samopoczucie (opcjonalnie):
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="np. po porannej kawie, stres w pracy, ból głowy..."
              className="w-full bg-[#070e24] border border-slate-700 rounded-lg p-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-rose-900/30 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{initialData ? 'Zapisz zmiany' : 'Zapisz pomiar w dzienniku'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
