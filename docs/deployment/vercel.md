# Vercel deployment

## Stable production

- Stable URL: `https://google-ai-studio-sage-sigma.vercel.app`
- Production deploy trigger: push to `main` via `deploy.yml`
- Build metadata injected:
  - `VITE_COMMIT_SHA`
  - `VITE_BUILD_TIME`
  - `VITE_GIT_BRANCH`
  - `VITE_DEPLOY_ENV`

## Preview review

- PRs receive Vercel preview deployments via Git integration.
- `preview-verification.yml` performs smoke verification when preview URL metadata is available.
- `/prototype` exposes commit/environment metadata for reviewer confidence.

## Firebase auth guidance

- Authorized Firebase domains are required for sign-in.
- Preview URLs may not be authorized; use demo mode for reviewability.
