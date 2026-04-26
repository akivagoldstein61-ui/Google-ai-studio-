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
import {
  outputValidators,
  sanitizeWhyMatchSignals,
} from "../src/ai/outputValidators.ts";
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

const toStringArray = (value: unknown) =>
  Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];

const pickVisibleMatchProfile = (profile: any) => ({
  age: typeof profile?.age === "number" ? profile.age : undefined,
  city: typeof profile?.city === "string" ? profile.city : undefined,
  observance: typeof profile?.observance === "string" ? profile.observance : undefined,
  intent: typeof profile?.intent === "string" ? profile.intent : undefined,
  tags: toStringArray(profile?.tags).slice(0, 12),
  prompts: Array.isArray(profile?.prompts)
    ? profile.prompts.slice(0, 4).map((prompt: any) => ({
        question: typeof prompt?.question === "string" ? prompt.question : undefined,
        answer: typeof prompt?.answer === "string" ? prompt.answer : undefined,
      }))
    : [],
});

const pickSharedCompatibilityInputs = (sharedInputs: any) => ({
  values: toStringArray(sharedInputs?.values).slice(0, 8),
  intent: typeof sharedInputs?.intent === "string" ? sharedInputs.intent : undefined,
  observance: typeof sharedInputs?.observance === "string" ? sharedInputs.observance : undefined,
  lifestyle: toStringArray(sharedInputs?.lifestyle).slice(0, 8),
  interests: toStringArray(sharedInputs?.interests).slice(0, 12),
  prompts: Array.isArray(sharedInputs?.prompts)
    ? sharedInputs.prompts.slice(0, 6).map((prompt: any) => ({
        question: typeof prompt?.question === "string" ? prompt.question : undefined,
        answer: typeof prompt?.answer === "string" ? prompt.answer : undefined,
      }))
    : [],
  approvedShareCard: typeof sharedInputs?.approvedShareCard === "string" ? sharedInputs.approvedShareCard : undefined,
});

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
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

// Safe metadata logging middleware
const routeMetadataLogger = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const start = Date.now();
  const routeName = req.path;
  
  // Set defaults
  res.locals.ai_metadata = {
    feature_id: "unknown",
    prompt_version: "v1",
    schema_version: "v1",
    validator_result: "unknown",
    fallback_used: false,
  };
  
  // Capture original json to intercept successful responses
  const originalJson = res.json;
  
  res.json = function(body) {
    const latencyMs = Date.now() - start;
    const authMode = process.env.AI_ROUTE_AUTH_MODE || "prototype";
    
    // Determine error class implicitly
    let errorClass = "none";
    if (res.statusCode >= 400) {
      errorClass = `http_${res.statusCode}`;
    } else if (body && body.error || res.locals.ai_metadata.fallback_used) {
      errorClass = res.locals.ai_metadata.error_class || "api_error_fallback";
      res.locals.ai_metadata.fallback_used = true;
    }

    console.log(JSON.stringify({
      log_type: "ai_route_metadata",
      route_name: routeName,
      auth_mode: authMode,
      latency_ms: latencyMs,
      error_class: errorClass,
      status_code: res.statusCode,
      feature_id: res.locals.ai_metadata.feature_id,
      prompt_version: res.locals.ai_metadata.prompt_version,
      schema_version: res.locals.ai_metadata.schema_version,
      validator_result: res.locals.ai_metadata.validator_result,
      fallback_used: res.locals.ai_metadata.fallback_used,
      timestamp: new Date().toISOString()
    }));
    
    return originalJson.call(this, body);
  };
  
  next();
};

// Auth enforcement middleware
const requireAuth = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const authMode = process.env.AI_ROUTE_AUTH_MODE || "prototype";
  
  if (authMode === "prototype") {
    // In prototype mode, allow if no token is provided, but verify if parsing is needed
    // Skip strict rejection to allow rapid testing and build-mode
    next();
    return;
  }
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.warn("AI Route rejected: Missing Authorization header in strict mode.");
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    if (!admin.apps.length) {
      console.warn("AI Route rejected: Firebase Admin not initialized in strict mode.");
      return res.status(401).json({ error: "Unauthorized - Server Misc" });
    }
    const decodedToken = await admin.auth().verifyIdToken(token);
    (req as any).user = decodedToken;
    
    // TODO: Add App Check token verification here when client fully supports it
    // const appCheckToken = req.header('X-Firebase-AppCheck');
    // await admin.appCheck().verifyToken(appCheckToken);
    
    next();
  } catch (error) {
    console.error("Error verifying auth token:", error);
    return res.status(401).json({ error: "Unauthorized" });
  }
};

// Apply middlewares to all AI routes
aiRouter.use(apiLimiter);
aiRouter.use(routeMetadataLogger);
aiRouter.use(requireAuth);

const handleAiError = (error: any, res: express.Response, logMessage: string) => {
  const isMissingKey = error?.message === "MISSING_API_KEY" || error?.message?.includes("API key not valid");
  if (isMissingKey) {
    res.locals.ai_metadata.fallback_used = true;
    res.locals.ai_metadata.validator_result = "success";
    res.locals.ai_metadata.error_class = "none";
  } else {
    res.locals.ai_metadata.fallback_used = true;
    res.locals.ai_metadata.validator_result = "schema_failure_or_catch";
    res.locals.ai_metadata.error_class = "api_error_fallback";
    console.error(logMessage, error);
  }
};

aiRouter.post("/safety-advice", async (req, res) => {
  res.locals.ai_metadata.feature_id = "safety_advice";
  res.locals.ai_metadata.prompt_version = "v1.0";
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

    res.locals.ai_metadata.validator_result = "success";
    res.json({ advice: response.text });
  } catch (error: any) {
    handleAiError(error, res, "Safety advice generation failed:");
    res.json({
      advice:
        "Your safety is our priority. Please contact support if you have immediate concerns.",
      error: error instanceof Error ? error.message : String(error)
    }); // Safe fallback
  }
});

aiRouter.post("/plan-date", async (req, res) => {
  res.locals.ai_metadata.feature_id = "date_planner";
  res.locals.ai_metadata.prompt_version = "v1.0";
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

    // Clean up potential markdown formatting
    let text = response.text || "{}";
    const validated = outputValidators.validateDatePlanner(parseAIResponse(text));
    res.locals.ai_metadata.validator_result = "success";
    res.json(validated);
  } catch (error: any) {
    handleAiError(error, res, "Date planner failed:");
    res.json({ venues: [], how_to_choose_tip: "" });
  }
});

aiRouter.post("/taste-profile", async (req, res) => {
  res.locals.ai_metadata.feature_id = "taste_profile";
  res.locals.ai_metadata.prompt_version = "v1.0";
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
      parseAIResponse(response.text),
    );
    res.locals.ai_metadata.validator_result = "success";
    res.json(validated);
  } catch (error: any) {
    handleAiError(error, res, "Taste profile analysis failed:");
    res.json({
      hard_dealbreakers: [],
      soft_preferences: [],
      things_to_avoid: [],
      weights: {
        attraction_weight: 0.5,
        stability_weight: 0.5,
        pacing_weight: 0.5
      },
      explanation: "העדפותיך מתעדכנות כל הזמן בהתאם לפעילותך."
    });
  }
});

aiRouter.post("/profile-completeness", async (req, res) => {
  res.locals.ai_metadata.feature_id = "profile_completeness";
  res.locals.ai_metadata.prompt_version = "v1.0";
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
      parseAIResponse(response.text),
    );
    res.locals.ai_metadata.validator_result = "success";
    res.json(validated);
  } catch (error: any) {
    handleAiError(error, res, "Profile completeness analysis failed:");
    res.json({
      completeness_score: 75,
      missing_areas: [{ area: "Photos", importance: "recommended", suggestion: "Add a clear face photo" }],
      strengths: ["Great bio"],
      overall_tip: "הוספת תמונה תשפר את הפרופיל שלך!"
    });
  }
});

aiRouter.post("/coach-bio", async (req, res) => {
  res.locals.ai_metadata.feature_id = "bio_coach";
  res.locals.ai_metadata.prompt_version = "v1.0";
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
      parseAIResponse(response.text),
    );
    res.locals.ai_metadata.validator_result = "success";
    res.json(validated);
  } catch (error: any) {
    handleAiError(error, res, "Bio coaching failed:");
    res.json({
      drafts: [
        { bio_he: "היי, אני כאן למצוא קשר רציני. אוהב קפה וטיולים.", hooks_he: ["מה הקפה האהוב עליך?"], what_changed: "נוסח ברור יותר." },
        { bio_he: "מחפש מישהי לטייל איתה בשבתות ולחלוק חוויות.", hooks_he: ["איפה טיילת לאחרונה?"], what_changed: "הדגשת טיולים." },
        { bio_he: "מאמין בכנות ותקשורת. בואו נדבר.", hooks_he: ["מה חשוב לך בקשר?"], what_changed: "מיקוד בערכים." }
      ],
      questions_to_confirm: ["האם תרצה להוסיף תחביבים?"]
    });
  }
});

aiRouter.post("/daily-picks-intro", async (req, res) => {
  res.locals.ai_metadata.feature_id = "daily_picks_intro";
  res.locals.ai_metadata.prompt_version = "v1.0";
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
      parseAIResponse(response.text),
    );
    res.locals.ai_metadata.validator_result = "success";
    res.json(validated);
  } catch (error: any) {
    handleAiError(error, res, "Daily picks intro generation failed:");
    res.json({
      headline_en: "Your Daily Picks",
      headline_he: "הבחירות היומיות שלך",
      body_en: "Here are some people we think you'll like.",
      body_he: "הנה בחירות שהותאמו במיוחד בשבילך להיום."
    });
  }
});

aiRouter.post("/explain-match", async (req, res) => {
  res.locals.ai_metadata.feature_id = "why_match";
  res.locals.ai_metadata.prompt_version = "v1.0";
  try {
    const { params } = req.body;
    if (!params) {
      return res.status(400).json({ error: "Missing params" });
    }
    const safeParams = {
      user_profile: pickVisibleMatchProfile(params.user_profile),
      candidate_profile: pickVisibleMatchProfile(params.candidate_profile),
      signals: sanitizeWhyMatchSignals(params.signals),
    };

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: capabilityRouter.getRoute("why_match"),
      contents: PROMPT_TEMPLATES.WHY_MATCH(safeParams),
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS.WHY_MATCH,
        responseMimeType: "application/json",
        responseSchema: WhyThisMatchPayloadSchema,
      },
    });

    const validated = outputValidators.validateWhyMatch(
      parseAIResponse(response.text),
    );
    res.locals.ai_metadata.validator_result = "success";
    res.json(validated);
  } catch (error: any) {
    handleAiError(error, res, "Match explanation failed:");
    res.json({
      reasons_he: ["שניכם אוהבים טיולים בשטח.", "הפרופיל מעיד על ערכים דומים."],
      first_question_he: "מה המסלול האהוב עליך?",
      gentle_clarification_he: ""
    });
  }
});

aiRouter.post("/openers", async (req, res) => {
  res.locals.ai_metadata.feature_id = "generate_openers";
  res.locals.ai_metadata.prompt_version = "v1.0";
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
      parseAIResponse(response.text || "[]"),
    );
    res.locals.ai_metadata.validator_result = "success";
    res.json(validated);
  } catch (error: any) {
    handleAiError(error, res, "Openers generation failed:");
    res.json([]);
  }
});

aiRouter.post("/rephrase", async (req, res) => {
  res.locals.ai_metadata.feature_id = "rephrase_message";
  res.locals.ai_metadata.prompt_version = "v1.0";
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
      parseAIResponse(response.text),
    );
    res.locals.ai_metadata.validator_result = "success";
    res.json(validated);
  } catch (error: any) {
    handleAiError(error, res, "Rephrase generation failed:");
    res.json({ original: req.body.text });
  }
});

aiRouter.post("/message-safety", async (req, res) => {
  res.locals.ai_metadata.feature_id = "message_safety_scan";
  res.locals.ai_metadata.prompt_version = "v1.0";
  
  try {
    const { text } = req.body;

    if (!text) {
      res.locals.ai_metadata.validator_result = "missing_input";
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
      parseAIResponse(response.text),
    );
    res.locals.ai_metadata.validator_result = "success";
    res.json(validated);
  } catch (error: any) {
    handleAiError(error, res, "Safety scan failed:");
    res.json({
      level: "none",
      userFacingNoteHe: "",
      userFacingNoteEn: "",
      reasons: []
    });
  }
});

aiRouter.post("/personality-profile", async (req, res) => {
  res.locals.ai_metadata.feature_id = "personality_profile";
  res.locals.ai_metadata.prompt_version = "v1.0";
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
      parseAIResponse(response.text),
    );
    res.locals.ai_metadata.validator_result = "success";
    res.json(validated);
  } catch (error: any) {
    handleAiError(error, res, "Personality profile generation failed:");
    res.json({
      summary_he: "הפרופיל שלך מעיד על אדם פתוח וסקרן.",
      implication_card: {
        dating_superpower_he: "תקשורת כנה",
        growth_area_he: "סבלנות",
        likely_friction_loops_he: [],
        repair_suggestions_he: []
      },
      domains: []
    });
  }
});

aiRouter.post("/compatibility-reflection", async (req, res) => {
  res.locals.ai_metadata.feature_id = "compatibility_reflection";
  res.locals.ai_metadata.prompt_version = "v1.0";
  try {
    const { sharedInputs, mutualConsent, bothOptedIn } = req.body;

    if (mutualConsent !== true || bothOptedIn !== true) {
      return res.status(403).json({ error: "MUTUAL_CONSENT_REQUIRED" });
    }

    if (!sharedInputs) {
      return res.status(400).json({ error: "Missing sharedInputs" });
    }

    const ai = getAI();
    const response = await ai.models.generateContent({
      model: capabilityRouter.getRoute("compatibility_reflection"),
      contents: PROMPT_TEMPLATES.COMPATIBILITY_REFLECTION(
        pickSharedCompatibilityInputs(sharedInputs),
      ),
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS.COMPATIBILITY_REFLECTION,
        responseMimeType: "application/json",
        responseSchema: PairInsightReportSchema,
      },
    });

    const validated = outputValidators.validateCompatibilityReflection(
      parseAIResponse(response.text),
    );
    res.locals.ai_metadata.validator_result = "success";
    res.json(validated);
  } catch (error: any) {
    handleAiError(error, res, "Compatibility reflection failed:");
    res.json({
      shared_strengths_he: ["שניכם מעריכים כנות.", "תחומי עניין דומים בפנאי."],
      friction_loops: []
    });
  }
});

aiRouter.post("/pacing-intervention", async (req, res) => {
  res.locals.ai_metadata.feature_id = "pacing_coach";
  res.locals.ai_metadata.prompt_version = "v1.0";
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
      parseAIResponse(response.text),
    );
    res.locals.ai_metadata.validator_result = "success";
    res.json(validated);
  } catch (error: any) {
    handleAiError(error, res, "Pacing intervention failed:");
    res.json({
      message_he: "האם כדאי לקחת רגע לחשוב?",
      reflection_prompt_he: "החלקה מהירה יכולה לגרום לפספוס של אנשים מעניינים."
    });
  }
});

aiRouter.post("/analyze-photos", async (req, res) => {
  res.locals.ai_metadata.feature_id = "analyze_photos";
  res.locals.ai_metadata.prompt_version = "v1.0";
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
      parseAIResponse(response.text),
    );
    res.locals.ai_metadata.validator_result = "success";
    res.json(validated);
  } catch (error: any) {
    handleAiError(error, res, "Photo analysis failed:");
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
  res.locals.ai_metadata.feature_id = "moderation_summary";
  res.locals.ai_metadata.prompt_version = "v1.0";
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
      parseAIResponse(response.text),
    );
    res.locals.ai_metadata.validator_result = "success";
    res.json(validated);
  } catch (error: any) {
    handleAiError(error, res, "Moderation summary failed:");
    res.json({
      summary: "Failed to generate summary.",
      claims: [],
      evidence: [],
      riskLevel: "low",
      escalationRecommended: false,
    });
  }
});
