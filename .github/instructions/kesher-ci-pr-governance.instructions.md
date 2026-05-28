---
applyTo: ".github/**,scripts/**,package.json"
---

# Kesher CI / PR Governance Conventions

## NPM Scripts Are the Source of Truth

Never replace npm scripts with IDE-only habits or undocumented one-liners.
CI runs npm scripts; if a script doesn't exist in `package.json`, it is not enforced.

| Script | Purpose |
|--------|---------|
| `npm run lint` | TypeScript + ESLint |
| `npm run typecheck` | `tsc --noEmit` — 0 errors required |
| `npm run test` | Vitest — all tests must pass |
| `npm run test:rtl` | RTL snapshot tests |
| `npm run test:schemas` | Structured output schema tests |
| `npm run redteam:personality` | Adversarial AI prompt fixtures |
| `npm run scan:forbidden-fields` | Disallowed field access patterns |
| `npm run scan:logs` | PII/secret patterns in log statements |
| `npm run build` | Vite production build — must succeed |
| `npm run smoke:deployment` | Post-deploy route smoke checks |

## Pre-Commit Gate (run all three)

```bash
npx vitest run
npx tsc --noEmit
npx vite build
```

All three must pass before any commit is pushed. Do not use `--no-verify`.

## Branch and PR Rules

- Branch from `main`; name pattern: `feat/<scope>`, `fix/<scope>`, `chore/<scope>`, `docs/<scope>`
- One logical slice per PR — no "build the whole app" PRs
- Every PR must include: changed files list, behavior before/after, test evidence, rollback notes
- Risky changes require explicit human approval before merge (see Approval Gates in `copilot-instructions.md`)
- Do not merge, deploy, or publish directly; humans review and approve

## GitHub Actions Workflows (`.github/workflows/`)

Existing workflows to preserve:
- `ci.yml` — test + typecheck + build gate
- `deploy.yml` — Vercel production deploy
- `preview-verification.yml` — Vercel preview smoke checks
- `schema-validation.yml` — AI schema tests
- `redteam-personality.yml` — adversarial AI fixtures
- `personality-ci.yml` — personality feature CI
- `rtl-snapshots.yml` — RTL snapshot tests

Do not delete or disable any workflow without explicit approval.
Do not add a `--no-verify` flag or skip steps to make a failing workflow pass.

## Routes to Verify After Every Deploy

```bash
# GET 200 on all of:
/
/prototype
/skills-hub
/demo?demo=1
/api/health
/api/version
/__version
```

`npm run smoke:deployment` should cover these. If it doesn't, file a bug.

## Deployment Evidence

Every deploy must produce:
- Build artifact with fingerprint
- `/api/version` or `/__version` response confirming the deployed commit
- Smoke check log showing routes above responded 200

Do not mark a deploy as successful without this evidence.

## Secret Scanning

- Client bundle must not contain `GEMINI_API_KEY`, Firebase service account JSON, or any server secret
- `npm run scan:forbidden-fields` and `npm run scan:logs` must pass before merge
- GitHub secret scanning alerts must be resolved before the PR is merged

## Rollback Path

Every PR must document how to revert: either a revert commit, a Vercel rollback step, or a feature flag flip.
Do not ship a change with no documented rollback path.
