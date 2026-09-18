import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, Heart, Calendar, Activity, BarChart3, Info } from 'lucide-react';
import { Measurement, getPTNTClassification } from '../types';

interface ChartsTrendsViewProps {
  measurements: Measurement[];
  onBack: () => void;
}

export const ChartsTrendsView: React.FC<ChartsTrendsViewProps> = ({ measurements, onBack }) => {
  const [filterRange, setFilterRange] = useState<'7d' | '14d' | '30d' | 'wszystko'>('14d');

  // Sort chronological
  const sorted = [...measurements].sort((a, b) => a.date.localeCompare(b.date));

  // Determine subset
  const filtered = filterRange === '7d'
    ? sorted.slice(-14)
    : filterRange === '14d'
    ? sorted.slice(-28)
    : filterRange === '30d'
    ? sorted.slice(-60)
    : sorted;

  // Chart metrics
  const maxSys = Math.max(...filtered.map(m => m.systolic), 160);
  const minDia = Math.min(...filtered.map(m => m.diastolic), 60);

  // PTNT distribution
  const categoriesCount: Record<string, { label: string; count: number; color: string }> = {
    optymalne: { label: 'Optymalne (<120/<80)', count: 0, color: 'bg-emerald-500' },
    prawidlowe: { label: 'Prawidłowe (120-129/80-84)', count: 0, color: 'bg-emerald-400' },
    wysokie_prawidlowe: { label: 'Wysokie prawidłowe (130-139/85-89)', count: 0, color: 'bg-yellow-400' },
    nadcisnienie_1: { label: 'Nadciśnienie st. 1 (140-159/90-99)', count: 0, color: 'bg-amber-500' },
    nadcisnienie_2: { label: 'Nadciśnienie st. 2 (160-179/100-109)', count: 0, color: 'bg-orange-500' },
    nadcisnienie_3: { label: 'Nadciśnienie st. 3 (≥180/≥110)', count: 0, color: 'bg-red-500' },
  };

  filtered.forEach(m => {
    const ptnt = getPTNTClassification(m.systolic, m.diastolic);
    if (categoriesCount[ptnt.category]) {
      categoriesCount[ptnt.category].count += 1;
    }
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f1b3d] hover:bg-slate-800 text-slate-300 font-semibold text-xs sm:text-sm border border-slate-700/60 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Powrót do pomiarów</span>
        </button>

        <div className="inline-flex bg-[#0a1128] border border-slate-800 p-1 rounded-xl">
          {(['7d', '14d', '30d', 'wszystko'] as const).map(range => (
            <button
              key={range}
              onClick={() => setFilterRange(range)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterRange === range
                  ? 'bg-sky-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Chart Container */}
      <div className="bg-[#0b142e] border border-sky-950 rounded-2xl p-4 sm:p-6 mb-6 shadow-xl shadow-black/30">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sky-400" />
              <span>Przebieg ciśnienia tętniczego i pulsu w czasie</span>
            </h3>
            <span className="text-xs text-slate-400">
              Czerwona linia przerywana: granica normy domowej PTNT (135/85 mmHg)
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-sky-300 font-medium">
              <span className="w-3 h-3 rounded-full bg-sky-400"></span> SYS (skurczowe)
            </span>
            <span className="flex items-center gap-1.5 text-indigo-300 font-medium">
              <span className="w-3 h-3 rounded-full bg-indigo-400"></span> DIA (rozkurczowe)
            </span>
            <span className="flex items-center gap-1.5 text-rose-300 font-medium">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span> Puls (bpm)
            </span>
          </div>
        </div>

        {/* Visual Chart Bars / Plot */}
        <div className="relative h-72 w-full pt-4 pb-8 flex items-end gap-2 overflow-x-auto border-b border-slate-800">
          {/* Target Limit Line: 135 mmHg */}
          <div
            className="absolute left-0 right-0 border-b-2 border-dashed border-red-500/50 z-10 pointer-events-none flex items-center justify-end pr-2"
            style={{ bottom: `${((135 - 50) / 130) * 100}%` }}
          >
            <span className="bg-red-950/80 text-red-300 text-[10px] px-1 rounded font-mono font-bold">
              Norma domowa SYS: 135
            </span>
          </div>

          {/* Target Limit Line: 85 mmHg */}
          <div
            className="absolute left-0 right-0 border-b-2 border-dashed border-red-500/40 z-10 pointer-events-none flex items-center justify-end pr-2"
            style={{ bottom: `${((85 - 50) / 130) * 100}%` }}
          >
            <span className="bg-red-950/80 text-red-300 text-[10px] px-1 rounded font-mono font-bold">
              Norma domowa DIA: 85
            </span>
          </div>

          {filtered.map(m => {
            const sysHeight = Math.min(100, Math.max(10, ((m.systolic - 50) / 130) * 100));
            const diaHeight = Math.min(100, Math.max(10, ((m.diastolic - 50) / 130) * 100));
            const pulseHeight = Math.min(100, Math.max(10, ((m.pulse - 50) / 130) * 100));
            const ptnt = getPTNTClassification(m.systolic, m.diastolic);

            return (
              <div
                key={m.id}
                className="flex-1 min-w-[28px] max-w-[50px] h-full flex flex-col justify-end items-center group relative cursor-pointer"
              >
                {/* Tooltip on hover */}
                <div className="absolute -top-24 bg-slate-900 border border-slate-700 text-white text-[11px] p-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-20 whitespace-nowrap">
                  <div className="font-bold text-sky-300">{m.date} ({m.time}) • {m.period}</div>
                  <div>Ciśnienie: <strong>{m.systolic}/{m.diastolic} mmHg</strong></div>
                  <div>Puls: <strong>{m.pulse} bpm</strong></div>
                  <div className={`text-[10px] font-semibold mt-0.5 ${ptnt.colorClass}`}>{ptnt.label}</div>
                </div>

                {/* Bars group */}
                <div className="w-full flex items-end justify-center gap-0.5 h-full">
                  {/* SYS Bar */}
                  <div
                    className="w-2 rounded-t bg-sky-400 group-hover:bg-sky-300 transition-all shadow"
                    style={{ height: `${sysHeight}%` }}
                  ></div>

                  {/* DIA Bar */}
                  <div
                    className="w-2 rounded-t bg-indigo-400 group-hover:bg-indigo-300 transition-all shadow"
                    style={{ height: `${diaHeight}%` }}
                  ></div>

                  {/* Pulse Dot / Bar */}
                  <div
                    className="w-1.5 rounded-t bg-rose-500 group-hover:bg-rose-400 transition-all"
                    style={{ height: `${pulseHeight}%` }}
                  ></div>
                </div>

                {/* Label Date */}
                <span className="text-[9px] text-slate-400 mt-2 font-mono whitespace-nowrap transform -rotate-45 origin-top-left">
                  {m.date.slice(5)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Distribution of PTNT zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0b142e] border border-sky-950 rounded-2xl p-5 shadow-xl shadow-black/20">
          <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Rozkład klasyfikacji PTNT</span>
          </h4>
          <div className="space-y-3">
            {Object.entries(categoriesCount).map(([key, item]) => {
              const total = filtered.length || 1;
              const pct = Math.round((item.count / total) * 100);
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>{item.label}</span>
                    <span className="font-bold">{item.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full ${item.color}`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clinical Guidelines Card */}
        <div className="bg-[#0b142e] border border-sky-950 rounded-2xl p-5 shadow-xl shadow-black/20 flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-sky-400" />
              <span>Zasady prawidłowego pomiaru HBPM</span>
            </h4>
            <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-sky-400 font-bold">•</span>
                <span>Pomiary wykonuj 2 razy dziennie (rano i wieczorem) o stałych porach, przed posiłkiem i przed przyjęciem leków.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-400 font-bold">•</span>
                <span>Odpocznij 5 minut w pozycji siedzącej przed wykonaniem badania z podpartymi plecami i stopami na podłodze.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-400 font-bold">•</span>
                <span>Mankiet powinien znajdować się na wysokości serca, 2-3 cm powyżej zgięcia łokciowego.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-400 font-bold">•</span>
                <span>Norma dla pomiarów domowych (HBPM) wg PTNT to <strong>poniżej 135/85 mmHg</strong> (w odróżnieniu od normy gabinetowej 140/90).</span>
              </li>
            </ul>
          </div>
          <div className="mt-4 p-3 rounded-xl bg-sky-950/40 border border-sky-800/40 text-xs text-sky-300">
            💡 Średnia z pomiarów domowych z 7 dni jest dla kardiologa najbardziej wiarygodnym wskaźnikiem skuteczności leczenia.
          </div>
        </div>
      </div>
    </div>
  );
};
