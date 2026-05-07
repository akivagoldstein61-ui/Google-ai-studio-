<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/bd65b2e7-1010-405f-8e3a-13786c313892

---

## 🚀 Prototype (always-up-to-date `main` build)

| | |
|---|---|
| **Stable prototype URL** | **<https://google-ai-studio-sage-sigma.vercel.app>** |
| **Prototype info page** | <https://google-ai-studio-sage-sigma.vercel.app/prototype> |
| **View-only demo mode** | <https://google-ai-studio-sage-sigma.vercel.app/demo?demo=1> |

Every push to `main` automatically triggers a new Vercel production deployment.  
The stable URL above always serves the latest `main` build — use it for demos, QA, and design reviews.

### How it works

1. **CI** (`.github/workflows/ci.yml`) — runs on every push to `main` and on every PR:
   - TypeScript type-check (`npm run typecheck`)
   - Forbidden-field and log scans
   - Personality smoke/schema/scoring/RTL tests
   - `npm run build` (injects deployment metadata)
   - Client bundle secret scan on `dist/`
   - Uploads `dist/` as a build artifact
2. **Deploy** (`.github/workflows/deploy.yml`) — runs on push to `main` only:
   - Calls `vercel build --prod` then `vercel deploy --prebuilt --prod`
   - Uses Vercel CLI authenticated via repository secrets
   - Injects build markers (`VITE_COMMIT_SHA`, `VITE_BUILD_TIME`, `VITE_GIT_BRANCH`, `VITE_DEPLOY_ENV`)
3. **Preview verification** (`.github/workflows/preview-verification.yml`) — runs on PRs:
   - Discovers Vercel preview URL from deployment metadata when available
   - Runs smoke checks against preview root, `/prototype`, and `/demo?demo=1`

### Required GitHub repository secrets

Go to **Settings → Secrets and variables → Actions** and add:

| Secret | Where to get it |
|---|---|
| `VERCEL_TOKEN` | Vercel dashboard → Account → Tokens |
| `VERCEL_ORG_ID` | `vercel link` output or Project → Settings |
| `VERCEL_PROJECT_ID` | `vercel link` output or Project → Settings |

### Optional runtime environment variables (set in Vercel dashboard)

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Gemini API key from Google AI Studio |
| `FIREBASE_PROJECT_ID` | Server only | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Server only | Firebase service account email |
| `FIREBASE_PRIVATE_KEY` | Server only | Firebase service account private key |
| `APP_URL` | Server only | Canonical URL of the deployment |

> **Never commit secrets to the repository.** Set them in Vercel's environment variable UI or as GitHub Actions secrets.

---

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Firebase Auth – Fixing `auth/unauthorized-domain`

Firebase Authentication only allows sign-in from domains that are explicitly listed in the Firebase Console. Any Vercel preview URL or custom domain that is not in that list will throw `auth/unauthorized-domain`.

### Permanent fix (required)

1. Open [Firebase Console](https://console.firebase.google.com/) → select project **gen-lang-client-0904321862**.
2. Go to **Authentication → Settings → Authorized domains**.
3. Add **every** domain users will access the app from:
   - `google-ai-studio-sage-sigma.vercel.app` ← production URL (must be here)
   - Any custom domain you own
4. Make sure **Google** is enabled under **Authentication → Sign-in method**.

### Why Vercel preview URLs break auth

Every branch deploy on Vercel gets a unique subdomain (e.g. `google-ai-studio-git-cop-1faa9e-….vercel.app`). These change with each deployment so they cannot all be pre-registered.

**The app now handles this automatically:**

- On mount, the sign-in screen checks whether it is running on an authorized hostname.
- If it detects a preview/branch URL, it shows a banner with two safe actions:
  - open canonical production URL for sign-in
  - continue in view-only demo mode (`/demo?demo=1`)
- If `auth/unauthorized-domain` is raised for any other reason (e.g. an unlisted custom domain), the app redirects to the canonical production URL silently instead of showing a cryptic error.

To change the canonical (production) URL, update `src/lib/prototypeMode.ts`.

---

## Deployment options

### Option 1 — Vercel (current setup, CI/CD enabled)

The repository includes a `vercel.json` that configures the SPA rewrite rule and security headers. The CI/CD workflows (`.github/workflows/ci.yml` and `.github/workflows/deploy.yml`) handle automated builds and deployments on every push to `main`. See the [Prototype section](#-prototype-always-up-to-date-main-build) above for setup instructions.

**Important:** only the **Production** deployment URL needs to be in Firebase's authorized domains list. All preview/branch URLs are automatically redirected to the production URL by the app.

### Option 2 — Firebase Hosting

Firebase Hosting is the most seamless option because the project domain (`gen-lang-client-0904321862.web.app` / `firebaseapp.com`) is automatically in the authorized domains list — no manual step required.

```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # select "dist" as the public directory, enable SPA rewrite
npm run build
firebase deploy --only hosting
```

### Option 3 — Netlify (static mirror only)

1. Connect the repository to a Netlify project.
2. Netlify configuration is in `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - SPA fallback: `/* → /index.html 200`
3. Add the Netlify domain to Firebase's authorized domains list if sign-in is required.
4. For stakeholder review, prefer demo mode (`/demo?demo=1`) on Netlify.

### Option 4 — Cloudflare Pages

1. Connect the repository; set build command to `vite build` and output to `dist`.
2. Add a `_routes.json` or configure "Functions" routing so all paths serve `index.html`.
3. Add the `*.pages.dev` domain to Firebase's authorized domains list.

### Option 5 — GitSpark

Use GitSpark with either:

- **Node/fullstack mode (recommended):** `npm ci` → `npm run build` → `npm run start`
- **Static mode (fallback):** `npm ci` → `npm run build` with output directory `dist` (no Express `/api/*` routes)

See `docs/deployment/gitspark.md` for repository connection steps, server-only env vars, required quality gates, and post-deploy verification.

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Gemini API key from Google AI Studio |
| `FIREBASE_PROJECT_ID` | Server only | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Server only | Firebase service account email |
| `FIREBASE_PRIVATE_KEY` | Server only | Firebase service account private key |
| `APP_URL` | Server only | Canonical URL of the deployment |

See full deployment docs in `docs/deployment/`:

- `vercel.md`
- `netlify.md`
- `gitspark.md`
- `neon.md`
- `env-vars.md`
- `preview-workflow.md`
- `rollback.md`
