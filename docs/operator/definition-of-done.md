# Definition Of Done

## Baseline Checks
- `npm ci` completes from `package-lock.json`.
- `npm run lint` passes.
- `npm run test` passes.
- `npm run build` passes.
- `/api/health` returns `{ "status": "ok" }` during local smoke testing.

## Safety Checks
- `GEMINI_API_KEY` is not referenced in Vite client config or client code.
- Missing Gemini key responses use documented safe fallbacks and do not expose raw error messages to clients.
- AI route metadata does not include prompts, user messages, exact locations, bearer tokens, API keys, or Firestore document payloads.
- Auth, Firestore rules, database schema, deployment config, billing, and external credentials are unchanged unless explicitly approved.

## Feature Checks
- Any changed feature appears in `docs/operator/feature-inventory.md`.
- Any AI prompt/schema/model change appears in `docs/ai/prompt-contracts.md`.
- Any deployment or env var change appears in `docs/operator/deployment-readiness.md`.
- User-facing AI outputs remain draft/recommendation/reflection only; no autonomous sends, score/destiny claims, clinical diagnoses, attractiveness scoring, or hidden private-signal disclosure.

## PR Checks
- PR template is completed.
- CI is green.
- Remaining risks are either fixed, documented in `docs/operator/risk-register.md`, or explicitly deferred.
