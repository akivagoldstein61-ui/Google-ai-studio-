---
name: kesher-permissioned-sharing
description: Implement and review Kesher's permissioned personality sharing flows: previewable share cards, recipient/scope selection, expiry, revoke, audit copy, and mutual-consent disclosure. Use when building personality share-card UI, share/revoke APIs, privacy settings, trust hub controls, or data models for temporary personality access.
---

# Kesher Permissioned Sharing

Use this skill when personality insights move from owner-only to another person by explicit user action.

## Required Flow

1. Preview: show exactly what will be shared before any recipient can access it.
2. Scope: let the owner choose summary-only, strengths/watch-outs, communication notes, or a specific compatibility reflection. Never include raw answers, raw scores, hidden negatives, or private taste.
3. Recipient: require a specific match/user or approved context. Avoid broad public links.
4. Duration: default to temporary access with a clear expiry.
5. Confirm: restate recipient, scope, expiry, and revoke behavior.
6. Revoke: provide a visible revoke path and explain that revocation stops future in-app access but cannot erase screenshots or memory.
7. Audit: record share, view, expiry, and revoke events without storing unnecessary sensitive prose in analytics.

Read `references/share-card-contract.md` before implementing persistence, schemas, or UI.
Read `$kesher-personality-research/references/privacy-consent-visibility-sharing.md` before changing audience labels, consent steps, revoke copy, or analytics fields.

## Guardrails

- Stop before changing auth, Firebase rules, database schema, migrations, production config, or share/revoke persistence without explicit approval.
- Use server-side authorization for every share-card read.
- Do not allow share cards to become raw psychometric dossiers.
- Keep generated language non-clinical and non-deterministic.

## Acceptance Checks

- A user cannot share without preview and explicit confirmation.
- A non-recipient cannot fetch the shared card.
- Expired or revoked cards are inaccessible.
- The shared card names its limits: summary-only, reflective, not a score.
- Analytics excludes raw answers, private taste, and private messages.
- Revocation copy says it blocks future in-app access and does not promise to erase screenshots or memory.

Use `$kesher-personality-visibility` for surface policy and `$kesher-personality-delivery` for release checks.
