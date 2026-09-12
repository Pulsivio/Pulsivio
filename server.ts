import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

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

  res.json({ success: true, timestamp: now });
});

// AI Voice & Text Cardiology Assistant endpoint
app.post("/api/assistant", async (req, res) => {
  try {
    const { message, lang = "pl", recentReadings = [] } = req.body;
    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Brak treści wiadomości" });
      return;
    }

    const ai = getGeminiClient();

    // Context format
    const summaryText = recentReadings.slice(0, 5).map((r: any) =>
      `${r.date} ${r.time}: ${r.systolic}/${r.diastolic} mmHg, puls: ${r.pulse || "-"} bpm`
    ).join("; ");

    if (ai) {
      const systemInstruction = `Jesteś życzliwym, spokojnym i medycznie odpowiedzialnym asystentem w polskiej aplikacji kardiologicznej Pulsivio (dawniej KardioDziennik).
Użytkownik może dyktować swoje pomiary głosem (np. "zapisz sto trzydzieści na osiemdziesiąt pięć, puls siedemdziesiąt") lub zadawać pytania o normy ciśnienia tętniczego, interpretację wyników oraz dobre nawyki (picie wody, sól, odpoczynek).
Zawsze odpowiadaj zwięźle (maksymalnie 3-4 zdania), po polsku (lub w języku użytkownika: ${lang}), prostym i ciepłym językiem.
Pamiętaj: jeśli wykryjesz wartości pomiaru ciśnienia w wypowiedzi, zwróć je w formacie JSON na końcu odpowiedzi jako blok:
\`\`\`json
{"detected": {"systolic": 130, "diastolic": 85, "pulse": 70}}
\`\`\`
Jeśli użytkownik pyta o poradę medyczną przy niebezpiecznie wysokim ciśnieniu (np. skurczowe powyżej 180 mmHg lub rozkurczowe powyżej 110 mmHg), przypomnij o konieczności natychmiastowego kontaktu z lekarzem lub pogotowiem ratunkowym (112). Nigdy nie zmieniaj leków na własną rękę.`;

      const prompt = `Ostatnie pomiary pacjenta: [${summaryText}].
Wypowiedź użytkownika: "${message}".`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.3,
        },
      });

      const rawText = response.text || "";
      let detectedMeasurement = null;

      const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/);
      let cleanText = rawText;
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          if (parsed && parsed.detected && parsed.detected.systolic && parsed.detected.diastolic) {
            detectedMeasurement = {
              systolic: Number(parsed.detected.systolic),
              diastolic: Number(parsed.detected.diastolic),
              pulse: parsed.detected.pulse ? Number(parsed.detected.pulse) : undefined,
            };
          }
        } catch {
          // ignore json parse error
        }
        cleanText = rawText.replace(/```json[\s\S]*?```/, "").trim();
      }

      res.json({
        replyText: cleanText,
        detectedMeasurement,
      });
      return;
    }

    // Fallback if no Gemini API Key configured
    const fallbackResponse = handleLocalAssistant(message, lang);
    res.json(fallbackResponse);
  } catch (error: any) {
    console.error("AI Assistant API Error:", error);
    res.json(handleLocalAssistant(req.body?.message || "", req.body?.lang || "pl"));
  }
});

function handleLocalAssistant(message: string, lang: string) {
  const lower = message.toLowerCase();

  const numMatches = message.match(/\b\d{2,3}\b/g);
  if (numMatches && numMatches.length >= 2) {
    const sys = parseInt(numMatches[0], 10);
    const dia = parseInt(numMatches[1], 10);
    const pulse = numMatches.length >= 3 ? parseInt(numMatches[2], 10) : undefined;

    if (sys >= 70 && sys <= 260 && dia >= 40 && dia <= 160) {
      let statusPl = "w normie";
      if (sys >= 140 || dia >= 90) statusPl = "podwyższone (I/II stopień nadciśnienia)";
      else if (sys >= 130 || dia >= 85) statusPl = "wysokie prawidłowe";
      else if (sys < 120 && dia < 80) statusPl = "optymalne";

      return {
        replyText: `Zrozumiałem pomiar: ${sys}/${dia} mmHg${pulse ? `, puls: ${pulse} bpm` : ""}. Wynik mieści się w zakresie: ${statusPl}. Czy zapisać ten pomiar w dzienniku?`,
        detectedMeasurement: {
          systolic: sys,
          diastolic: dia,
          pulse,
        },
      };
    }
  }

  const greetings = {
    pl: "Dzień dobry! Jestem asystentem Pulsivio. Możesz podyktować mi swój pomiar (np. '125 na 80 puls 72') albo zapytać o normy ciśnienia tętniczego.",
    en: "Hello! I am your Pulsivio assistant. Dictate your blood pressure (e.g. '125 over 80, pulse 72') or ask about normal pressure ranges.",
    de: "Guten Tag! Ich bin Ihr Pulsivio-Assistent. Diktieren Sie Ihren Blutdruck oder fragen Sie nach Richtwerten.",
    es: "¡Hola! Soy tu asistente de Pulsivio. Díctame tu presión arterial o consulta los rangos recomendados.",
    fr: "Bonjour ! Je suis votre assistant Pulsivio. Dictez votre tension artérielle ou posez une question sur les normes de santé.",
    pt: "Olá! Sou o seu assistente Pulsivio. Dite a sua pressão arterial ou pergunte sobre os valores de referência.",
    ru: "Здравствуйте! Я ассистент Pulsivio. Назовите показатели давления (например '120 на 80 пульс 70') или спросите о нормах.",
  };

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
