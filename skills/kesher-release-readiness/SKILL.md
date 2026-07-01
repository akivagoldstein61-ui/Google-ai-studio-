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


## Implementation Workflow
1. **Test Execution:** Run the full test suite (`npm run test`) and type checks (`npx tsc --noEmit`).
2. **Completion Plan Audit:** Read `src/product/completionPlan.ts` and verify that the feature's status accurately reflects its implementation state.
3. **Deployment Verification:** After pushing to the production branch, use the Vercel MCP `get_deployment` or `list_deployments` tools to verify the build succeeded and retrieve the preview URL.

## Manus Execution Directive
- **Capability:** `shell`, `web_development`
- **Connector:** Vercel MCP
- **Action:** Execute tests, audit completion plan, and verify deployment via Vercel MCP before reporting a feature as "live".
