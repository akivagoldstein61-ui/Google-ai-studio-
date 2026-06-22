import assert from "node:assert/strict";
import { test } from "vitest";
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
