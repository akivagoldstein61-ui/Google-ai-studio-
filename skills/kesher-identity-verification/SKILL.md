---
name: kesher-identity-verification
description: Implement Kesher production auth, profile verification signals, anti-impersonation review, pause/reactivation, and account rights flows.
---

# Kesher Identity Verification

Use this skill when turning Kesher from demo auth into a production identity surface.

## Requirements

- Keep Firebase Auth as the primary identity boundary unless a migration is approved.
- Store verification status as a user-visible signal, not raw document evidence.
- Separate identity evidence from discovery, private taste, personality, and match explanations.
- Support pause, reactivation, account export, correction, and deletion request states.
- Require human review for impersonation, suspicious identity reuse, and verification appeals.

## Acceptance

- Onboarding cannot enter discovery until required profile and terms gates are complete.
- Verification status is recoverable and auditable.
- Account deletion preserves only legally required safety/evidence records.


## Implementation Workflow
1. **Provider Integration:** Integrate a third-party ID verification provider (e.g., Stripe Identity or Persona).
2. **Webhook Handling:** Implement a webhook handler in `server/trustRoutes.ts` to receive verification results.
3. **Status Update:** Update the user's verification status in Firestore upon successful verification.

## Manus Execution Directive
- **Capability:** `web_development`
- **Action:** Implement the ID verification webhook handler and update the user's status in Firestore.
