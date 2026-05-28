# Preview workflow

1. Open a pull request to `main`.
2. CI (`ci.yml`) runs typecheck, scans, tests, build, and bundle secret scan.
3. Vercel preview deploy is created by Git integration.
4. `preview-verification.yml` attempts to discover the Vercel preview URL from deployment/status metadata.
5. If URL is discovered, `scripts/smoke-deployment.mjs` verifies root, `/prototype`, `/skills-hub`, commit metadata, demo banner route, `/api/health`, `/api/version`, `/__version`, and that unmatched `/api/*` routes return JSON instead of the SPA shell.
6. If URL cannot be discovered on first pass, workflow warns (does not fail) and requests integration verification.

## Reviewer guidance

- For Firebase unauthorized-domain contexts, use `/demo?demo=1` or `/demo`.
- Use `/prototype` to confirm running commit and environment metadata.
- Use `/skills-hub` to review all visible Kesher skill modules without signing in.
