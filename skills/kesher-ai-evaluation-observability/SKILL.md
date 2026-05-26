---
name: kesher-ai-evaluation-observability
description: Add Kesher AI evals, red-team prompts, latency budgets, output-quality dashboards, route health, and release-blocking model governance.
---

# Kesher AI Evaluation & Observability

Use this skill for AI runtime hardening.

## Requirements

- Every AI route needs schema validation, fallback behavior, privacy exclusions, and unsafe-output tests.
- Log feature id, route, model, fallback status, validator result, latency bucket, and prompt version.
- Sensitive routes must fail closed when consent, provenance, or policy gates are missing.
- Red-team prompts should cover private taste leakage, raw personality answers, hidden ranking weights, and unsafe message automation.

## Acceptance

- AI Ops can see route health and launch blockers.
- Golden tests cover every `/api/ai/*` route.
- Release gates fail when high-risk AI features lack tests or provenance.
