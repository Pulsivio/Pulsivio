import { Measurement, UserProfile } from '../types';

const STORAGE_KEY_MEASUREMENTS = 'pulsify_measurements_v4';
const LEGACY_STORAGE_KEY = 'kardio_measurements_v3';
const STORAGE_KEY_PROFILE = 'kardio_profile_v1';
const STORAGE_KEY_SENIOR = 'kardio_senior_mode_v1';
const STORAGE_KEY_LANG = 'kardio_lang_v2';
const STORAGE_KEY_LARGE_FONT = 'kardio_large_font_v1';
const STORAGE_KEY_SYNC_CODE = 'pulsivio_sync_code_v1';
const STORAGE_KEY_SYNC_TIMESTAMP = 'pulsivio_sync_ts_v1';
const STORAGE_KEY_AVATAR = 'pulsivio_avatar_v1';
const STORAGE_KEY_DARK_MODE = 'pulsivio_dark_mode_v2';

export function getStoredDarkMode(): boolean {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem(STORAGE_KEY_DARK_MODE);
  if (saved === null) return true; // Default to Dark Theme as requested
  return saved === 'true';
}

export function setStoredDarkMode(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_DARK_MODE, String(enabled));
}

export function getStoredAvatar(): string {
  if (typeof window === 'undefined') return '/avatars/original_pulsify.png';
  const saved = localStorage.getItem(STORAGE_KEY_AVATAR);
  if (!saved || saved.includes('pulsivio_') || saved.includes('mascot_') || saved.includes('cardio_')) {
    return '/avatars/original_pulsify.png';
  }
  return saved;
}

export function setStoredAvatar(url: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_AVATAR, url);
}

export function getStoredSyncCode(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY_SYNC_CODE);
}

export function setStoredSyncCode(code: string | null): void {
  if (typeof window === 'undefined') return;
  if (!code) {
    localStorage.removeItem(STORAGE_KEY_SYNC_CODE);
  } else {
    localStorage.setItem(STORAGE_KEY_SYNC_CODE, code.toUpperCase().trim());
  }
}

export function generateSyncCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PUL-${rand}`;
}

export function getStoredSyncTimestamp(): number {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(STORAGE_KEY_SYNC_TIMESTAMP) || '0', 10);
}

export function setStoredSyncTimestamp(ts: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_SYNC_TIMESTAMP, String(ts));
}

export function getStoredLargeFont(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY_LARGE_FONT) === 'true';
}

export function setStoredLargeFont(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_LARGE_FONT, String(enabled));
}

export function getStoredLanguage(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY_LANG);
}

export function setStoredLanguage(lang: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_LANG, lang);
}

export function getStoredSeniorMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY_SENIOR) === 'true';
}

export function setStoredSeniorMode(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_SENIOR, String(enabled));
}

export function getStoredProfile(): UserProfile {
  const emptyProfile: UserProfile = {
    name: '',
    birthYear: '',
    doctorName: '',
    doctorEmail: '',
    clinicName: '',
    emergencyPhone: '',
    emergencyName: '',
    notesForDoctor: '',
    medications: '',
  };

  if (typeof window === 'undefined') {
    return emptyProfile;
  }
  const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(emptyProfile));
    return emptyProfile;
  }
  try {
    const parsed = JSON.parse(raw);
    let modified = false;
    // Clean out legacy demo mock values so user's fields remain cleanly empty
    if (parsed.name === 'Jan Kowalski' || parsed.name === 'Pacjent') {
      parsed.name = '';
      modified = true;
    }
    if (parsed.birthYear === '1954' || parsed.birthYear === '1955') {
      parsed.birthYear = '';
      modified = true;
    }
    if (parsed.doctorName && parsed.doctorName.includes('Wiśniewska')) {
      parsed.doctorName = '';
      modified = true;
    }
    if (parsed.emergencyPhone === '500-100-200') {
      parsed.emergencyPhone = '';
      modified = true;
    }
    if (parsed.emergencyName === 'Córka Anna') {
      parsed.emergencyName = '';
      modified = true;
    }
    if (parsed.notesForDoctor && parsed.notesForDoctor.includes('Prestarium')) {
      parsed.notesForDoctor = '';
      modified = true;
    }
    if (modified) {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(parsed));
    }
    return {
      ...emptyProfile,
      ...parsed,
    };
  } catch {
    return emptyProfile;
  }
}

export function setStoredProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
}

export function getStoredMeasurements(): Measurement[] {
  if (typeof window === 'undefined') return [];
  
  // First check v4 storage
  const raw = localStorage.getItem(STORAGE_KEY_MEASUREMENTS);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // Filter out any leftover mock samples
        return parsed.filter((m: Measurement) => !m.id || !m.id.startsWith('sample-'));
      }
    } catch {
      return [];
    }
  }

  // Check if legacy storage has any REAL measurements (not sample-*)
  const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (legacyRaw) {
    try {
      const legacyParsed = JSON.parse(legacyRaw);
      if (Array.isArray(legacyParsed)) {
        const realOnly = legacyParsed.filter((m: Measurement) => m.id && !m.id.startsWith('sample-'));
        localStorage.setItem(STORAGE_KEY_MEASUREMENTS, JSON.stringify(realOnly));
        return realOnly;
      }
    } catch {
      // ignore
    }
  }

  // Default: completely fresh, clean journal ready for user's own measurements
  localStorage.setItem(STORAGE_KEY_MEASUREMENTS, JSON.stringify([]));
  return [];
}

export function setStoredMeasurements(measurements: Measurement[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_MEASUREMENTS, JSON.stringify(measurements));
}

export function clearStoredMeasurements(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_MEASUREMENTS, JSON.stringify([]));
  localStorage.removeItem(LEGACY_STORAGE_KEY);
}

export function loadSampleMeasurements(): Measurement[] {
  const samples = generateSampleMeasurements();
  setStoredMeasurements(samples);
  return samples;
}

// Generate realistic mock measurements spanning past 4 days (3+ measurements per day)
function generateSampleMeasurements(): Measurement[] {
  const now = new Date();
  const samples: Measurement[] = [];

  const daysBack = [
    // Dzisiaj (3 pomiary)
    { dayOffset: 0, time: '07:45', period: 'morning' as const, sys: 121, dia: 78, pulse: 67, notes: 'Przed śniadaniem, spokojny poranek', tags: ['W spoczynku'], feeling: 'great' as const, sugar: 94 },
    { dayOffset: 0, time: '13:20', period: 'noon' as const, sys: 126, dia: 81, pulse: 72, notes: 'Przed obiadem', tags: ['W spoczynku'], feeling: 'normal' as const },
    { dayOffset: 0, time: '19:40', period: 'evening' as const, sys: 124, dia: 79, pulse: 69, notes: 'Po lekkiej kolacji', tags: ['Po spacerze'], feeling: 'great' as const },

    // Wczoraj (3 pomiary)
    { dayOffset: 1, time: '08:00', period: 'morning' as const, sys: 123, dia: 79, pulse: 68, notes: 'Po porannym leku', tags: ['Po lekach'], feeling: 'normal' as const, sugar: 98 },
    { dayOffset: 1, time: '13:10', period: 'noon' as const, sys: 128, dia: 82, pulse: 74, notes: 'Po spacerze w parku', tags: ['Po spacerze'], feeling: 'great' as const },
    { dayOffset: 1, time: '19:30', period: 'evening' as const, sys: 129, dia: 83, pulse: 71, notes: 'Spokojny wieczór z książką', tags: ['W spoczynku'], feeling: 'great' as const },

    // 2 dni temu (3 pomiary)
    { dayOffset: 2, time: '07:50', period: 'morning' as const, sys: 120, dia: 77, pulse: 66, notes: 'Bardzo dobre samopoczucie po przespanej nocy', tags: ['W spoczynku'], feeling: 'great' as const, sugar: 95 },
    { dayOffset: 2, time: '14:00', period: 'noon' as const, sys: 132, dia: 84, pulse: 76, notes: 'Upał na zewnątrz, lekkie zmęczenie', tags: ['Stres'], feeling: 'weak' as const },
    { dayOffset: 2, time: '20:15', period: 'evening' as const, sys: 125, dia: 80, pulse: 70, notes: 'Po odpoczynku i szklance wody', tags: ['W spoczynku'], feeling: 'normal' as const },

    // 3 dni temu (4 pomiary: rano, południe, wieczór, noc)
    { dayOffset: 3, time: '08:15', period: 'morning' as const, sys: 125, dia: 80, pulse: 70, notes: 'Standardowy pomiar', tags: ['W spoczynku'], feeling: 'normal' as const },
    { dayOffset: 3, time: '13:30', period: 'noon' as const, sys: 127, dia: 81, pulse: 73, notes: 'Przed posiłkiem', tags: ['W spoczynku'], feeling: 'normal' as const },
    { dayOffset: 3, time: '19:00', period: 'evening' as const, sys: 135, dia: 86, pulse: 77, notes: 'Lekki ból głowy po powrocie', tags: ['Stres'], feeling: 'headache' as const },
    { dayOffset: 3, time: '22:45', period: 'night' as const, sys: 122, dia: 78, pulse: 65, notes: 'Przed snem, ciśnienie opadło', tags: ['W spoczynku'], feeling: 'great' as const },

    // 4 dni temu (3 pomiary)
    { dayOffset: 4, time: '08:10', period: 'morning' as const, sys: 122, dia: 78, pulse: 68, notes: 'Prawidłowy poranek', tags: ['W spoczynku'], feeling: 'great' as const, sugar: 92 },
    { dayOffset: 4, time: '13:15', period: 'noon' as const, sys: 129, dia: 83, pulse: 75, notes: 'W trakcie dnia', tags: ['W spoczynku'], feeling: 'normal' as const },
    { dayOffset: 4, time: '19:50', period: 'evening' as const, sys: 126, dia: 81, pulse: 69, notes: 'Wieczorny relaks', tags: ['W spoczynku'], feeling: 'great' as const },

    // 5 dni temu (3 pomiary)
    { dayOffset: 5, time: '07:55', period: 'morning' as const, sys: 124, dia: 79, pulse: 69, notes: 'Spokojny początek dnia', tags: ['W spoczynku'], feeling: 'great' as const, sugar: 96 },
    { dayOffset: 5, time: '13:40', period: 'noon' as const, sys: 130, dia: 84, pulse: 77, notes: 'Po pracy w ogrodzie', tags: ['Po spacerze'], feeling: 'normal' as const },
    { dayOffset: 5, time: '20:10', period: 'evening' as const, sys: 125, dia: 80, pulse: 72, notes: 'Wieczorny odpoczynek', tags: ['W spoczynku'], feeling: 'great' as const },

    // 6 dni temu (3 pomiary - pełny tydzień)
    { dayOffset: 6, time: '08:05', period: 'morning' as const, sys: 121, dia: 77, pulse: 67, notes: 'Poranny pomiar po obudzeniu', tags: ['W spoczynku'], feeling: 'great' as const, sugar: 93 },
    { dayOffset: 6, time: '13:00', period: 'noon' as const, sys: 127, dia: 82, pulse: 74, notes: 'W porze obiadowej', tags: ['W spoczynku'], feeling: 'normal' as const },
    { dayOffset: 6, time: '19:35', period: 'evening' as const, sys: 128, dia: 82, pulse: 71, notes: 'Przed kolacją', tags: ['W spoczynku'], feeling: 'great' as const },
  ];

  samples.push(...daysBack.map((item, idx) => {
    const d = new Date(now);
    d.setDate(d.getDate() - item.dayOffset);
    const dateStr = d.toISOString().split('T')[0];

    return {
      id: `sample-${idx + 1}`,
      systolic: item.sys,
      diastolic: item.dia,
      pulse: item.pulse,
      bloodSugar: item.sugar,
      arm: 'left' as const,
      date: dateStr,
      time: item.time,
      period: item.period,
      tags: item.tags,
      notes: item.notes,
      feeling: item.feeling,
      timestamp: d.getTime() - (item.dayOffset * 86400000),
    };
  }));

  return samples;
}
