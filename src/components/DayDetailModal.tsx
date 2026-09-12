import React, { useState } from 'react';
import { X, Plus, Calendar, Activity, HeartPulse, Stethoscope, Clock, Trash2, Check } from 'lucide-react';
import { Measurement, Language } from '../types';
import { translations } from '../i18n';
import { BloodPressureMonitorCard } from './BloodPressureMonitorCard';

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  displayDate: string;
  dayLetter: string;
  items: Measurement[];
  onDelete: (id: string) => void;
  onEdit?: (item: Measurement) => void;
  onAddNewToDate: (date: string) => void;
  lang: Language;
  getPeriodBadge: (period: string, time: string) => { label: string; icon: React.ReactNode; bg: string };
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  isOpen,
  onClose,
  date,
  displayDate,
  dayLetter,
  items,
  onDelete,
  onEdit,
  onAddNewToDate,
  lang,
  getPeriodBadge,
}) => {
  if (!isOpen) return null;

  const t = translations[lang] || translations.pl;
  const [confirmClearDay, setConfirmClearDay] = useState(false);

  // Calculate day stats
  const avgSys = items.length > 0 ? Math.round(items.reduce((s, m) => s + m.systolic, 0) / items.length) : 0;
  const avgDia = items.length > 0 ? Math.round(items.reduce((s, m) => s + m.diastolic, 0) / items.length) : 0;
  const pulseItems = items.filter((m) => m.pulse);
  const avgPulse = pulseItems.length > 0 ? Math.round(pulseItems.reduce((s, m) => s + (m.pulse || 0), 0) / pulseItems.length) : 0;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border-2 border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white font-black text-sm shadow-xs shadow-sky-500/30">
              {dayLetter}
            </span>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                {displayDate}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {items.length}{' '}
                {items.length === 1
                  ? (t.singleReadingLabel || (lang === 'pl' ? 'pomiar' : 'reading'))
                  : (t.readingsPluralLabel || (lang === 'pl' ? (items.length < 5 ? 'pomiary' : 'pomiarów') : 'readings'))}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {items.length > 0 && (
              confirmClearDay ? (
                <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-700 rounded-xl px-2 py-1 shadow-2xs animate-in fade-in">
                  <span className="text-[11px] font-black text-rose-700 dark:text-rose-300">
                    {lang === 'pl' ? 'Wyczyścić cały dzień?' : 'Clear all day?'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      items.forEach((it) => onDelete(it.id));
                      setConfirmClearDay(false);
                    }}
                    className="inline-flex items-center gap-0.5 text-[10px] font-black bg-rose-600 hover:bg-rose-700 text-white rounded-lg px-2 py-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Check className="h-3 w-3" />
                    <span>{lang === 'pl' ? 'Tak, usuń' : 'Yes'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClearDay(false)}
                    className="text-[10px] font-bold text-slate-500 hover:text-slate-700 dark:text-slate-300 px-1 py-1 cursor-pointer"
                  >
                    {lang === 'pl' ? 'Nie' : 'No'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClearDay(true)}
                  className="inline-flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/60 dark:hover:text-rose-300 text-slate-600 dark:text-slate-300 px-2.5 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                  title={lang === 'pl' ? 'Usuń wszystkie pomiary z tego dnia' : 'Clear all measurements from this day'}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">{lang === 'pl' ? 'Wyczyść dzień' : 'Clear day'}</span>
                </button>
              )
            )}

            <button
              type="button"
              onClick={() => {
                onAddNewToDate(date);
                onClose();
              }}
              className="inline-flex items-center gap-1 rounded-xl bg-sky-500 hover:bg-sky-600 text-white px-2.5 py-1.5 text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Dodaj pomiar</span>
              <span className="sm:hidden">Dodaj</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Day Summary Highlights */}
        {items.length > 0 && (
          <div className="grid grid-cols-3 gap-2 p-3 sm:px-4 bg-sky-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 text-center shrink-0">
            <div className="bg-white dark:bg-slate-800/80 p-2 rounded-xl border border-sky-100 dark:border-slate-700">
              <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300 block">Śr. ciśnienie</span>
              <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono">
                {avgSys}/{avgDia} <span className="text-[9px] font-normal text-slate-400">mmHg</span>
              </span>
            </div>

            <div className="bg-white dark:bg-slate-800/80 p-2 rounded-xl border border-rose-100 dark:border-slate-700">
              <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 block">Śr. puls</span>
              <span className="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400 font-mono">
                {avgPulse || '--'} <span className="text-[9px] font-normal text-slate-400">bpm</span>
              </span>
            </div>

            <div className="bg-white dark:bg-slate-800/80 p-2 rounded-xl border border-purple-100 dark:border-slate-700">
              <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 block">Pomiary</span>
              <span className="text-sm sm:text-base font-black text-purple-700 dark:text-purple-300 font-mono">
                {items.length}
              </span>
            </div>
          </div>
        )}

        {/* Scrollable list of full-width monitor cards */}
        <div className="p-3 sm:p-4 space-y-3 overflow-y-auto flex-1">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                Brak pomiarów dla tego dnia.
              </p>
              <button
                type="button"
                onClick={() => {
                  onAddNewToDate(date);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 text-white px-4 py-2 text-sm font-bold shadow-xs cursor-pointer hover:bg-sky-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Dodaj pierwszy pomiar</span>
              </button>
            </div>
          ) : (
            items.map((item) => {
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
            })
          )}
        </div>

        {/* Footer with Quick Add Button */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/60 flex items-center justify-between gap-2 shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {date}
          </span>
          <button
            type="button"
            onClick={() => {
              onAddNewToDate(date);
              onClose();
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white px-4 py-2 text-xs sm:text-sm font-bold shadow-sm cursor-pointer transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Dodaj kolejny pomiar do tego dnia</span>
          </button>
        </div>

      </div>
    </div>
  );
};
