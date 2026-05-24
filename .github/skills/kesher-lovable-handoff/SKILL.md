# Kesher Lovable Handoff Skill

Skill ID: `LOV-KESHER-006`

## Purpose

Review and integrate Lovable-originated Kesher code through GitHub PR governance.

## Trigger

Use when Lovable code is exported or synced, generated code is proposed for canonical repo integration, or a PR includes Lovable-originated changes.

## Procedure

1. Treat Lovable output as untrusted generated code.
2. Confirm the code was not pushed directly to main.
3. Do not assume Lovable can import the existing repo.
4. Map generated files to existing repo conventions.
5. Inspect for secrets, frontend-only authorization, missing report/block/moderation enforcement, raw questionnaire leakage, hidden-score exposure, unsupported native mobile claims, and backend mismatch.
6. Require build/lint/typecheck, secret scan, auth/role negative tests, messaging block/report tests if relevant, AI privacy evals if relevant, deployment smoke if relevant.

## Output

Source summary, risk table, file mapping, test checklist, approval boundary, PR recommendation: `ACCEPT` / `PATCH FIRST` / `REJECT` / `VALIDATE FIRST`.
