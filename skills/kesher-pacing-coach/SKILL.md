---
name: kesher-pacing-coach
description: Implement and review Kesher's anti-burnout pacing coach, including swipe/session signals, gentle dismissible interventions, PacingInterventionSchema, prompt safety, and non-manipulative UX. Use when changing pacing_coach registry entries, pacing-intervention routes, discovery session tracking, or break/reflection UI.
---

# Kesher Pacing Coach

Use this skill to create gentle pacing interventions that protect user attention without manipulating them.

## Workflow

1. Inspect these surfaces before editing:
   - `server/aiRoutes.ts`
   - `src/services/aiService.ts`
   - `src/ai/schemas.ts`
   - `src/ai/policies.ts`
   - `src/ai/prompts.ts`
   - `src/ai/featureRegistry.ts`
   - `src/features/discovery/DailyPicksScreen.tsx`
   - `src/features/discovery/ExploreScreen.tsx`
2. Use only coarse session metrics such as session length, swipe velocity, repeated passes, or user-dismissed nudges. Do not use private messages, personality raw answers, or sensitive traits.
3. Keep the intervention easily dismissible. Never block access, shame the user, or create scarcity pressure.
4. Return `message_he` and `reflection_prompt_he` via `PacingInterventionSchema`.
5. Rate-limit nudges so they feel supportive rather than nagging.

Read `references/pacing-contract.md` before changing triggers or prompt copy.

## Copy Standard

Use a calm prompt to pause, breathe, or reflect on what felt energizing or draining. Do not imply the user is addicted, broken, desperate, or making bad decisions.

## Acceptance Checks

- Pacing feature can be disabled or dismissed.
- Trigger thresholds are deterministic and testable.
- Gemini failure produces no intrusive modal.
- Output validator blocks diagnosis, fixed identity, and manipulation language.
- UI does not shift layout or obscure critical discovery controls.

Use `$kesher-personality-delivery` for browser checks across mobile and desktop.
