# Rollback runbook

## Vercel rollback

1. Open Vercel project deployments.
2. Identify last healthy production deployment tied to `main`.
3. Promote/rollback to that deployment.
4. Verify `/prototype` commit marker and environment fields.
5. Run smoke checks against the stable URL.

## Data safety checks

- Ensure preview DB branches are not promoted accidentally.
- Confirm production branch protections remain enabled.
- Verify no new secret patterns are present in bundle artifacts.

## Communication

- Post rollback commit/deployment references in incident channel.
- Record root cause and follow-up actions in issue tracker.
