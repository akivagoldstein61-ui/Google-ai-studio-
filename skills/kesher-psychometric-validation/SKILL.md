---
name: kesher-psychometric-validation
description: "Gate Kesher personality assessment, scoring, interpretation, ranking, and compatibility claims through psychometric validation requirements. Use when changing assessment items, scoring, Hebrew/English adaptation, reliability claims, invariance, ranking use, or release readiness."
---

# Kesher Psychometric Validation

Use this skill to decide whether a personality-related feature is prototype-only, blocked, or ready for a validation step.

## Workflow

1. Inspect `src/components/onboarding/PersonalityAssessment.tsx`, `src/personality/personalityService.ts`, `src/personality/types.ts`, `scripts/test-personality-scoring.mjs`, and `docs/personality/*` before changing measurement behavior.
2. Confirm item provenance and commercial-use rights before adding or changing item text.
3. Keep scoring deterministic and testable. LLMs may interpret bounded bands, but must not score answers, infer traits from behavior, photos, messages, or bios, or generate norm claims.
4. Treat Hebrew translation as adaptation work. Do not claim Hebrew validity from translation alone.
5. Block personality-driven ranking, compatibility scores, cross-user trait comparison, and population norm claims until reliability, response quality, test-retest, measurement invariance, incremental validity, and harm gates are documented.
6. Use bands and reflective language for prototypes: "may", "tends to", "possible", "worth discussing". Avoid clinical, destiny, fixed-label, or fit-verdict language.

## Validation Gates

- Instrument rights and item provenance are documented.
- Domain reliability and facet reliability have approved thresholds.
- Response-quality checks can mark reflection unavailable.
- Test-retest and invariance plans exist before cross-language or cross-user comparison.
- Harm testing and privacy review are complete before production use.

## Acceptance Checks

- Tests cover reverse scoring, missing answers, quality flags, reset/delete behavior, and forbidden output language.
- Docs mark production personality ranking as blocked unless all named gates are closed.
- User-visible copy frames personality as optional private reflection, not scientific matchmaking certainty.
