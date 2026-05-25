---
name: kesher-skills-hub-operationalizer
description: "Use when implementing, auditing, or extending the Kesher Skills Hub, skill registry, skill launcher, contextual skill rails, or Codex skill bridge."
---

# Kesher Skills Hub Operationalizer

## When To Use

Use for work on `/skills`, `/skills-hub`, `src/features/skills/*`, app-surface skill rails, and `.agents/skills` wrappers.

## When Not To Use

Do not use as a replacement for feature-specific privacy, personality, AI, or safety skills. Route sensitive AI behavior to the relevant canonical skill.

## Workflow

1. Read `AGENTS.md`.
2. Inspect `docs/operator/codex-skills-operationalization-inventory.md`.
3. Inspect `src/features/skills/skillRegistry.ts`, `types.ts`, `useSkillState.ts`, `SkillLauncher.tsx`, and `SkillsRouter.tsx`.
4. Confirm every visible card has a registry entry, app entry point, consent state, privacy notes, and non-dead fallback.
5. Run targeted registry tests, then full verification before release.

## Files To Inspect

- `src/features/skills/skillRegistry.ts`
- `src/features/skills/SkillsHub.tsx`
- `src/features/skills/SkillsRouter.tsx`
- `src/features/skills/components/*`
- `src/features/skills/skillsRegistry.test.ts`
- `skills/*/SKILL.md`

## Commands

- `npm run test:skills`
- `npm test -- src/features/skills/skillsRegistry.test.ts`
- `npm run typecheck`
- `npm run build`

## Definition Of Done

All featured skills are registry-backed, launchable or honestly gated, stateful, and represented in at least one app-native surface.

## Safety Checks

No public scores, no auto-sending, no protected-trait inference, no hidden ranking leakage, and no client-side secrets.

## References

- `skills/kesher-system-prompt/SKILL.md`
- `skills/kesher-calm-ux/SKILL.md`
- `docs/operator/codex-skills-bridge.md`
