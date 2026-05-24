# Security-Sensitive Path Instructions

Apply to paths touching auth, database rules, migrations, server routes, AI prompts, moderation, deployment, secrets, billing, storage, or admin tools.

## Procedure

1. Identify affected trust boundary.
2. Add or preserve server/data-policy enforcement.
3. Add negative tests for unauthorized access.
4. Check for secret exposure.
5. Preserve auditability.
6. Document rollback or mitigation.
7. Require human approval for trust-sensitive changes.

Every PR touching these paths must include safety/privacy impact, affected data, tests run, negative tests, approval needed, and rollout/rollback notes.
