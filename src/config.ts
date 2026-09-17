/**
 * KONFIGURACJA WIDGETU: KickStats Pro Live
 * System licencji oraz Master Whitelist dla twórcy (GodShaker)
 */

// Baza aktywnych licencji streamerów (Dedykowani streamerzy: pisicelarp oraz aspentv)
export const LICENSES: Record<string, string> = {
  "KP-PISICELARP-LIVE": "pisicelarp",
  "PROJEKT-PISICELARP": "pisicelarp",
  "KP-ASPENTV-LIVE": "aspentv",
};

// Systemowa Master Whitelist dla twórcy (GodShaker)
// Umożliwia testowanie DOWOLNEGO kanału Kick (?key=MASTER-GODSHAKER&channel=dowolnynick)
export const MASTER_WHITELIST_KEYS = new Set([
  "MASTER-GODSHAKER",
  "GODSHAKER-DEV-2026",
  "GODSHAKER-ADMIN",
  "MASTER-ACCESS-KEY",
  "GODSHAKER",
]);

// Tajny klucz solący do weryfikacji podpisów licencji (zna go tylko aplikacja GodShakera)
const SECRET_SIGNATURE_SALT = "GODSHAKER_KICK_LIVE_SECRET_KEY_2026";

/**
 * Oblicza 6-znakową sumę kontrolną dla danego kanału
 */
export function calculateChannelChecksum(channelSlug: string): string {
  const clean = channelSlug.trim().toLowerCase().replace(/^@/, '');
  const combined = `${clean}:${SECRET_SIGNATURE_SALT}`;
  let hash = 5381;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) + hash) + combined.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(6, '0').slice(0, 6);
}

/**
 * Automatyczny generator unikalnego klucza licencyjnego dla DOWOLNEGO streamera.
 * Format: KP-<NICK_STREAMERA>-<6_ZNAKOWY_HASH>
 * Przykład: dla "pisicel" -> "KP-PISICEL-..."
 */
export function generateStreamerKey(channelSlug: string): string {
  const clean = channelSlug.trim().toLowerCase().replace(/^@/, '');
  if (!clean) return '';
  const checksum = calculateChannelChecksum(clean);
  return `KP-${clean.toUpperCase()}-${checksum}`;
}

export interface LicenseValidationResult {
  isValid: boolean;
  channel: string;
  isMaster: boolean;
  licenseKey: string;
  errorReason?: string;
}

/**
 * Weryfikacja licencji na podstawie parametru w URL (?key=...)
 */
export function validateLicense(keyParam: string | null, fallbackChannel?: string | null): LicenseValidationResult {
  const cleanKey = (keyParam || '').trim().toUpperCase();
  const requestedChannel = (fallbackChannel || 'pisicelarp').trim().toLowerCase().replace(/^@/, '');

  // 1. Sprawdzenie uprawnień Master Whitelist (Twórca / Administrator - GodShaker)
  if (MASTER_WHITELIST_KEYS.has(cleanKey)) {
    return {
      isValid: true,
      channel: requestedChannel || 'pisicelarp',
      isMaster: true,
      licenseKey: cleanKey,
    };
  }

  // 2. Sprawdzenie klucza generowanego algorytmicznie: KP-<CHANNEL>-<CHECKSUM> lub CS-<CHANNEL>-<CHECKSUM>
  if (cleanKey.startsWith('KP-') || cleanKey.startsWith('CS-')) {
    const match = cleanKey.match(/^(?:KP|CS)-([A-Za-z0-9_]+)-([A-Fa-f0-9]{6})$/);
    if (match) {
      const channelInKey = match[1].toLowerCase();
      const expectedChecksum = calculateChannelChecksum(channelInKey);
      if (match[2].toUpperCase() === expectedChecksum) {
        // Jeśli w URL podano inny kanał, sprawdzamy zgodność
        if (requestedChannel && requestedChannel !== channelInKey) {
          return {
            isValid: false,
            channel: channelInKey,
            isMaster: false,
            licenseKey: cleanKey,
            errorReason: `Ten klucz jest przypisany wyłącznie do kanału @${channelInKey}. Nie można go użyć dla @${requestedChannel}.`,
          };
        }
        return {
          isValid: true,
          channel: channelInKey,
          isMaster: false,
          licenseKey: cleanKey,
        };
      }
    }
  }

  // 3. Sprawdzenie czy klucz znajduje się w statycznej bazie licencji
  if (cleanKey) {
    for (const [licKey, licChannel] of Object.entries(LICENSES)) {
      if (licKey.toUpperCase() === cleanKey) {
        return {
          isValid: true,
          channel: licChannel.toLowerCase().replace(/^@/, ''),
          isMaster: false,
          licenseKey: cleanKey,
        };
      }
    }
  }

  // 4. Bezpieczny fallback dla dedykowanych streamerów (pisicelarp, aspentv, pisicel)
  // Wklejenie linku do OBS (jako źródło przeglądarki lub dok) natychmiast działa bezbłędnie
  if (requestedChannel === 'pisicelarp' || requestedChannel === 'aspentv' || requestedChannel === 'pisicel') {
    return {
      isValid: true,
      channel: requestedChannel,
      isMaster: false,
      licenseKey: cleanKey || generateStreamerKey(requestedChannel),
    };
  }

  // 5. Brak uprawnień / nieprawidłowy klucz dla nieobsługiwanego kanału
  return {
    isValid: false,
    channel: requestedChannel || '',
    isMaster: false,
    licenseKey: cleanKey,
    errorReason: cleanKey
      ? `Klucz licencyjny "${cleanKey}" jest nieprawidłowy dla kanału @${requestedChannel}.`
      : 'Wymagany jest autoryzowany klucz licencyjny (?key=...).',
  };
}

export const KICK_CONFIG = {
  DEFAULT_CHANNEL: 'pisicelarp',
  CREATOR_NAME: 'GodShaker',
  UI_UPDATE_INTERVAL_MS: 500,
  REQUIRE_MANUAL_START: false,
};
