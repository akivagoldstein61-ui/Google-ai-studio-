---
name: kesher-bfas-assessment
description: Historical reference for the older IPIP-BFAS / Big Five Aspects assessment work. Do not use this as the live Kesher member-facing assessment. Use kesher-personality-assessment for current implementation, scoring, consent, export, reset/delete, and privacy checks.
---

# Kesher BFAS Assessment Reference

This skill is retained only for historical and research context. The live Kesher product path is the original Kesher Reflection instrument defined in:

- `skills/kesher-personality-assessment/SKILL.md`
- `src/personality/scoring.ts`
- `src/components/onboarding/PersonalityAssessment.tsx`
- `src/features/settings/PersonalityProfileScreen.tsx`
- `server/trustRoutes.ts`

Do not revive IPIP-BFAS as the member-facing path without a separate approved research, licensing, localization, psychometric, and release-readiness review.

## Current Routing Rule

- Live assessment changes must use `$kesher-personality-assessment`.
- Live scoring must use `kesher-reflection-v1` and `kesher-aspect-key-v1`.
- IPIP/BFAS code or copy may appear only where it is explicitly labeled as historical or research reference.
- Public, onboarding, settings, sharing, export, and Vercel review surfaces must not present IPIP-BFAS as the active assessment.

## Guardrails Preserved From The BFAS Work

These constraints still apply to the live Kesher Reflection path:

1. Keep scoring deterministic. Do not use Gemini or any LLM to score answers.
2. Do not expose raw answers, exact public scores, hidden weights, or private taste internals.
3. Make opt-in, reset, export, and delete controls visible wherever the user can view the personality profile.
4. Validate copy: no diagnosis, therapy framing, fixed identity labels, fit ratings, certainty claims, or personality-based gatekeeping.
5. Downstream AI receives derived private report fields only, never raw answers.

## Acceptance Checks For Any File That Touches This Reference

- The changed surface clearly identifies BFAS/IPIP as historical or research-only.
- No member-facing route, static Vercel page, or generated skills page tells users to take an IPIP-BFAS journey.
- The live assessment contract remains owned by `$kesher-personality-assessment`.
- `npm test`, `npm run lint`, and `npm run build` pass for broad changes.
