import { Measurement, UserProfile } from '../types';

interface CompactMeasurement {
  s: number; // systolic
  d: number; // diastolic
  p?: number; // pulse
  dt: string; // date
  t?: string; // time
  per?: string; // period: m, n, e, x
  arm?: string; // l, r
  n?: string; // notes
  g?: string[]; // tags
}

interface CompactPayload {
  v: number; // version
  c?: string; // syncCode
  u?: {
    n?: string; // name
    y?: string; // birthYear
    m?: string; // medications
    d?: string; // doctorName
    e?: string; // doctorEmail
    cl?: string; // clinicName
    nt?: string; // doctorNotes
  };
  m: CompactMeasurement[];
  ts: number;
}

/**
 * Encodes measurements and profile into a compact URL-safe base64 string
 */
export function encodeDoctorData(
  measurements: Measurement[],
  profile: UserProfile,
  syncCode?: string
): string {
  try {
    // Take the most recent 120 measurements to avoid URL size limit issues
    const sorted = [...measurements].sort((a, b) => b.timestamp - a.timestamp).slice(0, 120);

    const compact: CompactPayload = {
      v: 1,
      c: syncCode || undefined,
      u: {
        n: profile.name || undefined,
        y: profile.birthYear || undefined,
        m: profile.medications || undefined,
        d: profile.doctorName || undefined,
        e: profile.doctorEmail || undefined,
        cl: profile.clinicName || undefined,
      },
      m: sorted.map((item) => ({
        s: item.systolic,
        d: item.diastolic,
        p: item.pulse || undefined,
        dt: item.date,
        t: item.time || undefined,
        per: item.period === 'morning' ? 'm' : item.period === 'noon' ? 'n' : item.period === 'evening' ? 'e' : 'x',
        arm: item.arm === 'left' ? 'l' : 'r',
        n: item.notes || undefined,
        g: item.tags && item.tags.length > 0 ? item.tags : undefined,
      })),
      ts: Date.now(),
    };

    const jsonStr = JSON.stringify(compact);
    // Base64 encode safe for UTF-8
    const bytes = new TextEncoder().encode(jsonStr);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return encodeURIComponent(base64);
  } catch (err) {
    console.error('Failed to encode doctor data:', err);
    return '';
  }
}

/**
 * Decodes compact data from URL parameter or hash
 */
export function decodeDoctorData(encoded: string): {
  measurements: Measurement[];
  profile: Partial<UserProfile>;
  syncCode?: string;
} | null {
  if (!encoded || typeof encoded !== 'string') return null;

  try {
    let payloadStr = encoded.trim();

    // If a full URL or hash is passed, strictly look for d= or data=
    if (payloadStr.includes('://') || payloadStr.includes('#') || payloadStr.includes('?')) {
      const hashMatch = payloadStr.match(/[#&?]d=([^&]+)/);
      if (hashMatch && hashMatch[1]) {
        payloadStr = hashMatch[1];
      } else {
        const queryMatch = payloadStr.match(/[?&]data=([^&]+)/);
        if (queryMatch && queryMatch[1]) {
          payloadStr = queryMatch[1];
        } else {
          // No doctor data parameter present in the URL
          return null;
        }
      }
    }

    if (!payloadStr || payloadStr.length < 4) return null;

    let raw = decodeURIComponent(payloadStr);
    // Convert URL-safe base64 if needed
    raw = raw.replace(/-/g, '+').replace(/_/g, '/');
    while (raw.length % 4) {
      raw += '=';
    }

    const binary = atob(raw);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const jsonStr = new TextDecoder().decode(bytes);
    const payload: CompactPayload = JSON.parse(jsonStr);

    if (!payload || !Array.isArray(payload.m)) {
      return null;
    }

    const measurements: Measurement[] = payload.m.map((c, index) => {
      let period: 'morning' | 'noon' | 'evening' | 'extra' = 'morning';
      if (c.per === 'n') period = 'noon';
      else if (c.per === 'e') period = 'evening';
      else if (c.per === 'x') period = 'extra';

      let timestamp = Date.now() - index * 1000;
      if (c.dt) {
        const dStr = c.t ? `${c.dt}T${c.t}` : `${c.dt}T12:00:00`;
        const parsed = new Date(dStr).getTime();
        if (!isNaN(parsed)) timestamp = parsed;
      }

      return {
        id: `shared-${index}-${timestamp}`,
        systolic: c.s,
        diastolic: c.d,
        pulse: c.p || 0,
        date: c.dt,
        time: c.t || '',
        period,
        arm: c.arm === 'r' ? 'right' : 'left',
        notes: c.n || '',
        tags: c.g || [],
        feeling: 'normal',
        timestamp,
      };
    });

    const profile: Partial<UserProfile> = {
      name: payload.u?.n || '',
      birthYear: payload.u?.y || '',
      medications: payload.u?.m || '',
      doctorName: payload.u?.d || '',
      doctorEmail: payload.u?.e || '',
      clinicName: payload.u?.cl || '',
    };

    return {
      measurements,
      profile,
      syncCode: payload.c,
    };
  } catch (err) {
    console.error('Failed to decode doctor data:', err);
    return null;
  }
}

/**
 * Builds the standalone Doctor Report URL:
 * Contains both the doctor_code (for live cloud sync if backend is active)
 * and the encoded snapshot data in the hash (so it works 100% on static Netlify without any server).
 */
export function buildDoctorShareUrl(
  measurements: Measurement[],
  profile: UserProfile,
  syncCode: string
): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://pulsivio.app';
  const cleanCode = (syncCode || 'PULSIVIO').toUpperCase().trim();
  const encodedData = encodeDoctorData(measurements, profile, cleanCode);

  // If we have encoded data, put it in the hash: #doctor&d=...
  // Also pass ?doctor_code=... in query for instant recognition
  if (encodedData) {
    return `${origin}/?doctor_code=${cleanCode}#doctor&d=${encodedData}`;
  }
  return `${origin}/?doctor_code=${cleanCode}#doctor`;
}
