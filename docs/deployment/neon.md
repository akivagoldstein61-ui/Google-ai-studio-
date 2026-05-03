# Neon deployment model

Neon is used for **Postgres lifecycle only** (branching, isolation, and data promotion). Neon is **not** frontend hosting.

## Modes

- `none`: no Postgres dependency in this environment.
- `mock`: frontend runs with mock/local-only data.
- `dev branch`: shared development DB branch.
- `preview branch`: per-PR isolated DB branch.
- `production branch`: protected production DB branch.

## Guardrails

- Protect the production branch from direct preview writes.
- Keep preview branches isolated and disposable.
- Never expose connection strings in client bundles.
- Keep `DATABASE_URL` and `DIRECT_DATABASE_URL` server-only.

## Preview branch naming

Use:

- `preview/pr-<number>`

Example: `preview/pr-123`
