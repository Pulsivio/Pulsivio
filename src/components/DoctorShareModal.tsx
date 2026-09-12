import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Download, 
  Copy, 
  Printer, 
  Check, 
  Mail, 
  Phone, 
  Stethoscope, 
  Share2, 
  FileSpreadsheet, 
  AlertCircle, 
  FileText,
  Calendar,
  Smartphone,
  Info,
  Activity,
  Sun,
  Moon,
  Pill
} from 'lucide-react';
import { Measurement, Language, UserProfile } from '../types';
import { translations } from '../i18n';
import { classifyBloodPressure } from '../utils/bpClassification';

interface DoctorShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  measurements: Measurement[];
  lang: Language;
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
  onOpenReportView?: () => void;
  onOpenDoctorMode?: () => void;
  syncCode?: string;
  onPushSync?: () => void;
}

export const DoctorShareModal: React.FC<DoctorShareModalProps> = ({
  isOpen,
  onClose,
  measurements,
  lang,
  profile,
  onUpdateProfile,
  onOpenReportView,
  onOpenDoctorMode,
  syncCode,
  onPushSync,
}) => {
  if (!isOpen) return null;

  const t = translations[lang] || translations.pl;
  const [copied, setCopied] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [csvDownloaded, setCsvDownloaded] = useState(false);
  const [emailPeriod, setEmailPeriod] = useState<'7d' | '14d' | '30d' | 'all'>('7d');
  const [editingDoctor, setEditingDoctor] = useState(false);
  const [doctorName, setDoctorName] = useState(profile.doctorName && !profile.doctorName.includes('Wiśniewska') ? profile.doctorName : '');
  const [doctorEmail, setDoctorEmail] = useState(profile.doctorEmail || '');
  const [doctorPhone, setDoctorPhone] = useState(profile.doctorPhone || '');
  const [clinicName, setClinicName] = useState(profile.clinicName || '');
  const [medications, setMedications] = useState(profile.medications || '');
  const [notesForDoctor, setNotesForDoctor] = useState(profile.notesForDoctor && !profile.notesForDoctor.includes('Prestarium') ? profile.notesForDoctor : '');

  // Calculate comprehensive clinical statistics so the doctor doesn't have to calculate anything
  const total = measurements.length;
  const sumSys = measurements.reduce((acc, m) => acc + m.systolic, 0);
  const sumDia = measurements.reduce((acc, m) => acc + m.diastolic, 0);
  const sumPulse = measurements.reduce((acc, m) => acc + (m.pulse || 0), 0);
  const withPulse = measurements.filter((m) => m.pulse).length || 1;
  const avgSys = total ? Math.round(sumSys / total) : 0;
  const avgDia = total ? Math.round(sumDia / total) : 0;
  const avgPulse = total ? Math.round(sumPulse / withPulse) : 0;
  const normCount = measurements.filter((m) => m.systolic < 135 && m.diastolic < 85).length;
  const normPercent = total ? Math.round((normCount / total) * 100) : 0;
  const pulsePressure = avgSys - avgDia;
  const map = Math.round((2 * avgDia + avgSys) / 3);

  // Morning vs Evening breakdown
  const morningList = measurements.filter((m) => m.period === 'morning' || (m.time && m.time < '11:30'));
  const eveningList = measurements.filter((m) => m.period === 'evening' || (m.time && m.time >= '17:00'));
  const mAvgSys = morningList.length ? Math.round(morningList.reduce((acc, m) => acc + m.systolic, 0) / morningList.length) : null;
  const mAvgDia = morningList.length ? Math.round(morningList.reduce((acc, m) => acc + m.diastolic, 0) / morningList.length) : null;
  const eAvgSys = eveningList.length ? Math.round(eveningList.reduce((acc, m) => acc + m.systolic, 0) / eveningList.length) : null;
  const eAvgDia = eveningList.length ? Math.round(eveningList.reduce((acc, m) => acc + m.diastolic, 0) / eveningList.length) : null;
  const morningSurge = (mAvgSys !== null && eAvgSys !== null) ? mAvgSys - eAvgSys : null;

  // Min and Peak (Max)
  const maxSysReading = measurements.length > 0 ? [...measurements].sort((a, b) => b.systolic - a.systolic)[0] : null;
  const minSysReading = measurements.length > 0 ? [...measurements].sort((a, b) => a.systolic - b.systolic)[0] : null;
  const arrhythmiaCount = measurements.filter((m) => m.hasArrhythmia).length;

  const handleSaveDoctorInfo = () => {
    onUpdateProfile({
      ...profile,
      doctorName,
      doctorEmail,
      doctorPhone,
      clinicName,
      medications,
      notesForDoctor,
    });
    setEditingDoctor(false);
  };

  // Filter measurements for email/summary period
  const getFilteredMeasurements = (period: '7d' | '14d' | '30d' | 'all') => {
    const sorted = [...measurements].sort((a, b) => b.timestamp - a.timestamp);
    if (period === 'all') return sorted;
    const days = period === '7d' ? 7 : period === '14d' ? 14 : 30;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const filtered = sorted.filter((m) => m.timestamp >= cutoff);
    return filtered.length > 0 ? filtered : sorted.slice(0, 14);
  };

  // Generate plain text report for email
  const generateTextSummary = (period: '7d' | '14d' | '30d' | 'all' = emailPeriod) => {
    const dateNow = new Date().toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-US');
    const targetList = getFilteredMeasurements(period);
    const periodLabel = period === '7d' ? 'ostatnie 7 dni (rekomendacja PTNT)' : period === '14d' ? 'ostatnie 14 dni' : period === '30d' ? 'ostatnie 30 dni' : 'pełna historia pomiarów';

    const pTotal = targetList.length;
    const pSumSys = targetList.reduce((acc, m) => acc + m.systolic, 0);
    const pSumDia = targetList.reduce((acc, m) => acc + m.diastolic, 0);
    const pSumPulse = targetList.reduce((acc, m) => acc + (m.pulse || 0), 0);
    const pWithPulse = targetList.filter((m) => m.pulse).length || 1;
    const pAvgSys = pTotal ? Math.round(pSumSys / pTotal) : 0;
    const pAvgDia = pTotal ? Math.round(pSumDia / pTotal) : 0;
    const pAvgPulse = pTotal ? Math.round(pSumPulse / pWithPulse) : 0;
    const pNormCount = targetList.filter((m) => m.systolic < 135 && m.diastolic < 85).length;
    const pNormPct = pTotal ? Math.round((pNormCount / pTotal) * 100) : 0;
    const pPulsePressure = pAvgSys - pAvgDia;
    const pMap = Math.round((2 * pAvgDia + pAvgSys) / 3);

    // Morning vs evening averages
    const mornings = targetList.filter((m) => m.period === 'morning' || (m.time && m.time < '11:30'));
    const evenings = targetList.filter((m) => m.period === 'evening' || (m.time && m.time >= '17:00'));
    const mSys = mornings.length ? Math.round(mornings.reduce((acc, m) => acc + m.systolic, 0) / mornings.length) : null;
    const mDia = mornings.length ? Math.round(mornings.reduce((acc, m) => acc + m.diastolic, 0) / mornings.length) : null;
    const mPulse = mornings.length ? Math.round(mornings.reduce((acc, m) => acc + (m.pulse || 0), 0) / mornings.length) : null;
    const eSys = evenings.length ? Math.round(evenings.reduce((acc, m) => acc + m.systolic, 0) / evenings.length) : null;
    const eDia = evenings.length ? Math.round(evenings.reduce((acc, m) => acc + m.diastolic, 0) / evenings.length) : null;
    const ePulse = evenings.length ? Math.round(evenings.reduce((acc, m) => acc + (m.pulse || 0), 0) / evenings.length) : null;

    // Peak and Min measurements
    let peakStr = 'brak';
    let minStr = 'brak';
    if (targetList.length > 0) {
      const maxM = [...targetList].sort((a, b) => b.systolic - a.systolic)[0];
      const minM = [...targetList].sort((a, b) => a.systolic - b.systolic)[0];
      peakStr = `${maxM.systolic}/${maxM.diastolic} mmHg (${maxM.date}${maxM.time ? ' ' + maxM.time : ''})`;
      minStr = `${minM.systolic}/${minM.diastolic} mmHg (${minM.date}${minM.time ? ' ' + minM.time : ''})`;
    }

    const pArrhythmiaCount = targetList.filter((m) => m.hasArrhythmia).length;
    const pName = profile.name && profile.name !== 'Jan Kowalski' ? profile.name : 'Pacjent';
    const activeMeds = medications || profile.medications;
    const activeNotes = notesForDoctor || (profile.notesForDoctor && !profile.notesForDoctor.includes('Prestarium') ? profile.notesForDoctor : '');

    let text = `🩺 RAPORT POMIARÓW CIŚNIENIA KRWI - PULSIVIO\n`;
    text += `===================================================\n`;
    text += `👤 PACJENT: ${pName}${profile.birthYear && profile.birthYear !== '1954' ? ` (rok ur. ${profile.birthYear})` : ''}\n`;
    if (doctorName) text += `👨‍⚕️ Lekarz prowadzący: ${doctorName}\n`;
    if (clinicName) text += `🏥 Poradnia: ${clinicName}\n`;
    if (activeMeds) text += `💊 Przyjmowane leki: ${activeMeds}\n`;
    if (activeNotes) text += `📝 Uwagi pacjenta: ${activeNotes}\n`;
    text += `📅 Data wygenerowania: ${dateNow}\n`;
    text += `⏱ Zakres raportu: ${periodLabel}\n`;
    text += `===================================================\n\n`;

    text += `📊 ZESTAWIENIE KLINICZNE (gotowe wskaźniki dla lekarza):\n`;
    text += `• Średnie ciśnienie tętnicze: ${pAvgSys}/${pAvgDia} mmHg\n`;
    text += `• Średnie tętno spoczynkowe: ${pAvgPulse} bpm\n`;
    text += `• Zgodność z normą domową PTNT (<135/85 mmHg): ${pNormPct}% (${pNormCount}/${pTotal} pomiarów w normie)\n`;
    if (mSys !== null) {
      text += `• Średnia RANO (czczo): ${mSys}/${mDia} mmHg (tętno ${mPulse} bpm, ${mornings.length} pomiarów)\n`;
    }
    if (eSys !== null) {
      text += `• Średnia WIECZÓR: ${eSys}/${eDia} mmHg (tętno ${ePulse} bpm, ${evenings.length} pomiarów)\n`;
    }
    if (mSys !== null && eSys !== null) {
      const surge = mSys - eSys;
      text += `• Poranny skok ciśnienia (Rano - Wieczór): ${surge >= 0 ? '+' : ''}${surge} mmHg ${surge >= 15 ? '⚠️ (istotny poranny wzrost)' : '(w normie)'}\n`;
    }
    text += `• Ciśnienie tętna (PP = SYS - DIA): ${pPulsePressure} mmHg ${pPulsePressure > 60 ? '⚠️ (>60 mmHg - podwyższona sztywność tętnic)' : '(prawidłowe 40-50 mmHg)'}\n`;
    text += `• Średnie ciśnienie tętnicze (MAP): ${pMap} mmHg (norma perfuzji narządowej: 70-105 mmHg)\n`;
    text += `• Wartości skrajne: Najwyższy ${peakStr} | Najniższy ${minStr}\n`;
    text += `• Epizody niemiarowości (arytmia): ${pArrhythmiaCount > 0 ? `${pArrhythmiaCount} wykrytych` : '0 (brak zgłoszeń)'}\n\n`;

    text += `📋 SZCZEGÓŁOWY WYKAZ POMIARÓW:\n`;
    text += `Data       | Godz. | Pora     | SYS/DIA  | Puls | Ramię | Uwagi\n`;
    text += `-----------+-------+----------+----------+------+-------+-------\n`;

    targetList.forEach((m) => {
      const pName = (m.period === 'morning' ? 'Rano' : m.period === 'evening' ? 'Wieczór' : m.period === 'noon' ? 'Południe' : 'Dodatkowy').padEnd(8, ' ');
      const dStr = m.date.padEnd(10, ' ');
      const tStr = (m.time || '--:--').padEnd(5, ' ');
      const bpStr = `${m.systolic}/${m.diastolic} mmHg`.padEnd(9, ' ');
      const hrStr = `${m.pulse || '--'}`.padEnd(4, ' ');
      const armStr = m.arm === 'left' ? 'L' : 'P';
      const notesStr = m.notes ? `| ${m.notes}` : '';
      text += `${dStr} | ${tStr} | ${pName} | ${bpStr} | ${hrStr} | ${armStr}     ${notesStr}\n`;
    });

    text += `\n===================================================\n`;
    text += `Wygenerowano w aplikacji Pulsivio na podstawie domowych pomiarów ciśnienia (HBPM).\n`;
    return text;
  };

  // Copy full email text to clipboard
  const handleCopyEmailText = async () => {
    try {
      const text = generateTextSummary(emailPeriod);
      await navigator.clipboard.writeText(text);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2800);
    } catch {
      // Fallback
    }
  };

  // Copy to clipboard or share via navigator.share on mobile
  const handleCopyOrShare = async () => {
    if (onPushSync) onPushSync();
    const text = generateTextSummary(emailPeriod);
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Pulsivio - Raport ciśnienia: ${profile.name || 'Pacjent'}`,
          text: text,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  // Compose Email to Doctor
  const handleSendEmail = () => {
    if (onPushSync) onPushSync();
    const subject = encodeURIComponent(`Raport pomiarów ciśnienia krwi (${emailPeriod === '7d' ? 'ostatnie 7 dni' : emailPeriod === '14d' ? '14 dni' : emailPeriod === '30d' ? '30 dni' : 'pełna historia'}) - ${profile.name || 'Pacjent'}`);
    const body = encodeURIComponent(generateTextSummary(emailPeriod));
    const emailTo = doctorEmail || '';
    window.location.href = `mailto:${emailTo}?subject=${subject}&body=${body}`;
  };

  // Export CSV file (Excel friendly with UTF-8 BOM)
  const handleExportCSV = () => {
    const targetList = getFilteredMeasurements(emailPeriod);
    const headers = ['Data', 'Godzina', 'Pora', 'SYS (mmHg)', 'DIA (mmHg)', 'Puls (bpm)', 'Ramię', 'Klasyfikacja', 'Cukier (mg/dL)', 'Notatki'];
    const rows = targetList.map((m) => {
      const cls = classifyBloodPressure(m.systolic, m.diastolic, lang);
      return [
        `"${m.date}"`,
        `"${m.time}"`,
        `"${m.period}"`,
        m.systolic,
        m.diastolic,
        m.pulse || '',
        `"${m.arm === 'left' ? 'Lewe' : 'Prawe'}"`,
        `"${cls.label}"`,
        m.bloodSugar || '',
        `"${(m.notes || '').replace(/"/g, '""')}"`,
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Pulsivio_Cisnienie_${(profile.name || 'Pacjent').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setCsvDownloaded(true);
    setTimeout(() => setCsvDownloaded(false), 2800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-slate-900 shadow-2xl border border-slate-800 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3.5 bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                {lang === 'pl' ? 'Udostępnij lekarzowi' : (lang === 'it' ? 'Condividi con il medico' : 'Share with Doctor')}
              </h2>
              <p className="text-xs text-slate-400">
                {lang === 'pl' ? 'Wyślij raport, pobierz CSV lub wydrukuj A4' : 'Send report, download CSV or print A4'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors cursor-pointer"
            title="Zamknij"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-4 text-slate-200">
          
          {/* Clinical Indicators Quick Scan Matrix (Zero calculations needed by doctor) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300">
                <Activity className="h-3.5 w-3.5 text-rose-500" />
                <span>{lang === 'pl' ? 'Wskaźniki kliniczne bez przeliczania' : 'Ready Clinical Indices'}</span>
              </div>
              <span className="text-[11px] font-bold text-blue-300 bg-blue-950/70 border border-blue-900/60 px-2 py-0.5 rounded-md">
                {total} {lang === 'pl' ? 'pomiarów' : 'readings'}
              </span>
            </div>

            {/* Row 1: Key Averages */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-900 rounded-xl p-2 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">Średnia SYS/DIA</span>
                <span className="text-sm sm:text-base font-black text-white">{avgSys}/{avgDia}</span>
                <span className="text-[9px] text-slate-500 block">mmHg</span>
              </div>
              <div className="bg-slate-900 rounded-xl p-2 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">Śr. tętno</span>
                <span className="text-sm sm:text-base font-black text-rose-400">{avgPulse}</span>
                <span className="text-[9px] text-slate-500 block">bpm (spoczynek)</span>
              </div>
              <div className="bg-slate-900 rounded-xl p-2 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">W normie PTNT</span>
                <span className="text-sm sm:text-base font-black text-emerald-400">{normPercent}%</span>
                <span className="text-[9px] text-slate-500 block">&lt;135/85 mmHg</span>
              </div>
            </div>

            {/* Row 2: Chronotherapy & Morning Surge */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-slate-800">
              <div className="bg-slate-900 rounded-xl p-1.5 border border-slate-800">
                <span className="text-[10px] font-bold text-amber-400 block flex items-center justify-center gap-1">
                  <Sun className="h-3 w-3 text-amber-500" />
                  Rano
                </span>
                <span className="text-xs sm:text-sm font-black text-white">
                  {mAvgSys ? `${mAvgSys}/${mAvgDia}` : '--/--'}
                </span>
                <span className="text-[9px] text-slate-500 block">{morningList.length} pom.</span>
              </div>

              <div className="bg-slate-900 rounded-xl p-1.5 border border-slate-800">
                <span className="text-[10px] font-bold text-indigo-400 block flex items-center justify-center gap-1">
                  <Moon className="h-3 w-3 text-indigo-400" />
                  Wieczór
                </span>
                <span className="text-xs sm:text-sm font-black text-white">
                  {eAvgSys ? `${eAvgSys}/${eAvgDia}` : '--/--'}
                </span>
                <span className="text-[9px] text-slate-500 block">{eveningList.length} pom.</span>
              </div>

              <div className="bg-slate-900 rounded-xl p-1.5 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-300 block">
                  Skok poranny
                </span>
                <span className={`text-xs sm:text-sm font-black ${
                  morningSurge !== null && morningSurge >= 15 
                    ? 'text-amber-400' 
                    : 'text-white'
                }`}>
                  {morningSurge !== null ? `${morningSurge >= 0 ? '+' : ''}${morningSurge}` : '--'}
                </span>
                <span className="text-[9px] text-slate-500 block">mmHg</span>
              </div>
            </div>

            {/* Row 3: Cardiology Parameters (PP, MAP, Extremes) */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800">
              <div className="bg-slate-900 rounded-xl p-2 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">
                    Ciśnienie tętna (PP)
                  </span>
                  <span className="text-xs font-black text-indigo-400">
                    {pulsePressure} mmHg
                  </span>
                </div>
                <span className="text-[9px] text-slate-500 text-right">
                  {pulsePressure > 60 ? '⚠️ sztywność naczyń' : 'norma: 40-50'}
                </span>
              </div>

              <div className="bg-slate-900 rounded-xl p-2 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">
                    Średnie tętnicze (MAP)
                  </span>
                  <span className="text-xs font-black text-white">
                    {map} mmHg
                  </span>
                </div>
                <span className="text-[9px] text-slate-500 text-right">
                  perfuzja: 70-105
                </span>
              </div>
            </div>
          </div>

          {/* Primary Method 1: Email & Excel directly to Doctor's PC / Laptop */}
          <div className="rounded-3xl border border-blue-900/60 bg-slate-950/80 p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xs shrink-0">
                  <Mail className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black text-white">
                      {lang === 'pl' ? '1. Wyślij na komputer lekarza (E-mail i Excel)' : '1. Send to Doctor\'s PC (Email & Excel)'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-950 border border-emerald-800/80 text-emerald-300">
                      ⭐ 100% Pewne w gabinecie
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    {lang === 'pl' 
                      ? 'Lekarz otwiera maila na laptopie w gabinecie i ma od razu gotowe średnie, tętno, poranny skok ciśnienia oraz tabelę bez logowania.' 
                      : 'Doctor opens the email on clinic laptop with ready clinical averages and tables.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Scope Selection */}
            <div className="space-y-1.5 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
              <label className="text-[11px] font-bold text-slate-300 block">
                {lang === 'pl' ? 'Wybierz zakres pomiarów do wysłania:' : 'Select measurement period:'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { key: '7d', label: '⭐ 7 dni (PTNT)' },
                  { key: '14d', label: '14 dni' },
                  { key: '30d', label: '30 dni' },
                  { key: 'all', label: 'Wszystkie' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setEmailPeriod(item.key as any)}
                    className={`px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                      emailPeriod === item.key
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Doctor Email Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-300">
                  {lang === 'pl' ? 'Adres e-mail lekarza lub przychodni (opcjonalnie):' : 'Doctor / clinic email (optional):'}
                </label>
                {doctorEmail && (
                  <button
                    type="button"
                    onClick={handleSaveDoctorInfo}
                    className="text-[10px] text-blue-400 font-bold hover:underline cursor-pointer"
                  >
                    Zapisz w profilu
                  </button>
                )}
              </div>
              <input
                type="email"
                value={doctorEmail}
                onChange={(e) => setDoctorEmail(e.target.value)}
                placeholder="np. lekarz@przychodnia.pl lub rejestracja@..."
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Email Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={handleSendEmail}
                id="share-doctor-email-primary-btn"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <Mail className="h-4 w-4 shrink-0" />
                <span>{lang === 'pl' ? 'Wyślij e-mail' : 'Send Email'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyEmailText}
                id="share-doctor-copy-email-text-btn"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
              >
                {emailCopied ? <Check className="h-4 w-4 text-emerald-400 shrink-0" /> : <Copy className="h-4 w-4 text-slate-400 shrink-0" />}
                <span>{emailCopied ? (lang === 'pl' ? 'Skopiowano!' : 'Copied!') : (lang === 'pl' ? 'Kopiuj treść maila' : 'Copy email text')}</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                id="share-doctor-csv-primary-btn"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-[0.98]"
              >
                {csvDownloaded ? <Check className="h-4 w-4 text-emerald-400 shrink-0" /> : <FileSpreadsheet className="h-4 w-4 text-emerald-400 shrink-0" />}
                <span>{csvDownloaded ? (lang === 'pl' ? 'Pobrano plik!' : 'Downloaded!') : (lang === 'pl' ? 'Pobierz Excel (CSV)' : 'Download Excel')}</span>
              </button>
            </div>

            {/* Practical doctor office tip */}
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-2.5 text-[11px] text-slate-300 flex items-start gap-2">
              <span className="shrink-0 text-sm">💡</span>
              <div className="space-y-0.5">
                <span className="font-bold block text-white">
                  {lang === 'pl' ? 'Dlaczego to działa na każdym komputerze w przychodni?' : 'Why does this work everywhere?'}
                </span>
                <p className="text-[10.5px] leading-relaxed text-slate-400">
                  {lang === 'pl'
                    ? 'Wiadomość e-mail oraz plik Excel nie wymagają instalacji żadnych programów ani logowania. Lekarz na swoim laptopie widzi czytelny raport tekstowy i może skopiować średnie wprost do systemu medycznego pacjenta.'
                    : 'Email and Excel files require no logins or software installations on clinic computers.'}
                </p>
              </div>
            </div>
          </div>

          {/* Practical in-clinic options */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400">
              {lang === 'pl' ? '2. Inne sprawdzone formy przekazania w gabinecie' : '2. Other in-clinic options'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              
              {/* Option A: Show Screen to Doctor */}
              {onOpenDoctorMode && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDoctorMode();
                  }}
                  id="share-doctor-standalone-view-btn"
                  className="flex items-center gap-3 p-3 rounded-2xl border border-slate-800 bg-slate-950/80 hover:bg-slate-900 text-left transition-all shadow-2xs cursor-pointer group"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-rose-400 group-hover:scale-105 transition-transform">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-white block leading-tight">
                      {lang === 'pl' ? 'Pokaż ekran lekarzowi' : 'Show screen to doctor'}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate block">
                      {lang === 'pl' ? 'Duże cyfry i tryb kardiologiczny' : 'Large readable digits in clinic'}
                    </span>
                  </div>
                </button>
              )}

              {/* Option B: Open Printable A4 Report */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenReportView) onOpenReportView();
                }}
                id="share-doctor-print-btn"
                className="flex items-center gap-3 p-3 rounded-2xl border border-slate-800 bg-slate-950/80 hover:bg-slate-900 text-left transition-all shadow-2xs cursor-pointer group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 group-hover:scale-105 transition-transform">
                  <Printer className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-white block leading-tight">
                    {lang === 'pl' ? 'Drukuj / Pobierz PDF A4' : 'Print / Download PDF A4'}
                  </span>
                  <span className="text-[11px] text-slate-400 truncate block">
                    {lang === 'pl' ? 'Oficjalna karta kardiologiczna PTNT' : 'Official PTNT medical chart'}
                  </span>
                </div>
              </button>

              {/* Option C: Copy / Share to WhatsApp / SMS */}
              <button
                type="button"
                onClick={handleCopyOrShare}
                id="share-doctor-copy-btn"
                className="sm:col-span-2 flex items-center gap-3 p-3 rounded-2xl border border-slate-800 bg-slate-950/80 hover:bg-slate-900 text-left transition-all shadow-2xs cursor-pointer group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 group-hover:scale-105 transition-transform">
                  {copied ? <Check className="h-5 w-5 text-emerald-400" /> : <Share2 className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-white block leading-tight">
                    {copied ? (lang === 'pl' ? 'Skopiowano treść podsumowania!' : 'Copied!') : (lang === 'pl' ? 'Kopiuj raport do WhatsApp / SMS' : 'Copy summary for WhatsApp / SMS')}
                  </span>
                  <span className="text-[11px] text-slate-400 truncate block">
                    {lang === 'pl' ? 'Gotowy sformatowany tekst do wysłania w dowolnej wiadomości' : 'Ready text message with averages and logs'}
                  </span>
                </div>
              </button>

            </div>
          </div>

          {/* Doctor Details Section */}
          <div className="rounded-2xl border border-slate-800 p-3.5 bg-slate-950/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Stethoscope className="h-4 w-4 text-blue-400" />
                {lang === 'pl' ? 'Dane Twojego lekarza' : 'Your Doctor Details'}
              </span>
              <button
                type="button"
                onClick={() => setEditingDoctor(!editingDoctor)}
                className="text-xs font-bold text-rose-400 hover:text-rose-300 cursor-pointer"
              >
                {editingDoctor ? (lang === 'pl' ? 'Anuluj' : 'Cancel') : (lang === 'pl' ? 'Edytuj dane' : 'Edit info')}
              </button>
            </div>

            {editingDoctor ? (
              <div className="space-y-2 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-0.5">
                    {lang === 'pl' ? 'Imię i nazwisko lekarza' : 'Doctor Name'}
                  </label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                    placeholder={lang === 'pl' ? 'np. dr Jan Nowak lub Poradnia Kardiologiczna' : 'e.g. Dr. John Smith'}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-0.5">
                      {lang === 'pl' ? 'Adres e-mail do raportów' : 'Email address'}
                    </label>
                    <input
                      type="email"
                      value={doctorEmail}
                      onChange={(e) => setDoctorEmail(e.target.value)}
                      placeholder="lekarz@przychodnia.pl"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-0.5">
                      {lang === 'pl' ? 'Telefon do gabinetu' : 'Office Phone'}
                    </label>
                    <input
                      type="tel"
                      value={doctorPhone}
                      onChange={(e) => setDoctorPhone(e.target.value)}
                      placeholder="np. 22-840-00-11"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-0.5">
                    {lang === 'pl' ? 'Nazwa poradni / przychodni' : 'Clinic Name'}
                  </label>
                  <input
                    type="text"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    placeholder={lang === 'pl' ? 'np. Poradnia Kardiologiczna' : 'e.g. Cardiology Clinic'}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-0.5">
                    {lang === 'pl' ? 'Twoje przyjmowane leki (opcjonalnie)' : 'Medications (optional)'}
                  </label>
                  <input
                    type="text"
                    value={medications}
                    onChange={(e) => setMedications(e.target.value)}
                    placeholder={lang === 'pl' ? 'np. Nazwa leku i dawka (1x rano)' : 'e.g. Medication name and dosage'}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleSaveDoctorInfo}
                    className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
                  >
                    {lang === 'pl' ? 'Zapisz dane' : 'Save details'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs space-y-1 text-slate-300">
                <p>
                  <strong className="text-white">{lang === 'pl' ? 'Lekarz:' : 'Doctor:'}</strong> {profile.doctorName || (lang === 'pl' ? 'Nie podano (kliknij "Edytuj dane")' : 'Not set')}
                </p>
                {profile.doctorEmail && (
                  <p>
                    <strong className="text-white">E-mail:</strong> {profile.doctorEmail}
                  </p>
                )}
                {profile.doctorPhone && (
                  <p>
                    <strong className="text-white">{lang === 'pl' ? 'Telefon:' : 'Phone:'}</strong> {profile.doctorPhone}
                  </p>
                )}
                {profile.clinicName && (
                  <p>
                    <strong className="text-white">{lang === 'pl' ? 'Poradnia:' : 'Clinic:'}</strong> {profile.clinicName}
                  </p>
                )}
                {profile.medications ? (
                  <p className="text-indigo-300">
                    <strong className="text-white">{lang === 'pl' ? 'Leki:' : 'Meds:'}</strong> {profile.medications}
                  </p>
                ) : (
                  <p className="text-slate-500">
                    <strong className="text-white">{lang === 'pl' ? 'Leki:' : 'Meds:'}</strong> {lang === 'pl' ? 'Pole puste (brak wpisanych leków)' : 'Empty (no medications entered)'}
                  </p>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 px-5 py-3 bg-slate-900 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-extrabold text-sm shadow-xs cursor-pointer transition-all active:scale-95"
          >
            {lang === 'pl' ? 'Zamknij' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
