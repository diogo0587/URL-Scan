var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.post("/api/audit", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY is missing." });
      }
      const ai = new import_genai.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Analyze the following URL for potential security threats, hidden tracking, phishing attempts, or suspicious patterns. Provide a concise, professional audit report in Portuguese. Focus on the host reputation, path structure, and detected query parameters. 

URL to analyze: ${url}

Output the report in a clear format (markdown supported). Use professional tone.`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });
      res.json({ result: response.text });
    } catch (error) {
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
      const trace = [url];
      let currentUrl = url;
      let maxRedirects = 5;
      let suspicious = false;
      while (maxRedirects > 0) {
        try {
          const response = await fetch(currentUrl, { redirect: "manual" });
          if (response.status >= 300 && response.status < 400 && response.headers.get("location")) {
            let location = response.headers.get("location");
            if (location && !location.startsWith("http")) {
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
    } catch (error) {
      console.error("Trace error:", error);
      res.status(500).json({ error: "Failed to trace URL" });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
