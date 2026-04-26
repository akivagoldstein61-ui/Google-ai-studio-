/**
 * AI Prompt Templates
 */

export const PROMPT_TEMPLATES = {
  BIO_COACH: (params: { bio_raw: string; tone: string; values: string; dealbreakers: string; length: string }) => `Task: Improve this dating bio for a serious Jewish dating app in Israel. Output 3 draft options.
User bio (raw):
${params.bio_raw}

User constraints:
- Desired tone: ${params.tone}
- Observance/values: ${params.values}
- Dealbreakers: ${params.dealbreakers}
- Length: ${params.length}

Requirements:
- Hebrew first.
- Keep it authentic, not salesman-like.
- Add 2 optional “conversation hooks” as short lines.`,

  WHY_MATCH: (params: { user_profile: any; candidate_profile: any; signals: string[] }) => `Create a “Why you’re seeing this” explanation.
User profile summary: ${JSON.stringify(params.user_profile)}
Candidate profile summary: ${JSON.stringify(params.candidate_profile)}
Canonical whitelisted match signals available to use: ${JSON.stringify(params.signals)}

CRITICAL RULES:
- NEVER use deterministic compatibility claims (e.g., "perfect match", "soulmate", "100% match").
- NEVER use scoring, ranking, or tier language (e.g., "league", "score").
- NEVER mention private taste, hidden dealbreakers, hidden ranking, raw personality scores, private messages, exact location, or protected traits.
- Keep it reflective and based ONLY on the provided canonical whitelisted signals.

Output:
- 2-3 short Hebrew reasons in reasons_he
- 1 good first Hebrew question in first_question_he
- optional gentle mismatch to clarify in gentle_clarification_he
- signals_used using only canonical signal ids from the prompt
- signals_not_used with all excluded signal ids: ["private_taste_profile","hidden_dealbreakers","hidden_ranking_signals","raw_personality_scores","private_messages","exact_location","protected_trait_inference"]
- uncertainty_he with gentle probabilistic wording`,

  SAFETY_SCAN: (params: { message_text: string; context: string }) => `Classify the following message for safety risk.
Message: ${params.message_text}
Context: ${params.context}

Return risk level, categories, recommended action, and short rationale.`,

  DATE_PLANNER: (params: any) => `Suggest 2 safe first-date venues and 1 backup plan that fit these constraints:
- Location Scope: ${params.locationScope}
- Location Value: ${params.locationValue}
- Time: ${params.time}
- Budget: ${params.budget}
- Vibe: ${params.vibe}
- Transport: ${params.transport}
- Constraints: ${params.constraints}

CRITICAL RULES:
- Use Google Maps grounding to find real, open venues.
- Use Google Search grounding ONLY if freshness matters (e.g., "what's happening this weekend").
- Return exactly 3 venues (2 recommended, 1 backup).
- Include a source_url for each venue if available from grounding.
- Keep safety notes calm and practical.
- Do not invent places that don't exist.`,

  TASTE_PROFILE: (interactions: any, currentProfile: any) => `Analyze these recent interactions and update the user's private taste profile.
Current Profile: ${JSON.stringify(currentProfile)}
Recent Interactions: ${JSON.stringify(interactions)}`,

  PROFILE_COMPLETENESS: (profile: any) => `Analyze this profile for completeness and quality: ${JSON.stringify(profile)}`,

  REPHRASE_MESSAGE: (text: string) => `Rephrase this message to be more polite and clear, but keep the original intent: "${text}"`,

  GENERATE_OPENERS: (profile: any) => `Generate 3 respectful, engaging opening messages based on this profile: ${JSON.stringify(profile)}

CRITICAL RULES:
- NEVER use over-sexualized, sleazy, or manipulative language.
- Keep drafts human, specific, and proportionate.
- Avoid fake intimacy or artificial escalation.`,

  SAFETY_ADVICE: (topic: string) => `Provide brief, practical safety advice for online dating regarding: ${topic}`,

  MOD_SUMMARIZER: (reports: any[]) => `Summarize these user reports for a moderator: ${JSON.stringify(reports)}`,

  PERSONALITY_INTERPRETER: (percentiles: any) => `Translate these deterministic BFAS percentiles into a warm, Hebrew-first user profile.
User BFAS percentiles: ${JSON.stringify(percentiles)}

CRITICAL RULES:
- NEVER use clinical, diagnostic, or pathology language (e.g., "diagnosis", "disorder", "ADHD", "narcissist", "bipolar", "toxic").
- NEVER use deterministic compatibility claims (e.g., "doomed", "incompatible").
- NEVER use ranking or tier language (e.g., "alpha", "beta", "high value").
- Frame everything as reflective tendencies, not fixed destiny.
- Focus on how these traits manifest in dating and relationships.

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
