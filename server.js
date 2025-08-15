import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve frontend static files from ../frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Optional: serve index.html at root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Generate script via OpenAI (optional)
app.post("/generate-script", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY not set in .env" });
    }

    const openaiResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a creative video script writer." },
          { role: "user", content: `Write a short, engaging video script (3-7 short sentences) for: ${prompt}` }
        ],
        max_tokens: 300
      })
    });

    const openaiData = await openaiResp.json();
    const script = openaiData?.choices?.[0]?.message?.content || openaiData?.choices?.[0]?.text || null;
    if (!script) return res.status(500).json({ error: "No script returned", details: openaiData });

    return res.json({ script });
  } catch (err) {
    console.error("generate-script error:", err);
    return res.status(500).json({ error: "Failed to generate script" });
  }
});

// Generate video via Runway (text-to-video). Adjust endpoint per your Runway account/API.
app.post("/generate-video", async (req, res) => {
  try {
    const { prompt, duration } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    if (!process.env.RUNWAY_API_KEY) {
      return res.status(500).json({ error: "RUNWAY_API_KEY not set in .env" });
    }

    // Example request body for Runway - check docs for exact fields for your model
    const body = {
      prompt: prompt,
      // duration in seconds (Runway pricing: credits per second)
      length_seconds: Number(duration || 5),
      // any other model params
      resolution: "720p"
    };

    const apiUrl = "https://api.runwayml.com/v1/generate"; // placeholder - update if your Runway docs specify different path

    const apiResp = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.RUNWAY_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    const apiData = await apiResp.json();
    console.log("Runway response:", apiData);

    // Attempt to extract video URL from common fields
    const videoUrl = apiData?.output_url || apiData?.output?.[0] || apiData?.result?.url || null;

    if (!videoUrl) {
      // If Runway returns job id, you might need to poll for result. Return full response for debugging.
      return res.status(500).json({ error: "No video URL in Runway response", details: apiData });
    }

    return res.json({ videoUrl });
  } catch (err) {
    console.error("generate-video error:", err);
    return res.status(500).json({ error: "Video generation failed", details: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://127.0.0.1:${PORT}`);
});
