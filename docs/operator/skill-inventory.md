# Kesher Skill Inventory

This inventory maps the interactive Skills Hub, AI Studio reference skills, repo-local Codex skills, legacy `.skill` exports, and globally installed Codex skills.

## Source Policy

- Repo-local `skills/*/SKILL.md` is the implementation-facing source for this repository.
- `~/.codex/skills` is reference evidence for this pass and was not modified.
- Legacy `skills/*.skill` files remain AI Studio/export artifacts unless promoted into a directory with `SKILL.md`.
- PDF-derived actions are represented by extracted evidence in `kesher-skills-full.md`, `docs/ai-studio/*`, `skills/kesher-personality-research`, and `src/features/skills/*`.

## Canonical Map

| Hub ID | Canonical Codex Skill | AI Studio Alias | Status | Evidence Source | Placement |
|---|---|---|---|---|---|
| `personality-assessment` | `kesher-bfas-assessment` | `kesher-personality-assessment` | prototype | `PersonalityAssessmentSkill.tsx`, AI Studio Skill 1, assessment contract | repo-local + installed global |
| `personality-profile` | `kesher-personality-profile` | none | prototype | `PersonalityProfileSkill.tsx`, profile output contract | repo-local + installed global |
| `personality-engine` | `kesher-personality-engine` | none | planned | `kesher-skills-full.md`, global skill | repo-local + installed global |
| `personality-research` | `kesher-personality-research` | none | planned | extracted PDF dossier references | repo-local + installed global |
| `personality-ocean` | `kesher-personality-ocean` | none | prototype | `PersonalityOceanSkill.tsx`, global skill | repo-local + installed global |
| `personality-visibility` | `kesher-personality-visibility` | none | prototype | `PersonalityVisibilitySkill.tsx`, visibility rules | repo-local + installed global |
| `consent-ux` | `kesher-consent-ux` | `kesher-consent-ux` | prototype | `ConsentUxSkill.tsx`, AI Studio Skill 2, privacy reference | repo-local |
| `israeli-privacy` | `kesher-israeli-privacy` | `kesher-israeli-privacy` | prototype | `IsraeliPrivacySkill.tsx`, AI Studio Skill 7, privacy reference | repo-local |
| `privacy-recommendation` | `kesher-private-recommendations` | `kesher-privacy-recommendation` | prototype | `PrivacyRecommendationSkill.tsx`, AI Studio Skill 5 | repo-local + installed global |
| `private-taste` | `kesher-private-taste` | none | prototype | `PrivateTasteSkill.tsx`, taste contract | repo-local + installed global |
| `private-recommendations` | `kesher-private-recommendations` | none | planned | global skill, private recommendation copy | repo-local + installed global |
| `why-this-match` | `kesher-personality-why-match` | `kesher-why-this-match` | prototype | `WhyThisMatchSkill.tsx`, AI Studio Skill 6 | repo-local + installed global |
| `permissioned-sharing` | `kesher-permissioned-sharing` | `kesher-permissioned-sharing` | prototype | `PermissionedSharingSkill.tsx`, AI Studio Skill 3 | repo-local + installed global |
| `compatibility-reflection` | `kesher-compatibility-reflection` | `kesher-compatibility-reflection` | prototype | `CompatibilityReflectionSkill.tsx`, AI Studio Skill 9 | repo-local + installed global |
| `explainable-ai` | `kesher-explainable-ai` | none | planned | `kesher-skills-full.md`, global skill | repo-local + installed global |
| `filtering-marketplace` | `kesher-filtering-marketplace` | none | prototype | `FilteringMarketplaceSkill.tsx`, global skill | repo-local + installed global |
| `learned-taste` | `kesher-learned-taste` | none | prototype | `LearnedTasteSkill.tsx`, global skill | repo-local + installed global |
| `maps-date-planner` | `kesher-maps-date-planner` | none | planned | `kesher-skills-full.md`, global skill | repo-local + installed global |
| `pacing-coach` | `kesher-pacing-coach` | none | prototype | `PacingCoachSkill.tsx`, pacing contract | repo-local + installed global |
| `ai-runtime-governance` | `kesher-ai-governance` | `kesher-ai-runtime-governance` | prototype | `AIRuntimeGovernanceSkill.tsx`, AI Studio Skill 4 | repo-local + installed global |
| `ai-feature-modules` | `kesher-ai-feature-modules` | none | planned | `kesher-skills-full.md`, global skill | repo-local + installed global |
| `gemini-integration` | `kesher-gemini-integration` | none | planned | `kesher-skills-full.md`, global skill | repo-local + installed global |
| `low-latency-ai` | `kesher-low-latency-ai` | none | planned | `kesher-skills-full.md`, global skill | repo-local + installed global |
| `high-thinking-routing` | `kesher-high-thinking-routing` | none | planned | `kesher-skills-full.md`, global skill | repo-local + installed global |
| `google-ai-studio-app-builder` | `google-ai-studio-app-builder` | none | planned | AI Studio app-builder skill | repo-local + installed global |
| `system-prompt` | `kesher-system-prompt` | none | planned | `docs/ai-studio/kesher-system-prompt.txt` | repo-local + installed global |
| `calm-ux` | `kesher-calm-ux` | none | planned | `kesher-skills-full.md`, global skill | repo-local + installed global |
| `psychometric-validation` | `kesher-psychometric-validation` | `kesher-psychometric-validation` | prototype | `PsychometricValidationSkill.tsx`, AI Studio Skill 8 | repo-local |
| `dark-pattern-audit` | `kesher-dark-pattern-audit` | `kesher-dark-pattern-audit` | prototype | `DarkPatternAuditSkill.tsx`, AI Studio Skill 10 | repo-local |
| `personality-delivery` | `kesher-personality-delivery` | none | planned | delivery plugin map and verification matrix | repo-local + installed global |

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
- Use Vercel for the live web prototype; Netlify is a static mirror unless explicitly expanded.
- Use Firebase as the current data/auth system; do not introduce Supabase, Neon, or Render persistence paths without a separate approved design.
