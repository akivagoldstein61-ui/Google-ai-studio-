/**
 * Personality Service — runtime shell.
 *
 * This is a deliberate placeholder. Personality is a sensitive domain
 * (Israeli PPL Amendment 13 considers some inferred traits sensitive
 * personal information). Until a validated instrument is licensed AND
 * a measurement-validation review clears, this service refuses to
 * produce scores.
 *
 * What is forbidden here, by construction:
 *   - LLM-based personality inference from messages, bios, or photos
 *   - Public raw trait scores
 *   - Attachment-style labels rendered as public badges
 *   - Compatibility percentages built from inferred traits
 *
 * What is allowed here, by construction:
 *   - Defining the type contract (./types.ts) so downstream code can
 *     compile against the eventual shape.
 *   - Reporting the current service status so callers can render an
 *     "instrument not yet available" empty state without crashing.
 */

import type {
  PersonalityRecord,
  PersonalityServiceStatus,
} from "./types";

export interface PersonalityService {
  /** Current operational status of the personality layer. */
  getStatus(): PersonalityServiceStatus;

  /** Submit raw item responses from a validated instrument. Throws if
   *  the service is not yet active — i.e. always, today. */
  submitInstrumentResponses(_input: {
    instrument_type: string;
    instrument_version: string;
    locale: string;
    responses: Record<string, number>;
  }): Promise<PersonalityRecord>;

  /** Read a record for the current user. Returns null when no record
   *  exists or when the service is not active. */
  getRecord(_userId: string): Promise<PersonalityRecord | null>;
}

/**
 * The default service. Refuses to score until measurement validation
 * clears. Wiring a real instrument requires:
 *   1. Licensing + permission documentation in CLAUDE.md
 *   2. Approval gate per CLAUDE.md Section 6
 *   3. A dedicated slice with consent UX, instrument administration,
 *      and audit logging.
 */
export const personalityService: PersonalityService = {
  getStatus(): PersonalityServiceStatus {
    return "not_validated";
  },

  async submitInstrumentResponses() {
    throw new Error(
      "Personality service is not active. No validated instrument is licensed. " +
        "See src/personality/personalityService.ts for the gating notes."
    );
  },

  async getRecord() {
    return null;
  },
};
