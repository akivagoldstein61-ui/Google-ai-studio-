---
name: kesher-personality-assessment
description: Implement and review Kesher's opt-in original personality reflection, deterministic scoring, private report handling, consent copy, reset/delete/export behavior, and non-clinical dating-style framing. Use when changing PersonalityAssessment, personality score types, onboarding assessment flows, persistence for reports, visibility, or tests for scoring and assessment privacy.
---

# Kesher Personality Assessment

Use this skill to implement personality measurement as a user-owned reflection tool, not a matchmaking oracle.

## Workflow

1. Locate the live assessment surface before editing:
   - `src/components/onboarding/PersonalityAssessment.tsx`
   - `src/personality/scoring.ts`
   - `src/personality/privacy.ts`
   - `src/components/onboarding/ProfileBuilder.tsx`
   - `src/features/onboarding/OnboardingFlow.tsx`
   - `src/features/settings/PersonalityProfileScreen.tsx`
   - `src/types.ts`
   - `server/trustRoutes.ts`
2. Keep scoring deterministic. Do not use Gemini or any LLM to score answers. LLMs may only interpret already-computed private report fields in downstream skills.
3. Use the original Kesher reflection item bank from `src/personality/scoring.ts` for the live app path. Keep IPIP/BFAS references isolated to explicit prototype/reference routes.
4. Store the derived report as private, user-owned data. Do not export raw answers, exact public scores, hidden weights, or private taste internals.
5. Make opt-in, reset, export, and delete controls visible wherever the user can view the personality profile. Reset clears answers/reports and regenerated summaries; delete removes personality data subject to legal/safety retention rules.
6. Validate copy: no diagnosis, therapy framing, fixed identity labels, fit ratings, certainty claims, soulmate/destiny language, or personality-based gatekeeping.

## Scoring Contract

- Score each item from 1 to 5.
- Reverse-key items with `6 - value`.
- Aggregate by domain and aspect separately.
- Store version metadata: `instrument_version`, `score_version`, and `item_text_source`.
- Present owner-facing bands and reflective notes. Do not present public exact values or compatibility scores.
- Mark incomplete reports as partial internally, but do not let onboarding save the assessment until all live items are answered.

## Acceptance Checks

- Incomplete onboarding assessments cannot be submitted.
- Reverse-keyed items change scores in the expected direction.
- The UI says the assessment is private, reflective, editable/resettable, and non-clinical.
- Reset/delete/export actions route through authenticated trust-service paths.
- Export payloads include `raw_answers_included: false` and no raw answer fields.
- Downstream AI receives derived private report fields only, never raw answers.
- `npm test`, `npm run lint`, and `npm run build` pass for broad changes.
