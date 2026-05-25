/**
 * Kesher Data Classification Policy
 * Classifies all data fields by sensitivity tier.
 * Aligned with Israeli Privacy Protection Law (Amendment 13) and GDPR.
 */

export type DataTier = "public" | "internal" | "sensitive" | "special_category";
export type LegalBasis = "consent" | "explicit_consent" | "contract" | "legitimate_interest" | "legal_obligation";

export interface DataField {
  field: string;
  table: string;
  tier: DataTier;
  legalBasis: LegalBasis[];
  retentionPeriod: string;
  allowedInAI: boolean;
  allowedInExplanations: boolean;
  requiresConsent: boolean;
  notes: string;
}

export const DATA_CLASSIFICATION: DataField[] = [
  // ── Users ──────────────────────────────────────────────────────────────────
  { field: "openId", table: "users", tier: "sensitive", legalBasis: ["contract"], retentionPeriod: "Until account deletion", allowedInAI: false, allowedInExplanations: false, requiresConsent: false, notes: "Manus OAuth identifier" },
  { field: "name", table: "users", tier: "internal", legalBasis: ["contract"], retentionPeriod: "Until account deletion", allowedInAI: false, allowedInExplanations: false, requiresConsent: false, notes: "Legal name from OAuth" },
  { field: "email", table: "users", tier: "sensitive", legalBasis: ["contract"], retentionPeriod: "Until account deletion", allowedInAI: false, allowedInExplanations: false, requiresConsent: false, notes: "Never exposed to other users" },
  { field: "role", table: "users", tier: "internal", legalBasis: ["contract"], retentionPeriod: "Until account deletion", allowedInAI: false, allowedInExplanations: false, requiresConsent: false, notes: "user | moderator | admin" },

  // ── Profiles ───────────────────────────────────────────────────────────────
  { field: "displayName", table: "profiles", tier: "public", legalBasis: ["contract", "consent"], retentionPeriod: "Until account deletion", allowedInAI: true, allowedInExplanations: true, requiresConsent: false, notes: "Shown to all users" },
  { field: "bio", table: "profiles", tier: "public", legalBasis: ["contract", "consent"], retentionPeriod: "Until account deletion", allowedInAI: true, allowedInExplanations: true, requiresConsent: false, notes: "Shown to all users; sent to LLM for bio coach" },
  { field: "birthYear", table: "profiles", tier: "sensitive", legalBasis: ["contract", "consent"], retentionPeriod: "Until account deletion", allowedInAI: false, allowedInExplanations: false, requiresConsent: false, notes: "Age shown as range only" },
  { field: "gender", table: "profiles", tier: "public", legalBasis: ["contract", "consent"], retentionPeriod: "Until account deletion", allowedInAI: true, allowedInExplanations: false, requiresConsent: false, notes: "Used for matching, not in explanations" },
  { field: "location", table: "profiles", tier: "public", legalBasis: ["contract", "consent"], retentionPeriod: "Until account deletion", allowedInAI: true, allowedInExplanations: true, requiresConsent: false, notes: "City-level only" },
  { field: "observance", table: "profiles", tier: "special_category", legalBasis: ["explicit_consent"], retentionPeriod: "Until account deletion", allowedInAI: true, allowedInExplanations: true, requiresConsent: true, notes: "Religious observance — special category under Israeli law" },
  { field: "relationshipIntent", table: "profiles", tier: "public", legalBasis: ["contract", "consent"], retentionPeriod: "Until account deletion", allowedInAI: true, allowedInExplanations: true, requiresConsent: false, notes: "Serious/casual/open" },
  { field: "media", table: "profile_media", tier: "public", legalBasis: ["contract", "consent"], retentionPeriod: "Until deleted by user or account deletion", allowedInAI: false, allowedInExplanations: false, requiresConsent: false, notes: "Profile photos — biometric data under Israeli law" },

  // ── Preferences ────────────────────────────────────────────────────────────
  { field: "ageMin/ageMax", table: "preferences", tier: "internal", legalBasis: ["contract"], retentionPeriod: "Until account deletion", allowedInAI: false, allowedInExplanations: false, requiresConsent: false, notes: "Used for matching only" },
  { field: "locationRadius", table: "preferences", tier: "internal", legalBasis: ["contract"], retentionPeriod: "Until account deletion", allowedInAI: false, allowedInExplanations: false, requiresConsent: false, notes: "Used for matching only" },

  // ── Matches & Likes ────────────────────────────────────────────────────────
  { field: "likes", table: "likes", tier: "sensitive", legalBasis: ["contract"], retentionPeriod: "Until account deletion", allowedInAI: false, allowedInExplanations: false, requiresConsent: false, notes: "Never shown to liked user unless mutual" },
  { field: "passes", table: "passes", tier: "sensitive", legalBasis: ["contract"], retentionPeriod: "Until account deletion", allowedInAI: false, allowedInExplanations: false, requiresConsent: false, notes: "Never shown to passed user" },

  // ── Messages ───────────────────────────────────────────────────────────────
  { field: "content", table: "messages", tier: "sensitive", legalBasis: ["contract", "consent"], retentionPeriod: "Until account deletion or mutual unmatch", allowedInAI: true, allowedInExplanations: false, requiresConsent: false, notes: "Sent to LLM only for safety scan/rephrase — user-initiated" },

  // ── Consents ───────────────────────────────────────────────────────────────
  { field: "userConsents", table: "user_consents", tier: "internal", legalBasis: ["legal_obligation"], retentionPeriod: "5 years (legal obligation)", allowedInAI: false, allowedInExplanations: false, requiresConsent: false, notes: "Consent audit trail — must not be deleted" },

  // ── Audit Log ──────────────────────────────────────────────────────────────
  { field: "auditLog", table: "audit_log", tier: "internal", legalBasis: ["legal_obligation"], retentionPeriod: "2 years", allowedInAI: false, allowedInExplanations: false, requiresConsent: false, notes: "Security and compliance audit trail" },

  // ── Reports ────────────────────────────────────────────────────────────────
  { field: "profileReports", table: "profile_reports", tier: "sensitive", legalBasis: ["legal_obligation", "legitimate_interest"], retentionPeriod: "2 years", allowedInAI: true, allowedInExplanations: false, requiresConsent: false, notes: "Sent to LLM for moderation summary — moderator-only" },
];

export default DATA_CLASSIFICATION;
