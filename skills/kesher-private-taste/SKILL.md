---
name: kesher-private-taste
description: Implement and review Kesher's owner-only private taste learning for personality-aware recommendations, including consent, event minimization, editable/resettable taste profile UI, recommender inputs, and no-leak explanations. Use when changing taste_profile routes, PrivateTasteProfile, recommendation feedback, more/less-like-this controls, taste schemas, or private recommendation copy.
---

# Kesher Private Taste

Use this skill to keep learned preference modeling useful, editable, and strictly private.

## Workflow

1. Inspect these surfaces before editing:
   - `src/features/settings/PrivateTasteProfile.tsx`
   - `src/services/aiService.ts`
   - `server/aiRoutes.ts`
   - `src/ai/featureRegistry.ts`
   - `src/ai/policies.ts`
   - `src/ai/schemas.ts`
   - `src/features/discovery/DailyPicksScreen.tsx`
   - `src/features/discovery/ExploreScreen.tsx`
2. Require consent before creating or updating a private taste profile.
3. Treat implicit behavior as noisy observation, not truth. Explicit controls outrank implicit events.
4. Exclude private messages, exact location, photos, protected traits, attractiveness/desirability, and raw personality answers from taste learning.
5. Give users owner-visible controls: view, edit where possible, reset, disable personalization, and understand why an update happened.
6. Ensure explanation layers verbalize only whitelisted visible reasons, never hidden weights or private taste internals.

Read `references/taste-contract.md` when adding event types, weights, reset semantics, or recommender inputs.

## Ranking Boundary

The recommender may use private taste internally only after consent. Public-facing explanations must receive a sanitized evidence packet and must not say "your private taste profile prefers X" about another person.

## Acceptance Checks

- Consent off means no private taste generation/update.
- Reset clears learned taste and cached explanations but keeps legal/safety records as required.
- Output validator and copy checks block attractiveness, hidden ranking, and protected-trait inference.
- "More like this" and "less like this" are explainable and reversible.
- Private taste never appears in another user's UI.

Use `$kesher-personality-why-match` for explanation-layer work and `$kesher-personality-delivery` for verification.


## Implementation Workflow
1. **Signal Capture:** Wire the "more like this" / "less like this" buttons in the UI to send signals to the backend.
2. **Vector Update:** Implement the backend logic to update the user's taste embedding in Firestore based on the received signals.
3. **Discovery Refresh:** Trigger a refresh of the user's discovery queue using the updated taste embedding.

## Manus Execution Directive
- **Capability:** `web_development`
- **Action:** Implement the taste vector update logic and wire it to the UI signals.
