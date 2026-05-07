# GitSpark deployment

Use this guide to connect this repository to GitSpark.

## 1) Connect repository

1. In GitSpark, create a new project from GitHub.
2. Select this repository from your GitHub account.
3. Choose the deployment runtime mode below.

## 2) Runtime mode

### Recommended: Node / fullstack

- Install command: `npm ci`
- Build command: `npm run build`
- Start command: `npm run start` (`node dist/server.cjs`)

This mode is required when you need Express API routes like `/api/ai/*` and `/api/health`.

### Fallback: static site

- Install command: `npm ci`
- Build command: `npm run build`
- Publish/output directory: `dist`

Static mode serves the frontend only. Express routes (`/api/ai/*`, `/api/health`) are not available.

## 3) Environment variables (server-side only)

Required:

- `GEMINI_API_KEY`

When strict auth is enabled:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `APP_URL`

Do not expose these values as `VITE_*` browser variables.

## 4) Quality gates before deploy

Keep GitHub Actions checks green before promoting deploys:

- `npm run typecheck`
- `npm run scan:forbidden-fields`
- `npm run scan:logs`
- `npm run test`
- `npm run test:schemas`
- `npm run test:scoring`
- `npm run test:rtl`
- `npm run build`

## 5) Post-deploy verification

After deploy, verify:

- `/api/health`
- AI fallback/no-key behavior on a safe path
- Frontend routes: `/`, `/prototype`, `/demo?demo=1`
