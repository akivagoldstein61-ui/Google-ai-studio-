---
name: kesher-gemini-routing
description: Gemini model-routing policy for Kesher, including high-thinking decisions, low-latency response lanes, server-side enforcement, feature allowlists, cost/latency tradeoffs, and observability. Use when choosing Gemini models or thinking budgets, designing AI routing architecture, or deciding which Kesher AI tasks need fast, balanced, grounded, or high-reasoning execution.
---

# Kesher Gemini Routing

## Operating Posture

Do not make every AI interaction smarter or faster by default. Route each Kesher task to the cheapest safe lane that preserves trust, latency, and product quality. Enforce routing server-side through feature registration, schemas, safety policy, and observability.

Read `references/gemini-routing.md` for lane definitions, high-thinking triggers, and low-latency architecture.

## Workflow

1. Classify the task by risk and complexity: routine assistive UX, nuance-sensitive communication, grounded planning, safety/moderation, or premium concierge.
2. Pick a lane: fast lane, balanced lane, grounded lane, high-thinking lane, or human-reviewed assistive lane.
3. Define latency deadline, quality requirement, cost tolerance, and fallback behavior.
4. Require server-side key handling, feature allowlist checks, structured outputs, validation, rate limits, and logging.
5. Reserve high thinking for ambiguity, multi-constraint planning, sensitive phrasing, or policy rationale drafts.
6. Avoid high thinking for short rewrites, bios, quick summaries, and routine UI copy.

## Plugin Routing

Use available plugins when routing policy needs concrete infrastructure decisions:

- Use GitHub for current model-router, feature registry, schemas, validators, and server/client call paths.
- Use Cloudflare for Workers, AI Gateway, Durable Objects, edge policy, caching, and latency-sensitive routing designs.
- Use Vercel or Netlify for serverless deployment, preview environments, protected deploy URLs, and framework hosting constraints.
- Use CircleCI for CI checks that enforce schema validation, safety gates, and routing tests.
- Use Neon Postgres for persistence, logs, audit tables, rate-limit data, and retention-sensitive design.
- Use YepCode for isolated experiments that compare routing behavior, cost, latency, or API responses.
- Use Hugging Face when evaluating non-Gemini models, datasets, or eval artifacts.

## Output Rules

- Produce a routing table when designing multiple features.
- Include fallbacks for timeouts, schema failures, grounding failures, and safety refusal.
- Keep safety and dignity ahead of latency gains.
- Escalate product-policy questions to `kesher-ai-feature-planner` and real-world grounding choices to `kesher-grounded-date-intelligence`.
