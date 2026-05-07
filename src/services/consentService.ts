/**
 * Client-side consent service for compatibility reflection (Gate 5).
 *
 * Mutual consent is required before any AI-generated compatibility reflection
 * can be shown. Both users must opt in to share specific signals; either can
 * revoke at any time.
 *
 * The UI uses these methods to:
 *   1. requestConsent: Show "ask peer to compare reflections" CTA
 *   2. grantConsent: Accept an incoming consent request
 *   3. revokeConsent: Remove consent (e.g., from settings)
 *   4. getStatus: Check current state before showing/loading reflection
 */

import { auth, appCheck } from "@/firebase";
import { getToken as getAppCheckToken } from "firebase/app-check";
import { isPrototypeDemoMode } from "@/lib/prototypeMode";

export type ConsentSignal =
  | "mutually_shared_values"
  | "mutually_visible_intent"
  | "mutually_visible_observance"
  | "mutually_visible_lifestyle"
  | "mutually_visible_interests"
  | "mutually_visible_prompts"
  | "mutually_approved_share_card";

export const ALL_CONSENT_SIGNALS: ConsentSignal[] = [
  "mutually_shared_values",
  "mutually_visible_intent",
  "mutually_visible_observance",
  "mutually_visible_lifestyle",
  "mutually_visible_interests",
  "mutually_visible_prompts",
  "mutually_approved_share_card",
];

/** Plain-language label per signal for the consent UI */
export const SIGNAL_LABELS: Record<ConsentSignal, { he: string; en: string }> = {
  mutually_shared_values: {
    he: "ערכים שכתבת בפרופיל",
    en: "Values you wrote in your profile",
  },
  mutually_visible_intent: {
    he: "סוג הקשר שאת/ה מחפש/ת",
    en: "The relationship intent you set",
  },
  mutually_visible_observance: {
    he: "רמת השמירה שלך",
    en: "Your observance level",
  },
  mutually_visible_lifestyle: {
    he: "פרטי אורח חיים שכתבת",
    en: "Lifestyle details you shared",
  },
  mutually_visible_interests: {
    he: "תחומי עניין מהפרופיל",
    en: "Interests from your profile",
  },
  mutually_visible_prompts: {
    he: "תשובות לשאלות הפרופיל",
    en: "Profile prompt answers",
  },
  mutually_approved_share_card: {
    he: "כרטיס שיקוף שאישרת לשתף",
    en: "Reflection card you approved to share",
  },
};

export interface ConsentStatus {
  consentId: string;
  state: "none" | "requested_by_me" | "requested_by_peer" | "mutual" | "revoked";
  bothConsented: boolean;
  mutualSignals: ConsentSignal[];
  myGrantedSignals: ConsentSignal[];
  peerGrantedSignals: ConsentSignal[];
}

const headers = async () => {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (auth.currentUser) {
    h["Authorization"] = `Bearer ${await auth.currentUser.getIdToken()}`;
  }
  if (appCheck) {
    try {
      const result = await getAppCheckToken(appCheck, false);
      if (result?.token) h["X-Firebase-AppCheck"] = result.token;
    } catch {
      // non-fatal in prototype mode
    }
  }
  return h;
};

const post = async (path: string, body: any) => {
  if (isPrototypeDemoMode()) {
    throw new Error("DEMO_MODE_API_DISABLED");
  }
  const res = await fetch(path, {
    method: "POST",
    headers: await headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Consent API ${path} failed: ${res.status} ${txt}`);
  }
  return res.json();
};

const get = async (path: string) => {
  if (isPrototypeDemoMode()) {
    throw new Error("DEMO_MODE_API_DISABLED");
  }
  const res = await fetch(path, { headers: await headers() });
  if (!res.ok) throw new Error(`Consent API ${path} failed: ${res.status}`);
  return res.json();
};

export const consentService = {
  async requestConsent(peerUid: string, signals: ConsentSignal[]) {
    return post("/api/consent/request", { peerUid, signals });
  },

  async grantConsent(peerUid: string, signals: ConsentSignal[]) {
    return post("/api/consent/grant", { peerUid, signals });
  },

  async revokeConsent(peerUid: string) {
    return post("/api/consent/revoke", { peerUid });
  },

  async getStatus(peerUid: string): Promise<ConsentStatus> {
    return get(`/api/consent/status/${encodeURIComponent(peerUid)}`);
  },
};
