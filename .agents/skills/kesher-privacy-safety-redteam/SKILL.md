---
name: kesher-privacy-safety-redteam
description: "Use when red-teaming Kesher privacy, trust, consent, moderation, message safety, photo analysis, personality visibility, or recommendation leakage."
---

# Kesher Privacy Safety Redteam

## When To Use

Use before finalizing changes that touch AI outputs, match explanations, chat drafting, image/photo handling, personality, private taste, safety reports, or admin moderation.

## When Not To Use

Do not use to make legal certification claims. This is an engineering red-team checklist, not legal advice.

## Workflow

1. Read `AGENTS.md`.
2. Inspect the affected UI, service, schema, validator, and server route.
3. Attempt leakage through raw answers, raw scores, private messages, hidden weights, exact location, protected traits, and attractiveness language.
4. Confirm consent defaults off and revocation/reset paths are visible.
5. Add negative tests for any newly touched boundary.

## Files To Inspect

- `src/ai/outputValidators.ts`
- `src/ai/policies.ts`
- `src/ai/featureRegistry.ts`
- `server/aiRoutes.ts`
- `src/features/skills/skillRegistry.ts`
- `src/features/chat/ChatThread.tsx`
- `src/features/match/*`
- `src/features/safety/*`
- `src/features/settings/*`

## Commands

- `npm test`
- `npm run scan:forbidden-fields`
- `npm run scan:logs`
- `npm run redteam:personality`

## Definition Of Done

No raw/private/sensitive data leaks through UI, prompts, logs, registry metadata, tests, or client bundles.

## Safety Checks

No public attractiveness scores, protected-trait inference, exact-address AI use, auto-sent AI messages, deterministic compatibility percentages, or internal moderation notes shown to members.

## References

- `skills/kesher-private-taste/SKILL.md`
- `skills/kesher-personality-visibility/SKILL.md`
- `skills/kesher-compatibility-reflection/SKILL.md`
- `skills/kesher-personality-why-match/SKILL.md`
