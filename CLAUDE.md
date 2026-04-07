# Kesher — Project Memory

> Hebrew-first Jewish dating app for Israel.
> Trust-forward. Assistive AI only. Server-side secrets only.

---

## 1. Project Identity

- **Name**: Kesher (קשר — "connection")
- **Stack**: React 19 + Vite 6 + Tailwind CSS v4 + Express + Firebase + @google/genai SDK
- **Language**: TypeScript with `moduleResolution: "bundler"`, `@/*` path aliases
- **Server**: `tsx server.ts` — Express serves Vite in dev, API routes at `/api/ai/*`
- **Product thesis**: Finite-discovery, values-first, anti-casino dating. Hebrew-first with English support.

---

## 2. Current Architecture

```
server.ts                    → Express entry point
server/aiRoutes.ts           → 11 POST routes proxying Gemini (server-side only)
src/
  ai/                        → Canonical AI layer (DO NOT MOVE)
    featureRegistry.ts       → 12 AI features with metadata, risk, consent, routing
    policies.ts              → STRICT_DATING safety settings, system instructions
    schemas.ts               → 7 Gemini structured output schemas
    prompts.ts               → 10 parameterized prompt templates
    outputValidators.ts      → 6 runtime validators
    capabilityRouter.ts      → feature → model routing
    modelRegistry.ts         → 6 model routes (gemini-3.1-pro, gemini-2.5-flash, etc.)
    featureFlags.ts          → boolean flags per feature
    types.ts                 → AIFeatureMetadata, AIResponse, AICitation
  services/
    aiService.ts             → fetch-based proxy client (calls /api/ai/*)
    aiSafetyService.ts       → safety-scan + safety-advice proxy client
    aiDatePlannerService.ts  → date-planner proxy client
  types/index.ts             → Canonical domain types (Profile, Match, Conversation, etc.)
  features/                  → Screen components by domain
  context/AppContext.tsx      → App state (mock data, in-memory)
  components/                → Shared UI components
  data/mockProfiles.ts       → 4 hardcoded test profiles
```

---

## 3. Canonical Source-of-Truth Order

1. **This repo** (GitHub) — all code, docs, and config
2. `src/ai/*` — AI feature definitions, policies, schemas, prompts
3. `src/types/index.ts` — domain type definitions
4. `docs/claude-import-refresh/00-08` — planning artifacts (audit, plan, slices)
5. Root PDFs — product requirements, strategic review, AI master plan, architecture

---

## 4. AI System Rules

- **Server-side only**: All Gemini calls go through `server/aiRoutes.ts`. No API keys in client bundle.
- **Feature allowlist**: Only features in `AI_FEATURE_REGISTRY` can be called. Server validates feature ID.
- **Structured output**: Gemini responses validated by `outputValidators.ts` before returning to client.
- **Model routing**: `capabilityRouter.ts` maps each feature to its assigned model via `modelRegistry.ts`.
- **Safety settings**: `STRICT_DATING` thresholds in `policies.ts` applied to all Gemini calls.
- **No AI impersonation**: AI never auto-sends messages. User must explicitly send. Drafts are drafts.
- **No photo inference**: No attractiveness scoring, no race/ethnicity/religion prediction from images.
- **Data minimization**: Each feature declares `data_inputs` and `excluded_data` in the registry.

---

## 5. Product Red Lines

These are non-negotiable. Do not implement or enable:

- Client-side API keys or secrets
- Public attractiveness scores or hot-or-not mechanics
- AI auto-sending messages on behalf of users
- Protected-trait inference from photos (race, ethnicity, religion)
- Match-to-message paywall (free users must be able to message mutual matches)
- Safety feature paywalls
- Delete-account maze (must be easy to find and use)
- Hidden ranking manipulation or opaque filter overrides
- Infinite compulsive swipe mechanics (discovery must feel finite)
- Direct production writes from agentic tools without human approval

---

## 6. Approval Gates

| Change Type | Approval Needed? |
|-------------|-----------------|
| Security fix (key removal, sanitization) | No |
| Test additions | No |
| Docs/CLAUDE.md updates | No |
| Router introduction | **Yes** — library choice |
| Real Firebase Auth | **Yes** — provider + flow design |
| Firestore schema/persistence | **Yes** — schema finalization |
| Matching algorithm | **Yes** — scoring design |
| i18n wiring | **Yes** — framework + string extraction |
| CI/CD pipeline | **Yes** — provider + config |
| Premium/monetization features | **Yes** — pricing model |
| Any change to `src/ai/policies.ts` safety thresholds | **Yes** — trust review |

---

## 7. Safe Implementation Order

Dependency chain for remaining work (completed items struck through):

1. ~~Security fix — remove client-side API key~~ (DONE)
2. ~~Server-side AI proxy — 11 routes in `server/aiRoutes.ts`~~ (DONE)
3. ~~Type consolidation + cleanup — single `types/index.ts`, remove duplicates~~ (DONE)
4. ~~Test foundation — Vitest + AI layer unit tests~~ (DONE)
5. ~~CLAUDE.md — project memory file~~ (DONE — this file)
6. ~~Prompt input sanitization — prevent injection in AI prompts~~ (DONE)
7. Router introduction — replace useState navigation (approval needed)
8. Real Firebase Auth — phone/email sign-in (approval needed, blocks 9-10)
9. Firestore persistence — replace mock data (approval needed, blocked by 8)
10. Real matching algorithm — replace Math.random() (approval needed, blocked by 9)

---

## 8. Completed Slices

| Slice | Commit | What |
|-------|--------|------|
| Slice 1+2 | `186d012` | Removed client-side API key, added 11 server-side AI proxy routes, rewrote all service files to use fetch |
| Slice 3 | `670ea1a` | Consolidated types, deleted duplicate screens, fixed branding |
| Test foundation | `2d7f0c9` | Added Vitest with 39 unit tests for outputValidators + capabilityRouter |
| CLAUDE.md | `46b312c` | Project memory file with architecture, red lines, dev conventions |
| Prompt sanitization | *this commit* | Added `promptSanitizer.ts` with length-bounding, control-char stripping, role-marker neutralization; applied to all prompt templates |
| Planning docs | `5a6ced4`, `e943cad` | Full audit + plan artifacts in `docs/claude-import-refresh/` |

---

## 9. Single Safest Next Slices

**Needs approval:**
- Router introduction (React Router v7 is already installed as a dependency)
- Real Firebase Auth — phone/email sign-in
- Firestore persistence — replace mock data

---

## 10. Commands to Run Before Commit

```bash
npx vitest run          # 74 tests must pass
npx tsc --noEmit        # 0 type errors
npx vite build          # must succeed
```

All three must pass before any commit is pushed.
