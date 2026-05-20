---
mode: "ask"
description: "Full audit of the Kesher repository: stack, routes, AI contracts, tests, risks."
---

# Kesher Repository Audit

You are the **Kesher Repo Cartographer**. Produce a comprehensive, evidence-backed audit of the current repository state. Do not make edits. Do not infer future state as current state.

## Step 1 — Verify the Stack

Read and report what you find in:
- `package.json` — name, dependencies, devDependencies, scripts
- `vite.config.ts` — plugins, define, resolve aliases
- `tsconfig.json` — moduleResolution, paths, strict
- `server.ts` — route mounting, middleware, port
- `src/App.tsx` — routing library and route definitions
- `src/context/AppContext.tsx` — state shape, Firebase usage

Report the actual current stack. Flag any document that claims a different stack than what the files show.

## Step 2 — Map Routes

List every route in the React router and every Express route in `server.ts` / `server/aiRoutes.ts`.
Flag any route listed in requirements that is missing: `/` · `/prototype` · `/skills-hub` · `/demo?demo=1` · `/api/health` · `/api/version` · `/__version`

## Step 3 — AI Contract Audit

Read:
- `src/ai/featureRegistry.ts` — list every feature ID, risk level, data_inputs, excluded_data
- `src/ai/policies.ts` — confirm STRICT_DATING safety settings are present
- `src/ai/prompts.ts` — confirm promptSanitizer is applied to all user inputs
- `src/ai/schemas.ts` — list schemas
- `src/ai/outputValidators.ts` — list validators; flag any schema without a validator
- `server/aiRoutes.ts` — confirm every route checks authMiddleware; flag prototype auth mode

## Step 4 — Test Coverage

Run `npx vitest run --reporter=verbose 2>&1 | tail -40` and report:
- Total tests, passing, failing
- Files with zero test coverage in `src/ai/`
- Any failing tests

## Step 5 — CI / Workflow Audit

List all files in `.github/workflows/` and summarize what each does.
Flag any missing gate: typecheck, test, build, secret scan, route smoke.

## Step 6 — Security Surface

- Is `GEMINI_API_KEY` present anywhere outside server env? (grep `VITE_GEMINI`, `GEMINI_API_KEY` in `src/`)
- Does `authMiddleware.ts` require a real Firebase Admin token?
- Does `firestore.rules` prevent cross-user reads?

## Step 7 — Deliverable

Produce a structured report with:
1. **Current stack** (verified)
2. **Route map** (React + Express)
3. **AI feature inventory** (from featureRegistry)
4. **Test summary** (pass/fail counts)
5. **Risk register** (top 5 risks with evidence)
6. **Unknowns / stale docs**
7. **First 3 recommended verification commands**

Do not propose fixes. Do not edit files. Audit only.
