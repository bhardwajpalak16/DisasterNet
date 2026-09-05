import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", name: "Disaster Net Service" });
  });

  // Floating AI Chatbot assistant endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.json({
          reply: "Disaster Net AI is operating in Offline Local Mode. You can broadcast an SOS through the red SOS Dispatcher, navigate offline vector maps for emergency shelters, monitor the BLE mesh relay, or follow first-aid triage protocols without internet access."
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are the Disaster Net AI Assistant, a concise, calm, and expert survival and app guide for Disaster Net.
Disaster Net is an offline-first disaster communication platform featuring:
1. BLE Mesh: Relays emergency packets hop-by-hop without cellular or internet.
2. Emergency SOS & On-Device Triage: Classifies injuries (Critical, Urgent, Monitor) locally.
3. Offline Topographic Maps: Pre-cached vector tiles and disaster shelter markers.
4. Survival Guides: Offline first-aid steps, building collapse survival, water purification, and emergency optical/audio strobes.
5. Community Incident Ledger: Crowd-verified hazard reports stored in local SQLite cache.

Keep your response helpful, concise, clear, and reassuring. If providing first-aid advice, give brief, direct life-saving steps.

User question: "${message}"`
              }
            ]
          }
        ]
      });

      res.json({
        reply: response.text || "I am here to assist with Disaster Net navigation and emergency protocols."
      });
    } catch (err: any) {
      console.error("AI chat error:", err?.message);
      res.json({
        reply: "Offline Assistant: You can use Disaster Net to send SOS broadcasts via BLE mesh, locate nearby emergency shelters on the offline map, or review step-by-step first-aid protocols from the Survival Guides tab."
      });
    }
  });

  // Vite middleware for development vs static production serving
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
