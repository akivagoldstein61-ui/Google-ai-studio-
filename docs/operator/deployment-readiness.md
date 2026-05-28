# Deployment Readiness

## Current Evidence
- The repo contains an AI Studio app export link in `README.md`.
- The app is deployable as a Node server serving a Vite SPA: `npm run build` produces `dist/index.html`, assets, and `dist/server.cjs`.
- Vercel is configured through `vercel.json` with Vercel Functions for `/api/health`, `/api/version`, `/__version`, and a JSON API catch-all.
- The Vercel SPA fallback excludes `/api/*` so API routes are not served as `index.html`.
- `/prototype` links to `/skills-hub`, which exposes all prototype skill modules without Firebase auth.

## Required Environment
- `GEMINI_API_KEY`: server-only. Required for live AI responses.
- `AI_ROUTE_AUTH_MODE`: use `prototype` only for local/prototype testing; use `strict` for production.
- `firebase-applet-config.json`: required by current Firebase client/server initialization.
- Firebase Admin credentials/environment must be configured by the host for strict auth verification.

## Recommended Host Posture
- Use any Node 22-capable host for the current baseline.
- Serve `dist/server.cjs` with `npm start` after `npm run build`.
- Configure secrets in the host secret manager, not in repo files.
- Add platform-specific preview/deploy config only after approval.

## Production Gates
- Strict AI route auth verified with Firebase Admin.
- Firestore rules tested with emulator fixtures.
- App Check enforcement designed and tested.
- Gemini fallback/error alerting configured.
- Privacy policy, account deletion handling, and data retention reviewed.
- Admin-only surfaces role-gated.

## Rollback
- Since no deployment platform is configured here, rollback is host-specific.
- Minimum rollback expectation: retain prior build artifact or previous git SHA and redeploy it with unchanged env vars.
