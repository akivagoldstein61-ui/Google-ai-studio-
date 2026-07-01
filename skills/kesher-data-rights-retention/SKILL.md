---
name: kesher-data-rights-retention
description: Implement Kesher export, correction, deletion, retention windows, evidence separation, and privacy-rights audit trails.
---

# Kesher Data Rights & Retention

Use this skill for privacy-rights and retention work.

## Requirements

- Export, correction, deletion, reset, and revocation requests must be user-accessible and auditable.
- Private taste, private personality, share cards, messages, safety records, and billing records need distinct retention rules.
- Taste reset must not erase safety records.
- Share revocation should cascade to recipient-visible copies.

## Acceptance

- Settings exposes data-rights actions with clear status.
- Admin tooling can verify pending, completed, and failed rights requests.
- Retention rules are documented before launch.


## Implementation Workflow
1. **Export Endpoint:** Implement a server route (`/api/data-export`) that aggregates all owner-visible data from Firestore into a JSON payload.
2. **Deletion Endpoint:** Implement a server route (`/api/delete-account`) that soft-deletes the user record, schedules hard-deletion via a Cloud Task, and archives billing/safety records.
3. **Settings UI:** Wire the export and deletion endpoints to the `SettingsScreen.tsx`.

## Manus Execution Directive
- **Capability:** `web_development`
- **Connector:** Firebase
- **Action:** Implement the export and deletion server routes, ensuring safety and billing records are properly archived during deletion.
