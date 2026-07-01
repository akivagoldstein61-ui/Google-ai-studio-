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

## Output Contract

Read `references/output-contract.md` before changing schemas, prompts, or UI cards.

The profile may include private summary, domain cards, aspect highlights, dating superpower, growth area, communication notes, and repair suggestions.

The profile must not include diagnosis or treatment language, fixed identity labels, match scores, desirability claims, raw BFAS answers, raw score dumps, hidden weights, private taste, or private messages.

## Acceptance Checks

- Validator rejects prohibited language using `outputValidators.validatePersonalityProfile`.
- UI does not expose generated insight cards to other users by default.
- Loading, unavailable-AI, reset, delete, and export states remain reachable.
- Analytics events do not include raw answers or generated sensitive text.
- `npm run check` or a targeted TypeScript/test command passes.

Use `$kesher-personality-delivery` for browser validation and release workflow.


## Implementation Workflow
1. **Data Aggregation:** Retrieve the user's calculated OCEAN scores and behavioral archetypes from Firestore.
2. **Prompt Construction:** Construct a prompt for the Gemini API using the aggregated data to generate a cohesive, private personality narrative.
3. **Generation & Storage:** Call the Gemini API, parse the response, and store the generated narrative in the `Private Owner` layer.

## Manus Execution Directive
- **Capability:** `web_development`
- **Connector:** Gemini API
- **Action:** Implement the server route to generate the private personality narrative using the Gemini API.
