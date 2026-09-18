import React from 'react';
import { Trash2, Edit3, Plus, Heart, Pill, AlertTriangle } from 'lucide-react';
import { Measurement, getPTNTClassification, Period } from '../types';

interface DayMeasurementsCardProps {
  date: string;
  measurements: Measurement[];
  onOpenAddModalWithDate: (date: string, period?: Period) => void;
  onEditMeasurement: (m: Measurement) => void;
  onDeleteMeasurement: (id: string) => void;
  onDeleteDayMeasurements: (date: string) => void;
}

export const DayMeasurementsCard: React.FC<DayMeasurementsCardProps> = ({
  date,
  measurements,
  onOpenAddModalWithDate,
  onEditMeasurement,
  onDeleteMeasurement,
  onDeleteDayMeasurements
}) => {
  if (measurements.length === 0) return null;

  // Compute day average
  const count = measurements.length;
  const avgSys = Math.round(measurements.reduce((a, b) => a + b.systolic, 0) / count);
  const avgDia = Math.round(measurements.reduce((a, b) => a + b.diastolic, 0) / count);
  const avgPulse = Math.round(measurements.reduce((a, b) => a + b.pulse, 0) / count);

  // Format date label
  const d = new Date(date + 'T12:00:00');
  const dayNamesShort = ['N', 'P', 'W', 'Ś', 'C', 'P', 'S'];
  const jsDay = d.getDay();
  const dayLetter = dayNamesShort[jsDay];
  
  const dayOfMonth = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const formattedDay = `${dayOfMonth}.${month}`;

  const isToday = date === '2026-09-16';
  const isYesterday = date === '2026-09-15';
  const relativeText = isToday ? '(Dziś)' : isYesterday ? '(Wczoraj)' : '';

  // Sort by period order: rano, poludnie, wieczor, dodatkowy
  const periodOrder: Record<Period, number> = {
    rano: 1,
    poludnie: 2,
    wieczor: 3,
    dodatkowy: 4
  };

  const sorted = [...measurements].sort(
    (a, b) => periodOrder[a.period] - periodOrder[b.period] || b.createdAt - a.createdAt
  );

  return (
    <div className="bg-[#0b142e] border border-sky-950 rounded-2xl p-4 sm:p-5 mb-4 shadow-lg shadow-black/20 hover:border-slate-800 transition-all">
      {/* Day Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500 text-white font-extrabold text-sm flex items-center justify-center shadow-sm">
            {dayLetter}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-tight">
                {formattedDay} {relativeText}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
              <span>
                Średnia: <strong className="text-white">{avgSys}/{avgDia}</strong> mmHg
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-rose-300">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <strong>{avgPulse}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Day Actions */}
        <div className="flex items-center gap-2">
          <span className="bg-sky-950 text-sky-300 font-mono text-xs px-2.5 py-1 rounded-lg border border-sky-800/50 flex items-center gap-1">
            <span>🗂️</span>
            <span>{count}</span>
          </span>
          <button
            onClick={() => {
              if (confirm(`Czy na pewno chcesz usunąć wszystkie ${count} pomiary z dnia ${formattedDay}?`)) {
                onDeleteDayMeasurements(date);
              }
            }}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-700/50 hover:border-red-800/60 transition-colors cursor-pointer"
            title="Usuń wszystkie pomiary z tego dnia"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenAddModalWithDate(date)}
            className="p-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold transition-colors cursor-pointer shadow-sm"
            title="Dodaj kolejny pomiar do tego dnia"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Slots grid inside the day */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-3.5">
        {sorted.map(m => {
          const ptnt = getPTNTClassification(m.systolic, m.diastolic);
          const periodIcons: Record<Period, { icon: string; label: string; color: string; border: string }> = {
            rano: { icon: '☀️', label: 'Rano', color: 'text-amber-400', border: 'border-amber-600/30' },
            poludnie: { icon: '🌤️', label: 'Południe', color: 'text-sky-400', border: 'border-sky-600/30' },
            wieczor: { icon: '🌙', label: 'Wieczór', color: 'text-indigo-400', border: 'border-indigo-600/30' },
            dodatkowy: { icon: '➕', label: 'Dodatkowy', color: 'text-purple-400', border: 'border-purple-600/30' }
          };
          const pInfo = periodIcons[m.period];

          return (
            <div
              key={m.id}
              className="bg-[#0f1938] border border-slate-800/90 rounded-xl p-3.5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm group"
            >
              <div>
                {/* Slot Top: Period badge, time, and PTNT classification */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">{pInfo.icon}</span>
                    <span className={`text-xs font-bold ${pInfo.color}`}>
                      {pInfo.label}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 ml-1">
                      {m.time}
                    </span>
                  </div>

                  {/* PTNT Badge */}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${ptnt.badgeClass}`}
                    title={ptnt.label}
                  >
                    {ptnt.shortLabel}
                  </span>
                </div>

                {/* Main Values: SYS/DIA & Pulse */}
                <div className="flex items-baseline justify-between my-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white tracking-tight">
                      {m.systolic}/{m.diastolic}
                    </span>
                    <span className="text-xs text-slate-400">mmHg</span>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-semibold text-rose-300 bg-rose-950/40 px-2 py-1 rounded-lg border border-rose-900/40">
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                    <span>{m.pulse} bpm</span>
                  </div>
                </div>

                {/* Meta details: meds, arm, arrhythmia, notes */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 mt-2">
                  {m.arm && (
                    <span className="bg-slate-800/60 px-1.5 py-0.5 rounded text-[10px]">
                      Ręka: {m.arm}
                    </span>
                  )}
                  {m.medsTaken && (
                    <span className="flex items-center gap-1 bg-emerald-950/50 text-emerald-300 px-1.5 py-0.5 rounded text-[10px] border border-emerald-800/40">
                      <Pill className="w-2.5 h-2.5" />
                      Leki przyjęte
                    </span>
                  )}
                  {m.arrhythmia && (
                    <span className="flex items-center gap-1 bg-red-950/50 text-red-300 px-1.5 py-0.5 rounded text-[10px] border border-red-800/40">
                      <AlertTriangle className="w-2.5 h-2.5 text-red-400" />
                      Arytmia
                    </span>
                  )}
                </div>

                {m.notes && (
                  <p className="text-xs text-slate-300 italic bg-[#091026] p-2 rounded-lg mt-2 border border-slate-800/60 line-clamp-2">
                    "{m.notes}"
                  </p>
                )}
              </div>

              {/* Action buttons (Edit & Delete) */}
              <div className="flex items-center justify-end gap-1.5 mt-3 pt-2 border-t border-slate-800/60 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEditMeasurement(m)}
                  className="p-1 rounded text-slate-400 hover:text-sky-300 hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Edytuj pomiar"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Czy na pewno chcesz usunąć ten pomiar?')) {
                      onDeleteMeasurement(m.id);
                    }
                  }}
                  className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Usuń pomiar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
