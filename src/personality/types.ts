/**
 * Personality Service — instrument-agnostic types.
 *
 * Kesher does NOT compute personality scores from user behavior, photos,
 * messages, or LLM inference. The active production path is the original
 * Kesher reflection in ./scoring.ts: deterministic, private by default,
 * non-clinical, and not a compatibility predictor.
 */

/** Discriminator for which instrument produced the scores. Open-ended on
 *  purpose so we can later add validated instruments without a breaking
 *  change. The empty string sentinel is "no instrument administered". */
export type InstrumentType =
  | "none"
  | "kesher_reflection"
  | "bfas"
  | "bfi2"
  | "ipip_bfas_100"
  | "ipip300"
  | "custom_research_only";

export interface InstrumentVersion {
  /** Semver-ish version string of the instrument as administered. */
  version: string;
  /** Date the instrument was administered (ISO 8601). */
  administered_at: string;
  /** Locale of the administered instrument (e.g. 'he-IL', 'en-US'). */
  locale: string;
}

/** Big-five-like domain scores. Numeric range and meaning are
 *  instrument-specific; do NOT compare across instruments. */
export interface DomainScores {
  /** 0..1 normalized to the instrument's reference population, or null
   *  if the instrument did not produce this domain. */
  openness: number | null;
  conscientiousness: number | null;
  extraversion: number | null;
  agreeableness: number | null;
  neuroticism: number | null;
}

/** Facet- or aspect-level scores. Keys are instrument-defined. */
export type FacetOrAspectScores = Record<string, number | null>;

export interface ScoreMetadata {
  /** SHA-256 of the raw item-response vector, for audit without exposing
   *  the raw responses. Lets us verify integrity without persisting PII. */
  response_vector_hash: string;
  /** True if every item received a non-null response. Partial responses
   *  must NOT be turned into a public-facing summary. */
  complete: boolean;
  /** Free-text notes from the administering layer (e.g. "translated"). */
  notes: string;
}

/** Public visibility status of a personality result. Default is private. */
export type VisibilityStatus =
  | "private"
  | "shared_with_match_on_consent"
  | "internal_research_only";

export interface PersonalityRecord {
  instrument_type: InstrumentType;
  instrument_version: InstrumentVersion;
  domain_scores: DomainScores;
  facet_or_aspect_scores: FacetOrAspectScores;
  score_metadata: ScoreMetadata;
  /** ISO 8601 timestamp the record was written. */
  created_at: string;
  visibility_status: VisibilityStatus;
}

/** Status returned by the personality service today. */
export type PersonalityServiceStatus =
  | "not_validated"        // No validated instrument is licensed/active.
  | "instrument_pending"   // An instrument is configured but not active.
  | "active";              // A validated instrument is live; scoring allowed.
