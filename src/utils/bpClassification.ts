import { BPClassification, BPLevel, Language } from '../types';
import { translations } from '../i18n';

export function classifyBloodPressure(systolic: number, diastolic: number, lang: Language = 'pl'): BPClassification {
  const t = translations[lang] || translations.pl;

  // Hypotension
  if (systolic < 90 || diastolic < 60) {
    return {
      level: 'hypotension',
      label: t.catHypo,
      color: 'text-sky-700 dark:text-sky-300',
      badgeClass: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
      bgLight: 'bg-sky-50 dark:bg-sky-950/30',
      borderClass: 'border-sky-300 dark:border-sky-800',
      advice: t.catHypoDesc,
      icon: 'ArrowDownCircle',
    };
  }

  // Grade 3 Hypertension (Severe / Crisis)
  if (systolic >= 180 || diastolic >= 110) {
    return {
      level: 'hypertension_3',
      label: t.catHyper3,
      color: 'text-rose-700 dark:text-rose-400',
      badgeClass: 'bg-rose-100 text-rose-900 border-rose-400 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-700',
      bgLight: 'bg-rose-50 dark:bg-rose-950/40',
      borderClass: 'border-rose-400 dark:border-rose-800',
      advice: t.catHyper3Desc,
      icon: 'AlertTriangle',
    };
  }

  // Grade 2 Hypertension (Moderate)
  if (systolic >= 160 || diastolic >= 100) {
    return {
      level: 'hypertension_2',
      label: t.catHyper2,
      color: 'text-amber-700 dark:text-amber-300',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-400 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700',
      bgLight: 'bg-amber-50 dark:bg-amber-950/30',
      borderClass: 'border-amber-300 dark:border-amber-800',
      advice: t.catHyper2Desc,
      icon: 'AlertCircle',
    };
  }

  // Grade 1 Hypertension (Mild)
  if (systolic >= 140 || diastolic >= 90) {
    return {
      level: 'hypertension_1',
      label: t.catHyper1,
      color: 'text-orange-700 dark:text-orange-300',
      badgeClass: 'bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-700',
      bgLight: 'bg-orange-50 dark:bg-orange-950/30',
      borderClass: 'border-orange-300 dark:border-orange-800',
      advice: t.catHyper1Desc,
      icon: 'Info',
    };
  }

  // High Normal
  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 85 && diastolic <= 89)) {
    return {
      level: 'high_normal',
      label: t.catHighNormal,
      color: 'text-yellow-700 dark:text-yellow-300',
      badgeClass: 'bg-yellow-100 text-yellow-900 border-yellow-300 dark:bg-yellow-950/60 dark:text-yellow-300 dark:border-yellow-700',
      bgLight: 'bg-yellow-50 dark:bg-yellow-950/30',
      borderClass: 'border-yellow-300 dark:border-yellow-800',
      advice: t.catHighNormalDesc,
      icon: 'CheckCircle2',
    };
  }

  // Normal
  if ((systolic >= 120 && systolic <= 129) || (diastolic >= 80 && diastolic <= 84)) {
    return {
      level: 'normal',
      label: t.catNormal,
      color: 'text-emerald-700 dark:text-emerald-300',
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700',
      bgLight: 'bg-emerald-50 dark:bg-emerald-950/30',
      borderClass: 'border-emerald-300 dark:border-emerald-800',
      advice: t.catNormalDesc,
      icon: 'CheckCircle',
    };
  }

  // Optimal (<120 and <80)
  return {
    level: 'optimal',
    label: t.catOptimal,
    color: 'text-teal-700 dark:text-teal-300',
    badgeClass: 'bg-teal-100 text-teal-900 border-teal-300 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-700',
    bgLight: 'bg-teal-50 dark:bg-teal-950/30',
    borderClass: 'border-teal-300 dark:border-teal-800',
    advice: t.catOptimalDesc,
    icon: 'HeartHandshake',
  };
}
