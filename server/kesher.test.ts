import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock db helpers
vi.mock("./db", () => ({
  getProfile: vi.fn().mockResolvedValue({ id: 1, userId: 1, displayName: "Test", bio: "", birthYear: 1990, gender: "male", location: "TLV", observance: "traditional", relationshipIntent: "serious", media: [] }),
  upsertProfile: vi.fn().mockResolvedValue(undefined),
  updatePrivacySettings: vi.fn().mockResolvedValue(undefined),
  getDailyPicks: vi.fn().mockResolvedValue([]),
  getMatches: vi.fn().mockResolvedValue([]),
  getMatchById: vi.fn().mockResolvedValue(null),
  createLike: vi.fn().mockResolvedValue({ matched: false }),
  createPass: vi.fn().mockResolvedValue(undefined),
  getConversation: vi.fn().mockResolvedValue({ messages: [] }),
  sendMessage: vi.fn().mockResolvedValue({ id: 1, senderId: 1, matchId: 1, content: "hi", isAiDraft: false, createdAt: new Date() }),
  reportMessage: vi.fn().mockResolvedValue(undefined),
  submitReport: vi.fn().mockResolvedValue(undefined),
  getConsents: vi.fn().mockResolvedValue([]),
  grantConsent: vi.fn().mockResolvedValue(undefined),
  revokeConsent: vi.fn().mockResolvedValue(undefined),
  deleteAIData: vi.fn().mockResolvedValue(undefined),
  exportUserData: vi.fn().mockResolvedValue({ user: {}, profile: null, consents: [], matchCount: 0, exportedAt: new Date() }),
  deleteUserAccount: vi.fn().mockResolvedValue(undefined),
  getReports: vi.fn().mockResolvedValue([]),
  getReport: vi.fn().mockResolvedValue(null),
  resolveReport: vi.fn().mockResolvedValue(undefined),
  getModerationLog: vi.fn().mockResolvedValue([]),
  getAuditLog: vi.fn().mockResolvedValue([]),
  logAudit: vi.fn().mockResolvedValue(undefined),
  getAIUsage: vi.fn().mockResolvedValue([]),
  logAIUsage: vi.fn().mockResolvedValue(undefined),
  getAllUsers: vi.fn().mockResolvedValue([]),
  updateUserRole: vi.fn().mockResolvedValue(undefined),
  suspendUser: vi.fn().mockResolvedValue(undefined),
  getStats: vi.fn().mockResolvedValue({ totalUsers: 0, activeProfiles: 0, openReports: 0, activeConversations: 0 }),
  getConsentByFeature: vi.fn().mockResolvedValue(null),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
  blockUser: vi.fn().mockResolvedValue(undefined),
  unblockUser: vi.fn().mockResolvedValue(undefined),
  getBlockedUsers: vi.fn().mockResolvedValue([]),
  isBlocked: vi.fn().mockResolvedValue(false),
}));

// Mock LLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: '{"suggestions":["Better bio"],"questions":["What do you love?"],"tone_note":"Warm"}' } }],
  }),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createUserCtx(role: "user" | "moderator" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("profiles.get", () => {
  it("returns profile for authenticated user", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    const result = await caller.profiles.get();
    expect(result).toHaveProperty("profile");
  });
});

describe("profiles.update", () => {
  it("updates profile successfully", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    const result = await caller.profiles.update({ displayName: "Test User", bio: "Hello" });
    expect(result).toEqual({ success: true });
  });
});

describe("matches.getDailyPicks", () => {
  it("returns empty array for new user", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    const result = await caller.matches.getDailyPicks();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("matches.like", () => {
  it("records a like and returns matched status", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    const result = await caller.matches.like({ targetUserId: 2 });
    expect(result).toHaveProperty("matched");
  });
});

describe("messages.getConversation", () => {
  it("returns messages array", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    const result = await caller.messages.getConversation({ matchId: 1 });
    expect(result).toHaveProperty("messages");
  });
});

describe("consent.getConsents", () => {
  it("returns consents array", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    const result = await caller.consent.getConsents();
    expect(result).toHaveProperty("consents");
  });
});

describe("consent.grantConsent", () => {
  it("grants consent for a feature", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    const result = await caller.consent.grantConsent({ featureKey: "bioCoach" });
    expect(result).toEqual({ success: true });
  });
});

describe("consent.revokeConsent", () => {
  it("revokes consent for a feature", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    const result = await caller.consent.revokeConsent({ featureKey: "bioCoach" });
    expect(result).toEqual({ success: true });
  });
});

describe("admin.getStats", () => {
  it("returns stats for admin", async () => {
    const caller = appRouter.createCaller(createUserCtx("admin"));
    const result = await caller.admin.getStats();
    expect(result).toHaveProperty("totalUsers");
  });

  it("throws FORBIDDEN for non-admin", async () => {
    const caller = appRouter.createCaller(createUserCtx("user"));
    await expect(caller.admin.getStats()).rejects.toThrow();
  });
});

describe("moderation.getQueue", () => {
  it("returns queue for moderator", async () => {
    const caller = appRouter.createCaller(createUserCtx("moderator"));
    const result = await caller.moderation.getQueue();
    expect(Array.isArray(result)).toBe(true);
  });

  it("throws FORBIDDEN for regular user", async () => {
    const caller = appRouter.createCaller(createUserCtx("user"));
    await expect(caller.moderation.getQueue()).rejects.toThrow();
  });
});

describe("ai.bioCoach", () => {
  it("returns suggestions, questions, and tone_note", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    const result = await caller.ai.bioCoach({ currentBio: "I love hiking", intent: "serious" });
    expect(result).toHaveProperty("suggestions");
    expect(result).toHaveProperty("questions");
    expect(result).toHaveProperty("tone_note");
  });
});

describe("safety.submitReport", () => {
  it("submits a report successfully", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    const result = await caller.safety.submitReport({ reportedUserId: 2, reason: "spam", details: "test" });
    expect(result).toEqual({ success: true });
  });
});

describe("blocks.block", () => {
  it("blocks a user successfully", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    const result = await caller.blocks.block({ targetUserId: 2, reason: "harassment" });
    expect(result).toEqual({ success: true });
  });
});

describe("blocks.unblock", () => {
  it("unblocks a user successfully", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    const result = await caller.blocks.unblock({ targetUserId: 2 });
    expect(result).toEqual({ success: true });
  });
});

describe("blocks.list", () => {
  it("returns blocked users list", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    const result = await caller.blocks.list();
    expect(Array.isArray(result)).toBe(true);
  });
});
