---
name: kesher-release-readiness
description: Implement Kesher CI, smoke tests, deployment checklist, rollback, preview verification, monitoring, and launch blocker tracking.
---

# Kesher Release Readiness

Use this skill to decide whether Kesher can ship.

## Requirements

- Track launch gates for auth, discovery, match lifecycle, safety ops, AI runtime, payments, notifications, data rights, and observability.
- CI must run typecheck, unit tests, AI contract tests, privacy scans, and build checks.
- Preview verification should cover public, demo, and authenticated routes.
- Rollback and incident response steps must be documented before production promotion.

## Acceptance

- AI Ops or release dashboards show blocker status.
- Required checks are linked from PR/release documentation.
- Production promotion is blocked when P0 gates are missing.
