---
name: kesher-notifications
description: Implement Kesher notification preferences and delivery for matches, messages, safety events, date reminders, and consent/share changes.
---

# Kesher Notifications

Use this skill when adding email, push, or SMS delivery.

## Requirements

- Notification categories must be preference-managed and revocable.
- Safety, consent, and account-rights notifications take priority over engagement nudges.
- Never disclose sensitive match, personality, report, or safety details in notification previews.
- Record delivery attempts, failures, unsubscribes, and provider callbacks.

## Acceptance

- Members can change notification categories from settings.
- Delivery providers are called server-side only.
- Notification copy is calm, non-pressuring, and compatible with Hebrew-first localization.
