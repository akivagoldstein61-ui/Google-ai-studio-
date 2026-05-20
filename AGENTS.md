# AGENTS.md

## Project Baseline
- App source of truth: `akivagoldstein61-ui/Google-ai-studio-` on `main`.
- This is a React 19 + Vite frontend served by an Express API in `server.ts`.
- The product is a Kesher trust-forward dating prototype with Firebase auth/data and server-side Gemini AI routes.

## Safe Operating Rules
- Do not add product features unless they are already present, scaffolded, documented, or explicitly requested.
- Keep `GEMINI_API_KEY` server-side. Do not expose it through Vite `define`, client env vars, browser logs, or docs.
- Do not change Firebase production data, Firestore rules, auth mode, deployment config, billing, or external credentials without explicit approval.
- Treat local PDFs and skill bundles as reference evidence, not implementation.
- Avoid logging prompts, message contents, exact locations, tokens, secrets, or other PII.

## Verification
- Install: `npm ci`
- Typecheck: `npm run lint`
- AI contract tests: `npm run test`
- Production build: `npm run build`
- Local smoke: `npm run dev`, then check `/api/health` and a no-key AI fallback path.

## Review Notes
- Canonical app types are in `src/types.ts`.
- `src/types/index.ts` exists but is not currently imported by the app.
- `AI_ROUTE_AUTH_MODE=prototype` allows unauthenticated AI route testing; strict mode requires Firebase Admin initialization and bearer tokens.
