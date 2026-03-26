
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTIONS } from "@/ai/policies";
import { BioCoachSchema, WhyMatchSchema, SafetyScanSchema, DateIdeasSchema, ProfileCompletenessSchema, TasteProfileSchema, DailyPicksIntroSchema } from "@/ai/schemas";
import { capabilityRouter } from "@/ai/capabilityRouter";
import { outputValidators } from "@/ai/outputValidators";
import { PROMPT_TEMPLATES } from "@/ai/prompts";

export const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined. Please ensure it is set in the environment.");
  }
  return new GoogleGenAI({ apiKey });
};

export const aiService = {
  async analyzeTasteProfile(interactions: any, currentProfile: any) {
    // TODO(SERVER-SIDE): Move this Gemini Pro call to a secure backend endpoint.
    // Privacy Guideline: User interactions (likes/passes) and taste profiles contain sensitive preference data.
    // Processing MUST happen securely on the server to protect user privacy and the GEMINI_API_KEY.
    // The client should only receive the resulting structured output.
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: capabilityRouter.getRoute('taste_profile'),
      contents: PROMPT_TEMPLATES.TASTE_PROFILE(interactions, currentProfile),
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS.TASTE_PROFILE,
        responseMimeType: "application/json",
        responseSchema: TasteProfileSchema,
      }
    });
    return outputValidators.validateTasteProfile(JSON.parse(response.text || "{}"));
  },

  async analyzeProfileCompleteness(profile: any) {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: capabilityRouter.getRoute('profile_completeness'),
      contents: PROMPT_TEMPLATES.PROFILE_COMPLETENESS(profile),
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS.PROFILE_COMPLETENESS,
        responseMimeType: "application/json",
        responseSchema: ProfileCompletenessSchema,
      }
    });
    return outputValidators.validateProfileCompleteness(JSON.parse(response.text || "{}"));
  },

  async coachBio(params: { bio_raw: string; tone: string; values: string; dealbreakers: string; length: string }) {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: capabilityRouter.getRoute('bio_coach'),
      contents: PROMPT_TEMPLATES.BIO_COACH(params),
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS.BIO_COACH,
        responseMimeType: "application/json",
        responseSchema: BioCoachSchema,
        temperature: 0.4,
      }
    });
    return outputValidators.validateBioCoach(JSON.parse(response.text || "{}"));
  },

  async generateDailyPicksIntro(userProfile: any) {
    // TODO(SERVER-SIDE): Move this Gemini Pro call to a secure backend endpoint.
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: capabilityRouter.getRoute('why_match'), // Reusing why_match model for general text generation
      contents: `Generate a short, calming, and premium intro for the Daily Picks screen. 
The user's name is ${userProfile.displayName}.
Emphasize that these picks are finite, intentional, and prioritize quality over endless swiping.
Provide the output in both English and Hebrew.`,
      config: {
        systemInstruction: "You are Kesher AI, a calm, respectful, and premium dating assistant. Keep the tone warm, grounded, and serious. Do not use hype or casino-like language.",
        responseMimeType: "application/json",
        responseSchema: DailyPicksIntroSchema,
      }
    });
    return JSON.parse(response.text || "{}");
  },

  async explainMatch(params: { user_profile: any; candidate_profile: any; signals: string[] }) {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: capabilityRouter.getRoute('why_match'),
      contents: PROMPT_TEMPLATES.WHY_MATCH(params),
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS.WHY_MATCH,
        responseMimeType: "application/json",
        responseSchema: WhyMatchSchema,
      }
    });
    return outputValidators.validateWhyMatch(JSON.parse(response.text || "{}"));
  },

  async analyzePhotos(photoUrls: string[]): Promise<string> {
    // This would be a real server route in a production app
    // For now, let's simulate a technical review
    return "Your photos have good lighting and variety. Consider adding a clear headshot as your first photo for better engagement.";
  },

  async rephraseMessage(text: string): Promise<string> {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: capabilityRouter.getRoute('rephrase_message'),
      contents: PROMPT_TEMPLATES.REPHRASE_MESSAGE(text),
      config: {
        systemInstruction: "You are a helpful communication assistant for a respectful dating app.",
      }
    });
    return response.text || text;
  },

  async generateIcebreakerImage(prompt: string): Promise<string> {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: capabilityRouter.getRoute('visual_icebreaker'),
      contents: {
        parts: [
          {
            text: `A calm, premium, artistic illustration for a Jewish dating app icebreaker: ${prompt}. Style: Minimalist, warm, high-end.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return `https://picsum.photos/seed/${encodeURIComponent(prompt)}/800/800`;
  },

  async generateOpeners(profileName: string, bio: string, prompt: string): Promise<string[]> {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: capabilityRouter.getRoute('generate_openers'),
      contents: PROMPT_TEMPLATES.GENERATE_OPENERS({ name: profileName, bio, prompt }),
      config: {
        systemInstruction: "You are a helpful icebreaker assistant. Keep it respectful and Jewish-values aligned.",
      }
    });
    // Simple parsing if not using schema
    return (response.text || "").split('\n').filter(l => l.trim()).slice(0, 3);
  }
};
