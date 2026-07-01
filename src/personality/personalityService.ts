/**
 * Personality Service - deterministic Kesher reflection adapter.
 *
 * Personality is sensitive data. This service only accepts explicit Kesher
 * reflection item responses and delegates scoring to ./scoring.ts. It never
 * infers traits from messages, bios, photos, behavior, or an LLM.
 */

import type {
  DomainScores,
  FacetOrAspectScores,
  PersonalityRecord,
  PersonalityServiceStatus,
} from "./types";
import {
  PERSONALITY_INSTRUMENT_VERSION,
  scoreKesherPersonalityAssessment,
  type PersonalityAssessmentReport,
} from "./scoring";

export interface PersonalityService {
  getStatus(): PersonalityServiceStatus;

  submitInstrumentResponses(input: {
    user_id?: string;
    instrument_type: string;
    instrument_version: string;
    locale: string;
    responses: Record<string, number>;
  }): Promise<PersonalityRecord>;

  getRecord(userId: string): Promise<PersonalityRecord | null>;
}

const records = new Map<string, PersonalityRecord>();

async function responseHash(responses: Record<string, number>) {
  const stable = JSON.stringify(Object.entries(responses).sort(([a], [b]) => a.localeCompare(b)));
  const digest = await globalThis.crypto?.subtle?.digest("SHA-256", new TextEncoder().encode(stable));
  if (!digest) return `sha256-unavailable:${stable.length}`;
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function toDomainScores(report: PersonalityAssessmentReport): DomainScores {
  return report.domains.reduce(
    (scores, domain) => ({
      ...scores,
      [domain.id]: domain.score / 100,
    }),
    {
      openness: null,
      conscientiousness: null,
      extraversion: null,
      agreeableness: null,
      neuroticism: null,
    } as DomainScores,
  );
}

function toFacetScores(report: PersonalityAssessmentReport): FacetOrAspectScores {
  return Object.fromEntries(report.aspects.map((aspect) => [aspect.id, aspect.score / 100]));
}

export const personalityService: PersonalityService = {
  getStatus(): PersonalityServiceStatus {
    return "active";
  },

  async submitInstrumentResponses(input) {
    if (
      input.instrument_type !== "kesher_reflection" ||
      input.instrument_version !== PERSONALITY_INSTRUMENT_VERSION
    ) {
      throw new Error("Unsupported personality instrument for active Kesher scoring.");
    }

    const report = scoreKesherPersonalityAssessment(input.responses);
    const record: PersonalityRecord = {
      instrument_type: "kesher_reflection",
      instrument_version: {
        version: report.instrument_version,
        administered_at: new Date().toISOString(),
        locale: input.locale,
      },
      domain_scores: toDomainScores(report),
      facet_or_aspect_scores: toFacetScores(report),
      score_metadata: {
        response_vector_hash: await responseHash(input.responses),
        complete: !report.is_partial,
        notes: `${report.score_version}; raw answers not stored in this record`,
      },
      created_at: new Date().toISOString(),
      visibility_status: "private",
    };

    records.set(input.user_id ?? "local-user", record);
    return record;
  },

  async getRecord(userId: string) {
    return records.get(userId) ?? null;
  },
};
