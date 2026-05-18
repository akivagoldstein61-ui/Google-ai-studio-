---
name: kesher-personality-profile
description: Implement and review Kesher's private personality profile interpreter, including Gemini structured output, Hebrew-first insight cards, fallback rendering, provenance, and user controls. Use when changing personality-profile routes, PersonalityProfileScreen, PersonalitySummarySchema, personality prompts, output validators, or AI Trust Hub copy for personality insights.
---

# Kesher Personality Profile

Use this skill to translate deterministic BFAS outputs into warm, private, user-visible reflection.

## Workflow

1. Inspect these surfaces before editing:
   - `src/features/settings/PersonalityProfileScreen.tsx`
   - `src/services/aiService.ts`
   - `server/aiRoutes.ts`
   - `src/ai/schemas.ts`
   - `src/ai/policies.ts`
   - `src/ai/prompts.ts`
   - `src/ai/outputValidators.ts`
   - `src/ai/featureRegistry.ts`
2. Ensure the AI receives derived domain/aspect percentiles only. Do not send raw answers, private messages, hidden ranking state, exact location, photos, or private taste details.
3. Keep `SYSTEM_INSTRUCTIONS.PERSONALITY_INTERPRETER` non-clinical and probabilistic. Preferred framing: "you tend to", "you may notice", "a helpful watch-out".
4. Require structured JSON that matches `PersonalitySummarySchema`; update validator coverage when schema fields change.
5. Render a deterministic fallback when Gemini is unavailable. The fallback must not invent a profile from missing data.
6. Keep export, reset, and delete controls available near the profile.
7. Read `$kesher-personality-research/references/gemini-vertex-runtime-governance.md` before changing model routing, prompt inputs, logging, or runtime copy.

## Output Contract

Read `references/output-contract.md` before changing schemas, prompts, or UI cards.

The profile may include private summary, domain cards, aspect highlights, dating superpower, growth area, communication notes, and repair suggestions.

The profile must not include diagnosis or treatment language, fixed identity labels, match scores, desirability claims, raw BFAS answers, raw score dumps, hidden weights, private taste, or private messages.

The profile must make measurement limits visible when instrument rights, Hebrew adaptation, or validation are not production-ready.

## Acceptance Checks

- Validator rejects prohibited language using `outputValidators.validatePersonalityProfile`.
- UI does not expose generated insight cards to other users by default.
- Loading, unavailable-AI, reset, delete, and export states remain reachable.
- Analytics events do not include raw answers or generated sensitive text.
- `npm run check` or a targeted TypeScript/test command passes.

Use `$kesher-personality-delivery` for browser validation and release workflow.
