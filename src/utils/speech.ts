import { Language } from '../types';

// Speech synthesis (reading out loud)
export function speakText(text: string, lang: Language = 'pl', isSenior: boolean = false): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const langMap: Record<Language, string> = {
    pl: 'pl-PL',
    en: 'en-US',
    de: 'de-DE',
    es: 'es-ES',
    fr: 'fr-FR',
    it: 'it-IT',
    pt: 'pt-PT',
    ru: 'ru-RU',
  };

  utterance.lang = langMap[lang] || 'pl-PL';
  // Senior mode speech is calm and deliberate for maximum clarity
  utterance.rate = isSenior ? 0.85 : 0.95;
  utterance.pitch = 1.0;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Check if speech recognition is available in browser
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

// Client-side quick parser for natural language phrases
export function extractBPFromText(text: string): { systolic: number; diastolic: number; pulse?: number; notes?: string } | null {
  if (!text) return null;

  const clean = text.trim();

  // Pattern 1: Three values with delimiters like: "129;/85/78", "129/85/78", "120/80/72", "125-82-70", "130 85 75"
  const threePartMatch = clean.match(/(\d{2,3})\s*(?:;|\/|na|-|\s)+\s*(\d{2,3})\s*(?:;|\/|na|-|\s)+\s*(\d{2,3})/i);
  if (threePartMatch) {
    const sys = parseInt(threePartMatch[1], 10);
    const dia = parseInt(threePartMatch[2], 10);
    const pulse = parseInt(threePartMatch[3], 10);

    if (sys >= 60 && sys <= 260 && dia >= 35 && dia <= 160) {
      // Extract notes by removing the numbers and standard words
      let notes = clean.replace(threePartMatch[0], '').trim();
      notes = notes.replace(/^(?:ciśnienie|cisnienie|puls|tętno|wynik|pomiar|zapisz|wpisz)[:\s,]*/i, '').trim();

      return {
        systolic: sys,
        diastolic: dia,
        pulse: pulse >= 30 && pulse <= 250 ? pulse : undefined,
        notes: notes || undefined,
      };
    }
  }

  // Pattern 2: Two values with delimiter, and separate pulse word if present
  // "120 na 80", "130/85", "125 przez 82", "ciśnienie 140 90 puls 75"
  const bpMatch = clean.match(/(\d{2,3})\s*(?:na|\/|przez|-|;|\s)\s*(\d{2,3})/i);
  const pulseMatch = clean.match(/(?:puls|tętno|tętna|hr|heart rate|puls:)[:\s]*(\d{2,3})/i) ||
                     clean.match(/(\d{2,3})\s*(?:uderzeń|bpm|puls|tętno)/i);

  if (bpMatch) {
    const sys = parseInt(bpMatch[1], 10);
    const dia = parseInt(bpMatch[2], 10);
    if (sys >= 60 && sys <= 260 && dia >= 35 && dia <= 160) {
      let notes = clean.replace(bpMatch[0], '');
      if (pulseMatch) {
        notes = notes.replace(pulseMatch[0], '');
      }
      notes = notes.replace(/^(?:ciśnienie|cisnienie|puls|tętno|wynik|pomiar|zapisz|wpisz)[:\s,]*/i, '').trim();

      return {
        systolic: sys,
        diastolic: dia,
        pulse: pulseMatch ? parseInt(pulseMatch[1], 10) : undefined,
        notes: notes || undefined,
      };
    }
  }

  return null;
}
