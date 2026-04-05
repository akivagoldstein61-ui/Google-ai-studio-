# 02 — AI Studio Export Map

> This repo IS the Google AI Studio export.
> This document assesses it specifically through the AI Studio prototype lens.

---

## Export Origin

- **AI Studio App ID**: `bd65b2e7-1010-405f-8e3a-13786c313892`
- **Firebase Project**: `gen-lang-client-0904321862`
- **Firestore DB**: `ai-studio-bd65b2e7-1010-405f-8e3a-13786c313892`
- **Hosting**: AI Studio managed Cloud Run (not deployed standalone)
- **README**: Boilerplate AI Studio export readme

---

## AI Studio Generated Shell

### What AI Studio provided (standard template):
- `vite.config.ts` with Gemini key injection pattern
- `server.ts` Express wrapper
- `index.html` with generic title
- `package.json` with `@google/genai` dependency
- `firebase-applet-config.json` auto-provisioned
- `.env.example` with `GEMINI_API_KEY` and `APP_URL`
- `metadata.json` (app name + permissions)

### What was built ON TOP of the AI Studio template:
- Full `src/ai/` layer (9 files) — feature registry, policies, prompts, schemas, validators
- Full `src/services/` layer (6 files) — Gemini service calls
- Full `src/features/` layer (15 screen files) — complete dating app UI
- Full `src/components/` layer (7 files) — reusable UI components
- `src/types/index.ts` — rich domain type system
- `firestore.rules` — real security rules
- `firebase-blueprint.json` — data model
- Design system tokens in `index.css`

---

## Gemini Integration Pattern

### Client Architecture (UNSAFE for production)

```
Browser → aiService.ts → new GoogleGenAI({ apiKey }) → Gemini API
                                    ↑
                          API key baked into JS bundle
                          via vite.config.ts define()
```

### Key Injection Mechanism
```typescript
// vite.config.ts line 13-14
define: {
  'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY),
},
```
Vite replaces `process.env.GEMINI_API_KEY` with the literal string at build time. This is the standard AI Studio pattern but **must not ship to production**.

### AI SDK Usage
- SDK: `@google/genai` v1.46.0 (Google GenAI JavaScript SDK)
- Client instantiation: `new GoogleGenAI({ apiKey })` per-call via `getAI()` factory
- No connection pooling, no retry logic, no timeout configuration

### Model Strings Used
| Route | Model String | Purpose |
|-------|-------------|---------|
| primaryReasoningModel | `gemini-3.1-pro-preview` | Default |
| primaryStructuredModel | `gemini-3.1-pro-preview` | Most features (bio, taste, match, safety, openers, completeness) |
| primarySearchGroundedModel | `gemini-3.1-pro-preview` | Safety advice with Google Search |
| mapsGroundedModel | `gemini-2.5-flash` | Date planner (Maps grounding only in 2.5) |
| imageGenerationModel | `gemini-3.1-flash-image-preview` | Visual icebreaker |
| liveModel | `gemini-2.5-flash-native-audio-preview-12-2025` | Voice reflection (not implemented) |

### Structured Output Usage
All structured calls use `responseMimeType: "application/json"` + `responseSchema`:
- BioCoachSchema → 3 Hebrew bio drafts with hooks
- TasteProfileSchema → dealbreakers, preferences, weights, explanation
- WhyMatchSchema → 2-3 reasons + first question + gentle clarification
- SafetyScanSchema → risk_level, categories, recommended_action
- DateIdeasSchema → venues with safety notes
- ProfileCompletenessSchema → score, missing areas, strengths, tip
- DailyPicksIntroSchema → bilingual headline + body

### Tool Usage
- `googleSearch: {}` used in: date planner, safety advice
- Maps grounding: documented as needed but simulated via Search (SDK limitation noted)
- No function calling beyond built-in tools
- No file/image input analysis (placeholder for photo analysis)

---

## What the AI Studio Export Gets RIGHT

### 1. AI Feature Registry (PRODUCTION QUALITY)
`featureRegistry.ts` contains full metadata for 12 features:
- risk level per feature
- data inputs and excluded data lists
- consent requirements
- human confirmation flags
- audience targeting (user/premium/internal/lab)
- model routing
- capability exceptions with reasons
- structured output and tool flags

This is **better than most production apps** in terms of AI governance metadata.

### 2. Safety Policies (PRODUCTION QUALITY)
`policies.ts` defines:
- Per-context safety thresholds (STRICT_DATING vs INTERNAL_OPS)
- Data minimization rules
- No-photo-inference rule
- No-attractiveness-scoring rule
- Private-taste-only rule
- No-auto-send rule
- User-remains-sender rule
- Explicit-labels-required rule

All aligned with Kesher red lines.

### 3. System Instructions (HIGH QUALITY)
6 system instructions defined for: BIO_COACH, WHY_MATCH, SAFETY_SCAN, DATE_PLANNER, PROFILE_COMPLETENESS, TASTE_PROFILE.

Each includes:
- Role definition
- MUST rules (behavioral constraints)
- Forbidden actions
- Tone guidance

### 4. Prompt Templates (GOOD QUALITY)
10 parameterized templates. Clean separation of template from data. Type-safe parameters.

### 5. Output Validators (USEFUL)
Runtime validation for 6 AI response types. Simple but catches structural failures.

### 6. UI Design Language (GOOD)
- Custom CSS tokens: surface-base, surface-raised, text-primary, accent-romantic, etc.
- Safe-area support for mobile
- RTL stub present (`[dir="rtl"]` font-family rule)
- Animation via Motion library
- Clean component patterns (Badge, Button, Input)

### 7. Product Structure (ALIGNED)
Screen structure matches Kesher product truth:
- Daily Picks (finite, curated)
- Explore (filterable, not infinite scroll)
- Inbox (matches, not random chat)
- Profile/Settings
- Safety Center
- AI Trust Hub (transparency)
- Private Taste Profile (user control)

---

## What the AI Studio Export Gets WRONG

### 1. CRITICAL: API Key in Client Bundle
The Gemini API key is embedded in the JavaScript bundle. Any user with browser DevTools can extract it and make unlimited API calls billed to the project.

### 2. CRITICAL: All AI Calls Client-Side
Every `aiService` call instantiates `GoogleGenAI` in the browser. This means:
- API key exposed
- No rate limiting
- No server-side logging/auditing
- No abuse prevention
- User can manipulate prompts via DevTools

### 3. CRITICAL: No Real Auth
`setUser({ id: 'me', displayName: 'Akiva', ... })` — hardcoded. No Firebase Auth sign-in flow.

### 4. HIGH: No Data Persistence
All state in React context. Refresh = total data loss.

### 5. HIGH: No Real Matching
`Math.random() > 0.5` is the entire matching algorithm.

### 6. HIGH: Dual Conflicting Type Systems
`src/types.ts` and `src/types/index.ts` define overlapping but incompatible types:

| Type | types.ts | types/index.ts | Conflict |
|------|----------|----------------|----------|
| Profile.photos | `string[]` | `ProfilePhoto[]` (object with id, url, order, isPrimary) | Shape mismatch |
| Profile.uid | Present | Missing | Field mismatch |
| Profile fields | Missing verificationLevel, distance | Has both | Feature gap |
| DiscoveryPreferences.hardFilters | `string[]` | `HardFilter[]` (object) | Shape mismatch |
| DiscoveryPreferences.softPreferences | `string[]` | `SoftPreference[]` (object) | Shape mismatch |
| DiscoveryPreferences.recommendationMode | `'values_first'` (underscore) | `'values-first'` (hyphen) | Enum mismatch |
| Conversation | No unreadCount, isPaused | Has both | Feature gap |
| Message.createdAt vs timestamp | `createdAt` | `timestamp` | Field name mismatch |
| Message.status | Missing | `'sent' \| 'delivered' \| 'read'` | Feature gap |
| TasteProfile | Flat with weights object | Different shape (attractionTags, valuesTags, weightingAppearance) | Total mismatch |
| AnalyticsEvent | Generic `{ id, type, payload }` | Union string literal type | Total mismatch |
| Report type | Missing | Full `Report` interface with `ReportReason` union | Missing in types.ts |
| DailyPick type | Missing | `{ profile, explanation }` | Missing in types.ts |
| MatchExplanation | Missing | `{ reason, type: 'hard' \| 'soft' \| 'learned' }` | Missing in types.ts |
| HardFilter | Missing | Full interface | Missing in types.ts |
| SoftPreference | Missing | Full interface | Missing in types.ts |

**`types/index.ts` is strictly richer** and should be canonical.

### 7. MEDIUM: No Input Sanitization
User text goes directly into Gemini prompts via string interpolation:
```typescript
contents: `...User bio (raw):\n${params.bio_raw}...`
```
No sanitization against prompt injection.

### 8. MEDIUM: react-markdown Without Sanitization
`ChatThread.tsx` uses `react-markdown` to render AI responses. If AI output contains malicious markdown/HTML, this could be an XSS vector (depends on react-markdown version and config).

### 9. LOW: Mock Data Hardcoded
4 profiles and 1 conversation. All with placeholder photos (`picsum.photos`).

### 10. LOW: Admin Email Hardcoded in Security Rules
`akivagoldstein61@gmail.com` in `firestore.rules`. Fine for dev, needs role-based management for production.

---

## Salvage Assessment Summary

| Category | Verdict |
|----------|---------|
| `src/ai/*` (9 files) | **SALVAGE ALL** — production-quality AI governance layer |
| `src/services/aiService.ts` | **SALVAGE LOGIC, REWRITE TRANSPORT** — move to server-side |
| `src/services/aiSafetyService.ts` | **SALVAGE LOGIC, REWRITE TRANSPORT** |
| `src/services/aiDatePlannerService.ts` | **SALVAGE LOGIC, REWRITE TRANSPORT** |
| `src/services/aiOpsService.ts` | **SALVAGE** — mock data is fine for admin dashboards |
| `src/services/aiExperimentsService.ts` | **SALVAGE** — mock data is fine for now |
| `src/services/analyticsService.ts` | **REWRITE** — console.log is not analytics |
| `src/features/*` (15 files) | **SALVAGE UI PATTERNS** — all need real data layer |
| `src/components/*` (7 files) | **SALVAGE** — good foundations, need RTL hardening |
| `src/types/index.ts` | **KEEP AS CANONICAL** |
| `src/types.ts` | **DELETE** — superseded by types/index.ts |
| `src/context/AppContext.tsx` | **REWRITE** — no persistence, mock data |
| `src/data/mockProfiles.ts` | **QUARANTINE** — dev-only |
| `firestore.rules` | **ADAPT** — good foundation |
| `firebase-blueprint.json` | **ADAPT** — needs expansion |
| `vite.config.ts` | **FIX** — remove API key injection |
| `server.ts` | **EXPAND** — add API routes |
| `index.html` | **FIX** — rename title |
| `package.json` | **FIX** — rename package |
