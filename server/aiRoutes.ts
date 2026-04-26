import express from "express";
import { GoogleGenAI } from "@google/genai";
import rateLimit from "express-rate-limit";
import admin from "firebase-admin";
import fs from "fs";

export const aiRouter = express.Router();

const getAI = () => {
  let apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("MISSING_API_KEY");
  }
  
  apiKey = apiKey.replace(/^["']|["']$/g, '').trim();
  
  return new GoogleGenAI({ apiKey });
};

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, trustProxy: false },
});

const parseAIResponse = (text: string | null | undefined) => {
  if (!text) return {};
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse AI response:", text);
    throw new Error("INVALID_JSON_RESPONSE");
  }
};

// Initialize Firebase Admin for auth verification
const configPath = "./firebase-applet-config.json";
if (fs.existsSync(configPath)) {
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  if (!admin.apps.length) {
    admin.initializeApp({
      projectId: config.projectId,
    });
  }
}

aiRouter.use(apiLimiter);
aiRouter.use(express.json());

aiRouter.post("/explain-match", async (req, res) => {
  try {
    const { candidate, result } = req.body;
    const ai = getAI();
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Explain why this candidate is a match based on these preferences/results. Keep it professional, brief, and grounded in explicit preferences (never chemistry or score). Candidate: ${JSON.stringify(candidate)}, Result Context: ${JSON.stringify(result)}`,
      config: {
        systemInstruction: "You are the explanations engine. Return JSON with `{ explanation: string }`.",
        responseMimeType: "application/json",
      },
    });

    const parsed = parseAIResponse(response.text);
    res.json(parsed);
  } catch (error: any) {
    if (error?.message !== "MISSING_API_KEY" && !error?.message?.includes("API key not valid")) {
      console.error("Match explanation failed:", error);
    }
    res.json({ explanation: "" });
  }
});
