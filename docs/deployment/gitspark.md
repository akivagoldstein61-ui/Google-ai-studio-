# GitSpark integration

This repo already uses GitHub Actions for CI (`.github/workflows/ci.yml`) and Vercel deploys (`.github/workflows/deploy.yml`).
GitSpark should be configured to align with that behavior, not replace trust/safety controls.

## 1) Confirm integration mode

Decide which GitSpark capabilities you are enabling:

- PR automation/check reporting
- CI orchestration
- Deploy orchestration
- Issue sync/metadata automation

If deploy orchestration is disabled, keep deploy control in `deploy.yml` only.

## 2) Connect repository and permissions

Connect `akivagoldstein61-ui/Google-ai-studio-` in GitSpark with:

- Repository: read/write (PR metadata, statuses, checks)
- Workflows/Actions: read
- Deployments/environments: optional (only if GitSpark controls releases)

## 3) Command mapping

Use the existing project commands:

- Install: `npm ci`
- Lint/typecheck: `npm run lint` (or `npm run typecheck`)
- Tests: `npm run test`
- Build: `npm run build`
- Optional safety scans:
  - `npm run scan:forbidden-fields`
  - `npm run scan:logs`

The root `.git-spark.json` includes this mapping.

## 4) Secrets in GitSpark environment

Configure:

- `GEMINI_API_KEY` (server-side only)
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `APP_URL`

If GitSpark also triggers GitHub/Vercel deployments, also set:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Never commit secret values to the repository.

## 5) Branch and event behavior

Match current workflow behavior:

- Pull requests to `main`: validation only, no production deploy
- Pushes to `main`: validation + deploy

Keep server-side key handling intact (`GEMINI_API_KEY` must never move to client-side env vars).

## 6) Dry run checklist

Open a test PR and verify:

1. Checks pass (or fail only on known baseline issues)
2. GitSpark status/checks appear on the PR
3. No secret values appear in logs or artifacts
4. Preview smoke checks pass for root and `/prototype`
5. No-key fallback path is still safe for AI routes

Then merge to `main` and verify:

1. Main-branch validation runs
2. Production deployment path runs as expected
3. Build metadata appears on `/prototype`
