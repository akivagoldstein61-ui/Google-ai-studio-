# Personality Feature Verification Matrix

## Local Checks

- Type/schema changes: run `npm run check`.
- Server route changes: run targeted route smoke checks when possible.
- Output validator changes: run validator tests and add cases for Hebrew/English prohibited language.
- UI changes: use Browser Use on desktop and mobile-ish viewport.
- Shared AI contract changes: inspect `src/ai/featureRegistry.ts`, `src/ai/schemas.ts`, `src/ai/policies.ts`, `src/ai/prompts.ts`, and `src/ai/outputValidators.ts`.

## Review Checks

- Confirm no raw answers, raw scores, private taste, private messages, or exact location leak into user-facing prose.
- Confirm consent is enforced server-side for compatibility reflection and sharing.
- Confirm fallback states do not invent insights.
- Confirm docs/ADR updates when governance behavior changes.

## Release Checks

Use GitHub/CircleCI/CodeRabbit/deploy plugins only when the user requests or approves those external actions. Report what ran and what remains unverified.
