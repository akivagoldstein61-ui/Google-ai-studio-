# Kesher Skills Hub Integration Inventory

Inventory captured for the local branch `deepen-personality-taste-skills` at `63ebb9020087c198b5fc9ffba3b60494a3b2a9a8`. The implementation plan referenced `c0f1cfdbe5aa8642fe2856b372910eb7cb949102`; the local checkout had already advanced. Production drift was checked against `main@91928fc82d1aca96b302cc454cd5e99cb7e91511` on May 24, 2026 UTC.

## Stack And Deployment Shape

- Frontend: React 19, Vite, TypeScript.
- App shell: SPA routes through `src/App.tsx`, shared tab shell in `src/components/layout/MainLayout.tsx`.
- Server/API: Express app in `server.ts`, Vercel hybrid routing through `api/[...path].ts`, direct `api/health.ts` and `api/version.ts`, and SPA rewrites in `vercel.json`.
- Auth/data: Firebase Auth and Firestore through `src/firebase.ts` and `src/context/AppContext.tsx`.
- AI boundary: server-side Gemini routes live in `server/aiRoutes.ts`; browser code uses service wrappers such as `src/services/aiService.ts` and demo-safe fallbacks.
- Build/test scripts discovered in `package.json`: `npm run lint`, `npm run test`, `npm run test:skills`, `npm run test:rtl`, `npm run scan:forbidden-fields`, `npm run scan:logs`, `npm run build`.

## Live Route Checks

Production URL: `https://google-ai-studio-sage-sigma.vercel.app`.

- `/`: returned Vercel SPA HTML with current production assets.
- `/prototype`: returned Vercel SPA HTML.
- `/skills-hub`: returned Vercel SPA HTML and deep-linked to the standalone Skills Hub shell.
- `/demo?demo=1`: returned Vercel SPA HTML with demo query preserved client-side.
- `/api/health`: returned HTTP 200 JSON with `status: "ok"`, `source: "vercel-api-function"`, and service `kesher`.
- `/api/version`: returned HTTP 200 JSON for branch `main`, commit `91928fc82d1aca96b302cc454cd5e99cb7e91511`, production URL, and generated timestamp.
- `/__version`: returned the same version payload via rewrite.

The deployed app is hybrid: static Vite SPA assets plus Vercel-compatible API functions forwarding into the Express app.

## Previous Skills Hub Implementation

- `src/features/skills/SkillsHub.tsx` owned the local `SKILLS` array and hub rendering.
- `src/features/skills/SkillsRouter.tsx` opened bespoke pages for some skills and `PlannedSkillPage` for the rest.
- Before this integration, only 10 skills had direct feature shortcuts: Personality Assessment, Personality Profile, Personality Visibility, Private Taste, Consent UX, Explainable AI, Why This Match, Pacing Coach, Compatibility Reflection, and Permissioned Sharing.
- `src/features/skills/skillsRegistry.test.ts` verified the 35-skill prototype count and parity with the shareable `skills/` folder.

## Featured Skill Inventory

All 35 visible prototype skills were extracted and represented in the canonical registry:

1. Personality Assessment
2. Personality Profile
3. Personality Engine
4. Personality Research
5. Personality & OCEAN
6. Personality Visibility
7. Consent UX
8. Israeli Privacy Compliance
9. Privacy-Preserving Recommendation
10. Private Taste
11. Private Recommendations
12. Why This Match
13. Permissioned Sharing
14. Compatibility Reflection
15. Explainable AI
16. Filtering & Marketplace
17. Learned Taste
18. Maps Date Planner
19. Pacing Coach
20. AI Runtime Governance
21. AI Feature Modules
22. Gemini Integration
23. Low-Latency AI
24. High-Thinking Routing
25. Grounded Search
26. Image Analysis
27. Voice Integration
28. AI Studio App Builder
29. SparkMatch Dating App
30. Video Generator
31. System Prompt
32. Calm UX
33. Psychometric Validation
34. Dark Pattern Audit
35. Personality Delivery

## Existing Product Surfaces

- Main navigation: bottom tabs for Daily Picks, Explore, Inbox, Skills, and Profile.
- Home/Daily Picks: finite curated cards, why-match explanation, more/less preference controls, pacing intervention after the batch.
- Onboarding/Profile Builder: personality assessment, profile completeness coach, bio coach, photo review, verification, prompts, and profile save.
- Discovery/Explore/Profile Detail: controlled Explore grid/list, filter drawer, visible profile details, why-match explanations, opener suggestions, safety menu, report flow.
- Match Sheet: why-match explanation, compatibility reflection panel, date planner, permissioned share card, message entry.
- Chat/Inbox: opener drafts, rephrase, message safety scan before send, date planner, safety menu, report/block/unmatch.
- Safety Center: grounded safety assistant, reporting explanation, blocking explanation, unmatching explanation, meeting-safely checklist, emergency/support actions, report flow.
- AI Trust/Settings: AI feature registry controls, private taste reset, personality visibility, red lines, privacy controls, admin entry.
- Admin/moderation: `src/features/admin/AIOpsScreen.tsx` shows internal AI feature status, health, and moderation intervention summaries.

## AI Routes And Registry

Existing server AI routes in `server/aiRoutes.ts`:

- `/api/ai/coach-bio`
- `/api/ai/profile-completeness`
- `/api/ai/explain-match`
- `/api/ai/taste-profile`
- `/api/ai/openers`
- `/api/ai/rephrase`
- `/api/ai/message-safety`
- `/api/ai/safety-advice`
- `/api/ai/plan-date`
- `/api/ai/personality-profile`
- `/api/ai/compatibility-reflection`
- `/api/ai/pacing-intervention`
- `/api/ai/analyze-photos`
- `/api/ai/moderation-summary`

The canonical skill registry links AI-backed skills to existing `src/ai/featureRegistry.ts` feature ids where available. No browser Gemini calls or new AI providers are introduced.

## Route And Auth Behavior

- `AuthGuard` shows welcome, onboarding, then authenticated app routes.
- `/skills-hub` remains a direct deep link outside the tab shell, wrapped in `AppProvider`.
- `/skills` is now the in-app Skills surface inside the shared tab shell.
- `/demo?demo=1` uses prototype demo mode through `src/lib/prototypeMode.ts`; AI services degrade to demo-safe fallbacks.
- Unknown app routes redirect to `/daily` after auth/onboarding.

## Integration Notes

- Skill state is stored under `users/{uid}/private/skill_state` only for real authenticated non-demo users.
- Demo/local/mock mode uses `localStorage` at `kesher.skillState.v1.{userId}`.
- Skill events use sanitized event names only and drop raw messages, answers, secrets, photos, hidden rankings, and moderation evidence.
- Internal governance skills are available to admin surfaces and remain filtered out of normal member recommendations.
