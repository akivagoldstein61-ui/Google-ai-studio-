/**
 * Data Classification Contract
 *
 * Every AI feature must declare which classes of user data it is allowed to
 * see and which classes are forbidden. Server routes and validators enforce
 * these classes; the registry declares them. This is policy + runtime guard,
 * not just documentation.
 *
 * - PUBLIC_PROFILE       — fields the user has chosen to display on their
 *                          profile (name, age, city, photos, bio, prompts,
 *                          intent, observance, displayed values_tags).
 * - PERMISSIONED_SUMMARY — derived summaries the user has explicitly opted
 *                          into sharing (e.g. mutual values overlap shown
 *                          on a match card after both users consent).
 * - PRIVATE_INFERRED     — internal inferences the user did NOT opt to
 *                          share with anyone else (private taste profile,
 *                          hidden ranking weights, behavioral history,
 *                          personality scores).
 * - SYSTEM_ONLY_SAFETY   — fields used solely for safety / moderation
 *                          (raw message text in safety scan, report bundles).
 *                          Must never leak into user-visible explanations.
 */

export const DATA_CLASS = {
  PUBLIC_PROFILE: 'PUBLIC_PROFILE',
  PERMISSIONED_SUMMARY: 'PERMISSIONED_SUMMARY',
  PRIVATE_INFERRED: 'PRIVATE_INFERRED',
  SYSTEM_ONLY_SAFETY: 'SYSTEM_ONLY_SAFETY',
} as const;

export type DataClass = typeof DATA_CLASS[keyof typeof DATA_CLASS];

/**
 * Whitelisted signals the WhyThisMatch feature is allowed to receive from
 * the client. Server routes intersect incoming `signals` against this set
 * and silently drop anything else, regardless of what the client requests.
 */
export const WHY_MATCH_ALLOWED_SIGNALS = [
  'interests',
  'intent',
  'observance',
  'values_tags',
  'city',
  'age_range',
  'lifestyle_visible',
  'displayed_prompts',
] as const;

export type WhyMatchSignal = typeof WHY_MATCH_ALLOWED_SIGNALS[number];

/**
 * Signals that must NEVER appear in WhyThisMatch input or output. These come
 * from the private taste profile, internal ranking, or sensitive inference.
 * If the validator sees any of these strings as a "signal_used", reject.
 */
export const WHY_MATCH_FORBIDDEN_SIGNALS = [
  'private_preferences',
  'private_taste_profile',
  'hidden_ranking_weights',
  'safety_flags',
  'raw_personality_scores',
  'behavioral_history',
  'inferred_protected_traits',
  'photo_inference',
  'attractiveness_score',
] as const;

/**
 * Phrases that must never appear in any user-visible AI explanation about
 * matches or compatibility. This protects against the model regressing into
 * casino / deterministic / soulmate framings even when the prompt forbids it.
 */
export const BANNED_MATCH_PHRASES = [
  'perfect match',
  'soulmate',
  'compatibility score',
  'marriage probability',
  'your type',
] as const;

/** Case-insensitive containment check for any banned phrase. */
export function containsBannedPhrase(text: string): string | null {
  const lower = text.toLowerCase();
  for (const phrase of BANNED_MATCH_PHRASES) {
    if (lower.includes(phrase)) return phrase;
  }
  return null;
}

/**
 * Filter client-supplied WhyMatch signals against the server-side allowlist.
 * Returns only signals that appear in WHY_MATCH_ALLOWED_SIGNALS.
 */
export function filterWhyMatchSignals(input: unknown): WhyMatchSignal[] {
  if (!Array.isArray(input)) return [];
  const allowed = new Set<string>(WHY_MATCH_ALLOWED_SIGNALS);
  return input
    .filter((s): s is string => typeof s === 'string')
    .filter((s) => allowed.has(s)) as WhyMatchSignal[];
}
