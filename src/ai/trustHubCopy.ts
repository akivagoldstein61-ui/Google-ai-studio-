/**
 * AI Trust Hub disclosure copy.
 *
 * These constants are the source of truth for what we promise users about
 * how AI is and is not used. They live here (not inline in JSX) so that
 * unit tests can pin every required boundary without mounting a React tree,
 * and so a future i18n pass has a single place to translate from.
 *
 * Wording changes here are user-facing trust commitments. Treat them as
 * policy, not chrome. Adding or removing items requires the same care as
 * editing CLAUDE.md Section 5 ("Product Red Lines").
 */

export const TRUST_HUB_PHILOSOPHY = {
  headline: "AI is our assistant, not our authority.",
  body: "We use Google's Gemini AI to help you express yourself and stay safe. We never use AI to score your attractiveness or flirt on your behalf.",
};

/** What AI helps with — assistive only, never authoritative. */
export const TRUST_HUB_DOES = [
  "AI helps with drafts and explanations.",
  "Why This Match uses only the visible signals you and your match have chosen to display.",
  "Personality is a lens, not a verdict.",
  "You can reset or delete your private taste learning at any time.",
];

/** Hard "no"s — what AI will not do, ever. */
export const TRUST_HUB_RED_LINES = [
  "No public attractiveness ratings or scores.",
  "No numeric fit rating or relationship-outcome prediction.",
  "No auto-chatting or AI sending messages on your behalf.",
  "No sensitive identity inference from photos (race, ethnicity, religion).",
  "No hidden ranking manipulation or opaque filter overrides.",
  "Your private taste profile stays private and is never shown to other users.",
];

/** User-facing controls that must always be available. */
export const TRUST_HUB_CONTROLS = [
  "View and edit your private taste profile.",
  "Reset your taste learning at any time.",
  "Delete your account easily — no maze.",
];
