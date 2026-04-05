# 03 — System Comparison Matrix

> Subsystem-by-subsystem decision table.
> Compares: Current Codebase State → Kesher Canon Requirement → Decision.

---

## Decision Key

| Code | Meaning |
|------|---------|
| **KEEP** | Current implementation is production-viable. No changes needed. |
| **ADAPT** | Current implementation has the right shape. Needs hardening, wiring, or expansion. |
| **REWRITE** | Current implementation is demo-only. Must be rebuilt on real foundations. |
| **EXTRACT** | Useful idea or logic to salvage from AI Studio code, but transport/architecture must change. |
| **REJECT** | Must be removed — duplicate, unsafe, or violates canon. |
| **DEFER** | Not blocking. Park for post-MVP. |
| **BUILD** | Does not exist yet. Must be created from scratch. |

---

## Comparison Table

| # | Subsystem | Current State | Canon Requirement | Decision | Confidence | Risk | Approval Needed |
|---|-----------|--------------|-------------------|----------|------------|------|----------------|
| 1 | **Auth** | Fake — hardcoded `{ id: 'me', displayName: 'Akiva' }`. Firebase Auth imported but never used for sign-in. | Real verified auth. Phone verification at minimum. | **REWRITE** | Very High | CRITICAL | Yes — provider choice |
| 2 | **Onboarding** | 5-step flow (terms, phone, intent, observance, profile). Good UI structure. All steps are cosmetic — no backend writes. | Same 5-step structure with real verification, real Firestore user creation. | **ADAPT** | High | HIGH | No |
| 3 | **Profile Builder** | AI-powered bio coaching, photo management UI, completeness analysis. All Gemini calls client-side. | Same features, server-side AI, real photo upload to Firebase Storage. | **ADAPT** | High | MEDIUM | No |
| 4 | **Daily Picks** | Shows first 2 mock profiles. AI-generated bilingual intro. Like/pass with random matching. | Finite curated feed from real scoring algorithm. AI intro preserved. | **ADAPT** | High | HIGH | Yes — algorithm design |
| 5 | **Explore** | Grid/list view of all 4 mock profiles. Filter UI for hard filters, soft preferences, saved presets. | Same UI with real Firestore queries. Filter model is well-designed. | **ADAPT** | High | MEDIUM | No |
| 6 | **Profile Detail** | Full profile view. AI-generated "Why This Match" explanation. AI opener suggestions. More/Less Like This feedback. | Same features, server-side AI calls. | **ADAPT** | High | LOW | No |
| 7 | **Hard Filters** | UI present in ExploreScreen. `HardFilter` type defined in `types/index.ts` with `key, value, isActive, poolImpact`. | Strict filters that remove non-matching profiles entirely. Pool-impact transparency. | **ADAPT** | High | LOW | No |
| 8 | **Soft Preferences** | UI present in ExploreScreen. `SoftPreference` type with `key, value, strength, isActive`. | Bias signals that influence ranking without excluding. | **ADAPT** | High | LOW | No |
| 9 | **Learned Taste** | `moreLikeThis()` / `lessLikeThis()` → Gemini taste analysis → updates context state. Client-side AI. | Same UX. Server-side AI. Persistent taste profile in Firestore. | **EXTRACT** | High | MEDIUM | No |
| 10 | **Why-This-Match** | `aiService.explainMatch()` with WhyMatchSchema. System instruction forbids revealing private prefs. | Same feature. Must not reveal hidden signals. Server-side. | **EXTRACT** | Very High | LOW | No |
| 11 | **Messaging** | In-memory messages. Safety scan, rephrase, openers, date planner, icebreaker — all wired. Client-side AI. | Real Firestore messages. Same AI features server-side. `aiAssisted` label preserved. | **ADAPT** | High | MEDIUM | No |
| 12 | **Safety Center** | Report UI with reason selection modal. Emergency contacts (mock). AI safety FAQ (real Gemini). | Real report submission to Firestore. Real emergency contacts config. Server-side AI FAQ. | **ADAPT** | High | MEDIUM | No |
| 13 | **Report / Block** | Report flow UI present. Block referenced in types but not implemented. | Real Firestore reports collection. Real block list. Immediate hide from feed. | **ADAPT** | High | HIGH | Yes — moderation workflow |
| 14 | **Verification** | `isVerified` boolean on Profile. `verificationLevel` enum in types/index.ts (none, contact, photo, id). Badge rendering. | Real verification pipeline. At minimum: phone-verified at signup. Photo/ID verification deferred. | **ADAPT** | Medium | HIGH | Yes — verification strategy |
| 15 | **Delete Account** | Button in SettingsScreen. Does nothing. | Must actually delete: Firestore user doc, auth account, matches, messages. Clear flow per canon. | **BUILD** | High | HIGH | Yes — data deletion scope |
| 16 | **Premium** | `isPremium` boolean, defaults false. Premium badge in UI. No payment flow. | Canon: premium as refinement, not dignity ransom. Never paywall match replies. Fair free path. | **DEFER** | Medium | LOW | Yes — premium tier definition |
| 17 | **Analytics** | `console.log()` stub. Event types defined in `types/index.ts` (21 event types). | Real analytics provider. Event taxonomy already good. | **ADAPT** | High | LOW | Yes — provider choice |
| 18 | **AI Feature Registry** | 12 features with full metadata: risk, consent, data inputs/exclusions, model routing, audience, flags. | Same. This exceeds most production apps in AI governance. | **KEEP** | Very High | LOW | No |
| 19 | **AI Safety Policies** | STRICT_DATING safety thresholds. Data minimization. No-photo-inference. No-auto-send. No-attractiveness-scoring. | Fully aligned with canon red lines. | **KEEP** | Very High | LOW | No |
| 20 | **AI System Instructions** | 6 system instructions (bio coach, why-match, safety scan, date planner, profile completeness, taste profile). Each with MUST rules and forbidden actions. | Same. Well-crafted and aligned. | **KEEP** | Very High | LOW | No |
| 21 | **AI Prompt Templates** | 10 parameterized templates. Clean separation. | Same. Consider adding input sanitization wrapper. | **ADAPT** | High | MEDIUM | No |
| 22 | **AI Structured Schemas** | 7 Gemini response schemas using `@google/genai` Type system. | Same. Production-ready. | **KEEP** | Very High | LOW | No |
| 23 | **AI Output Validators** | 6 validators for structured response types. | Same. Add tests. | **ADAPT** | High | LOW | No |
| 24 | **AI Service Transport** | `new GoogleGenAI({ apiKey })` in browser. API key from Vite define. | **Must move to server-side Express routes.** Key must never reach client. | **REWRITE** | Very High | CRITICAL | Yes — API route design |
| 25 | **AI Trust Hub** | Feature toggles, AI philosophy display, data/privacy management, red lines policy. | Excellent trust transparency surface. Keep and wire to real feature flag state. | **KEEP** | Very High | LOW | No |
| 26 | **Private Taste Profile** | Display of learned dealbreakers, preferences, weights. Reset button. | Same UI. Wire to persistent Firestore profile. Server-side AI analysis. | **ADAPT** | High | MEDIUM | No |
| 27 | **AI Ops Dashboard** | System health (mock), feature registry status, intervention history (mock). Duplicated across admin/ and settings/. | Keep admin/ version. Delete settings/ duplicate. Wire to real metrics when available. | **ADAPT** | High | LOW | No |
| 28 | **Experiments Dashboard** | Feature flag toggles, active experiments (mock), eval tools (mock). Duplicated. | Keep admin/ version. Delete settings/ duplicate. Wire to real flags. | **ADAPT** | High | LOW | No |
| 29 | **Router / Navigation** | useState booleans. No URL routing. No deep linking. No back button. | Real router library. URL-based navigation. Code splitting. | **REWRITE** | High | MEDIUM | Yes — library choice |
| 30 | **State Management** | Single React Context. All in-memory. No persistence. | Split into: auth state, UI state, server-synced data (via hooks or queries). | **REWRITE** | High | HIGH | No |
| 31 | **Type System** | Dual conflicting files. `types.ts` (simpler) vs `types/index.ts` (richer). | Consolidate to single `types/index.ts`. Add `uid` field to Profile. Delete `types.ts`. | **ADAPT** | Very High | LOW | No |
| 32 | **Design System** | Custom CSS tokens (surface-base, accent-romantic, etc.). RTL font stub. Safe-area support. | KEEP. Add proper RTL support when i18n lands. | **KEEP** | High | LOW | No |
| 33 | **UI Components** | Badge, Button, Input — clean, small, typed. | Keep. May need RTL-aware variants later. | **KEEP** | High | LOW | No |
| 34 | **Firestore Rules** | Auth/owner/admin/participant checks. Well-structured. Hardcoded admin email. | Expand for reports, taste profiles, preferences. Replace hardcoded email with role lookup. | **ADAPT** | High | MEDIUM | Yes — rule additions |
| 35 | **Firebase Blueprint** | 4 entities (UserProfile, Match, Message, Like). Intent enum doesn't match types/index.ts. | Expand entities. Align enums with types/index.ts. Add reports, preferences, taste profiles. | **ADAPT** | High | MEDIUM | Yes — schema changes |
| 36 | **i18n** | `language` useState('en' | 'he'). One RTL font-family rule. No translation framework. | Hebrew-first with i18n framework. RTL layout support throughout. | **BUILD** | High | MEDIUM | Yes — library choice |
| 37 | **Tests** | Zero test files. No test framework. | Vitest + Testing Library. Start with pure functions (validators, router, types). | **BUILD** | High | MEDIUM | No |
| 38 | **CI/CD** | None. | GitHub Actions: lint, type-check, test, build. | **BUILD** | High | MEDIUM | Yes — pipeline design |
| 39 | **Deployment** | Express dev server. AI Studio Cloud Run (not configured standalone). | Needs standalone deployment config. | **DEFER** | Medium | LOW | Yes — platform choice |
| 40 | **Secrets Management** | GEMINI_API_KEY in Vite define (client bundle). Firebase config in committed JSON. | Remove Gemini key from client. Keep Firebase config (public by design). Server-only env vars. | **REWRITE** | Very High | CRITICAL | No — obvious fix |

---

## Summary Counts

| Decision | Count |
|----------|-------|
| KEEP | 7 |
| ADAPT | 19 |
| REWRITE | 5 |
| EXTRACT | 2 |
| BUILD | 4 |
| DEFER | 2 |
| REJECT | 1 (duplicate screens — covered under ADAPT #27/#28) |
| **Total** | 40 subsystems assessed |

---

## Critical Path (must-fix ordering)

```
1. Secrets (REWRITE #40) — unblocks safe deployment
2. AI Transport (REWRITE #24) — unblocks server-side AI
3. Auth (REWRITE #1) — unblocks all user operations
4. State/Data (REWRITE #30) — unblocks persistence
5. Router (REWRITE #29) — unblocks real navigation
```

Everything else (ADAPT, BUILD, DEFER) depends on this chain completing first.
