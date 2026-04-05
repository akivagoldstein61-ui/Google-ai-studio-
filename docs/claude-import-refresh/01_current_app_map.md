# 01 — Current App Map

> Since the repo IS the AI Studio export, this document maps the single codebase.
> See `02_ai_studio_export_map.md` for the AI-Studio-specific risk assessment.

---

## Framework Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| UI Framework | React | 19.0.0 |
| Build Tool | Vite | 6.2.0 |
| CSS | Tailwind CSS | 4.1.14 (via @tailwindcss/vite) |
| Animation | Motion (Framer Motion successor) | 12.38.0 |
| Icons | Lucide React | 0.546.0 |
| AI SDK | @google/genai | 1.46.0 |
| Backend DB | Firebase / Firestore | 12.11.0 |
| Server | Express | 4.21.2 |
| Language | TypeScript | 5.8.2 |
| Markdown | react-markdown | 10.1.0 |
| Package Manager | npm | lock file present |

---

## App Shell & Routing

**No router library installed.** All navigation is managed via `useState` booleans in `App.tsx`.

```
App.tsx (root)
├── !user → WelcomeScreen
├── isOnboarding → OnboardingFlow
├── showSafety → SafetyCenter
├── showAITrust → AITrustHub
├── showTasteProfile → PrivateTasteProfile
├── showAIOps → AIOpsScreen (admin)
├── showExperiments → ExperimentsScreen (admin)
├── selectedProfile → ProfileDetail
├── selectedConversation → ChatThread
├── MainLayout (bottom tab bar)
│   ├── activeTab='daily' → DailyPicksScreen
│   ├── activeTab='explore' → ExploreScreen
│   ├── activeTab='matches' → InboxScreen
│   └── activeTab='profile' → SettingsScreen
└── showMatch overlay → MatchSheet
```

**Implications:**
- No deep linking / URL routing
- No browser back button support
- No route-based code splitting
- No shareable URLs
- Screen stack is flat (no nested navigation)

---

## State Management

**Single React Context** (`AppContext.tsx`) holds ALL state:

| State | Type | Source | Persistent? |
|-------|------|--------|-------------|
| `user` | Profile | null | Hardcoded on "login" | No |
| `language` | 'en' \| 'he' | useState | No |
| `dailyPicks` | Profile[] | MOCK_PROFILES.slice(0,2) | No |
| `exploreProfiles` | Profile[] | MOCK_PROFILES | No |
| `matches` | Match[] | [] | No |
| `conversations` | Conversation[] | MOCK_CONVERSATIONS | No |
| `preferences` | DiscoveryPreferences | Hardcoded defaults | No |
| `tasteProfile` | object | Hardcoded defaults | No |
| `isPremium` | boolean | false | No |
| `isAgeVerified` | boolean | false | No |
| `hasAcceptedTerms` | boolean | false | No |
| `isOnboarding` | boolean | false | No |
| `interactions` | {likes, passes, moreLikeThis, lessLikeThis} | [] each | No |

**Nothing persists.** All state resets on refresh.

---

## Auth Flow

**Entirely fake.**

1. `WelcomeScreen` renders landing page
2. Clicking "Get Started" calls `setUser({ id: 'me', displayName: 'Akiva', age: 28, ... })`
3. Firebase Auth is `import`ed and `getAuth()` called but **never used for sign-in**
4. No real phone verification, email auth, or OAuth
5. Onboarding phone step shows UI but doesn't verify

---

## Database Access Layer

**Zero real database operations.**

- `firebase.ts` initializes Firestore with `getFirestore(app, firebaseConfig.firestoreDatabaseId)`
- No imports of `getDoc`, `setDoc`, `collection`, `query`, etc. anywhere in the codebase
- All data comes from `MOCK_PROFILES` (4 profiles) and `MOCK_CONVERSATIONS` (1 conversation)
- `firestore.rules` exist and are well-structured but never exercised

### Firestore Rules Summary
- `/users/{uid}` — read: authenticated; write: owner or admin
- `/likes/{likeId}` — read: sender or recipient or admin; create: sender only
- `/matches/{matchId}` — read: participants or admin; create: authenticated
- `/matches/{matchId}/messages/{messageId}` — read/create: match participants or admin
- Admin check: role field OR hardcoded email `akivagoldstein61@gmail.com`

### Firebase Blueprint Entities
1. **UserProfile**: uid, displayName, birthDate, gender, location, bio, prompts, photos, intent, isVerified, createdAt
2. **Match**: users[], status, createdAt, whyThisMatch
3. **Message**: matchId, senderId, text, createdAt
4. **Like**: fromId, toId, createdAt

---

## Matching / Discovery Logic

**No real algorithm.**

- `likeProfile()`: `Math.random() > 0.5` determines match
- `passProfile()`: Removes from explore list in memory
- `moreLikeThis()` / `lessLikeThis()`: Calls Gemini to update taste profile (client-side)
- Daily Picks = first 2 of 4 mock profiles
- Explore = all 4 mock profiles
- No scoring, no ranking, no collaborative filtering, no server-side logic

---

## Messaging

- `ChatThread.tsx` is the richest screen (~352 lines)
- Messages stored in `AppContext` state only
- `sendMessage()` pushes to in-memory array
- Features wired: safety scan before display, rephrase message, generate openers, date planner, visual icebreaker
- All AI features call Gemini directly from the client

---

## AI Feature Surfaces

12 features registered in `featureRegistry.ts`. 9 are client-implemented:

| Feature | Implementation File | Wired In UI? | Server-side? |
|---------|-------------------|--------------|-------------|
| Bio Coach | `aiService.coachBio()` | ProfileBuilder | No — client |
| Taste Profile | `aiService.analyzeTasteProfile()` | AppContext (moreLikeThis/lessLikeThis) | No — client |
| Why This Match | `aiService.explainMatch()` | ProfileDetail, DailyPicksScreen | No — client |
| Safety Scan | `aiSafetyService.scanMessage()` | ChatThread | No — client |
| Date Planner | `aiDatePlannerService.planDate()` | ChatThread | No — client |
| Safety Advice | `aiSafetyService.getSafetyAdvice()` | SafetyCenter | No — client |
| Rephrase Message | `aiService.rephraseMessage()` | ChatThread | No — client |
| Generate Openers | `aiService.generateOpeners()` | ProfileDetail | No — client |
| Profile Completeness | `aiService.analyzeProfileCompleteness()` | ProfileBuilder | No — client |
| Daily Picks Intro | `aiService.generateDailyPicksIntro()` | DailyPicksScreen | No — client |
| Visual Icebreaker | `aiService.generateIcebreakerImage()` | ChatThread | No — client |
| Mod Summarizer | Prompt defined, not wired | — | — |
| Voice Reflection | Flag=false, not implemented | — | — |

---

## Trust & Safety Surfaces

| Surface | File | Status |
|---------|------|--------|
| Safety Center | `SafetyCenter.tsx` | UI present, mock report submission |
| Report flow | `SafetyCenter.tsx` | Modal with reason selection, no backend |
| Block user | Referenced in types, not fully implemented |
| Emergency contacts | Hardcoded mock data in SafetyCenter |
| AI Safety FAQ | `aiSafetyService.getSafetyAdvice()` — real Gemini call |
| Message safety scan | `aiSafetyService.scanMessage()` — real Gemini call |
| AI disclosure labels | `aiAssisted` flag on messages |
| Delete account | Button in SettingsScreen, no implementation |

---

## Analytics

`analyticsService.ts` exports `analytics.track()` which does `console.log()`. No real provider.

---

## Billing / Premium

- `isPremium` boolean in context, defaults to `false`
- Premium badge rendering in UI
- No payment flow, no subscription logic, no App Store integration

---

## Deployment Configuration

- `server.ts`: Express server, port 3000, Vite middleware in dev, static files in prod
- No Dockerfile
- No Cloud Run config
- No CI/CD
- Designed for AI Studio's managed Cloud Run deployment

---

## Tests

**Zero test files.** No test framework installed. No `vitest`, `jest`, or `@testing-library` in dependencies.

---

## Dead Code / Duplicates / Debt

| Issue | Files | Severity |
|-------|-------|----------|
| Duplicate type definitions | `src/types.ts` vs `src/types/index.ts` — conflicting `Profile`, `Match`, `Conversation` shapes | MEDIUM |
| Duplicate AIOps screen | `features/admin/AIOpsScreen.tsx` (detailed) vs `features/settings/AIOpsScreen.tsx` (simple) | LOW |
| Duplicate Experiments screen | `features/admin/ExperimentsScreen.tsx` vs `features/settings/ExperimentsScreen.tsx` | LOW |
| Package name wrong | `package.json` name is "react-example" | LOW |
| HTML title wrong | "My Google AI Studio App" | LOW |
| Unused Firebase imports | `firebase.ts` exports `db` and `auth` — `db` never used, `auth` never used for sign-in | LOW |

---

## Environment Variables

| Variable | Where Used | Risk |
|----------|-----------|------|
| `GEMINI_API_KEY` | `vite.config.ts` → injected into client bundle | **CRITICAL** — exposed in browser |
| `GEMINI_API_KEY` | `aiService.ts` → `process.env.GEMINI_API_KEY` | Resolves to literal string in bundle |
| `APP_URL` | `.env.example` only | Not used in code |
| Firebase config | `firebase-applet-config.json` | Public keys (acceptable for Firebase) |
