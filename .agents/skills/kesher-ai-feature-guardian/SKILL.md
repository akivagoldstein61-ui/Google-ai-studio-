---
name: kesher-ai-feature-guardian
description: "Use when changing Kesher AI feature registry contracts, server AI routes, model routing, consent gates, or AI-backed skill behavior."
---

# Kesher AI Feature Guardian

## When To Use

Use for `src/ai/*`, `src/features/ai/aiFeatureRegistry.ts`, `server/aiRoutes.ts`, AI skills in the registry, and Trust Hub AI copy.

## When Not To Use

Do not use for purely visual changes with no AI behavior or data-boundary change.

## Workflow

1. Read `AGENTS.md`.
2. Read `skills/kesher-ai-governance/SKILL.md`, `skills/kesher-gemini-integration/SKILL.md`, and the specific feature skill.
3. Confirm all AI calls stay server-side and validate inputs/outputs.
4. Verify consent, retention, allowed inputs, forbidden inputs, and fallback mode.
5. Add or update tests for leakage and unsafe outputs.

## Files To Inspect

- `src/ai/featureRegistry.ts`
- `src/features/ai/aiFeatureRegistry.ts`
- `src/ai/schemas.ts`
- `src/ai/outputValidators.ts`
- `src/ai/policies.ts`
- `server/aiRoutes.ts`
- `src/services/aiService.ts`

## Commands

- `npm test`
- `npm run typecheck`
- `npm run scan:forbidden-fields`
- `npm run scan:logs`

## Definition Of Done

AI features are contract-backed, server-routed, consent-aware, fallback-safe, and human-reviewed before consequential action.

## Safety Checks

No Gemini keys in client code, no raw private messages in logs, no exact addresses to AI, no public raw personality scores, no hidden ranking weights.

## References

- `skills/kesher-ai-governance/SKILL.md`
- `skills/kesher-gemini-integration/SKILL.md`
- `skills/kesher-low-latency-ai/SKILL.md`
- `skills/kesher-explainable-ai/SKILL.md`
