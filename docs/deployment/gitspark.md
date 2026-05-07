# GitSpark integration

This repo already uses GitHub Actions for CI (`.github/workflows/ci.yml`) and Vercel deploys (`.github/workflows/deploy.yml`), and both workflow files are present in this repository.
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
- Workflows/Actions: read (so GitSpark can observe workflow/check outcomes and report status context on PRs)
- Deployments/environments: off by default; enable only if GitSpark controls releases

In `.git-spark.json`, `deploy_mode` is set to `github-actions`, so `deploy: true` on `push_to_main` means "allow deploy flow on main" while direct GitSpark deployment access remains disabled by default.

> Note: the trailing `-` in `akivagoldstein61-ui/Google-ai-studio-` is part of the real repository name.

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

## Security constraints

- Keep `GEMINI_API_KEY` and Firebase private credentials server-side only.
- Do not expose secret values through Vite client env vars, browser logs, CI artifacts, or generated bundles.
- Preserve existing trust/safety behavior; GitSpark orchestration must not bypass or weaken current checks.

## 5) Branch and event behavior

Match current workflow behavior:

- Pull requests to `main`: validation only, no production deploy
- Pushes to `main`: validation + deploy

The `.git-spark.json` file uses `push_to_main` and `pull_request` event keys to make branch intent explicit.

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
