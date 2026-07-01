---
name: kesher-israeli-privacy
description: "Review Kesher implementation choices against Israeli privacy-sensitive data guardrails for personality, observance, relationship intent, compatibility reflection, AI inference, export, correction, deletion, and transfer-abroad risk. Use for implementation review only, not legal advice."
---

# Kesher Israeli Privacy

Use this skill when product or code changes affect sensitive Kesher data. This is implementation guidance, not legal advice; escalate counsel questions instead of inventing legal certainty.

## Workflow

1. Classify the data involved before editing: personality answers/scores, observance, relationship intent, orientation-adjacent profile data, compatibility reflections, precise location, reports, safety records, and private taste are high-risk.
2. Check the relevant visibility layer using `$kesher-personality-visibility`: public browse, private owner, mutual consent, or system-only.
3. Require explicit, separate consent for personality interpretation, permissioned sharing, mutual reflection, and private taste learning.
4. Preserve access, correction, deletion, export, reset, and revoke paths in settings or Trust Hub.
5. Keep raw answers, raw scores, private taste, private messages, exact locations, prompts, generated sensitive prose, tokens, and secrets out of logs, analytics, browser storage exports, static bundles, and public APIs.
6. Treat cross-border processing, Vertex/Gemini runtime choices, and production auth changes as stop points that need explicit approval.

## Acceptance Checks

- Sensitive fields do not appear in `dist/`, browser logs, AI metadata logs, or public skill exports.
- Server routes enforce the owner or mutual-consent boundary for protected reads/writes.
- User-facing copy uses uncertainty and rights language, not fixed labels or legal overclaims.
- Firebase rules, production auth mode, deployment settings, billing, and credentials are unchanged unless explicitly requested.


## Implementation Workflow
1. **Data Model Audit:** When adding a new data field to Firestore, evaluate it against the Israeli Privacy Protection Law (PPL) definition of "sensitive information".
2. **Consent Verification:** Ensure explicit, informed consent is gathered before collecting the data (refer to `kesher-consent-ux`).
3. **Retention Policy:** Define a clear TTL (Time-To-Live) for the data in the Firestore security rules.

## Manus Execution Directive
- **Capability:** `technical_writing`, `web_development`
- **Action:** Audit all new data models for PPL compliance and document the retention policy before implementation.
