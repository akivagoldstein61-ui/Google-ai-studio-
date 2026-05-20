---
name: kesher-voice-integration
description: "Implement Kesher voice features with push-to-talk Gemini Live sessions, ephemeral token authentication, transcript visibility, accessibility support, and no emotional companion or auto-send behavior."
---

# Kesher Voice Integration

Use this skill when adding or reviewing voice AI flows.

## Workflow

1. Keep voice utility-focused: safety guidance, accessibility navigation, date-planning support, or rehearsal with explicit user control.
2. Use short-lived ephemeral tokens issued by the authenticated backend.
3. Require microphone consent, a listening indicator, live transcript, mute, and end controls.
4. Do not create persistent voice memory or parallel conversation archives.
5. Confirm every app action before execution; never auto-send messages.
6. Run Hebrew voice QA and accessibility checks before broad rollout.

## Prototype Surface

The Vercel prototype page should show the token route, session lifecycle, consent checklist, feature tiers, and forbidden behaviors.

## Stop Points

Stop before enabling always-listening mode, voice cloning, emotional companion framing, unconfirmed app actions, or production voice tokens without security review.
