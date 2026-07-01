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


## Implementation Workflow
1. **Preference UI:** Implement the `NotificationPreferencesScreen.tsx` to allow users to toggle notification classes.
2. **Delivery Routing:** Implement the backend logic in `server/notificationRoutes.ts` to route notifications based on user preferences and priority class.
3. **Provider Integration:** Integrate SendGrid (email) and Firebase Cloud Messaging (push) for delivery.

## Manus Execution Directive
- **Capability:** `web_development`
- **Action:** Implement the notification routing logic and integrate with SendGrid and FCM.
