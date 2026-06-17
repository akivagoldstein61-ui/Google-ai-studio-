# Replit Preview Evidence

Replit is a workshop and QA surface only. GitHub remains code truth, and
Vercel remains the deployment authority for preview/production evidence.

## Current Evidence

- `https://google-ai-studio-5.replit.app/` returned Replit's public app 404
  page on June 17, 2026, so it is not yet valid external parity evidence.
- `https://google-ai-studio-5.replit.app/mobile/` also returned Replit's
  public app 404 page on June 17, 2026.
- `https://b8e151ee-e61c-47d6-b5b6-c021ec075a3b-00-2y0qfvn0rk27z.pike.replit.dev/daily`
  is reachable, but unauthenticated requests redirect through ReplShield to
  Replit's `silent-auth` page. The same result was observed for `/api/health`
  and `/api/version`; `/skills` showed the same private-dev ReplShield behavior.
- Authenticated Replit UI evidence from June 17, 2026 shows the workspace
  preview rendering `/daily` and the publish panel offering the
  `google-ai-studio-5.replit.app` public domain. This is useful workshop
  evidence, but it does not replace external smoke verification.

## Parity Gate

Replit parity remains blocked until one of these evidence packets exists:

- A public Replit App URL that serves Kesher routes without Replit login.
- Authenticated screenshot/video evidence clearly labeled as authenticated-only,
  with branch, commit SHA, build command, run command, test results, and route
  screenshots.

Public parity must prove:

- `/`, `/daily`, `/skills`, `/skills-hub`, `/prototype`, and `/mobile/` render
  Kesher pages, not Replit platform, auth, or shield pages.
- `/api/health`, `/api/version`, `/__version`, and an unknown `/api/*` route
  return JSON.
- Protected unauthenticated API routes return JSON `401`, `403`, or `400`, not
  HTML and not a platform invocation failure.
- The source branch and commit SHA tie back to GitHub.

## Commands

Run these inside Replit before publishing:

```bash
npm ci
npm run typecheck
npm run test
npm run build
```

Run this externally after publishing a public Replit URL:

```bash
npm run smoke:replit -- https://google-ai-studio-5.replit.app
```

The smoke command intentionally fails on ReplShield, `silent-auth`, Replit
platform HTML, API HTML, and non-JSON API responses.

## Replit Agent Prompt

> Publish this Kesher Replit workspace as a public preview suitable for external
> smoke testing. Use GitHub as the source of truth from `main` or the active PR
> branch only. Do not import from Vercel output and do not change production
> Firebase data, Vercel settings, secrets, domains, billing, auth mode,
> Firestore rules, moderation thresholds, or AI safety thresholds. Run `npm ci`,
> `npm run typecheck`, `npm run test`, and `npm run build`. Report the public
> URL, source branch, commit SHA, build command, run command, test results, and
> screenshots for `/`, `/daily`, `/skills`, `/skills-hub`, `/prototype`, and
> `/mobile/`.
