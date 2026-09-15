import React, { useState, useMemo } from 'react';
import {
  Search,
  Trash2,
  Pencil,
  Clock,
  Heart,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Plus,
  ChevronDown,
  ChevronUp,
  Layers,
  LayoutList,
  CalendarDays,
  CalendarRange,
  Activity,
  Stethoscope,
  HeartPulse,
  CalendarCheck,
  SunMedium,
  Sun,
  Sunset,
  Moon,
  CheckCircle2,
  CheckCircle,
  AlertTriangle,
  ArrowDownCircle,
  ShieldAlert,
  Check,
  X,
} from 'lucide-react';
import { Measurement, Language } from '../types';
import { translations } from '../i18n';
import { classifyBloodPressure } from '../utils/bpClassification';
import { BloodPressureMonitorCard } from './BloodPressureMonitorCard';
import { DayDetailModal } from './DayDetailModal';

interface MeasurementsListProps {
  measurements: Measurement[];
  onDelete: (id: string) => void;
  onEdit?: (item: Measurement) => void;
  onAddNewToDate?: (date: string) => void;
  onOpenRecommendedDevices?: () => void;
  lang: Language;
}

interface DayGroup {
  date: string;
  displayDate: string;
  dayLetter: string;
  items: Measurement[];
  avgSys: number;
  avgDia: number;
  avgPulse: number;
}

// 1-letter abbreviation of week day: P, W, Ś, C, P, S, N (Polish) or localized equivalent
export function getDaySingleLetter(dateStr: string, currentLang: Language): string {
  try {
    const d = new Date(dateStr + 'T12:00:00');
    const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    if (currentLang === 'pl') {
      // Niedziela = N, Poniedziałek = P, Wtorek = W, Środa = Ś, Czwartek = C, Piątek = P, Sobota = S
      const map = ['N', 'P', 'W', 'Ś', 'C', 'P', 'S'];
      return map[day] || '•';
    } else if (currentLang === 'ru') {
      const map = ['В', 'П', 'В', 'С', 'Ч', 'П', 'С'];
      return map[day] || '•';
    } else if (currentLang === 'fr') {
      const map = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
      return map[day] || '•';
    } else if (currentLang === 'pt') {
      const map = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
      return map[day] || '•';
    } else if (currentLang === 'de') {
      const map = ['S', 'M', 'D', 'M', 'D', 'F', 'S'];
      return map[day] || '•';
    } else if (currentLang === 'es') {
      const map = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
      return map[day] || '•';
    } else if (currentLang === 'it') {
      const map = ['D', 'L', 'M', 'M', 'G', 'V', 'S'];
      return map[day] || '•';
    } else {
      const map = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
      return map[day] || '•';
    }
  } catch {
    return '•';
  }
}

export const MeasurementsList: React.FC<MeasurementsListProps> = ({
  measurements,
  onDelete,
  onEdit,
  onAddNewToDate,
  onOpenRecommendedDevices,
  lang,
}) => {
  const t = translations[lang] || translations.pl;

  const [periodFilter, setPeriodFilter] = useState<'all' | 'morning' | 'noon' | 'evening' | 'extra'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'groupedDays' | 'singleList'>('groupedDays');
  const [daysRange, setDaysRange] = useState<number>(7); // Default 7 days (calendar week)
  const [weekOffset, setWeekOffset] = useState<number>(0); // 0 = current calendar week, -1 = last week, etc.
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({});
  const [selectedDayDetail, setSelectedDayDetail] = useState<DayGroup | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [confirmingClearDate, setConfirmingClearDate] = useState<string | null>(null);

  const toggleExpandDay = (dateStr: string) => {
    setExpandedDays((prev) => ({ ...prev, [dateStr]: !prev[dateStr] }));
  };

  // Filter
  const filtered = useMemo(() => {
    return measurements.filter((m) => {
      const matchPeriod =
        periodFilter === 'all' ||
        (periodFilter === 'morning' && m.period === 'morning') ||
        (periodFilter === 'noon' && m.period === 'noon') ||
        (periodFilter === 'evening' && m.period === 'evening') ||
        (periodFilter === 'extra' && (m.period === 'extra' || m.period === 'night'));

      const matchSearch =
        !searchTerm ||
        (m.notes && m.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.tags && m.tags.some((tg) => tg.toLowerCase().includes(searchTerm.toLowerCase()))) ||
        m.date.includes(searchTerm);

      return matchPeriod && matchSearch;
    });
  }, [measurements, periodFilter, searchTerm]);

  // Overall stats
  const stats = useMemo(() => {
    if (filtered.length === 0) return { sys: 0, dia: 0, pulse: 0, total: 0, normPercent: 0 };
    const sysSum = filtered.reduce((acc, m) => acc + m.systolic, 0);
    const diaSum = filtered.reduce((acc, m) => acc + m.diastolic, 0);
    const pulseSum = filtered.reduce((acc, m) => acc + (m.pulse || 0), 0);
    const withPulse = filtered.filter((m) => m.pulse).length || 1;
    const inNorm = filtered.filter((m) => m.systolic < 135 && m.diastolic < 85).length;

    return {
      sys: Math.round(sysSum / filtered.length),
      dia: Math.round(diaSum / filtered.length),
      pulse: Math.round(pulseSum / withPulse),
      total: filtered.length,
      normPercent: Math.round((inNorm / filtered.length) * 100),
    };
  }, [filtered]);

  // Format compact day header with date
  const formatDayHeader = (dateStr: string): string => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = yesterdayDate.toISOString().split('T')[0];

      const parts = dateStr.split('-');
      const shortDate = parts.length === 3 ? `${parts[2]}.${parts[1]}` : dateStr;

      if (dateStr === today) {
        return `${shortDate} (${t.today || 'Dzisiaj'})`;
      }
      if (dateStr === yesterday) {
        return `${shortDate} (${t.yesterday || 'Wczoraj'})`;
      }

      return shortDate;
    } catch {
      return dateStr;
    }
  };

  // Group by date
  const dayGroups = useMemo<DayGroup[]>(() => {
    const map = new Map<string, Measurement[]>();

    const periodPriority: Record<string, number> = {
      morning: 0,
      noon: 1,
      evening: 2,
      extra: 3,
      night: 3,
    };

    // Sort newest first
    const sorted = [...filtered].sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      const pA = periodPriority[a.period] ?? 99;
      const pB = periodPriority[b.period] ?? 99;
      if (pA !== pB) return pB - pA;
      if (a.time && b.time) return b.time.localeCompare(a.time);
      return b.timestamp - a.timestamp;
    });

    sorted.forEach((m) => {
      const list = map.get(m.date) || [];
      list.push(m);
      map.set(m.date, list);
    });

    const groups: DayGroup[] = [];
    map.forEach((items, date) => {
      // Sort items within day chronologically: morning -> noon -> evening -> extra/night
      items.sort((a, b) => {
        const pA = periodPriority[a.period] ?? 99;
        const pB = periodPriority[b.period] ?? 99;
        if (pA !== pB) return pA - pB;
        if (a.time && b.time) return a.time.localeCompare(b.time);
        if (a.time && !b.time) return -1;
        if (!a.time && b.time) return 1;
        return a.timestamp - b.timestamp;
      });

      const sysSum = items.reduce((acc, x) => acc + x.systolic, 0);
      const diaSum = items.reduce((acc, x) => acc + x.diastolic, 0);
      const pulseSum = items.reduce((acc, x) => acc + (x.pulse || 0), 0);
      const withPulse = items.filter((x) => x.pulse).length || 1;

      groups.push({
        date,
        displayDate: formatDayHeader(date),
        dayLetter: getDaySingleLetter(date, lang),
        items,
        avgSys: Math.round(sysSum / items.length),
        avgDia: Math.round(diaSum / items.length),
        avgPulse: Math.round(pulseSum / withPulse),
      });
    });

    return groups;
  }, [filtered, lang]);

  // Calendar week calculation: Monday 00:00:00 to Sunday 23:59:59
  // Automatically advances when Sunday passes into Monday (po 00:00 w niedzielę)
  const calendarWeek = useMemo(() => {
    const now = new Date();
    // Move to target week offset
    const target = new Date(now);
    target.setDate(now.getDate() + weekOffset * 7);

    // In JS, getDay(): 0 is Sunday, 1 is Monday, ..., 6 is Saturday
    const day = target.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;

    const monday = new Date(target);
    monday.setDate(target.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const todayStr = now.toISOString().split('T')[0];

    const dayLetterMap: Record<string, string[]> = {
      pl: ['P', 'W', 'Ś', 'C', 'P', 'S', 'N'],
      en: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
      de: ['M', 'D', 'M', 'D', 'F', 'S', 'S'],
      fr: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
      es: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
      pt: ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'],
      ru: ['П', 'В', 'С', 'Ч', 'П', 'С', 'В'],
    };

    const dayNameMap: Record<string, string[]> = {
      pl: ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'],
      en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      de: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'],
      fr: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
      es: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      pt: ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'],
      ru: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],
    };

    const letters = dayLetterMap[lang] || dayLetterMap.pl;
    const names = dayNameMap[lang] || dayNameMap.pl;

    // Fast map of measurements in current filtered list by date
    const itemsByDate = new Map<string, Measurement[]>();
    filtered.forEach((m) => {
      const list = itemsByDate.get(m.date) || [];
      list.push(m);
      itemsByDate.set(m.date, list);
    });

    const days: {
      letter: string;
      name: string;
      dateStr: string;
      shortDate: string;
      isToday: boolean;
      isFuture: boolean;
      dayIdx: number;
      count: number;
      hasData: boolean;
      items: Measurement[];
    }[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const shortDate = `${dd}.${mm}`;
      const items = itemsByDate.get(dateStr) || [];

      days.push({
        letter: letters[i],
        name: names[i],
        dateStr,
        shortDate,
        isToday: dateStr === todayStr,
        isFuture: dateStr > todayStr,
        dayIdx: i === 6 ? 0 : i + 1,
        count: items.length,
        hasData: items.length > 0,
        items,
      });
    }

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const startStr = `${String(monday.getDate()).padStart(2, '0')}.${String(monday.getMonth() + 1).padStart(2, '0')}`;
    const endStr = `${String(sunday.getDate()).padStart(2, '0')}.${String(sunday.getMonth() + 1).padStart(2, '0')}`;

    const totalWeekItems = days.flatMap((d) => d.items);

    return {
      monday,
      sunday,
      startStr,
      endStr,
      isCurrentWeek: weekOffset === 0,
      days,
      totalWeekItems,
    };
  }, [weekOffset, lang, filtered]);

  // Pagination for grouped days (using daysRange, defaults to 7 days)
  const effectiveRange = daysRange === 9999 ? Math.max(1, dayGroups.length) : daysRange;
  const totalDayPages = Math.max(1, Math.ceil(dayGroups.length / effectiveRange));
  const validDayPage = Math.min(currentPage, totalDayPages);

  const pagedDays = useMemo(() => {
    if (daysRange === 7) {
      const weekDates = new Set(calendarWeek.days.map((d) => d.dateStr));
      return dayGroups.filter((g) => weekDates.has(g.date));
    }
    if (daysRange === 9999) return dayGroups;
    const start = (validDayPage - 1) * daysRange;
    return dayGroups.slice(start, start + daysRange);
  }, [dayGroups, validDayPage, daysRange, calendarWeek]);

  // Compute Weekly / Page Stats
  const weekStats = useMemo(() => {
    const allItems = daysRange === 7 ? calendarWeek.totalWeekItems : pagedDays.flatMap((d) => d.items);

    if (allItems.length === 0) {
      if (daysRange === 7) {
        return {
          avgSys: 0,
          avgDia: 0,
          avgPulse: 0,
          totalReadings: 0,
          daysCount: 7,
          mSys: null,
          mDia: null,
          mCount: 0,
          nSys: null,
          nDia: null,
          nCount: 0,
          eSys: null,
          eDia: null,
          eCount: 0,
          xSys: null,
          xDia: null,
          xCount: 0,
          morningSurge: null,
          normPercent: 0,
          startDate: calendarWeek.days[6]?.dateStr,
          endDate: calendarWeek.days[0]?.dateStr,
        };
      }
      return null;
    }

    const sysSum = allItems.reduce((acc, m) => acc + m.systolic, 0);
    const diaSum = allItems.reduce((acc, m) => acc + m.diastolic, 0);
    const pulseSum = allItems.reduce((acc, m) => acc + (m.pulse || 0), 0);
    const withPulse = allItems.filter((m) => m.pulse).length || 1;

    // Morning, Noon, Evening & Extra average
    const morningItems = allItems.filter((m) => m.period === 'morning');
    const noonItems = allItems.filter((m) => m.period === 'noon');
    const eveningItems = allItems.filter((m) => m.period === 'evening');
    const extraItems = allItems.filter((m) => m.period === 'extra' || m.period === 'night');

    const mSys = morningItems.length ? Math.round(morningItems.reduce((a, b) => a + b.systolic, 0) / morningItems.length) : null;
    const mDia = morningItems.length ? Math.round(morningItems.reduce((a, b) => a + b.diastolic, 0) / morningItems.length) : null;

    const nSys = noonItems.length ? Math.round(noonItems.reduce((a, b) => a + b.systolic, 0) / noonItems.length) : null;
    const nDia = noonItems.length ? Math.round(noonItems.reduce((a, b) => a + b.diastolic, 0) / noonItems.length) : null;

    const eSys = eveningItems.length ? Math.round(eveningItems.reduce((a, b) => a + b.systolic, 0) / eveningItems.length) : null;
    const eDia = eveningItems.length ? Math.round(eveningItems.reduce((a, b) => a + b.diastolic, 0) / eveningItems.length) : null;

    const xSys = extraItems.length ? Math.round(extraItems.reduce((a, b) => a + b.systolic, 0) / extraItems.length) : null;
    const xDia = extraItems.length ? Math.round(extraItems.reduce((a, b) => a + b.diastolic, 0) / extraItems.length) : null;

    const morningSurge = (mSys !== null && eSys !== null) ? mSys - eSys : null;
    const normCount = allItems.filter((m) => m.systolic < 135 && m.diastolic < 85).length;
    const normPercent = allItems.length ? Math.round((normCount / allItems.length) * 100) : 0;

    return {
      avgSys: Math.round(sysSum / allItems.length),
      avgDia: Math.round(diaSum / allItems.length),
      avgPulse: Math.round(pulseSum / withPulse),
      totalReadings: allItems.length,
      daysCount: daysRange === 7 ? 7 : pagedDays.length,
      mSys,
      mDia,
      mCount: morningItems.length,
      nSys,
      nDia,
      nCount: noonItems.length,
      eSys,
      eDia,
      eCount: eveningItems.length,
      xSys,
      xDia,
      xCount: extraItems.length,
      morningSurge,
      normPercent,
      startDate: daysRange === 7 ? calendarWeek.days[6]?.dateStr : pagedDays[pagedDays.length - 1]?.date,
      endDate: daysRange === 7 ? calendarWeek.days[0]?.dateStr : pagedDays[0]?.date,
    };
  }, [pagedDays, daysRange, calendarWeek]);

  // Alias weekDaysStrip to calendarWeek.days
  const weekDaysStrip = calendarWeek.days;

  const getClassificationIcon = (level: string) => {
    switch (level) {
      case 'hypertension_3':
        return <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-rose-700 dark:text-rose-300" />;
      case 'hypertension_2':
      case 'hypertension_1':
        return <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-700 dark:text-amber-300" />;
      case 'hypotension':
        return <ArrowDownCircle className="h-3.5 w-3.5 shrink-0 text-sky-700 dark:text-sky-300" />;
      case 'high_normal':
        return <CheckCircle className="h-3.5 w-3.5 shrink-0 text-yellow-700 dark:text-yellow-300" />;
      case 'normal':
      case 'optimal':
      default:
        return <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-700 dark:text-emerald-300" />;
    }
  };

  const getPeriodBadge = (period: string, time: string) => {
    switch (period) {
      case 'morning':
        return {
          label: t.morningLabel || 'Rano',
          icon: <SunMedium className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 shrink-0" />,
          bg: 'bg-amber-100 text-amber-950 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-300 dark:border-amber-700',
        };
      case 'noon':
        return {
          label: t.noonLabel || 'Południe',
          icon: <Sun className="h-3.5 w-3.5 text-sky-500 dark:text-sky-400 shrink-0" />,
          bg: 'bg-sky-100 text-sky-950 dark:bg-sky-950/80 dark:text-sky-200 border border-sky-300 dark:border-sky-700',
        };
      case 'evening':
        return {
          label: t.eveningLabel || 'Wieczór',
          icon: <Sunset className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />,
          bg: 'bg-indigo-100 text-indigo-950 dark:bg-indigo-950/80 dark:text-indigo-200 border border-indigo-300 dark:border-indigo-700',
        };
      case 'extra':
      case 'night':
        return {
          label: t.extraLabel || (lang === 'pl' ? 'Dodatkowy' : 'Extra'),
          icon: <PlusCircle className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 shrink-0" />,
          bg: 'bg-purple-100 text-purple-950 dark:bg-purple-950/80 dark:text-purple-200 border border-purple-300 dark:border-purple-700',
        };
      default:
        return {
          label: time || (t.extraLabel || 'Dodatkowy'),
          icon: <Clock className="h-3.5 w-3.5 text-slate-500 shrink-0" />,
          bg: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-600',
        };
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-2.5 py-3 sm:px-6 sm:py-4 space-y-3">
      
      {/* Top Stat Summary Banner - Unified Blood Pressure & Health Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
        {/* Tile 1: Unified Blood Pressure (SYS / DIA) - Vibrant Sky Blue */}
        <div className="rounded-2xl border-2 border-sky-300/90 bg-gradient-to-br from-sky-50 via-white to-sky-100/40 p-2.5 sm:p-3.5 dark:border-sky-600/70 dark:from-slate-900 dark:via-slate-900 dark:to-sky-950/50 shadow-xs flex items-center justify-between transition-all hover:shadow-sm">
          <div className="min-w-0 flex-1 mr-1">
            <span className="text-[10px] sm:text-xs font-bold text-sky-700 dark:text-sky-300 truncate block">
              {lang === 'pl' ? 'Średnie ciśnienie' : 'Average Blood Pressure'}
            </span>
            <span className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-tight block truncate">
              {stats.sys && stats.dia ? `${stats.sys}/${stats.dia}` : '--/--'}{' '}
              <span className="text-[9px] sm:text-[10px] font-bold text-sky-600 dark:text-sky-400">mmHg</span>
            </span>
          </div>
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-sky-500 text-white shadow-xs shadow-sky-500/30 shrink-0">
            <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>

        {/* Tile 2: Pulse - Vibrant Coral / Rose */}
        <div className="rounded-2xl border-2 border-rose-300/90 bg-gradient-to-br from-rose-50 via-white to-rose-100/40 p-2.5 sm:p-3.5 dark:border-rose-600/70 dark:from-slate-900 dark:via-slate-900 dark:to-rose-950/50 shadow-xs flex items-center justify-between transition-all hover:shadow-sm">
          <div className="min-w-0 flex-1 mr-1">
            <span className="text-[10px] sm:text-xs font-bold text-rose-700 dark:text-rose-300 truncate block">
              {t.avgPulse}
            </span>
            <span className="text-lg sm:text-2xl font-black text-rose-600 dark:text-rose-400 leading-tight block truncate">
              {stats.pulse || '--'}{' '}
              <span className="text-[9px] sm:text-[10px] font-bold text-rose-500">bpm</span>
            </span>
          </div>
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-rose-500 text-white shadow-xs shadow-rose-500/30 shrink-0">
            <HeartPulse className="h-4 w-4 sm:h-5 sm:w-5 fill-white/20" />
          </div>
        </div>

        {/* Tile 3: Clinical Norm Compliance (PTNT <135/85) - Fresh Mint / Emerald */}
        <div className="rounded-2xl border-2 border-emerald-300/90 bg-gradient-to-br from-emerald-50 via-white to-emerald-100/40 p-2.5 sm:p-3.5 dark:border-emerald-600/70 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/50 shadow-xs flex items-center justify-between transition-all hover:shadow-sm">
          <div className="min-w-0 flex-1 mr-1">
            <span className="text-[10px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-300 truncate block">
              {lang === 'pl' ? 'W normie PTNT' : 'In Normal Range'}
            </span>
            <span className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-tight block truncate">
              {stats.total > 0 ? `${stats.normPercent}%` : '--'}{' '}
              <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700/80 dark:text-emerald-400/80">&lt;135/85</span>
            </span>
          </div>
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-xs shadow-emerald-500/30 shrink-0">
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>

        {/* Tile 4: Total Entries - Bright Purple / Violet */}
        <div className="rounded-2xl border-2 border-purple-300/90 bg-gradient-to-br from-purple-50 via-white to-purple-100/40 p-2.5 sm:p-3.5 dark:border-purple-600/70 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950/50 shadow-xs flex items-center justify-between transition-all hover:shadow-sm">
          <div className="min-w-0 flex-1 mr-1">
            <span className="text-[10px] sm:text-xs font-bold text-purple-700 dark:text-purple-300 truncate block">
              {t.totalEntries}
            </span>
            <span className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white leading-tight block truncate">
              {stats.total}{' '}
              <span className="text-[9px] sm:text-[10px] font-bold text-purple-600 dark:text-purple-400">{lang === 'pl' ? 'wpisów' : 'total'}</span>
            </span>
          </div>
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-purple-500 text-white shadow-xs shadow-purple-500/30 shrink-0">
            <CalendarCheck className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
        </div>
      </div>

      {/* CENTRAL PROMINENT ADD MEASUREMENT BUTTON (DUŻY PLUS W CENTRUM) */}
      <div className="rounded-2xl bg-gradient-to-r from-rose-600 via-red-500 to-rose-700 text-white p-3 sm:p-4 shadow-lg shadow-rose-500/20 border-2 border-rose-300 dark:border-rose-700 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
        <div className="flex items-center gap-3 text-center sm:text-left min-w-0">
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-white/20 text-white shadow-inner shrink-0">
            <HeartPulse className="h-6 w-6 text-white animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                {lang === 'pl' ? 'Dodaj Nowy Pomiar Ciśnienia' : 'Add Blood Pressure Reading'}
              </h3>
              <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Szybki Zapis
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-rose-100 font-medium truncate sm:whitespace-normal">
              {lang === 'pl'
                ? 'Zapisz poranne, popołudniowe lub wieczorne badanie w kilka sekund'
                : 'Log your morning, noon or evening reading in seconds'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const today = new Date().toISOString().split('T')[0];
            onAddNewToDate?.(today);
          }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 sm:py-3 text-sm sm:text-base font-black text-rose-600 shadow-md hover:bg-rose-50 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-rose-600 text-white">
            <Plus className="h-4 w-4 stroke-[3]" />
          </div>
          <span>{lang === 'pl' ? 'Dodaj pomiar teraz (+)' : 'Add reading now (+)'}</span>
        </button>
      </div>

      {/* Filter, Search & View Switcher */}
      <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-2.5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          
          {/* Period Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setPeriodFilter('all');
                setCurrentPage(1);
              }}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
                periodFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-slate-700 dark:text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {t.filterAll}
            </button>
            <button
              type="button"
              onClick={() => {
                setPeriodFilter('morning');
                setCurrentPage(1);
              }}
              className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold transition-all cursor-pointer ${
                periodFilter === 'morning'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300'
              }`}
            >
              <SunMedium className="h-3 w-3" />
              <span>{lang === 'pl' ? 'Rano' : 'Morning'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPeriodFilter('noon');
                setCurrentPage(1);
              }}
              className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold transition-all cursor-pointer ${
                periodFilter === 'noon'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-sky-50 text-sky-900 hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-300'
              }`}
            >
              <Sun className="h-3 w-3" />
              <span>{lang === 'pl' ? 'Południe' : 'Noon'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPeriodFilter('evening');
                setCurrentPage(1);
              }}
              className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold transition-all cursor-pointer ${
                periodFilter === 'evening'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-indigo-50 text-indigo-900 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-300'
              }`}
            >
              <Sunset className="h-3 w-3" />
              <span>{lang === 'pl' ? 'Wieczór' : 'Evening'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPeriodFilter('extra');
                setCurrentPage(1);
              }}
              className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold transition-all cursor-pointer ${
                periodFilter === 'extra'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-purple-50 text-purple-900 hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300'
              }`}
            >
              <PlusCircle className="h-3 w-3" />
              <span>{t.extraLabel || (lang === 'pl' ? 'Dodatkowy' : 'Extra')}</span>
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode('groupedDays')}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'groupedDays'
                  ? 'bg-sky-500 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              title="Grupuj dniami (P, W, Ś, C, P, S, N)"
            >
              <CalendarDays className={`h-3.5 w-3.5 ${viewMode === 'groupedDays' ? 'text-white' : 'text-sky-600'}`} />
              <span>Dni</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('singleList')}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'singleList'
                  ? 'bg-sky-500 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
              title="Pojedyncza lista"
            >
              <LayoutList className={`h-3.5 w-3.5 ${viewMode === 'singleList' ? 'text-white' : 'text-slate-500'}`} />
              <span>Lista</span>
            </button>
          </div>

        </div>

        {/* Search Bar */}
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1 pl-8 pr-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          />
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-sky-300 dark:border-sky-800 p-6 sm:p-10 text-center bg-white dark:bg-slate-900 shadow-xs space-y-5 animate-fade-in">
          <div className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
            <HeartPulse className="h-8 w-8 sm:h-10 sm:w-10 animate-pulse" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
              {lang === 'pl' ? 'Twój dziennik jest wyzerowany i gotowy!' : 'Your journal is clean and ready!'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {lang === 'pl'
                ? 'Wszystkie przykładowe pomiary zostały usunięte. Od teraz zapisujesz tu wyłącznie swoje własne, rzeczywiste pomiary ciśnienia i tętna.'
                : 'All mock measurements have been cleared. From now on, you record only your own authentic blood pressure readings.'}
            </p>
          </div>

          {/* Cardiac Measuring Tips */}
          <div className="max-w-lg mx-auto grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left text-xs bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="space-y-1">
              <span className="font-bold text-sky-700 dark:text-sky-300 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> 1. Odpoczynek
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Usiądź spokojnie na 5 minut przed pomiarem.
              </p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-sky-700 dark:text-sky-300 flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" /> 2. Mankiet
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Załóż mankiet na lewe ramię na wysokości serca.
              </p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-sky-700 dark:text-sky-300 flex items-center gap-1">
                <Activity className="h-3.5 w-3.5" /> 3. Cisza
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Nie mów i nie ruszaj się w trakcie pompowania.
              </p>
            </div>
          </div>

          {onAddNewToDate && (
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onAddNewToDate(new Date().toISOString().split('T')[0])}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white px-6 py-3 text-sm font-black shadow-md shadow-rose-500/25 transition-all cursor-pointer active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>{lang === 'pl' ? 'Wprowadź pierwszy pomiar' : 'Add first measurement'}</span>
              </button>

              {onOpenRecommendedDevices && (
                <button
                  type="button"
                  onClick={onOpenRecommendedDevices}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/50 px-4 py-2.5 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                >
                  <Stethoscope className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  <span>{lang === 'pl' ? 'Polecane ciśnieniomierze z atestem' : 'Recommended BP Monitors'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      ) : viewMode === 'groupedDays' ? (
        
        /* GROUPED BY DAY VIEW */
        <div className="space-y-3.5">
          
          {/* Weekly Summary Card with 7-Day Calendar Strip (Poniedziałek -> Niedziela) */}
          {weekStats && (
            <div className="rounded-2xl border-2 border-sky-300/90 bg-gradient-to-br from-sky-50/90 via-white to-cyan-50/60 p-3 sm:p-4 dark:border-sky-500/60 dark:from-slate-900 dark:via-slate-900 dark:to-sky-950/40 shadow-sm space-y-3">
              
              <div className="flex flex-wrap items-center justify-between gap-2">
                
                {/* Title, Calendar Week Dates and Week Navigation */}
                <div className="flex items-center gap-2 min-w-0">
                  <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-xs shadow-sky-500/30 shrink-0">
                    <CalendarRange className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                        {daysRange === 7 ? (
                          <span>
                            {calendarWeek.isCurrentWeek
                              ? (lang === 'pl' ? 'Bieżący tydzień' : 'Current week')
                              : (lang === 'pl' ? 'Tydzień' : 'Week')}
                            <span className="ml-1.5 text-sky-700 dark:text-sky-300 text-xs sm:text-sm font-bold">
                              ({calendarWeek.startStr} – {calendarWeek.endStr})
                            </span>
                          </span>
                        ) : (
                          lang === 'pl' ? `${weekStats.daysCount} dni` : `${weekStats.daysCount} ${t.daysLabel || 'days'}`
                        )}
                      </h3>

                      {daysRange === 7 && (
                        <div className="flex items-center gap-1 shrink-0 ml-1">
                          <button
                            type="button"
                            onClick={() => setWeekOffset((prev) => prev - 1)}
                            className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                            title={lang === 'pl' ? 'Poprzedni tydzień' : 'Previous week'}
                          >
                            <ChevronLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          </button>
                          {weekOffset !== 0 && (
                            <button
                              type="button"
                              onClick={() => setWeekOffset(0)}
                              className="px-1.5 py-0.5 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 text-[10px] font-black hover:bg-sky-200 transition-colors cursor-pointer"
                            >
                              {lang === 'pl' ? 'Bieżący' : 'Today'}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setWeekOffset((prev) => prev + 1)}
                            className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                            title={lang === 'pl' ? 'Następny tydzień' : 'Next week'}
                          >
                            <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                      {weekStats.totalReadings} {t.readingsPluralLabel || (lang === 'pl' ? 'pomiarów w wybranym oknie' : 'readings in selected window')}
                    </span>
                  </div>
                </div>

                {/* Range Selector */}
                <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => { setDaysRange(7); setCurrentPage(1); }}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      daysRange === 7
                        ? 'bg-sky-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {lang === 'pl' ? 'Tydzień (Pn-Nd)' : `7 ${t.daysLabel || 'd'}`}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDaysRange(14); setCurrentPage(1); }}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      daysRange === 14
                        ? 'bg-sky-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    14d
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDaysRange(30); setCurrentPage(1); }}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      daysRange === 30
                        ? 'bg-sky-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    30d
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDaysRange(9999); setCurrentPage(1); }}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      daysRange === 9999
                        ? 'bg-sky-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {t.allLabel || (lang === 'pl' ? 'Wszystko' : 'All')}
                  </button>
                </div>
              </div>

              {/* 7-Dniowy Harmonogram Tygodniowy z Osią Czasu po LEWEJ STRONIE */}
              <div className="pt-2 border-t border-sky-200/80 dark:border-slate-800">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
                  
                  {/* LEWA STRONA: OŚ CZASU 7 DNI (Poniedziałek -> Niedziela) */}
                  <div className="lg:col-span-6 xl:col-span-5 space-y-2">
                    <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4 text-sky-500 shrink-0" />
                        <span>{lang === 'pl' ? 'Oś czasu 7 dni (Pn – Nd):' : '7-Day Timeline (Mon – Sun):'}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {calendarWeek.startStr} – {calendarWeek.endStr}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      {calendarWeek.days.map((day, idx) => {
                        const daySys = day.hasData ? Math.round(day.items.reduce((a, b) => a + b.systolic, 0) / day.items.length) : null;
                        const dayDia = day.hasData ? Math.round(day.items.reduce((a, b) => a + b.diastolic, 0) / day.items.length) : null;

                        return (
                          <div
                            key={idx}
                            className={`group flex items-center justify-between p-2 sm:p-2.5 rounded-xl border-2 transition-all ${
                              day.isToday
                                ? 'border-sky-400 bg-sky-50/80 dark:bg-sky-950/50 dark:border-sky-500 shadow-xs'
                                : day.hasData
                                ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 hover:border-sky-300 dark:hover:border-sky-700'
                                : 'border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/30'
                            }`}
                          >
                            {/* Lewa część: Znaczek dnia, Nazwa, Data */}
                            <div
                              className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                              onClick={() => {
                                if (day.hasData) {
                                  setExpandedDays((prev) => ({ ...prev, [day.dateStr]: true }));
                                  const el = document.getElementById(`day-card-${day.dateStr}`);
                                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                } else if (onAddNewToDate) {
                                  onAddNewToDate(day.dateStr);
                                }
                              }}
                            >
                              <span
                                className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl font-black text-xs sm:text-sm shadow-xs ${
                                  day.hasData
                                    ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sky-500/30'
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                                }`}
                              >
                                {day.letter}
                              </span>

                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                                    {day.name}
                                  </span>
                                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                    {day.shortDate}
                                  </span>
                                  {day.isToday && (
                                    <span className="px-1.5 py-0.2 rounded-full text-[8px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-2xs">
                                      {lang === 'pl' ? 'Dziś' : 'Today'}
                                    </span>
                                  )}
                                </div>

                                <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                                  {day.hasData ? (
                                    <span className="font-semibold text-sky-700 dark:text-sky-300">
                                      {day.count} {lang === 'pl' ? (day.count === 1 ? 'wpis' : day.count < 5 ? 'wpisy' : 'wpisów') : 'readings'} • śr. {daySys}/{dayDia} mmHg
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 dark:text-slate-500">
                                      {lang === 'pl' ? '0 wpisów (brak pomiaru)' : '0 readings'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Prawa strona: Przycisk akcji */}
                            <div className="flex items-center gap-1 shrink-0 ml-2">
                              {day.hasData ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setExpandedDays((prev) => ({ ...prev, [day.dateStr]: true }));
                                    const el = document.getElementById(`day-card-${day.dateStr}`);
                                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/80 border border-sky-200 dark:border-sky-800 text-[11px] font-bold text-sky-700 dark:text-sky-300 hover:bg-sky-100 transition-colors cursor-pointer"
                                >
                                  {lang === 'pl' ? 'Pokaż' : 'View'}
                                </button>
                              ) : onAddNewToDate ? (
                                <button
                                  type="button"
                                  onClick={() => onAddNewToDate(day.dateStr)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-sky-500 hover:text-white dark:hover:bg-sky-600 text-slate-600 dark:text-slate-300 text-[11px] font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
                                  title={lang === 'pl' ? `Dodaj pomiar: ${day.name} (${day.shortDate})` : 'Add reading'}
                                >
                                  <Plus className="h-3 w-3" />
                                  <span>{lang === 'pl' ? 'Dodaj' : 'Add'}</span>
                                </button>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* PRAWA STRONA: PORY DNIA, SKOK PORANNY I NORMA PTNT */}
                  <div className="lg:col-span-6 xl:col-span-7 space-y-2.5">
                    <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Activity className="h-4 w-4 text-indigo-500 shrink-0" />
                        <span>{lang === 'pl' ? 'Rozkład pór dnia i wskaźniki tygodnia:' : 'Time of Day & Weekly Norms:'}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Rano - Amber / Golden Sunrise */}
                      <div className="bg-amber-50/90 dark:bg-amber-950/60 p-2.5 rounded-xl border-2 border-amber-200 dark:border-amber-800 flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <SunMedium className="h-4 w-4 text-amber-500 shrink-0" />
                          <div className="truncate">
                            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block leading-tight truncate">
                              {t.morningLabel || (lang === 'pl' ? 'Rano' : 'Morning')}
                            </span>
                            <span className="text-[9px] text-amber-700/80 dark:text-amber-400 block leading-none">
                              {weekStats.mCount} {lang === 'pl' ? 'pom.' : 'rd.'}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white shrink-0">
                          {weekStats.mSys ? `${weekStats.mSys}/${weekStats.mDia}` : '--/--'}
                        </span>
                      </div>

                      {/* Wieczór - Twilight Indigo */}
                      <div className="bg-indigo-50/90 dark:bg-indigo-950/60 p-2.5 rounded-xl border-2 border-indigo-200 dark:border-indigo-800 flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Sunset className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <div className="truncate">
                            <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300 block leading-tight truncate">
                              {t.eveningLabel || (lang === 'pl' ? 'Wieczór' : 'Evening')}
                            </span>
                            <span className="text-[9px] text-indigo-700/80 dark:text-indigo-400 block leading-none">
                              {weekStats.eCount} {lang === 'pl' ? 'pom.' : 'rd.'}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white shrink-0">
                          {weekStats.eSys ? `${weekStats.eSys}/${weekStats.eDia}` : '--/--'}
                        </span>
                      </div>

                      {/* Skok poranny (Rano - Wieczór) */}
                      <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Activity className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0" />
                          <div className="truncate">
                            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block leading-tight truncate">
                              {lang === 'pl' ? 'Skok poranny' : 'Morning surge'}
                            </span>
                            <span className="text-[9px] text-slate-500 dark:text-slate-400 block leading-none">
                              {lang === 'pl' ? 'Rano - Wieczór' : 'AM - PM'}
                            </span>
                          </div>
                        </div>
                        <span className={`text-xs sm:text-sm font-black shrink-0 ${
                          weekStats.morningSurge !== null && weekStats.morningSurge >= 15
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-900 dark:text-white'
                        }`}>
                          {weekStats.morningSurge !== null
                            ? `${weekStats.morningSurge >= 0 ? '+' : ''}${weekStats.morningSurge}`
                            : '--'}{' '}
                          <span className="text-[9px] font-normal text-slate-400">mmHg</span>
                        </span>
                      </div>

                      {/* W normie domowej PTNT (<135/85) */}
                      <div className="bg-emerald-50/90 dark:bg-emerald-950/60 p-2.5 rounded-xl border-2 border-emerald-200 dark:border-emerald-800 flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <div className="truncate">
                            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block leading-tight truncate">
                              {lang === 'pl' ? 'W normie PTNT' : 'In PTNT norm'}
                            </span>
                            <span className="text-[9px] text-emerald-700/80 dark:text-emerald-400 block leading-none">
                              &lt;135/85 mmHg
                            </span>
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                          {weekStats.normPercent}%
                        </span>
                      </div>

                      {/* Południe - Azure (tylko jeśli są pomiary) */}
                      {weekStats.nSys !== null && (
                        <div className="bg-sky-50/90 dark:bg-sky-950/60 p-2.5 rounded-xl border-2 border-sky-300 dark:border-sky-700 flex items-center justify-between shadow-2xs col-span-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Sun className="h-4 w-4 text-sky-500 shrink-0" />
                            <span className="text-[11px] font-bold text-sky-800 dark:text-sky-300 truncate">
                              {t.noonLabel || (lang === 'pl' ? 'Południe' : 'Noon')} ({weekStats.nCount} pom.)
                            </span>
                          </div>
                          <span className="text-xs sm:text-sm font-black text-sky-600 dark:text-sky-400 shrink-0">
                            {weekStats.nSys}/{weekStats.nDia}
                          </span>
                        </div>
                      )}

                      {/* Dodatkowy - Violet (tylko jeśli są pomiary) */}
                      {weekStats.xSys && (
                        <div className="bg-purple-50/90 dark:bg-purple-950/60 p-2.5 rounded-xl border-2 border-purple-200 dark:border-purple-800 flex items-center justify-between shadow-2xs col-span-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <PlusCircle className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0" />
                            <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300 truncate">
                              {t.extraLabel || (lang === 'pl' ? 'Dodatkowy' : 'Extra')} ({weekStats.xCount} pom.)
                            </span>
                          </div>
                          <span className="text-xs sm:text-sm font-black text-purple-600 dark:text-purple-400 shrink-0">
                            {weekStats.xSys}/{weekStats.xDia}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* Empty Week State (e.g. after Sunday midnight / fresh week) */}
          {pagedDays.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-sky-200 dark:border-sky-800/80 p-6 sm:p-8 text-center bg-white/70 dark:bg-slate-900/60 shadow-xs space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400">
                <CalendarRange className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                  {daysRange === 7 
                    ? (lang === 'pl' ? `Brak wpisów w wybranym tygodniu (${calendarWeek.startStr} – ${calendarWeek.endStr})` : 'No entries for this week')
                    : (lang === 'pl' ? 'Brak wpisów w wybranym okresie' : 'No entries in this period')}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  {lang === 'pl'
                    ? 'Nowy tydzień resetuje licznik po północy w niedzielę. Kliknij dowolny dzień na pasku u góry lub przycisk poniżej, aby zapisać pierwszy pomiar.'
                    : 'A new week begins after Sunday midnight. Click any day on the strip above or the button below to add your reading.'}
                </p>
              </div>
              {onAddNewToDate && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => onAddNewToDate(new Date().toISOString().split('T')[0])}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs font-black transition-all shadow-sm cursor-pointer active:scale-95"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{lang === 'pl' ? 'Wprowadź dzisiejszy pomiar' : 'Add measurement'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Each Day Card - Prominent, High Contrast on Mobile */}
          {pagedDays.map((day) => {
            const isExpanded = !!expandedDays[day.date];
            const displayedItems = isExpanded ? day.items : day.items.slice(0, 3);
            const hasMore = day.items.length > 3;

            return (
              <div
                key={day.date}
                id={`day-card-${day.date}`}
                className="overflow-hidden rounded-2xl border-2 border-slate-200/90 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-sm scroll-mt-20 border-l-4 border-l-sky-500"
              >
                {/* Day Header Bar: Clickable to enter day details */}
                <div
                  className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/90 px-3 py-2 sm:px-4 sm:py-2.5 dark:border-slate-800/80 dark:bg-slate-800/50 cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800/80 transition-colors"
                  onClick={() => setSelectedDayDetail(day)}
                  title={lang === 'pl' ? 'Kliknij, aby otworzyć szczegóły tego dnia' : 'Click to view day details'}
                >
                  <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                    {/* Single 1-letter of the week badge: P, W, Ś, C, P, S, N */}
                    <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white font-black text-xs sm:text-sm shadow-xs shadow-sky-500/30">
                      {day.dayLetter}
                    </span>
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2 min-w-0">
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                        {day.displayDate}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
                        <span>{t.avgLabel || 'Śr'}: <strong className="text-slate-800 dark:text-slate-200">{day.avgSys}/{day.avgDia}</strong> mmHg</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-0.5 text-rose-600 dark:text-rose-400">
                          <HeartPulse className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          <strong>{day.avgPulse}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Compact action buttons */}
                  <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {/* Small button showing number of readings that opens day details */}
                    <button
                      type="button"
                      onClick={() => setSelectedDayDetail(day)}
                      className="inline-flex items-center gap-1 rounded-lg bg-sky-50 border-2 border-sky-200 px-2 py-1 text-xs font-black text-sky-800 dark:bg-sky-950/80 dark:border-sky-700 dark:text-sky-200 hover:bg-sky-100 dark:hover:bg-sky-900 cursor-pointer shadow-2xs transition-colors"
                      title={lang === 'pl' ? 'Kliknij, aby wejść w ten dzień i zobaczyć wszystkie pomiary' : 'View all day readings'}
                    >
                      <Layers className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                      <span>{day.items.length}</span>
                    </button>

                    {/* Inline Clear Day or Small Trash icon */}
                    {confirmingClearDate === day.date ? (
                      <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-700 rounded-lg px-2 py-0.5 animate-in fade-in shadow-2xs">
                        <span className="text-[10px] font-black text-rose-700 dark:text-rose-300 whitespace-nowrap">
                          {lang === 'pl' ? 'Usunąć dzień?' : 'Clear day?'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            day.items.forEach((it) => onDelete(it.id));
                            setConfirmingClearDate(null);
                          }}
                          className="inline-flex items-center gap-0.5 text-[10px] font-black bg-rose-600 hover:bg-rose-700 text-white rounded px-1.5 py-0.5 cursor-pointer transition-colors shadow-2xs"
                        >
                          <Check className="h-3 w-3" />
                          <span>{lang === 'pl' ? 'Tak' : 'Yes'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingClearDate(null)}
                          className="inline-flex items-center text-[10px] font-bold text-slate-500 hover:text-slate-700 dark:text-slate-300 px-1 py-0.5 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmingClearDate(day.date)}
                        className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 cursor-pointer transition-colors"
                        title={lang === 'pl' ? 'Usuń wszystkie pomiary z tego dnia' : 'Clear all readings from this day'}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {/* Small compact plus icon button to add new measurement to this specific day */}
                    {onAddNewToDate && (
                      <button
                        type="button"
                        onClick={() => onAddNewToDate(day.date)}
                        className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-xs shadow-sky-500/25 hover:from-sky-400 hover:to-blue-500 cursor-pointer transition-all active:scale-95"
                        title={lang === 'pl' ? 'Dodaj kolejny pomiar do tego dnia' : 'Add measurement to this day'}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Measurements for this day: Full width on phones, LCD Blood Pressure Monitor cards */}
                <div className="p-2.5 sm:p-3.5 space-y-2.5">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                    {displayedItems.map((item) => {
                      const periodInfo = getPeriodBadge(item.period, item.time);
                      return (
                        <BloodPressureMonitorCard
                          key={item.id}
                          item={item}
                          lang={lang}
                          onDelete={onDelete}
                          onEdit={onEdit}
                          periodLabel={periodInfo.label}
                          periodIcon={periodInfo.icon}
                          periodBg={periodInfo.bg}
                        />
                      );
                    })}
                  </div>

                  {/* Expand / Collapse toggle if more than 3 measurements */}
                  {hasMore && (
                    <button
                      type="button"
                      onClick={() => toggleExpandDay(day.date)}
                      className="w-full py-2 px-3 rounded-xl border-2 border-sky-200/80 dark:border-sky-800/60 bg-sky-50/60 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-colors cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          <span>{lang === 'pl' ? 'Zwiń do 3 pomiarów' : 'Collapse to 3 readings'}</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          <span>
                            {lang === 'pl'
                              ? `Rozwiń pozostałe pomiary (${day.items.length - 3} więcej)`
                              : `Show remaining readings (${day.items.length - 3} more)`}
                          </span>
                        </>
                      )}
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      ) : (

        /* FLAT LIST VIEW - Enhanced Larger Cards */
        <div className="space-y-2">
          {filtered.slice((currentPage - 1) * 8, currentPage * 8).map((item) => {
            const classification = classifyBloodPressure(item.systolic, item.diastolic, lang);
            const periodInfo = getPeriodBadge(item.period, item.time);

            return (
              <div
                key={item.id}
                className="rounded-2xl border-2 border-slate-200/90 bg-white p-2.5 sm:p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 hover:shadow-sm"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="rounded-xl bg-sky-50 dark:bg-sky-950/70 p-1.5 sm:p-2 text-center min-w-[52px] sm:min-w-[58px] border-2 border-sky-200 dark:border-sky-800 shrink-0">
                    <div className="flex items-center justify-center gap-0.5 text-[10px] font-bold text-sky-800 dark:text-sky-300 truncate">
                      {periodInfo.icon}
                      <span>{item.period === 'morning' ? (t.morningLabel || 'Rano') : item.period === 'noon' ? (t.noonLabel || 'Poł.') : (t.eveningLabel || 'Wiecz.')}</span>
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-slate-100 block mt-0.5 font-mono">
                      {item.time}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
                      <span className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                        {item.systolic} / {item.diastolic}
                      </span>
                      <span className="text-[10px] sm:text-xs font-bold text-slate-400">mmHg</span>
                      {item.pulse && (
                        <span className="ml-1 inline-flex items-center gap-1 text-xs sm:text-sm font-black text-rose-600 dark:text-rose-400 font-mono">
                          <HeartPulse className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                          {item.pulse} bpm
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      <span className="font-semibold">{item.date}</span>
                      {item.notes && <span className="ml-1.5 italic">„{item.notes}”</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/60">
                  <span className={`inline-flex items-center gap-1 rounded-lg px-2 sm:px-2.5 py-0.5 sm:py-1 text-xs font-bold border truncate ${classification.badgeClass}`}>
                    {getClassificationIcon(classification.level)}
                    <span className="truncate max-w-[170px] sm:max-w-none">{classification.label}</span>
                  </span>
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-950/50 cursor-pointer transition-colors"
                      title="Edytuj wpis"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  {deletingItemId === item.id ? (
                    <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-700 rounded-lg px-2 py-0.5 animate-in fade-in zoom-in-95 shadow-2xs">
                      <span className="text-[10px] font-black text-rose-700 dark:text-rose-300 whitespace-nowrap">
                        {lang === 'pl' ? 'Usunąć?' : 'Delete?'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onDelete(item.id);
                          setDeletingItemId(null);
                        }}
                        className="inline-flex items-center gap-0.5 text-[10px] font-black bg-rose-600 hover:bg-rose-700 text-white rounded px-1.5 py-0.5 cursor-pointer transition-colors shadow-2xs"
                        title="Potwierdź usunięcie"
                      >
                        <Check className="h-3 w-3" />
                        <span>{lang === 'pl' ? 'Tak' : 'Yes'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingItemId(null)}
                        className="inline-flex items-center text-[10px] font-bold text-slate-500 hover:text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded px-1 py-0.5 cursor-pointer"
                        title="Anuluj"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeletingItemId(item.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 cursor-pointer transition-colors"
                      title="Usuń wpis"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      )}

      {/* Pagination Controls */}
      {viewMode === 'groupedDays' && totalDayPages > 1 && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
          <button
            type="button"
            disabled={validDayPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>
              {daysRange === 7 
                ? (t.pagePrevWeek || (lang === 'pl' ? 'Poprzedni tydzień' : 'Previous week'))
                : t.pagePrev}
            </span>
          </button>

          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
            {daysRange === 7
              ? `${t.weekLabel || (lang === 'pl' ? 'Tydzień' : 'Week')} ${validDayPage} / ${totalDayPages}`
              : t.pageOf.replace('{current}', String(validDayPage)).replace('{total}', String(totalDayPages))}
          </span>

          <button
            type="button"
            disabled={validDayPage >= totalDayPages}
            onClick={() => setCurrentPage((p) => Math.min(totalDayPages, p + 1))}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <span>
              {daysRange === 7 
                ? (t.pageNextWeek || (lang === 'pl' ? 'Kolejny tydzień' : 'Next week'))
                : t.pageNext}
            </span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Day Detail Modal for full day inspection and adding additional measurements */}
      {selectedDayDetail && (
        <DayDetailModal
          isOpen={!!selectedDayDetail}
          onClose={() => setSelectedDayDetail(null)}
          date={selectedDayDetail.date}
          displayDate={selectedDayDetail.displayDate}
          dayLetter={selectedDayDetail.dayLetter}
          items={measurements.filter((m) => m.date === selectedDayDetail.date)}
          onDelete={onDelete}
          onEdit={onEdit}
          onAddNewToDate={(dt) => {
            setSelectedDayDetail(null);
            if (onAddNewToDate) {
              onAddNewToDate(dt);
            }
          }}
          lang={lang}
          getPeriodBadge={getPeriodBadge}
        />
      )}

    </div>
  );
};
