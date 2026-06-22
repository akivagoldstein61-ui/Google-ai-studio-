import assert from "node:assert/strict";
import { afterEach, test, vi } from "vitest";
import express from "express";

const validCompatibilityReflection = {
  schemaVersion: "1.0",
  confidence: 0.7,
  evidenceLabel: "verified",
  shared_strengths_he: ["שניכם מעריכים אדיבות."],
  friction_loops: [
    {
      schemaVersion: "1.0",
      confidence: 0.7,
      evidenceLabel: "verified",
      dynamic_he: "תכנון מול ספונטניות",
      advice_he: "בדקו יחד מה נוח לשניכם.",
    },
  ],
  question_to_explore_he: "איזה קצב תקשורת נעים לכם?",
  micro_habit_he: "סכמו ציפייה אחת לפני הדייט.",
  gentle_boundary_he: "אפשר לעצור אם משהו מרגיש לא נוח.",
  signals_used: ["mutually_approved_share_card"],
};

const startApp = async (consented: boolean) => {
  vi.resetModules();
  vi.doMock("../server/consentVerification.ts", () => ({
    verifyBilateralShareConsent: vi.fn().mockResolvedValue(consented),
  }));
  vi.doMock("@google/genai", () => ({
    GoogleGenAI: vi.fn().mockImplementation(function GoogleGenAI() {
      return {
        models: {
          generateContent: vi.fn().mockResolvedValue({
            text: JSON.stringify(validCompatibilityReflection),
          }),
        },
      };
    }),
  }));

  const { aiRouter } = await import("../server/aiRoutes.ts");
  const app = express();
  app.use(express.json());
  app.use("/api/ai", aiRouter);

  const server = app.listen(0);
  const { port } = server.address() as { port: number };
  return {
    port,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      }),
  };
};

afterEach(() => {
  vi.doUnmock("../server/consentVerification.ts");
  vi.doUnmock("@google/genai");
  vi.resetModules();
});

test("compatibility reflection rejects spoofed client consent without bilateral share cards", async () => {
  const { port, close } = await startApp(false);

  try {
    const response = await fetch(
      `http://127.0.0.1:${port}/api/ai/compatibility-reflection`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          viewerUid: "viewer-1",
          candidateUid: "candidate-1",
          mutualConsent: true,
          bothOptedIn: true,
          sharedInputs: {
            values: ["kindness"],
            interests: ["hiking"],
          },
        }),
      },
    );

    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), {
      error: "MUTUAL_CONSENT_REQUIRED",
    });
  } finally {
    await close();
  }
});

test("compatibility reflection proceeds when bilateral share cards are verified", async () => {
  const previousKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "test-key";
  const { port, close } = await startApp(true);

  try {
    const response = await fetch(
      `http://127.0.0.1:${port}/api/ai/compatibility-reflection`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          viewerUid: "viewer-1",
          candidateUid: "candidate-1",
          mutualConsent: false,
          bothOptedIn: false,
          sharedInputs: {
            values: ["kindness"],
            interests: ["hiking"],
          },
        }),
      },
    );

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.ok(Array.isArray(body.shared_strengths_he));
    assert.ok(Array.isArray(body.friction_loops));
    assert.deepEqual(body.source, {
      kind: "mutually_approved_share_card",
      verified: true,
    });
  } finally {
    await close();
    if (previousKey === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = previousKey;
    }
  }
});
