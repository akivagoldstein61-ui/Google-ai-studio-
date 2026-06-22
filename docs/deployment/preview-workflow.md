# Preview workflow

1. Open a pull request to `main`.
2. CI (`ci.yml`) runs typecheck, scans, tests, build, and bundle secret scan.
3. Vercel preview deploy is created by Git integration.
4. `preview-verification.yml` attempts to discover the Vercel preview URL from deployment/status metadata.
5. If URL is discovered, `scripts/smoke-deployment.mjs` verifies root, `/prototype`, `/skills-hub`, commit metadata, demo banner route, `/api/health`, `/api/version`, `/__version`, and that unmatched `/api/*` routes return JSON instead of the SPA shell.
6. The workflow then runs `scripts/api-smoke.mjs` against the same preview URL with `EXPECTED_COMMIT_SHA` set to the PR head SHA. This fails the PR if `/api/version` or `/__version` does not tie the preview back to GitHub, or if auth-gated routes return HTML/plain-text platform errors instead of JSON `401`, `403`, or `400`.
7. If URL cannot be discovered on first pass, workflow warns (does not fail) and requests integration verification.

## Reviewer guidance

- For Firebase unauthorized-domain contexts, use `/demo?demo=1` or `/demo`.
- Use `/prototype` to confirm running commit and environment metadata.
- Use `/skills-hub` to review all visible Kesher skill modules without signing in.
- Use `npm run smoke:api -- <preview-url>` when manually checking API routing. Protected routes should return JSON auth/validation responses, never the SPA shell or `FUNCTION_INVOCATION_FAILED`.
- Replit is workshop/QA evidence only. Use `npm run smoke:replit -- <public-replit-url>` only after publishing a public Replit App URL; private `*.pike.replit.dev` URLs that redirect to ReplShield or `silent-auth` are not external parity evidence.
