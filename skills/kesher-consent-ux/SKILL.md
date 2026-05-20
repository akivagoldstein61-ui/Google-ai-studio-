---
name: kesher-consent-ux
description: "Design and review Kesher consent UX for personality, AI, sharing, private taste, and Trust Hub flows. Use when changing consent gates, sensitive toggles, grants/revocation copy, consent history, onboarding or settings consent surfaces, or anti-dark-pattern behavior."
---

# Kesher Consent UX

Use this skill when a Kesher flow asks for permission, exposes a sensitive toggle, or lets a user share personality or private preference data.

## Workflow

1. Inspect the surface before editing: `src/features/skills/ConsentUxSkill.tsx`, `src/features/settings/AITrustHub.tsx`, `src/features/settings/PrivateTasteProfile.tsx`, `src/features/settings/PersonalityVisibilitySettings.tsx`, and the relevant server route.
2. Keep each sensitive action separately consented. Do not bundle personality assessment, AI interpretation, sharing, private taste, safety, or analytics into one broad approval.
3. Include the required notice elements in user-facing copy: voluntary action, purpose, controller identity or app owner, recipients or audience, refusal consequence, rights path, and AI involvement if applicable.
4. Default sensitive toggles to off. Require an explicit action to grant consent.
5. Put revoke, reset, export, and delete controls near the feature configuration path.
6. Make revocation no harder than granting. Avoid confirm-shaming, scarcity, countdowns, guilt copy, hidden opt-outs, or repeated prompts after refusal.
7. Do not log consent text with prompts, messages, raw answers, exact locations, or other PII.

## Acceptance Checks

- Consent copy says who can see or process the data.
- The user can decline without losing core matching or safety access.
- Revocation is visible and reachable in the same product area.
- UI state after revocation cannot still show shared personality content.
- Tests or manual QA cover grant, decline, revoke, and fallback states.
