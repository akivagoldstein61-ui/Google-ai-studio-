# Kesher Skill Inventory

This inventory maps the interactive Skills Hub, AI Studio reference skills, repo-local Codex skills, legacy `.skill` exports, and globally installed Codex skills.

## Source Policy

- Repo-local `skills/*/SKILL.md` is the implementation-facing source for this repository.
- `~/.codex/skills` is reference evidence for this pass and was not modified.
- Legacy `skills/*.skill` files remain AI Studio/export artifacts unless promoted into a directory with `SKILL.md`.
- PDF-derived actions are represented by extracted evidence in `kesher-skills-full.md`, `docs/ai-studio/*`, `skills/kesher-personality-research`, and `src/features/skills/*`.
- The member-facing personality assessment is the original Kesher Reflection instrument, not the older IPIP-BFAS prototype reference.

## Canonical Map

| Hub ID | Canonical Codex Skill | AI Studio Alias | Status | Evidence Source | Placement |
|---|---|---|---|---|---|
| `personality-assessment` | `kesher-personality-assessment` | `kesher-personality-assessment` | live | `PersonalityAssessmentSkill.tsx`, `src/personality/scoring.ts`, assessment contract | repo-local + installed global |
| `personality-profile` | `kesher-personality-profile` | none | live | `PersonalityProfileSkill.tsx`, `PersonalityProfileScreen.tsx`, profile output contract | repo-local + installed global |
| `personality-engine` | `kesher-personality-engine` | none | reference | `kesher-skills-full.md`, global skill | repo-local + installed global |
| `personality-research` | `kesher-personality-research` | none | reference | extracted PDF dossier references | repo-local + installed global |
| `personality-ocean` | `kesher-personality-ocean` | none | live | `PersonalityOceanSkill.tsx`, Kesher domain reflection surfaces | repo-local + installed global |
| `personality-visibility` | `kesher-personality-visibility` | none | live | `PersonalityVisibilitySkill.tsx`, visibility rules | repo-local + installed global |
| `consent-ux` | `kesher-consent-ux` | `kesher-consent-ux` | live | `ConsentUxSkill.tsx`, AI Studio Skill 2, privacy reference | repo-local |
| `israeli-privacy` | `kesher-israeli-privacy` | `kesher-israeli-privacy` | live | `IsraeliPrivacySkill.tsx`, AI Studio Skill 7, privacy reference | repo-local |
| `privacy-recommendation` | `kesher-private-recommendations` | `kesher-privacy-recommendation` | live | `PrivacyRecommendationSkill.tsx`, AI Studio Skill 5 | repo-local + installed global |
| `private-taste` | `kesher-private-taste` | none | live | `PrivateTasteSkill.tsx`, taste contract | repo-local + installed global |
| `private-recommendations` | `kesher-private-recommendations` | none | reference | global skill, private recommendation copy | repo-local + installed global |
| `why-this-match` | `kesher-personality-why-match` | `kesher-why-this-match` | live | `WhyThisMatchSkill.tsx`, AI Studio Skill 6 | repo-local + installed global |
| `permissioned-sharing` | `kesher-permissioned-sharing` | `kesher-permissioned-sharing` | live | `PermissionedSharingSkill.tsx`, AI Studio Skill 3 | repo-local + installed global |
| `compatibility-reflection` | `kesher-compatibility-reflection` | `kesher-compatibility-reflection` | live | `CompatibilityReflectionSkill.tsx`, AI Studio Skill 9 | repo-local + installed global |
| `explainable-ai` | `kesher-explainable-ai` | none | reference | `kesher-skills-full.md`, global skill | repo-local + installed global |
| `filtering-marketplace` | `kesher-filtering-marketplace` | none | live | `FilteringMarketplaceSkill.tsx`, global skill | repo-local + installed global |
| `learned-taste` | `kesher-learned-taste` | none | live | `LearnedTasteSkill.tsx`, global skill | repo-local + installed global |
| `maps-date-planner` | `kesher-maps-date-planner` | none | planned | `kesher-skills-full.md`, global skill | repo-local + installed global |
| `pacing-coach` | `kesher-pacing-coach` | none | live | `PacingCoachSkill.tsx`, pacing contract | repo-local + installed global |
| `ai-runtime-governance` | `kesher-ai-governance` | `kesher-ai-runtime-governance` | live | `AIRuntimeGovernanceSkill.tsx`, AI Studio Skill 4 | repo-local + installed global |
| `ai-feature-modules` | `kesher-ai-feature-modules` | none | planned | `kesher-skills-full.md`, global skill | repo-local + installed global |
| `gemini-integration` | `kesher-gemini-integration` | none | planned | `kesher-skills-full.md`, global skill | repo-local + installed global |
| `low-latency-ai` | `kesher-low-latency-ai` | none | planned | `kesher-skills-full.md`, global skill | repo-local + installed global |
| `high-thinking-routing` | `kesher-high-thinking-routing` | none | planned | `kesher-skills-full.md`, global skill | repo-local + installed global |
| `google-ai-studio-app-builder` | `google-ai-studio-app-builder` | none | planned | AI Studio app-builder skill | repo-local + installed global |
| `system-prompt` | `kesher-system-prompt` | none | planned | `docs/ai-studio/kesher-system-prompt.txt` | repo-local + installed global |
| `calm-ux` | `kesher-calm-ux` | none | planned | `kesher-skills-full.md`, global skill | repo-local + installed global |
| `psychometric-validation` | `kesher-psychometric-validation` | `kesher-psychometric-validation` | live | `PsychometricValidationSkill.tsx`, AI Studio Skill 8 | repo-local |
| `dark-pattern-audit` | `kesher-dark-pattern-audit` | `kesher-dark-pattern-audit` | live | `DarkPatternAuditSkill.tsx`, AI Studio Skill 10 | repo-local |
| `personality-delivery` | `kesher-personality-delivery` | none | reference | delivery plugin map and verification matrix | repo-local + installed global |
| `identity-verification` | `kesher-identity-verification` | none | gated | product completion registry, auth/verification launch gate | repo-local |
| `match-lifecycle` | `kesher-match-lifecycle` | none | live | product completion registry, discovery-to-chat state machine | repo-local |
| `trust-safety-ops` | `kesher-trust-safety-ops` | none | live | product completion registry, report queue and operator audit plan | repo-local |
| `notifications` | `kesher-notifications` | none | planned | product completion registry, preference-managed delivery plan | repo-local |
| `subscription-entitlements` | `kesher-subscription-entitlements` | none | planned | product completion registry, commercial entitlement plan | repo-local |
| `ai-evaluation-observability` | `kesher-ai-evaluation-observability` | none | live | product completion registry, AI eval and route health gates | repo-local |
| `data-rights-retention` | `kesher-data-rights-retention` | none | live | product completion registry, export/delete/retention gates | repo-local |
| `release-readiness` | `kesher-release-readiness` | none | live | product completion registry, CI/smoke/rollback gate plan | repo-local |

## Legacy Or Planned Reference Cards

These Skills Hub cards intentionally do not link to a `skills/<id>` directory. They remain planned or legacy export references until a concrete implementation task needs a canonical skill.

| Hub ID | Legacy Artifact | Reason Not Promoted |
|---|---|---|
| `grounded-search` | `skills/kesher-grounded-search.skill` | covered by date/intelligence and Gemini grounding guidance until implementation work is requested |
| `image-analysis` | `skills/kesher-image-analysis.skill` | covered by trust/safety AI guidance until a bounded photo-check task is requested |
| `voice-integration` | `skills/kesher-voice-integration.skill` | no current Gemini Live implementation in repo |
| `sparkmatch-dating-app-skill` | `skills/sparkmatch-dating-app-skill.skill` | external reference pattern, not a Kesher production skill |
| `video-generator` | `skills/video-generator.skill` | demo utility, not current app functionality |

## Operator Notes

- Use GitHub and PR review as the durable control plane for code changes.
- Use Vercel for the live web app and status surfaces; Netlify is a static mirror unless explicitly expanded.
- Use Firebase as the current data/auth system; do not introduce Supabase, Neon, or Render persistence paths without a separate approved design.
- Product-completion gates live in `src/product/completionPlan.ts`, surface in `/skills` and `/admin/ai-ops`, and remain launch blockers until marked operational with tests and monitoring.
- Personality launch evidence is the Kesher Reflection path: original items, deterministic scoring, private report, redacted export, reset/delete cascade, and no compatibility-score claims.
