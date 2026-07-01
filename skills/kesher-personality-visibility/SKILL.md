---
name: kesher-personality-visibility
description: Design and implement Kesher's personality visibility model across browse, profile, match, settings, and chat surfaces. Use when deciding what personality-derived data can appear publicly, privately, or after mutual consent; when changing profile cards, ProfileDetail, DailyPicks, AITrustHub, PrivateTasteProfile, Settings, or visibility copy.
---

# Kesher Personality Visibility

Use this skill when a personality-related insight might become visible outside the owner-only profile.

## Visibility Layers

1. Public browse layer: self-declared values, intent, observance labels, lifestyle, interests, prompts, and profile fields only.
2. Private owner layer: inferred personality summaries, private taste, generated recommendations, data controls, and explanation history.
3. Mutual-consent layer: short share-card summaries or compatibility reflections after explicit opt-in from the required parties.
4. System-only layer: raw answers, raw scores, hidden ranking features, audit logs, moderation signals, and safety retention records.

Read `references/visibility-rules.md` when changing any UI surface that displays personality-derived data.

## Workflow

1. Identify the surface: browse card, profile detail, match sheet, chat, settings, trust hub, admin, or API.
2. Classify every displayed field into a visibility layer.
3. Remove or mask raw/inferred fields that are not allowed for that surface.
4. Add direct controls when the user can change visibility, including preview, scope, and revoke paths.
5. Keep explanations concrete and calm. Do not say the app is revealing "who they really are" or hidden compatibility.
6. Update docs/ADR if the visibility policy changes.

## Acceptance Checks

- Discovery surfaces never show model-derived trait labels by default.
- "Why This Match" explanations use whitelisted visible signals only.
- Owner-only screens clearly say private/editable/resettable.
- Mutual-consent screens clearly name who can see what and for how long.
- Admin views do not become backdoor profile-dossier views.

Use `$kesher-permissioned-sharing` for share-card implementation and `$kesher-personality-delivery` for browser validation.


## Implementation Workflow
1. **Surface Identification:** Identify the UI component being modified (e.g., `ProfileCard.tsx`).
2. **Field Classification:** Classify every data field in the component against the Four Visibility Layers (Public Browse, Private Owner, Mutual Consent, System Only).
3. **Code Audit:** Use `grep` to ensure no fields from restricted layers are being rendered.

## Manus Execution Directive
- **Capability:** `shell`, `web_development`
- **Action:** Audit UI components using `grep` to ensure strict adherence to the Four Visibility Layers before committing code.
