import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "10mb" }));

// In-memory sync store (syncCode -> { measurements, profile, lastUpdated })
const syncStore = new Map<string, { measurements: any[]; profile: any; lastUpdated: number }>();

// User Google account sync store (normalized email -> { measurements, profile, isPro, lastUpdated })
const userSyncStore = new Map<string, { measurements: any[]; profile: any; isPro: boolean; lastUpdated: number }>();

// Admin & Monetization config
let appConfig = {
  googleAdsEnabled: true,
  googleAdsClientId: "ca-pub-6429381029384712",
  googleAdsSlotId: "8492019384",
  buyCoffeeUrl: "https://buycoffee.to/pulsivio",
  buyMeACoffeeUrl: "https://buymeacoffee.com/pulsivio",
  partnerTag: "31212",
  adminPin: "1234",
  proPromoCodes: ["PULSIVIO-PRO-2026", "ADMIN-PRO", "VIP-CARDIO"]
};

// Sync GET endpoint (by 6-char code)
app.get("/api/sync/:code", (req, res) => {
  const code = (req.params.code || "").trim().toUpperCase();
  const data = syncStore.get(code);
  if (!data) {
    return res.json({ measurements: null, profile: null, lastUpdated: 0 });
  }
  return res.json(data);
});

// Sync POST endpoint (by 6-char code)
app.post("/api/sync/:code", (req, res) => {
  const code = (req.params.code || "").trim().toUpperCase();
  const { measurements, profile } = req.body;
  const now = Date.now();
  syncStore.set(code, {
    measurements: Array.isArray(measurements) ? measurements : [],
    profile: profile || {},
    lastUpdated: now
  });
  return res.json({ status: "ok", lastUpdated: now });
});

// Google Account Sync: GET by email
app.get("/api/user-sync/:email", (req, res) => {
  const email = (req.params.email || "").trim().toLowerCase();
  const data = userSyncStore.get(email);
  if (!data) {
    return res.json({ measurements: null, profile: null, isPro: false, lastUpdated: 0 });
  }
  return res.json(data);
});

// Google Account Sync: POST by email
app.post("/api/user-sync/:email", (req, res) => {
  const email = (req.params.email || "").trim().toLowerCase();
  const { measurements, profile, isPro } = req.body;
  const now = Date.now();
  userSyncStore.set(email, {
    measurements: Array.isArray(measurements) ? measurements : [],
    profile: profile || {},
    isPro: Boolean(isPro),
    lastUpdated: now
  });
  return res.json({ status: "ok", lastUpdated: now, email });
});

// Admin System Stats
app.get("/api/admin/system-stats", (req, res) => {
  let totalUserMeasurements = 0;
  for (const item of userSyncStore.values()) {
    totalUserMeasurements += item.measurements?.length || 0;
  }
  for (const item of syncStore.values()) {
    totalUserMeasurements += item.measurements?.length || 0;
  }

  res.json({
    activeCodeSyncs: syncStore.size,
    googleAccountsCount: userSyncStore.size,
    googleAccounts: Array.from(userSyncStore.keys()),
    totalStoredMeasurements: totalUserMeasurements,
    config: appConfig,
    uptimeSeconds: Math.floor(process.uptime()),
    serverTime: new Date().toISOString()
  });
});

// Admin Config GET & POST
app.get("/api/admin/config", (req, res) => {
  res.json(appConfig);
});

app.post("/api/admin/config", (req, res) => {
  const updates = req.body || {};
  appConfig = { ...appConfig, ...updates };
  res.json({ status: "ok", config: appConfig });
});

// Affiliate config endpoint
app.get("/api/affiliate-config", (req, res) => {
  res.json({ partnerTag: appConfig.partnerTag });
});

// AI Health Assistant endpoint (Gemini API server-side)
app.post("/api/assistant", async (req, res) => {
  try {
    const { message, language = "pl", recentReadings = [] } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing message parameter" });
    }

    // Helper regex to extract measurements if user dictated a reading
    // e.g. "120 na 80 puls 70" or "135/85 75"
    let detectedMeasurement: any = null;
    const readingRegex = /(?:ciśnienie|zmierzyłem|wynik)?\s*(\d{2,3})\s*(?:na|\/|-)\s*(\d{2,3})(?:\s*(?:puls|tętno|serce|bpm)?\s*(\d{2,3}))?/i;
    const match = message.match(readingRegex);
    if (match) {
      const sys = parseInt(match[1], 10);
      const dia = parseInt(match[2], 10);
      const pulse = match[3] ? parseInt(match[3], 10) : undefined;
      if (sys >= 60 && sys <= 260 && dia >= 35 && dia <= 160) {
        const now = new Date();
        const hour = now.getHours();
        const period = hour < 11 ? "rano" : hour < 17 ? "poludnie" : "wieczor";
        detectedMeasurement = {
          systolic: sys,
          diastolic: dia,
          pulse: pulse || 72,
          date: now.toISOString().split("T")[0],
          time: `${String(hour).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
          period,
          arm: "lewa",
          notes: "Wprowadzone przez asystenta głosowego"
        };
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemPrompt = `Jesteś życzliwym, wysoce empatycznym asystentem zdrowia kardiologicznego i ciśnienia tętniczego w aplikacji Pulsivio.
Twoim celem jest wspieranie pacjentów (często seniorów) w zrozumieniu pomiarów ciśnienia, motywowanie do regularności, wyjaśnianie zasad prawidłowego pomiaru wg wytycznych Polskiego Towarzystwa Nadciśnienia Tętniczego (PTNT) oraz Europejskiego Towarzystwa Kardiologicznego (ESC/ESH).
Zasady:
1. Odpowiadaj zwięźle, ciepło, prostym językiem bez skomplikowanego żargonu.
2. Normy domowe (PTNT): optymalne <120/<80, prawidłowe 120-129/80-84, wysokie prawidłowe 130-134/85-89, granica nadciśnienia w pomiarach domowych to ≥135/85 mmHg.
3. Nigdy nie diagnozuj chorób samodzielnie ani nie zmieniaj dawkowania leków - zawsze przypominaj o konsultacji z lekarzem prowadzącym. W razie objawów alarmowych (ból w klatce piersiowej, duszność, ciśnienie >180/110) zaleć natychmiastowy kontakt z pogotowiem (112).
4. Jeśli użytkownik podał wynik pomiaru, potwierdź jego odczyt i skomentuj krótko czy mieści się w normie.
Odpowiadaj w języku użytkownika (język: ${language}).`;

        const context = recentReadings.length > 0 
          ? `Ostatnie pomiary pacjenta: ${recentReadings.map((r: any) => `${r.date} ${r.time}: ${r.systolic}/${r.diastolic} puls ${r.pulse}`).join(", ")}`
          : "Brak wcześniejszych pomiarów.";

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            { role: "user", parts: [{ text: `${systemPrompt}\n\nKontekst: ${context}\n\nPytanie użytkownika: ${message}` }] }
          ]
        });

        const replyText = response.text?.trim() || "Dziękuję za wiadomość. Pamiętaj o regularnych pomiarach.";
        return res.json({
          replyText,
          detectedMeasurement
        });
      } catch (geminiError) {
        console.warn("Gemini API call failed, falling back to rule-based answer:", geminiError);
      }
    }

    // Smart fallback if GEMINI_API_KEY is not configured
    let replyText = "Dziękuję za wiadomość. Pamiętaj o regularnych pomiarach ciśnienia o stałych porach (rano i wieczorem).";
    const lower = message.toLowerCase();
    if (detectedMeasurement) {
      replyText = `Zanotowałem Twój pomiar: ${detectedMeasurement.systolic}/${detectedMeasurement.diastolic} mmHg (tętno: ${detectedMeasurement.pulse} bpm). Pamiętaj o 5 minutach spokojnego odpoczynku przed każdym badaniem.`;
    } else if (lower.includes("jak mierzyć") || lower.includes("prawidłowo")) {
      replyText = "Przed pomiarem odpocznij 5 minut w ciszy w pozycji siedzącej. Mankiet załóż na odsłonięte ramię na wysokości serca, oprzyj rękę na stole, nie rozmawiaj i nie krzyżuj nóg.";
    } else if (lower.includes("norm") || lower.includes("135") || lower.includes("120")) {
      replyText = "W pomiarach domowych (wg PTNT) norma ciśnienia wynosi poniżej 135/85 mmHg. Ciśnienie poniżej 120/80 mmHg uznawane jest za optymalne.";
    } else if (lower.includes("senior") || lower.includes("starsz")) {
      replyText = "U seniorów docelowe ciśnienie skurczowe często wynosi 130–139 mmHg, w zależności od ogólnego stanu zdrowia i tolerancji leków. Każdorazowo cel ustala lekarz kardiolog.";
    }

    return res.json({
      replyText,
      detectedMeasurement
    });
  } catch (error) {
    console.error("Assistant API error:", error);
    return res.status(500).json({ error: "Wystąpił błąd przetwarzania asystenta" });
  }
});

async function startServer() {
  // Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Pulsivio server running on http://localhost:${PORT}`);
  });
}

startServer();
