/**
 * Server-side AI proxy routes.
 *
 * All Gemini SDK usage lives here — never in the client bundle.
 * Each route corresponds to a registered AI feature in src/ai/featureRegistry.ts.
 * The feature allowlist is enforced: only registered feature IDs are served.
 */

import { Router, Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTIONS } from "../src/ai/policies.js";
import {
  BioCoachSchema,
  WhyMatchSchema,
  SafetyScanSchema,
  DateIdeasSchema,
  ProfileCompletenessSchema,
  TasteProfileSchema,
  DailyPicksIntroSchema,
} from "../src/ai/schemas.js";
import { capabilityRouter } from "../src/ai/capabilityRouter.js";
import { outputValidators } from "../src/ai/outputValidators.js";
import { PROMPT_TEMPLATES } from "../src/ai/prompts.js";
import { AI_FEATURE_REGISTRY } from "../src/ai/featureRegistry.js";
import {
  adaptBioCoachResponse,
  adaptDatePlannerResponse,
  adaptSafetyClassification,
  adaptWhyMatchResponse,
  buildScamWarningScaffold,
  classifySafety,
  validateBioCoachRequest,
  validateDatePlannerRequest,
  validateSafetyClassifierRequest,
  validateWhyMatchRequest,
} from "./aiTrustBackbone.js";

// ---------------------------------------------------------------------------
// Gemini client — server-side only, key from process.env
// ---------------------------------------------------------------------------

function getAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set on the server. AI features are unavailable."
    );
  }
  return new GoogleGenAI({ apiKey });
}

/** Feature allowlist derived from the canonical registry. */
const ALLOWED_FEATURES = new Set(AI_FEATURE_REGISTRY.map((f) => f.id));

function isAllowedFeature(id: string): boolean {
  return ALLOWED_FEATURES.has(id);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Wrap an async route handler so errors become JSON 500s, not crashes. */
function asyncHandler(
  fn: (req: Request, res: Response) => Promise<void>
): (req: Request, res: Response) => void {
  return (req, res) => {
    fn(req, res).catch((err) => {
      console.error(`[AI Route Error]`, err);
      const message =
        err instanceof Error ? err.message : "Internal server error";
      if (!res.headersSent) {
        const status = message.startsWith("Bad request:") ? 400 : 500;
        res.status(status).json({ error: message.replace("Bad request: ", "") });
      }
    });
  };
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

export function createAIRoutes(): Router {
  const router = Router();

  // --- Bio Coach -----------------------------------------------------------
  router.post(
    "/bio-coach",
    asyncHandler(async (req, res) => {
      if (!isAllowedFeature("bio_coach"))
        return void res.status(403).json({ error: "Feature disabled" });

      const { value } = validateBioCoachRequest(req.body);
      const { bio_raw, tone, values, dealbreakers, length } = value;

      const ai = getAI();
      const modelRoute = capabilityRouter.getRoute("bio_coach");
      const response = await ai.models.generateContent({
        model: modelRoute,
        contents: PROMPT_TEMPLATES.BIO_COACH({
          bio_raw,
          tone: tone || "warm",
          values: values || "",
          dealbreakers: dealbreakers || "",
          length: length || "medium",
        }),
        config: {
          systemInstruction: SYSTEM_INSTRUCTIONS.BIO_COACH,
          responseMimeType: "application/json",
          responseSchema: BioCoachSchema,
          temperature: 0.4,
        },
      });

      const data = adaptBioCoachResponse(
        JSON.parse(response.text || "{}"),
        modelRoute
      );
      res.json(data);
    })
  );

  // --- Taste Profile -------------------------------------------------------
  router.post(
    "/taste-profile",
    asyncHandler(async (req, res) => {
      if (!isAllowedFeature("taste_profile"))
        return void res.status(403).json({ error: "Feature disabled" });

      const { interactions, currentProfile } = req.body;
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: capabilityRouter.getRoute("taste_profile"),
        contents: PROMPT_TEMPLATES.TASTE_PROFILE(
          interactions,
          currentProfile
        ),
        config: {
          systemInstruction: SYSTEM_INSTRUCTIONS.TASTE_PROFILE,
          responseMimeType: "application/json",
          responseSchema: TasteProfileSchema,
        },
      });

      const data = outputValidators.validateTasteProfile(
        JSON.parse(response.text || "{}")
      );
      res.json(data);
    })
  );

  // --- Why This Match ------------------------------------------------------
  router.post(
    "/why-match",
    asyncHandler(async (req, res) => {
      if (!isAllowedFeature("why_match"))
        return void res.status(403).json({ error: "Feature disabled" });

      const { value } = validateWhyMatchRequest(req.body);
      const { user_profile, candidate_profile, signals } = value;
      const ai = getAI();
      const modelRoute = capabilityRouter.getRoute("why_match");
      const response = await ai.models.generateContent({
        model: modelRoute,
        contents: PROMPT_TEMPLATES.WHY_MATCH({
          user_profile,
          candidate_profile,
          signals: signals || [],
        }),
        config: {
          systemInstruction: SYSTEM_INSTRUCTIONS.WHY_MATCH,
          responseMimeType: "application/json",
          responseSchema: WhyMatchSchema,
        },
      });

      const data = adaptWhyMatchResponse(
        JSON.parse(response.text || "{}"),
        modelRoute
      );
      res.json(data);
    })
  );

  // --- Safety Scan ---------------------------------------------------------
  router.post(
    "/safety-scan",
    asyncHandler(async (req, res) => {
      if (!isAllowedFeature("safety_scan"))
        return void res.status(403).json({ error: "Feature disabled" });

      const { message_text, context } = req.body;
      if (!message_text)
        return void res
          .status(400)
          .json({ error: "message_text is required" });

      const ai = getAI();
      const response = await ai.models.generateContent({
        model: capabilityRouter.getRoute("safety_scan"),
        contents: PROMPT_TEMPLATES.SAFETY_SCAN({
          message_text,
          context: context || "",
        }),
        config: {
          systemInstruction: SYSTEM_INSTRUCTIONS.SAFETY_SCAN,
          responseMimeType: "application/json",
          responseSchema: SafetyScanSchema,
        },
      });

      const data = outputValidators.validateSafetyScan(
        JSON.parse(response.text || "{}")
      );
      res.json(data);
    })
  );

  // --- Date Planner --------------------------------------------------------
  router.post(
    "/date-planner",
    asyncHandler(async (req, res) => {
      if (!isAllowedFeature("date_planner"))
        return void res.status(403).json({ error: "Feature disabled" });

      const { value } = validateDatePlannerRequest(req.body);
      const { area, time, preferences, budget } = value;

      const ai = getAI();
      const modelRoute = capabilityRouter.getRoute("date_planner");
      const response = await ai.models.generateContent({
        model: modelRoute,
        contents:
          PROMPT_TEMPLATES.DATE_PLANNER({
            area,
            time: time || "",
            preferences: preferences || "",
            budget: budget || "",
          }) +
          "\n\nIMPORTANT: You must return ONLY valid JSON matching the expected schema. Do not include markdown formatting like ```json.",
        config: {
          systemInstruction: SYSTEM_INSTRUCTIONS.DATE_PLANNER,
          tools: [{ googleSearch: {} }],
        },
      });

      let text = response.text || "{}";
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();

      const data = adaptDatePlannerResponse(JSON.parse(text), modelRoute);
      res.json(data);
    })
  );

  // --- Safety Classifier (Phase 1 scaffold) -------------------------------
  router.post(
    "/safety-classifier",
    asyncHandler(async (req, res) => {
      const { value } = validateSafetyClassifierRequest(req.body);
      const classification = classifySafety(value.message_text);
      const data = adaptSafetyClassification(classification, "heuristic-safety-v1");
      res.json(data);
    })
  );

  // --- Scam Warning Scaffold ----------------------------------------------
  router.post(
    "/scam-warning",
    asyncHandler(async (req, res) => {
      const { value } = validateSafetyClassifierRequest(req.body);
      const classification = classifySafety(value.message_text);
      const scaffold = buildScamWarningScaffold(classification);
      res.json({
        classification,
        scaffold,
      });
    })
  );

  // --- Safety Advice -------------------------------------------------------
  router.post(
    "/safety-advice",
    asyncHandler(async (req, res) => {
      if (!isAllowedFeature("safety_advice"))
        return void res.status(403).json({ error: "Feature disabled" });

      const { question } = req.body;
      if (!question)
        return void res
          .status(400)
          .json({ error: "question is required" });

      const ai = getAI();
      const response = await ai.models.generateContent({
        model: capabilityRouter.getRoute("safety_advice"),
        contents: PROMPT_TEMPLATES.SAFETY_ADVICE(question),
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      res.json({
        advice:
          response.text ||
          "Your safety is our priority. Please contact support if you have immediate concerns.",
      });
    })
  );

  // --- Rephrase Message ----------------------------------------------------
  router.post(
    "/rephrase",
    asyncHandler(async (req, res) => {
      if (!isAllowedFeature("rephrase_message"))
        return void res.status(403).json({ error: "Feature disabled" });

      const { text } = req.body;
      if (!text)
        return void res.status(400).json({ error: "text is required" });

      const ai = getAI();
      const response = await ai.models.generateContent({
        model: capabilityRouter.getRoute("rephrase_message"),
        contents: PROMPT_TEMPLATES.REPHRASE_MESSAGE(text),
        config: {
          systemInstruction:
            "You are a helpful communication assistant for a respectful dating app.",
        },
      });

      res.json({ rephrased: response.text || text });
    })
  );

  // --- Generate Openers ----------------------------------------------------
  router.post(
    "/openers",
    asyncHandler(async (req, res) => {
      if (!isAllowedFeature("generate_openers"))
        return void res.status(403).json({ error: "Feature disabled" });

      const { profileName, bio, prompt } = req.body;
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: capabilityRouter.getRoute("generate_openers"),
        contents: PROMPT_TEMPLATES.GENERATE_OPENERS({
          name: profileName || "",
          bio: bio || "",
          prompt: prompt || "",
        }),
        config: {
          systemInstruction:
            "You are a helpful icebreaker assistant. Keep it respectful and Jewish-values aligned.",
        },
      });

      const openers = (response.text || "")
        .split("\n")
        .filter((l: string) => l.trim())
        .slice(0, 3);
      res.json({ openers });
    })
  );

  // --- Profile Completeness ------------------------------------------------
  router.post(
    "/profile-completeness",
    asyncHandler(async (req, res) => {
      if (!isAllowedFeature("profile_completeness"))
        return void res.status(403).json({ error: "Feature disabled" });

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

      const data = outputValidators.validateProfileCompleteness(
        JSON.parse(response.text || "{}")
      );
      res.json(data);
    })
  );

  // --- Daily Picks Intro ---------------------------------------------------
  router.post(
    "/daily-picks-intro",
    asyncHandler(async (req, res) => {
      if (!isAllowedFeature("why_match"))
        return void res.status(403).json({ error: "Feature disabled" });

      const { userProfile } = req.body;
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: capabilityRouter.getRoute("why_match"),
        contents: `Generate a short, calming, and premium intro for the Daily Picks screen.
The user's name is ${userProfile?.displayName || "there"}.
Emphasize that these picks are finite, intentional, and prioritize quality over endless swiping.
Provide the output in both English and Hebrew.`,
        config: {
          systemInstruction:
            "You are Kesher AI, a calm, respectful, and premium dating assistant. Keep the tone warm, grounded, and serious. Do not use hype or casino-like language.",
          responseMimeType: "application/json",
          responseSchema: DailyPicksIntroSchema,
        },
      });

      res.json(JSON.parse(response.text || "{}"));
    })
  );

  // --- Visual Icebreaker ---------------------------------------------------
  router.post(
    "/icebreaker-image",
    asyncHandler(async (req, res) => {
      if (!isAllowedFeature("visual_icebreaker"))
        return void res.status(403).json({ error: "Feature disabled" });

      const { prompt } = req.body;
      if (!prompt)
        return void res
          .status(400)
          .json({ error: "prompt is required" });

      const ai = getAI();
      const response = await ai.models.generateContent({
        model: capabilityRouter.getRoute("visual_icebreaker"),
        contents: {
          parts: [
            {
              text: `A calm, premium, artistic illustration for a Jewish dating app icebreaker: ${prompt}. Style: Minimalist, warm, high-end.`,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
          },
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if ((part as any).inlineData) {
          return void res.json({
            imageUrl: `data:image/png;base64,${(part as any).inlineData.data}`,
          });
        }
      }

      res.json({
        imageUrl: `https://picsum.photos/seed/${encodeURIComponent(prompt)}/800/800`,
      });
    })
  );

  return router;
}
