/**
 * End-to-end ranking orchestrator that composes:
 *   - filteringGrammar (hard/soft + reciprocal + fairness)
 *   - learnedTaste (implicit affinity from dual-memory state)
 *   - observanceLayer (private practice alignment)
 *   - explanationSchema (whitelisted evidence packet)
 *
 * Produces, for a viewer + candidate pair:
 *   - admissible? (hard filters)
 *   - score (reciprocal x fairness)
 *   - evidence packet (safe to send to explanation generator)
 */

import type { DiscoveryPreferences, Profile } from '@/types';
import {
  directionalScore, reciprocalScore, fairnessMultiplier, adjustedFinalScore,
  type HardFilterContext, type SoftPreferenceId, type FairnessState,
} from './filteringGrammar';
import { implicitAffinity, type TasteState } from './learnedTaste';
import { practiceAreaAlignment, type ObservanceProfile } from './observanceLayer';
import type { EvidencePacket, ActivityStatus } from './explanationSchema';
import { profileToFeatureTags } from './tastePersistence';

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
}

export interface RankingResult {
  admissible: boolean;
  hardViolation?: string;
  finalScore: number;        // 0..1ish (post-fairness; can exceed 1 with boosts)
  reciprocal: number;
  multiplier: number;
  evidence: EvidencePacket;
  privateAlignment: { alignedAreas: string[]; totalAreas: number };
}

export interface CandidateRankingContext {
  preferences?: DiscoveryPreferences;
  tasteState?: TasteState;
  fairness?: FairnessState;
  /** Candidate distance from the active viewer. Falls back to city estimate when absent. */
  distanceKm?: number;
}

const NEW_USER_WINDOW_MS = 72 * 60 * 60 * 1000;
const ACTIVE_RECENT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

type SpilloverReason = 'outside_age_range' | 'outside_distance';

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
      evidence: emptyPacket(),
      privateAlignment: { alignedAreas: [], totalAreas: 4 },
    };
  }

  const reciprocal = reciprocalScore(a.score, b.score);
  const multiplier = fairnessMultiplier(input.fairness);
  const finalScore = adjustedFinalScore(reciprocal, multiplier);

  const privateAlignment = (input.viewerObservance && input.candidateObservance)
    ? practiceAreaAlignment(input.viewerObservance, input.candidateObservance)
    : { alignedAreas: [], totalAreas: 4 };

  return {
    admissible: true,
    finalScore,
    reciprocal,
    multiplier,
    evidence: buildEvidence(input, a.reasonCodes),
    privateAlignment,
  };
}

// -----------------------------------------------------------------------------
// EVIDENCE PACKET - strict whitelist
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// BATCH RANKING (Daily Picks)
// -----------------------------------------------------------------------------

export function rankBatch(inputs: RankingInput[]): Array<RankingInput & { result: RankingResult }> {
  return inputs
    .map(i => ({ ...i, result: rank(i) }))
    .filter(x => x.result.admissible)
    .sort((a, b) => b.result.finalScore - a.result.finalScore);
}

export interface RankedProfile {
  profile: Profile;
  score: number;
  evidence: EvidencePacket;
  spilloverReason?: SpilloverReason;
}

export function buildEvidencePacket(input: {
  viewer: Profile;
  candidate: Profile;
  reasonCodes: string[];
}): EvidencePacket {
  const viewerTags = new Set(input.viewer.tags.map(t => t.toLowerCase()));
  const shared = input.candidate.tags.filter(t => viewerTags.has(t.toLowerCase()));
  return {
    shared_interests: shared.slice(0, 3),
    shared_intent: input.viewer.intent === input.candidate.intent ? input.viewer.intent : null,
    shared_observance_label:
      input.viewer.observance === input.candidate.observance ? input.viewer.observance : null,
    activity_status: 'unspecified',
    taste_driven: input.reasonCodes.includes('taste_driven'),
  };
}

export function selectDailyPicks(input: {
  viewer: Profile;
  candidates: Profile[];
  preferences: DiscoveryPreferences;
  tasteState: TasteState;
  candidateContexts?: Record<string, CandidateRankingContext>;
  limit?: number;
}): RankedProfile[] {
  return rankFromPreferences(input)
    .filter(item => !item.spilloverReason)
    .slice(0, input.limit ?? 5);
}

export function selectExploreProfiles(input: {
  viewer: Profile;
  candidates: Profile[];
  preferences: DiscoveryPreferences;
  tasteState: TasteState;
  candidateContexts?: Record<string, CandidateRankingContext>;
  allowDisclosedSpillover?: boolean;
}): RankedProfile[] {
  const ranked = rankFromPreferences(input);
  if (!input.allowDisclosedSpillover) {
    return ranked.filter(item => !item.spilloverReason);
  }
  return ranked;
}

function rankFromPreferences(input: {
  viewer: Profile;
  candidates: Profile[];
  preferences: DiscoveryPreferences;
  tasteState: TasteState;
  candidateContexts?: Record<string, CandidateRankingContext>;
}): RankedProfile[] {
  return input.candidates
    .map((candidate): RankedProfile | null => {
      const candidateContext = input.candidateContexts?.[candidate.uid] ?? input.candidateContexts?.[candidate.id];
      const distanceKm = candidateContext?.distanceKm ?? estimateDistanceKm(input.viewer, candidate);
      const outsideAge = candidate.age < input.preferences.ageRange[0] ||
        candidate.age > input.preferences.ageRange[1];
      const outsideDistance = distanceKm != null &&
        input.preferences.maxDistance >= 0 &&
        distanceKm > input.preferences.maxDistance;
      const ageIsDealbreaker = input.preferences.dealbreakers?.age ?? true;
      const distanceIsDealbreaker = input.preferences.dealbreakers?.distance ?? true;
      if (outsideAge && ageIsDealbreaker) return null;
      if (outsideDistance && distanceIsDealbreaker) return null;

      const viewerHardCtx = hardCtxFromPreferences(input.preferences, {
        allowAgeSpillover: outsideAge && !ageIsDealbreaker,
        allowDistanceSpillover: outsideDistance && !distanceIsDealbreaker,
        candidateDistanceKm: distanceKm,
      });
      const candidatePreferences = candidateContext?.preferences;
      const viewerOutsideCandidateAge = candidatePreferences
        ? input.viewer.age < candidatePreferences.ageRange[0] || input.viewer.age > candidatePreferences.ageRange[1]
        : false;
      const viewerOutsideCandidateDistance = candidatePreferences && distanceKm != null
        ? candidatePreferences.maxDistance >= 0 && distanceKm > candidatePreferences.maxDistance
        : false;
      const candidateAgeIsDealbreaker = candidatePreferences?.dealbreakers?.age ?? true;
      const candidateDistanceIsDealbreaker = candidatePreferences?.dealbreakers?.distance ?? true;
      const candidateHardCtx = candidatePreferences
        ? hardCtxFromPreferences(candidatePreferences, {
            allowAgeSpillover: viewerOutsideCandidateAge && !candidateAgeIsDealbreaker,
            allowDistanceSpillover: viewerOutsideCandidateDistance && !candidateDistanceIsDealbreaker,
            candidateDistanceKm: distanceKm,
          })
        : {};
      const candidateFeatures = profileToFeatureTags(candidate);
      const viewerFeatures = profileToFeatureTags(input.viewer);
      const result = rank({
        viewer: input.viewer,
        candidate,
        viewerHardCtx,
        viewerSoftWeights: softWeightsFromPreferences(input.preferences),
        candidateHardCtx,
        candidateSoftWeights: candidatePreferences ? softWeightsFromPreferences(candidatePreferences) : {},
        viewerTaste: input.tasteState,
        candidateTaste: candidateContext?.tasteState ?? emptyTasteStateForRanking(input.tasteState),
        candidateFeatures,
        viewerFeatures,
        fairness: candidateContext?.fairness ?? neutralFairnessState(candidate),
      });
      if (!result.admissible) return null;
      return {
        profile: candidate,
        score: result.finalScore,
        evidence: result.evidence,
        spilloverReason: outsideAge
          ? 'outside_age_range'
          : outsideDistance
            ? 'outside_distance'
            : undefined,
      };
    })
    .filter((item): item is RankedProfile => Boolean(item))
    .sort((a, b) => b.score - a.score);
}

function hardCtxFromPreferences(
  preferences: DiscoveryPreferences,
  options: {
    allowAgeSpillover?: boolean;
    allowDistanceSpillover?: boolean;
    candidateDistanceKm?: number;
  } = {},
): HardFilterContext {
  return {
    ageRange: options.allowAgeSpillover ? undefined : preferences.ageRange,
    maxDistanceKm: options.allowDistanceSpillover ? undefined : preferences.maxDistance,
    candidateDistanceKm: options.candidateDistanceKm,
    genderPreference: preferences.genderPreference,
    intentPreference: preferences.intentPreference,
    verifiedOnly: preferences.dealbreakers?.verified ?? preferences.hardFilters.includes('verified'),
  };
}

function softWeightsFromPreferences(preferences: DiscoveryPreferences): Partial<Record<SoftPreferenceId, number>> {
  return {
    shared_interests: preferences.softPreferenceWeights?.shared_interests ??
      (preferences.softPreferences.includes('shared_interests') ? 0.5 : undefined),
    same_city: preferences.softPreferenceWeights?.same_city ??
      (preferences.softPreferences.includes('same_city') ? 0.5 : undefined),
    shared_observance_label: preferences.softPreferenceWeights?.similar_observance ??
      (preferences.softPreferences.includes('similar_observance') ? 0.5 : undefined),
    similar_age: preferences.softPreferenceWeights?.similar_age ??
      (preferences.softPreferences.includes('similar_age') ? 0.5 : undefined),
  };
}

function emptyTasteStateForRanking(reference: TasteState): TasteState {
  return {
    fast: new Map(),
    slow: new Map(),
    lastUpdatedMs: reference.lastUpdatedMs,
    learningPaused: false,
    optedOut: false,
  };
}

function neutralFairnessState(candidate: Profile): FairnessState {
  const createdAt = parseDateMs((candidate as Profile & { createdAt?: string }).createdAt);
  const candidateAccountAgeMs = createdAt != null
    ? Math.max(0, Date.now() - createdAt)
    : 14 * 24 * 60 * 60 * 1000;
  return {
    candidateAccountAgeMs,
    impressionsLast7d: 10,
    impressionsLast24h: 1,
  };
}

const CITY_COORDINATES: Record<string, { lat: number; lon: number }> = {
  'tel aviv': { lat: 32.0853, lon: 34.7818 },
  jerusalem: { lat: 31.7683, lon: 35.2137 },
  haifa: { lat: 32.7940, lon: 34.9896 },
  raanana: { lat: 32.1848, lon: 34.8713 },
  "ra'anana": { lat: 32.1848, lon: 34.8713 },
  'local preview': { lat: 32.0853, lon: 34.7818 },
  'preview mode': { lat: 32.0853, lon: 34.7818 },
};

export function estimateDistanceKm(viewer: Profile, candidate: Profile): number | undefined {
  const explicitDistance = numericField(candidate, 'distanceKm') ?? numericField(candidate, 'distanceFromViewerKm');
  if (explicitDistance != null) return explicitDistance;
  if (viewer.city && candidate.city && normalizeCity(viewer.city) === normalizeCity(candidate.city)) return 0;
  const viewerLocation = profileLocation(viewer);
  const candidateLocation = profileLocation(candidate);
  if (!viewerLocation || !candidateLocation) return undefined;
  return Math.round(haversineKm(viewerLocation, candidateLocation));
}

function profileLocation(profile: Profile): { lat: number; lon: number } | undefined {
  const lat = numericField(profile, 'latitude') ?? numericField(profile, 'lat');
  const lon = numericField(profile, 'longitude') ?? numericField(profile, 'lng') ?? numericField(profile, 'lon');
  if (lat != null && lon != null) return { lat, lon };
  return CITY_COORDINATES[normalizeCity(profile.city)];
}

function numericField(source: Profile, key: string): number | undefined {
  const value = (source as unknown as Record<string, unknown>)[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function normalizeCity(city: string): string {
  return city.trim().toLowerCase();
}

function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const earthKm = 6371;
  const dLat = toRadians(b.lat - a.lat);
  const dLon = toRadians(b.lon - a.lon);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * earthKm * Math.asin(Math.sqrt(h));
}

function toRadians(degrees: number): number {
  return degrees * Math.PI / 180;
}

function parseDateMs(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}
