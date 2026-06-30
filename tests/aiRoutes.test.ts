import assert from "node:assert/strict";
import { test } from "node:test";
import express from "express";
import { aiRouter } from "../server/aiRoutes.ts";

test("missing Gemini API key uses a safe fallback without exposing raw errors", async () => {
  const previousKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  const app = express();
  app.use(express.json());
  app.use("/api/ai", aiRouter);

  const server = app.listen(0);
  const { port } = server.address() as { port: number };
  const logs: string[] = [];
  const originalLog = console.log;

  console.log = (...args: unknown[]) => {
    logs.push(args.map(String).join(" "));
  };

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/ai/safety-advice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "How do I safely meet someone new?" }),
    });

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(typeof body.advice, "string");
    assert.ok(!("error" in body));

    const metadataLog = logs
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .find((entry) => entry?.log_type === "ai_route_metadata");

    assert.equal(metadataLog?.feature_id, "safety_advice");
    assert.equal(metadataLog?.fallback_used, true);
    assert.equal(metadataLog?.validator_result, "missing_api_key");
    assert.equal(metadataLog?.error_class, "configuration_error");
  } finally {
    console.log = originalLog;
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });

    if (previousKey === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = previousKey;
    }
  }
});

test("AI routes default to strict auth in production", async () => {
  const previousMode = process.env.AI_ROUTE_AUTH_MODE;
  const previousNodeEnv = process.env.NODE_ENV;
  delete process.env.AI_ROUTE_AUTH_MODE;
  process.env.NODE_ENV = "production";

  const app = express();
  app.use(express.json());
  app.use("/api/ai", aiRouter);

  const server = app.listen(0);
  const { port } = server.address() as { port: number };

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/ai/safety-advice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "How do I safely meet someone new?" }),
    });

    assert.equal(response.status, 401);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });

    if (previousMode === undefined) {
      delete process.env.AI_ROUTE_AUTH_MODE;
    } else {
      process.env.AI_ROUTE_AUTH_MODE = previousMode;
    }

    if (previousNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = previousNodeEnv;
    }
  }
});

test("AI routes reject forbidden personality fields before model calls", async () => {
  const app = express();
  app.use(express.json());
  app.use("/api/ai", aiRouter);

  const server = app.listen(0);
  const { port } = server.address() as { port: number };

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/ai/explain-match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        params: {
          signals: ["interests"],
          user_profile: { tags: ["hiking"] },
          candidate_profile: { tags: ["hiking"] },
          compatibility_score: 100,
        },
      }),
    });

    assert.equal(response.status, 400);
    const body = await response.json();
    assert.match(body.error, /compatibility_score/);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});

test("AI route metadata logs do not include raw assessment answers", async () => {
  const previousKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  const app = express();
  app.use(express.json());
  app.use("/api/ai", aiRouter);

  const server = app.listen(0);
  const { port } = server.address() as { port: number };
  const logs: string[] = [];
  const originalLog = console.log;

  console.log = (...args: unknown[]) => {
    logs.push(args.map(String).join(" "));
  };

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/ai/safety-advice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: "How do I safely meet someone new?",
        rawAnswers: { kesher_extraversion_enthusiasm_1: 5 },
      }),
    });

    assert.equal(response.status, 200);
    assert.equal(logs.join("\n").includes("kesher_extraversion_enthusiasm_1"), false);
  } finally {
    console.log = originalLog;
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });

    if (previousKey === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = previousKey;
    }
  }
});
