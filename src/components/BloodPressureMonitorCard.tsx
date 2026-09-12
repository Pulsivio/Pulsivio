import React, { useState } from 'react';
import { HeartPulse, Trash2, Pencil, Clock, Activity, AlertTriangle, AlertCircle, Info, CheckCircle, CheckCircle2, HeartHandshake, ArrowDownCircle, Check, X } from 'lucide-react';
import { Measurement, Language } from '../types';
import { classifyBloodPressure } from '../utils/bpClassification';
import { translations } from '../i18n';

interface BloodPressureMonitorCardProps {
  item: Measurement;
  lang: Language;
  onDelete: (id: string) => void;
  onEdit?: (item: Measurement) => void;
  periodLabel: string;
  periodIcon: React.ReactNode;
  periodBg: string;
}

export const BloodPressureMonitorCard: React.FC<BloodPressureMonitorCardProps> = ({
  item,
  lang,
  onDelete,
  onEdit,
  periodLabel,
  periodIcon,
  periodBg,
}) => {
  const t = translations[lang] || translations.pl;
  const classification = classifyBloodPressure(item.systolic, item.diastolic, lang);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Determine WHO traffic light scale position (0 = bottom green, 1 = yellow, 2 = orange, 3 = red)
  // as seen on Microlife / Omron blood pressure monitor left bezel
  const getWhoLevelIndex = () => {
    switch (classification.level) {
      case 'hypertension_3':
      case 'hypertension_2':
        return 3; // Red
      case 'hypertension_1':
        return 2; // Orange
      case 'high_normal':
        return 1; // Yellow
      case 'normal':
      case 'optimal':
      case 'hypotension':
      default:
        return 0; // Green
    }
  };

  const whoIndex = getWhoLevelIndex();

  const getClassificationIcon = (level: string) => {
    switch (level) {
      case 'hypertension_3':
        return <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />;
      case 'hypertension_2':
        return <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />;
      case 'hypertension_1':
        return <Info className="h-4 w-4 shrink-0 text-orange-600 dark:text-orange-400" />;
      case 'high_normal':
        return <CheckCircle2 className="h-4 w-4 shrink-0 text-yellow-600 dark:text-yellow-400" />;
      case 'normal':
        return <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />;
      case 'optimal':
        return <HeartHandshake className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />;
      case 'hypotension':
        return <ArrowDownCircle className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />;
      default:
        return <Activity className="h-4 w-4 shrink-0 text-slate-500" />;
    }
  };

  const getPeriodStripe = () => {
    switch (item.period) {
      case 'morning':
        return 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500';
      case 'noon':
        return 'bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500';
      case 'evening':
        return 'bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600';
      case 'extra':
      case 'night':
        return 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500';
      default:
        return 'bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-700 dark:to-slate-600';
    }
  };

  return (
    <div
      className={`w-full rounded-2xl border-2 transition-all shadow-xs hover:shadow-md overflow-hidden bg-white dark:bg-slate-900 ${classification.borderClass}`}
    >
      {/* Time-of-day Period Visual Color Stripe */}
      <div className={`h-1 w-full ${getPeriodStripe()}`} />

      {/* Top Header Bar: Period, Time (like TIME 17:40 on Microlife), Arm and Action */}
      <div className="flex items-center justify-between gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-slate-50/95 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] sm:text-xs font-black shrink-0 ${periodBg}`}>
            {periodIcon}
            <span>{periodLabel}</span>
          </span>

          {item.time ? (
            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 font-mono shrink-0">
              <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400" />
              <span>{item.time}</span>
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {item.arm && (
            <span
              className="text-[10px] sm:text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-600"
              title={item.arm === 'left' ? 'Lewe ramię' : 'Prawe ramię'}
            >
              {item.arm === 'left' ? 'L' : 'P'}
            </span>
          )}

          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(item)}
              className="rounded-lg p-1 text-slate-400 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-950/80 transition-colors cursor-pointer"
              title="Edytuj ten pomiar"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}

          {isConfirmingDelete ? (
            <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-700 rounded-lg px-2 py-0.5 animate-in fade-in zoom-in-95 shadow-2xs">
              <span className="text-[10px] font-black text-rose-700 dark:text-rose-300 whitespace-nowrap">
                {lang === 'pl' ? 'Usunąć?' : 'Delete?'}
              </span>
              <button
                type="button"
                onClick={() => {
                  onDelete(item.id);
                  setIsConfirmingDelete(false);
                }}
                className="inline-flex items-center gap-0.5 text-[10px] font-black bg-rose-600 hover:bg-rose-700 text-white rounded px-1.5 py-0.5 cursor-pointer transition-colors shadow-2xs"
                title="Potwierdź usunięcie"
              >
                <Check className="h-3 w-3" />
                <span>{lang === 'pl' ? 'Tak' : 'Yes'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="inline-flex items-center text-[10px] font-bold text-slate-500 hover:text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded px-1 py-0.5 cursor-pointer"
                title="Anuluj"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(true)}
              className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/80 transition-colors cursor-pointer"
              title={t.deleteEntryTooltip || 'Usuń wpis'}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main LCD Screen Area - Exactly like a real medical blood pressure monitor */}
      <div className="p-2.5 sm:p-3.5 bg-gradient-to-b from-slate-50/90 via-white to-slate-50/60 dark:from-slate-900/90 dark:via-slate-900 dark:to-slate-950/90">
        <div className="flex items-stretch gap-2.5 sm:gap-3">
          
          {/* Left WHO Traffic Light Bar - Fully Self-Contained, No Overlapping Elements */}
          <div className="flex flex-col justify-between items-center py-0.5 select-none shrink-0 w-2.5 sm:w-3">
            {/* Zone 3: Red (Nadciśnienie II/III) */}
            <div
              className={`w-full flex-1 rounded-t-sm transition-all my-0.5 ${
                whoIndex === 3
                  ? 'bg-rose-600 ring-2 ring-rose-400 shadow-xs'
                  : 'bg-rose-200/70 dark:bg-rose-950/40'
              }`}
              title="Nadciśnienie II/III st."
            />

            {/* Zone 2: Orange (Nadciśnienie I) */}
            <div
              className={`w-full flex-1 transition-all my-0.5 ${
                whoIndex === 2
                  ? 'bg-orange-500 ring-2 ring-orange-400 shadow-xs'
                  : 'bg-orange-200/70 dark:bg-orange-950/40'
              }`}
              title="Nadciśnienie I st."
            />

            {/* Zone 1: Yellow (Wysokie prawidłowe) */}
            <div
              className={`w-full flex-1 transition-all my-0.5 ${
                whoIndex === 1
                  ? 'bg-amber-400 ring-2 ring-amber-300 shadow-xs'
                  : 'bg-amber-200/70 dark:bg-amber-950/40'
              }`}
              title="Wysokie prawidłowe"
            />

            {/* Zone 0: Green (Prawidłowe / Optymalne) */}
            <div
              className={`w-full flex-1 rounded-b-sm transition-all my-0.5 ${
                whoIndex === 0
                  ? 'bg-emerald-500 ring-2 ring-emerald-400 shadow-xs'
                  : 'bg-emerald-200/70 dark:bg-emerald-950/40'
              }`}
              title="Prawidłowe / Optymalne"
            />
          </div>

          {/* Main Digits Column: 1. SYS, 2. DIA, 3. PUL - Distinct, Perfectly Sized for Mobile & Desktop */}
          <div className="flex-1 flex flex-col justify-center space-y-1.5 min-w-0">
            
            {/* ROW 1: SYS (Skurczowe) */}
            <div className="flex items-center justify-between px-2 sm:px-2.5 py-1.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-xl sm:text-2xl lg:text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white leading-none">
                {item.systolic}
              </span>
              <div className="flex items-center gap-1.5 text-right shrink-0">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200/80 dark:bg-slate-700 text-[10px] font-black text-slate-700 dark:text-slate-300">
                  1
                </span>
                <div className="min-w-[40px] text-right">
                  <span className="block text-xs font-black tracking-wider text-slate-700 dark:text-slate-200 leading-tight">
                    SYS.
                  </span>
                  <span className="block text-[9px] sm:text-[10px] font-semibold text-slate-400 dark:text-slate-500 leading-none">
                    mmHg
                  </span>
                </div>
              </div>
            </div>

            {/* ROW 2: DIA (Rozkurczowe) */}
            <div className="flex items-center justify-between px-2 sm:px-2.5 py-1.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-xl sm:text-2xl lg:text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white leading-none">
                {item.diastolic}
              </span>
              <div className="flex items-center gap-1.5 text-right shrink-0">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200/80 dark:bg-slate-700 text-[10px] font-black text-slate-700 dark:text-slate-300">
                  2
                </span>
                <div className="min-w-[40px] text-right">
                  <span className="block text-xs font-black tracking-wider text-slate-700 dark:text-slate-200 leading-tight">
                    DIA.
                  </span>
                  <span className="block text-[9px] sm:text-[10px] font-semibold text-slate-400 dark:text-slate-500 leading-none">
                    mmHg
                  </span>
                </div>
              </div>
            </div>

            {/* ROW 3: PUL (Puls) */}
            <div className="flex items-center justify-between px-2 sm:px-2.5 py-1.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/50">
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl lg:text-3xl font-black font-mono tracking-tight text-rose-600 dark:text-rose-400 leading-none">
                  {item.pulse || '--'}
                </span>
                <HeartPulse className="h-3.5 w-3.5 text-rose-500 fill-rose-500/20" />
              </div>
              <div className="flex items-center gap-1.5 text-right shrink-0">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-900/70 text-[10px] font-black text-rose-700 dark:text-rose-300">
                  3
                </span>
                <div className="min-w-[40px] text-right">
                  <span className="block text-xs font-black tracking-wider text-rose-600 dark:text-rose-400 leading-tight">
                    PUL.
                  </span>
                  <span className="block text-[9px] sm:text-[10px] font-semibold text-slate-400 dark:text-slate-500 leading-none">
                    /min
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Bottom Diagnosis and Details Bar */}
      <div className="px-2.5 py-2 sm:px-3 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-1.5">
          <span className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-xs font-bold border ${classification.badgeClass}`}>
            {getClassificationIcon(classification.level)}
            <span className="leading-tight">{classification.label}</span>
          </span>

          {item.bloodSugar && (
            <span className="shrink-0 text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-lg border border-sky-200 dark:border-sky-800">
              Cukier: <strong>{item.bloodSugar}</strong> mg/dL
            </span>
          )}
        </div>

        {/* Reassuring Clinical Interpretation Pill */}
        <div className="flex items-start gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700/80 text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
          <Info className="h-3.5 w-3.5 text-sky-500 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <span className="font-bold text-slate-900 dark:text-white">
              {classification.level === 'optimal'
                ? '💚 Doskonałe ciśnienie!'
                : classification.level === 'normal'
                ? '✅ Prawidłowe ciśnienie!'
                : classification.level === 'high_normal'
                ? '⚠️ Wysokie prawidłowe:'
                : classification.level === 'hypertension_1'
                ? '🟠 Łagodne nadciśnienie (I st.):'
                : classification.level === 'hypertension_2'
                ? '🔴 Nadciśnienie umiarkowane (II st.):'
                : classification.level === 'hypertension_3'
                ? '🚨 Bardzo wysokie ciśnienie:'
                : '💧 Niskie ciśnienie:'}
            </span>{' '}
            <span>
              {classification.level === 'optimal'
                ? 'Wzorcowe dla serca i naczyń (< 120/80 mmHg).'
                : classification.level === 'normal'
                ? 'Mieszczące się w normie zdrowego człowieka (120-129 / 80-84 mmHg).'
                : classification.level === 'high_normal'
                ? 'Granica normy (130-139 / 85-89 mmHg). Odpocznij i ogranicz sól.'
                : classification.level === 'hypertension_1'
                ? 'Jeśli wynik powtarza się w kolejnych dniach, powiadom lekarza.'
                : classification.level === 'hypertension_2'
                ? 'Zalecana konsultacja ze specjalistą i kontrola leków.'
                : classification.level === 'hypertension_3'
                ? 'Odpocznij 15 min w ciszy. W razie duszności lub bólu wezwij pomoc.'
                : 'Pij płyny, odpocznij i unikaj nagłego wstawania.'}
            </span>
          </div>
        </div>

        {/* Tags if any */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {item.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Notes if any */}
        {item.notes && (
          <p className="text-xs italic text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 p-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80 break-words mt-1">
            „{item.notes}”
          </p>
        )}
      </div>
    </div>
  );
};
