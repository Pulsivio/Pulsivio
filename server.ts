import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper for Gemini AI
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

import fs from "fs";

// Storage directory for cross-device sync
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "sync_data.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let syncStore: Record<string, { measurements: any[]; profile?: any; lastUpdated: number }> = {};
if (fs.existsSync(DATA_FILE)) {
  try {
    syncStore = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch (e) {
    console.error("Error reading sync store:", e);
  }
}

function persistSyncStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(syncStore, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving sync store:", e);
  }
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Sync Endpoints (Phone <-> PC)
app.get("/api/sync/:code", (req, res) => {
  const code = (req.params.code || "").toUpperCase().trim();
  if (!code || code.length < 3) {
    res.status(400).json({ error: "Invalid sync code" });
    return;
  }
  const data = syncStore[code];
  if (!data) {
    res.json({ measurements: null, lastUpdated: 0 });
    return;
  }
  res.json({
    measurements: data.measurements || [],
    profile: data.profile || {},
    lastUpdated: data.lastUpdated || 0,
  });
});

app.post("/api/sync/:code", (req, res) => {
  const code = (req.params.code || "").toUpperCase().trim();
  const { measurements, profile } = req.body;
  if (!code || code.length < 3) {
    res.status(400).json({ error: "Invalid sync code" });
    return;
  }

  const now = Date.now();
  syncStore[code] = {
    measurements: Array.isArray(measurements) ? measurements : [],
    profile: profile || {},
    lastUpdated: now,
  };
  persistSyncStore();

  res.json({
    success: true,
    lastUpdated: now,
    count: syncStore[code].measurements.length,
  });
});

// Voice / Chat Assistant Endpoint
app.post("/api/assistant", async (req, res) => {
  try {
    const { message, language = "pl", recentReadings = [] } = req.body;

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Missing message" });
      return;
    }

    const ai = getGeminiClient();

    // Prepare context of recent readings
    const readingsSummary = recentReadings.slice(0, 5).map((r: any) =>
      `${r.date || ""} ${r.time || ""}: ${r.systolic}/${r.diastolic} mmHg, puls: ${r.pulse || "b/d"}`
    ).join("; ");

    if (ai) {
      const systemInstruction = `Jesteś życzliwym, zwięzłym i przede wszystkim BEZPIECZNYM asystentem zdrowia w aplikacji Pulsivio.
Odpowiadaj ZAWSZE w języku użytkownika (${language}).

BEZWZGLĘDNY ZAKAZ UDZIELANIA PORAD MEDYCZNYCH I DIAGNOZOWANIA:
1. Nigdy nie diagnozuj chorób, nie interpretuj bólów, nie oceniaj stanu zdrowia i nie sugeruj leków ani zmiany ich dawkowania!
2. Na wszelkie pytania medyczne lub objawowe od razu odeślij do lekarza: "Jako asystent cyfrowy nie jestem lekarzem i nie udzielam porad medycznych ani diagnoz. Wszelkie objawy i decyzje o lekach należy bezwzględnie skonsultować z lekarzem prowadzącym."
3. Jedyne co wolno Ci podawać, to powszechnie znane normy ciśnienia (WHO/PTNT: optymalne <120/<80, prawidłowe 120-129/80-84, nadciśnienie od 140/90) oraz ogólne proste wskazówki stylu życia (np. ograniczenie soli w diecie, regularny odpoczynek, unikanie stresu, nawodnienie).
4. W stanach alarmowych (ból w klatce, duszność, ciśnienie >=180/110) natychmiast każ wezwać pogotowie (112 lub 999).

ROZPOZNAWANIE I ZAPISYWANIE POMIARÓW:
Użytkownicy dyktują wyniki w różnych formatach, np.:
- "129;/85/78 przed tabletkami"
- "120 na 80 puls 72"
- "135/85/70 po spacerze"
- "140 90 puls 68 rano"
Zawsze wyciągnij:
- systolic: liczba skurczowa (np. 129)
- diastolic: liczba rozkurczowa (np. 85)
- pulse: tętno/puls jeśli podano (np. 78)
- notes: dodatkowe okoliczności (np. "przed tabletkami", "po spacerze", "rano")

Ostatnie pomiary użytkownika (do kontekstu): ${readingsSummary || "brak wpisów"}.

Zwróć odpowiedź w formacie JSON z polami:
- replyText: (string) krótka, zwięzła odpowiedź (np. "Zapisałem pomiar: 129/85 mmHg, puls 78 (przed tabletkami). Pamiętaj o regularnych konsultacjach z lekarzem.")
- detectedMeasurement: (object | null) { systolic: number, diastolic: number, pulse?: number, notes?: string }`;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: message,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
          },
        });

        const rawText = response.text || "{}";
        const parsedData = JSON.parse(rawText);
        res.json({
          replyText: parsedData.replyText || "Dziękuję za wiadomość.",
          detectedMeasurement: parsedData.detectedMeasurement || null,
        });
        return;
      } catch (geminiError) {
        console.error("Gemini API error, falling back to rule-based:", geminiError);
      }
    }

    // Fallback rule-based parsing and answers when Gemini API key is not yet set
    const fallback = parseRuleBased(message, language);
    res.json(fallback);
  } catch (error: any) {
    console.error("Error in /api/assistant:", error);
    res.status(500).json({
      replyText: "Przepraszam, wystąpił chwilowy błąd w komunikacji z asystentem.",
      detectedMeasurement: null,
    });
  }
});

// Rule-based fallback parser
function parseRuleBased(text: string, lang: string) {
  const clean = text.trim();
  const lower = clean.toLowerCase();
  
  // Try pattern 1: Three values with delimiters like: "129;/85/78 przed tabletkami", "120/80/72", "125-82-70"
  const threePartMatch = clean.match(/(\d{2,3})\s*(?:;|\/|na|-|\s)+\s*(\d{2,3})\s*(?:;|\/|na|-|\s)+\s*(\d{2,3})/i);
  // Try pattern 2: Standard two values "120 na 80", "120/80", "120 80", with pulse
  const bpMatch = clean.match(/(\d{2,3})\s*(?:na|\/|przez|-|;|\s)\s*(\d{2,3})/i);
  const pulseMatch = clean.match(/(?:puls|tętno|tętna|heart rate|puls:|hr)\s*[:=]?\s*(\d{2,3})/i) ||
                     clean.match(/(\d{2,3})\s*(?:uderzeń|bpm|puls|tętno)/i);

  let detectedMeasurement = null;

  if (threePartMatch) {
    const sys = parseInt(threePartMatch[1], 10);
    const dia = parseInt(threePartMatch[2], 10);
    const pulse = parseInt(threePartMatch[3], 10);
    if (sys >= 50 && sys <= 260 && dia >= 30 && dia <= 160) {
      let notes = clean.replace(threePartMatch[0], '').trim();
      notes = notes.replace(/^(?:ciśnienie|cisnienie|puls|tętno|wynik|pomiar|zapisz|wpisz)[:\s,]*/i, '').trim();
      detectedMeasurement = {
        systolic: sys,
        diastolic: dia,
        pulse: pulse >= 30 && pulse <= 250 ? pulse : undefined,
        notes: notes || "Wprowadzone głosowo",
      };
    }
  } else if (bpMatch) {
    const sys = parseInt(bpMatch[1], 10);
    const dia = parseInt(bpMatch[2], 10);
    if (sys >= 50 && sys <= 260 && dia >= 30 && dia <= 160) {
      let notes = clean.replace(bpMatch[0], '');
      if (pulseMatch) notes = notes.replace(pulseMatch[0], '');
      notes = notes.replace(/^(?:ciśnienie|cisnienie|puls|tętno|wynik|pomiar|zapisz|wpisz)[:\s,]*/i, '').trim();
      detectedMeasurement = {
        systolic: sys,
        diastolic: dia,
        pulse: pulseMatch ? parseInt(pulseMatch[1], 10) : undefined,
        notes: notes || "Wprowadzone głosowo",
      };
    }
  }

  const greetings = {
    pl: "Dzień dobry! Słucham Cię. Możesz podyktować swój wynik (np. '129;/85/78 przed tabletkami' albo '120 na 80 puls 70') lub zapytać o normy ciśnienia.",
    en: "Hello! I am listening. You can dictate your reading (e.g. '120/80/70' or '120 over 80') or ask about blood pressure ranges.",
    de: "Guten Tag! Ich höre zu. Sie können Ihren Messwert diktieren, z. B. '120 zu 80 Puls 70'.",
    es: "¡Hola! Te escucho. Puedes dictar tu lectura, por ejemplo '120 sobre 80 pulso 70'.",
    fr: "Bonjour ! Je vous écoute. Vous pouvez dicter votre mesure, par exemple '120 sur 80 pouls 70'.",
    pt: "Olá! Estou ouvindo. Você pode ditar sua medição, por exemplo '120 por 80 pulso 70'.",
    ru: "Здравствуйте! Я слушаю. Вы можете продиктовать свои показатели, например: '120 на 80 пульс 70'.",
  };

  if (detectedMeasurement) {
    const noteText = detectedMeasurement.notes && detectedMeasurement.notes !== "Wprowadzone głosowo" ? ` (${detectedMeasurement.notes})` : "";
    const msg = {
      pl: `Rozpoznałem pomiar: Ciśnienie ${detectedMeasurement.systolic}/${detectedMeasurement.diastolic} mmHg${detectedMeasurement.pulse ? `, puls: ${detectedMeasurement.pulse}` : ""}${noteText}. Zapisać go w Twoim dzienniku?`,
      en: `I recognized the measurement: Blood pressure ${detectedMeasurement.systolic}/${detectedMeasurement.diastolic} mmHg${detectedMeasurement.pulse ? `, pulse: ${detectedMeasurement.pulse}` : ""}${noteText}. Would you like to save it?`,
      de: `Messung erkannt: Blutdruck ${detectedMeasurement.systolic}/${detectedMeasurement.diastolic} mmHg${detectedMeasurement.pulse ? `, Puls: ${detectedMeasurement.pulse}` : ""}.`,
      es: `Medición reconocida: Presión arterial ${detectedMeasurement.systolic}/${detectedMeasurement.diastolic} mmHg${detectedMeasurement.pulse ? `, pulso: ${detectedMeasurement.pulse}` : ""}.`,
      fr: `Mesure reconnue : Tension ${detectedMeasurement.systolic}/${detectedMeasurement.diastolic} mmHg${detectedMeasurement.pulse ? `, pouls : ${detectedMeasurement.pulse}` : ""}. Voulez-vous l'enregistrer ?`,
      pt: `Medição reconhecida: Pressão ${detectedMeasurement.systolic}/${detectedMeasurement.diastolic} mmHg${detectedMeasurement.pulse ? `, pulso: ${detectedMeasurement.pulse}` : ""}. Deseja salvar?`,
      ru: `Распознано измерение: Давление ${detectedMeasurement.systolic}/${detectedMeasurement.diastolic} мм рт. ст.${detectedMeasurement.pulse ? `, пульс: ${detectedMeasurement.pulse}` : ""}. Сохранить в дневник?`,
    };
    return {
      replyText: (msg as any)[lang] || msg.pl,
      detectedMeasurement,
    };
  }

  // Difficult questions: medical advice, drugs, diagnostics, symptoms -> strict referral to doctor
  if (
    lower.includes("lek") ||
    lower.includes("tablet") ||
    lower.includes("dawk") ||
    lower.includes("zawał") ||
    lower.includes("zawal") ||
    lower.includes("ból") ||
    lower.includes("bol") ||
    lower.includes("kłucie") ||
    lower.includes("klucie") ||
    lower.includes("duszno") ||
    lower.includes("diagnoz") ||
    lower.includes("leczyć") ||
    lower.includes("leczyc") ||
    lower.includes("recept") ||
    lower.includes("doktor") ||
    lower.includes("lekarz") ||
    lower.includes("choro")
  ) {
    const medNotice = {
      pl: "Jako asystent cyfrowy nie jestem lekarzem i nie udzielam porad medycznych, nie stawiam diagnoz ani nie doradzam w kwestii doboru czy dawkowania leków. Wszelkie niepokojące objawy oraz kwestie leczenia należy bezwzględnie skonsultować z lekarzem prowadzącym. W stanach nagłego zagrożenia dzwoń natychmiast pod 112 lub 999.",
      en: "As a digital assistant, I am not a doctor. I cannot diagnose conditions or advise on medication doses. Please consult all symptoms and treatment decisions with your physician. In an emergency, call 112 or 911.",
    };
    return {
      replyText: (medNotice as any)[lang] || medNotice.pl,
      detectedMeasurement: null,
    };
  }

  // How to measure blood pressure
  if (lower.includes("jak mierzy") || lower.includes("jak zbad") || lower.includes("zasad") || lower.includes("przygotow")) {
    const guide = {
      pl: "Zasady prawidłowego pomiaru: 1. Odpocznij 5 minut w ciszy przed badaniem. 2. Siedź z podpartymi plecami i obiema stopami na podłodze. 3. Mankiet załóż na ramię na wysokości serca. 4. Nie pij kawy ani nie pal 30 min przed pomiarem. 5. Nie ruszaj się i nie rozmawiaj w trakcie pomiaru.",
      en: "Measurement tips: 1. Rest quietly for 5 minutes. 2. Sit with back supported and feet flat on floor. 3. Keep cuff on upper arm at heart level. 4. Avoid caffeine and smoking 30 min prior. 5. Do not talk during the reading.",
    };
    return {
      replyText: (guide as any)[lang] || guide.pl,
      detectedMeasurement: null,
    };
  }

  // Common questions: blood pressure and pulse norms
  if (lower.includes("norm") || lower.includes("prawidłow") || lower.includes("prawidlow") || lower.includes("optymal") || lower.includes("норм") || lower.includes("puls") || lower.includes("tętn")) {
    const norms = {
      pl: "Normy ciśnienia (WHO/PTNT): Optymalne: poniżej 120/80 mmHg. Prawidłowe: 120-129 / 80-84 mmHg. Wysokie prawidłowe: 130-139 / 85-89 mmHg. Nadciśnienie 1. stopnia: 140-159 / 90-99 mmHg. Prawidłowy spoczynkowy puls to 60-100 uderzeń na minutę.",
      en: "Blood pressure ranges (WHO): Optimal: under 120/80 mmHg. Normal: 120-129 / 80-84 mmHg. High-normal: 130-139 / 85-89 mmHg. Stage 1 hypertension: 140-159 / 90-99 mmHg. Normal resting pulse is 60-100 bpm.",
      de: "Optimaler Blutdruck liegt unter 120/80 mmHg. Normalwert ist 120-129 / 80-84 mmHg. Ruhepuls: 60-100 Schläge pro Minute.",
      es: "La presión óptima es inferior a 120/80 mmHg. Normal es 120-129 / 80-84 mmHg. El pulso en reposo normal es de 60-100 lpm.",
      fr: "La tension optimale est inférieure à 120/80 mmHg. La tension normale se situe entre 120-129 / 80-84 mmHg. Le pouls normal au repos est de 60 à 100 bpm.",
      pt: "A pressão ideal é inferior a 120/80 mmHg. Normal é 120-129 / 80-84 mmHg. O pulso normal em repouso é de 60 a 100 bpm.",
      ru: "Оптимальное давление — ниже 120/80 мм рт. ст. Нормальное: 120-129 / 80-84 мм рт. ст. Высокое нормальное: 130-139 / 85-89 мм рт. ст. Гипертония диагностируется от 140/90 мм рт. ст.",
    };
    return {
      replyText: (norms as any)[lang] || norms.pl,
      detectedMeasurement: null,
    };
  }

  return {
    replyText: (greetings as any)[lang] || greetings.pl,
    detectedMeasurement: null,
  };
}

// Serve public assets explicitly
app.use(express.static(path.join(process.cwd(), "public")));

// Vite & Static serving setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`KardioDziennik Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
