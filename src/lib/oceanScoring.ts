/**
 * OCEAN scoring + compatibility comparison helpers.
 *
 * Trait-based, not typological. Continuous values, no rigid types.
 * Per kesher-personality-ocean skill.
 *
 * NOTE: existing PersonalityAssessment.tsx uses BFAS-style aspects (e.g.,
 * "Extraversion_Enthusiasm"). This module provides OCEAN-domain views on top
 * of that data so compatibility logic stays simple.
 */

export type OceanDomain = 'Openness' | 'Conscientiousness' | 'Extraversion' | 'Agreeableness' | 'Neuroticism';
export const OCEAN_DOMAINS: OceanDomain[] = ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism'];

export interface OceanScores {
  Openness: number;          // 0..100
  Conscientiousness: number;
  Extraversion: number;
  Agreeableness: number;
  Neuroticism: number;
}

/** Extracts OCEAN-domain scores from a flat scores map produced by the BFAS quiz. */
export function extractOcean(flat: Record<string, number> | undefined): OceanScores | null {
  if (!flat) return null;
  const o: Partial<OceanScores> = {};
  for (const d of OCEAN_DOMAINS) {
    if (typeof flat[d] === 'number') (o as any)[d] = flat[d];
  }
  if (OCEAN_DOMAINS.every(d => typeof (o as any)[d] === 'number')) return o as OceanScores;
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPATIBILITY (illustrative; never shown as a deterministic %)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns harmony, growth, and friction signals between two OCEAN profiles.
 * Output is qualitative bands — the UI must NOT display a single compatibility %.
 */
export interface OceanReflection {
  harmonyAreas: OceanDomain[];
  growthAreas: OceanDomain[];
  frictionAreas: OceanDomain[];
  /** Internal numeric similarity used only for ranking — never shown. */
  internalSimilarity: number; // 0..1
}

const HARMONY_BAND = 12;   // |a-b| <= 12 -> harmony
const FRICTION_BAND = 35;  // |a-b| >= 35 -> friction
// Mid-range deltas are "growth" (complementary differences)

export function reflectOcean(a: OceanScores, b: OceanScores): OceanReflection {
  const harmony: OceanDomain[] = [];
  const growth: OceanDomain[] = [];
  const friction: OceanDomain[] = [];
  let simSum = 0;
  for (const d of OCEAN_DOMAINS) {
    const delta = Math.abs(a[d] - b[d]);
    simSum += 1 - delta / 100;
    if (delta <= HARMONY_BAND) harmony.push(d);
    else if (delta >= FRICTION_BAND) friction.push(d);
    else growth.push(d);
  }
  return {
    harmonyAreas: harmony,
    growthAreas: growth,
    frictionAreas: friction,
    internalSimilarity: simSum / OCEAN_DOMAINS.length,
  };
}

/** Frame Neuroticism as "Emotional Style" in user-facing copy. */
export function userFacingDomainLabel(d: OceanDomain): string {
  return d === 'Neuroticism' ? 'Emotional Style' : d;
}
