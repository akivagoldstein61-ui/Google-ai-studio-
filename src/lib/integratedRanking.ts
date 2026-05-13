/**
 * End-to-end ranking orchestrator that composes:
 *   - filteringGrammar (hard/soft + reciprocal + fairness)
 *   - learnedTaste (implicit affinity from dual-memory state)
 *   - observanceLayer (private practice alignment)
 *   - explanationSchema (whitelisted evidence packet)
 *
 * Produces, for a viewer + candidate pair:
 *   - admissible? (hard filters)
 *   - score (reciprocal × fairness)
 *   - evidence packet (safe to send to explanation generator)
 */

import type { Profile } from '@/types';
import {
  directionalScore, reciprocalScore, fairnessMultiplier, adjustedFinalScore,
  type HardFilterContext, type SoftPreferenceId, type FairnessState,
} from './filteringGrammar';
import { implicitAffinity, type TasteState } from './learnedTaste';
import { practiceAreaAlignment, type ObservanceProfile } from './observanceLayer';
import type { EvidencePacket, ActivityStatus } from './explanationSchema';

export interface RankingInput {
  viewer: Profile;
  candidate: Profile;
  viewerHardCtx: HardFilterContext;
  viewerSoftWeights: Partial<Record<SoftPreferenceId, number>>;
  candidateHardCtx: HardFilterContext;
  candidateSoftWeights: Partial<Record<SoftPreferenceId, number>>;
  viewerTaste: TasteState;
  candidateTaste: TasteState;
  candidateFeatures: string[];
  viewerFeatures: string[];
  fairness: FairnessState;
  /** observance practices for ranking-only private compat layer */
  viewerObservance?: ObservanceProfile;
  candidateObservance?: ObservanceProfile;
  /** ms since candidate last active (for activity status only) */
  candidateLastActiveAgoMs?: number;
  /** Lifetime profile impressions for the candidate — drives anti-starvation boost. */
  candidateImpressions?: number;
}

export interface RankingResult {
  admissible: boolean;
  hardViolation?: string;
  finalScore: number;        // 0..1ish (post-fairness; can exceed 1 with boosts)
  reciprocal: number;
  multiplier: number;        // fairness multiplier from filteringGrammar
  boost: number;             // anti-starvation + new-user boost (1.0 = none)
  evidence: EvidencePacket;
  privateAlignment: { alignedAreas: string[]; totalAreas: number };
}

const NEW_USER_WINDOW_MS = 72 * 60 * 60 * 1000;       // 3 days
const ACTIVE_RECENT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const STARVATION_THRESHOLD_IMPRESSIONS = 50;          // candidates below this get a bump
const STARVATION_BOOST = 0.20;                        // multiplicative
const NEW_USER_BOOST = 0.15;                          // multiplicative
const NEW_USER_BOOST_DECAY_MS = NEW_USER_WINDOW_MS;   // boost fades to zero across the window
const FAIRNESS_CAP = 1.50;                            // never compound past 1.5x

/**
 * Compute a fairness boost multiplier for a candidate.
 *
 * Two purposes:
 *   1. Anti-starvation — candidates with very few profile impressions get
 *      a small bump so the marketplace doesn't collapse on a top decile.
 *   2. New-user boost — accounts in the {@link NEW_USER_WINDOW_MS} window
 *      get visibility help that decays linearly to zero at the boundary.
 *
 * The multiplier is bounded at {@link FAIRNESS_CAP} so no candidate ever
 * jumps more than 50% above their organic score. This protects against
 * gaming (creating new accounts) and protects taste signal integrity.
 */
export function computeBoostMultiplier(input: {
  candidateImpressions: number;
  candidateAccountAgeMs: number;
}): number {
  let boost = 1.0;

  // Anti-starvation: under-exposed candidates get a small lift.
  if (input.candidateImpressions < STARVATION_THRESHOLD_IMPRESSIONS) {
    const ratio = 1 - input.candidateImpressions / STARVATION_THRESHOLD_IMPRESSIONS;
    boost += STARVATION_BOOST * ratio;
  }

  // New-user boost: linear decay from full boost at age=0 → 0 at NEW_USER_WINDOW_MS.
  if (input.candidateAccountAgeMs < NEW_USER_BOOST_DECAY_MS) {
    const ageRatio = 1 - input.candidateAccountAgeMs / NEW_USER_BOOST_DECAY_MS;
    boost += NEW_USER_BOOST * Math.max(0, ageRatio);
  }

  return Math.min(boost, FAIRNESS_CAP);
}

export function rank(input: RankingInput): RankingResult {
  const aff_v = implicitAffinity(input.viewerTaste, input.candidateFeatures);
  const aff_c = implicitAffinity(input.candidateTaste, input.viewerFeatures);

  const a = directionalScore({
    viewer: input.viewer,
    candidate: input.candidate,
    hardCtx: input.viewerHardCtx,
    softWeights: input.viewerSoftWeights,
    implicitAffinity: aff_v,
  });
  const b = directionalScore({
    viewer: input.candidate,
    candidate: input.viewer,
    hardCtx: input.candidateHardCtx,
    softWeights: input.candidateSoftWeights,
    implicitAffinity: aff_c,
  });

  if (a.score === 0 || b.score === 0) {
    return {
      admissible: false,
      hardViolation: a.hardViolation ?? b.hardViolation,
      finalScore: 0,
      reciprocal: 0,
      multiplier: 0,
      boost: 1,
      evidence: emptyPacket(),
      privateAlignment: { alignedAreas: [], totalAreas: 4 },
    };
  }

  const reciprocal = reciprocalScore(a.score, b.score);
  const multiplier = fairnessMultiplier(input.fairness);

  // Layer 2 fairness: anti-starvation + new-user boost
  const boost = computeBoostMultiplier({
    candidateImpressions: input.candidateImpressions ?? Number.POSITIVE_INFINITY,
    candidateAccountAgeMs: input.fairness.candidateAccountAgeMs,
  });

  const finalScore = adjustedFinalScore(reciprocal, multiplier) * boost;

  const privateAlignment = (input.viewerObservance && input.candidateObservance)
    ? practiceAreaAlignment(input.viewerObservance, input.candidateObservance)
    : { alignedAreas: [], totalAreas: 4 };

  return {
    admissible: true,
    finalScore,
    reciprocal,
    multiplier,
    boost,
    evidence: buildEvidence(input, a.reasonCodes),
    privateAlignment,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// EVIDENCE PACKET — strict whitelist
// ─────────────────────────────────────────────────────────────────────────────

function buildEvidence(input: RankingInput, viewerReasonCodes: string[]): EvidencePacket {
  const viewerTags = new Set(input.viewer.tags.map(t => t.toLowerCase()));
  const shared = input.candidate.tags.filter(t => viewerTags.has(t.toLowerCase()));

  let activity: ActivityStatus = 'unspecified';
  if (input.fairness.candidateAccountAgeMs < NEW_USER_WINDOW_MS) {
    activity = 'new_user';
  } else if (input.candidateLastActiveAgoMs != null
             && input.candidateLastActiveAgoMs < ACTIVE_RECENT_WINDOW_MS) {
    activity = 'active_recently';
  }

  return {
    shared_interests: shared,
    shared_intent: input.viewer.intent === input.candidate.intent ? input.viewer.intent : null,
    shared_observance_label:
      input.viewer.observance === input.candidate.observance ? input.viewer.observance : null,
    activity_status: activity,
    taste_driven: viewerReasonCodes.includes('taste_driven'),
  };
}

function emptyPacket(): EvidencePacket {
  return {
    shared_interests: [],
    shared_intent: null,
    shared_observance_label: null,
    activity_status: 'unspecified',
    taste_driven: false,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// BATCH RANKING (Daily Picks)
// ─────────────────────────────────────────────────────────────────────────────

export function rankBatch(inputs: RankingInput[]): Array<RankingInput & { result: RankingResult }> {
  return inputs
    .map(i => ({ ...i, result: rank(i) }))
    .filter(x => x.result.admissible)
    .sort((a, b) => b.result.finalScore - a.result.finalScore);
}
