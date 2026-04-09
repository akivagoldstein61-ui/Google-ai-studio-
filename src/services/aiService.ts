/**
 * Client-side AI service — calls server-side proxy endpoints.
 *
 * All Gemini SDK usage has been moved to server/aiRoutes.ts.
 * This module calls /api/ai/* endpoints via fetch.
 */

import { authFetch } from './authFetch';

async function post(endpoint: string, body: Record<string, unknown>): Promise<any> {
  const res = await authFetch(`/api/ai/${endpoint}`, {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Server error" }));
    throw new Error(err.error || `AI request failed: ${res.status}`);
  }

  return res.json();
}

export const aiService = {
  async analyzeTasteProfile(interactions: any, currentProfile: any) {
    return post("taste-profile", { interactions, currentProfile });
  },

  async analyzeProfileCompleteness(profile: any) {
    return post("profile-completeness", { profile });
  },

  async coachBio(params: { bio_raw: string; tone: string; values: string; dealbreakers: string; length: string }) {
    return post("bio-coach", params);
  },

  async generateDailyPicksIntro(userProfile: any) {
    return post("daily-picks-intro", { userProfile });
  },

  async explainMatch(params: { user_profile: any; candidate_profile: any; signals: string[] }) {
    return post("why-match", params);
  },

  async analyzePhotos(_photoUrls: string[]): Promise<string> {
    // Placeholder — no Gemini call, returns static advice
    return "Your photos have good lighting and variety. Consider adding a clear headshot as your first photo for better engagement.";
  },

  async rephraseMessage(text: string): Promise<string> {
    const data = await post("rephrase", { text });
    return data.rephrased || text;
  },

  async generateIcebreakerImage(prompt: string): Promise<string> {
    const data = await post("icebreaker-image", { prompt });
    return data.imageUrl || `https://picsum.photos/seed/${encodeURIComponent(prompt)}/800/800`;
  },

  async generateOpeners(profileName: string, bio: string, prompt: string): Promise<string[]> {
    const data = await post("openers", { profileName, bio, prompt });
    return data.openers || [];
  }
};
