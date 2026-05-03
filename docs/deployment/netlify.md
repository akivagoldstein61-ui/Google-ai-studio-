# Netlify mirror

Netlify is configured as a **static mirror** of the frontend build (`dist`).

## Scope

- Build command: `npm run build`
- Publish directory: `dist`
- SPA fallback to `index.html`
- Security headers mirror Vercel defaults

## Important limitations

- Netlify in this repo is **not** a full Express runtime.
- API/Express routes require Netlify Functions (not implemented here).
- Firebase sign-in needs authorized Netlify domain if auth is used.
- For stakeholder review on Netlify, prefer demo mode (`/demo?demo=1`).
