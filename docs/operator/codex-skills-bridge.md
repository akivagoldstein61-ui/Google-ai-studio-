# Codex Skills Bridge

This repo keeps canonical Kesher skill content in `skills/*/SKILL.md`. Some Codex environments discover `.agents/skills/*/SKILL.md` more reliably than repo-local `skills/*`, so this branch adds concise bridge wrappers under `.agents/skills`.

The wrappers are not forks of the canonical skill docs. They point operators to the canonical source files and to the app files that implement the corresponding behavior.

## Bridge Wrappers

- `.agents/skills/kesher-skills-hub-operationalizer/SKILL.md`
- `.agents/skills/kesher-ai-feature-guardian/SKILL.md`
- `.agents/skills/kesher-rtl-calm-ux-reviewer/SKILL.md`
- `.agents/skills/kesher-vercel-preview-verifier/SKILL.md`
- `.agents/skills/kesher-privacy-safety-redteam/SKILL.md`

## Canonical Sources

- Product constitution and operating rules: `AGENTS.md`
- Skill registry and state: `src/features/skills/skillRegistry.ts`, `src/features/skills/types.ts`, `src/features/skills/useSkillState.ts`
- AI governance: `src/ai/featureRegistry.ts`, `src/features/ai/aiFeatureRegistry.ts`, `server/aiRoutes.ts`
- Privacy/safety review: `src/ai/outputValidators.ts`, `src/ai/policies.ts`, `server/aiRoutes.ts`, `src/features/safety/*`
- UI review: `src/features/skills/*`, `src/features/discovery/*`, `src/features/chat/*`, `src/features/settings/*`

## Maintenance Rule

When a wrapper and a canonical skill disagree, the canonical skill and `AGENTS.md` win. Update the wrapper to point to the corrected source rather than silently expanding the wrapper into a second policy document.
