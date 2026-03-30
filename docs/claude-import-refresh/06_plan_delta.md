# 06 — Plan Delta

> What changes from the current state to reach production.
> Organized by: what to change, what to create, what to delete, and the dependency chain.

---

## Architecture Changes Required

### A. Server-Side AI Proxy (CRITICAL)

**Current:** All Gemini calls happen in the browser via `new GoogleGenAI({ apiKey })`.
**Target:** Express API routes in `server.ts` handle all Gemini calls. Client calls `/api/ai/*`.

**What changes:**
- `vite.config.ts` — remove `process.env.GEMINI_API_KEY` from `define` block
- `server.ts` — add 10 API routes (see ownership model)
- `src/services/aiService.ts` — replace `getAI()` + direct Gemini calls with `fetch('/api/ai/*')`
- `src/services/aiSafetyService.ts` — same pattern
- `src/services/aiDatePlannerService.ts` — same pattern
- `src/ai/*` — untouched (these are prompt/schema/policy definitions, used by server routes)

**Dependency:** None. Can be done first.

### B. Type Consolidation (HIGH)

**Current:** `src/types.ts` and `src/types/index.ts` define conflicting shapes.
**Target:** Single canonical `src/types/index.ts`.

**What changes:**
- `src/types/index.ts` — add `uid: string` to Profile interface
- `src/types.ts` — delete entirely
- `src/context/AppContext.tsx` — update import from `'../types'` to `'../types/index'` (or just `'../types'` since index.ts is default)
- `src/App.tsx` — update import if needed
- Any other files importing from `'../types'` — verify they resolve to `types/index.ts`

**Dependency:** None. Can be done first.

### C. Duplicate Screen Cleanup (LOW)

**Current:** `features/settings/AIOpsScreen.tsx` (77 lines) duplicates `features/admin/AIOpsScreen.tsx` (133 lines). Same for ExperimentsScreen.
**Target:** Keep admin/ versions. Delete settings/ duplicates. Update imports in `App.tsx`.

**What changes:**
- Delete `src/features/settings/AIOpsScreen.tsx`
- Delete `src/features/settings/ExperimentsScreen.tsx`
- `src/App.tsx` — already imports from `features/admin/`, so no import change needed

**Dependency:** None.

### D. Branding Cleanup (LOW)

**Current:** `package.json` name = "react-example". `index.html` title = "My Google AI Studio App".
**Target:** "kesher" and "Kesher" respectively.

**What changes:**
- `package.json` — change `name` to `"kesher"`
- `index.html` — change `<title>` to `"Kesher"`

**Dependency:** None.

### E. Router Introduction (MEDIUM — needs approval)

**Current:** 8 `useState` booleans in `App.tsx` control navigation.
**Target:** URL-based routing with a router library.

**What changes:**
- Add router dependency (React Router v7 or TanStack Router — **approval needed**)
- Rewrite `App.tsx` to use route definitions instead of boolean state
- Each screen becomes a route with a path
- Deep linking and browser back button enabled

**Dependency:** Approval on library choice.

### F. Real Auth (HIGH — needs approval)

**Current:** Hardcoded user object on button click.
**Target:** Real Firebase Auth with phone verification at minimum.

**What changes:**
- `src/features/auth/WelcomeScreen.tsx` — wire to Firebase Auth `signInWithPhoneNumber`
- `src/features/onboarding/OnboardingFlow.tsx` — wire phone step to real verification
- `src/context/AppContext.tsx` — replace hardcoded user with `onAuthStateChanged` listener
- `server.ts` — add Firebase Admin SDK for token verification on API routes
- New dependency: `firebase-admin` (server-side)

**Dependency:** Server-side AI proxy (A) should land first so server auth pattern is established.

### G. Data Persistence (HIGH — needs approval)

**Current:** All data from `MOCK_PROFILES` in memory.
**Target:** Firestore reads/writes for users, matches, messages, likes.

**What changes:**
- `src/context/AppContext.tsx` — replace mock data with Firestore queries
- `src/firebase.ts` — may need additional Firestore imports (collection, query, where, etc.)
- `firestore.rules` — expand for new collections (reports, preferences, taste_profiles)
- `firebase-blueprint.json` — align enums with `types/index.ts`

**Dependency:** Auth (F) must land first — Firestore rules require `request.auth`.

---

## Files to Create

| File | Purpose | Slice |
|------|---------|-------|
| `CLAUDE.md` | Project memory for Claude Code | 1 |
| Server AI routes (in `server.ts` or `src/api/`) | Express routes for Gemini proxy | 2 |
| `src/middleware/auth.ts` (or in server.ts) | Firebase token verification middleware | 4 |
| Test files (`src/ai/__tests__/*`) | Unit tests for validators, router, types | 5 |
| `vitest.config.ts` | Test framework config | 5 |

## Files to Modify

| File | Change | Slice |
|------|--------|-------|
| `vite.config.ts` | Remove GEMINI_API_KEY from define | 1 |
| `index.html` | Title → "Kesher" | 1 |
| `package.json` | Name → "kesher" | 1 |
| `src/types/index.ts` | Add `uid: string` to Profile | 1 |
| `src/services/aiService.ts` | Replace direct Gemini calls with fetch to server | 2 |
| `src/services/aiSafetyService.ts` | Same | 2 |
| `src/services/aiDatePlannerService.ts` | Same | 2 |
| `server.ts` | Add AI proxy routes | 2 |
| `src/App.tsx` | Router integration | 3 |
| `src/context/AppContext.tsx` | Real auth + real data | 4 |

## Files to Delete

| File | Why | Slice |
|------|-----|-------|
| `src/types.ts` | Superseded by `src/types/index.ts` | 1 |
| `src/features/settings/AIOpsScreen.tsx` | Duplicate of `features/admin/AIOpsScreen.tsx` | 1 |
| `src/features/settings/ExperimentsScreen.tsx` | Duplicate of `features/admin/ExperimentsScreen.tsx` | 1 |

---

## Dependency Chain

```
Slice 1: Security + Cleanup ──────────────────── (no dependencies)
    │
    ▼
Slice 2: Server-Side AI Proxy ────────────────── (depends on Slice 1: key removed from client)
    │
    ▼
Slice 3: Router ──────────────────────────────── (independent, but easier after cleanup)
    │
    ▼
Slice 4: Real Auth ───────────────────────────── (depends on Slice 2: server auth pattern)
    │
    ▼
Slice 5: Test Foundation ─────────────────────── (independent, can run in parallel with 3-4)
    │
    ▼
[Future] Data Persistence ────────────────────── (depends on Slice 4: auth required for Firestore)
    │
    ▼
[Future] Real Matching ───────────────────────── (depends on data persistence)
    │
    ▼
[Future] i18n ────────────────────────────────── (independent, can run in parallel)
    │
    ▼
[Future] Premium ─────────────────────────────── (depends on auth + data + matching)
    │
    ▼
[Future] CI/CD ───────────────────────────────── (depends on tests existing)
    │
    ▼
[Future] Deployment ──────────────────────────── (depends on everything above)
```

---

## Risk Mitigations

| Risk | Mitigation |
|------|-----------|
| Removing Gemini key from client breaks all AI features | Slice 2 (server proxy) must land immediately after Slice 1 |
| Router migration touches every screen import | Use incremental migration — add router, move one screen at a time |
| Auth migration breaks development flow | Keep mock auth as fallback behind `VITE_USE_MOCK_AUTH=true` env var during development |
| Type consolidation breaks imports | Grep for all `from '../types'` and `from '../../types'` to verify resolution |
| Deleting duplicate screens breaks navigation | Verify `App.tsx` imports are from `features/admin/`, not `features/settings/` before deleting |
