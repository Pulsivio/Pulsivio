import React, { useState, useMemo, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { 
  Printer, 
  Download, 
  RefreshCw, 
  Calendar, 
  Sun, 
  Clock, 
  Moon, 
  Activity, 
  Heart, 
  FileText, 
  Check, 
  Save, 
  ArrowLeft, 
  ShieldCheck, 
  AlertTriangle, 
  Pill, 
  User, 
  Stethoscope, 
  Info 
} from 'lucide-react';
import { Measurement, Language, UserProfile, BPClassification } from '../types';
import { classifyBloodPressure } from '../utils/bpClassification';

interface DoctorStandaloneViewProps {
  measurements: Measurement[];
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
  syncCode?: string;
  onRefresh?: () => void;
  onExitDoctorMode?: () => void;
  isSyncing?: boolean;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

interface DailyRow {
  date: string;
  dayLabel: string;
  morning?: Measurement;
  noon?: Measurement;
  evening?: Measurement;
  extra: Measurement[];
  avgSys: number;
  avgDia: number;
  avgPulse: number;
  totalCount: number;
  notes: string[];
  isHigh: boolean;
  classification: BPClassification;
}

export const DoctorStandaloneView: React.FC<DoctorStandaloneViewProps> = ({
  measurements,
  profile,
  onUpdateProfile,
  syncCode,
  onRefresh,
  onExitDoctorMode,
  isSyncing = false,
  isDarkMode = false,
  onToggleDarkMode,
}) => {
  // Editable fields in report
  const [patientName, setPatientName] = useState<string>(profile.name && profile.name !== 'Jan Kowalski' ? profile.name : '');
  const [birthYear, setBirthYear] = useState<string>(profile.birthYear && profile.birthYear !== '1954' ? profile.birthYear : '');
  const [medications, setMedications] = useState<string>(profile.medications || '');
  const [doctorName, setDoctorName] = useState<string>(profile.doctorName && !profile.doctorName.includes('Wiśniewska') ? profile.doctorName : '');
  const [doctorNotes, setDoctorNotes] = useState<string>(profile.notesForDoctor && !profile.notesForDoctor.includes('Prestarium') ? profile.notesForDoctor : '');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [periodFilter, setPeriodFilter] = useState<'7d' | '14d' | '30d' | 'all'>('7d');
  const [isDoctorLargeFont, setIsDoctorLargeFont] = useState<boolean>(false);

  // Keep local state in sync when profile updates from cloud
  useEffect(() => {
    if (profile.name && !patientName) setPatientName(profile.name);
    if (profile.birthYear && !birthYear) setBirthYear(profile.birthYear);
    if (profile.medications && !medications) setMedications(profile.medications);
    if (profile.doctorName && !doctorName) setDoctorName(profile.doctorName);
    if (profile.notesForDoctor && !doctorNotes) setDoctorNotes(profile.notesForDoctor);
  }, [profile]);

  const handleSaveData = () => {
    onUpdateProfile({
      ...profile,
      name: patientName,
      birthYear,
      medications,
      doctorName,
      notesForDoctor: doctorNotes,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter measurements by active period for the doctor (7d PTNT, 14d, 30d, all)
  const activeMeasurements = useMemo(() => {
    if (periodFilter === 'all') return measurements;
    const days = periodFilter === '7d' ? 7 : periodFilter === '14d' ? 14 : 30;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const filtered = measurements.filter((m) => m.timestamp >= cutoff);
    return filtered.length > 0 ? filtered : measurements;
  }, [measurements, periodFilter]);

  // Group measurements by Day: 1 dzień = 3 pomiary (Rano, Południe, Wieczór)
  const dailyRows = useMemo<DailyRow[]>(() => {
    const map = new Map<string, Measurement[]>();

    // Sort descending by date
    const sorted = [...activeMeasurements].sort((a, b) => b.timestamp - a.timestamp);

    sorted.forEach((m) => {
      const d = m.date || 'Inna data';
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(m);
    });

    const rows: DailyRow[] = [];

    map.forEach((dayList, dateKey) => {
      let morning: Measurement | undefined;
      let noon: Measurement | undefined;
      let evening: Measurement | undefined;
      const extra: Measurement[] = [];
      const notes: string[] = [];

      const ascList = [...dayList].sort((a, b) => (a.time || '').localeCompare(b.time || ''));

      ascList.forEach((m) => {
        if (m.notes) notes.push(m.notes);
        if (m.tags && m.tags.length > 0) notes.push(m.tags.join(', '));

        if (m.period === 'morning') {
          if (!morning) morning = m;
          else extra.push(m);
        } else if (m.period === 'noon') {
          if (!noon) noon = m;
          else extra.push(m);
        } else if (m.period === 'evening') {
          if (!evening) evening = m;
          else extra.push(m);
        } else {
          // Fallback by time
          const tVal = m.time || '';
          if (tVal && tVal < '11:30' && !morning) morning = m;
          else if (tVal && tVal >= '11:30' && tVal < '16:30' && !noon) noon = m;
          else if (tVal && tVal >= '16:30' && !evening) evening = m;
          else extra.push(m);
        }
      });

      const sumSys = dayList.reduce((acc, m) => acc + m.systolic, 0);
      const sumDia = dayList.reduce((acc, m) => acc + m.diastolic, 0);
      const pulseItems = dayList.filter((m) => m.pulse);
      const sumPulse = pulseItems.reduce((acc, m) => acc + (m.pulse || 0), 0);

      const avgSys = Math.round(sumSys / dayList.length);
      const avgDia = Math.round(sumDia / dayList.length);
      const avgPulse = pulseItems.length ? Math.round(sumPulse / pulseItems.length) : 0;
      const isHigh = avgSys >= 135 || avgDia >= 85;

      let dayLabel = dateKey;
      try {
        const dObj = new Date(dateKey + 'T12:00:00');
        const dayNames = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
        const dayName = dayNames[dObj.getDay()];
        const parts = dateKey.split('-');
        if (parts.length === 3) {
          dayLabel = `${parts[2]}.${parts[1]} (${dayName})`;
        }
      } catch {
        dayLabel = dateKey;
      }

      const cls = classifyBloodPressure(avgSys, avgDia, 'pl');

      rows.push({
        date: dateKey,
        dayLabel,
        morning,
        noon,
        evening,
        extra,
        avgSys,
        avgDia,
        avgPulse,
        totalCount: dayList.length,
        notes: Array.from(new Set(notes)),
        isHigh,
        classification: cls,
      });
    });

    return rows;
  }, [activeMeasurements]);

  // Overall Cardiology Statistics "W Pigułce"
  const stats = useMemo(() => {
    const total = activeMeasurements.length;
    if (total === 0) {
      return {
        total: 0,
        avgSys: 0,
        avgDia: 0,
        avgPulse: 0,
        minSys: 0,
        maxSys: 0,
        minDia: 0,
        maxDia: 0,
        maxMeasurement: null as Measurement | null,
        normPercent: 0,
        normCount: 0,
        pulsePressure: 0,
        map: 0,
        morningSurge: 0,
        morningAvg: { sys: 0, dia: 0, pulse: 0, count: 0 },
        noonAvg: { sys: 0, dia: 0, pulse: 0, count: 0 },
        eveningAvg: { sys: 0, dia: 0, pulse: 0, count: 0 },
        classification: { label: 'Brak danych', color: 'text-slate-500' },
      };
    }

    let sumSys = 0;
    let sumDia = 0;
    let sumPulse = 0;
    let pulseCount = 0;
    let minSys = 999;
    let maxSys = 0;
    let minDia = 999;
    let maxDia = 0;
    let maxMeasurement: Measurement | null = null;
    let normCount = 0;

    const morningList: Measurement[] = [];
    const noonList: Measurement[] = [];
    const eveningList: Measurement[] = [];

    activeMeasurements.forEach((m) => {
      sumSys += m.systolic;
      sumDia += m.diastolic;
      if (m.pulse) {
        sumPulse += m.pulse;
        pulseCount += 1;
      }

      if (m.systolic < minSys) minSys = m.systolic;
      if (m.systolic > maxSys) {
        maxSys = m.systolic;
        maxMeasurement = m;
      }
      if (m.diastolic < minDia) minDia = m.diastolic;
      if (m.diastolic > maxDia) maxDia = m.diastolic;

      // PTNT criteria: Home Blood Pressure Monitoring norm < 135/85 mmHg
      if (m.systolic < 135 && m.diastolic < 85) {
        normCount += 1;
      }

      if (m.period === 'morning') morningList.push(m);
      else if (m.period === 'noon') noonList.push(m);
      else if (m.period === 'evening') eveningList.push(m);
      else {
        const tVal = m.time || '';
        if (tVal && tVal < '11:30') morningList.push(m);
        else if (tVal && tVal >= '11:30' && tVal < '16:30') noonList.push(m);
        else if (tVal && tVal >= '16:30') eveningList.push(m);
      }
    });

    const avgSys = Math.round(sumSys / total);
    const avgDia = Math.round(sumDia / total);
    const avgPulse = pulseCount ? Math.round(sumPulse / pulseCount) : 0;
    const pulsePressure = avgSys - avgDia;
    const map = Math.round((2 * avgDia + avgSys) / 3);

    const calcSub = (list: Measurement[]) => {
      if (list.length === 0) return { sys: 0, dia: 0, pulse: 0, count: 0 };
      const sS = list.reduce((a, b) => a + b.systolic, 0);
      const sD = list.reduce((a, b) => a + b.diastolic, 0);
      const pItems = list.filter((b) => b.pulse);
      const sP = pItems.reduce((a, b) => a + (b.pulse || 0), 0);
      return {
        sys: Math.round(sS / list.length),
        dia: Math.round(sD / list.length),
        pulse: pItems.length ? Math.round(sP / pItems.length) : 0,
        count: list.length,
      };
    };

    const morningAvg = calcSub(morningList);
    const eveningAvg = calcSub(eveningList);
    const morningSurge = (morningAvg.count > 0 && eveningAvg.count > 0)
      ? morningAvg.sys - eveningAvg.sys
      : 0;

    return {
      total,
      avgSys,
      avgDia,
      avgPulse,
      minSys: minSys === 999 ? 0 : minSys,
      maxSys,
      minDia: minDia === 999 ? 0 : minDia,
      maxDia,
      maxMeasurement,
      normPercent: Math.round((normCount / total) * 100),
      normCount,
      pulsePressure,
      map,
      morningSurge,
      morningAvg,
      noonAvg: calcSub(noonList),
      eveningAvg,
      classification: classifyBloodPressure(avgSys, avgDia, 'pl'),
    };
  }, [activeMeasurements]);

  // Export PDF formatted for A4
  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Header
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('KARTA KONTROLI CISNIENIA TETNICZEGO (DLA LEKARZA)', 14, 18);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const pName = patientName || profile.name || 'Pacjent';
    const bYear = birthYear || profile.birthYear || '---';
    const meds = medications || profile.medications || 'Brak wpisanych lekow';
    const docN = doctorName || profile.doctorName || 'Lekarz prowadzacy';

    doc.text(`Pacjent: ${pName} (rok ur. ${bYear}) | Lekarz: ${docN}`, 14, 25);
    doc.text(`Leki stale: ${meds}`, 14, 30);
    doc.text(`Data wygenerowania: ${new Date().toLocaleDateString('pl-PL')} | Kod synchronizacji: ${syncCode || '---'}`, 14, 35);

    // Divider
    doc.line(14, 38, 196, 38);

    // Summary Box
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('PODSUMOWANIE W PIGULCE (Wytyczne PTNT/ESH norma domowa <135/85 mmHg):', 14, 45);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Srednie cisnienie calkowite: ${stats.avgSys}/${stats.avgDia} mmHg | Puls: ${stats.avgPulse} bpm`, 14, 52);
    doc.text(`Klasyfikacja PTNT: ${stats.classification.label} | Pomiary w normie: ${stats.normPercent}% (${stats.normCount}/${stats.total})`, 14, 58);
    doc.text(`Srednia Rano: ${stats.morningAvg.sys}/${stats.morningAvg.dia} mmHg | Srednia Poludnie: ${stats.noonAvg.sys}/${stats.noonAvg.dia} | Srednia Wieczor: ${stats.eveningAvg.sys}/${stats.eveningAvg.dia}`, 14, 64);
    doc.text(`Cisnienie tetna (PP): ${stats.pulsePressure} mmHg | MAP: ${stats.map} mmHg | Zakres skrajny: SYS ${stats.minSys}-${stats.maxSys}, DIA ${stats.minDia}-${stats.maxDia}`, 14, 70);

    doc.line(14, 74, 196, 74);

    // Daily Table
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('ZESTAWIENIE DZIENNE (1 DZIEN = 3 POMIARY: RANO / POLUDNIE / WIECZOR):', 14, 81);

    let y = 88;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Data', 14, y);
    doc.text('Rano (czczo)', 42, y);
    doc.text('Poludnie', 74, y);
    doc.text('Wieczor', 106, y);
    doc.text('Srednia doby', 138, y);
    doc.text('Status PTNT / Uwagi', 165, y);

    y += 4;
    doc.line(14, y, 196, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    dailyRows.slice(0, 32).forEach((row) => {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }
      const mStr = row.morning ? `${row.morning.systolic}/${row.morning.diastolic} (p:${row.morning.pulse || '-'})` : '---';
      const nStr = row.noon ? `${row.noon.systolic}/${row.noon.diastolic} (p:${row.noon.pulse || '-'})` : '---';
      const eStr = row.evening ? `${row.evening.systolic}/${row.evening.diastolic} (p:${row.evening.pulse || '-'})` : '---';
      const avgStr = `${row.avgSys}/${row.avgDia} (p:${row.avgPulse})`;

      doc.text(row.date, 14, y);
      doc.text(mStr, 42, y);
      doc.text(nStr, 74, y);
      doc.text(eStr, 106, y);
      doc.text(avgStr, 138, y);
      doc.text(row.classification.label.slice(0, 18), 165, y);

      y += 5.5;
    });

    const filename = `Karta_Cisnienia_${(patientName || 'Pacjent').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100 p-2 sm:p-6 print:p-0 print:bg-white print:text-black">
      
      {/* Top Doctor Navigation & Actions Bar (Hidden when printing) */}
      <div className="no-print max-w-5xl mx-auto mb-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                  Portal gabinetu lekarskiego
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                Karta Pomiarów Ciśnienia Tętniczego Pacjenta
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Widok zoptymalizowany dla lekarza prowadzącego • 1 dzień = 3 pomiary
              </p>
            </div>
          </div>

          {/* Action Buttons for Physician */}
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
            
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                title="Odśwież najświeższe dane z telefonu pacjenta"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-blue-600' : 'text-slate-600'}`} />
                <span>{isSyncing ? 'Synchronizacja...' : 'Odśwież'}</span>
              </button>
            )}

            {onToggleDarkMode && (
              <button
                type="button"
                onClick={onToggleDarkMode}
                id="doctor-theme-toggle-btn"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                title={isDarkMode ? 'Przełącz na motyw jasny' : 'Przełącz na motyw ciemny'}
              >
                {isDarkMode ? <Sun className="h-3.5 w-3.5 text-amber-500" /> : <Moon className="h-3.5 w-3.5 text-slate-700" />}
                <span className="hidden md:inline">{isDarkMode ? 'Jasny' : 'Ciemny'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              id="doctor-print-btn"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
            >
              <Printer className="h-4 w-4" />
              <span>Drukuj kartę A4</span>
            </button>

            <button
              type="button"
              onClick={handleExportPDF}
              id="doctor-pdf-btn"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
            >
              <Download className="h-4 w-4" />
              <span>Pobierz PDF</span>
            </button>

            {onExitDoctorMode && (
              <button
                type="button"
                onClick={onExitDoctorMode}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
                title="Przejdź do pełnej aplikacji ze wszystkimi funkcjami"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Aplikacja</span>
              </button>
            )}
          </div>
        </div>

        {/* Clinic Consultation Banner */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <Info className="h-3.5 w-3.5 text-blue-600 shrink-0" />
          <span>
            Karta konsultacyjna zoptymalizowana do odczytu w gabinecie lekarskim (duża czytelna czcionka, automatyczne średnie poranne i wieczorne wg wytycznych PTNT).
          </span>
        </div>
      </div>

      {/* Quick Filters for Doctor / Consultation (Screen only) */}
      <div className="max-w-5xl mx-auto mb-4 print:hidden flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 mr-1">
            Okres wizyty:
          </span>
          <button
            type="button"
            onClick={() => setPeriodFilter('7d')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              periodFilter === '7d'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            ⭐ Ostatnie 7 dni (Zalecenie PTNT)
          </button>
          <button
            type="button"
            onClick={() => setPeriodFilter('14d')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              periodFilter === '14d'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            14 dni
          </button>
          <button
            type="button"
            onClick={() => setPeriodFilter('30d')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              periodFilter === '30d'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            30 dni
          </button>
          <button
            type="button"
            onClick={() => setPeriodFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              periodFilter === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Wszystkie ({measurements.length})
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsDoctorLargeFont(!isDoctorLargeFont)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            isDoctorLargeFont
              ? 'bg-amber-500 text-slate-950 font-black'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <span>🔍 Powiększone cyfry dla lekarza</span>
          {isDoctorLargeFont && <Check className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Main Medical Sheet (Screen + A4 Print) */}
      <div className="max-w-5xl mx-auto bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 rounded-3xl border border-slate-300 dark:border-slate-800 p-4 sm:p-7 shadow-md print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none">
        
        {/* Printable Header */}
        <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 block">
                Dokumentacja samokontroli ciśnienia tętniczego (HBPM)
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-0.5">
                Karta wyników pomiarów ciśnienia krwi
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pomiary domowe wykonywane aparatem naramiennym • Norma wg zaleceń PTNT / ESH: &lt; 135 / 85 mmHg
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-600 dark:text-slate-400">
              <div>Data wydruku: <strong>{new Date().toLocaleDateString('pl-PL')}</strong></div>
              <div>Kod pacjenta: <strong className="font-mono text-blue-600">{syncCode || 'Pulsivio'}</strong></div>
            </div>
          </div>

          {/* Patient Info Row (Interactive & Printable) */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                Imię i nazwisko pacjenta:
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="np. Janina Nowak"
                className="w-full bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 print:border-none print:bg-transparent print:p-0 print:font-bold"
              />
              <div className="hidden print:block text-slate-400 text-xs mt-0.5">
                {!patientName && '...........................................................................'}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                Rok urodzenia / Wiek:
              </label>
              <input
                type="text"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                placeholder="np. 1952"
                className="w-full bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 print:border-none print:bg-transparent print:p-0 print:font-bold"
              />
              <div className="hidden print:block text-slate-400 text-xs mt-0.5">
                {!birthYear && '...................................................'}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5">
                Lekarz prowadzący / Przychodnia:
              </label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="np. dr n. med. A. Kowalska"
                className="w-full bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 print:border-none print:bg-transparent print:p-0 print:font-bold"
              />
              <div className="hidden print:block text-slate-400 text-xs mt-0.5">
                {!doctorName && '...................................................'}
              </div>
            </div>

            <div className="sm:col-span-3 pt-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 flex items-center gap-1.5">
                <Pill className="h-3.5 w-3.5 text-indigo-600" />
                <span>Aktualnie przyjmowane leki (nazwa, dawka, pory przyjmowania):</span>
              </label>
              <input
                type="text"
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                placeholder="Wpisz przyjmowane leki i dawkowanie (lub zostaw puste)"
                className="w-full bg-white dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 print:border-none print:bg-transparent print:p-0 print:font-normal"
              />
              <div className="hidden print:block text-slate-400 text-xs mt-0.5">
                {!medications && '................................................................................................................................................................................................'}
              </div>
            </div>
          </div>

          {/* Patient Data Entry Explanatory Note & Save */}
          <div className="no-print mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-xs text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-600 shrink-0" />
              <span>
                <strong>Jak wypełnić dane:</strong> Możesz wpisać dane powyżej na ekranie i kliknąć „Zapisz dane w raporcie”, albo zostawić pola puste — na wydruku pojawią się równe wykropkowane linie do wpisania ręcznego długopisem.
              </span>
            </span>
            <button
              type="button"
              onClick={handleSaveData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
            >
              {isSaved ? <Check className="h-3.5 w-3.5 text-white" /> : <Save className="h-3.5 w-3.5" />}
              <span>{isSaved ? 'Zapisano w karcie!' : 'Zapisz dane w raporcie'}</span>
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SEKCJA: W PIGUŁCE DLA LEKARZA (CLINICAL AT-A-GLANCE)          */}
        {/* ============================================================ */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-600" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Podsumowanie w pigułce dla lekarza (Łącznie pomiarów: {stats.total})
              </h3>
            </div>
            <span className="text-[11px] font-bold text-slate-500">
              Kryteria normy domowej HBPM: &lt; 135/85 mmHg
            </span>
          </div>

          {/* 4 Large Clinical Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            
            {/* Card 1: Mean BP */}
            <div className="p-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-850 text-center">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                Średnie ciśnienie
              </span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {stats.avgSys} / {stats.avgDia}
                <span className="text-xs font-normal text-slate-500 ml-1">mmHg</span>
              </div>
              <div className="mt-1 inline-block px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300">
                {stats.classification.label}
              </div>
            </div>

            {/* Card 2: Pulse & Resting Heart Rate */}
            <div className="p-3.5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-center">
              <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 block mb-1">
                Średnie tętno
              </span>
              <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
                {stats.avgPulse}
                <span className="text-xs font-normal text-slate-500 ml-1">bpm</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                Zakres: SYS {stats.minSys}–{stats.maxSys} mmHg
              </div>
            </div>

            {/* Card 3: Norm Compliance */}
            <div className="p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-center">
              <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 block mb-1">
                Pomiary w normie
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-300 tracking-tight">
                {stats.normPercent}%
              </div>
              <div className="mt-1 text-[11px] text-emerald-800 dark:text-emerald-400 font-bold">
                {stats.normCount} z {stats.total} pomiarów &lt;135/85
              </div>
            </div>

            {/* Card 4: Pulse Pressure & MAP */}
            <div className="p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 text-center">
              <span className="text-[11px] font-semibold text-indigo-800 dark:text-indigo-300 block mb-1">
                Ciśnienie tętna (PP) / MAP
              </span>
              <div className="text-xl sm:text-2xl font-black text-indigo-950 dark:text-indigo-200 tracking-tight">
                {stats.pulsePressure}
                <span className="text-xs font-normal text-slate-500 ml-1">mmHg</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-600 dark:text-slate-400">
                MAP: <strong>{stats.map} mmHg</strong> (PP norma &lt;50)
              </div>
            </div>

          </div>

          {/* Cardiology Quick Scan Ribbons: Morning Surge & Peak Measurement */}
          <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* Morning Surge Indicator */}
            <div className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                🌅 Profil dobowy:
              </span>
              {stats.morningSurge >= 10 ? (
                <span className="text-[11px] font-black text-amber-700 dark:text-amber-400">
                  Poranny skok (+{stats.morningSurge} mmHg wyższe rano)
                </span>
              ) : stats.morningSurge <= -10 ? (
                <span className="text-[11px] font-black text-indigo-700 dark:text-indigo-400">
                  Wyższe wieczorem ({Math.abs(stats.morningSurge)} mmHg)
                </span>
              ) : (
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  Wyrównany profil rano/wieczór (Δ {Math.abs(stats.morningSurge)} mmHg)
                </span>
              )}
            </div>

            {/* Peak Single Reading */}
            <div className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                ⚡ Wartość szczytowa:
              </span>
              {stats.maxMeasurement ? (
                <span className="text-[11px] font-black text-rose-600 dark:text-rose-400">
                  {stats.maxMeasurement.systolic}/{stats.maxMeasurement.diastolic} mmHg{' '}
                  <span className="text-[10px] font-normal text-slate-500">
                    ({stats.maxMeasurement.date}{stats.maxMeasurement.time ? ` ${stats.maxMeasurement.time}` : ''})
                  </span>
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">brak</span>
              )}
            </div>
          </div>

          {/* Diurnal Rhythm Matrix (Rano vs Południe vs Wieczór) */}
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-100/80 dark:bg-slate-800/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
            <div className="flex items-center justify-between px-2 py-1 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900/50">
              <span className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-400">
                <Sun className="h-4 w-4 text-amber-500" />
                Rano (czczo):
              </span>
              <span className="font-black text-slate-900 dark:text-white">
                {stats.morningAvg.count > 0 ? `${stats.morningAvg.sys}/${stats.morningAvg.dia} (${stats.morningAvg.pulse} bpm)` : 'brak'}
              </span>
            </div>

            <div className="flex items-center justify-between px-2 py-1 bg-white dark:bg-slate-900 rounded-xl border border-sky-200 dark:border-sky-900/50">
              <span className="flex items-center gap-1.5 font-bold text-sky-800 dark:text-sky-400">
                <Clock className="h-4 w-4 text-sky-500" />
                Południe:
              </span>
              <span className="font-black text-slate-900 dark:text-white">
                {stats.noonAvg.count > 0 ? `${stats.noonAvg.sys}/${stats.noonAvg.dia} (${stats.noonAvg.pulse} bpm)` : 'brak'}
              </span>
            </div>

            <div className="flex items-center justify-between px-2 py-1 bg-white dark:bg-slate-900 rounded-xl border border-indigo-200 dark:border-indigo-900/50">
              <span className="flex items-center gap-1.5 font-bold text-indigo-800 dark:text-indigo-400">
                <Moon className="h-4 w-4 text-indigo-500" />
                Wieczór:
              </span>
              <span className="font-black text-slate-900 dark:text-white">
                {stats.eveningAvg.count > 0 ? `${stats.eveningAvg.sys}/${stats.eveningAvg.dia} (${stats.eveningAvg.pulse} bpm)` : 'brak'}
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* GŁÓWNA TABELA: 1 DZIEN = 3 POMIARY (RANO, POLUDNIE, WIECZOR)  */}
        {/* ============================================================ */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>Zestawienie dzienne (1 dzień = 3 pomiary w jednym wierszu)</span>
            </h3>
            <span className="text-xs text-slate-500">
              Łącznie {dailyRows.length} dni kontrolnych
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-300 dark:border-slate-700">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100 font-black border-b border-slate-300 dark:border-slate-700">
                  <th className="p-2.5 border-r border-slate-300 dark:border-slate-700 w-32">
                    Dzień / Data
                  </th>
                  <th className="p-2.5 border-r border-slate-300 dark:border-slate-700 text-center">
                    <span className="flex items-center justify-center gap-1 text-amber-800 dark:text-amber-400 font-black">
                      <Sun className="h-3.5 w-3.5" />
                      <span>Rano (na czczo)</span>
                    </span>
                  </th>
                  <th className="p-2.5 border-r border-slate-300 dark:border-slate-700 text-center">
                    <span className="flex items-center justify-center gap-1 text-sky-800 dark:text-sky-400 font-black">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Południe</span>
                    </span>
                  </th>
                  <th className="p-2.5 border-r border-slate-300 dark:border-slate-700 text-center">
                    <span className="flex items-center justify-center gap-1 text-indigo-800 dark:text-indigo-400 font-black">
                      <Moon className="h-3.5 w-3.5" />
                      <span>Wieczór</span>
                    </span>
                  </th>
                  <th className="p-2.5 border-r border-slate-300 dark:border-slate-700 text-center bg-slate-300/60 dark:bg-slate-700/60">
                    Średnia doby
                  </th>
                  <th className="p-2.5 border-r border-slate-300 dark:border-slate-700">
                    Klasyfikacja PTNT
                  </th>
                  <th className="p-2.5">
                    Objawy / Samopoczucie / Leki
                  </th>
                </tr>
              </thead>
              <tbody>
                {dailyRows.map((row) => {
                  const formatCell = (m?: Measurement) => {
                    if (!m) {
                      return <span className="text-slate-400 dark:text-slate-600 font-mono text-[11px]">—</span>;
                    }
                    const isHigh = m.systolic >= 135 || m.diastolic >= 85;
                    return (
                      <div className="py-1">
                        <span className={`font-black tracking-tight ${isDoctorLargeFont ? 'text-base sm:text-xl' : 'text-sm sm:text-base'} ${isHigh ? 'text-rose-600 dark:text-rose-400 font-black' : 'text-slate-900 dark:text-white'}`}>
                          {m.systolic}/{m.diastolic}
                        </span>
                        <div className={`${isDoctorLargeFont ? 'text-[11px]' : 'text-[10px]'} text-slate-500 flex items-center justify-center gap-1`}>
                          {m.pulse && <span className="font-bold text-rose-600">♥{m.pulse}</span>}
                          {m.time && <span>({m.time})</span>}
                          <span className="text-[9px] font-bold">[{m.arm === 'left' ? 'L' : 'P'}]</span>
                        </div>
                      </div>
                    );
                  };

                  return (
                    <tr 
                      key={`row-${row.date}`}
                      className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850/50"
                    >
                      <td className="p-2.5 border-r border-slate-200 dark:border-slate-800 font-bold whitespace-nowrap">
                        <div className={`text-slate-900 dark:text-white font-black ${isDoctorLargeFont ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'}`}>{row.dayLabel}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{row.date}</div>
                      </td>

                      <td className="p-2 border-r border-slate-200 dark:border-slate-800 text-center">
                        {formatCell(row.morning)}
                      </td>

                      <td className="p-2 border-r border-slate-200 dark:border-slate-800 text-center">
                        {formatCell(row.noon)}
                      </td>

                      <td className="p-2 border-r border-slate-200 dark:border-slate-800 text-center">
                        {formatCell(row.evening)}
                      </td>

                      <td className="p-2 border-r border-slate-200 dark:border-slate-800 text-center bg-slate-50 dark:bg-slate-900/40">
                        <span className={`font-black ${isDoctorLargeFont ? 'text-base sm:text-xl' : 'text-sm sm:text-base'} ${row.isHigh ? 'text-rose-600 dark:text-rose-400 font-black' : 'text-slate-900 dark:text-white'}`}>
                          {row.avgSys}/{row.avgDia}
                        </span>
                        <div className={`${isDoctorLargeFont ? 'text-[11px]' : 'text-[10px]'} text-slate-500`}>
                          Puls: <strong className="text-rose-600">{row.avgPulse}</strong> bpm ({row.totalCount} pom.)
                        </div>
                      </td>

                      <td className="p-2.5 border-r border-slate-200 dark:border-slate-800 text-[11px] font-semibold">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold ${row.isHigh ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'}`}>
                          {row.classification.label}
                        </span>
                      </td>

                      <td className="p-2.5 text-slate-700 dark:text-slate-300 text-[11px]">
                        {row.notes.length > 0 ? row.notes.join(' • ') : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Doctor's Handwritten Fill-in or Digital Notes */}
        <div className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-4 bg-slate-50/60 dark:bg-slate-900/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Zalecenia lekarskie po wizycie / Zmiana dawkowania leków:
            </span>
            <span className="text-[10px] text-slate-500">
              Lekarz może wpisać zalecenia poniżej lub odręcznie na wydruku
            </span>
          </div>

          <textarea
            rows={3}
            value={doctorNotes}
            onChange={(e) => setDoctorNotes(e.target.value)}
            onBlur={handleSaveData}
            placeholder="np. Utrzymano dotychczasowe leczenie. Zalecono ograniczenie soli i kontrolę za 3 miesiące z dzienniczkiem pomiarów..."
            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 print:hidden"
          />

          {/* Printable lines for handwritten notes */}
          <div className="hidden print:block space-y-4 pt-2">
            <div className="border-b border-slate-400 pb-2 text-xs font-semibold text-slate-800">
              {doctorNotes || '........................................................................................................................................................................................................................'}
            </div>
            <div className="border-b border-slate-400 pb-2 text-xs font-semibold text-slate-800">
              ........................................................................................................................................................................................................................
            </div>
            <div className="flex justify-between pt-4 text-xs font-bold text-slate-700">
              <span>Data wizyty: ........................................</span>
              <span>Podpis i pieczątka lekarza: ........................................</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
