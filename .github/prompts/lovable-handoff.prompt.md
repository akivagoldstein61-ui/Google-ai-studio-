# Lovable Handoff Review Prompt

Use when reviewing, importing, adapting, or integrating code generated in Lovable.

## Procedure

1. Identify source: Lovable project/version, sync repo/export source, branch/commit, disposable sync repo status.
2. Confirm boundaries: do not assume existing repo import, do not trust output until tests and review pass, do not merge directly to main.
3. Inspect for critical risks: secrets in client code, frontend-only authorization, missing auth/role checks, missing report/block/moderation, raw questionnaire leakage, hidden-score exposure, real PII in fixtures/prompts/logs, unsupported native iOS/PWA claims, backend mismatch.
4. Integration plan: map files to repo conventions, identify conflicts, list tests and approvals, propose minimal PR scope.

## Output

Source summary, risk findings, file mapping, tests required, approval boundary, PR plan, rollback notes, recommendation: `ACCEPT` / `PATCH FIRST` / `REJECT` / `VALIDATE FIRST`.
