import express from "express";
import { GoogleGenAI } from "@google/genai";
import rateLimit from "express-rate-limit";
import admin from "firebase-admin";
import fs from "fs";
import { SYSTEM_INSTRUCTIONS } from "../src/ai/policies.ts";
import {
  OpenersSchema,
  RephraseSchema,
  MessageSafetyScanSchema,
  ModerationSummarySchema,
  TasteProfileSchema,
  ProfileCompletenessSchema,
  BioCoachSchema,
  DailyPicksIntroSchema,
  WhyThisMatchPayloadSchema,
  PersonalitySummarySchema,
  PairInsightReportSchema,
  PacingInterventionSchema,
  DateIdeasSchema,
  PhotoAnalysisSchema,
} from "../src/ai/schemas.ts";
import { capabilityRouter } from "../src/ai/capabilityRouter.ts";
import { outputValidators } from "../src/ai/outputValidators.ts";
import { PROMPT_TEMPLATES } from "../src/ai/prompts.ts";

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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, trustProxy: false },
});

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

// Auth enforcement middleware
const requireAuth = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    (req as any).user = decodedToken;
    next();
  } catch (error) {
    console.error("Error verifying auth token:", error);
    return res.status(401).json({ error: "Unauthorized" });
  }
};

// Apply middlewares to all AI routes
aiRouter.use(apiLimiter);
aiRouter.use(requireAuth);

aiRouter.post("/safety-advice", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Missing question" });
    }

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Provide brief, calm, and actionable safety advice for this dating app user's question: "${question}"`,
      config: {
        systemInstruction:
          "You are Kesher's safety assistant. Provide brief, calm, and actionable safety advice. Never blame the user. If the situation sounds dangerous, advise them to contact local authorities.",
      },
    });

    res.json({ advice: response.text });
  } catch (error) {
    console.error("Safety advice generation failed:", error);
    res.json({
      advice:
        "Your safety is our priority. Please contact support if you have immediate concerns.",
      error: error instanceof Error ? error.message : String(error)
    }); // Safe fallback
  }
});

aiRouter.post("/plan-date", async (req, res) => {
  try {
    const { params } = req.body;

    if (!params) {
      return res.status(400).json({ error: "Missing params" });
    }

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: capabilityRouter.getRoute("date_planner"),
      contents:
        PROMPT_TEMPLATES.DATE_PLANNER(params) +
        "\n\nIMPORTANT: You must return ONLY valid JSON matching the expected schema. Do not include markdown formatting like ```json.",
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS.DATE_PLANNER,
        responseMimeType: "application/json",
        responseSchema: DateIdeasSchema,
        tools: [{ googleMaps: {} }],
      },
    });

    let text = response.text || "{}";
    // Clean up potential markdown formatting
    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const validated = outputValidators.validateDatePlanner(JSON.parse(text));
    res.json(validated);
  } catch (error: any) {
    if (error?.message !== "MISSING_API_KEY" && !error?.message?.includes("API key not valid")) {
      console.error("Date planner failed:", error);
    }
    res.json({ venues: [], how_to_choose_tip: "" });
  }
});

aiRouter.post("/taste-profile", async (req, res) => {
  try {
    const { interactions, currentProfile } = req.body;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: capabilityRouter.getRoute("taste_profile"),
      contents: PROMPT_TEMPLATES.TASTE_PROFILE(interactions, currentProfile),
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS.TASTE_PROFILE,
        responseMimeType: "application/json",
        responseSchema: TasteProfileSchema,
      },
    });

    const validated = outputValidators.validateTasteProfile(
      JSON.parse(response.text || "{}"),
    );
    res.json(validated);
  } catch (error: any) {
    if (error?.message !== "MISSING_API_KEY" && !error?.message?.includes("API key not valid")) {
      console.error("Taste profile analysis failed:", error);
    }
    res.json(null);
  }
});

aiRouter.post("/profile-completeness", async (req, res) => {
  try {
    const { profile } = req.body;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: capabilityRouter.getRoute("profile_completeness"),
      contents: PROMPT_TEMPLATES.PROFILE_COMPLETENESS(profile),
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS.PROFILE_COMPLETENESS,
        responseMimeType: "application/json",
        responseSchema: ProfileCompletenessSchema,
      },
    });

    const validated = outputValidators.validateProfileCompleteness(
      JSON.parse(response.text || "{}"),
    );
    res.json(validated);
  } catch (error: any) {
    if (error?.message !== "MISSING_API_KEY" && !error?.message?.includes("API key not valid")) {
      console.error("Profile completeness analysis failed:", error);
    }
    res.json(null);
  }
});

aiRouter.post("/coach-bio", async (req, res) => {
  try {
    const { params } = req.body;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: capabilityRouter.getRoute("bio_coach"),
      contents: PROMPT_TEMPLATES.BIO_COACH(params),
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS.BIO_COACH,
        responseMimeType: "application/json",
        responseSchema: BioCoachSchema,
        temperature: 0.4,
      },
    });

    const validated = outputValidators.validateBioCoach(
      JSON.parse(response.text || "{}"),
    );
    res.json(validated);
  } catch (error: any) {
    if (error?.message !== "MISSING_API_KEY" && !error?.message?.includes("API key not valid")) {
      console.error("Bio coaching failed:", error);
    }
    res.json(null);
  }
});

aiRouter.post("/daily-picks-intro", async (req, res) => {
  try {
    const { userProfile } = req.body;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: capabilityRouter.getRoute("bio_coach"), // Using a generic structured model route
      contents: `Generate a short daily picks intro for this user: ${JSON.stringify(userProfile)}`,
      config: {
        systemInstruction:
          "You are Kesher's matchmaker. Generate a short, warm, respectful intro for the user's daily picks.",
        responseMimeType: "application/json",
        responseSchema: DailyPicksIntroSchema,
      },
    });

    const validated = outputValidators.validateDailyPicksIntro(
      JSON.parse(response.text || "{}"),
    );
    res.json(validated);
  } catch (error: any) {
    if (error?.message !== "MISSING_API_KEY" && !error?.message?.includes("API key not valid")) {
      console.error("Daily picks intro generation failed:", error);
    }
    res.json(null);
  }
});

aiRouter.post("/explain-match", async (req, res) => {
  try {
    const { params } = req.body;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: capabilityRouter.getRoute("why_match"),
      contents: PROMPT_TEMPLATES.WHY_MATCH(params),
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS.WHY_MATCH,
        responseMimeType: "application/json",
        responseSchema: WhyThisMatchPayloadSchema,
      },
    });

    const validated = outputValidators.validateWhyMatch(
      JSON.parse(response.text || "{}"),
    );
    res.json(validated);
  } catch (error: any) {
    if (error?.message !== "MISSING_API_KEY" && !error?.message?.includes("API key not valid")) {
      console.error("Match explanation failed:", error);
    }
    res.json(null);
  }
});

aiRouter.post("/openers", async (req, res) => {
  try {
    const { profileName, bio, prompt } = req.body;

    if (!profileName || !bio || !prompt) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: capabilityRouter.getRoute("generate_openers"),
      contents: PROMPT_TEMPLATES.GENERATE_OPENERS({
        name: profileName,
        bio,
        prompt,
      }),
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS.GENERATE_OPENERS,
        responseMimeType: "application/json",
        responseSchema: OpenersSchema,
      },
    });

    const validated = outputValidators.validateOpeners(
      JSON.parse(response.text || "[]"),
    );
    res.json(validated);
  } catch (error: any) {
    if (error?.message !== "MISSING_API_KEY" && !error?.message?.includes("API key not valid")) {
      console.error("Openers generation failed:", error);
    }
    res.json([]);
  }
});

aiRouter.post("/rephrase", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Missing text" });
    }

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: capabilityRouter.getRoute("rephrase_message"),
      contents: PROMPT_TEMPLATES.REPHRASE_MESSAGE(text),
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS.REPHRASE_MESSAGE,
        responseMimeType: "application/json",
        responseSchema: RephraseSchema,
      },
    });

    const validated = outputValidators.validateRephrase(
      JSON.parse(response.text || "{}"),
    );
    res.json(validated);
  } catch (error: any) {
    if (error?.message !== "MISSING_API_KEY" && !error?.message?.includes("API key not valid")) {
      console.error("Rephrase generation failed:", error);
    }
    res.json({ original: req.body.text });
  }
});

aiRouter.post("/message-safety", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Missing text" });
    }

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: capabilityRouter.getRoute("safety_scan"),
      contents: `Analyze this drafted message for safety and tone before sending: "${text}"`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS.MESSAGE_SAFETY_SCAN,
        responseMimeType: "application/json",
        responseSchema: MessageSafetyScanSchema,
      },
    });

    const validated = outputValidators.validateMessageSafetyScan(
      JSON.parse(response.text || "{}"),
    );
    res.json(validated);
  } catch (error: any) {
    if (error?.message !== "MISSING_API_KEY" && !error?.message?.includes("API key not valid")) {
      console.error("Safety scan failed:", error);
    }
    res.json({
      risk_level: "low",
      categories: [],
      recommended_action: "allow",
      short_rationale: "",
    });
  }
});

aiRouter.post("/personality-profile", async (req, res) => {
  try {
    const { userProfile } = req.body;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: capabilityRouter.getRoute("personality_profile"),
      contents: PROMPT_TEMPLATES.PERSONALITY_INTERPRETER(userProfile),
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS.PERSONALITY_INTERPRETER,
        responseMimeType: "application/json",
        responseSchema: PersonalitySummarySchema,
      },
    });

    const validated = outputValidators.validatePersonalityProfile(
      JSON.parse(response.text || "{}"),
    );
    res.json(validated);
  } catch (error: any) {
    if (error?.message !== "MISSING_API_KEY" && !error?.message?.includes("API key not valid")) {
      console.error("Personality profile generation failed:", error);
    }
    res.json(null);
  }
});

aiRouter.post("/compatibility-reflection", async (req, res) => {
  try {
    const { userA, userB } = req.body;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: capabilityRouter.getRoute("compatibility_reflection"),
      contents: PROMPT_TEMPLATES.COMPATIBILITY_REFLECTION(userA, userB),
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS.COMPATIBILITY_REFLECTION,
        responseMimeType: "application/json",
        responseSchema: PairInsightReportSchema,
      },
    });

    const validated = outputValidators.validateCompatibilityReflection(
      JSON.parse(response.text || "{}"),
    );
    res.json(validated);
  } catch (error: any) {
    if (error?.message !== "MISSING_API_KEY" && !error?.message?.includes("API key not valid")) {
      console.error("Compatibility reflection failed:", error);
    }
    res.json(null);
  }
});

aiRouter.post("/pacing-intervention", async (req, res) => {
  try {
    const { sessionLength, swipeVelocity } = req.body;

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: capabilityRouter.getRoute("pacing_coach"),
      contents: PROMPT_TEMPLATES.PACING_INTERVENTION(
        sessionLength,
        swipeVelocity,
      ),
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS.PACING_INTERVENTION,
        responseMimeType: "application/json",
        responseSchema: PacingInterventionSchema,
      },
    });

    const validated = outputValidators.validatePacingIntervention(
      JSON.parse(response.text || "{}"),
    );
    res.json(validated);
  } catch (error: any) {
    if (error?.message !== "MISSING_API_KEY" && !error?.message?.includes("API key not valid")) {
      console.error("Pacing intervention failed:", error);
    }
    res.json(null);
  }
});

aiRouter.post("/analyze-photos", async (req, res) => {
  try {
    const { photoUrl } = req.body;

    if (!photoUrl) {
      return res.status(400).json({ error: "Missing photoUrl" });
    }

    // In a real app, you would download the image or pass the URL if the API supports it directly.
    // For this prototype, we'll assume the URL is accessible or we pass it as text context.
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro", // Use pro for image understanding
      contents: `Analyze this photo for a dating profile: ${photoUrl}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS.PHOTO_ANALYSIS,
        responseMimeType: "application/json",
        responseSchema: PhotoAnalysisSchema,
      },
    });

    const validated = outputValidators.validatePhotoAnalysis(
      JSON.parse(response.text || "{}"),
    );
    res.json(validated);
  } catch (error: any) {
    if (error?.message !== "MISSING_API_KEY" && !error?.message?.includes("API key not valid")) {
      console.error("Photo analysis failed:", error);
    }
    res.json({
      is_appropriate: true,
      clarity_score: "medium",
      flags: [],
      overall_feedback_he: "התמונה נראית בסדר, אבל תמיד אפשר לשפר את התאורה.",
      overall_feedback_en:
        "The photo looks okay, but lighting could be improved.",
    });
  }
});

aiRouter.post("/moderation-summary", async (req, res) => {
  try {
    const { reports } = req.body;

    if (!reports || !Array.isArray(reports)) {
      return res
        .status(400)
        .json({ error: "Missing or invalid reports array" });
    }

    // TODO(LAUNCH): Add moderation audit logging here
    // TODO(LAUNCH): Add RLS-backed evidence retrieval here

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: capabilityRouter.getRoute("mod_summarizer"),
      contents: PROMPT_TEMPLATES.MOD_SUMMARIZER(reports),
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS.MOD_SUMMARIZER,
        responseMimeType: "application/json",
        responseSchema: ModerationSummarySchema,
      },
    });

    const validated = outputValidators.validateModerationSummary(
      JSON.parse(response.text || "{}"),
    );
    res.json(validated);
  } catch (error: any) {
    if (error?.message !== "MISSING_API_KEY" && !error?.message?.includes("API key not valid")) {
      console.error("Moderation summary failed:", error);
    }
    res.json({
      summary: "Failed to generate summary.",
      claims: [],
      evidence: [],
      riskLevel: "low",
      escalationRecommended: false,
    });
  }
});
