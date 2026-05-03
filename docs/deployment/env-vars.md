# Deployment environment variables

## Public (`VITE_*`) variables

Only non-sensitive values may be exposed to the browser.

- `VITE_COMMIT_SHA`
- `VITE_BUILD_TIME`
- `VITE_GIT_BRANCH`
- `VITE_DEPLOY_ENV`
- `VITE_VERCEL_ENV`
- `VITE_VERCEL_TARGET_ENV`
- `VITE_VERCEL_URL`
- `VITE_VERCEL_BRANCH_URL`
- `VITE_VERCEL_PROJECT_PRODUCTION_URL`
- `VITE_VERCEL_GIT_COMMIT_REF`
- `VITE_VERCEL_GIT_COMMIT_SHA`
- `VITE_VERCEL_GIT_PULL_REQUEST_ID`
- `VITE_DATABASE_MODE` (`mock`, `preview`, `production`)

## Server-only secrets

Never expose these client-side:

- `DATABASE_URL`
- `DIRECT_DATABASE_URL`
- `GEMINI_API_KEY`
- `FIREBASE_PRIVATE_KEY`
- `VERCEL_TOKEN`
- `NETLIFY_AUTH_TOKEN`
- Neon connection strings

## Recommended split

- Build metadata and mode flags: `VITE_*`
- Credentials, keys, connection strings: server runtime only
