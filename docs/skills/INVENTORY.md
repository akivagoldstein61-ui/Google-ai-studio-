# Kesher Skills Hub Inventory

This document replaces the older PR-0 inventory snapshot. The source of truth now lives in code and operator docs:

- `src/features/skills/skillRegistry.ts` defines visible skills, member/reference classification, status, and data status.
- `src/features/skills/SkillsRouter.tsx` defines which skills have bespoke interactive pages.
- `src/product/completionPlan.ts` defines product-completion gates and remaining launch blockers.
- `docs/operator/skill-inventory.md` provides the current repo-local crosswalk.

## Current Personality Status

The member-facing personality path is live as Kesher Reflection:

| Surface | Current State |
|---|---|
| Assessment | `kesher-reflection-v1`, 20 Kesher-authored items |
| Scoring | `kesher-aspect-key-v1`, deterministic, no LLM scoring |
| Report | Private by default, generated only after completion |
| Visibility | Public, private, mutual-consent, and system-only boundaries are explicit |
| Export | Safe export excludes raw answers and hidden exact scores |
| Matching | No compatibility score, no public trait ranking, no hidden fit meter |
| Reset/delete | Cascades through personality report, share cards/grants, and provenance ledgers |

The old IPIP-BFAS implementation remains only as historical/research reference material where explicitly named as such. It is not the member-facing personality journey.

## Verification Expectations

Treat a personality change as complete only when the relevant evidence is current and direct:

- Unit tests cover scoring, privacy guards, exports, reset/delete behavior, schemas, and leakage prevention.
- The live app route `/prototype/personality` renders the Kesher Reflection journey, not IPIP-BFAS prototype copy.
- The production Vercel `/api/version` or `/__version` endpoint reports the expected `main` commit.
- Vercel runtime errors are checked after deployment.
- Documentation and generated static assets do not contradict the active Kesher Reflection contract.

## Historical Notes

The PR-0 inventory was useful for initial classification, but it is no longer canonical because it predated the live Kesher Reflection implementation and marked all visible skills as prototype status. Use Git history if that old snapshot is needed for audit context.
