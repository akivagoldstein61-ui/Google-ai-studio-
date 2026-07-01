---
name: kesher-compatibility-reflection
description: Implement and review Kesher's mutual-consent compatibility reflection engine, pair insight schemas, consent gates, whitelisted shared inputs, and no-score safety validation. Use when changing compatibility-reflection API routes, PairInsightReportSchema, compatibility prompts, match-sheet reflection UI, consent checks, or tests for forbidden compatibility language.
---

# Kesher Compatibility Reflection

Use this skill to build pair reflection that helps two opted-in users talk better. It must never decide whether they should date.

## Workflow

1. Inspect these surfaces before editing:
   - `server/aiRoutes.ts`
   - `src/services/aiService.ts`
   - `src/ai/schemas.ts`
   - `src/ai/policies.ts`
   - `src/ai/prompts.ts`
   - `src/ai/outputValidators.ts`
   - `src/features/match/MatchSheet.tsx`
   - `docs/adr/0003-mutual-consent-compatibility-reflection.md`
2. Enforce `mutualConsent === true` and `bothOptedIn === true` before any AI call. Prefer server-side rejection over UI-only gating.
3. Build a minimized shared-input packet. Include only mutually visible or explicitly approved fields.
4. Require `PairInsightReportSchema` and validate with `validateCompatibilityReflection`.
5. Preserve the product promise: shared strengths, friction loops, question to explore, micro-habit, gentle boundary, and `signals_used`.
6. Log provenance separately from prose when available, but do not leak provenance in user-facing copy.

## Forbidden Outputs

Never produce compatibility scores, match percentages, soulmate/destiny claims, perfect-match claims, doomed/incompatible verdicts, attractiveness/desirability rankings, raw personality scores, hidden ranking logic, private taste, private messages, exact location, or protected-trait inferences.

Read `references/reflection-contract.md` before changing prompt or schema language.

## Acceptance Checks

- A request without mutual consent returns `403` and never calls Gemini.
- `signals_used` contains only `COMPATIBILITY_ALLOWED_SIGNALS`.
- Prohibited-language tests cover Hebrew and English examples.
- UI language says reflection, not prediction.
- Fallback behavior returns no invented compatibility report.

Use `$kesher-personality-delivery` for browser and CI checks.


## Implementation Workflow
1. **Data Retrieval:** Retrieve the public profiles and mutual consent data for both matched users.
2. **Prompt Construction:** Construct a prompt for the Gemini API requesting a balanced, non-prescriptive compatibility reflection.
3. **Generation & Rendering:** Call the Gemini API, parse the JSON response, and render the share card in the UI.

## Manus Execution Directive
- **Capability:** `web_development`
- **Connector:** Gemini API
- **Action:** Implement the compatibility reflection generation using the Gemini API and render the result.
