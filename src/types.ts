export type Period = 'rano' | 'poludnie' | 'wieczor' | 'dodatkowy';

export interface Measurement {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  period: Period;
  systolic: number;  // SYS (skurczowe)
  diastolic: number; // DIA (rozkurczowe)
  pulse: number;     // Puls (bpm)
  arm?: 'lewa' | 'prawa' | 'left' | 'right';
  arrhythmia?: boolean;
  medsTaken?: boolean;
  feeling?: 'dobre' | 'normal' | 'slabe' | 'stres';
  tags?: string[];
  notes?: string;
  createdAt: number;
}

export type PTNTCategory =
  | 'optymalne'
  | 'prawidlowe'
  | 'wysokie_prawidlowe'
  | 'nadcisnienie_1'
  | 'nadcisnienie_2'
  | 'nadcisnienie_3'
  | 'izolowane_skurczowe'
  | 'niskie';

export interface PTNTInfo {
  category: PTNTCategory;
  label: string;
  shortLabel: string;
  advice: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  badgeClass: string;
  isNormalHome: boolean; // < 135/85 mmHg wg PTNT pomiary domowe
}

export function getPTNTClassification(sys: number, dia: number): PTNTInfo {
  // Niedociśnienie (niskie)
  if (sys < 90 || dia < 60) {
    return {
      category: 'niskie',
      label: 'Niskie ciśnienie (hipotonia)',
      shortLabel: 'Hipotonia',
      advice: 'Niskie ciśnienie. Wypij szklankę wody lub herbaty i usiądź wygodnie.',
      colorClass: 'text-sky-400',
      bgClass: 'bg-sky-950/40',
      borderClass: 'border-sky-600/40',
      badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      isNormalHome: true,
    };
  }
  // Izolowane skurczowe
  if (sys >= 140 && dia < 90) {
    return {
      category: 'izolowane_skurczowe',
      label: 'Izolowane nadciśnienie skurczowe',
      shortLabel: 'Izolowane skurcz.',
      advice: 'Częste u seniorów ze względu na sztywność naczyń. Skonsultuj wynik z lekarzem.',
      colorClass: 'text-amber-400',
      bgClass: 'bg-amber-950/40',
      borderClass: 'border-amber-600/40',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      isNormalHome: false,
    };
  }
  // Nadciśnienie 3. stopnia
  if (sys >= 180 || dia >= 110) {
    return {
      category: 'nadcisnienie_3',
      label: 'Nadciśnienie tętnicze 3. stopnia',
      shortLabel: 'Nadciśnienie st. 3',
      advice: 'Bardzo wysokie ciśnienie! Usiądź, zachowaj spokój. W razie złego samopoczucia wezwij pomoc (112).',
      colorClass: 'text-red-400',
      bgClass: 'bg-red-950/40',
      borderClass: 'border-red-600/50',
      badgeClass: 'bg-red-500/25 text-red-300 border-red-500/40',
      isNormalHome: false,
    };
  }
  // Nadciśnienie 2. stopnia
  if (sys >= 160 || dia >= 100) {
    return {
      category: 'nadcisnienie_2',
      label: 'Nadciśnienie tętnicze 2. stopnia',
      shortLabel: 'Nadciśnienie st. 2',
      advice: 'Umiarkowane nadciśnienie. Skontaktuj się z lekarzem w celu oceny terapii.',
      colorClass: 'text-orange-400',
      bgClass: 'bg-orange-950/40',
      borderClass: 'border-orange-600/40',
      badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      isNormalHome: false,
    };
  }
  // Nadciśnienie 1. stopnia (≥140 lub ≥90)
  if (sys >= 140 || dia >= 90) {
    return {
      category: 'nadcisnienie_1',
      label: 'Nadciśnienie tętnicze 1. stopnia',
      shortLabel: 'Nadciśnienie st. 1',
      advice: 'Łagodne nadciśnienie. Zadbaj o regularne pomiary rano i wieczorem oraz konsultację.',
      colorClass: 'text-amber-400',
      bgClass: 'bg-amber-950/40',
      borderClass: 'border-amber-500/40',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      isNormalHome: false,
    };
  }
  // Wysokie prawidłowe (130-139 lub 85-89)
  if (sys >= 130 || dia >= 85) {
    return {
      category: 'wysokie_prawidlowe',
      label: 'Wysokie prawidłowe',
      shortLabel: 'Wysokie prawid.',
      advice: 'Górna granica normy. Ogranicz sól, stres i odpocznij przed kolejnym pomiarem.',
      colorClass: 'text-yellow-300',
      bgClass: 'bg-yellow-950/40',
      borderClass: 'border-yellow-600/40',
      badgeClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      isNormalHome: sys < 135 && dia < 85,
    };
  }
  // Prawidłowe (120-129 lub 80-84)
  if (sys >= 120 || dia >= 80) {
    return {
      category: 'prawidlowe',
      label: 'Prawidłowe ciśnienie',
      shortLabel: 'Prawidłowe',
      advice: 'Prawidłowy wynik! Twoje serce i naczynia pracują stabilnie.',
      colorClass: 'text-emerald-400',
      bgClass: 'bg-emerald-950/30',
      borderClass: 'border-emerald-600/30',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      isNormalHome: true,
    };
  }
  // Optymalne (<120 i <80)
  return {
    category: 'optymalne',
    label: 'Optymalne ciśnienie',
    shortLabel: 'Optymalne',
    advice: 'Doskonały wynik! Wzorcowe parametry układu krążenia.',
    colorClass: 'text-emerald-400',
    bgClass: 'bg-emerald-950/40',
    borderClass: 'border-emerald-500/40',
    badgeClass: 'bg-emerald-500/25 text-emerald-300 border-emerald-500/30',
    isNormalHome: true,
  };
}

export interface PatientProfile {
  name: string;
  birthYear?: string | number;
  weight?: string;
  doctorName?: string;
  doctorEmail?: string;
  clinicName?: string;
  medications?: string;
  notesForDoctor?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  deviceSyncCode?: string;
  caregivers?: Array<{ id?: string; name: string; phone: string; relation: string; isPrimary?: boolean }>;
  googleAccount?: { email: string; name: string; picture?: string; connectedAt?: string } | null;
  isProUser?: boolean;
  proActivatedAt?: string;
}

export interface CertifiedDevice {
  id: string;
  brand: string;
  name: string;
  category: 'popular' | 'budget' | 'under70' | 'under130' | 'under200' | 'premium' | string;
  badge: string;
  badgeColor: string;
  cuffType: string;
  priceEstimate: string;
  priceValue: number;
  accuracyRating: string;
  keyFeatures: string[];
  seniorFriendlyNote: string;
  affiliateUrl: string;
}
