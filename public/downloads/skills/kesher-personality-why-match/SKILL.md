---
name: kesher-personality-why-match
description: Implement and review personality-safe "Why This Match" explanations for Kesher using whitelisted visible signals, structured Gemini output, uncertainty notes, and leakage prevention. Use when changing explain-match routes, WhyThisMatchPayloadSchema, output validators, DailyPicks/ProfileCard explanation UI, or reason-code generation for personality-aware recommendations.
---

# Kesher Personality Why Match

Use this skill when explaining a recommendation that may have been influenced by personality, values, or private preference systems.

## Workflow

1. Inspect these surfaces before editing:
   - `server/aiRoutes.ts`
   - `src/services/aiService.ts`
   - `src/ai/outputValidators.ts`
   - `src/ai/schemas.ts`
   - `src/ai/policies.ts`
   - `src/ai/prompts.ts`
   - `src/features/discovery/DailyPicksScreen.tsx`
   - `src/components/discovery/ProfileCard.tsx`
   - `src/components/discovery/ProfileDetail.tsx`
2. Ensure the route sanitizes inputs with visible-profile pickers and whitelisted signals before calling Gemini.
3. Preserve `signals_used`, `signals_not_used`, and `uncertainty_he` in every generated output.
4. Use only allowed reason codes from `WHY_MATCH_ALLOWED_SIGNALS`.
5. Include forbidden signals in `signals_not_used`: private taste, hidden dealbreakers, hidden ranking, raw personality scores, private messages, exact location, and protected-trait inference.
6. Fall back to deterministic templates when the model fails validation.

Read `references/explanation-contract.md` before changing allowed signals, prompts, or templates.

## Copy Standard

Say "you might connect over", "based on what is visible", or "one thing to explore". Do not say "the algorithm knows", "you are compatible", "98% match", or "your personality proves".

## Acceptance Checks

- Validator rejects forbidden signals and prohibited language.
- Explanations show 2-3 short reasons, a first question, and an uncertainty note.
- Explanations never reveal private taste or raw scores.
- UI provides a path to manage taste/profile controls.
- Tests include at least one leakage attempt.

Use `$kesher-private-taste` for recommender inputs and `$kesher-personality-delivery` for verification.
