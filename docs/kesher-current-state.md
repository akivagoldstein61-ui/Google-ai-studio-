# Kesher Current State Freeze

This document freezes the current product and runtime truth before the beta
hardening sequence begins. It is evidence-driven and intentionally does not
change runtime behavior.

## Snapshot

| Field | Current truth |
|---|---|
| Repository | `akivagoldstein61-ui/Google-ai-studio-` |
| Baseline branch | `main` |
| Freeze branch | `docs/current-state-freeze` |
| Current commit SHA | `b7d602779c032e8919274fa70c0e5fe19e8cf1c9` |
| Short SHA | `b7d6027` |
| Stable prototype | `https://google-ai-studio-sage-sigma.vercel.app` |
| Replit workshop URL | `https://google-ai-studio-5.replit.app/` and `/mobile/` public app URLs blocked; private dev URL requires ReplShield auth |
| Stable route probe | `2026-05-20T15:21:17Z` |
| Primary evidence | `package.json`, `server.ts`, `api/*.ts`, `server/*.ts`, `src/firebase.ts`, `src/context/AppContext.tsx`, `src/lib/prototypeMode.ts`, `vercel.json`, `netlify.toml`, `.github/workflows/*.yml`, `.github/CODEOWNERS`, `firestore.rules`, `docs/deployment/*` |

## Package And Runtime Stack

- Frontend: React `^19.0.0`, React DOM `^19.0.0`, React Router DOM `^7.15.0`, Vite `^6.2.0`, TypeScript `~5.8.2`.
- Styling and UI: Tailwind CSS `^4.1.14`, `@tailwindcss/vite` `^4.1.14`, `lucide-react` `^0.546.0`, `motion` `^12.38.0`, `clsx`, `tailwind-merge`.
- Server runtime: Express `^4.21.2`, `server.ts`, bundled with esbuild for Node target `node22` into `dist/server.cjs`.
- AI runtime: `@google/genai` `^1.46.0`; all Gemini SDK calls are in server route code and use server-side `GEMINI_API_KEY`.
- Firebase runtime: Firebase client SDK `^12.11.0`, Firebase Admin `^13.7.0`, Firestore, Firebase Auth.
- Tests and tooling: Vitest `^4.1.5`, jsdom `^29.0.1`, Testing Library, Puppeteer, tsx, esbuild.

## Npm Script Phase Map

| Script | Command | Phase / use |
|---|---|---|
| `start` | `node dist/server.cjs` | Runs the production Node/Express bundle after `npm run build`. |
| `dev` | `tsx server.ts` | Local full-stack development server. |
| `build` | `vite build && esbuild server.ts ... --target=node22 --outfile=dist/server.cjs ...` | Production build: Vite SPA plus bundled Express server. Used by CI, Vercel build, Netlify static mirror. |
| `preview` | `vite preview` | Static Vite preview of the built frontend; does not run the Express API. |
| `clean` | `rm -rf dist` | Removes build artifacts. |
| `lint` | `tsc --noEmit` | TypeScript check alias. |
| `test` | `vitest run` | AI contract and validator test phase used by required validation. |
| `test:watch` | `vitest` | Local watch mode. |
| `typecheck` | `tsc --noEmit` | Required validation and CI typecheck. |
| `test:schemas` | `node scripts/personality-smoke-tests.mjs` | Personality schema smoke validation in CI. |
| `test:scoring` | `node scripts/test-personality-scoring.mjs` | Deterministic personality scoring validation in CI. |
| `redteam:personality` | `node scripts/redteam-personality.mjs` | Personality red-team validation workflow. |
| `test:rtl` | `node scripts/test-rtl.mjs` | RTL snapshot/behavior validation in CI. |
| `scan:forbidden-fields` | `node scripts/scan-forbidden-fields.mjs` | CI privacy scan for forbidden fields. |
| `scan:logs` | `node scripts/scan-logs.mjs` | CI log-safety scan. |
| `smoke:deployment` | `node scripts/smoke-deployment.mjs` | Preview/stable route smoke check for app shell, metadata endpoints, demo mode, and API fallback behavior. |
| `smoke:replit` | `node scripts/replit-parity-smoke.mjs` | External Replit parity smoke. Fails on ReplShield, `silent-auth`, Replit platform HTML, API HTML, and non-JSON API responses. |

## Deployment Topology

- Vercel stable prototype: `docs/deployment/vercel.md` and `README.md` name `https://google-ai-studio-sage-sigma.vercel.app` as the stable production prototype. Pushes to `main` can deploy through `.github/workflows/deploy.yml` when Vercel secrets are configured.
- Vercel build shape: `vercel.json` sets `buildCommand` to `vite build`, `outputDirectory` to `dist`, rewrites `/__version` to `/api/version`, and rewrites non-API paths to `/index.html`. The negative-lookahead SPA rewrite excludes `/api` and `/api/*`.
- Vercel API shape: `api/health.ts` and `api/version.ts` are standalone Vercel functions. `api/[...path].ts` mounts the Express routers and intends to return JSON for unmatched `/api/*`.
- Vercel preview behavior: PRs receive preview deployments through Vercel Git integration. `.github/workflows/preview-verification.yml` tries to discover the preview URL from deployment/status metadata, then runs `scripts/smoke-deployment.mjs`. If discovery fails, it warns instead of failing.
- Netlify static mirror: `netlify.toml` builds with `npm run build`, publishes `dist`, rewrites all paths to `/index.html`, and sets static security headers. `docs/deployment/netlify.md` explicitly says Netlify is a static mirror and does not implement Express/API routes without Netlify Functions.
- Replit workshop preview: `https://google-ai-studio-5.replit.app/` and `https://google-ai-studio-5.replit.app/mobile/` were not externally live on June 17, 2026, and private dev URLs such as `https://b8e151ee-e61c-47d6-b5b6-c021ec075a3b-00-2y0qfvn0rk27z.pike.replit.dev/daily` and `/skills` redirected through ReplShield/`silent-auth` for unauthenticated probes. Authenticated UI evidence showed `/daily` rendering inside Replit, so Replit is useful workshop evidence but remains blocked for public parity until a public URL passes `npm run smoke:replit -- <url>` or authenticated-only evidence is labeled.
- Firebase Auth and Firestore: `src/firebase.ts` initializes Firebase client Auth and a named Firestore database from `firebase-applet-config.json`. `src/context/AppContext.tsx` reads and writes Firestore user/private/match/conversation data outside demo mode.
- Firebase Admin: `server/authMiddleware.ts`, `server/aiRoutes.ts`, `server/trustRoutes.ts`, and `server/shareRoutes.ts` initialize Firebase Admin with a project ID from env or local config, then verify bearer ID tokens for protected server routes.
- Gemini routes: `server/aiRoutes.ts` keeps Gemini calls server-side via `@google/genai`. `GEMINI_API_KEY` is read only on the server and must not be exposed through Vite env or docs.

## Route Truth Table

Stable route probe against `https://google-ai-studio-sage-sigma.vercel.app` at `2026-05-20T15:21:17Z`:

| Route | Observed status | Observed body type | Source marker | Current truth |
|---|---:|---|---|---|
| `/` | `200` | HTML | n/a | SPA shell. |
| `/prototype` | `200` | HTML | n/a | SPA shell renders prototype status client route. |
| `/skills-hub` | `200` | HTML | n/a | SPA shell renders skills hub client route. |
| `/demo?demo=1` | `200` | HTML | n/a | SPA shell with demo-mode client path. |
| `/api/health` | `200` | JSON | `vercel-api-function` | Health Vercel Function returns Kesher JSON. |
| `/api/version` | `200` | JSON | `vercel-api-function`, short SHA `b7d6027` | Version Vercel Function returns build/deployment metadata JSON. |
| `/__version` | `200` | JSON | `vercel-api-function`, short SHA `b7d6027` | Rewritten to `/api/version`; returns metadata JSON. |
| `/api/not-a-real-route` | `500` | Plain text / platform error | `FUNCTION_INVOCATION_FAILED` | Stable runtime currently returns a Vercel platform 500 instead of the intended Kesher JSON 404. This is a beta blocker. |

Local/server intent differs from stable production for unmatched APIs: `server.ts` returns Express JSON 404 for unmatched `/api/*`, and `api/[...path].ts` intends to return Vercel Function JSON 404. The stable URL currently does not match that intent.

## Auth Truth

- `server/authMiddleware.ts` requires `Authorization: Bearer <Firebase ID token>`. Missing bearer returns `401` JSON `{ "error": "Authentication required" }`; invalid token returns `401` JSON `{ "error": "Invalid token" }`.
- `server.ts` and `api/[...path].ts` mount `/api/ai` as `authMiddleware, aiRouter`, so the outer Firebase bearer check currently runs before the AI router's internal auth-mode logic in normal server/Vercel routing.
- `server/aiRoutes.ts` also has an internal `requireAuth` middleware controlled by `AI_ROUTE_AUTH_MODE`; when unset it defaults to `prototype`. In `prototype`, it calls `next()` without rejecting missing tokens. In `strict`, it requires a bearer token and Firebase Admin verification.
- Existing tests mount `aiRouter` directly, so `AI_ROUTE_AUTH_MODE=prototype` enables unauthenticated AI route fallback testing there. The default remains a beta-hardening concern even though the normal mounted route also has the outer `authMiddleware`.
- `src/lib/prototypeMode.ts` enables demo mode when `VITE_PROTOTYPE_DEMO_MODE=true`, when the URL has `demo`, or when the hostname is not in the Firebase authorized-hostname allowlist.
- Authorized hostnames in client code are `google-ai-studio-sage-sigma.vercel.app`, `gen-lang-client-0904321862.firebaseapp.com`, `localhost`, and `127.0.0.1`.

## Data Truth

- Firestore client reads: `AppContext` reads `users/{uid}`, private taste/profile/preference docs, `matches`, `conversations`, and candidate `users`.
- Firestore client writes: onboarding/profile-adjacent state, discovery preferences, taste profile/state/interactions, likes/passes, generated matches, conversations, and chat messages.
- Like/match/chat still use client-side state as the immediate source of truth. `likeProfile` can randomly create a match in non-demo mode and then persists it to Firestore; `sendMessage` appends locally before writing `arrayUnion` to Firestore.
- Mock/demo fallbacks are active. Demo mode seeds `DEMO_USER`, `DEMO_MATCHES`, `DEMO_CONVERSATIONS`, daily picks, explore profiles, premium/age/terms state, and avoids Firestore writes for demo-only flows.
- Discovery falls back to `MOCK_PROFILES` when no Firestore candidates are found or when running in demo mode.
- `firebase-applet-config.json` is a required local config input for the current Firebase client/server initialization pattern.

## Trust And Safety Truth

- Report: `trustService.report` posts to `/api/safety/report`; `server/trustRoutes.ts` writes `reports` with `status: pending` after bearer auth and reporter ownership check.
- Block: `trustService.block` posts to `/api/safety/block`; server writes `blocks` after bearer auth and blocker ownership check.
- Unmatch: `trustService.unmatch` posts to `/api/safety/unmatch`; server writes `unmatches` and updates `matches/{matchId}.status` to `unmatched` when `matchId` is provided.
- Support contact: `trustService.contactSupport` posts to `/api/support/contact`; server writes `support_requests` with `status: pending`.
- Account deletion request: `trustService.requestAccountDeletion` posts to `/api/account/delete-request`; server writes `delete_requests` with `status: pending`.
- Profile pause/privacy/personality reset/delete/export/visibility are all mounted through `trustRoutes` under `/api/profile`, with bearer auth, user ownership checks, and Firestore reads/writes.
- Personality export reads `users/{userId}`, `users/{userId}/private/personality`, and `users/{userId}/private/visibility`; demo mode returns a synthetic export payload.
- Personality visibility defaults missing docs to all visibility fields set to `private`; update accepts only `trait_summary`, `strengths`, `watch_outs`, `communication_notes` and only `private`, `public`, or `mutual`.
- Share cards are implemented separately in `server/shareRoutes.ts` under `/api/share`, with bearer auth, owner/recipient checks, expiry/revocation handling, and `shareCards/{cardId}/auditLog` writes.

## Governance Truth

- CI workflow: `.github/workflows/ci.yml` runs on pushes to `main` and PRs to `main`. It installs with `npm ci --ignore-scripts`, runs `npm run typecheck`, forbidden-field scan, log scan, `npm run test`, personality schema/scoring tests, RTL tests, `npm run build`, client bundle secret scan, and uploads `dist`.
- Deploy workflow: `.github/workflows/deploy.yml` runs on pushes to `main`, is skipped unless Vercel secrets are configured, pulls the production Vercel environment, runs `vercel build --prod`, then `vercel deploy --prebuilt --prod`.
- Preview verification workflow: `.github/workflows/preview-verification.yml` runs on PRs to `main`, tries to discover a Vercel preview URL, runs `scripts/smoke-deployment.mjs` when found, and warns when preview discovery is missing.
- CODEOWNERS: `.github/CODEOWNERS` currently contains placeholder owners such as `@org/engineering-reviewers`, `@org/privacy-reviewers`, `@org/safety-reviewers`, `@org/psychometric-reviewers`, and `@org/l10n-reviewers`. The file itself notes these teams must be created/replaced before rules take effect.

## Beta Blockers

1. Stable unmatched `/api/*` currently returns a Vercel platform `500` plain-text `FUNCTION_INVOCATION_FAILED` instead of Kesher JSON 404.
2. `AI_ROUTE_AUTH_MODE` defaults to `prototype` inside `server/aiRoutes.ts`; strict production posture requires explicit `strict` plus verified Firebase Admin setup.
3. `firestore.rules` has a hardcoded admin email fallback: `akivagoldstein61@gmail.com`.
4. CODEOWNERS uses placeholder `@org/...` teams, so governance review ownership may not actually trigger.
5. Stale docs exist: `docs/operator/feature-inventory.md` still says deployment platform is "scaffolded docs only" with no Vercel/Netlify/Cloudflare config, despite `vercel.json`, `netlify.toml`, and deployment docs existing.
6. `docs/operator/deployment-readiness.md` still recommends adding platform-specific preview/deploy config after approval, although Vercel and Netlify config are already present.
7. Admin AI Ops / Experiments surfaces are present but not proven role-gated before production.
8. Firestore rules need emulator-backed end-to-end validation before real beta users.
9. Replit parity evidence is blocked until a public Replit App URL serves Kesher routes without ReplShield/login and passes external smoke, or authenticated-only evidence is explicitly labeled.

## Next PR Queue Summary

1. Fix stable Vercel unmatched `/api/*` so it returns Kesher JSON 404 from the intended handler, then add/keep smoke coverage.
2. Align AI route auth defaults and docs: require explicit production `AI_ROUTE_AUTH_MODE=strict`, clarify outer `authMiddleware` versus `aiRouter` internal auth mode, and verify no-key fallback only in approved test/prototype paths.
3. Replace the hardcoded Firestore admin email fallback with a governed role/claim/admin mechanism and add rules tests.
4. Replace placeholder CODEOWNERS teams with actual GitHub owners.
5. Refresh stale operator/deployment docs to match the current Vercel/Netlify topology.
6. Add route-level trust/safety API tests for report, block, unmatch, support, deletion request, personality export, and visibility.
7. Gate admin-only surfaces before beta and document the expected reviewer/owner workflow.
