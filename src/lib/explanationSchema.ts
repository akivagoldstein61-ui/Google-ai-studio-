/**
 * Whitelisted evidence packet + safe explanation rendering.
 *
 * Per kesher-explainable-ai skill:
 *   - Only the fields below may be passed to the explanation generator.
 *   - Hidden weights, inferred traits, the other person's private prefs:
 *     all PROHIBITED.
 *   - Deterministic fallback templates when generation is unavailable.
 */

export type ActivityStatus = 'active_recently' | 'new_user' | 'unspecified';

/** This is the ONLY shape allowed at the boundary of the explanation generator. */
export interface EvidencePacket {
  shared_interests: string[];          // Only tags listed publicly on BOTH profiles
  shared_intent: string | null;        // Only if public on both
  shared_observance_label: string | null; // Only if public on both
  activity_status: ActivityStatus;
  taste_driven: boolean;               // Abstract: "based on profiles you've liked recently"
}

// ─────────────────────────────────────────────────────────────────────────────
// DETERMINISTIC FALLBACK TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────

export interface RenderedExplanation {
  reasons_he: string[];
  first_question_he: string;
  source: 'generated' | 'fallback_template' | 'fallback_empty';
}

export function deterministicFallback(packet: EvidencePacket): RenderedExplanation {
  const reasons: string[] = [];

  if (packet.shared_interests.length >= 2) {
    const list = packet.shared_interests.slice(0, 3).join(' ו-');
    reasons.push(`אתם חולקים תחומי עניין: ${list}.`);
  } else if (packet.shared_interests.length === 1) {
    reasons.push(`שניכם רשמתם ${packet.shared_interests[0]} בפרופיל.`);
  }

  if (packet.shared_intent) {
    reasons.push('אתם מחפשים סוג דומה של מערכת יחסים.');
  }
  if (packet.shared_observance_label) {
    reasons.push('יש לכם תיאור עצמי דומה ביחס למסורת.');
  }
  if (packet.activity_status === 'new_user') {
    reasons.push('הם חדשים בקשר.');
  } else if (packet.activity_status === 'active_recently') {
    reasons.push('הם פעילים לאחרונה.');
  }
  if (packet.taste_driven) {
    reasons.push('בהתבסס על פרופילים שאהבת לאחרונה.');
  }

  if (reasons.length === 0) {
    return {
      reasons_he: ['הם תואמים את המסננים הנוכחיים שלך ופעילים באזור.'],
      first_question_he: 'מה אתה אוהב לעשות בסופי שבוע?',
      source: 'fallback_empty',
    };
  }

  const firstQ = packet.shared_interests[0]
    ? `על מה הכי אהבת לחשוב כש${packet.shared_interests[0]} מופיע בחיים שלך?`
    : 'מה הדבר הכי טוב שקרה לך השבוע?';

  return {
    reasons_he: reasons,
    first_question_he: firstQ,
    source: 'fallback_template',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// COPY-GUIDELINE LINTER
// ─────────────────────────────────────────────────────────────────────────────

/** Returns offending phrases if the text uses prohibited deterministic language. */
export function lintExplanationCopy(text: string): string[] {
  const banned = [
    /\bperfect match\b/i, /\bsoul ?mate\b/i, /\b\d{2,3}%\s*match\b/i,
    /\boracle\b/i, /\balgorithm determined\b/i,
    /התאמה מושלמת/, /נשמה תאומה/,
  ];
  return banned.filter(rx => rx.test(text)).map(rx => rx.source);
}

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM PROMPT FRAGMENT (for downstream Gemini calls)
// ─────────────────────────────────────────────────────────────────────────────

export const EXPLANATION_SYSTEM_PROMPT = `
You are Kesher's match-explanation service.
RULES (non-negotiable):
- Use only the supplied EvidencePacket fields. Do not infer traits.
- Never claim certainty: avoid "perfect match", "soulmate", percentages.
- Never reference the other person's private preferences or swipe history.
- Reply in Hebrew, calm and concrete, max 3 short reasons.
- Always end with one open-ended first question.
- If evidence is too thin, return a single neutral reason.
`.trim();
