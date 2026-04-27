import {
  BioCoachSchema,
  WhyMatchSchema,
  SafetyScanSchema,
  DateIdeasSchema,
  ProfileCompletenessSchema,
  TasteProfileSchema,
  DailyPicksIntroSchema,
  OpenersSchema,
  RephraseSchema,
  MessageSafetyScanSchema,
  ModerationSummarySchema,
} from "@/ai/schemas";

import { auth } from "@/firebase";

const getHeaders = async () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};


const safeApiFetch = async (url: string, bodyObj: any) => {
  const response = await fetch(url, {
    method: "POST",
    headers: await getHeaders(),
    body: JSON.stringify(bodyObj),
  });
  
  if (!response.ok) throw new Error(`Server error: ${response.status}`);
  
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error("INVALID_JSON_RESPONSE");
  }
  
  return await response.json();
};

export const aiService = {
  async analyzeTasteProfile(interactions: any, currentProfile: any) {
    try {
      return await safeApiFetch("/api/ai/taste-profile", { interactions, currentProfile });
    } catch (e: any) {
      if (e?.message !== "INVALID_JSON_RESPONSE") {
        console.error("Taste profile API call failed", e);
      }
      return null;
    }
  },

  async analyzeProfileCompleteness(profile: any) {
    try {
      return await safeApiFetch("/api/ai/profile-completeness", { profile });
    } catch (e: any) {
      if (e?.message !== "INVALID_JSON_RESPONSE") {
        console.error("Profile completeness API call failed", e);
      }
      return {
        completeness_score: 80,
        missing_areas: [
          {
            area: "Photos",
            importance: "recommended",
            suggestion: "Add a full-body photo",
          },
        ],
        strengths: ["Detailed bio"],
        overall_tip: "Your profile is looking good!",
      };
    }
  },

  async coachBio(params: {
    bio_raw: string;
    tone: string;
    values: string;
    dealbreakers: string;
    length: string;
  }) {
    try {
      return await safeApiFetch("/api/ai/coach-bio", { params });
    } catch (e: any) {
      if (e?.message !== "INVALID_JSON_RESPONSE") {
        console.error("Coach bio API call failed", e);
      }
      return null;
    }
  },

  async generateDailyPicksIntro(userProfile: any) {
    try {
      return await safeApiFetch("/api/ai/daily-picks-intro", { userProfile });
    } catch (e: any) {
      if (e?.message !== "INVALID_JSON_RESPONSE") {
        console.error("Daily picks intro API call failed", e);
      }
      return null;
    }
  },

  async explainMatch(params: {
    user_profile: any;
    candidate_profile: any;
    signals: string[];
  }) {
    try {
      return await safeApiFetch("/api/ai/explain-match", { params });
    } catch (e: any) {
      if (e?.message !== "INVALID_JSON_RESPONSE") {
        console.error("Explain match API call failed", e);
      }
      return null;
    }
  },

  async analyzePhotos(photoUrls: string[]) {
    try {
      // For MVP, just analyze the first photo
      const photoUrl = photoUrls[0];
      if (!photoUrl) return null;

      return await safeApiFetch("/api/ai/analyze-photos", { photoUrl });
    } catch (e: any) {
      if (e?.message !== "INVALID_JSON_RESPONSE") {
        console.error("Photo analysis API call failed", e);
      }
      return {
        is_appropriate: true,
        clarity_score: "medium",
        flags: [],
        overall_feedback_he: "התמונה נראית בסדר, אבל תמיד אפשר לשפר את התאורה.",
        overall_feedback_en:
          "The photo looks okay, but lighting could be improved.",
      };
    }
  },

  async rephraseMessage(text: string) {
    try {
      return await safeApiFetch("/api/ai/rephrase", { text });
    } catch (e: any) {
      if (e?.message !== "INVALID_JSON_RESPONSE") {
        console.error("Rephrase API call failed", e);
      }
      return { original: text };
    }
  },

  async generateOpeners(profileName: string, bio: string, prompt: string) {
    try {
      return await safeApiFetch("/api/ai/openers", { profileName, bio, prompt });
    } catch (e: any) {
      if (e?.message !== "INVALID_JSON_RESPONSE") {
        console.error("Openers API call failed", e);
      }
      return [];
    }
  },

  async getPersonalityProfile(userProfile: any) {
    try {
      return await safeApiFetch("/api/ai/personality-profile", { userProfile });
    } catch (e: any) {
      if (e?.message !== "INVALID_JSON_RESPONSE") {
        console.error("Personality profile API call failed", e);
      }
      return null;
    }
  },

  async getCompatibilityReflection(userA: any, userB: any) {
    try {
      return await safeApiFetch("/api/ai/compatibility-reflection", { userA, userB });
    } catch (e: any) {
      if (e?.message !== "INVALID_JSON_RESPONSE") {
        console.error("Compatibility reflection API call failed", e);
      }
      return null;
    }
  },

  async getPacingIntervention(sessionLength: number, swipeVelocity: number) {
    try {
      return await safeApiFetch("/api/ai/pacing-intervention", { sessionLength, swipeVelocity });
    } catch (e: any) {
      if (e?.message !== "INVALID_JSON_RESPONSE") {
        console.error("Pacing intervention API call failed", e);
      }
      return null;
    }
  },
};
