/**
 * AI Prompt Templates
 *
 * All user-provided text is sanitized before interpolation to prevent
 * prompt injection, bound input length, and strip dangerous characters.
 */

import { sanitize, sanitizeText } from './promptSanitizer';

export const PROMPT_TEMPLATES = {
  BIO_COACH: (params: { bio_raw: string; tone: string; values: string; dealbreakers: string; length: string }) => `Task: Improve this dating bio for a serious Jewish dating app in Israel. Output 3 draft options.
User bio (raw):
${sanitize.bio(params.bio_raw)}

User constraints:
- Desired tone: ${sanitize.short(params.tone)}
- Observance/values: ${sanitize.short(params.values)}
- Dealbreakers: ${sanitize.short(params.dealbreakers)}
- Length: ${sanitize.short(params.length)}

Requirements:
- Hebrew first.
- Keep it authentic, not salesman-like.
- Add 2 optional "conversation hooks" as short lines.`,

  WHY_MATCH: (params: { user_profile: any; candidate_profile: any; signals: string[] }) => `Create a "Why you're seeing this" explanation grounded ONLY in the whitelisted signals below.

User profile summary (visible fields only): ${sanitize.profile(params.user_profile)}
Candidate profile summary (visible fields only): ${sanitize.profile(params.candidate_profile)}
Whitelisted match signals: ${sanitize.profile(params.signals)}

Strict rules:
- Use ONLY the whitelisted signals. Do not infer hidden ranking, private preferences, taste profile, safety flags, behavioral history, attractiveness, or protected traits.
- Do NOT use the phrases: "perfect match", "soulmate", "compatibility score", "marriage probability", "your type".
- Do NOT invent shared facts. If a signal is missing or ambiguous, omit it instead of guessing.
- Keep reasons short, honest, and probabilistic in tone. No certainty claims.

Output a JSON object with:
- schema_version: "why_match.v2"
- reasons: 2–3 short reasons grounded in whitelisted signals
- first_question: one good first question for the user to ask
- possible_mismatch_to_clarify: one gentle clarification, or "" if none
- signals_used: subset of the whitelisted signals that actually shaped the reasons
- signals_not_used: whitelisted signals that were available but did not contribute
- confidence: number between 0 and 1 (heuristic, not a score)
- evidence_label: "VERIFIED" | "INFERRED" | "HEURISTIC" | "UNKNOWN"`,

  SAFETY_SCAN: (params: { message_text: string; context: string }) => `Classify the following message for safety risk.
Message: ${sanitize.message(params.message_text)}
Context: ${sanitize.short(params.context)}

Return risk level, categories, recommended action, and short rationale.`,

  DATE_PLANNER: (params: { area: string; time: string; preferences: string; budget: string }) => `Suggest 4 safe first-date venues that fit these constraints:
- City/area: ${sanitize.short(params.area)}
- Time: ${sanitize.short(params.time)}
- Preferences: ${sanitize.short(params.preferences)}
- Budget: ${sanitize.short(params.budget)}

CRITICAL RULES:
- Use Google Maps grounding to find real, open venues.
- Use Google Search grounding ONLY if freshness matters (e.g., "what's happening this weekend").
- Return exactly 3 venues (2 recommended, 1 backup).
- Include a source_url for each venue if available from grounding.
- Keep safety notes calm and practical.
- Do not invent places that don't exist.`,

  TASTE_PROFILE: (interactions: any, currentProfile: any) => `Analyze these recent interactions and update the user's private taste profile.
Current Profile: ${sanitize.profile(currentProfile)}
Recent Interactions: ${sanitize.profile(interactions)}`,

  PROFILE_COMPLETENESS: (profile: any) => `Analyze this profile for completeness and quality: ${sanitize.profile(profile)}`,

  REPHRASE_MESSAGE: (text: string) => `The user wrote a draft message and is asking for help rephrasing it. They will choose whether to send anything; you NEVER send on their behalf and there is no autosend mechanism.

User draft: "${sanitize.message(text)}"

Strict rules:
- Preserve the user's intent and facts. Do NOT invent new facts, names, plans, or commitments.
- Do NOT add information the user did not write.
- Do NOT include the recipient's private preferences, taste profile, or any safety flags.
- Keep the user's voice. The output is a draft for the user to choose from, not an automated send.

Return a JSON object with:
- options: 2–4 alternative phrasings, each preserving the original meaning
- what_changed: a brief explanation of how the alternatives differ from the original (e.g. tone, clarity, length)`,

  GENERATE_OPENERS: (profile: any) => `Generate 3 respectful, engaging opening messages based on this profile: ${sanitize.profile(profile)}`,

  SAFETY_ADVICE: (topic: string) => `Provide brief, practical safety advice for online dating regarding: ${sanitize.topic(topic)}`,

  MOD_SUMMARIZER: (reports: any[]) => `Summarize these user reports for a moderator: ${sanitize.reports(reports)}`,

  PERSONALITY_INTERPRETER: (privateReport: any) => `Translate this deterministic Kesher private personality report into a warm, Hebrew-first user profile.
Private personality report: ${JSON.stringify(privateReport)}

CRITICAL RULES:
- NEVER use clinical, diagnostic, or pathology language (e.g., "diagnosis", "disorder", "ADHD", "narcissist", "bipolar", "toxic").
- NEVER use deterministic compatibility claims (e.g., "doomed", "incompatible").
- NEVER use ranking or tier language (e.g., "alpha", "beta", "high value").
- NEVER reveal raw answers, hidden weights, private taste data, private messages, or exact location.
- Frame everything as reflective tendencies, not fixed destiny.
- Focus on communication, pacing, and self-reflection in dating.

Output a personality_profile JSON.`,

  PERSONALITY_ASPECT_CARD: (aspectName: string, percentile: number) => `Explain this aspect's impact on dating.
Aspect: ${aspectName}
Percentile: ${percentile}

CRITICAL RULES:
- NEVER use clinical, diagnostic, or pathology language.
- NEVER use deterministic compatibility claims.
- Frame friction points gently as "growth areas" or "things to be aware of".

Output a personality_aspect_card JSON.`,

  COMPATIBILITY_REFLECTION: (sharedInputs: any) => `Create a mutual compatibility reflection from mutually shared inputs only.
Shared inputs approved for both users: ${JSON.stringify(sharedInputs)}

CRITICAL RULES:
- NEVER use deterministic compatibility claims (e.g., "perfect match", "doomed", "incompatible").
- NEVER use a match score, match percentage, rating, ranking, or tier.
- NEVER use clinical or diagnostic language.
- NEVER mention private taste, hidden dealbreakers, hidden ranking, raw personality scores, private messages, exact location, or protected traits.
- Frame differences as possible friction to navigate, not dealbreakers.
- Frame similarities as shared strengths.
- Include one question to explore, one micro-habit, one gentle boundary, and signals_used.

Allowed signals_used values: ["mutually_shared_values","mutually_visible_intent","mutually_visible_observance","mutually_visible_lifestyle","mutually_visible_interests","mutually_visible_prompts","mutually_approved_share_card"]
Output a compatibility_reflection JSON.`,

  PACING_INTERVENTION: (sessionLength: number, swipeVelocity: number) => `Generate a gentle prompt to take a break.
Session length: ${sessionLength} minutes
Swipe velocity: ${swipeVelocity} swipes/minute
Output a pacing_intervention JSON.`

};
