import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// POST /generate-video
app.post("/generate-video", async(req, res) => {
    try {
        const { useGemini, prompt } = req.body;

        let finalPrompt = prompt;

        if (useGemini) {
            // Gemini AI
            const geminiRes = await fetch(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
                process.env.GOOGLE_API_KEY, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: "Give me a cinematic 5s AI video idea." }] }],
                    }),
                }
            );
            const geminiJson = await geminiRes.json();
            finalPrompt = geminiJson.candidates ? .[0] ? .content ? .parts ? .[0] ? .text || prompt;
        }

        // Runway API: Text → Image
        const imgRes = await fetch("https://api.runwayml.com/v1/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + process.env.RUNWAYML_API_SECRET,
            },
            body: JSON.stringify({
                model: "gen4_image_turbo",
                input: { promptText: finalPrompt, ratio: "1920:1080" },
            }),
        });

        const imgJson = await imgRes.json();
        const imageUrl = imgJson.output ? .[0];

        // Runway API: Image → Video
        const vidRes = await fetch("https://api.runwayml.com/v1/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + process.env.RUNWAYML_API_SECRET,
            },
            body: JSON.stringify({
                model: "gen4_turbo",
                input: {
                    promptImage: imageUrl,
                    promptText: "smooth cinematic dolly shot, natural motion, 24fps",
                    ratio: "1280:720",
                    duration: 5,
                },
            }),
        });

        const vidJson = await vidRes.json();
        const videoUrl = vidJson.output ? .[0];

        res.json({ prompt: finalPrompt, imageUrl, videoUrl });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong." });
    }
});

app.listen(5001, () => console.log("✅ Backend running on http://localhost:5001"));