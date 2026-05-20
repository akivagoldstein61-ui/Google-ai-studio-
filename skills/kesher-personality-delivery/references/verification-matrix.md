# Personality Feature Verification Matrix

## Required Local Checks

- Install dependencies with `npm ci`.
- Typecheck with `npm run lint`.
- Run AI and contract tests with `npm run test`.
- Build production assets with `npm run build`.
- Scan forbidden client/server fields with `npm run scan:forbidden-fields`.
- Scan logs for prompt, message, location, token, secret, and PII leakage with `npm run scan:logs`.

## Conditional Checks

- Personality schema changes: run `npm run test:schemas`.
- Personality scoring changes: run `npm run test:scoring`.
- RTL or Hebrew layout/copy changes: run `npm run test:rtl`.
- Prompt, output validator, or sensitive AI copy changes: run `npm run redteam:personality`.
- Deployment or preview changes: run `node scripts/smoke-deployment.mjs` with `SMOKE_BASE_URL` and expected commit metadata when available.
- UI changes: start `npm run dev`, check `/api/health`, and browser-check `/skills-hub` plus affected user flows.

## Review Checks

- Confirm no raw answers, raw scores, private taste, private messages, exact location, prompt text, generated sensitive prose, tokens, or secrets leak into user-facing prose, logs, public APIs, static exports, or `dist/`.
- Confirm consent is enforced for compatibility reflection, sharing, private taste, and personality visibility changes.
- Confirm fallback states do not invent insights or mask high-risk production failures.
- Confirm docs or ADRs update when governance, visibility, runtime, or release-gate behavior changes.

## Release Checks

Use GitHub and Vercel for PR, CI, and preview review. Use Netlify, Render, Supabase, Neon, Expo, iOS, or other deploy/native plugins only after explicit approval for that platform. Report every command that ran and every check that remains unverified.
