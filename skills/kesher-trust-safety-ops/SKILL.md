---
name: kesher-trust-safety-ops
description: Build Kesher trust and safety operations, including report queue, moderation summaries, scam triage, photo checks, appeals, escalation, and audit logs.
---

# Kesher Trust & Safety Ops

Use this skill for member protection and operator workflows.

## Requirements

- Reports, blocks, unmatches, appeals, moderation summaries, and support contacts must create auditable records.
- AI moderation may summarize and classify but never make final enforcement decisions.
- Separate claims, evidence, AI summaries, human notes, actions, and appeal outcomes.
- Keep safety evidence isolated from recommendation, private taste, and match explanation systems.

## Acceptance

- Operators can see status, severity, assignment, last action, and evidence retention state.
- Scam/payment requests and coercive messages can be escalated.
- Appeal and review decisions are idempotent and logged.


## Implementation Workflow
1. **Report Queue:** Implement the backend logic to aggregate user reports into a review queue.
2. **Operator Dashboard:** Implement a secure, internal dashboard for operators to review reports and take action.
3. **Audit Logging:** Ensure all operator actions (e.g., warnings, bans) are logged immutably.

## Manus Execution Directive
- **Capability:** `web_development`
- **Action:** Implement the operator dashboard and report queue backend logic.
