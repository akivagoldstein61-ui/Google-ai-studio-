# Kesher Skills Reference

This document is the concise Google AI Studio reference for Kesher skills. The canonical implementation sources remain:

- `skills/*/SKILL.md`
- `src/features/skills/skillRegistry.ts`
- `docs/operator/skill-inventory.md`
- `src/product/completionPlan.ts`

## Active Personality Contract

| Field | Value |
|---|---|
| Live assessment skill | `kesher-personality-assessment` |
| Instrument | `kesher-reflection-v1` |
| Scoring | `kesher-aspect-key-v1` |
| Item source | `kesher_original` |
| Scoring mode | Deterministic, no LLM scoring |
| Default visibility | Private |
| Raw-answer export | Not allowed |
| Public exact scores | Not allowed |
| Compatibility score | Not allowed |

The older `kesher-bfas-assessment` package is retained only as historical/research reference. It must not be used as the member-facing assessment path.

## Live Personality-Adjacent Skills

| Skill | Purpose |
|---|---|
| `kesher-personality-assessment` | Administer the original Kesher Reflection items and save a private report only after completion. |
| `kesher-personality-profile` | Render owner-only reflection cards from derived report fields. |
| `kesher-personality-ocean` | Map Kesher domains to culturally aware reflection, keeping observance separate from personality. |
| `kesher-personality-visibility` | Control public/private/mutual/system-only visibility boundaries. |
| `kesher-permissioned-sharing` | Create scoped, revocable personality share cards without raw answers or hidden scores. |
| `kesher-personality-why-match` | Explain matches only from visible, allowlisted signals. |
| `kesher-compatibility-reflection` | Generate mutual-consent conversation prompts without a fit score. |
| `kesher-consent-ux` | Enforce clear opt-in, revocation, and no dark-pattern consent behavior. |
| `kesher-dark-pattern-audit` | Audit sensitive flows for coercion, prechecked toggles, or misleading pressure. |
| `kesher-psychometric-validation` | Gate claims, validation language, and any future instrument changes. |

## Global Safety Contract

- Use reflection, tendencies, possible strengths/friction, and uncertainty-aware copy.
- Do not use public rankings, public exact values, hidden fit meters, certainty claims, or compatibility-score claims.
- Keep raw personality answers out of exports, logs, match explanations, and public profile surfaces.
- Downstream AI may receive derived private report fields only, never raw answers.
- Any future IPIP/BFAS work requires explicit research, licensing, localization, psychometric, and release-readiness review before member exposure.

## Regeneration Note

`scripts/build-shareable-skills.mjs` can rebuild this file from current `skills/*/SKILL.md` packages. If regenerated, verify that the BFAS package remains historical-only and that this live Kesher Reflection contract is preserved.
