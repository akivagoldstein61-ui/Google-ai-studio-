---
name: kesher-dark-pattern-audit
description: "Audit Kesher consent, privacy, personality, premium, onboarding, and sharing UI for dark patterns and coercive mechanics. Use when reviewing sensitive toggles, consent flows, revocation, account deletion, premium boundaries, or discovery pacing."
---

# Kesher Dark Pattern Audit

Use this skill before shipping any Kesher UI that could pressure a user into sharing, buying, continuing, disclosing, or accepting AI processing.

## Workflow

1. Inspect the proposed user path from entry point to exit, including the decline path, revoke path, reset/delete path, and fallback state.
2. Check the six risk families: overloading, skipping, stirring, obstructing, fickle controls, and left-in-the-dark wording.
3. Confirm that default states are neutral or off for sensitive choices.
4. Keep decline, revoke, export, delete, and safety controls available without premium gating.
5. Avoid shame, urgency, scarcity, social pressure, hidden friction, confusing toggles, repeated prompts after refusal, and optimistic copy that hides consequences.
6. For discovery and pacing, prefer finite calm surfaces and dismissible nudges over infinite loops or forced pauses.

## Acceptance Checks

- The user can say no in one clear path without losing core matching or safety features.
- Granting and revoking consent require comparable effort.
- Copy is short enough to understand and names the data, purpose, and audience.
- Premium flows do not imply compatibility scores or degrade core privacy/safety access.
- QA covers default-off, decline, revoke, and repeated-entry behavior.
