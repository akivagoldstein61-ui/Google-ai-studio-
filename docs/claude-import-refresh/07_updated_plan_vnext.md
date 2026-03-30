# 07 — Updated Kesher Plan vNext

> The complete updated Kesher build plan.
> Organized by layer: Foundation → Core → AI → Trust → Premium → Launch.
> Each section states: what exists, what's needed, what's blocked.

---

## Layer 0: Foundation

### 0.1 Security

| Item | Exists? | Status | Action |
|------|---------|--------|--------|
| Gemini API key off client | No — key in Vite define | CRITICAL | Remove from `vite.config.ts` |
| Server-side AI proxy | No — all calls client-side | CRITICAL | Add Express routes to `server.ts` |
| Firebase config handling | Yes — public keys in JSON (acceptable) | OK | No change |
| Input sanitization on AI prompts | No | MEDIUM | Add sanitization layer in prompt templates |
| react-markdown XSS protection | No explicit config | MEDIUM | Add rehype-sanitize or equivalent |

### 0.2 Type System

| Item | Exists? | Status | Action |
|------|---------|--------|--------|
| Domain types | Yes — `types/index.ts` (170 lines, rich) | GOOD | Keep as canonical |
| Conflicting types | Yes — `types.ts` (80 lines, simpler) | DEBT | Delete, update imports |
| AI types | Yes — `src/ai/types.ts` (60 lines) | GOOD | Keep |

### 0.3 Project Infrastructure

| Item | Exists? | Status | Action |
|------|---------|--------|--------|
| CLAUDE.md | No | MISSING | Create with project context |
| Tests | No — zero test files, no framework | MISSING | Add Vitest |
| CI/CD | No — no GitHub Actions | MISSING | Build after tests exist |
| Linting | TypeScript `--noEmit` only | PARTIAL | Sufficient for now |
| Package identity | "react-example" | DEBT | Rename to "kesher" |
| HTML title | "My Google AI Studio App" | DEBT | Rename to "Kesher" |

---

## Layer 1: Core App Shell

### 1.1 Routing

| Item | Exists? | Status | Action |
|------|---------|--------|--------|
| Navigation | Yes — useState booleans in App.tsx | DEMO-ONLY | Replace with router library |
| Deep linking | No | MISSING | Enabled by router |
| Code splitting | No | MISSING | Enabled by router |
| Back button support | No | MISSING | Enabled by router |

**Approval needed:** Router library choice (React Router v7 vs TanStack Router).

### 1.2 State Management

| Item | Exists? | Status | Action |
|------|---------|--------|--------|
| App state | Single React Context | DEMO-ONLY | Split: auth state, UI state, server data |
| Data source | Mock profiles in memory | DEMO-ONLY | Replace with Firestore queries |
| Persistence | None — refresh = data loss | MISSING | Firestore for durable state |
| Language toggle | useState('en' \| 'he') | PARTIAL | Wire to i18n framework |

### 1.3 Auth

| Item | Exists? | Status | Action |
|------|---------|--------|--------|
| Firebase Auth init | Yes — `getAuth()` called | UNUSED | Wire to real sign-in |
| Sign-in flow | No — hardcoded user | MISSING | Firebase phone auth (at minimum) |
| Auth state listener | No | MISSING | `onAuthStateChanged` in AppContext |
| Server-side token verification | No | MISSING | Firebase Admin SDK in server.ts |
| Age verification | UI button, does nothing | DEMO-ONLY | Wire to real verification |

**Approval needed:** Auth provider(s) — phone, email, Google OAuth, combination.

---

## Layer 2: Core Product Features

### 2.1 Onboarding

| Item | Exists? | Status | Action |
|------|---------|--------|--------|
| 5-step flow UI | Yes — terms, phone, intent, observance, profile | GOOD STRUCTURE | Wire to real auth + Firestore |
| Terms acceptance | UI present | DEMO-ONLY | Persist acceptance to Firestore |
| Phone verification | UI present (code input) | DEMO-ONLY | Wire to Firebase phone auth |
| Intent selection | UI + type taxonomy | GOOD | Wire to Firestore profile creation |
| Observance selection | UI + type taxonomy | GOOD | Wire to Firestore |
| Profile builder | UI + AI coaching | GOOD | Wire AI to server, photos to Storage |

### 2.2 Discovery — Daily Picks

| Item | Exists? | Status | Action |
|------|---------|--------|--------|
| Screen UI | Yes — premium aesthetic | GOOD | Keep |
| AI-generated intro | Yes — bilingual Gemini call | GOOD (move server-side) | Extract to server route |
| Pick selection | Hardcoded first 2 mock profiles | DEMO-ONLY | Replace with scoring algorithm |
| Finite feed | Canon requirement | NOT ENFORCED | Backend must limit daily count |
| Like / Pass | UI present, mock logic | DEMO-ONLY | Wire to Firestore likes collection |

**Approval needed:** Matching/scoring algorithm design.

### 2.3 Discovery — Explore

| Item | Exists? | Status | Action |
|------|---------|--------|--------|
| Screen UI | Yes — grid/list toggle | GOOD | Keep |
| Hard Filters | UI + `HardFilter` type with poolImpact | GOOD | Wire to Firestore queries |
| Soft Preferences | UI + `SoftPreference` type with strength | GOOD | Wire to scoring layer |
| Saved Presets | UI present | DEMO-ONLY | Wire to Firestore preferences |
| Profile cards | ProfileCard component with badges | GOOD | Keep |

### 2.4 Profile Detail

| Item | Exists? | Status | Action |
|------|---------|--------|--------|
| Full profile view | Yes — photos, bio, prompts, tags | GOOD | Keep |
| Why This Match | AI-generated via WhyMatchSchema | GOOD (move server-side) | Extract to server route |
| AI Openers | AI-generated conversation starters | GOOD (move server-side) | Extract to server route |
| More/Less Like This | Feedback → taste profile update | GOOD (move server-side) | Extract to server route |

### 2.5 Messaging

| Item | Exists? | Status | Action |
|------|---------|--------|--------|
| Chat thread UI | Yes — richest screen (352 lines) | GOOD | Keep |
| Message sending | In-memory array push | DEMO-ONLY | Wire to Firestore messages subcollection |
| Safety scan | Real Gemini call before display | GOOD (move server-side) | Extract |
| Rephrase message | Real Gemini call | GOOD (move server-side) | Extract |
| Date planner | Real Gemini call with Search grounding | GOOD (move server-side) | Extract |
| Visual icebreaker | Real Gemini image gen call | GOOD (move server-side, LABS flag) | Extract |
| AI disclosure label | `aiAssisted` flag on messages | GOOD | Keep — canon-aligned |

### 2.6 Matching

| Item | Exists? | Status | Action |
|------|---------|--------|--------|
| Like mechanics | `likeProfile()` in AppContext | DEMO-ONLY | Wire to Firestore likes + server-side match check |
| Match determination | `Math.random() > 0.5` | DEMO-ONLY | Server-side mutual-like check |
| Match celebration | MatchSheet overlay | GOOD | Keep |
| Why-this-match on match | Present in Match type | GOOD | Wire to AI explanation |

---

## Layer 3: AI System

### 3.1 AI Governance (PRODUCTION-QUALITY — preserve entirely)

| Item | File | Status |
|------|------|--------|
| Feature registry (12 features) | `src/ai/featureRegistry.ts` | **KEEP** |
| Safety policies (STRICT_DATING) | `src/ai/policies.ts` | **KEEP** |
| System instructions (6 features) | `src/ai/policies.ts` | **KEEP** |
| Prompt templates (10 templates) | `src/ai/prompts.ts` | **KEEP** |
| Structured output schemas (7) | `src/ai/schemas.ts` | **KEEP** |
| Output validators (6) | `src/ai/outputValidators.ts` | **KEEP** |
| Capability router | `src/ai/capabilityRouter.ts` | **KEEP** |
| Model registry (6 routes) | `src/ai/modelRegistry.ts` | **KEEP** |
| Feature flags | `src/ai/featureFlags.ts` | **KEEP** |
| AI type definitions | `src/ai/types.ts` | **KEEP** |

### 3.2 AI Transport (MUST REWRITE)

| Current | Target |
|---------|--------|
| `new GoogleGenAI({ apiKey })` in browser | Express routes calling `@google/genai` server-side |
| API key in Vite define → client bundle | API key in `.env` → server-only `process.env` |
| No rate limiting | Server-side rate limiting per user |
| No audit trail | Server-side logging |
| Prompts manipulable via DevTools | Prompts constructed server-side only |

### 3.3 AI Features by Status

| Feature | Canon Alignment | Server Migration | Priority |
|---------|----------------|-----------------|----------|
| Bio Coach | Aligned — assistive, human-confirmed | Required | HIGH |
| Taste Profile | Aligned — private, never public | Required (privacy-critical) | HIGH |
| Why This Match | Aligned — explainability, no hidden signals | Required | HIGH |
| Safety Scan | Aligned — trust surface | Required (security-critical) | CRITICAL |
| Date Planner | Aligned — safe venues, Maps grounding | Required | MEDIUM |
| Safety Advice | Aligned — Search grounding for safety info | Required | MEDIUM |
| Rephrase Message | Aligned — assistive, human-confirmed | Required | MEDIUM |
| Generate Openers | Aligned — assistive, human-confirmed | Required | MEDIUM |
| Profile Completeness | Aligned — coaching, not scoring | Required | MEDIUM |
| Daily Picks Intro | Aligned — calm, finite framing | Required | LOW |
| Visual Icebreaker | Aligned — labs flag, creative | Required | LOW (LABS) |
| Voice Reflection | Not implemented | N/A | DEFER |
| Mod Summarizer | Not wired | N/A | DEFER (internal) |

---

## Layer 4: Trust & Safety

### 4.1 Trust Surfaces

| Item | Exists? | Status | Action |
|------|---------|--------|--------|
| Safety Center | UI with report flow, emergency contacts, AI FAQ | GOOD | Wire to backend |
| AI Trust Hub | Feature toggles, philosophy, data/privacy, red lines | EXCELLENT | Keep — wire toggles to real flags |
| Verification badges | UI rendering based on `isVerified` / `verificationLevel` | GOOD | Wire to real verification state |
| Report flow | Modal with reason selection | GOOD | Wire to Firestore reports collection |
| Block user | Referenced in types, not implemented | MISSING | Build: Firestore block list + feed filtering |
| Delete account | Button exists, does nothing | MISSING | Build: cascade delete (user, matches, messages, likes) |

### 4.2 Content Safety

| Item | Exists? | Status | Action |
|------|---------|--------|--------|
| Message safety scan | Real Gemini call with SafetyScanSchema | GOOD (move server-side) | Extract |
| Safety thresholds | STRICT_DATING: block low and above for all categories | GOOD | Keep |
| Internal ops thresholds | BLOCK_NONE for content analysis | GOOD | Keep (internal only) |
| Photo moderation | Not implemented | MISSING | DEFER — complex, needs separate service |

### 4.3 Canon Red Line Compliance

| Red Line | Current State | Compliant? |
|----------|--------------|-----------|
| No public attractiveness scores | Not present in code | YES |
| No hot-or-not mechanics | Not present | YES |
| No anonymous random chat | Not present | YES |
| No hookup-first framing | Intent taxonomy is serious | YES |
| No AI pretending to be user | System instructions forbid it | YES |
| No AI auto-sending messages | `NO_AUTO_SEND: true` in policies | YES |
| No protected-trait inference from photos | `NO_PHOTO_INFERENCE: true` | YES |
| No hidden ranking manipulation | No ranking algorithm exists yet | YES (vacuously) |
| No client-side secrets | **VIOLATED** — Gemini key in bundle | **NO** — Slice 1 fixes |
| No match-to-message paywalls | No premium logic yet | YES (vacuously) |
| No delete-account mazes | Button exists but does nothing | **PARTIAL** — needs implementation |

---

## Layer 5: Premium (DEFERRED)

| Item | Exists? | Status | Action |
|------|---------|--------|--------|
| Premium flag | `isPremium` boolean | PLACEHOLDER | Needs tier definition |
| Premium UI | Badge rendering, settings mention | MINIMAL | Needs premium feature surfaces |
| Payment flow | None | MISSING | Needs App Store integration |
| Free path definition | Not defined | MISSING | Needs product decision |
| Premium features | Not defined | MISSING | Needs product decision |

**Blocked by:** Product decisions on what's free vs paid. Canon constraint: never paywall match replies.

---

## Layer 6: Launch Readiness (DEFERRED)

| Item | Exists? | Status | Action |
|------|---------|--------|--------|
| i18n framework | None | MISSING | Needs library choice |
| Hebrew translations | None | MISSING | Blocked by i18n framework |
| RTL layout support | Font-family stub only | MINIMAL | Needs full RTL CSS |
| App Store compliance | Not assessed | UNKNOWN | Needs review against guidelines |
| Privacy policy | None | MISSING | Needs legal |
| Terms of service | None | MISSING | Needs legal |
| Analytics | Console.log stub | DEMO-ONLY | Needs provider choice |
| CI/CD | None | MISSING | Needs pipeline design |
| Deployment | AI Studio Cloud Run only | MANAGED | Needs standalone config |

---

## Open Questions (must resolve before respective layers)

| # | Question | Blocks |
|---|----------|--------|
| Q1 | Auth provider(s): phone, email, Google OAuth? | Layer 1 (Auth) |
| Q2 | Router library: React Router v7 or TanStack Router? | Layer 1 (Routing) |
| Q3 | Matching algorithm: deterministic scoring, Gemini-assisted, or hybrid? | Layer 2 (Matching) |
| Q4 | Premium tier: what's free, what's paid? | Layer 5 |
| Q5 | i18n library: react-i18next, custom, other? | Layer 6 |
| Q6 | Analytics provider: Firebase Analytics, Mixpanel, PostHog? | Layer 6 |
| Q7 | Deployment platform: Vercel, Cloud Run standalone, other? | Layer 6 |
| Q8 | Supabase migration: stay on Firebase or migrate? | Architectural |
