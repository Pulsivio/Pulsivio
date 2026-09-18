import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Measurement } from '../types';

interface WeekTimelineCardProps {
  measurements: Measurement[];
  onOpenAddModalWithDate?: (date: string) => void;
  onSelectDayFilter?: (date: string) => void;
  selectedDay?: string | null;
}

export const WeekTimelineCard: React.FC<WeekTimelineCardProps> = ({
  measurements,
  onOpenAddModalWithDate,
  onSelectDayFilter,
  selectedDay
}) => {
  const [timeScope, setTimeScope] = React.useState<'tydzien' | '14d' | '30d' | 'wszystko'>('tydzien');
  const [weekOffset, setWeekOffset] = React.useState(0);

  // We anchor to week 14.09 - 20.09 as in screenshot (September 2026 / current date context)
  const baseDate = new Date(2026, 8, 16); // 16 Sep 2026 (Środa)
  const currentMonday = new Date(baseDate);
  const day = currentMonday.getDay(); // 0 is Sunday, 1 is Monday...
  const diff = currentMonday.getDate() - day + (day === 0 ? -6 : 1);
  currentMonday.setDate(diff + (weekOffset * 7));

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentMonday);
    d.setDate(currentMonday.getDate() + i);
    const dayNamesShort = ['N', 'P', 'W', 'Ś', 'C', 'P', 'S'];
    const dayNamesFull = [
      'Niedziela',
      'Poniedziałek',
      'Wtorek',
      'Środa',
      'Czwartek',
      'Piątek',
      'Sobota'
    ];
    const jsDay = d.getDay();
    const dateStr = d.toISOString().split('T')[0];
    const dayOfMonth = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const formattedLabel = `${dayOfMonth}.${month}`;
    const isToday = dateStr === '2026-09-16';

    const dayMeasurements = measurements.filter(m => m.date === dateStr);
    const count = dayMeasurements.length;

    let avgStr = '';
    if (count > 0) {
      const avgSys = Math.round(dayMeasurements.reduce((a, b) => a + b.systolic, 0) / count);
      const avgDia = Math.round(dayMeasurements.reduce((a, b) => a + b.diastolic, 0) / count);
      avgStr = `Śr. ${avgSys}/${avgDia} mmHg`;
    }

    return {
      date: dateStr,
      shortLetter: dayNamesShort[jsDay],
      fullName: `${dayNamesFull[jsDay]} ${formattedLabel}`,
      count,
      avgStr,
      isToday,
      measurements: dayMeasurements
    };
  });

  const weekStartDate = weekDays[0].fullName.split(' ')[1];
  const weekEndDate = weekDays[6].fullName.split(' ')[1];

  // Week metrics calculation
  const weekDatesSet = new Set(weekDays.map(d => d.date));
  const weekMeasurements = measurements.filter(m => weekDatesSet.has(m.date));
  const weekTotalCount = weekMeasurements.length;

  const morningMeas = weekMeasurements.filter(m => m.period === 'rano');
  const eveningMeas = weekMeasurements.filter(m => m.period === 'wieczor');
  const noonMeas = weekMeasurements.filter(m => m.period === 'poludnie');

  const calcAvg = (arr: Measurement[]) => {
    if (arr.length === 0) return null;
    const sys = Math.round(arr.reduce((a, b) => a + b.systolic, 0) / arr.length);
    const dia = Math.round(arr.reduce((a, b) => a + b.diastolic, 0) / arr.length);
    return `${sys}/${dia}`;
  };

  const morningAvg = calcAvg(morningMeas);
  const eveningAvg = calcAvg(eveningMeas);
  const noonAvg = calcAvg(noonMeas);

  // Skok poranny: Rano SYS - Wieczór SYS
  let morningSurge: number | null = null;
  if (morningMeas.length > 0 && eveningMeas.length > 0) {
    const mSys = Math.round(morningMeas.reduce((a, b) => a + b.systolic, 0) / morningMeas.length);
    const eSys = Math.round(eveningMeas.reduce((a, b) => a + b.systolic, 0) / eveningMeas.length);
    morningSurge = mSys - eSys;
  }

  // W normie PTNT w tygodniu (<135 i <85)
  const normalWeekCount = weekMeasurements.filter(m => m.systolic < 135 && m.diastolic < 85).length;
  const normalWeekPercent = weekTotalCount > 0 ? Math.round((normalWeekCount / weekTotalCount) * 100) : 0;

  return (
    <div className="bg-[#0b142e] border border-sky-900/40 rounded-2xl p-4 sm:p-6 mb-6 shadow-xl shadow-black/30">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Bieżący tydzień ({weekStartDate} – {weekEndDate})
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setWeekOffset(prev => prev - 1)}
                  className="p-1 rounded bg-[#131d3d] hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Poprzedni tydzień"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setWeekOffset(prev => prev + 1)}
                  className="p-1 rounded bg-[#131d3d] hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Następny tydzień"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <span className="text-xs text-slate-400">
              {weekTotalCount} {weekTotalCount === 1 ? 'pomiar' : weekTotalCount < 5 ? 'pomiary' : 'pomiarów'}
            </span>
          </div>
        </div>

        {/* Scope selector */}
        <div className="inline-flex bg-[#070c1d] border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setTimeScope('tydzien')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              timeScope === 'tydzien' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tydzień (Pn-Nd)
          </button>
          <button
            onClick={() => setTimeScope('14d')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              timeScope === '14d' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            14d
          </button>
          <button
            onClick={() => setTimeScope('30d')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              timeScope === '30d' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            30d
          </button>
          <button
            onClick={() => setTimeScope('wszystko')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              timeScope === 'wszystko' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Wszystko
          </button>
        </div>
      </div>

      {/* Two columns body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5">
        {/* Left Column: 7 days timeline (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span className="flex items-center gap-1 text-slate-300">
              📅 Oś czasu 7 dni (Pn – Nd):
            </span>
            <span className="font-mono text-slate-400 text-[11px]">
              {weekStartDate} – {weekEndDate}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            {weekDays.map(d => {
              const hasData = d.count > 0;
              const isSelected = selectedDay === d.date;

              return (
                <div
                  key={d.date}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-[#152554] border-sky-500 shadow-md'
                      : hasData
                      ? 'bg-[#0f1b3d] border-slate-800 hover:border-slate-700'
                      : d.isToday
                      ? 'bg-[#101b3a] border-amber-600/40'
                      : 'bg-[#0a1126] border-slate-800/40 opacity-85 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Day badge letter */}
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                        hasData
                          ? 'bg-sky-500 text-white shadow-sm'
                          : d.isToday
                          ? 'bg-amber-500 text-black font-extrabold'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {d.shortLetter}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-slate-200">
                          {d.fullName}
                        </span>
                        {d.isToday && (
                          <span className="bg-amber-500/20 text-amber-300 font-bold font-mono text-[10px] px-1.5 py-0.2 rounded border border-amber-500/40">
                            DZIŚ
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 block">
                        {hasData ? (
                          <>
                            <span className="text-slate-300">{d.count} {d.count === 1 ? 'wpis' : 'wpisy'}</span>
                            {d.avgStr && <span> • <span className="text-sky-300 font-medium">{d.avgStr}</span></span>}
                          </>
                        ) : (
                          '0 wpisów (brak pomiaru)'
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Action button */}
                  {hasData ? (
                    <button
                      onClick={() => onSelectDayFilter?.(d.date)}
                      className="bg-sky-600/20 hover:bg-sky-600/40 text-sky-300 border border-sky-500/30 px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Pokaż
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenAddModalWithDate?.(d.date)}
                      className="flex items-center gap-1 bg-slate-800/60 hover:bg-sky-600/20 text-slate-400 hover:text-sky-300 border border-slate-700/50 hover:border-sky-500/30 px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Dodaj</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Day periods breakdown & week indicators (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <span className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
            📈 Rozkład pór dnia i wskaźniki tygodnia:
          </span>

          {/* 3 periods equal cards: Rano, Południe, Wieczór */}
          <div className="grid grid-cols-3 gap-2">
            {/* Rano */}
            <div className="bg-[#1c1508] border border-amber-600/30 rounded-xl p-2.5 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between text-xs text-amber-300 font-semibold mb-1">
                <span className="flex items-center gap-1">
                  ☀️ Rano
                </span>
              </div>
              <span className="text-lg font-bold text-white">
                {morningAvg || '--/--'}
              </span>
              <span className="text-[10px] text-amber-400/80 mt-0.5">
                {morningMeas.length} pom.
              </span>
            </div>

            {/* Południe */}
            <div className="bg-[#0a1f33] border border-cyan-600/30 rounded-xl p-2.5 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between text-xs text-cyan-300 font-semibold mb-1">
                <span className="flex items-center gap-1">
                  🌤️ Południe
                </span>
              </div>
              <span className="text-lg font-bold text-white">
                {noonAvg || '--/--'}
              </span>
              <span className="text-[10px] text-cyan-400/80 mt-0.5">
                {noonMeas.length} pom.
              </span>
            </div>

            {/* Wieczór */}
            <div className="bg-[#140e2b] border border-purple-600/30 rounded-xl p-2.5 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between text-xs text-purple-300 font-semibold mb-1">
                <span className="flex items-center gap-1">
                  🌙 Wieczór
                </span>
              </div>
              <span className="text-lg font-bold text-white">
                {eveningAvg || '--/--'}
              </span>
              <span className="text-[10px] text-purple-400/80 mt-0.5">
                {eveningMeas.length} pom.
              </span>
            </div>
          </div>

          {/* Wskaźniki tygodnia: Skok poranny + W normie PTNT */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Skok poranny */}
            <div className="bg-[#0b1c2e] border border-sky-600/30 rounded-xl p-3 flex flex-col justify-between shadow-sm">
              <div className="text-[11px] text-sky-300 font-medium mb-1 flex items-center gap-1">
                {morningSurge !== null && morningSurge < 0 ? (
                  <ArrowDownRight className="w-3.5 h-3.5 text-sky-400" />
                ) : (
                  <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>Skok poranny</span>
              </div>
              <div className="text-[10px] text-slate-400">Rano – Wieczór</div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-extrabold text-white">
                  {morningSurge !== null ? `${morningSurge > 0 ? `+${morningSurge}` : morningSurge}` : '0'}
                </span>
                <span className="text-[11px] text-sky-400">mmHg</span>
              </div>
            </div>

            {/* W normie PTNT */}
            <div className="bg-[#0a2318] border border-emerald-600/30 rounded-xl p-3 flex flex-col justify-between shadow-sm">
              <div className="text-[11px] text-emerald-300 font-semibold mb-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>W normie PTNT</span>
              </div>
              <div className="text-[10px] text-emerald-300/80">&lt;135/85 mmHg</div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-extrabold text-emerald-400">
                  {normalWeekPercent}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
