import React, { useState, useMemo } from 'react';
import { LineChart, BarChart2, PieChart, Activity, ShieldCheck, Calendar } from 'lucide-react';
import { Measurement, Language } from '../types';
import { translations } from '../i18n';
import { classifyBloodPressure } from '../utils/bpClassification';

interface ChartsViewProps {
  measurements: Measurement[];
  lang: Language;
}

export const ChartsView: React.FC<ChartsViewProps> = ({ measurements, lang }) => {
  const t = translations[lang] || translations.pl;
  const [rangeDays, setRangeDays] = useState<number>(14);

  // Filter by selected range and sort chronologically (oldest to newest for charts)
  const chartData = useMemo(() => {
    const now = Date.now();
    const cutoff = rangeDays === 9999 ? 0 : now - rangeDays * 86400000;
    return measurements
      .filter((m) => m.timestamp >= cutoff)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [measurements, rangeDays]);

  // Breakdown by WHO categories
  const categoryStats = useMemo(() => {
    const counts: Record<string, { count: number; label: string; color: string; badge: string }> = {
      optimal: { count: 0, label: t.catOptimal, color: '#0d9488', badge: 'bg-teal-500' },
      normal: { count: 0, label: t.catNormal, color: '#059669', badge: 'bg-emerald-500' },
      high_normal: { count: 0, label: t.catHighNormal, color: '#ca8a04', badge: 'bg-yellow-500' },
      hypertension_1: { count: 0, label: t.catHyper1, color: '#ea580c', badge: 'bg-orange-500' },
      hypertension_2: { count: 0, label: t.catHyper2, color: '#d97706', badge: 'bg-amber-600' },
      hypertension_3: { count: 0, label: t.catHyper3, color: '#e11d48', badge: 'bg-rose-600' },
      hypotension: { count: 0, label: t.catHypo, color: '#0284c7', badge: 'bg-sky-500' },
    };

    chartData.forEach((m) => {
      const c = classifyBloodPressure(m.systolic, m.diastolic, lang);
      if (counts[c.level]) {
        counts[c.level].count += 1;
      }
    });

    const total = chartData.length || 1;
    return Object.entries(counts).map(([level, item]) => ({
      level,
      ...item,
      percentage: Math.round((item.count / total) * 100),
    }));
  }, [chartData, lang, t]);

  // SVG Chart Dimensions
  const svgWidth = 600;
  const svgHeight = 220;
  const padding = { top: 20, right: 20, bottom: 35, left: 40 };
  const innerWidth = svgWidth - padding.left - padding.right;
  const innerHeight = svgHeight - padding.top - padding.bottom;

  // Scale calculations for BP
  const minBP = 50;
  const maxBP = 200;
  const getY = (val: number) => {
    const clamped = Math.max(minBP, Math.min(maxBP, val));
    return padding.top + innerHeight - ((clamped - minBP) / (maxBP - minBP)) * innerHeight;
  };
  const getX = (idx: number, count: number) => {
    if (count <= 1) return padding.left + innerWidth / 2;
    return padding.left + (idx / (count - 1)) * innerWidth;
  };

  return (
    <div className="mx-auto max-w-4xl px-3 py-4 sm:px-6 sm:py-6 space-y-6">
      
      {/* Top Range Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
        <div className="flex items-center gap-2">
          <LineChart className="h-5 w-5 text-rose-500" />
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {t.trendsTitle}
          </h3>
        </div>

        {/* Range Buttons (Responsive wrap) */}
        <div className="flex flex-wrap gap-1">
          {[
            { days: 7, label: t.trendsRange7 },
            { days: 14, label: t.trendsRange14 },
            { days: 30, label: t.trendsRange30 },
            { days: 9999, label: t.trendsRangeAll },
          ].map((r) => (
            <button
              key={r.days}
              type="button"
              onClick={() => setRangeDays(r.days)}
              className={`rounded-xl px-2.5 py-1.5 text-xs font-bold transition-colors ${
                rangeDays === r.days
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {chartData.length < 2 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
          <p className="text-sm sm:text-base font-semibold text-slate-500 dark:text-slate-400">
            Zbyt mało pomiarów w wybranym okresie, aby wygenerować wykres (wymagane min. 2 pomiary).
          </p>
        </div>
      ) : (
        <>
          {/* BP Line Chart Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                {t.bpOverTime}
              </span>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  {t.chartLegendSys}
                </span>
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                  {t.chartLegendDia}
                </span>
              </div>
            </div>

            {/* SVG Canvas - Responsive with viewBox */}
            <div className="w-full overflow-hidden">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible">
                {/* Safe Green Zone (80 to 120 mmHg) */}
                <rect
                  x={padding.left}
                  y={getY(130)}
                  width={innerWidth}
                  height={getY(80) - getY(130)}
                  fill="rgba(16, 185, 129, 0.08)"
                  rx="4"
                />

                {/* Horizontal reference lines */}
                {[80, 120, 140, 160].map((val) => {
                  const y = getY(val);
                  return (
                    <g key={val}>
                      <line
                        x1={padding.left}
                        x2={padding.left + innerWidth}
                        y1={y}
                        y2={y}
                        stroke="#e2e8f0"
                        strokeDasharray={val === 140 ? '4 4' : '2 2'}
                        strokeWidth={val === 140 ? 1.5 : 1}
                      />
                      <text
                        x={padding.left - 6}
                        y={y + 3}
                        textAnchor="end"
                        fontSize="10"
                        fill="#94a3b8"
                        fontWeight="600"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Systolic Line */}
                <polyline
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={chartData
                    .map((m, i) => `${getX(i, chartData.length)},${getY(m.systolic)}`)
                    .join(' ')}
                />

                {/* Diastolic Line */}
                <polyline
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={chartData
                    .map((m, i) => `${getX(i, chartData.length)},${getY(m.diastolic)}`)
                    .join(' ')}
                />

                {/* Data Points */}
                {chartData.map((m, i) => {
                  const x = getX(i, chartData.length);
                  const ySys = getY(m.systolic);
                  const yDia = getY(m.diastolic);
                  return (
                    <g key={`pt-${m.id}`}>
                      {/* SYS Dot */}
                      <circle cx={x} cy={ySys} r="4" fill="#f43f5e" stroke="#ffffff" strokeWidth="1.5" />
                      {/* DIA Dot */}
                      <circle cx={x} cy={yDia} r="4" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />
                      {/* Date label at bottom */}
                      {(i === 0 || i === chartData.length - 1 || i % Math.ceil(chartData.length / 5) === 0) && (
                        <text
                          x={x}
                          y={svgHeight - 10}
                          textAnchor="middle"
                          fontSize="9"
                          fill="#64748b"
                          fontWeight="500"
                        >
                          {m.date.slice(5)}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Pulse Bar Chart Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                {t.pulseOverTime}
              </span>
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                {t.chartLegendPulse}
              </span>
            </div>

            <div className="h-28 flex items-end gap-1.5 sm:gap-2 pt-4 px-2">
              {chartData.map((m) => {
                const p = m.pulse || 70;
                // min 40, max 120
                const heightPercent = Math.min(100, Math.max(15, ((p - 40) / 80) * 100));
                return (
                  <div
                    key={`pulse-${m.id}`}
                    className="flex-1 flex flex-col items-center gap-1 group relative cursor-pointer"
                  >
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-rose-500 to-red-400 transition-all group-hover:from-rose-600 group-hover:to-red-500"
                    />
                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 hidden sm:inline">
                      {m.pulse || ''}
                    </span>

                    {/* Tooltip on hover */}
                    <div className="pointer-events-none absolute bottom-full mb-1 hidden rounded-md bg-slate-900 px-2 py-1 text-[10px] text-white shadow group-hover:block z-20 whitespace-nowrap">
                      {m.date} {m.time}: {m.pulse} bpm
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* WHO Classification Distribution */}
          <div className="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h4 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              {t.whoDistribution}
            </h4>

            <div className="space-y-2.5">
              {categoryStats
                .filter((cat) => cat.count > 0)
                .map((cat) => (
                  <div key={cat.level} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>{cat.label}</span>
                      <span>
                        {cat.count} ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${cat.badge}`}
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}

    </div>
  );
};
