import { eq, and, or, ne, desc, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  users, InsertUser,
  profiles, profileMedia, preferences,
  likes, passes, matches, conversations, messages,
  blocks, profileReports, messageReports,
  moderationCases, moderatorActions,
  auditLog, userConsents, privacyRequests,
  skillRegistry, userSkillState, skillOutputs,
  aiFeatureRegistry, aiPromptRegistry, aiEvalRegistry,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Profiles ─────────────────────────────────────────────────────────────────
export async function getProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  if (result.length === 0) return null;
  const p = result[0];
  const media = await db.select().from(profileMedia).where(eq(profileMedia.userId, userId));
  return { ...p, media };
}

export async function upsertProfile(userId: number, data: Partial<{
  displayName: string; bio: string; birthYear: number; gender: string;
  location: string; observance: string; relationshipIntent: string;
}>) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  if (existing.length === 0) {
    await db.insert(profiles).values({ userId, ...data });
  } else {
    await db.update(profiles).set({ ...data, updatedAt: new Date() }).where(eq(profiles.userId, userId));
  }
}

export async function updatePrivacySettings(userId: number, data: Partial<{
  showAge: boolean; showLocation: boolean; allowSearchByName: boolean; profileVisibility: string;
}>) {
  // Privacy settings are stored on the profile row
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  if (existing.length === 0) {
    await db.insert(profiles).values({ userId });
  } else {
    // Store as JSON in a notes field or just log — schema doesn't have these columns yet
    // We'll log to audit for now
    await logAudit("privacy_settings_updated", "profile", userId, userId, data);
  }
}

// ─── Daily Picks ──────────────────────────────────────────────────────────────
export async function getDailyPicks(userId: number) {
  const db = await getDb();
  if (!db) return [];

  // Get users this person has already liked or passed
  const likedIds = (await db.select({ id: likes.toUserId }).from(likes).where(eq(likes.fromUserId, userId))).map((r) => r.id);
  const passedIds = (await db.select({ id: passes.toUserId }).from(passes).where(eq(passes.fromUserId, userId))).map((r) => r.id);
  const excludeIds = [...likedIds, ...passedIds, userId];

  // Get candidate profiles
  const allProfiles = await db.select({ userId: profiles.userId }).from(profiles)
    .where(and(ne(profiles.userId, userId), eq(profiles.isActive, true)))
    .limit(50);

  const candidateIds = allProfiles
    .map((p) => p.userId)
    .filter((id) => !excludeIds.includes(id))
    .slice(0, 5);

  if (candidateIds.length === 0) return [];

  const picks = [];
  for (const targetId of candidateIds) {
    const profile = await getProfile(targetId);
    picks.push({ id: targetId, targetUserId: targetId, status: "pending", profile, createdAt: new Date() });
  }
  return picks;
}

// ─── Matches ──────────────────────────────────────────────────────────────────
export async function getMatches(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const matchList = await db.select().from(matches).where(
    and(
      or(eq(matches.user1Id, userId), eq(matches.user2Id, userId)),
      eq(matches.status, "active")
    )
  ).orderBy(desc(matches.createdAt));

  const result = [];
  for (const m of matchList) {
    const otherId = m.user1Id === userId ? m.user2Id : m.user1Id;
    const otherProfile = await getProfile(otherId);
    result.push({ ...m, otherUserId: otherId, otherProfile });
  }
  return result;
}

export async function getMatchById(matchId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(matches).where(
    and(eq(matches.id, matchId), or(eq(matches.user1Id, userId), eq(matches.user2Id, userId)))
  ).limit(1);
  if (result.length === 0) return null;
  const m = result[0];
  const otherId = m.user1Id === userId ? m.user2Id : m.user1Id;
  const otherProfile = await getProfile(otherId);
  return { ...m, otherUserId: otherId, otherProfile };
}

export async function createLike(fromUserId: number, toUserId: number) {
  const db = await getDb();
  if (!db) return { matched: false };

  // Record the like
  await db.insert(likes).values({ fromUserId, toUserId });

  // Check if the other person already liked us
  const mutualLike = await db.select().from(likes).where(
    and(eq(likes.fromUserId, toUserId), eq(likes.toUserId, fromUserId))
  ).limit(1);

  if (mutualLike.length > 0) {
    // Create a match
    const result = await db.insert(matches).values({ user1Id: fromUserId, user2Id: toUserId, status: "active" });
    const matchId = Number((result as any).insertId);
    // Create conversation
    await db.insert(conversations).values({ matchId });
    return { matched: true, matchId };
  }
  return { matched: false };
}

export async function createPass(fromUserId: number, toUserId: number) {
  const db = await getDb();
  if (!db) return;
  await db.insert(passes).values({ fromUserId, toUserId });
}

// ─── Messages ─────────────────────────────────────────────────────────────────
export async function getConversation(matchId: number, userId: number) {
  const db = await getDb();
  if (!db) return { messages: [] };

  // Verify the user is part of this match
  const match = await getMatchById(matchId, userId);
  if (!match) return { messages: [] };

  // Get conversation
  const conv = await db.select().from(conversations).where(eq(conversations.matchId, matchId)).limit(1);
  if (conv.length === 0) return { messages: [] };

  const msgs = await db.select().from(messages)
    .where(and(eq(messages.conversationId, conv[0].id), eq(messages.isDeleted, false)))
    .orderBy(messages.createdAt);
  return { messages: msgs };
}

export async function sendMessage(senderId: number, matchId: number, content: string, isAiDraft: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get or create conversation
  let conv = await db.select().from(conversations).where(eq(conversations.matchId, matchId)).limit(1);
  if (conv.length === 0) {
    await db.insert(conversations).values({ matchId });
    conv = await db.select().from(conversations).where(eq(conversations.matchId, matchId)).limit(1);
  }

  const result = await db.insert(messages).values({
    conversationId: conv[0].id,
    senderId,
    content,
    isAiDraft,
  });
  await db.update(conversations).set({ lastMessageAt: new Date() }).where(eq(conversations.id, conv[0].id));
  return { id: Number((result as any).insertId), senderId, matchId, content, isAiDraft, createdAt: new Date() };
}

export async function reportMessage(reporterId: number, messageId: number, reason: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(messageReports).values({ reporterId, messageId, reason, status: "open" });
}

// ─── Reports ──────────────────────────────────────────────────────────────────
export async function submitReport(reporterId: number, reportedUserId: number, reason: string, details: string) {
  const db = await getDb();
  if (!db) return;
  await db.insert(profileReports).values({ reporterId, reportedUserId, reason, details, status: "open" });
}

export async function getReports() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(profileReports).orderBy(desc(profileReports.createdAt)).limit(100);
  return rows.map((r) => ({
    id: r.id,
    reason: r.reason,
    details: r.details,
    status: r.status === "open" ? "pending" : r.status,
    createdAt: r.createdAt,
    resolution: null,
  }));
}

export async function getReport(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(profileReports).where(eq(profileReports.id, id)).limit(1);
  if (result.length === 0) return null;
  const r = result[0];
  return {
    id: r.id,
    reason: r.reason,
    details: r.details,
    status: r.status === "open" ? "pending" : r.status,
    createdAt: r.createdAt,
    resolution: null,
  };
}

export async function resolveReport(reportId: number, action: string, moderatorId: number, notes: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(profileReports).set({ status: "resolved" }).where(eq(profileReports.id, reportId));
  // Create moderation case and action
  const caseResult = await db.insert(moderationCases).values({
    sourceType: "profile_report",
    sourceId: reportId,
    assignedModeratorId: moderatorId,
    status: "resolved",
    resolution: `${action}: ${notes}`,
  });
  const caseId = Number((caseResult as any).insertId);
  await db.insert(moderatorActions).values({ caseId, moderatorId, action, rationale: notes || action });
}

export async function getModerationLog() {
  const db = await getDb();
  if (!db) return [];
  const actions = await db.select().from(moderatorActions).orderBy(desc(moderatorActions.createdAt)).limit(200);
  return actions.map((a) => ({
    id: a.id,
    reportId: a.caseId,
    action: a.action,
    notes: a.rationale,
    createdAt: a.createdAt,
  }));
}

// ─── Consent ──────────────────────────────────────────────────────────────────
export async function getConsents(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userConsents).where(eq(userConsents.userId, userId));
}

export async function getConsentByFeature(userId: number, featureKey: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(userConsents).where(
    and(eq(userConsents.userId, userId), eq(userConsents.consentType, featureKey), eq(userConsents.granted, true))
  ).limit(1);
  return result.length > 0 ? { ...result[0], status: "granted" } : null;
}

export async function grantConsent(userId: number, featureKey: string) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(userConsents).where(
    and(eq(userConsents.userId, userId), eq(userConsents.consentType, featureKey))
  ).limit(1);
  if (existing.length === 0) {
    await db.insert(userConsents).values({ userId, consentType: featureKey, granted: true, grantedAt: new Date() });
  } else {
    await db.update(userConsents).set({ granted: true, grantedAt: new Date(), revokedAt: null }).where(eq(userConsents.id, existing[0].id));
  }
}

export async function revokeConsent(userId: number, featureKey: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(userConsents).set({ granted: false, revokedAt: new Date() }).where(
    and(eq(userConsents.userId, userId), eq(userConsents.consentType, featureKey))
  );
}

export async function deleteAIData(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(userConsents).set({ granted: false, revokedAt: new Date() }).where(eq(userConsents.userId, userId));
  await db.insert(privacyRequests).values({ userId, requestType: "delete", status: "completed", notes: "AI data deletion requested" });
}

export async function exportUserData(userId: number) {
  const db = await getDb();
  if (!db) return {};
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const profile = await getProfile(userId);
  const consents = await getConsents(userId);
  const matchList = await getMatches(userId);
  return { user: user[0], profile, consents, matchCount: matchList.length, exportedAt: new Date() };
}

export async function deleteUserAccount(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(userConsents).set({ granted: false, revokedAt: new Date() }).where(eq(userConsents.userId, userId));
  await db.delete(profileMedia).where(eq(profileMedia.userId, userId));
  await db.update(profiles).set({ isActive: false }).where(eq(profiles.userId, userId));
  await db.update(users).set({ name: "[deleted]", email: null, openId: `deleted_${userId}_${Date.now()}` }).where(eq(users.id, userId));
}

// ─── Audit Log ────────────────────────────────────────────────────────────────
export async function logAudit(action: string, entityType: string, userId: number, entityId: number, details: Record<string, unknown>) {
  const db = await getDb();
  if (!db) return;
  try {
    await db.insert(auditLog).values({
      actorId: userId,
      actorRole: "user",
      eventType: action,
      resourceType: entityType,
      resourceId: String(entityId),
      metadata: details,
    });
  } catch (e) {
    console.warn("[Audit] Failed to log:", e);
  }
}

export async function getAuditLog() {
  const db = await getDb();
  if (!db) return [];
  const entries = await db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(500);
  return entries.map((e) => ({
    id: e.id,
    action: e.eventType,
    entityType: e.resourceType,
    entityId: e.resourceId,
    userId: e.actorId,
    details: e.metadata,
    createdAt: e.createdAt,
  }));
}

// ─── AI Usage (using auditLog as proxy) ──────────────────────────────────────
export async function logAIUsage(feature: string, userId: number) {
  await logAudit(`ai_usage:${feature}`, "ai_feature", userId, userId, { feature });
}

export async function getAIUsage() {
  const db = await getDb();
  if (!db) return [];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const result = await db.select({
    feature: auditLog.eventType,
    count: sql<number>`COUNT(*)`,
  }).from(auditLog)
    .where(and(
      sql`${auditLog.eventType} LIKE 'ai_usage:%'`,
      sql`${auditLog.createdAt} >= ${thirtyDaysAgo}`
    ))
    .groupBy(auditLog.eventType)
    .orderBy(desc(sql`COUNT(*)`));
  return result.map((r) => ({
    feature: r.feature.replace("ai_usage:", ""),
    count: Number(r.count),
  }));
}

// ─── Admin ────────────────────────────────────────────────────────────────────
export async function getStats() {
  const db = await getDb();
  if (!db) return { totalUsers: 0, activeProfiles: 0, openReports: 0, activeConversations: 0 };
  const [totalUsers] = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
  const [activeProfiles] = await db.select({ count: sql<number>`COUNT(*)` }).from(profiles).where(eq(profiles.isActive, true));
  const openReports = await db.select().from(profileReports).where(eq(profileReports.status, "open"));
  const [activeConversations] = await db.select({ count: sql<number>`COUNT(DISTINCT matchId)` }).from(conversations);
  return {
    totalUsers: Number(totalUsers?.count || 0),
    activeProfiles: Number(activeProfiles?.count || 0),
    openReports: openReports.length,
    activeConversations: Number(activeConversations?.count || 0),
  };
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt)).limit(500);
}

export async function updateUserRole(userId: number, role: "user" | "moderator" | "admin") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function suspendUser(userId: number) {
  const db = await getDb();
  if (!db) return;
  // Deactivate profile
  await db.update(profiles).set({ isActive: false }).where(eq(profiles.userId, userId));
}

// ─── Blocks ───────────────────────────────────────────────────────────────────
export async function blockUser(blockerId: number, blockedId: number, reason?: string) {
  const db = await getDb();
  if (!db) return;
  // Check if already blocked
  const existing = await db.select().from(blocks).where(
    and(eq(blocks.blockerId, blockerId), eq(blocks.blockedId, blockedId))
  ).limit(1);
  if (existing.length === 0) {
    await db.insert(blocks).values({ blockerId, blockedId, reason: reason ?? null });
  }
  // Also unmatch if there is an active match
  await db.update(matches).set({ status: "blocked" }).where(
    or(
      and(eq(matches.user1Id, blockerId), eq(matches.user2Id, blockedId)),
      and(eq(matches.user1Id, blockedId), eq(matches.user2Id, blockerId))
    )
  );
}

export async function unblockUser(blockerId: number, blockedId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(blocks).where(
    and(eq(blocks.blockerId, blockerId), eq(blocks.blockedId, blockedId))
  );
}

export async function getBlockedUsers(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(blocks).where(eq(blocks.blockerId, userId));
}

export async function isBlocked(userId: number, targetId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(blocks).where(
    or(
      and(eq(blocks.blockerId, userId), eq(blocks.blockedId, targetId)),
      and(eq(blocks.blockerId, targetId), eq(blocks.blockedId, userId))
    )
  ).limit(1);
  return result.length > 0;
}
