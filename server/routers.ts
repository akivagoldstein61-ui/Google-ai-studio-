import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import {
  getProfile, upsertProfile, getMatches, getDailyPicks, createLike, createPass,
  getMatchById, getConversation, sendMessage, reportMessage,
  getReports, getReport, resolveReport, getModerationLog,
  getConsents, grantConsent, revokeConsent, deleteAIData, exportUserData, deleteUserAccount,
  getAuditLog, logAudit, getAIUsage, logAIUsage,
  getAllUsers, updateUserRole, suspendUser, getStats,
  getConsentByFeature, submitReport, updatePrivacySettings,
  blockUser, unblockUser, getBlockedUsers,
} from "./db";

// ─── Role guards ──────────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
  return next({ ctx });
});

const modProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "moderator" && ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Moderator only" });
  }
  return next({ ctx });
});

// ─── AI helper with audit log ─────────────────────────────────────────────────
async function invokeAI(feature: string, userId: number, messages: any[], responseFormat?: any) {
  await logAIUsage(feature, userId);
  return invokeLLM({ messages, ...(responseFormat ? { response_format: responseFormat } : {}) });
}

// ─── App Router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,

  // ── Auth ──────────────────────────────────────────────────────────────────
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ── Profiles ──────────────────────────────────────────────────────────────
  profiles: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const profile = await getProfile(ctx.user.id);
      return { profile };
    }),
    update: protectedProcedure
      .input(z.object({
        displayName: z.string().max(100).optional(),
        bio: z.string().max(2000).optional(),
        birthYear: z.number().min(1940).max(2010).optional(),
        gender: z.string().max(50).optional(),
        location: z.string().max(200).optional(),
        observance: z.string().max(100).optional(),
        relationshipIntent: z.string().max(100).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await upsertProfile(ctx.user.id, input);
        await logAudit("profile_update", "profile", ctx.user.id, ctx.user.id, {});
        return { success: true };
      }),
    updatePrivacy: protectedProcedure
      .input(z.object({
        showAge: z.boolean().optional(),
        showLocation: z.boolean().optional(),
        allowSearchByName: z.boolean().optional(),
        profileVisibility: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await updatePrivacySettings(ctx.user.id, input);
        return { success: true };
      }),
  }),

  // ── Matches ───────────────────────────────────────────────────────────────
  matches: router({
    getDailyPicks: protectedProcedure.query(async ({ ctx }) => {
      return getDailyPicks(ctx.user.id);
    }),
    list: protectedProcedure.query(async ({ ctx }) => {
      return getMatches(ctx.user.id);
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return getMatchById(input.id, ctx.user.id);
      }),
    like: protectedProcedure
      .input(z.object({ targetUserId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const result = await createLike(ctx.user.id, input.targetUserId);
        await logAudit("like", "match", ctx.user.id, ctx.user.id, {});
        return result;
      }),
    pass: protectedProcedure
      .input(z.object({ targetUserId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await createPass(ctx.user.id, input.targetUserId);
        return { success: true };
      }),
  }),

  // ── Messages ──────────────────────────────────────────────────────────────
  messages: router({
    getConversation: protectedProcedure
      .input(z.object({ matchId: z.number() }))
      .query(async ({ ctx, input }) => {
        return getConversation(input.matchId, ctx.user.id);
      }),
    send: protectedProcedure
      .input(z.object({
        matchId: z.number(),
        content: z.string().min(1).max(4000),
        isAiDraft: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const msg = await sendMessage(ctx.user.id, input.matchId, input.content, input.isAiDraft ?? false);
        return { message: msg };
      }),
    reportMessage: protectedProcedure
      .input(z.object({ messageId: z.number(), reason: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await reportMessage(ctx.user.id, input.messageId, input.reason);
        return { success: true };
      }),
  }),

  // ── Safety ────────────────────────────────────────────────────────────────
  safety: router({
    submitReport: protectedProcedure
      .input(z.object({
        reportedUserId: z.number(),
        reason: z.string(),
        details: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await submitReport(ctx.user.id, input.reportedUserId, input.reason, input.details ?? "");
        await logAudit("report_submitted", "user", ctx.user.id, ctx.user.id, { reason: input.reason });
        return { success: true };
      }),
  }),

  // ── Consent ───────────────────────────────────────────────────────────────
  consent: router({
    getConsents: protectedProcedure.query(async ({ ctx }) => {
      const consents = await getConsents(ctx.user.id);
      return { consents };
    }),
    grantConsent: protectedProcedure
      .input(z.object({ featureKey: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await grantConsent(ctx.user.id, input.featureKey);
        await logAudit("consent_granted", "consent", ctx.user.id, ctx.user.id, { feature: input.featureKey });
        return { success: true };
      }),
    revokeConsent: protectedProcedure
      .input(z.object({ featureKey: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await revokeConsent(ctx.user.id, input.featureKey);
        await logAudit("consent_revoked", "consent", ctx.user.id, ctx.user.id, { feature: input.featureKey });
        return { success: true };
      }),
    deleteAIData: protectedProcedure.mutation(async ({ ctx }) => {
      await deleteAIData(ctx.user.id);
      await logAudit("ai_data_deleted", "user", ctx.user.id, ctx.user.id, {});
      return { success: true };
    }),
    exportData: protectedProcedure.mutation(async ({ ctx }) => {
      return exportUserData(ctx.user.id);
    }),
    deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
      await deleteUserAccount(ctx.user.id);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),
  }),

  // ── Moderation ────────────────────────────────────────────────────────────
  moderation: router({
    getQueue: modProcedure.query(async () => {
      return getReports();
    }),
    getCase: modProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getReport(input.id);
      }),
    resolveCase: modProcedure
      .input(z.object({
        reportId: z.number(),
        action: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await resolveReport(input.reportId, input.action, ctx.user.id, input.notes ?? "");
        await logAudit("report_resolved", "report", ctx.user.id, input.reportId, { action: input.action });
        return { success: true };
      }),
    getLog: modProcedure.query(async () => {
      return getModerationLog();
    }),
  }),

  // ── Admin ─────────────────────────────────────────────────────────────────
  admin: router({
    getStats: adminProcedure.query(async () => {
      return getStats();
    }),
    listUsers: adminProcedure.query(async () => {
      return getAllUsers();
    }),
    updateUserRole: adminProcedure
      .input(z.object({ userId: z.number(), role: z.enum(["user", "moderator", "admin"]) }))
      .mutation(async ({ ctx, input }) => {
        await updateUserRole(input.userId, input.role);
        await logAudit("role_updated", "user", ctx.user.id, input.userId, { role: input.role });
        return { success: true };
      }),
    suspendUser: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await suspendUser(input.userId);
        await logAudit("user_suspended", "user", ctx.user.id, input.userId, {});
        return { success: true };
      }),
    getAuditLog: adminProcedure.query(async () => {
      return getAuditLog();
    }),
    getAIUsage: adminProcedure.query(async () => {
      return getAIUsage();
    }),
  }),

  // ── Blocks ───────────────────────────────────────────────────────────────
  blocks: router({
    block: protectedProcedure
      .input(z.object({ targetUserId: z.number(), reason: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        await blockUser(ctx.user.id, input.targetUserId, input.reason);
        await logAudit("user_blocked", "user", ctx.user.id, input.targetUserId, {});
        return { success: true };
      }),
    unblock: protectedProcedure
      .input(z.object({ targetUserId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await unblockUser(ctx.user.id, input.targetUserId);
        await logAudit("user_unblocked", "user", ctx.user.id, input.targetUserId, {});
        return { success: true };
      }),
    list: protectedProcedure.query(async ({ ctx }) => {
      return getBlockedUsers(ctx.user.id);
    }),
  }),

  // ── AI Skills ─────────────────────────────────────────────────────────────
  ai: router({
    // Bio Coach — profile improvement suggestions
    bioCoach: protectedProcedure
      .input(z.object({
        currentBio: z.string().max(2000),
        intent: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const resp = await invokeAI("bioCoach", ctx.user.id, [
          {
            role: "system",
            content: `You are a compassionate bio coach for a dating app. Help users present themselves authentically.
RULES: Never invent facts. Never use superlatives. Keep suggestions gentle and optional. Output JSON only.
Return: { "suggestions": ["string"], "questions": ["string"], "tone_note": "string" }`,
          },
          {
            role: "user",
            content: `Current bio: "${input.currentBio || "(empty)"}"\nIntent: ${input.intent || "not specified"}\nProvide 2-3 gentle improvement suggestions, 2 reflective questions, and a brief tone note.`,
          },
        ], {
          type: "json_schema",
          json_schema: {
            name: "bio_coach_response",
            strict: true,
            schema: {
              type: "object",
              properties: {
                suggestions: { type: "array", items: { type: "string" } },
                questions: { type: "array", items: { type: "string" } },
                tone_note: { type: "string" },
              },
              required: ["suggestions", "questions", "tone_note"],
              additionalProperties: false,
            },
          },
        });
        const content = resp.choices[0]?.message?.content as string | undefined;
        return JSON.parse(content || '{"suggestions":[],"questions":[],"tone_note":""}');
      }),

    // Why Match
    whyMatch: protectedProcedure
      .input(z.object({ matchId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const match = await getMatchById(input.matchId, ctx.user.id);
        if (!match) throw new TRPCError({ code: "NOT_FOUND" });
        const profile = match.otherProfile;
        const resp = await invokeAI("whyMatch", ctx.user.id, [
          {
            role: "system",
            content: `You are a thoughtful matchmaker assistant. Explain why two people might connect based ONLY on public profile information.
RULES: Never mention protected characteristics as reasons. Never claim certainty. Always include a caveat. Output JSON only.
Return: { "explanation": "string", "sharedSignals": ["string"], "caveat": "string" }`,
          },
          {
            role: "user",
            content: `Profile: location=${profile?.location || "unknown"}, intent=${profile?.relationshipIntent || "unknown"}, observance=${profile?.observance || "unknown"}`,
          },
        ], {
          type: "json_schema",
          json_schema: {
            name: "why_match_response",
            strict: true,
            schema: {
              type: "object",
              properties: {
                explanation: { type: "string" },
                sharedSignals: { type: "array", items: { type: "string" } },
                caveat: { type: "string" },
              },
              required: ["explanation", "sharedSignals", "caveat"],
              additionalProperties: false,
            },
          },
        });
        const content = resp.choices[0]?.message?.content as string | undefined;
        return JSON.parse(content || '{"explanation":"","sharedSignals":[],"caveat":""}');
      }),

    // Rephrase
    rephrase: protectedProcedure
      .input(z.object({ draftMessage: z.string().max(4000) }))
      .mutation(async ({ ctx, input }) => {
        const resp = await invokeAI("rephrase", ctx.user.id, [
          {
            role: "system",
            content: `You are a communication coach. Provide 2-3 alternative phrasings that are warm, clear, and respectful.
RULES: Never change the intent. Never add romantic pressure. Output JSON only.
Return: { "alternatives": ["string"] }`,
          },
          { role: "user", content: `Original: "${input.draftMessage}"` },
        ], {
          type: "json_schema",
          json_schema: {
            name: "rephrase_response",
            strict: true,
            schema: {
              type: "object",
              properties: { alternatives: { type: "array", items: { type: "string" } } },
              required: ["alternatives"],
              additionalProperties: false,
            },
          },
        });
        const content = resp.choices[0]?.message?.content as string | undefined;
        return JSON.parse(content || '{"alternatives":[]}');
      }),

    // Safety Check
    safetyCheck: protectedProcedure
      .input(z.object({ messageContent: z.string().max(4000) }))
      .mutation(async ({ ctx, input }) => {
        const resp = await invokeAI("safetyCheck", ctx.user.id, [
          {
            role: "system",
            content: `You are a safety assistant for a dating app. Analyze a message for potential red flags.
RULES: Be conservative. Only flag clear patterns. Output JSON only.
Return: { "risk_level": "low"|"medium"|"high", "flags": ["string"], "advice": "string"|null }`,
          },
          { role: "user", content: `Message: "${input.messageContent}"` },
        ], {
          type: "json_schema",
          json_schema: {
            name: "safety_check_response",
            strict: true,
            schema: {
              type: "object",
              properties: {
                risk_level: { type: "string", enum: ["low", "medium", "high"] },
                flags: { type: "array", items: { type: "string" } },
                advice: { type: ["string", "null"] },
              },
              required: ["risk_level", "flags", "advice"],
              additionalProperties: false,
            },
          },
        });
        const content = resp.choices[0]?.message?.content as string | undefined;
        return JSON.parse(content || '{"risk_level":"low","flags":[],"advice":null}');
      }),

    // Conversation Openers
    openers: protectedProcedure
      .input(z.object({ matchProfileSummary: z.string().max(500) }))
      .mutation(async ({ ctx, input }) => {
        const resp = await invokeAI("openers", ctx.user.id, [
          {
            role: "system",
            content: `You are a conversation coach. Suggest 3 warm, genuine openers based on a profile summary.
RULES: Based on public info only. No pickup lines. No pressure. Output JSON only.
Return: { "openers": ["string"] }`,
          },
          { role: "user", content: `Profile summary: ${input.matchProfileSummary}` },
        ], {
          type: "json_schema",
          json_schema: {
            name: "openers_response",
            strict: true,
            schema: {
              type: "object",
              properties: { openers: { type: "array", items: { type: "string" } } },
              required: ["openers"],
              additionalProperties: false,
            },
          },
        });
        const content = resp.choices[0]?.message?.content as string | undefined;
        return JSON.parse(content || '{"openers":[]}');
      }),

    // Date Ideas
    dateIdeas: protectedProcedure
      .input(z.object({ sharedInterests: z.array(z.string()).max(10) }))
      .mutation(async ({ ctx, input }) => {
        const resp = await invokeAI("dateIdeas", ctx.user.id, [
          {
            role: "system",
            content: `You are a date planning assistant. Suggest 3 first-date ideas based on shared interests.
RULES: Always include a safety note for first dates. Keep ideas accessible and low-pressure. Output JSON only.
Return: { "ideas": [{ "title": "string", "description": "string", "safetyNote": "string"|null }] }`,
          },
          { role: "user", content: `Shared interests: ${input.sharedInterests.join(", ")}` },
        ], {
          type: "json_schema",
          json_schema: {
            name: "date_ideas_response",
            strict: true,
            schema: {
              type: "object",
              properties: {
                ideas: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      safetyNote: { type: ["string", "null"] },
                    },
                    required: ["title", "description", "safetyNote"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["ideas"],
              additionalProperties: false,
            },
          },
        });
        const content = resp.choices[0]?.message?.content as string | undefined;
        return JSON.parse(content || '{"ideas":[]}');
      }),

    // Personality / Values Summary
    personalitySummary: protectedProcedure
      .input(z.object({}))
      .mutation(async ({ ctx }) => {
        const profile = await getProfile(ctx.user.id);
        const resp = await invokeAI("personalitySummary", ctx.user.id, [
          {
            role: "system",
            content: `You are a warm, non-clinical values summarizer. Write a brief, warm summary of a user's values.
RULES: Never diagnose. Never use clinical terms. Always include a caveat. Output JSON only.
Return: { "summary": "string", "caveat": "string" }`,
          },
          {
            role: "user",
            content: `Profile: bio="${profile?.bio || ""}", intent="${profile?.relationshipIntent || ""}", observance="${profile?.observance || ""}"`,
          },
        ], {
          type: "json_schema",
          json_schema: {
            name: "personality_summary_response",
            strict: true,
            schema: {
              type: "object",
              properties: {
                summary: { type: "string" },
                caveat: { type: "string" },
              },
              required: ["summary", "caveat"],
              additionalProperties: false,
            },
          },
        });
        const content = resp.choices[0]?.message?.content as string | undefined;
        return JSON.parse(content || '{"summary":"","caveat":""}');
      }),

    // Pair Insight — requires consent
    pairInsight: protectedProcedure
      .input(z.object({ matchId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const consentRecord = await getConsentByFeature(ctx.user.id, "pairInsight");
        if (!consentRecord) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Consent required for pair insight" });
        }
        const match = await getMatchById(input.matchId, ctx.user.id);
        if (!match) throw new TRPCError({ code: "NOT_FOUND" });
        const resp = await invokeAI("pairInsight", ctx.user.id, [
          {
            role: "system",
            content: `You are a thoughtful relationship coach. Provide a brief, warm insight about potential dynamics.
RULES: Based on public info only. Never diagnose. Never claim certainty. Always include a caveat. Output JSON only.
Return: { "insight": "string", "caveat": "string" }`,
          },
          {
            role: "user",
            content: `Match profile: intent="${match.otherProfile?.relationshipIntent || ""}", observance="${match.otherProfile?.observance || ""}"`,
          },
        ], {
          type: "json_schema",
          json_schema: {
            name: "pair_insight_response",
            strict: true,
            schema: {
              type: "object",
              properties: {
                insight: { type: "string" },
                caveat: { type: "string" },
              },
              required: ["insight", "caveat"],
              additionalProperties: false,
            },
          },
        });
        const content = resp.choices[0]?.message?.content as string | undefined;
        return JSON.parse(content || '{"insight":"","caveat":""}');
      }),

    // Safety Advice
    safetyAdvice: protectedProcedure
      .input(z.object({ situation: z.string().max(500) }))
      .mutation(async ({ ctx, input }) => {
        const resp = await invokeAI("safetyAdvice", ctx.user.id, [
          {
            role: "system",
            content: `You are a safety advisor for a dating app. Provide general safety advice.
RULES: General advice only. Always recommend professional help for serious situations. Output JSON only.
Return: { "advice": "string", "resources": ["string"] }`,
          },
          { role: "user", content: `Situation: ${input.situation}` },
        ], {
          type: "json_schema",
          json_schema: {
            name: "safety_advice_response",
            strict: true,
            schema: {
              type: "object",
              properties: {
                advice: { type: "string" },
                resources: { type: "array", items: { type: "string" } },
              },
              required: ["advice", "resources"],
              additionalProperties: false,
            },
          },
        });
        const content = resp.choices[0]?.message?.content as string | undefined;
        return JSON.parse(content || '{"advice":"","resources":[]}');
      }),

    // Moderation Summary — mod/admin only
    moderationSummary: modProcedure
      .input(z.object({ reportId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const report = await getReport(input.reportId);
        if (!report) throw new TRPCError({ code: "NOT_FOUND" });
        const resp = await invokeAI("moderationSummary", ctx.user.id, [
          {
            role: "system",
            content: `You are a moderation assistant. Summarize a report and suggest a moderation action.
RULES: This is a DRAFT only. A human moderator MUST make the final decision. Be conservative. Output JSON only.
Return: { "summary": "string", "suggestedAction": "string", "confidence": "low"|"medium"|"high", "caveat": "string" }`,
          },
          {
            role: "user",
            content: `Report reason: ${report.reason}. Details: ${report.details || "none"}`,
          },
        ], {
          type: "json_schema",
          json_schema: {
            name: "moderation_summary_response",
            strict: true,
            schema: {
              type: "object",
              properties: {
                summary: { type: "string" },
                suggestedAction: { type: "string" },
                confidence: { type: "string", enum: ["low", "medium", "high"] },
                caveat: { type: "string" },
              },
              required: ["summary", "suggestedAction", "confidence", "caveat"],
              additionalProperties: false,
            },
          },
        });
        const content = resp.choices[0]?.message?.content as string | undefined;
        return JSON.parse(content || '{"summary":"","suggestedAction":"","confidence":"low","caveat":""}');
      }),
  }),
});

export type AppRouter = typeof appRouter;
