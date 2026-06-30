import { z } from "zod";
import { assertNoForbiddenPersonalityFields } from "./privacy.ts";

const EvidenceLabelSchema = z.enum(["verified", "inferred", "heuristic", "unknown"]);
const IsoDateStringSchema = z.string().datetime();

function strictSafeObject<T extends z.ZodRawShape>(shape: T) {
  return z
    .object(shape)
    .strict()
    .superRefine((value, context) => {
      try {
        assertNoForbiddenPersonalityFields(value);
      } catch (error) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: error instanceof Error ? error.message : "Forbidden field.",
        });
      }
    });
}

export const AspectOrFacetCardSchema = strictSafeObject({
  id: z.string().min(1),
  label_he: z.string().min(1),
  label_en: z.string().min(1).optional(),
  band: z.enum(["lower", "balanced", "higher"]),
  description_he: z.string().min(1),
  reflection_prompt_he: z.string().min(1).optional(),
  evidence_label: EvidenceLabelSchema,
});

export const DatingReflectionCardSchema = strictSafeObject({
  schema_version: z.literal("1.0"),
  title_he: z.string().min(1),
  body_he: z.string().min(1),
  evidence_label: EvidenceLabelSchema,
});

export const PersonalityProfileSummarySchema = strictSafeObject({
  schema_version: z.literal("1.0"),
  report_status: z.enum(["partial", "complete"]),
  instrument_version: z.string().min(1),
  score_version: z.string().min(1),
  item_text_source: z.enum(["kesher_original", "licensed"]),
  summary_he: z.string().min(1),
  domains: z.array(AspectOrFacetCardSchema).min(1),
});

export const WhyThisMatchCardSchema = strictSafeObject({
  schema_version: z.literal("1.0"),
  reasons_he: z.array(z.string().min(1)).min(1).max(3),
  first_question_he: z.string().min(1),
  gentle_clarification_he: z.string().optional(),
  signals_used: z.array(z.string().min(1)),
  signals_not_used: z.array(z.string().min(1)),
  provenance_id: z.string().min(1).optional(),
});

export const CompatibilityReflectionCardSchema = strictSafeObject({
  schema_version: z.literal("1.0"),
  shared_strengths_he: z.array(z.string().min(1)),
  friction_loops_he: z.array(
    strictSafeObject({
      dynamic_he: z.string().min(1),
      advice_he: z.string().min(1),
      evidence_label: EvidenceLabelSchema,
    }),
  ),
  signals_used: z.array(z.string().min(1)),
  signals_not_used: z.array(z.string().min(1)),
});

export const MessageCoachingResultSchema = strictSafeObject({
  schema_version: z.literal("1.0"),
  alternatives_he: z.array(z.string().min(1)),
  alternatives_en: z.array(z.string().min(1)),
  notes: z.array(z.string().min(1)),
  auto_send_allowed: z.literal(false),
});

export const ValuesPhrasingResultSchema = strictSafeObject({
  schema_version: z.literal("1.0"),
  phrases_he: z.array(z.string().min(1)),
  phrases_en: z.array(z.string().min(1)),
  evidence_label: EvidenceLabelSchema,
});

export const PersonalityShareCardSchema = strictSafeObject({
  schema_version: z.literal("1.0"),
  owner_user_id: z.string().min(1),
  title_he: z.string().min(1),
  summary_he: z.string().min(1),
  shared_domains: z.array(AspectOrFacetCardSchema),
  expires_at: IsoDateStringSchema.optional(),
});

export const ConsentReceiptSchema = strictSafeObject({
  id: z.string().min(1),
  user_id: z.string().min(1),
  feature_id: z.string().min(1),
  consent_version: z.string().min(1),
  granted_at: IsoDateStringSchema,
  revoked_at: IsoDateStringSchema.nullish(),
  scopes: z.array(z.string().min(1)),
  item_text_source: z.enum(["kesher_original", "licensed"]),
});

export const ShareGrantSchema = strictSafeObject({
  id: z.string().min(1),
  owner_user_id: z.string().min(1),
  recipient_user_id: z.string().min(1),
  scopes: z.array(z.string().min(1)),
  created_at: IsoDateStringSchema,
  revoked_at: IsoDateStringSchema.nullish(),
});

export const PrivacyDisclosureSchema = strictSafeObject({
  schema_version: z.literal("1.0"),
  feature_id: z.string().min(1),
  data_inputs: z.array(z.string().min(1)),
  excluded_data: z.array(z.string().min(1)),
  retention_summary_he: z.string().min(1),
  user_controls: z.array(z.string().min(1)),
});

export const RiskFlagsSchema = strictSafeObject({
  schema_version: z.literal("1.0"),
  flags: z.array(
    z.enum([
      "raw_answer_logging",
      "public_trait_exposure",
      "protected_trait_inference",
      "hidden_ranking",
      "ai_auto_send",
      "license_uncertainty",
      "schema_leakage",
    ]),
  ),
  requires_human_review: z.boolean(),
});

export const ProvenanceLedgerSchema = strictSafeObject({
  id: z.string().min(1),
  user_id: z.string().min(1),
  action: z.enum(["created", "updated", "reset", "delete", "share_granted", "share_revoked"]),
  occurred_at: IsoDateStringSchema,
  actor: z.enum(["user", "system", "admin"]),
  raw_payload_logged: z.literal(false),
  affected_records: z.array(z.string().min(1)),
});

export const SafetyClassificationResultSchema = strictSafeObject({
  schema_version: z.literal("1.0"),
  level: z.enum(["none", "warn", "scam_risk", "block", "human_review"]),
  categories: z.array(z.string().min(1)),
  user_facing_note_he: z.string(),
  user_facing_note_en: z.string(),
});

export type WhyThisMatchCard = z.infer<typeof WhyThisMatchCardSchema>;

export const personality_profile_summary = PersonalityProfileSummarySchema;
export const aspect_or_facet_card = AspectOrFacetCardSchema;
export const dating_reflection_card = DatingReflectionCardSchema;
export const why_this_match_card = WhyThisMatchCardSchema;
export const compatibility_reflection_card = CompatibilityReflectionCardSchema;
export const message_coaching_result = MessageCoachingResultSchema;
export const values_phrasing_result = ValuesPhrasingResultSchema;
export const personality_share_card = PersonalityShareCardSchema;
export const consent_receipt = ConsentReceiptSchema;
export const share_grant = ShareGrantSchema;
export const privacy_disclosure = PrivacyDisclosureSchema;
export const risk_flags = RiskFlagsSchema;
export const provenance_ledger = ProvenanceLedgerSchema;
export const safety_classification_result = SafetyClassificationResultSchema;
