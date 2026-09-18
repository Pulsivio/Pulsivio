import React from 'react';
import { Activity, Heart, CheckCircle2, Calendar } from 'lucide-react';
import { Measurement } from '../types';

interface StatsCardsProps {
  measurements: Measurement[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ measurements }) => {
  // Compute metrics dynamically from measurements
  const count = measurements.length;
  
  let avgSys = 0;
  let avgDia = 0;
  let avgPulse = 0;
  let normalCount = 0;

  if (count > 0) {
    const sumSys = measurements.reduce((acc, m) => acc + m.systolic, 0);
    const sumDia = measurements.reduce((acc, m) => acc + m.diastolic, 0);
    const sumPulse = measurements.reduce((acc, m) => acc + m.pulse, 0);
    
    avgSys = Math.round(sumSys / count);
    avgDia = Math.round(sumDia / count);
    avgPulse = Math.round(sumPulse / count);

    // Domowa norma PTNT: < 135 SYS i < 85 DIA
    normalCount = measurements.filter(m => m.systolic < 135 && m.diastolic < 85).length;
  }

  const normalPercent = count > 0 ? Math.round((normalCount / count) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
      {/* 1. Średnie ciśnienie */}
      <div className="bg-[#0f1738] border border-sky-900/40 rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-black/20 hover:border-sky-700/50 transition-all">
        <div>
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            Średnie ciśnienie
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {count > 0 ? `${avgSys}/${avgDia}` : '--/--'}
            </span>
            <span className="text-xs font-medium text-sky-400">mmHg</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-inner">
          <Activity className="w-6 h-6" />
        </div>
      </div>

      {/* 2. Średni puls */}
      <div className="bg-[#0f1738] border border-rose-900/40 rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-black/20 hover:border-rose-700/50 transition-all">
        <div>
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            Średni puls
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {count > 0 ? avgPulse : '--'}
            </span>
            <span className="text-xs font-medium text-rose-400">bpm</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-inner">
          <Heart className="w-6 h-6 fill-rose-500/20" />
        </div>
      </div>

      {/* 3. W normie PTNT */}
      <div className="bg-[#0f1738] border border-emerald-900/40 rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-black/20 hover:border-emerald-700/50 transition-all">
        <div>
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            W normie PTNT
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight">
              {count > 0 ? `${normalPercent}%` : '0%'}
            </span>
            <span className="text-[11px] font-mono font-bold text-emerald-300/80 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
              &lt;135/85
            </span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
          <CheckCircle2 className="w-6 h-6" />
        </div>
      </div>

      {/* 4. Łącznie pomiarów */}
      <div className="bg-[#0f1738] border border-purple-900/40 rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-black/20 hover:border-purple-700/50 transition-all">
        <div>
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            Łącznie pomiarów
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {count}
            </span>
            <span className="text-xs font-medium text-purple-300">wpisów</span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner">
          <Calendar className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
