---
name: kesher-bfas-assessment
description: Implement and review Kesher's opt-in BFAS/Big Five Aspects assessment flow, deterministic scoring, answer handling, consent copy, reset/delete behavior, and non-clinical dating-style framing. Use when changing PersonalityAssessment, personality score types, onboarding assessment flows, Firestore/Firebase persistence for answers or scores, or tests for BFAS scoring and assessment privacy.
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
2. Keep scoring deterministic. Do not use Gemini or any LLM to score answers. LLMs may only interpret already-computed percentiles in downstream skills.
3. Treat the current short form as MVP scaffolding. If expanding beyond 20 items, prefer a versioned item bank with stable IDs, reverse-key metadata, domain/aspect mapping, and a migration path for old sessions.
4. Store raw answers and derived scores as private, user-owned data. Do not expose raw answers, raw BFAS/aspect scores, or hidden weights in discovery, match explanations, or share cards.
5. Make opt-in, reset, export, and delete controls visible wherever the user can view the profile. Reset clears answers/scores and regenerated summaries; delete removes personality data subject to legal/safety retention rules.
6. Validate copy: no diagnosis, therapy framing, fixed identity labels, compatibility scores, soulmate/destiny claims, or personality-based gatekeeping.

## Scoring Contract

- Score each item from 1 to 5.
- Reverse-key items with `6 - value`.
- Aggregate by domain and aspect separately.
- Convert MVP averages to 0-100 display values only as an approximation unless normative percentiles are available.
- Version the scoring algorithm and questionnaire. Persist the version with each completed session.
- Never call approximate 0-100 values "validated percentiles" without a real norm table.

Read `references/assessment-contract.md` when changing questionnaire length, score storage, or the distinction between approximation and percentile.

## Acceptance Checks

- Incomplete assessments cannot be submitted.
- Reverse-keyed items change scores in the expected direction.
- The UI says the assessment is private, reflective, editable/resettable, and non-clinical.
- Reset/delete actions route through authenticated server or trust-service paths.
- Downstream AI receives derived percentiles/summaries only, never raw answers.
- `npm run check` or the narrowest TypeScript/test command passes.

Use `$kesher-personality-delivery` for browser validation, GitHub/CI review, or deployment workflow after implementation.
