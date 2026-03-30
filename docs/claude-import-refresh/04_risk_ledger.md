# 04 — Risk Ledger

> Top 10 highest-signal deltas between prototype state and production requirements.
> Ordered by severity (blocking → degrading → cosmetic).

---

## CRITICAL — Must fix before any deployment

### 1. GEMINI API KEY EXPOSED IN CLIENT BUNDLE

- **File**: `vite.config.ts:13-14`
- **Mechanism**: `'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY)` — Vite replaces this with the literal key string at build time
- **Impact**: Any user with DevTools can extract the key and make unlimited Gemini API calls billed to the project
- **Evidence**: Direct code read
- **Fix complexity**: Low — remove the `define` entry, add server-side proxy
- **Approval needed**: No — obvious security fix
- **Red line violated**: "client-side secrets"

### 2. ALL AI SERVICE CALLS ARE CLIENT-SIDE

- **Files**: `aiService.ts`, `aiSafetyService.ts`, `aiDatePlannerService.ts`
- **Mechanism**: `new GoogleGenAI({ apiKey })` instantiated in the browser for every call
- **Impact**: No rate limiting, no server-side audit trail, no abuse prevention, prompts manipulable via DevTools
- **Coupled to**: Risk #1 (key exposure)
- **Fix complexity**: Medium — requires adding Express API routes to `server.ts`
- **Approval needed**: Yes — API route design decision
- **Red line violated**: "client-side secrets", "uncontrolled production writes"

### 3. NO REAL AUTHENTICATION

- **File**: `App.tsx:35`
- **Mechanism**: `setUser({ id: 'me', displayName: 'Akiva', ... })` — hardcoded user object
- **Impact**: No identity verification, no access control, Firestore rules cannot function, any user is "Akiva"
- **Evidence**: Direct code read; Firebase Auth imported but `signInWith*` never called
- **Fix complexity**: Medium-High — requires full auth flow (phone/email + Firebase Auth)
- **Approval needed**: Yes — auth provider and flow design
- **Dependency**: Blocks all Firestore operations, matching, messaging, and trust features

### 4. NO DATA PERSISTENCE

- **Files**: `AppContext.tsx`, `data/mockProfiles.ts`
- **Mechanism**: All state in React useState, populated from 4 hardcoded mock profiles
- **Impact**: All data lost on refresh. No real users, matches, conversations, or preferences stored.
- **Evidence**: Zero Firestore read/write calls in entire codebase
- **Fix complexity**: High — requires full data access layer
- **Approval needed**: Yes — schema finalization
- **Dependency**: Blocked by auth (Risk #3)

---

## HIGH — Blocks core product functionality

### 5. NO MATCHING ALGORITHM

- **File**: `AppContext.tsx:103`
- **Mechanism**: `Math.random() > 0.5` determines if a like becomes a match
- **Impact**: No real recommendation quality. Daily Picks = hardcoded first 2 profiles. Explore = all profiles.
- **Fix complexity**: Medium — even a simple scoring function is infinitely better
- **Approval needed**: Yes — algorithm design (values-first vs balanced, weight system)
- **Product implication**: "finite-discovery-first" and "why-this-match" are impossible without real scoring

### 6. DUAL CONFLICTING TYPE SYSTEMS

- **Files**: `src/types.ts` vs `src/types/index.ts`
- **Mechanism**: Both define `Profile`, `Match`, `Conversation`, `Message`, `DiscoveryPreferences`, `TasteProfile`, `AnalyticsEvent` — with incompatible shapes
- **Impact**: Which file a component imports determines what shape it expects. Bugs will emerge as real data is wired.
- **Evidence**: See detailed conflict table in `02_ai_studio_export_map.md`
- **Fix complexity**: Low — delete `types.ts`, keep `types/index.ts` (strictly richer), update 2 import paths
- **Approval needed**: No — mechanical cleanup
- **Resolution**: `types/index.ts` is canonical (has HardFilter, SoftPreference, Report, DailyPick, MatchExplanation, VerificationLevel, PreferenceStrength — all missing from `types.ts`)

### 7. NO ROUTER — STATE-BASED NAVIGATION

- **File**: `App.tsx`
- **Mechanism**: 8 `useState` booleans control which screen renders. No URL routing, no deep linking, no back button.
- **Impact**: Cannot share links, cannot use browser history, cannot code-split by route, poor mobile UX
- **Fix complexity**: Medium — introduce React Router or TanStack Router
- **Approval needed**: Yes — router choice

---

## MEDIUM — Degrades quality or creates maintenance burden

### 8. NO INPUT SANITIZATION ON AI PROMPTS

- **Files**: `prompts.ts`, all service files
- **Mechanism**: User-provided text interpolated directly into prompt strings: `${params.bio_raw}`, `${params.message_text}`, etc.
- **Impact**: Prompt injection — user can manipulate AI behavior by crafting inputs that override system instructions
- **Fix complexity**: Low-Medium — add sanitization layer between user input and prompt templates
- **Approval needed**: No

### 9. NO TESTS

- **Evidence**: Zero test files. No test framework in dependencies. No `vitest`, `jest`, `@testing-library`.
- **Impact**: No regression protection. Cannot safely refactor. Cannot verify AI output validators work.
- **Fix complexity**: Medium — add Vitest, write tests for pure functions first (validators, router, types)
- **Approval needed**: No

### 10. DUPLICATE FILES AND STALE GENERATOR ARTIFACTS

- **Duplicate AIOps**: `features/admin/AIOpsScreen.tsx` (133 lines) vs `features/settings/AIOpsScreen.tsx` (77 lines)
- **Duplicate Experiments**: `features/admin/ExperimentsScreen.tsx` (154 lines) vs `features/settings/ExperimentsScreen.tsx` (70 lines)
- **Stale names**: package.json name="react-example", HTML title="My Google AI Studio App"
- **Impact**: Confusion about which file is authoritative, unprofessional branding artifacts
- **Fix complexity**: Very low
- **Approval needed**: No

---

## Summary Table

| # | Risk | Severity | Fix Complexity | Approval | Blocks |
|---|------|----------|---------------|----------|--------|
| 1 | API key in client bundle | CRITICAL | Low | No | Deployment |
| 2 | All AI calls client-side | CRITICAL | Medium | Yes | Deployment |
| 3 | No real auth | CRITICAL | Medium-High | Yes | Everything |
| 4 | No data persistence | CRITICAL | High | Yes | Everything |
| 5 | No matching algorithm | HIGH | Medium | Yes | Core product |
| 6 | Dual conflicting types | HIGH | Low | No | Development velocity |
| 7 | No router | HIGH | Medium | Yes | UX, deep linking |
| 8 | No prompt sanitization | MEDIUM | Low-Medium | No | AI safety |
| 9 | No tests | MEDIUM | Medium | No | Safe refactoring |
| 10 | Duplicate files / stale names | MEDIUM | Very Low | No | Clarity |

---

## What Is NOT At Risk (Strengths to Preserve)

These parts of the codebase are production-quality or close to it:
- `src/ai/featureRegistry.ts` — AI governance metadata
- `src/ai/policies.ts` — safety policies and system instructions
- `src/ai/schemas.ts` — structured output schemas
- `src/ai/prompts.ts` — prompt template library
- `src/ai/outputValidators.ts` — response validation
- `src/ai/capabilityRouter.ts` — feature-to-model routing
- `src/ai/modelRegistry.ts` — model string management
- `src/ai/featureFlags.ts` — feature toggle flags
- `src/ai/types.ts` — AI system type definitions
- `firestore.rules` — security rule structure
- `firebase-blueprint.json` — data model foundation
- `src/index.css` — design token system
- `src/components/ui/*` — basic UI components
- `src/types/index.ts` — rich domain types
- Product screen structure alignment with Kesher canon
