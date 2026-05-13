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
- `/prototype` visibly links to `/skills-hub`.
- `/skills-hub` exposes all skill modules registered in the prototype without requiring Firebase auth.
- `/api/health`, `/api/version`, and `/__version` are Vercel Functions that return JSON deployment/runtime metadata.
- The SPA fallback rewrite excludes `/api/*`; unmatched API routes return JSON from a Vercel Function catch-all instead of `index.html`.
- `/downloads/kesher-personality-skills.zip` serves the bundled `skills/` archive.

## Firebase auth guidance

- Authorized Firebase domains are required for sign-in.
- Preview URLs may not be authorized; use demo mode for reviewability.
