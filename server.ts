import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Enable CORS and allow OBS CEF browser source / custom dock requests
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

const KICK_HEADERS = {
  "Accept": "application/json",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
};

// Proxy for Kick Channel API
app.get("/api/kick-channel/v2/channels/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    const cleanSlug = slug.trim().toLowerCase().replace(/^https?:\/\/kick\.com\//, '').replace(/\//g, '');
    const kickRes = await fetch(`https://kick.com/api/v2/channels/${encodeURIComponent(cleanSlug)}`, {
      headers: KICK_HEADERS,
    });

    if (!kickRes.ok) {
      return res.status(kickRes.status).json({ error: `Kick returned status ${kickRes.status}` });
    }

    const data = await kickRes.json();
    return res.json(data);
  } catch (err: any) {
    console.error(`Error fetching kick channel for ${slug}:`, err);
    return res.status(500).json({ error: err.message || "Failed to fetch channel data" });
  }
});

// Dedicated Chatroom & Live resolver proxy (resolves real chatroom ID for any channel)
app.get("/api/kick-chatroom/:slug", async (req, res) => {
  const { slug } = req.params;
  const cleanSlug = slug.trim().toLowerCase().replace(/^https?:\/\/kick\.com\//, '').replace(/\//g, '');
  
  // 1. Try v2 channel chatroom directly
  try {
    const r = await fetch(`https://kick.com/api/v2/channels/${encodeURIComponent(cleanSlug)}/chatroom`, { headers: KICK_HEADERS });
    if (r.ok) {
      const data = await r.json();
      if (data?.id) {
        return res.json({ chatroomId: data.id, slug: cleanSlug });
      }
    }
  } catch (e) {}

  // 2. Try v2 channel full data
  try {
    const r = await fetch(`https://kick.com/api/v2/channels/${encodeURIComponent(cleanSlug)}`, { headers: KICK_HEADERS });
    if (r.ok) {
      const data = await r.json();
      const chatroomId = data?.chatroom?.id || data?.id;
      if (chatroomId) {
        return res.json({ 
          chatroomId, 
          slug: cleanSlug, 
          isLive: data?.livestream?.is_live ?? !!data?.livestream,
          viewerCount: data?.livestream?.viewer_count || 0 
        });
      }
    }
  } catch (e) {}

  // 3. Try v1 channel
  try {
    const r = await fetch(`https://kick.com/api/v1/channels/${encodeURIComponent(cleanSlug)}`, { headers: KICK_HEADERS });
    if (r.ok) {
      const data = await r.json();
      const chatroomId = data?.chatroom?.id || data?.chatroom_id || data?.id;
      if (chatroomId) {
        return res.json({ 
          chatroomId, 
          slug: cleanSlug, 
          isLive: data?.livestream?.is_live ?? !!data?.livestream,
          viewerCount: data?.livestream?.viewer_count || 0 
        });
      }
    }
  } catch (e) {}

  return res.status(404).json({ error: `Could not find chatroom for ${cleanSlug}` });
});

// Proxy for Kick Realtime Auth Token
app.post("/api/kick-web/v1/realtime/auth/connection", async (req, res) => {
  try {
    const clientId = req.body?.client_id || `client-${Math.random().toString(36).substring(2, 12)}`;
    const authRes = await fetch("https://web.kick.com/api/v1/realtime/auth/connection", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Referer": "https://kick.com/",
      },
      body: JSON.stringify({ client_id: clientId }),
    });

    if (!authRes.ok) {
      return res.status(authRes.status).json({ error: `Kick auth returned status ${authRes.status}` });
    }

    const data = await authRes.json();
    return res.json(data);
  } catch (err: any) {
    console.error("Error fetching kick realtime auth:", err);
    return res.status(500).json({ error: err.message || "Failed to fetch realtime auth token" });
  }
});

// Serve frontend: in dev use Vite middleware, in prod serve dist
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
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
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

start();
