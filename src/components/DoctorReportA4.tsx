import React, { useRef } from 'react';
import { Printer, Download, ArrowLeft, Heart, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Measurement, getPTNTClassification } from '../types';

interface DoctorReportA4Props {
  measurements: Measurement[];
  onBack: () => void;
  patientName?: string;
}

export const DoctorReportA4: React.FC<DoctorReportA4Props> = ({
  measurements,
  onBack,
  patientName = 'Pacjent Pulsivio'
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  // Group measurements by date
  const datesMap: Record<string, { rano?: Measurement; poludnie?: Measurement; wieczor?: Measurement }> = {};
  
  // Sort oldest to newest for report
  const sorted = [...measurements].sort((a, b) => a.date.localeCompare(b.date));

  sorted.forEach(m => {
    if (!datesMap[m.date]) {
      datesMap[m.date] = {};
    }
    if (m.period === 'rano' && !datesMap[m.date].rano) datesMap[m.date].rano = m;
    else if (m.period === 'poludnie' && !datesMap[m.date].poludnie) datesMap[m.date].poludnie = m;
    else if (m.period === 'wieczor' && !datesMap[m.date].wieczor) datesMap[m.date].wieczor = m;
  });

  const uniqueDates = Object.keys(datesMap).sort().reverse(); // newest first on top

  // Stats
  const count = measurements.length;
  const avgSys = count > 0 ? Math.round(measurements.reduce((a, b) => a + b.systolic, 0) / count) : 0;
  const avgDia = count > 0 ? Math.round(measurements.reduce((a, b) => a + b.diastolic, 0) / count) : 0;
  const avgPulse = count > 0 ? Math.round(measurements.reduce((a, b) => a + b.pulse, 0) / count) : 0;

  const morningList = measurements.filter(m => m.period === 'rano');
  const eveningList = measurements.filter(m => m.period === 'wieczor');

  const avgMorningSys = morningList.length > 0 ? Math.round(morningList.reduce((a, b) => a + b.systolic, 0) / morningList.length) : null;
  const avgMorningDia = morningList.length > 0 ? Math.round(morningList.reduce((a, b) => a + b.diastolic, 0) / morningList.length) : null;

  const avgEveningSys = eveningList.length > 0 ? Math.round(eveningList.reduce((a, b) => a + b.systolic, 0) / eveningList.length) : null;
  const avgEveningDia = eveningList.length > 0 ? Math.round(eveningList.reduce((a, b) => a + b.diastolic, 0) / eveningList.length) : null;

  const normalHomeCount = measurements.filter(m => m.systolic < 135 && m.diastolic < 85).length;
  const normalPercent = count > 0 ? Math.round((normalHomeCount / count) * 100) : 0;

  const overallPTNT = count > 0 ? getPTNTClassification(avgSys, avgDia) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Top action bar (hidden during print) */}
      <div className="flex items-center justify-between gap-4 mb-6 print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0f1b3d] hover:bg-slate-800 text-slate-300 font-semibold text-xs sm:text-sm border border-slate-700/60 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Powrót do pomiarów</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-sky-900/40 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Drukuj raport A4 / PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet (Styling adapted for crisp white paper print & modern preview) */}
      <div
        ref={printRef}
        className="bg-white text-slate-900 rounded-2xl p-6 sm:p-10 shadow-2xl border border-slate-200 print:border-none print:shadow-none print:p-0 print:m-0"
      >
        {/* Document Header */}
        <div className="border-b-2 border-sky-800 pb-4 mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-rose-600 font-black text-2xl tracking-tight flex items-center gap-1.5">
                <Heart className="w-6 h-6 fill-rose-600 inline" />
                Pulsivio Medical
              </span>
              <span className="bg-sky-100 text-sky-800 font-bold text-xs px-2 py-0.5 rounded border border-sky-300">
                Standard PTNT
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
              Dziennik Pomiarów Ciśnienia Tętniczego (HBPM)
            </h1>
            <p className="text-xs text-slate-600">
              Raport domowej kontroli ciśnienia zgodnie z wytycznymi Polskiego Towarzystwa Nadciśnienia Tętniczego.
            </p>
          </div>

          <div className="text-right text-xs text-slate-600">
            <div>Data wygenerowania: <strong>{new Date().toLocaleDateString('pl-PL')}</strong></div>
            <div>Pacjent: <strong>{patientName}</strong></div>
            <div>Norma domowa: <strong>&lt; 135/85 mmHg</strong></div>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <span className="text-[11px] font-bold text-slate-500 block">Średnia ogólna:</span>
            <div className="text-xl font-extrabold text-slate-900">
              {avgSys}/{avgDia} <span className="text-xs font-normal text-slate-500">mmHg</span>
            </div>
            <span className="text-[11px] text-slate-600">Puls: {avgPulse} bpm</span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-500 block">Średnia rano:</span>
            <div className="text-xl font-extrabold text-amber-700">
              {avgMorningSys && avgMorningDia ? `${avgMorningSys}/${avgMorningDia}` : '--/--'}{' '}
              <span className="text-xs font-normal text-slate-500">mmHg</span>
            </div>
            <span className="text-[11px] text-slate-600">{morningList.length} pomiarów</span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-500 block">Średnia wieczór:</span>
            <div className="text-xl font-extrabold text-indigo-700">
              {avgEveningSys && avgEveningDia ? `${avgEveningSys}/${avgEveningDia}` : '--/--'}{' '}
              <span className="text-xs font-normal text-slate-500">mmHg</span>
            </div>
            <span className="text-[11px] text-slate-600">{eveningList.length} pomiarów</span>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-500 block">W normie domowej:</span>
            <div className={`text-xl font-extrabold ${normalPercent >= 70 ? 'text-emerald-700' : 'text-amber-700'}`}>
              {normalPercent}%
            </div>
            <span className="text-[11px] text-slate-600">
              {normalHomeCount} z {count} pomiarów
            </span>
          </div>
        </div>

        {/* PTNT Diagnostic evaluation banner */}
        {overallPTNT && (
          <div className="mb-6 p-3.5 rounded-lg border border-slate-300 bg-slate-100 flex items-center justify-between text-xs sm:text-sm">
            <div>
              <span className="font-bold text-slate-700">Klasyfikacja średniego profilu:</span>{' '}
              <span className="font-extrabold text-slate-900">{overallPTNT.label}</span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-white border border-slate-300">
              {overallPTNT.isNormalHome ? 'Profil w granicach normy domowej' : 'Wymagana weryfikacja lekarska'}
            </span>
          </div>
        )}

        {/* Measurements Table */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-200 text-slate-800 border-b border-slate-300 font-bold text-[11px]">
                <th className="p-2 border border-slate-300">Data</th>
                <th className="p-2 border border-slate-300 bg-amber-50/80 text-amber-900">Rano (SYS/DIA)</th>
                <th className="p-2 border border-slate-300 bg-amber-50/80 text-amber-900">Puls</th>
                <th className="p-2 border border-slate-300 bg-sky-50/80 text-sky-900">Południe</th>
                <th className="p-2 border border-slate-300 bg-indigo-50/80 text-indigo-900">Wieczór (SYS/DIA)</th>
                <th className="p-2 border border-slate-300 bg-indigo-50/80 text-indigo-900">Puls</th>
                <th className="p-2 border border-slate-300">Uwagi / Leki</th>
              </tr>
            </thead>
            <tbody>
              {uniqueDates.map(d => {
                const row = datesMap[d];
                const dateObj = new Date(d + 'T12:00:00');
                const formatted = dateObj.toLocaleDateString('pl-PL', {
                  weekday: 'short',
                  day: '2-digit',
                  month: '2-digit'
                });

                const r = row.rano;
                const p = row.poludnie;
                const w = row.wieczor;

                const notesCombined = [
                  r?.notes ? `Rano: ${r.notes}` : null,
                  p?.notes ? `Południe: ${p.notes}` : null,
                  w?.notes ? `Wieczór: ${w.notes}` : null,
                ].filter(Boolean).join('; ');

                return (
                  <tr key={d} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-2 border border-slate-300 font-semibold text-slate-900 whitespace-nowrap">
                      {formatted}
                    </td>

                    {/* Rano */}
                    <td className="p-2 border border-slate-300 font-bold bg-amber-50/30 text-slate-900">
                      {r ? `${r.systolic}/${r.diastolic}` : '-'}
                    </td>
                    <td className="p-2 border border-slate-300 bg-amber-50/30 text-slate-700">
                      {r ? `${r.pulse}` : '-'}
                    </td>

                    {/* Południe */}
                    <td className="p-2 border border-slate-300 bg-sky-50/30 text-slate-900">
                      {p ? `${p.systolic}/${p.diastolic} (${p.pulse})` : '-'}
                    </td>

                    {/* Wieczór */}
                    <td className="p-2 border border-slate-300 font-bold bg-indigo-50/30 text-slate-900">
                      {w ? `${w.systolic}/${w.diastolic}` : '-'}
                    </td>
                    <td className="p-2 border border-slate-300 bg-indigo-50/30 text-slate-700">
                      {w ? `${w.pulse}` : '-'}
                    </td>

                    {/* Uwagi */}
                    <td className="p-2 border border-slate-300 text-slate-600 italic max-w-xs truncate">
                      {notesCombined || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Doctor signature and clinical notes space */}
        <div className="grid grid-cols-2 gap-8 pt-6 border-t-2 border-slate-200 mt-6">
          <div>
            <span className="text-xs font-bold text-slate-700 block mb-1">
              Zalecenia i modyfikacja terapii:
            </span>
            <div className="border border-dashed border-slate-400 rounded-lg h-24 p-2 text-xs text-slate-400">
              Miejsce na notatki lekarza prowadzącego...
            </div>
          </div>
          <div className="flex flex-col justify-between text-right">
            <span className="text-xs text-slate-500">
              Dokument sporządzony przez aplikację Pulsivio na podstawie samodzielnych pomiarów pacjenta aparatem naramiennym.
            </span>
            <div className="pt-8">
              <div className="inline-block border-t border-slate-700 pt-1 w-48 text-center text-xs text-slate-700">
                Pieczątka i podpis lekarza
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
