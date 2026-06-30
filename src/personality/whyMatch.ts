import type { Profile } from "../types.ts";
import {
  type WhyThisMatchCard,
  WhyThisMatchCardSchema,
} from "./zodSchemas.ts";

export const WHY_MATCH_ALLOWED_SIGNALS = [
  "interests",
  "intent",
  "observance",
  "city",
] as const;

const BLOCKED_SIGNAL_ALIASES = new Set([
  "private_personality",
  "personality",
  "personality_scores",
  "private_taste",
  "safety_flags",
  "hidden_rank",
  "hidden_personality_rank",
  "raw_messages",
  "private_messages",
]);

export interface ExplanationBundleInput {
  userProfile: Partial<Profile> & Record<string, unknown>;
  candidateProfile: Partial<Profile> & Record<string, unknown>;
  requestedSignals: string[];
}

export interface WhitelistedExplanationBundle {
  schema_version: "1.0";
  user_public_profile: {
    tags: string[];
    intent?: string;
    observance?: string;
    city?: string;
  };
  candidate_public_profile: {
    tags: string[];
    intent?: string;
    observance?: string;
    city?: string;
  };
  publicFacts: {
    sharedInterests: string[];
    sharedIntent?: string;
    sharedObservance?: string;
    sharedCity?: string;
  };
  signals_used: string[];
  signals_not_used: string[];
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function normalizeProfile(profile: Partial<Profile> & Record<string, unknown>) {
  return {
    tags: asStringArray(profile.tags),
    intent: typeof profile.intent === "string" ? profile.intent : undefined,
    observance:
      typeof profile.observance === "string" ? profile.observance : undefined,
    city: typeof profile.city === "string" ? profile.city : undefined,
  };
}

export function buildWhitelistedExplanationBundle({
  userProfile,
  candidateProfile,
  requestedSignals,
}: ExplanationBundleInput): WhitelistedExplanationBundle {
  const userPublic = normalizeProfile(userProfile);
  const candidatePublic = normalizeProfile(candidateProfile);
  const allowedRequested = requestedSignals.filter(
    (signal) =>
      (WHY_MATCH_ALLOWED_SIGNALS as readonly string[]).includes(signal) &&
      !BLOCKED_SIGNAL_ALIASES.has(signal),
  );

  const signalsUsed: string[] = [];
  const signalsNotUsed = requestedSignals.filter(
    (signal) => !allowedRequested.includes(signal),
  );

  const sharedInterests = userPublic.tags.filter((tag) =>
    candidatePublic.tags.includes(tag),
  );

  if (allowedRequested.includes("interests") && sharedInterests.length > 0) {
    signalsUsed.push("interests");
  }

  const sharedIntent =
    allowedRequested.includes("intent") &&
    userPublic.intent &&
    userPublic.intent === candidatePublic.intent
      ? userPublic.intent
      : undefined;
  if (sharedIntent) signalsUsed.push("intent");

  const sharedObservance =
    allowedRequested.includes("observance") &&
    userPublic.observance &&
    userPublic.observance === candidatePublic.observance
      ? userPublic.observance
      : undefined;
  if (sharedObservance) signalsUsed.push("observance");

  const sharedCity =
    allowedRequested.includes("city") &&
    userPublic.city &&
    userPublic.city === candidatePublic.city
      ? userPublic.city
      : undefined;
  if (sharedCity) signalsUsed.push("city");

  return {
    schema_version: "1.0",
    user_public_profile: userPublic,
    candidate_public_profile: candidatePublic,
    publicFacts: {
      sharedInterests,
      sharedIntent,
      sharedObservance,
      sharedCity,
    },
    signals_used: signalsUsed,
    signals_not_used: [...new Set(signalsNotUsed)],
  };
}

export function validateWhyThisMatchCard(output: unknown): WhyThisMatchCard {
  return WhyThisMatchCardSchema.parse(output);
}

export function createFallbackWhyThisMatchCard(
  bundle: Pick<WhitelistedExplanationBundle, "signals_used" | "signals_not_used" | "publicFacts">,
): WhyThisMatchCard {
  const reasons: string[] = [];

  if (bundle.publicFacts.sharedInterests.length > 0) {
    reasons.push(
      `יש לכם עניין משותף ב${bundle.publicFacts.sharedInterests[0]}, שיכול לפתוח שיחה טבעית.`,
    );
  }
  if (bundle.publicFacts.sharedIntent) {
    reasons.push("שניכם מציינים כוונה דומה בקשר, בלי שזה מבטיח התאמה.");
  }
  if (bundle.publicFacts.sharedObservance) {
    reasons.push("יש ביניכם דמיון מסוים באורח החיים המוצהר בפרופיל.");
  }
  if (reasons.length < 2) {
    reasons.push("ההסבר מבוסס רק על פרטים ציבוריים ומוצהרים בפרופיל.");
  }
  if (reasons.length < 2) {
    reasons.push("כדאי לבדוק בשיחה אם הקצב והציפיות מרגישים נכונים לשניכם.");
  }

  return {
    schema_version: "1.0",
    reasons_he: reasons.slice(0, 3),
    first_question_he: "מה דבר קטן בפרופיל שלך שהיית שמח/ה שיבינו נכון?",
    gentle_clarification_he: "זהו הסבר עדין, לא ציון התאמה או תחזית לקשר.",
    signals_used: bundle.signals_used,
    signals_not_used: bundle.signals_not_used,
  };
}
