import {
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Core Users ───────────────────────────────────────────────────────────────

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "moderator", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Profiles ─────────────────────────────────────────────────────────────────

export const profiles = mysqlTable("profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  displayName: varchar("displayName", { length: 100 }),
  bio: text("bio"),
  birthYear: int("birthYear"),
  gender: varchar("gender", { length: 50 }),
  location: varchar("location", { length: 200 }),
  observance: varchar("observance", { length: 100 }),
  relationshipIntent: varchar("relationshipIntent", { length: 100 }),
  language: mysqlEnum("language", ["he", "en"]).default("he").notNull(),
  isComplete: boolean("isComplete").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Profile = typeof profiles.$inferSelect;

// ─── Profile Media ────────────────────────────────────────────────────────────

export const profileMedia = mysqlTable("profile_media", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  storageKey: varchar("storageKey", { length: 500 }).notNull(),
  url: text("url").notNull(),
  mediaType: mysqlEnum("mediaType", ["photo"]).default("photo").notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  isApproved: boolean("isApproved").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Preferences ──────────────────────────────────────────────────────────────

export const preferences = mysqlTable("preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  minAge: int("minAge"),
  maxAge: int("maxAge"),
  maxDistanceKm: int("maxDistanceKm"),
  genderPreference: varchar("genderPreference", { length: 100 }),
  observancePreference: varchar("observancePreference", { length: 200 }),
  dealbreakers: json("dealbreakers"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Values Answers ───────────────────────────────────────────────────────────

export const valuesAnswers = mysqlTable("values_answers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  questionId: varchar("questionId", { length: 100 }).notNull(),
  answer: text("answer").notNull(),
  visibility: mysqlEnum("visibility", ["private", "public"]).default("public").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Daily Picks ──────────────────────────────────────────────────────────────

export const dailyPicks = mysqlTable("daily_picks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  targetUserId: int("targetUserId").notNull(),
  pickDate: varchar("pickDate", { length: 10 }).notNull(), // YYYY-MM-DD
  status: mysqlEnum("status", ["pending", "liked", "passed", "expired"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Likes / Passes ───────────────────────────────────────────────────────────

export const likes = mysqlTable("likes", {
  id: int("id").autoincrement().primaryKey(),
  fromUserId: int("fromUserId").notNull(),
  toUserId: int("toUserId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const passes = mysqlTable("passes", {
  id: int("id").autoincrement().primaryKey(),
  fromUserId: int("fromUserId").notNull(),
  toUserId: int("toUserId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Matches ──────────────────────────────────────────────────────────────────

export const matches = mysqlTable("matches", {
  id: int("id").autoincrement().primaryKey(),
  user1Id: int("user1Id").notNull(),
  user2Id: int("user2Id").notNull(),
  status: mysqlEnum("status", ["active", "unmatched", "blocked", "paused"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Conversations & Messages ─────────────────────────────────────────────────

export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  matchId: int("matchId").notNull().unique(),
  lastMessageAt: timestamp("lastMessageAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  senderId: int("senderId").notNull(),
  content: text("content").notNull(),
  isAiDraft: boolean("isAiDraft").default(false).notNull(),
  isDeleted: boolean("isDeleted").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Blocks ───────────────────────────────────────────────────────────────────

export const blocks = mysqlTable("blocks", {
  id: int("id").autoincrement().primaryKey(),
  blockerId: int("blockerId").notNull(),
  blockedId: int("blockedId").notNull(),
  reason: text("reason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Reports ──────────────────────────────────────────────────────────────────

export const profileReports = mysqlTable("profile_reports", {
  id: int("id").autoincrement().primaryKey(),
  reporterId: int("reporterId").notNull(),
  reportedUserId: int("reportedUserId").notNull(),
  reason: varchar("reason", { length: 200 }).notNull(),
  details: text("details"),
  status: mysqlEnum("status", ["open", "under_review", "resolved", "dismissed"]).default("open").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const messageReports = mysqlTable("message_reports", {
  id: int("id").autoincrement().primaryKey(),
  reporterId: int("reporterId").notNull(),
  messageId: int("messageId").notNull(),
  reason: varchar("reason", { length: 200 }).notNull(),
  details: text("details"),
  status: mysqlEnum("status", ["open", "under_review", "resolved", "dismissed"]).default("open").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Moderation ───────────────────────────────────────────────────────────────

export const moderationCases = mysqlTable("moderation_cases", {
  id: int("id").autoincrement().primaryKey(),
  sourceType: mysqlEnum("sourceType", ["profile_report", "message_report", "system"]).notNull(),
  sourceId: int("sourceId").notNull(),
  assignedModeratorId: int("assignedModeratorId"),
  status: mysqlEnum("status", ["open", "in_review", "resolved", "escalated", "appealed"]).default("open").notNull(),
  aiSummary: text("aiSummary"),
  aiConfidence: varchar("aiConfidence", { length: 20 }),
  resolution: text("resolution"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const moderatorActions = mysqlTable("moderator_actions", {
  id: int("id").autoincrement().primaryKey(),
  caseId: int("caseId").notNull(),
  moderatorId: int("moderatorId").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  rationale: text("rationale").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const appeals = mysqlTable("appeals", {
  id: int("id").autoincrement().primaryKey(),
  caseId: int("caseId").notNull(),
  appellantId: int("appellantId").notNull(),
  reason: text("reason").notNull(),
  status: mysqlEnum("status", ["open", "under_review", "upheld", "dismissed"]).default("open").notNull(),
  reviewedBy: int("reviewedBy"),
  reviewNote: text("reviewNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Audit Log ────────────────────────────────────────────────────────────────

export const auditLog = mysqlTable("audit_log", {
  id: int("id").autoincrement().primaryKey(),
  actorId: int("actorId"),
  actorRole: varchar("actorRole", { length: 50 }),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  resourceType: varchar("resourceType", { length: 100 }),
  resourceId: varchar("resourceId", { length: 100 }),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Consent & Privacy ────────────────────────────────────────────────────────

export const userConsents = mysqlTable("user_consents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  consentType: varchar("consentType", { length: 100 }).notNull(),
  granted: boolean("granted").notNull(),
  consentVersion: varchar("consentVersion", { length: 50 }),
  grantedAt: timestamp("grantedAt"),
  revokedAt: timestamp("revokedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const privacyRequests = mysqlTable("privacy_requests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  requestType: mysqlEnum("requestType", ["export", "delete", "correction", "access"]).notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  notes: text("notes"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Support ──────────────────────────────────────────────────────────────────

export const supportRequests = mysqlTable("support_requests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  email: varchar("email", { length: 320 }),
  subject: varchar("subject", { length: 200 }).notNull(),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["open", "in_progress", "resolved"]).default("open").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Skills ───────────────────────────────────────────────────────────────────

export const skillRegistry = mysqlTable("skill_registry", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  shortTitle: varchar("shortTitle", { length: 100 }),
  category: varchar("category", { length: 100 }),
  description: text("description"),
  primarySurface: varchar("primarySurface", { length: 100 }),
  availableSurfaces: json("availableSurfaces"),
  trigger: varchar("trigger", { length: 200 }),
  userIntentServed: text("userIntentServed"),
  requiredInputs: json("requiredInputs"),
  optionalInputs: json("optionalInputs"),
  outputContract: json("outputContract"),
  privacyNote: text("privacyNote"),
  safetyLevel: mysqlEnum("safetyLevel", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  consentRequired: boolean("consentRequired").default(false).notNull(),
  roleAvailability: json("roleAvailability"),
  toolPolicy: text("toolPolicy"),
  approvalBoundary: text("approvalBoundary"),
  failureModes: json("failureModes"),
  fallbackBehavior: text("fallbackBehavior"),
  acceptanceCriteria: json("acceptanceCriteria"),
  status: mysqlEnum("status", ["working", "demo_safe", "blocked", "needs_provider_setup"]).default("demo_safe").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const userSkillState = mysqlTable("user_skill_state", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  skillId: int("skillId").notNull(),
  status: mysqlEnum("status", ["available", "started", "completed", "applied", "dismissed", "blocked"]).default("available").notNull(),
  progress: int("progress").default(0).notNull(),
  lastUsedAt: timestamp("lastUsedAt"),
  completedAt: timestamp("completedAt"),
  originatingSurface: varchar("originatingSurface", { length: 100 }),
  savedOutputRef: varchar("savedOutputRef", { length: 500 }),
  consentSnapshot: json("consentSnapshot"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const skillOutputs = mysqlTable("skill_outputs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  skillId: int("skillId").notNull(),
  outputData: json("outputData").notNull(),
  appliedAt: timestamp("appliedAt"),
  isPrivate: boolean("isPrivate").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── AI Feature / Prompt / Eval Registries ────────────────────────────────────

export const aiFeatureRegistry = mysqlTable("ai_feature_registry", {
  id: int("id").autoincrement().primaryKey(),
  featureSlug: varchar("featureSlug", { length: 100 }).notNull().unique(),
  featureName: varchar("featureName", { length: 200 }).notNull(),
  description: text("description"),
  provider: varchar("provider", { length: 100 }),
  isEnabled: boolean("isEnabled").default(false).notNull(),
  requiresConsent: boolean("requiresConsent").default(false).notNull(),
  isPrivate: boolean("isPrivate").default(true).notNull(),
  allowedRoles: json("allowedRoles"),
  prohibitedPatterns: json("prohibitedPatterns"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const aiPromptRegistry = mysqlTable("ai_prompt_registry", {
  id: int("id").autoincrement().primaryKey(),
  featureSlug: varchar("featureSlug", { length: 100 }).notNull(),
  promptVersion: varchar("promptVersion", { length: 50 }).notNull(),
  systemPrompt: text("systemPrompt").notNull(),
  inputSchema: json("inputSchema"),
  outputSchema: json("outputSchema"),
  prohibitedOutputPatterns: json("prohibitedOutputPatterns"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const aiEvalRegistry = mysqlTable("ai_eval_registry", {
  id: int("id").autoincrement().primaryKey(),
  featureSlug: varchar("featureSlug", { length: 100 }).notNull(),
  evalName: varchar("evalName", { length: 200 }).notNull(),
  evalDescription: text("evalDescription"),
  fixtureInput: json("fixtureInput"),
  expectedOutputPattern: text("expectedOutputPattern"),
  prohibitedOutputPattern: text("prohibitedOutputPattern"),
  lastRunAt: timestamp("lastRunAt"),
  lastResult: mysqlEnum("lastResult", ["pass", "fail", "skipped"]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Known Failure Ledger ─────────────────────────────────────────────────────

export const knownFailureLedger = mysqlTable("known_failure_ledger", {
  id: int("id").autoincrement().primaryKey(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description").notNull(),
  evidenceLabel: mysqlEnum("evidenceLabel", ["TARGET_VERIFIED", "CORPUS_VERIFIED", "INFERRED", "HEURISTIC", "UNKNOWN"]).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  status: mysqlEnum("status", ["open", "mitigated", "resolved"]).default("open").notNull(),
  mitigationNote: text("mitigationNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Release Checklist ────────────────────────────────────────────────────────

export const releaseChecklist = mysqlTable("release_checklist", {
  id: int("id").autoincrement().primaryKey(),
  version: varchar("version", { length: 50 }).notNull(),
  checkName: varchar("checkName", { length: 200 }).notNull(),
  status: mysqlEnum("status", ["pending", "passed", "failed", "blocked"]).default("pending").notNull(),
  notes: text("notes"),
  checkedBy: int("checkedBy"),
  checkedAt: timestamp("checkedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
