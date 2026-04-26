/**
 * Client-side AI service — calls server-side proxy endpoints.
 *
 * All Gemini SDK usage has been moved to server/aiRoutes.ts.
 * This module calls /api/ai/* endpoints via fetch.
 */

import { authFetch } from './authFetch';
import { assertNonEmptyDraft } from './messageCoachInput';

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

  /**
   * Rewrite-first message coach. Requires a non-empty user draft and
   * returns 2–4 alternatives plus a brief explanation of what changed.
   * Never auto-sends; the user must explicitly choose and send.
   */
  async coachMessage(text: string): Promise<{ options: string[]; what_changed: string }> {
    assertNonEmptyDraft(text);
    const data = await post("rephrase", { text });
    return {
      options: Array.isArray(data.options) ? data.options : [data.rephrased || text],
      what_changed: typeof data.what_changed === "string" ? data.what_changed : "",
    };
  },

  /**
   * Back-compat shim: returns the first coached alternative as a string.
   * New callers should prefer `coachMessage` to surface all options and
   * the `what_changed` rationale to the user.
   */
  async rephraseMessage(text: string): Promise<string> {
    const { options } = await this.coachMessage(text);
    return options[0] || text;
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
