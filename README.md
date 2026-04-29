<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/bd65b2e7-1010-405f-8e3a-13786c313892

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
- If it detects a preview/branch URL, it shows a banner and redirects the user to the stable production URL before any sign-in is attempted.
- If `auth/unauthorized-domain` is raised for any other reason (e.g. an unlisted custom domain), the app redirects to the canonical production URL silently instead of showing a cryptic error.

To change the canonical (production) URL, update `CANONICAL_ORIGIN` at the top of
`src/features/auth/WelcomeScreen.tsx` and add the new URL to `AUTHORIZED_HOSTNAMES`.

---

## Deployment options

### Option 1 — Vercel (current setup)

The repository includes a `vercel.json` that configures the SPA rewrite rule and security headers. Simply connect the repository to a Vercel project and deploy.

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

### Option 3 — Netlify

1. Connect the repository to a Netlify project.
2. Set **Build command** to `vite build` and **Publish directory** to `dist`.
3. Add a `public/_redirects` file with `/* /index.html 200` for SPA routing.
4. Add the Netlify domain to Firebase's authorized domains list.

### Option 4 — Cloudflare Pages

1. Connect the repository; set build command to `vite build` and output to `dist`.
2. Add a `_routes.json` or configure "Functions" routing so all paths serve `index.html`.
3. Add the `*.pages.dev` domain to Firebase's authorized domains list.

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Gemini API key from Google AI Studio |
| `FIREBASE_PROJECT_ID` | Server only | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Server only | Firebase service account email |
| `FIREBASE_PRIVATE_KEY` | Server only | Firebase service account private key |
| `APP_URL` | Server only | Canonical URL of the deployment |

