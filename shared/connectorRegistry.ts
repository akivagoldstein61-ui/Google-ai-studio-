/**
 * Kesher Connector Registry
 * Canonical inventory of all external service integrations.
 * Used for governance, audit, and handoff documentation.
 */

export type ConnectorStatus = "active" | "placeholder" | "blocked" | "needs_setup";
export type DataSensitivity = "public" | "internal" | "sensitive" | "special_category";

export interface ConnectorDefinition {
  id: string;
  name: string;
  category: "llm" | "auth" | "storage" | "database" | "notification" | "analytics" | "payment" | "moderation" | "identity";
  provider: string;
  purpose: string;
  dataIn: string[];
  dataOut: string[];
  dataSensitivity: DataSensitivity;
  retentionPolicy: string;
  processingBasis: string; // GDPR/Israeli Privacy Law basis
  transferAbroad: boolean;
  transferSafeguard?: string;
  envVars: string[];
  status: ConnectorStatus;
  notes: string;
}

export const CONNECTOR_REGISTRY: ConnectorDefinition[] = [
  {
    id: "manus-llm",
    name: "Manus Built-in LLM",
    category: "llm",
    provider: "Manus Platform",
    purpose: "All AI feature inference: bio coach, why match, rephrase, safety scan, openers, date ideas, personality summary, pair insight, safety advice, moderation summary",
    dataIn: ["bio text", "message drafts", "profile summaries", "report content"],
    dataOut: ["structured JSON suggestions", "explanations", "safety flags"],
    dataSensitivity: "sensitive",
    retentionPolicy: "No storage after response. Stateless inference only.",
    processingBasis: "Legitimate interest (safety, service improvement) + Consent for personality features",
    transferAbroad: true,
    transferSafeguard: "Manus platform DPA — standard contractual clauses",
    envVars: ["BUILT_IN_FORGE_API_KEY", "BUILT_IN_FORGE_API_URL", "VITE_FRONTEND_FORGE_API_KEY", "VITE_FRONTEND_FORGE_API_URL"],
    status: "active",
    notes: "All LLM calls are server-side only. No API key exposed to frontend. Uses invokeLLM() helper.",
  },
  {
    id: "manus-auth",
    name: "Manus OAuth",
    category: "auth",
    provider: "Manus Platform",
    purpose: "User authentication and session management",
    dataIn: ["openId", "name", "email", "loginMethod"],
    dataOut: ["JWT session cookie", "user record"],
    dataSensitivity: "sensitive",
    retentionPolicy: "Session cookie: 30 days. User record: until account deletion.",
    processingBasis: "Contract performance (account access)",
    transferAbroad: true,
    transferSafeguard: "Manus platform DPA",
    envVars: ["VITE_APP_ID", "OAUTH_SERVER_URL", "VITE_OAUTH_PORTAL_URL", "JWT_SECRET"],
    status: "active",
    notes: "OAuth callback at /api/oauth/callback. Session via httpOnly cookie.",
  },
  {
    id: "manus-storage",
    name: "Manus S3 Storage",
    category: "storage",
    provider: "Manus Platform",
    purpose: "Profile photo and media storage",
    dataIn: ["image files", "media files"],
    dataOut: ["storage key", "presigned URL"],
    dataSensitivity: "sensitive",
    retentionPolicy: "Until user deletes media or account.",
    processingBasis: "Contract performance (profile display)",
    transferAbroad: true,
    transferSafeguard: "Manus platform DPA",
    envVars: ["BUILT_IN_FORGE_API_KEY", "BUILT_IN_FORGE_API_URL"],
    status: "active",
    notes: "Uses storagePut() helper. Files served via /manus-storage/ proxy.",
  },
  {
    id: "manus-db",
    name: "Manus MySQL/TiDB",
    category: "database",
    provider: "Manus Platform",
    purpose: "All application data: users, profiles, matches, messages, consents, audit log",
    dataIn: ["all application data"],
    dataOut: ["query results"],
    dataSensitivity: "special_category",
    retentionPolicy: "User data: until account deletion request processed. Audit log: 2 years.",
    processingBasis: "Contract performance + Legal obligation (audit log)",
    transferAbroad: true,
    transferSafeguard: "Manus platform DPA",
    envVars: ["DATABASE_URL"],
    status: "active",
    notes: "Drizzle ORM. Schema in drizzle/schema.ts. Migrations via webdev_execute_sql.",
  },
  {
    id: "manus-notifications",
    name: "Manus Notifications",
    category: "notification",
    provider: "Manus Platform",
    purpose: "Owner-facing operational alerts (new reports, system events)",
    dataIn: ["alert title", "alert content"],
    dataOut: ["delivery status"],
    dataSensitivity: "internal",
    retentionPolicy: "Not stored in application DB.",
    processingBasis: "Legitimate interest (operational monitoring)",
    transferAbroad: true,
    transferSafeguard: "Manus platform DPA",
    envVars: ["BUILT_IN_FORGE_API_KEY", "BUILT_IN_FORGE_API_URL"],
    status: "active",
    notes: "Uses notifyOwner() helper. Owner-facing only.",
  },
  {
    id: "google-fonts",
    name: "Google Fonts CDN",
    category: "analytics",
    provider: "Google",
    purpose: "Font delivery (Playfair Display, Inter)",
    dataIn: ["browser User-Agent", "IP address (CDN)"],
    dataOut: ["font files"],
    dataSensitivity: "public",
    retentionPolicy: "Not stored by application.",
    processingBasis: "Legitimate interest (UI rendering)",
    transferAbroad: true,
    transferSafeguard: "Google standard terms",
    envVars: [],
    status: "active",
    notes: "Loaded via <link> in client/index.html. Consider self-hosting for full privacy compliance.",
  },
  {
    id: "stripe",
    name: "Stripe Payments",
    category: "payment",
    provider: "Stripe",
    purpose: "Premium subscription billing",
    dataIn: ["payment method", "billing details"],
    dataOut: ["subscription status", "invoice"],
    dataSensitivity: "sensitive",
    retentionPolicy: "Per Stripe DPA. Not stored in application DB.",
    processingBasis: "Contract performance (subscription)",
    transferAbroad: true,
    transferSafeguard: "Stripe DPA — standard contractual clauses",
    envVars: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "VITE_STRIPE_PUBLISHABLE_KEY"],
    status: "placeholder",
    notes: "Not yet integrated. Use webdev_add_feature stripe to activate.",
  },
  {
    id: "photo-moderation",
    name: "Photo Moderation Provider",
    category: "moderation",
    provider: "TBD (AWS Rekognition / Sightengine / Hive)",
    purpose: "Automated NSFW/illegal content detection on profile photos",
    dataIn: ["profile photo URLs"],
    dataOut: ["moderation verdict", "confidence score"],
    dataSensitivity: "sensitive",
    retentionPolicy: "No storage by application. Provider retention per DPA.",
    processingBasis: "Legal obligation (content safety) + Legitimate interest",
    transferAbroad: true,
    transferSafeguard: "Provider DPA required before activation",
    envVars: ["PHOTO_MOD_API_KEY", "PHOTO_MOD_API_URL"],
    status: "blocked",
    notes: "BLOCKED until provider selected, DPA signed, and Israeli PPA guidance reviewed.",
  },
  {
    id: "identity-verification",
    name: "Identity Verification Provider",
    category: "identity",
    provider: "TBD (Onfido / Persona / AU10TIX)",
    purpose: "Optional identity verification for trust badge",
    dataIn: ["government ID image", "selfie"],
    dataOut: ["verification status"],
    dataSensitivity: "special_category",
    retentionPolicy: "No storage by application. Provider retention per DPA.",
    processingBasis: "Explicit consent",
    transferAbroad: true,
    transferSafeguard: "Provider DPA + explicit consent required",
    envVars: ["IDENTITY_VERIFY_API_KEY"],
    status: "blocked",
    notes: "BLOCKED until provider selected, DPA signed, and Israeli biometric data rules reviewed.",
  },
];

export default CONNECTOR_REGISTRY;
