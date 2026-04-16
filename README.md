<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/bd65b2e7-1010-405f-8e3a-13786c313892

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Issue / Feature Brief (Filled)

Implement **Verified-Only Discovery with Hebrew-first trust messaging** so users can restrict discovery results to identity-verified profiles and clearly understand why some cards are hidden.

1. **User-visible behavior change**
   - Add a “Verified profiles only” toggle in discovery filters.
   - When enabled, discovery feed excludes non-verified profiles.
   - Show a short Hebrew-first explanation under the toggle (with English fallback) clarifying that verification improves safety and authenticity.
   - If zero verified profiles match, show an empty-state message with a CTA to relax filters.

2. **Affected areas**
   - `src/features/discovery/*` (filter state, feed logic, empty state)
   - `src/components/discovery/*` (toggle UI, helper copy, card badges)
   - `src/types/*` (verification-related filter typing, if needed)
   - `src/services/*` (mock/real profile query filtering path)

3. **Acceptance criteria**
   - Toggle defaults to OFF and persists during session navigation.
   - When ON, only profiles where verification is complete are rendered in the feed.
   - Discovery count reflects filtered results correctly.
   - Empty state appears when filtered results are zero and includes a working “Show all profiles” action.
   - RTL layout remains correct for Hebrew text and no visual regressions in mobile viewport.

4. **Constraints**
   - Keep API shape backward compatible; do not break existing profile interfaces.
   - UI copy must be Hebrew-first with concise, trust-forward wording; English fallback is required where bilingual copy already exists.
   - Respect trust/moderation posture: do not imply that verification guarantees behavior, only identity confidence.
   - Preserve accessibility semantics for toggle/labels and maintain RTL support.

5. **Required verification commands**
   - `npm run lint`
   - `npm run build`
