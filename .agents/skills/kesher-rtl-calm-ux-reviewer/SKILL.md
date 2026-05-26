---
name: kesher-rtl-calm-ux-reviewer
description: "Use when reviewing or implementing Kesher Hebrew-first, RTL-safe, calm, mobile-first UI surfaces."
---

# Kesher RTL Calm UX Reviewer

## When To Use

Use for Daily, Explore, Skills, Chat, Safety, Trust Hub, Settings, onboarding, and profile UI work.

## When Not To Use

Do not use to justify marketing-style landing pages, pressure mechanics, or decorative UI that hides controls.

## Workflow

1. Read `AGENTS.md` and `skills/kesher-calm-ux/SKILL.md`.
2. Inspect the target React component and any shared layout/component it uses.
3. Check mobile density, text fit, RTL/Hebrew copy, visible safety controls, and calm pacing.
4. Run RTL and route smoke checks when UI surfaces change.

## Files To Inspect

- `src/components/layout/MainLayout.tsx`
- `src/features/discovery/*`
- `src/features/chat/*`
- `src/features/settings/*`
- `src/features/safety/*`
- `src/features/skills/*`

## Commands

- `npm run test:rtl`
- `npm run typecheck`
- `npm run build`

## Definition Of Done

The UI is calm, mobile-first, readable, non-overlapping, RTL-safe, and keeps report/block/consent controls visible.

## Safety Checks

No infinite-scroll pressure copy, no scarcity pressure, no public objectification, no hidden consent, no AI impersonation.

## References

- `skills/kesher-calm-ux/SKILL.md`
- `skills/kesher-consent-ux/SKILL.md`
- `skills/kesher-dark-pattern-audit/SKILL.md`
