# Kesher Personality Skills Bundle

This checked-in bundle summary points to the canonical skill packages in `skills/*/SKILL.md` and the live Skills Hub registry in `src/features/skills/skillRegistry.ts`.

## Current Personality Contract

The member-facing personality system is Kesher Reflection:

- Instrument version: `kesher-reflection-v1`
- Score version: `kesher-aspect-key-v1`
- Item source: `kesher_original`
- Scoring: deterministic, no LLM scoring
- Report: private by default, saved only after completion
- Export: safe report export only, `raw_answers_included: false`
- Matching: no compatibility score, no public trait ranking, no hidden fit meter

The older `kesher-bfas-assessment` package is historical/research reference only. Do not use it as the live assessment source.

## Canonical Skill Groups

### Live Personality Surfaces

- `kesher-personality-assessment`
- `kesher-personality-profile`
- `kesher-personality-ocean`
- `kesher-personality-visibility`
- `kesher-permissioned-sharing`
- `kesher-personality-why-match`
- `kesher-compatibility-reflection`

### Privacy, Consent, And Safety

- `kesher-consent-ux`
- `kesher-israeli-privacy`
- `kesher-dark-pattern-audit`
- `kesher-data-rights-retention`
- `kesher-privacy-preserving-recommendation`
- `kesher-private-recommendations`
- `kesher-private-taste`

### AI And Product Governance

- `kesher-ai-governance`
- `kesher-ai-feature-modules`
- `kesher-ai-evaluation-observability`
- `kesher-gemini-integration`
- `kesher-low-latency-ai`
- `kesher-high-thinking-routing`
- `kesher-release-readiness`
- `kesher-psychometric-validation`

### Discovery, Matching, And Communication

- `kesher-filtering-marketplace`
- `kesher-learned-taste`
- `kesher-maps-date-planner`
- `kesher-match-lifecycle`
- `kesher-notifications`
- `kesher-pacing-coach`
- `kesher-trust-safety-ops`
- `kesher-voice-integration`

### Reference Or Platform Packages

- `google-ai-studio-app-builder`
- `kesher-bfas-assessment` historical reference only
- `kesher-calm-ux`
- `kesher-explainable-ai`
- `kesher-grounded-search`
- `kesher-identity-verification`
- `kesher-image-analysis`
- `kesher-personality-delivery`
- `kesher-personality-engine`
- `kesher-personality-research`
- `kesher-subscription-entitlements`
- `kesher-system-prompt`
- `sparkmatch-dating-app-skill`
- `video-generator`

## Verification Rule

After regeneration with `scripts/build-shareable-skills.mjs`, verify that generated pages and downloads do not present IPIP/BFAS as the active member journey and do not claim personality compatibility scores, public exact scores, raw-answer export, or production behavior unsupported by the current app.
