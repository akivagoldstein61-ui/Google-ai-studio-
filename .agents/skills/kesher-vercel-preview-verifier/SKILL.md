---
name: kesher-vercel-preview-verifier
description: "Use when verifying Kesher Vercel builds, preview routes, deployment smoke tests, API fallbacks, or production reachability."
---

# Kesher Vercel Preview Verifier

## When To Use

Use after route, API, build, or deployment-sensitive changes, especially `/skills`, `/skills-hub`, `/api/*`, and demo mode.

## When Not To Use

Do not mutate production Vercel settings, secrets, domains, billing, or environment variables without explicit approval.

## Workflow

1. Read `AGENTS.md`.
2. Run local build and smoke scripts.
3. Check Vercel project/deployment status and build logs where available.
4. Verify production remains reachable and preview routes work.
5. Record any unexplained deployment failure.

## Files To Inspect

- `vercel.json`
- `.vercelignore`
- `api/[...path].ts`
- `api/*`
- `server.ts`
- `scripts/smoke-deployment.mjs`
- `scripts/check-vercel-upload.mjs`

## Commands

- `npm run build`
- `npm run check:vercel-upload`
- `npm run smoke:deployment`
- `curl -fsS <preview>/api/health`

## Definition Of Done

Preview build is ready, `/skills-hub`, `/skills`, `/demo?demo=1`, known API routes, and unknown API JSON 404 behavior are verified.

## Safety Checks

No production secret changes, no public secret logs, no unexplained failed build logs.

## References

- `skills/kesher-personality-delivery/SKILL.md`
- Vercel plugin skills: `vercel:vercel-api`, `vercel:verification`, `vercel:deployments-cicd`
