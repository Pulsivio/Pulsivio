import React, { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import { 
  FileText, 
  Printer, 
  Mail, 
  Share2, 
  Check, 
  FileDown, 
  FileSpreadsheet, 
  Sun, 
  Moon, 
  Clock, 
  Pill, 
  RotateCcw, 
  Trash2, 
  Stethoscope, 
  Activity, 
  Heart, 
  HelpCircle, 
  Calendar, 
  CalendarDays, 
  Layers, 
  Sparkles, 
  Save, 
  Info 
} from 'lucide-react';
import { Measurement, Language, UserProfile, TimePeriod, BPClassification } from '../types';
import { classifyBloodPressure } from '../utils/bpClassification';
import { translations } from '../i18n';

interface PrintableReportProps {
  measurements: Measurement[];
  lang: Language;
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  currentAvatar?: string;
  syncCode?: string;
  onPushSync?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  onOpenDoctorMode?: () => void;
}

interface DailyGroup {
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

export const PrintableReport: React.FC<PrintableReportProps> = ({
  measurements,
  lang,
  profile,
  onUpdateProfile,
  currentAvatar,
  syncCode,
  onPushSync,
  isDarkMode,
  onToggleDarkMode,
  onOpenDoctorMode,
}) => {
  const t = translations[lang] || translations.pl;

  // Patient and report fields - start empty if profile has no real value
  const [patientName, setPatientName] = useState<string>(profile.name && profile.name !== 'Jan Kowalski' ? profile.name : '');
  const [birthYear, setBirthYear] = useState<string>(profile.birthYear && profile.birthYear !== '1954' ? profile.birthYear : '');
  const [medications, setMedications] = useState<string>(profile.medications || '');
  const [notesForDoc, setNotesForDoc] = useState<string>(profile.notesForDoctor && !profile.notesForDoctor.includes('Prestarium') ? profile.notesForDoctor : '');
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  // View mode: 'daily' (1 dzień = 3 pomiary) by default, or 'detailed' (row by row)
  const [viewMode, setViewMode] = useState<'daily' | 'detailed'>('daily');
  // Period filter for doctor visit: '7d' (PTNT recommendation), '14d', '30d', 'all'
  const [periodFilter, setPeriodFilter] = useState<'7d' | '14d' | '30d' | 'all'>('all');
  const [isDoctorLargeFont, setIsDoctorLargeFont] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const effectiveSyncCode = syncCode || 'PULSIVIO';

  const handleSaveReportData = () => {
    onUpdateProfile({
      ...profile,
      name: patientName,
      birthYear,
      medications,
      notesForDoctor: notesForDoc,
    });
    if (onPushSync) onPushSync();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleProfileBlur = () => {
    onUpdateProfile({
      ...profile,
      name: patientName,
      birthYear,
      medications,
      notesForDoctor: notesForDoc,
    });
  };

  const handleClearAllFields = () => {
    setPatientName('');
    setBirthYear('');
    setMedications('');
    setNotesForDoc('');
    onUpdateProfile({
      ...profile,
      name: '',
      birthYear: '',
      medications: '',
      notesForDoctor: '',
    });
  };

  // Filter measurements by active period (7d PTNT, 14d, 30d, all)
  const activeMeasurements = useMemo(() => {
    if (periodFilter === 'all') return measurements;
    const days = periodFilter === '7d' ? 7 : periodFilter === '14d' ? 14 : 30;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const filtered = measurements.filter((m) => m.timestamp >= cutoff);
    // If no recent measurements exist for chosen filter, fallback gracefully to all
    return filtered.length > 0 ? filtered : measurements;
  }, [measurements, periodFilter]);

  // Sort chronologically (newest first)
  const sortedMeasurements = useMemo(() => {
    return [...activeMeasurements].sort((a, b) => b.timestamp - a.timestamp);
  }, [activeMeasurements]);

  // Daily grouping: 1 dzień = 3 pomiary (Rano, Południe, Wieczór)
  const dailyGroups = useMemo<DailyGroup[]>(() => {
    const groupsMap = new Map<string, Measurement[]>();

    sortedMeasurements.forEach((m) => {
      const d = m.date || 'Inna data';
      if (!groupsMap.has(d)) {
        groupsMap.set(d, []);
      }
      groupsMap.get(d)!.push(m);
    });

    const result: DailyGroup[] = [];

    groupsMap.forEach((dayMeasurements, dateKey) => {
      let morning: Measurement | undefined;
      let noon: Measurement | undefined;
      let evening: Measurement | undefined;
      const extra: Measurement[] = [];
      const notes: string[] = [];

      // Sort day's measurements by time ascending
      const daySorted = [...dayMeasurements].sort((a, b) => (a.time || '').localeCompare(b.time || ''));

      daySorted.forEach((m) => {
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
          if (tVal && tVal < '11:30' && !morning) {
            morning = m;
          } else if (tVal && tVal >= '11:30' && tVal < '16:30' && !noon) {
            noon = m;
          } else if (tVal && tVal >= '16:30' && !evening) {
            evening = m;
          } else {
            extra.push(m);
          }
        }
      });

      const sumSys = dayMeasurements.reduce((acc, m) => acc + m.systolic, 0);
      const sumDia = dayMeasurements.reduce((acc, m) => acc + m.diastolic, 0);
      const pulseCount = dayMeasurements.filter((m) => m.pulse).length || 1;
      const sumPulse = dayMeasurements.reduce((acc, m) => acc + (m.pulse || 0), 0);

      const avgSys = Math.round(sumSys / dayMeasurements.length);
      const avgDia = Math.round(sumDia / dayMeasurements.length);
      const avgPulse = Math.round(sumPulse / pulseCount);
      const isHigh = avgSys >= 135 || avgDia >= 85;

      let dayLabel = dateKey;
      try {
        const dObj = new Date(dateKey + 'T12:00:00');
        const dayNames = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb'];
        const dayName = dayNames[dObj.getDay()];
        const parts = dateKey.split('-');
        if (parts.length === 3) {
          dayLabel = `${parts[2]}.${parts[1]} (${dayName})`;
        }
      } catch {
        dayLabel = dateKey;
      }

      const cls = classifyBloodPressure(avgSys, avgDia, lang);

      result.push({
        date: dateKey,
        dayLabel,
        morning,
        noon,
        evening,
        extra,
        avgSys,
        avgDia,
        avgPulse,
        totalCount: dayMeasurements.length,
        notes: Array.from(new Set(notes)),
        isHigh,
        classification: cls,
      });
    });

    return result;
  }, [sortedMeasurements, lang]);

  // Statistics calculation formatted for cardiology visits (fits neatly on 1 sheet)
  const stats = useMemo(() => {
    if (activeMeasurements.length === 0) {
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
        pulsePressure: 0,
        map: 0,
        morningSurge: 0,
        morning: { count: 0, avgSys: 0, avgDia: 0, avgPulse: 0 },
        noon: { count: 0, avgSys: 0, avgDia: 0, avgPulse: 0 },
        evening: { count: 0, avgSys: 0, avgDia: 0, avgPulse: 0 },
        extra: { count: 0, avgSys: 0, avgDia: 0, avgPulse: 0 },
      };
    }

    const total = activeMeasurements.length;
    let sumSys = 0;
    let sumDia = 0;
    let sumPulse = 0;
    let minSys = 999;
    let maxSys = 0;
    let minDia = 999;
    let maxDia = 0;
    let maxMeasurement: Measurement | null = null;
    let normCount = 0;

    const morningList: Measurement[] = [];
    const noonList: Measurement[] = [];
    const eveningList: Measurement[] = [];
    const extraList: Measurement[] = [];

    activeMeasurements.forEach((m) => {
      sumSys += m.systolic;
      sumDia += m.diastolic;
      sumPulse += m.pulse || 0;

      if (m.systolic < minSys) minSys = m.systolic;
      if (m.systolic > maxSys) {
        maxSys = m.systolic;
        maxMeasurement = m;
      }
      if (m.diastolic < minDia) minDia = m.diastolic;
      if (m.diastolic > maxDia) maxDia = m.diastolic;

      if (m.systolic < 135 && m.diastolic < 85) normCount += 1;

      if (m.period === 'morning') morningList.push(m);
      else if (m.period === 'noon') noonList.push(m);
      else if (m.period === 'evening') eveningList.push(m);
      else extraList.push(m);
    });

    const calcGroup = (arr: Measurement[]) => {
      if (arr.length === 0) return { count: 0, avgSys: 0, avgDia: 0, avgPulse: 0 };
      const sSys = arr.reduce((acc, x) => acc + x.systolic, 0);
      const sDia = arr.reduce((acc, x) => acc + x.diastolic, 0);
      const sP = arr.reduce((acc, x) => acc + (x.pulse || 0), 0);
      return {
        count: arr.length,
        avgSys: Math.round(sSys / arr.length),
        avgDia: Math.round(sDia / arr.length),
        avgPulse: Math.round(sP / arr.length),
      };
    };

    const avgSys = Math.round(sumSys / total);
    const avgDia = Math.round(sumDia / total);
    const avgPulse = Math.round(sumPulse / total);
    const pulsePressure = avgSys - avgDia;
    const map = Math.round((2 * avgDia + avgSys) / 3);

    const morningGroup = calcGroup(morningList);
    const eveningGroup = calcGroup(eveningList);
    const morningSurge = (morningGroup.count > 0 && eveningGroup.count > 0)
      ? morningGroup.avgSys - eveningGroup.avgSys
      : 0;

    return {
      total,
      avgSys,
      avgDia,
      avgPulse,
      minSys,
      maxSys,
      minDia,
      maxDia,
      maxMeasurement,
      normPercent: Math.round((normCount / total) * 100),
      pulsePressure,
      map,
      morningSurge,
      morning: morningGroup,
      noon: calcGroup(noonList),
      evening: eveningGroup,
      extra: calcGroup(extraList),
    };
  }, [activeMeasurements]);

  // Quick export to CSV
  const handleExportCSV = () => {
    const headers = ['Data', 'Godzina', 'Pora dnia', 'SYS (mmHg)', 'DIA (mmHg)', 'Puls (bpm)', 'Ramię', 'Klasyfikacja PTNT', 'Leki / Uwagi'];
    const rows = sortedMeasurements.map((m) => {
      const cls = classifyBloodPressure(m.systolic, m.diastolic, lang);
      const periodName = m.period === 'morning' ? 'Rano' : m.period === 'evening' ? 'Wieczór' : m.period === 'noon' ? 'Południe' : 'Dodatkowy';
      return [
        `"${m.date}"`,
        `"${m.time || ''}"`,
        `"${periodName}"`,
        m.systolic,
        m.diastolic,
        m.pulse || '',
        `"${m.arm === 'left' ? 'Lewe' : 'Prawe'}"`,
        `"${cls.label}"`,
        `"${(m.notes || '').replace(/"/g, '""')}"`,
      ].join(';');
    });
    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Pulsivio_Raport_${(patientName || 'Pacjent').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Generate plain text summary for doctor messaging
  const handleCopySummary = async () => {
    const text = `🩺 PULSIVIO - KARTA POMIARÓW CIŚNIENIA DLA LEKARZA\n` +
      `Pacjent: ${patientName || 'Nie podano (do uzupełnienia)'} (ur. ${birthYear || '-'})\n` +
      `Leki: ${medications || 'Nie określono'}\n` +
      `Średnia całkowita: ${stats.avgSys}/${stats.avgDia} mmHg | Tętno: ${stats.avgPulse} bpm\n` +
      `Średnia RANO: ${stats.morning.count > 0 ? `${stats.morning.avgSys}/${stats.morning.avgDia} mmHg (${stats.morning.count} pomiarów)` : 'brak'}\n` +
      `Średnia WIECZÓR: ${stats.evening.count > 0 ? `${stats.evening.avgSys}/${stats.evening.avgDia} mmHg (${stats.evening.count} pomiarów)` : 'brak'}\n` +
      `Ciśnienie tętna (PP): ${stats.pulsePressure} mmHg | MAP: ${stats.map} mmHg\n` +
      `Pomiary w normie (<135/85 mmHg): ${stats.normPercent}% (z ${stats.total} pomiarów)\n` +
      `Uwagi pacjenta: ${notesForDoc || 'Brak'}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  // Direct PDF Download formatted with all doctor's requirements
  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const periodLabel = periodFilter === '7d'
      ? 'Okres: Ostatnie 7 dni (Rekomendacja PTNT)'
      : periodFilter === '14d'
      ? 'Okres: Ostatnie 14 dni'
      : periodFilter === '30d'
      ? 'Okres: Ostatnie 30 dni'
      : 'Okres: Pelna historia pomiarow';

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(30, 41, 59);
    doc.text('KARTA KONTROLI CISNIENIA TETNICZEGO (PULSIVIO)', 14, 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Dziennik samokontroli (HBPM)  |  ${periodLabel}  |  Generacja: ${new Date().toLocaleDateString('pl-PL')}`, 14, 21);

    // Patient & Medication Information Box
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 24, 182, 17, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text('Pacjent:', 17, 30);
    doc.setFont('helvetica', 'normal');
    doc.text(patientName ? patientName : '................................................................', 31, 30);

    doc.setFont('helvetica', 'bold');
    doc.text('Rok urodzenia:', 125, 30);
    doc.setFont('helvetica', 'normal');
    doc.text(birthYear ? birthYear : '........................', 150, 30);

    doc.setFont('helvetica', 'bold');
    doc.text('Przyjmowane leki:', 17, 37);
    doc.setFont('helvetica', 'normal');
    doc.text(
      medications 
        ? medications.slice(0, 85) 
        : '................................................................................................................................................', 
      46, 
      37
    );

    // Compact Clinical Statistics Grid for Cardiologist
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, 43, 182, 19, 2, 2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(`SREDNIA OGOLNA: ${stats.avgSys} / ${stats.avgDia} mmHg (Puls: ${stats.avgPulse} bpm)`, 17, 48.5);
    doc.text(`SREDNIA RANO: ${stats.morning.count > 0 ? `${stats.morning.avgSys}/${stats.morning.avgDia} mmHg` : '-'}`, 105, 48.5);
    doc.text(`SREDNIA WIECZOR: ${stats.evening.count > 0 ? `${stats.evening.avgSys}/${stats.evening.avgDia} mmHg` : '-'}`, 147, 48.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Cisnienie tetna (PP): ${stats.pulsePressure} mmHg   |   MAP: ${stats.map} mmHg   |   Norma HBPM (<135/85): ${stats.normPercent}% (${stats.total} pomiarow)`, 17, 54);
    
    const peakText = stats.maxMeasurement 
      ? `MAX SKOK: ${stats.maxMeasurement.systolic}/${stats.maxMeasurement.diastolic} mmHg (${stats.maxMeasurement.date || ''} ${stats.maxMeasurement.time || ''})`
      : `Zakres SYS: ${stats.minSys}-${stats.maxSys} mmHg`;
    const surgeText = stats.morningSurge >= 10 
      ? `Poranny skok: +${stats.morningSurge} mmHg rano` 
      : 'Profil dobowy zrownowazony';
    doc.text(`${peakText}   |   ${surgeText}`, 17, 58.5);

    // Table Header
    let y = 65;
    doc.setFillColor(30, 41, 59);
    doc.rect(14, y, 182, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('Lp.', 16, y + 4.8);
    doc.text('Data i godzina', 24, y + 4.8);
    doc.text('Pora dnia', 54, y + 4.8);
    doc.text('SYS/DIA', 80, y + 4.8);
    doc.text('Puls', 104, y + 4.8);
    doc.text('Ramie', 118, y + 4.8);
    doc.text('Klasyfikacja PTNT', 133, y + 4.8);
    doc.text('Uwagi / Leki', 165, y + 4.8);

    // Table Rows
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);

    sortedMeasurements.forEach((m, index) => {
      if (y > 255) {
        doc.addPage();
        y = 16;
        doc.setFillColor(30, 41, 59);
        doc.rect(14, y, 182, 6.5, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.text('Lp.', 16, y + 4.5);
        doc.text('Data i godzina', 24, y + 4.5);
        doc.text('Pora dnia', 54, y + 4.5);
        doc.text('SYS/DIA', 80, y + 4.5);
        doc.text('Puls', 104, y + 4.5);
        doc.text('Ramie', 118, y + 4.5);
        doc.text('Klasyfikacja PTNT', 133, y + 4.5);
        doc.text('Uwagi / Leki', 165, y + 4.5);
        y += 6.5;
      }

      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y, 182, 5.8, 'F');
      }

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'normal');
      doc.text(String(index + 1), 16, y + 4.2);
      doc.text(m.time ? `${m.date} ${m.time}` : m.date, 24, y + 4.2);

      const periodStr = m.period === 'morning' ? 'RANO' : m.period === 'evening' ? 'WIECZOR' : m.period === 'noon' ? 'POLUDNIE' : 'DODATK.';
      doc.text(periodStr, 54, y + 4.2);

      doc.setFont('helvetica', 'bold');
      if (m.systolic >= 135 || m.diastolic >= 85) {
        doc.setTextColor(190, 18, 60);
      } else {
        doc.setTextColor(21, 128, 61);
      }
      doc.text(`${m.systolic}/${m.diastolic}`, 80, y + 4.2);

      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'normal');
      doc.text(m.pulse ? `${m.pulse}` : '-', 104, y + 4.2);
      doc.text(m.arm === 'left' ? 'L' : 'P', 118, y + 4.2);

      const cls = classifyBloodPressure(m.systolic, m.diastolic, 'pl');
      const safeCat = (cls.label || '')
        .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e').replace(/ł/g, 'l')
        .replace(/ń/g, 'n').replace(/ó/g, 'o').replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z');
      doc.text(safeCat.slice(0, 18), 133, y + 4.2);

      const noteText = (m.notes || (m.tags && m.tags.length > 0 ? m.tags.join(', ') : ''))
        .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e').replace(/ł/g, 'l')
        .replace(/ń/g, 'n').replace(/ó/g, 'o').replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z');
      doc.text(noteText.slice(0, 16) || '-', 165, y + 4.2);

      y += 5.8;
    });

    // Doctor Recommendations & Blank Fill-in Section
    if (y > 235) {
      doc.addPage();
      y = 16;
    } else {
      y += 4;
    }

    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(14, y, 182, 28, 2, 2, 'D');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text('ZALECENIA LEKARZA I MODYFIKACJA LECZENIA (wypelnia lekarz podczas wizyty):', 17, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('1. ...................................................................................................................................................................................', 17, y + 12);
    doc.text('2. ...................................................................................................................................................................................', 17, y + 18);
    doc.text('Nastepna wizyta kontrolna: ............................................         Podpis i pieczatka lekarza: ............................................', 17, y + 24);

    const safeName = (patientName || 'Pacjent').replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`Pulsivio_Karta_Cisnienia_${safeName}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const handleSendEmail = () => {
    const periodName = periodFilter === '7d' 
      ? 'Ostatnie 7 dni (Rekomendacja PTNT)' 
      : periodFilter === '14d' 
      ? 'Ostatnie 14 dni' 
      : periodFilter === '30d' 
      ? 'Ostatnie 30 dni' 
      : 'Pełna historia pomiarów';

    const peakStr = stats.maxMeasurement
      ? `Najwyższy odnotowany skok (Peak): ${stats.maxMeasurement.systolic}/${stats.maxMeasurement.diastolic} mmHg (${stats.maxMeasurement.date || ''} ${stats.maxMeasurement.time || ''})\n`
      : '';

    const subject = encodeURIComponent(`Pomiary ciśnienia tętniczego - ${patientName || 'Pacjent'}`);
    const body = encodeURIComponent(
      `Dzień dobry,\n\nPrzesyłam zestawienie pomiarów ciśnienia tętniczego krwi z aplikacji Pulsivio:\n\n` +
      `Pacjent: ${patientName || 'Nie uzupełniono'} (rok ur. ${birthYear || '-'})\n` +
      `Okres raportu: ${periodName}\n` +
      `Przyjmowane leki: ${medications || 'Nie określono'}\n` +
      `Łączna liczba pomiarów: ${stats.total}\n` +
      `Średnia ogólna: ${stats.avgSys}/${stats.avgDia} mmHg (tętno: ${stats.avgPulse} bpm)\n` +
      `Średnia RANO: ${stats.morning.count > 0 ? `${stats.morning.avgSys}/${stats.morning.avgDia} mmHg` : 'brak'}\n` +
      `Średnia WIECZÓR: ${stats.evening.count > 0 ? `${stats.evening.avgSys}/${stats.evening.avgDia} mmHg` : 'brak'}\n` +
      `Profil dobowy (skok poranny): ${stats.morningSurge >= 10 ? `+${stats.morningSurge} mmHg rano` : 'zrównoważony'}\n` +
      peakStr +
      `Ciśnienie tętna (PP): ${stats.pulsePressure} mmHg | MAP: ${stats.map} mmHg\n` +
      `Odsetek pomiarów w normie domowej (<135/85): ${stats.normPercent}%\n\n` +
      `Dodatkowe uwagi: ${notesForDoc || 'Brak'}\n\n` +
      `Pozdrawiam serdecznie`
    );
    const emailTo = profile.doctorEmail || '';
    window.location.href = `mailto:${emailTo}?subject=${subject}&body=${body}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-4xl px-3 py-4 sm:px-6 sm:py-6 space-y-6">
      
      {/* Top Controls Box (Hidden during print) */}
      <div className="no-print rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                <FileText className="h-4.5 w-4.5" />
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Karta Kontroli Ciśnienia dla Lekarza
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Podział na pory dnia (rano / wieczór), kompaktowe statystyki kliniczne i gotowy format do wydruku A4 lub pliku PDF.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleDownloadPDF}
              id="print-report-pdf-btn"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2.5 text-xs sm:text-sm font-bold shadow-sm active:scale-98 transition-all cursor-pointer"
            >
              <FileDown className="h-4 w-4" />
              <span>Pobierz PDF dla lekarza</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              id="print-report-csv-btn"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 dark:bg-slate-800 dark:border-slate-700 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-2xs hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-98 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>Pobierz CSV</span>
            </button>

            <button
              type="button"
              onClick={handleSendEmail}
              id="print-report-email-btn"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 dark:bg-slate-800 dark:border-slate-700 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-2xs hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-98 transition-all cursor-pointer"
            >
              <Mail className="h-4 w-4 text-blue-600" />
              <span>Wyślij e-mail</span>
            </button>

            <button
              type="button"
              onClick={handleCopySummary}
              id="print-report-copy-btn"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 dark:bg-slate-800 dark:border-slate-700 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-2xs hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-98 transition-all cursor-pointer"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4 text-indigo-600" />}
              <span>{copied ? 'Skopiowano!' : 'Kopiuj'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              id="print-report-main-btn"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white px-3.5 py-2.5 text-xs sm:text-sm font-bold shadow-sm active:scale-98 transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>{t.printButton}</span>
            </button>

            {onToggleDarkMode && (
              <button
                type="button"
                onClick={onToggleDarkMode}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-slate-100 dark:bg-slate-800 dark:border-slate-700 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-2xs hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-98 transition-all cursor-pointer"
                title="Przełącz motyw"
              >
                {isDarkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-indigo-500" />}
                <span className="hidden sm:inline">{isDarkMode ? 'Jasny motyw' : 'Ciemny motyw'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Clear / Reset Controls and Hand-fill Explanation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 gap-2 bg-blue-50/50 dark:bg-blue-950/20 p-2.5 rounded-xl border border-blue-100 dark:border-blue-900/40">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <Info className="h-4 w-4 text-blue-600 shrink-0" />
            <span>
              <strong>Jak uzupełnić dane:</strong> Możesz wpisać dane poniżej na ekranie i kliknąć „Zapisz dane w raporcie”, albo zostawić pola puste — na wydruku pojawią się równe linie do wpisania ręcznego długopisem.
            </span>
          </div>
          <button
            type="button"
            onClick={handleClearAllFields}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 p-1 rounded-lg cursor-pointer shrink-0"
            title="Wyczyść wszystkie dane pacjenta i leków"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Wyczyść formularz</span>
          </button>
        </div>

        {/* Form Fields: Patient Name, Birth Year, General Medications */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Imię i nazwisko pacjenta:
            </label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              onBlur={handleProfileBlur}
              placeholder="Imię i nazwisko pacjenta"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Rok urodzenia:
            </label>
            <input
              type="text"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              onBlur={handleProfileBlur}
              placeholder="Rok urodzenia (np. 1954)"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {/* General Medication Information */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
            <Pill className="h-3.5 w-3.5 text-indigo-600" />
            <span>Informacja o przyjmowanych lekach (nazwa, dawka, pora):</span>
          </label>
          <input
            type="text"
            value={medications}
            onChange={(e) => setMedications(e.target.value)}
            onBlur={handleProfileBlur}
            placeholder="Wpisz przyjmowane leki i dawki (lub zostaw puste)"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          />
        </div>

        {/* Additional Patient Notes for Doctor */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
            Dodatkowe uwagi dla lekarza (np. dolegliwości, zawroty głowy, ból głowy):
          </label>
          <input
            type="text"
            value={notesForDoc}
            onChange={(e) => setNotesForDoc(e.target.value)}
            onBlur={handleProfileBlur}
            placeholder="Wpisz dodatkowe uwagi dla lekarza (lub zostaw puste)"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          />
        </div>

        {/* Action Bar for Saving and Viewing Doctor Mode */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 flex-wrap gap-2">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Wprowadzone dane leków i pacjenta są zapamiętywane w karcie i na wydruku:
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveReportData}
              id="save-report-data-btn"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
            >
              {savedNotice ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
              <span>{savedNotice ? 'Zapisano w raporcie!' : 'Zapisz dane w raporcie'}</span>
            </button>

            {onOpenDoctorMode && (
              <button
                type="button"
                onClick={onOpenDoctorMode}
                id="open-doctor-view-btn"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Stethoscope className="h-3.5 w-3.5" />
                <span>Otwórz widok lekarza</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Date Filter & View Switcher Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between no-print px-1 gap-2.5">
        {/* Period Filter for Doctor */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-2 flex items-center gap-1 shrink-0">
            <Calendar className="h-3.5 w-3.5 text-rose-500" />
            Okres:
          </span>
          <button
            type="button"
            onClick={() => setPeriodFilter('7d')}
            id="report-filter-7d-btn"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              periodFilter === '7d'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60'
            }`}
          >
            ⭐ Ostatnie 7 dni (PTNT)
          </button>
          <button
            type="button"
            onClick={() => setPeriodFilter('14d')}
            id="report-filter-14d-btn"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              periodFilter === '14d'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60'
            }`}
          >
            14 dni
          </button>
          <button
            type="button"
            onClick={() => setPeriodFilter('30d')}
            id="report-filter-30d-btn"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              periodFilter === '30d'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700/60'
            }`}
          >
            30 dni
          </button>
          <button
            type="button"
            onClick={() => setPeriodFilter('all')}
            id="report-filter-all-btn"
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              periodFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-700 dark:text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            Wszystkie ({measurements.length})
          </button>
        </div>

        {/* View Mode Switcher and Doctor Large Font Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setViewMode('daily')}
              id="view-mode-daily-btn"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'daily'
                  ? 'bg-slate-200 dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarDays className="h-4 w-4 text-blue-600" />
              <span>Widok Dzienny</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('detailed')}
              id="view-mode-detailed-btn"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'detailed'
                  ? 'bg-slate-200 dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="h-4 w-4 text-indigo-600" />
              <span>Szczegółowy</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsDoctorLargeFont(!isDoctorLargeFont)}
            className={`px-3 py-1.5 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
              isDoctorLargeFont
                ? 'bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-950/60 dark:border-amber-700 dark:text-amber-200'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
            title="Powiększa cyfry w tabeli dla wygodnego czytania z biurka"
          >
            {isDoctorLargeFont ? '🔍 Duże cyfry (Włączone)' : '🔍 Duże cyfry dla lekarza'}
          </button>
        </div>
      </div>

      {/* The Printable A4 Sheet container */}
      <div className="printable-a4-sheet bg-white text-slate-900 p-5 sm:p-7 rounded-3xl border border-slate-300 shadow-sm dark:bg-slate-950 dark:text-slate-100 dark:border-slate-800">
        
        {/* Printable Header */}
        <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-3 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Karta Kontroli Ciśnienia Tętniczego
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Dziennik samokontroli pacjenta (HBPM) • Wygenerowano: {new Date().toLocaleDateString('pl-PL')}
              </p>
            </div>

            {/* App Branding & Avatar */}
            <div className="flex items-center gap-2.5 text-right">
              <div className="h-10 w-10 rounded-xl overflow-hidden border border-slate-300 bg-slate-950 shrink-0">
                <img
                  src={currentAvatar || '/avatars/pulsivio_play_logo.jpg'}
                  alt="Logo Pulsivio"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-semibold text-slate-500 block leading-none">Dziennik</span>
                <span translate="no" className="notranslate text-base font-black text-rose-600">Pulsivio</span>
              </div>
            </div>
          </div>

          {/* Patient Details & General Medication Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 font-semibold block text-[11px]">Pacjent:</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {patientName ? patientName : '....................................................................'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block text-[11px]">Rok urodzenia:</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {birthYear ? birthYear : '........................................'}
              </span>
            </div>
          </div>

          {/* Medication Info Row */}
          <div className="mt-2 text-xs bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-800 dark:text-slate-200">Przyjmowane leki: </span>
            <span className="text-slate-700 dark:text-slate-300">
              {medications ? medications : '........................................................................................................................................................................'}
            </span>
          </div>

          {notesForDoc && (
            <div className="mt-1.5 text-xs bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-800 dark:text-slate-200">Uwagi pacjenta: </span>
              <span className="text-slate-700 dark:text-slate-300">{notesForDoc}</span>
            </div>
          )}
        </div>

        {/* Compact Clinical Statistics for the Doctor (Fits on 1 page!) */}
        <div className="mb-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-rose-600" />
              <span>Statystyka kliniczna (Łącznie wpisów: {stats.total})</span>
            </h2>
            <span className="text-[10px] text-slate-500 font-medium">
              Norma domowa wg PTNT/ESH: &lt;135/85 mmHg
            </span>
          </div>

          {/* Dense, High-Contrast Medical Summary Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            {/* 1. Overall Mean */}
            <div className="p-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50/90 dark:bg-slate-900/50">
              <span className="text-[10px] text-slate-500 font-semibold block">Średnia całkowita</span>
              <span className="text-base font-black text-slate-900 dark:text-white">
                {stats.avgSys} / {stats.avgDia} <span className="text-[10px] font-normal text-slate-500">mmHg</span>
              </span>
              <span className="text-[10px] text-rose-600 font-bold block mt-0.5">
                Puls: {stats.avgPulse} bpm
              </span>
            </div>

            {/* 2. Morning Average (RANO) - Key Clinical Metric */}
            <div className="p-2 border border-amber-300/80 dark:border-amber-800/80 rounded-xl bg-amber-50/50 dark:bg-amber-950/20">
              <span className="text-[10px] text-amber-800 dark:text-amber-300 font-semibold block flex items-center justify-center gap-1">
                <Sun className="h-3 w-3 text-amber-600" />
                Średnia rano
              </span>
              <span className="text-base font-black text-slate-900 dark:text-white">
                {stats.morning.count > 0 ? (
                  <>
                    {stats.morning.avgSys} / {stats.morning.avgDia} <span className="text-[10px] font-normal text-slate-500">mmHg</span>
                  </>
                ) : (
                  <span className="text-xs text-slate-400">brak</span>
                )}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {stats.morning.count} pomiarów
              </span>
            </div>

            {/* 3. Evening Average (WIECZÓR) */}
            <div className="p-2 border border-indigo-300/80 dark:border-indigo-800/80 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20">
              <span className="text-[10px] text-indigo-800 dark:text-indigo-300 font-semibold block flex items-center justify-center gap-1">
                <Moon className="h-3 w-3 text-indigo-600" />
                Średnia wieczór
              </span>
              <span className="text-base font-black text-slate-900 dark:text-white">
                {stats.evening.count > 0 ? (
                  <>
                    {stats.evening.avgSys} / {stats.evening.avgDia} <span className="text-[10px] font-normal text-slate-500">mmHg</span>
                  </>
                ) : (
                  <span className="text-xs text-slate-400">brak</span>
                )}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                {stats.evening.count} pomiarów
              </span>
            </div>

            {/* 4. Hemodynamics: Pulse Pressure (PP) & MAP */}
            <div className="p-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50/90 dark:bg-slate-900/50">
              <span className="text-[10px] text-slate-500 font-semibold block">PP & MAP</span>
              <span className="text-xs font-black text-slate-900 dark:text-white block mt-0.5">
                PP: <strong className="text-indigo-600">{stats.pulsePressure} mmHg</strong> (norma &lt;50)
              </span>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 block mt-0.5">
                MAP: {stats.map} mmHg | W normie: <strong className="text-emerald-600">{stats.normPercent}%</strong>
              </span>
            </div>
          </div>

          {/* Cardiology Quick Scan Ribbons: Morning Surge & Peak Measurement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
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
                  Wyższe wieczorem (+{Math.abs(stats.morningSurge)} mmHg)
                </span>
              ) : (
                <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-400">
                  Zrównoważony profil (różnica {Math.abs(stats.morningSurge)} mmHg)
                </span>
              )}
            </div>

            {/* Peak Max Reading */}
            <div className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1">
                ⚡ Najwyższy skok:
              </span>
              {stats.maxMeasurement ? (
                <span className="text-[11px] font-black text-rose-700 dark:text-rose-400">
                  {stats.maxMeasurement.systolic}/{stats.maxMeasurement.diastolic} mmHg{' '}
                  <span className="font-normal text-slate-500">
                    ({stats.maxMeasurement.date}{stats.maxMeasurement.time ? ` ${stats.maxMeasurement.time}` : ''})
                  </span>
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">Brak pomiarów</span>
              )}
            </div>
          </div>
        </div>

        {/* Table for Doctor: Switch between Daily (1 dzień = 3 pomiary) and Detailed */}
        <div className="overflow-x-auto">
          {viewMode === 'daily' ? (
            /* Daily View: 1 dzień = 3 pomiary (Rano, Południe, Wieczór) + Średnia doby */
            <table className="w-full text-left text-xs border border-slate-300 dark:border-slate-700 print:border-slate-400 print:text-black">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 print:bg-slate-200 print:text-black">
                  <th className="p-2 border-r border-slate-300 dark:border-slate-700 print:border-slate-400 w-28">
                    Data (Dzień)
                  </th>
                  <th className="p-2 border-r border-slate-300 dark:border-slate-700 print:border-slate-400 text-center">
                    <span className="flex items-center justify-center gap-1 text-amber-700 dark:text-amber-400 print:text-amber-800">
                      <Sun className="h-3.5 w-3.5" />
                      <span>Rano (czczo)</span>
                    </span>
                  </th>
                  <th className="p-2 border-r border-slate-300 dark:border-slate-700 print:border-slate-400 text-center">
                    <span className="flex items-center justify-center gap-1 text-sky-700 dark:text-sky-400 print:text-sky-800">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Południe</span>
                    </span>
                  </th>
                  <th className="p-2 border-r border-slate-300 dark:border-slate-700 print:border-slate-400 text-center">
                    <span className="flex items-center justify-center gap-1 text-indigo-700 dark:text-indigo-400 print:text-indigo-800">
                      <Moon className="h-3.5 w-3.5" />
                      <span>Wieczór</span>
                    </span>
                  </th>
                  <th className="p-2 border-r border-slate-300 dark:border-slate-700 print:border-slate-400 text-center bg-slate-200/70 dark:bg-slate-700/60 print:bg-slate-300">
                    Średnia doby
                  </th>
                  <th className="p-2 border-r border-slate-300 dark:border-slate-700 print:border-slate-400">
                    Klasyfikacja PTNT
                  </th>
                  <th className="p-2">
                    Leki / Samopoczucie
                  </th>
                </tr>
              </thead>
              <tbody>
                {dailyGroups.map((group) => {
                  const formatCell = (m?: Measurement) => {
                    if (!m) return <span className="text-slate-400 dark:text-slate-600 font-mono text-[11px]">—</span>;
                    const isHigh = m.systolic >= 135 || m.diastolic >= 85;
                    const fontClass = isDoctorLargeFont
                      ? 'text-base sm:text-lg font-black tracking-tight'
                      : 'text-xs sm:text-sm font-black';
                    return (
                      <div className="py-0.5">
                        <span className={`${fontClass} ${isHigh ? 'text-rose-600 dark:text-rose-400 print:text-red-700' : 'text-slate-900 dark:text-white print:text-black'}`}>
                          {m.systolic}/{m.diastolic}
                        </span>
                        <div className="text-[10px] text-slate-500 print:text-slate-700 flex items-center justify-center gap-1">
                          {m.pulse && <span className="font-semibold text-rose-600 print:text-rose-700">♥{m.pulse}</span>}
                          {m.time && <span>({m.time})</span>}
                          <span className="text-[9px] font-bold">[{m.arm === 'left' ? 'L' : 'P'}]</span>
                        </div>
                      </div>
                    );
                  };

                  return (
                    <tr key={`day-${group.date}`} className="border-b border-slate-200 dark:border-slate-800 print:border-slate-300 hover:bg-slate-50/80">
                      <td className="p-2 border-r border-slate-200 dark:border-slate-800 print:border-slate-300 font-bold whitespace-nowrap">
                        <div className="text-slate-900 dark:text-white print:text-black">{group.dayLabel}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{group.date}</div>
                      </td>
                      <td className="p-1.5 border-r border-slate-200 dark:border-slate-800 print:border-slate-300 text-center">
                        {formatCell(group.morning)}
                      </td>
                      <td className="p-1.5 border-r border-slate-200 dark:border-slate-800 print:border-slate-300 text-center">
                        {formatCell(group.noon)}
                      </td>
                      <td className="p-1.5 border-r border-slate-200 dark:border-slate-800 print:border-slate-300 text-center">
                        {formatCell(group.evening)}
                      </td>
                      <td className="p-1.5 border-r border-slate-200 dark:border-slate-800 print:border-slate-300 text-center bg-slate-50 dark:bg-slate-900/50 print:bg-slate-100">
                        <span className={`font-black ${isDoctorLargeFont ? 'text-base sm:text-lg' : 'text-sm'} ${group.isHigh ? 'text-rose-600 dark:text-rose-400 print:text-red-700' : 'text-slate-900 dark:text-white print:text-black'}`}>
                          {group.avgSys}/{group.avgDia}
                        </span>
                        <div className="text-[10px] text-slate-500 print:text-slate-700">
                          Puls: <strong className="text-rose-600 print:text-rose-700 font-semibold">{group.avgPulse}</strong> bpm ({group.totalCount} pom.)
                        </div>
                      </td>
                      <td className="p-2 border-r border-slate-200 dark:border-slate-800 print:border-slate-300 text-[11px] font-semibold">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${group.isHigh ? 'bg-rose-100 text-rose-800 print:bg-transparent print:text-black print:underline' : 'bg-emerald-100 text-emerald-800 print:bg-transparent print:text-black'}`}>
                          {group.classification.label}
                        </span>
                      </td>
                      <td className="p-2 text-slate-700 dark:text-slate-300 print:text-black text-[11px]">
                        {group.notes.length > 0 ? group.notes.join(' • ') : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            /* Detailed View: Chronological list */
            <table className="w-full text-left text-xs border border-slate-300 dark:border-slate-700 print:border-slate-400 print:text-black">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 print:bg-slate-200 print:text-black">
                  <th className="p-1.5 border-r border-slate-300 dark:border-slate-700 print:border-slate-400 w-8 text-center">Lp.</th>
                  <th className="p-1.5 border-r border-slate-300 dark:border-slate-700 print:border-slate-400">Data i godzina</th>
                  <th className="p-1.5 border-r border-slate-300 dark:border-slate-700 print:border-slate-400">Pora dnia</th>
                  <th className="p-1.5 border-r border-slate-300 dark:border-slate-700 print:border-slate-400 text-center">SYS</th>
                  <th className="p-1.5 border-r border-slate-300 dark:border-slate-700 print:border-slate-400 text-center">DIA</th>
                  <th className="p-1.5 border-r border-slate-300 dark:border-slate-700 print:border-slate-400 text-center">Puls</th>
                  <th className="p-1.5 border-r border-slate-300 dark:border-slate-700 print:border-slate-400 text-center">Ramię</th>
                  <th className="p-1.5 border-r border-slate-300 dark:border-slate-700 print:border-slate-400">Kategoria PTNT</th>
                  <th className="p-1.5">Uwagi / Leki</th>
                </tr>
              </thead>
              <tbody>
                {sortedMeasurements.map((m, index) => {
                  const c = classifyBloodPressure(m.systolic, m.diastolic, lang);
                  const isHigh = m.systolic >= 135 || m.diastolic >= 85;
                  const numFont = isDoctorLargeFont ? 'text-base sm:text-lg font-black' : 'text-sm font-bold';

                  let periodBadge = { text: 'Rano', icon: '☀️', bg: 'bg-amber-100 text-amber-800' };
                  if (m.period === 'noon') {
                    periodBadge = { text: 'Południe', icon: '🌤️', bg: 'bg-sky-100 text-sky-800' };
                  } else if (m.period === 'evening') {
                    periodBadge = { text: 'Wieczór', icon: '🌙', bg: 'bg-indigo-100 text-indigo-800' };
                  } else if (m.period === 'night' || m.period === 'extra') {
                    periodBadge = { text: 'Dodatkowy', icon: '⏱️', bg: 'bg-purple-100 text-purple-800' };
                  }

                  return (
                    <tr key={`print-${m.id}`} className="border-b border-slate-200 dark:border-slate-800 print:border-slate-300 hover:bg-slate-50/80">
                      <td className="p-1.5 border-r border-slate-200 dark:border-slate-800 print:border-slate-300 text-center font-semibold text-slate-500 text-[11px]">
                        {index + 1}
                      </td>
                      <td className="p-1.5 border-r border-slate-200 dark:border-slate-800 print:border-slate-300 font-medium whitespace-nowrap">
                        {m.date} <span className="text-slate-500 font-normal">{m.time || ''}</span>
                      </td>
                      <td className="p-1.5 border-r border-slate-200 dark:border-slate-800 print:border-slate-300 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${periodBadge.bg}`}>
                          <span>{periodBadge.icon}</span>
                          <span>{periodBadge.text}</span>
                        </span>
                      </td>
                      <td className={`p-1.5 border-r border-slate-200 dark:border-slate-800 print:border-slate-300 text-center ${numFont} ${isHigh ? 'text-rose-600 dark:text-rose-400 print:text-red-700 font-black' : 'text-slate-900 dark:text-slate-100 print:text-black'}`}>
                        {m.systolic}
                      </td>
                      <td className={`p-1.5 border-r border-slate-200 dark:border-slate-800 print:border-slate-300 text-center ${numFont} ${isHigh ? 'text-rose-600 dark:text-rose-400 print:text-red-700 font-black' : 'text-slate-900 dark:text-slate-100 print:text-black'}`}>
                        {m.diastolic}
                      </td>
                      <td className={`p-1.5 border-r border-slate-200 dark:border-slate-800 print:border-slate-300 text-center font-semibold ${isDoctorLargeFont ? 'text-sm' : 'text-xs'} text-rose-600 print:text-rose-700`}>
                        {m.pulse || '--'}
                      </td>
                      <td className="p-1.5 border-r border-slate-200 dark:border-slate-800 print:border-slate-300 text-center font-bold text-[10px]">
                        [{m.arm === 'left' ? 'L' : 'P'}]
                      </td>
                      <td className="p-1.5 border-r border-slate-200 dark:border-slate-800 print:border-slate-300 font-medium text-[11px]">
                        {c.label}
                      </td>
                      <td className="p-1.5 text-slate-700 dark:text-slate-300 print:text-black text-[11px]">
                        {m.tags && m.tags.length > 0 && (
                          <span className="font-bold text-indigo-700 mr-1">[{m.tags.join(', ')}]</span>
                        )}
                        {m.notes || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Doctor's Handwritten Fill-in Section */}
        <div className="mt-4 pt-3 border-t-2 border-slate-300 dark:border-slate-700 text-xs">
          <div className="rounded-xl border border-dashed border-slate-400 dark:border-slate-600 p-3 bg-slate-50/50 dark:bg-slate-900/30">
            <span className="block font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
              <Stethoscope className="h-3.5 w-3.5 text-rose-600" />
              Zalecenia lekarza i modyfikacja leczenia (do ręcznego wypełnienia podczas wizyty):
            </span>
            <div className="space-y-2 text-slate-400 font-mono text-[11px]">
              <div className="border-b border-dashed border-slate-400 w-full py-0.5">
                1. .....................................................................................................................................................................................
              </div>
              <div className="border-b border-dashed border-slate-400 w-full py-0.5">
                2. .....................................................................................................................................................................................
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-4 pt-2 text-slate-600 dark:text-slate-400">
              <div>
                <span className="block font-bold mb-1">Następna wizyta kontrolna:</span>
                <span className="text-slate-400">......................................................</span>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="block font-bold mb-1">Pieczątka i podpis lekarza:</span>
                <span className="text-slate-400">......................................................</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
