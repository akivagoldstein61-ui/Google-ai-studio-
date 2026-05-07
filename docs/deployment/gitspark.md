# GitSpark integration

Use this guide to connect this repository to GitSpark while keeping CI/deploy behavior aligned with existing GitHub Actions + Vercel pipelines.

## 1) Connect repository and integration mode

1. In GitSpark, create a new project from GitHub.
2. Select `akivagoldstein61-ui/Google-ai-studio-`.
3. Decide whether GitSpark is used for:
   - PR automation/check reporting
   - CI orchestration
   - Deploy orchestration
   - issue/metadata sync

If deploy orchestration is disabled, keep deploy control in `.github/workflows/deploy.yml`.

## 2) Runtime mode

### Recommended: Node / fullstack

- Install command: `npm ci`
- Build command: `npm run build`
- Start command: `npm run start` (`node dist/server.cjs`)

This mode is required when you need Express routes like `/api/ai/*` and `/api/health`.

### Fallback: static site

- Install command: `npm ci`
- Build command: `npm run build`
- Publish/output directory: `dist`

Static mode serves the frontend only. Express API routes are not available.

## 3) Permissions

Grant:

- Repository read/write (PR metadata, statuses, checks)
- Workflows/Actions read (observe workflow/check outcomes and report PR status context)
- Deployments/environments off by default; enable only if GitSpark directly controls releases

In `.git-spark.json`, `deploy_mode` is `github-actions`, so deploy flow still runs through GitHub Actions on `main`.

## 4) Command mapping

Use the existing project commands:

- Install: `npm ci`
- Lint/typecheck: `npm run lint` (or `npm run typecheck`)
- Tests: `npm run test`
- Build: `npm run build`
- Optional safety scans:
  - `npm run scan:forbidden-fields`
  - `npm run scan:logs`

The root `.git-spark.json` includes this mapping.

## 5) Environment variables (server-side only)

- `GEMINI_API_KEY`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `APP_URL`

If GitSpark also orchestrates deploys through GitHub Actions, also set:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Never commit secret values to the repository.

## 6) Security constraints

- Keep `GEMINI_API_KEY` and Firebase private credentials server-side only.
- Do not expose secret values through Vite client env vars, browser logs, CI artifacts, or generated bundles.
- Preserve existing trust/safety behavior; GitSpark orchestration must not bypass or weaken current checks.

## 7) Branch and event behavior

Match current workflow behavior:

- Pull requests to `main`: validation only, no production deploy
- Pushes to `main`: validation + deploy

The `.git-spark.json` file uses `pull_request` and `push` event keys with `branch: "main"`.

## 8) Quality gates and dry run checklist

Open a test PR and verify:

1. Checks pass (or fail only on known baseline issues)
2. GitSpark status/checks appear on the PR
3. No secret values appear in logs or artifacts
4. Preview smoke checks pass for root and `/prototype`
5. No-key fallback path is still safe for AI routes

Recommended quality gates:

- `npm run typecheck`
- `npm run scan:forbidden-fields`
- `npm run scan:logs`
- `npm run test`
- `npm run test:schemas`
- `npm run test:scoring`
- `npm run test:rtl`
- `npm run build`

Then merge to `main` and verify:

1. Main-branch validation runs
2. Production deployment path runs as expected
3. Build metadata appears on `/prototype`
