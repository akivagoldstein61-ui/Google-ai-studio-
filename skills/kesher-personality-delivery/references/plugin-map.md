# Personality Delivery Plugin Map

Use plugins only when the task needs them. This repo is a React/Vite app with an Express API, Firebase auth/data, and server-side Gemini routes.

## Primary For This Project

- Codex / Superpowers: local repo edits, implementation plans, verification discipline, TDD, systematic debugging, and finishing branches.
- GitHub: source of truth for issues, branches, PRs, CI, review, preview deploy traceability, and release handoff.
- Browser: open localhost or deployed preview URLs, test `/prototype`, `/skills-hub`, onboarding/settings/discovery flows, and capture UI state.
- Vercel: primary live web deployment and preview platform. Inspect previews and statuses; do not change production settings without approval.
- Google AI Studio / Gemini: prompt and prototype evidence source for Gemini-native features. Keep API keys server-side in repo implementations.
- PDF / extracted research skills: use local dossiers and `kesher-personality-research` as evidence, not automatic implementation permission.
- Skill Creator: create or normalize repo-local Codex skills, `agents/openai.yaml`, and validation structure.

## Secondary Or Conditional

- Netlify: static mirror only in this repo. Do not assume Express/API parity unless Netlify Functions are explicitly implemented.
- Render: optional Node host path for `dist/server.cjs`, not current source of truth.
- Supabase / Neon Postgres: not current; the app uses Firebase. Do not introduce a new database path without an approved design.
- Expo / Build iOS Apps: future native parity for personality or trust flows only; not part of the current React/Vite web slice.
- Build macOS Apps: future native admin/companion tooling only.
- CircleCI / CodeRabbit: use only if CI or review tooling is explicitly connected for the PR.
- Cloudflare / Quicknode / YepCode: not part of the current architecture unless a concrete approved integration is added.

## Stop Points

Stop for explicit approval before changing Firebase production data, Firestore rules, auth mode, deployment config, billing, external credentials, secrets, production domains, or database provider.
