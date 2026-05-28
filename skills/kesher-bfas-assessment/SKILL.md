---
name: kesher-bfas-assessment
description: Implement and review Kesher's opt-in English IPIP-BFAS 100 / Big Five Aspects assessment prototype, deterministic scoring, answer handling, consent copy, reset/delete behavior, and non-clinical dating-style framing. Use when changing PersonalityAssessment, personality score types, onboarding assessment flows, prototype scoring, persistence for answers or bands, or tests for BFAS scoring and assessment privacy.
---

# Kesher BFAS Assessment

Use this skill to implement personality measurement as a user-owned reflection tool, not a matchmaking oracle.

## Workflow

1. Locate the assessment surface before editing:
   - `src/components/onboarding/PersonalityAssessment.tsx`
   - `src/components/onboarding/ProfileBuilder.tsx`
   - `src/features/onboarding/OnboardingFlow.tsx`
   - `src/ai/types.ts`
   - `src/types.ts`
   - `src/services/trustService.ts`
2. Keep scoring deterministic. Do not use Gemini or any LLM to score answers. LLMs may only interpret already-computed bands in downstream skills.
3. For this prototype, use the official English IPIP-BFAS 100 item/key spine with stable IDs, reverse-key metadata, domain/aspect mapping, and `ipip_bfas_100` scoring-version output.
4. Keep Hebrew scoring disabled until localization validation is complete. Hebrew UI may explain the status, but translated Hebrew items are not scored.
5. Store raw answers and derived scores as private, user-owned data. Do not expose raw answers, exact BFAS/aspect values, or hidden weights in discovery, match explanations, or share cards.
6. Make opt-in, reset, export, and delete controls visible wherever the user can view the profile. Reset clears answers/scores and regenerated summaries; delete removes personality data subject to legal/safety retention rules.
7. Validate copy: no diagnosis, therapy framing, fixed identity labels, fit ratings, certainty claims, or personality-based gatekeeping.

## Scoring Contract

- Score each item from 1 to 5.
- Reverse-key items with `6 - value`.
- Aggregate by domain and aspect separately.
- Convert averages to private display bands/tendencies only. Do not present exact values publicly.
- Version the scoring algorithm and questionnaire. Persist the version with each completed session.
- Never call approximate 0-100 values "validated percentiles" without a real norm table.

Read `references/assessment-contract.md` when changing questionnaire length, score storage, or the distinction between approximation and percentile.

## Acceptance Checks

- Incomplete assessments cannot be submitted.
- Reverse-keyed items change scores in the expected direction.
- The UI says the assessment is private, reflective, editable/resettable, and non-clinical.
- Reset/delete actions route through authenticated server or trust-service paths.
- Downstream AI receives derived bands/summaries only, never raw answers.
- `npm run check` or the narrowest TypeScript/test command passes.

Use `$kesher-personality-delivery` for browser validation, GitHub/CI review, or deployment workflow after implementation.
