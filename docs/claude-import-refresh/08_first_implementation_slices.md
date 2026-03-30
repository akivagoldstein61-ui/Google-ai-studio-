# 08 — First 5 Implementation Slices

> Dependency-ordered implementation proposals.
> Each slice is designed for a single PR-shaped diff.
> **None of these are approved yet.** This is a proposal.

---

## Slice 1: Security Fix + Project Cleanup

**Approval needed:** No — all changes are obvious fixes with no product decisions.

### Scope
1. Remove `GEMINI_API_KEY` from Vite `define` block in `vite.config.ts`
2. Create `CLAUDE.md` with project context and operating rules
3. Fix `index.html` title: "My Google AI Studio App" → "Kesher"
4. Fix `package.json` name: "react-example" → "kesher"
5. Delete `src/types.ts` (superseded by `src/types/index.ts`)
6. Add `uid: string` to Profile in `src/types/index.ts`
7. Delete `src/features/settings/AIOpsScreen.tsx` (duplicate)
8. Delete `src/features/settings/ExperimentsScreen.tsx` (duplicate)
9. Update any broken imports after deletions

### Files Modified
- `vite.config.ts` (remove 1 line from define)
- `index.html` (change title)
- `package.json` (change name)
- `src/types/index.ts` (add uid field)

### Files Created
- `CLAUDE.md`

### Files Deleted
- `src/types.ts`
- `src/features/settings/AIOpsScreen.tsx`
- `src/features/settings/ExperimentsScreen.tsx`

### Pre-flight Checks
- Verify `App.tsx` imports AIOpsScreen from `features/admin/`, not `features/settings/`
- Verify `App.tsx` imports ExperimentsScreen from `features/admin/`, not `features/settings/`
- Grep all imports of `'../types'` and `'../../types'` to verify they resolve to `types/index.ts`
- Verify no other file imports the deleted settings screens

### Rollback
`git revert <commit>` — single commit, clean revert.

### Risk
LOW. No product logic changes. No auth changes. No data changes.

### What This Unblocks
- Slice 2 (Gemini key is now server-only, client calls must go through proxy)

### What Breaks
- **All AI features stop working in the browser** after this slice lands, because the API key is removed from the client bundle. Slice 2 must follow immediately.
- Mitigation: land Slices 1 and 2 together, or add a temporary `TODO: wire to server` comment in service files.

---

## Slice 2: Server-Side AI Proxy

**Approval needed:** Yes — API route design and auth middleware pattern.

### Scope
1. Add Express middleware for Firebase Auth token verification (or skip auth check for now with TODO)
2. Add 10 API routes to `server.ts`:
   - `POST /api/ai/bio-coach`
   - `POST /api/ai/taste-profile`
   - `POST /api/ai/why-match`
   - `POST /api/ai/safety-scan`
   - `POST /api/ai/date-planner`
   - `POST /api/ai/safety-advice`
   - `POST /api/ai/rephrase`
   - `POST /api/ai/openers`
   - `POST /api/ai/profile-completeness`
   - `POST /api/ai/daily-picks-intro`
3. Each route imports from `src/ai/` (prompts, schemas, policies, validators) and calls Gemini server-side
4. Rewrite `src/services/aiService.ts` to call `fetch('/api/ai/*')` instead of `new GoogleGenAI()`
5. Rewrite `src/services/aiSafetyService.ts` same pattern
6. Rewrite `src/services/aiDatePlannerService.ts` same pattern
7. Remove `getAI()` export from `aiService.ts`

### Files Modified
- `server.ts` (expand from ~40 lines to ~200+ lines)
- `src/services/aiService.ts` (replace Gemini SDK calls with fetch)
- `src/services/aiSafetyService.ts` (same)
- `src/services/aiDatePlannerService.ts` (same)

### Files Created
- None (routes go in server.ts; can refactor to separate files later)

### Dependencies
- Slice 1 must land first (API key removed from client)

### Approval Questions
1. Should routes require Firebase Auth tokens now, or add auth later (Slice 4)?
2. Should routes go directly in `server.ts` or in a separate `src/api/` directory?

### Rollback
`git revert <commit>` — single commit.

### Risk
MEDIUM. Changes AI transport for all features. Must test each AI feature after migration.

---

## Slice 3: Router Introduction

**Approval needed:** Yes — library choice.

### Scope
1. Add router dependency
2. Define route table:
   - `/` → redirect to `/daily` or `/welcome`
   - `/welcome` → WelcomeScreen
   - `/onboarding` → OnboardingFlow
   - `/daily` → DailyPicksScreen
   - `/explore` → ExploreScreen
   - `/inbox` → InboxScreen
   - `/inbox/:conversationId` → ChatThread
   - `/profile/:profileId` → ProfileDetail
   - `/settings` → SettingsScreen
   - `/settings/safety` → SafetyCenter
   - `/settings/ai-trust` → AITrustHub
   - `/settings/taste-profile` → PrivateTasteProfile
   - `/admin/ai-ops` → AIOpsScreen
   - `/admin/experiments` → ExperimentsScreen
3. Rewrite `App.tsx` to use router instead of useState booleans
4. Remove 8 useState navigation variables
5. Update screen components to use router navigation (e.g., `navigate('/inbox')` instead of `setActiveTab('matches')`)

### Files Modified
- `App.tsx` (major rewrite — routing logic)
- `src/components/layout/MainLayout.tsx` (tab nav → router links)
- Multiple screen files (navigation callbacks → router navigation)

### Dependencies
- Slice 1 (cleanup) recommended first for cleaner diff

### Approval Questions
1. React Router v7 or TanStack Router?
2. Should auth guard be a route wrapper or middleware?

### Rollback
`git revert <commit>`.

### Risk
MEDIUM-HIGH. Touches navigation across all screens. Must verify every navigation path works.

---

## Slice 4: Real Firebase Auth

**Approval needed:** Yes — auth provider choice and flow design.

### Scope
1. Wire `WelcomeScreen` to Firebase Auth `signInWithPhoneNumber` (or chosen method)
2. Wire `OnboardingFlow` phone step to real SMS verification
3. Replace hardcoded user in `AppContext` with `onAuthStateChanged` listener
4. Add Firebase Admin SDK to server for token verification
5. Add auth middleware to server API routes (from Slice 2)
6. Create Firestore user document on first sign-in

### Files Modified
- `src/features/auth/WelcomeScreen.tsx`
- `src/features/onboarding/OnboardingFlow.tsx`
- `src/context/AppContext.tsx`
- `server.ts` (add auth middleware)
- `package.json` (add firebase-admin dependency)

### Dependencies
- Slice 2 (server routes exist to add auth middleware to)

### Approval Questions
1. Firebase phone auth, email+password, Google OAuth, or all?
2. Is phone verification required at sign-up or deferrable?
3. Should Firebase Admin SDK be a direct dependency or a separate backend service?

### Rollback
`git revert <commit>`.

### Risk
HIGH. Changes the fundamental identity model. Must test full auth flow: sign-up, sign-in, sign-out, token refresh.

---

## Slice 5: Test Foundation

**Approval needed:** No — pure additive, no product changes.

### Scope
1. Add Vitest + @testing-library/react as dev dependencies
2. Create `vitest.config.ts`
3. Write unit tests for pure functions:
   - `src/ai/outputValidators.ts` — test all 6 validators with valid and invalid inputs
   - `src/ai/capabilityRouter.ts` — test all feature→model routes
   - `src/types/index.ts` — type guard tests if applicable
4. Add `test` script to `package.json`

### Files Created
- `vitest.config.ts`
- `src/ai/__tests__/outputValidators.test.ts`
- `src/ai/__tests__/capabilityRouter.test.ts`

### Files Modified
- `package.json` (add devDependencies + test script)

### Dependencies
- None. Can run in parallel with Slices 2-4.

### Rollback
Delete test files and dependencies.

### Risk
VERY LOW. New files only. No existing code modified (except package.json devDependencies).

---

## Approval Gate Summary

| Slice | Approval Needed? | Key Decision |
|-------|-----------------|--------------|
| 1. Security + Cleanup | **No** | Obvious fixes |
| 2. Server AI Proxy | **Yes** | Route design, auth middleware timing |
| 3. Router | **Yes** | Library choice |
| 4. Real Auth | **Yes** | Provider choice, flow design |
| 5. Test Foundation | **No** | Additive only |

---

## Recommended Execution Order

**Option A (strictly sequential):**
```
1 → 2 → 3 → 4 → 5
```

**Option B (parallel where safe):**
```
1 → 2 ────→ 3 → 4
         └──→ 5 (parallel)
```

**Option C (fastest safe path — Slices 1+5 need no approval):**
```
Start immediately: 1 + 5 (in parallel)
After approval: 2 → 3 → 4
```

**Recommendation:** Option C. Ship Slices 1 and 5 now (no approval needed), then get approval for Slices 2-4.

**However:** Slice 1 removes the API key from the client, breaking all AI features. If the app needs to remain demo-functional while waiting for Slice 2 approval, consider shipping Slices 1+2 as a single atomic change.
