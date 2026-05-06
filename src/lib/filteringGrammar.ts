/**
 * Kesher Filtering Grammar & Reciprocal Scoring
 *
 * Implements the spec from kesher-filtering-marketplace skill:
 *   - Hard filters (dealbreakers, score=0 if violated)
 *   - Soft preferences (ranking signals)
 *   - System exclusions (blocked, reported, bots)
 *   - Reciprocal harmonic-mean scoring
 *   - Exposure fairness multiplier (new-user boost, starvation prevention, impression cap)
 *
 * NOTE: This is the canonical filter grammar. The existing `DiscoveryPreferences`
 * type uses string IDs for `hardFilters`/`softPreferences`; this module defines
 * what those IDs mean and how they are evaluated.
 */

import type { Profile, ObservanceLevel, IntentType, Gender } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// FILTER GRAMMAR
// ─────────────────────────────────────────────────────────────────────────────

export type HardFilterId =
  | 'age_range'
  | 'max_distance'
  | 'observance_floor'      // must be at least this observant
  | 'shomer_shabbat'        // must keep Shabbat
  | 'kashrut'               // must keep kosher
  | 'gender'
  | 'intent_alignment'
  | 'verified_only';

export type SoftPreferenceId =
  | 'shared_interests'
  | 'shared_observance_label'
  | 'communication_style_match'
  | 'more_like_recent_likes'
  | 'similar_age'
  | 'same_city'
  | 'community_active';

export interface FilterPreferences {
  hard: Partial<Record<HardFilterId, unknown>>;
  soft: Partial<Record<SoftPreferenceId, number>>; // weight 0..1
}

export interface SystemExclusionState {
  blockedUserIds: Set<string>;
  reportedUserIds: Set<string>;
  suspectedBotIds: Set<string>;
}

// ─────────────────────────────────────────────────────────────────────────────
// HARD FILTER EVALUATION
// ─────────────────────────────────────────────────────────────────────────────

const OBSERVANCE_RANK: Record<ObservanceLevel, number> = {
  secular: 0,
  traditional: 1,
  masorti: 2,
  dati: 3,
  modern_orthodox: 4,
  other: 2,             // treat 'other' as mid-range for floor checks
  prefer_not_to_say: 2, // treat as mid-range
};

export interface HardFilterContext {
  ageRange?: [number, number];
  maxDistanceKm?: number;
  observanceFloor?: ObservanceLevel;
  requireShomerShabbat?: boolean;
  requireKashrut?: boolean;
  genderPreference?: Gender[];
  intentPreference?: IntentType[];
  verifiedOnly?: boolean;
  /** observance practice tags from candidate's profile, e.g. ["shomer_shabbat","kasher"] */
  candidatePracticeTags?: string[];
  candidateDistanceKm?: number;
}

export function violatesHardFilters(
  candidate: Profile,
  ctx: HardFilterContext
): { violates: true; reason: HardFilterId } | { violates: false } {
  if (ctx.ageRange && (candidate.age < ctx.ageRange[0] || candidate.age > ctx.ageRange[1])) {
    return { violates: true, reason: 'age_range' };
  }
  if (ctx.maxDistanceKm != null && ctx.candidateDistanceKm != null
      && ctx.candidateDistanceKm > ctx.maxDistanceKm) {
    return { violates: true, reason: 'max_distance' };
  }
  if (ctx.observanceFloor &&
      OBSERVANCE_RANK[candidate.observance] < OBSERVANCE_RANK[ctx.observanceFloor]) {
    return { violates: true, reason: 'observance_floor' };
  }
  if (ctx.requireShomerShabbat &&
      !(ctx.candidatePracticeTags ?? []).includes('shomer_shabbat')) {
    return { violates: true, reason: 'shomer_shabbat' };
  }
  if (ctx.requireKashrut &&
      !(ctx.candidatePracticeTags ?? []).some(t => ['mehadrin', 'kasher', 'kasher_babayit'].includes(t))) {
    return { violates: true, reason: 'kashrut' };
  }
  if (ctx.genderPreference && ctx.genderPreference.length > 0 &&
      !ctx.genderPreference.includes(candidate.gender)) {
    return { violates: true, reason: 'gender' };
  }
  if (ctx.intentPreference && ctx.intentPreference.length > 0 &&
      !ctx.intentPreference.includes(candidate.intent)) {
    return { violates: true, reason: 'intent_alignment' };
  }
  if (ctx.verifiedOnly && !candidate.isVerified) {
    return { violates: true, reason: 'verified_only' };
  }
  return { violates: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// DIRECTIONAL SCORE: Score(A likes B)
// ─────────────────────────────────────────────────────────────────────────────

export interface DirectionalScoreInput {
  viewer: Profile;
  candidate: Profile;
  hardCtx: HardFilterContext;
  softWeights: Partial<Record<SoftPreferenceId, number>>;
  /** dot product of viewer.tasteVector · candidate.featureVector, range [-1,1] */
  implicitAffinity?: number;
  /** 0..0.2 contextual nudge (both online, same city tonight, etc) */
  contextBoost?: number;
}

export interface DirectionalScore {
  score: number;            // 0..1
  hardViolation?: HardFilterId;
  reasonCodes: string[];    // whitelisted reason codes (no PII, no hidden weights)
  components: {
    explicitMatch: number;
    implicitAffinity: number;
    contextBoost: number;
  };
}

export function directionalScore(input: DirectionalScoreInput): DirectionalScore {
  const hv = violatesHardFilters(input.candidate, input.hardCtx);
  if (hv.violates) {
    return {
      score: 0,
      hardViolation: hv.reason,
      reasonCodes: [],
      components: { explicitMatch: 0, implicitAffinity: 0, contextBoost: 0 },
    };
  }

  // Explicit match — score 0..1 over soft preferences
  const reasonCodes: string[] = [];
  let explicitWeightSum = 0;
  let explicitMatchSum = 0;

  const sharedInterests = sharedTagsCount(input.viewer.tags, input.candidate.tags);
  if (input.softWeights.shared_interests && sharedInterests > 0) {
    const w = input.softWeights.shared_interests;
    const v = Math.min(1, sharedInterests / 4);
    explicitMatchSum += w * v;
    explicitWeightSum += w;
    if (sharedInterests >= 2) reasonCodes.push('shared_interests');
  }
  if (input.softWeights.shared_observance_label &&
      input.viewer.observance === input.candidate.observance) {
    const w = input.softWeights.shared_observance_label;
    explicitMatchSum += w;
    explicitWeightSum += w;
    reasonCodes.push('shared_observance_label');
  }
  if (input.softWeights.similar_age) {
    const w = input.softWeights.similar_age;
    const ageDelta = Math.abs(input.viewer.age - input.candidate.age);
    const v = Math.max(0, 1 - ageDelta / 12);
    explicitMatchSum += w * v;
    explicitWeightSum += w;
  }
  if (input.softWeights.same_city && input.viewer.city === input.candidate.city) {
    const w = input.softWeights.same_city;
    explicitMatchSum += w;
    explicitWeightSum += w;
  }
  if (input.viewer.intent === input.candidate.intent) {
    reasonCodes.push('shared_intent');
  }

  const explicitMatch = explicitWeightSum > 0 ? explicitMatchSum / explicitWeightSum : 0;
  const implicitAffinity = clamp01((input.implicitAffinity ?? 0 + 1) / 2);
  const contextBoost = Math.max(0, Math.min(0.2, input.contextBoost ?? 0));

  // Per spec: w1 + w2 + w3 weights — keep w3 small per skill doc
  const w1 = 0.5, w2 = 0.4, w3 = 0.1;
  const raw = w1 * explicitMatch + w2 * implicitAffinity + w3 * (contextBoost / 0.2);

  if (implicitAffinity > 0.7) reasonCodes.push('taste_driven');

  return {
    score: clamp01(raw),
    reasonCodes,
    components: { explicitMatch, implicitAffinity, contextBoost },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// RECIPROCAL HARMONIC MEAN
// ─────────────────────────────────────────────────────────────────────────────

export function reciprocalScore(aLikesB: number, bLikesA: number): number {
  if (aLikesB <= 0 || bLikesA <= 0) return 0;
  return (2 * aLikesB * bLikesA) / (aLikesB + bLikesA);
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPOSURE FAIRNESS
// ─────────────────────────────────────────────────────────────────────────────

export interface FairnessState {
  /** ms since user account created */
  candidateAccountAgeMs: number;
  /** impressions for candidate over the last 7 days */
  impressionsLast7d: number;
  /** impressions for candidate over the last 24 hours */
  impressionsLast24h: number;
}

export function fairnessMultiplier(s: FairnessState): number {
  const SEVENTY_TWO_HOURS_MS = 72 * 60 * 60 * 1000;
  if (s.candidateAccountAgeMs < SEVENTY_TWO_HOURS_MS) return 1.5;            // new-user boost
  if (s.impressionsLast24h > 500) return 0.5;                                 // popularity cool-down
  if (s.impressionsLast7d < 10) return 1.2 + (10 - s.impressionsLast7d) * 0.05; // anti-starvation
  return 1.0;
}

export function adjustedFinalScore(reciprocal: number, fairness: number): number {
  return reciprocal * fairness;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function sharedTagsCount(a: string[], b: string[]): number {
  const set = new Set(a.map(t => t.toLowerCase()));
  return b.filter(t => set.has(t.toLowerCase())).length;
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}
