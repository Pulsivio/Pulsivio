export type Language = 'pl' | 'en' | 'de' | 'es' | 'fr' | 'it' | 'pt' | 'ru';

export type TimePeriod = 'morning' | 'noon' | 'evening' | 'extra' | 'night';

export type Feeling = 'great' | 'normal' | 'weak' | 'dizzy' | 'headache' | 'stressed';

export interface Measurement {
  id: string;
  systolic: number; // mmHg (e.g. 120)
  diastolic: number; // mmHg (e.g. 80)
  pulse: number; // bpm (e.g. 72)
  bloodSugar?: number; // mg/dL (optional, e.g. 98)
  weight?: number; // kg (optional)
  arm: 'left' | 'right';
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  period: TimePeriod;
  tags: string[];
  notes: string;
  feeling: Feeling;
  timestamp: number;
}

export type BPLevel = 
  | 'optimal' 
  | 'normal' 
  | 'high_normal' 
  | 'hypertension_1' 
  | 'hypertension_2' 
  | 'hypertension_3' 
  | 'hypotension';

export interface BPClassification {
  level: BPLevel;
  label: string;
  color: string; // text color or hex
  badgeClass: string;
  bgLight: string;
  borderClass: string;
  advice: string;
  icon: string;
}

export interface Caregiver {
  id: string;
  name: string;
  relation: string; // e.g., 'Córka', 'Syn', 'Partner', 'Opiekun', 'Lekarz'
  phone: string;
  email?: string;
  isPrimary: boolean;
  notifyOnHighBP?: boolean;
}

export interface GoogleAccount {
  email: string;
  name: string;
  picture?: string;
  id?: string;
  connectedAt: string;
}

export interface UserProfile {
  name: string;
  birthYear?: string;
  doctorName?: string;
  doctorEmail?: string;
  doctorPhone?: string;
  clinicName?: string;
  emergencyPhone?: string;
  emergencyName?: string;
  medications?: string;
  notesForDoctor?: string;
  caregivers?: Caregiver[];
  googleAccount?: GoogleAccount | null;
}

export type ActiveTab = 'diary' | 'add' | 'trends' | 'report' | 'assistant';
