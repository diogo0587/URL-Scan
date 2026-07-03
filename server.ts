import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/audit", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is missing." });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Analyze the following URL for potential security threats, hidden tracking, phishing attempts, or suspicious patterns. Provide a concise, professional audit report in Portuguese. Focus on the host reputation, path structure, and detected query parameters. 

URL to analyze: ${url}

Output the report in a clear format (markdown supported). Use professional tone.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error("Audit error:", error);
      res.status(500).json({ error: error.message || "Failed to audit URL" });
    }
  });

  app.post("/api/trace", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      const trace: string[] = [url];
      let currentUrl = url;
      let maxRedirects = 5;
      let suspicious = false;

      while (maxRedirects > 0) {
        try {
           const response = await fetch(currentUrl, { redirect: 'manual' });
           if (response.status >= 300 && response.status < 400 && response.headers.get('location')) {
             let location = response.headers.get('location');
             if (location && !location.startsWith('http')) {
                const urlObj = new URL(currentUrl);
                location = new URL(location, urlObj.origin).href;
             }
             if (location) {
                 trace.push(location);
                 currentUrl = location;
                 maxRedirects--;
             } else {
                 break;
             }
           } else {
             break;
           }
        } catch (fetchError) {
           break;
        }
      }

      res.json({ trace, suspicious: trace.length > 2 });
    } catch (error: any) {
      console.error("Trace error:", error);
      res.status(500).json({ error: "Failed to trace URL" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
