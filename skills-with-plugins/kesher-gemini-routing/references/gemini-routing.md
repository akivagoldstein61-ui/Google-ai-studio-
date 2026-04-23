# Kesher Gemini Routing Reference

## Source Documents

- `Enable High Thinking for Kesher.pdf`
- `Kesher low-latency responses dossier.pdf`

## Routing Doctrine

High thinking is worth shipping only as a tightly scoped routing layer, not as "smarter AI everywhere." Low latency is worth shipping only as deadline-aware routing, not as "make everything fast."

Route by task value, risk, latency sensitivity, and trust consequences.

## Routing Lanes

Fast lane:

- short rewrites,
- lightweight openers,
- profile microcopy,
- quick summaries,
- UI assistive tasks.

Balanced lane:

- message coaching,
- profile clarity audits,
- bounded explanations,
- routine structured outputs where quality matters.

Grounded lane:

- current events,
- open-now checks,
- place logistics,
- Safety Center questions needing sources.

High-thinking lane:

- multi-constraint date planning,
- nuanced boundary/de-escalation phrasing,
- observance-sensitive wording,
- policy explanation drafts,
- premium deep help,
- ambiguous tradeoff decisions.

Human-reviewed assistive lane:

- moderation severity rationale,
- enforcement summaries,
- safety triage,
- anything consequential to member access or safety.

## Server-Side Architecture Requirements

Production routing should enforce:

- server-side Gemini key handling,
- feature allowlist registry,
- per-feature risk level,
- consent requirements,
- structured schemas,
- validators,
- safety settings,
- deadline and timeout policy,
- retry/fallback behavior,
- rate limits,
- logging and observability.

Client-side Gemini calls are not acceptable for production trust controls.

## High Thinking Triggers

Enable high thinking when:

- the task has multiple constraints and tradeoffs,
- tone mistakes can meaningfully harm trust,
- the answer needs careful policy reasoning,
- ambiguity is high,
- the feature is visibly premium and quality-sensitive.

Avoid high thinking when:

- the task is routine,
- output is short and low stakes,
- latency matters more than nuance,
- the user expects quick assistive UX.

## Failure Handling

Define behavior for:

- timeout: return a simpler safe answer or ask to retry,
- schema failure: repair once, then fail closed,
- grounding failure: disclose and offer ungrouded fallback only if safe,
- safety refusal: explain boundary calmly,
- cost/rate pressure: downgrade non-critical tasks first.

## Plugin Integration

Use plugins when routing policy touches real infrastructure:

- GitHub: inspect model routers, AI routes, validators, schemas, and feature registries.
- Cloudflare: design Workers, AI Gateway, Durable Objects, edge caching, and latency-aware routing.
- Vercel and Netlify: evaluate serverless deployment, preview URLs, protected deployments, and hosting constraints.
- CircleCI: build CI gates for schemas, policy tests, latency checks, and route safety.
- Neon Postgres: plan logging, audit tables, rate-limit state, consent records, and retention policy.
- YepCode: run isolated cost/latency/API-response experiments.
- Hugging Face: inspect alternative models, datasets, evals, or Gradio prototypes when Gemini is not the only option.
