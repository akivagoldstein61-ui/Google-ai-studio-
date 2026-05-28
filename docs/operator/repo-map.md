# Repo Map

## Runtime Shape
- Imported implementation baseline: `akivagoldstein61-ui/Google-ai-studio-` on branch `main`.
- Supporting local evidence lives outside this git repo in the original workspace folder: Kesher personality/privacy PDFs, an empty ADR placeholder, and `files.zip` containing the Kesher skills bundle. Those materials are reference-only unless copied in by an approved docs task.
- `server.ts` starts the Express server, exposes `/api/health`, mounts `/api/ai` from `server/aiRoutes.ts`, mounts trust/account/profile/support routes from `server/trustRoutes.ts`, returns JSON for unmatched `/api/*`, and serves the Vite SPA.
- `api/health.ts`, `api/version.ts`, and `api/[...path].ts` provide Vercel Function JSON responses for runtime health, deployment metadata, and unmatched API routes.
- `src/App.tsx` is the app shell. It switches among welcome, onboarding, Daily Picks, Explore, inbox/chat, settings, profile editing, safety, AI trust, private taste, personality, admin, experiments, profile detail, and match sheet views.
- `src/context/AppContext.tsx` holds client state, Firebase auth listener, Firestore reads/writes, mock fallback discovery data, local matching simulation, private taste interactions, and messaging.

## Frontend Areas
- `src/features/auth` contains the welcome/sign-in entry surface.
- `src/features/onboarding` and `src/components/onboarding` contain onboarding and profile/personality setup.
- `src/features/discovery` and `src/components/discovery` contain Daily Picks, Explore, cards, and profile detail.
- `src/features/chat` contains inbox and thread UI.
- `src/features/settings` contains settings, AI & Trust Hub, Private Taste Profile, Personality Profile, and duplicated admin/experiment surfaces.
- `src/features/safety` contains safety center, menu, and report flow.
- `src/features/match` contains match sheet and date planner modal.

## AI Stack
- `server/aiRoutes.ts` exposes AI routes and keeps Gemini SDK usage server-side.
- `src/ai/policies.ts` stores system instructions and policy constants.
- `src/ai/prompts.ts` stores prompt templates.
- `src/ai/schemas.ts` stores Gemini structured-output schemas.
- `src/ai/outputValidators.ts` performs semantic/prohibited-language checks.
- `src/ai/modelRegistry.ts`, `src/ai/capabilityRouter.ts`, `src/ai/featureRegistry.ts`, and `src/ai/featureFlags.ts` document model routing and enabled AI features.
- `src/services/aiService.ts`, `aiDatePlannerService.ts`, `aiSafetyService.ts`, `aiOpsService.ts`, and `aiExperimentsService.ts` call the server APIs from the client.

## Data / Auth / Config
- `src/firebase.ts` initializes Firebase client SDK from `firebase-applet-config.json`.
- `server/trustRoutes.ts` uses Firebase Admin token verification and Firestore writes for report, block, unmatch, pause, delete request, support, privacy, and personality reset/delete actions.
- `firestore.rules` defines owner/admin/private-doc access boundaries.
- `src/types.ts` is the canonical type module used by app imports. `src/types/index.ts` exists but is not currently imported.
- `.env.example` documents environment configuration; `GEMINI_API_KEY` must remain server-side.

## Verification / CI
- `npm run lint` runs TypeScript with `noEmit`.
- `npm run test` runs Node tests through `tsx`.
- `npm run build` runs Vite build and bundles the Express server with esbuild.
- `.github/workflows/ci.yml` runs install, lint, test, and build on PRs and pushes to `main`.
