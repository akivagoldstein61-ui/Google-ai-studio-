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
Whitelisted match signals: ${JSON.stringify(params.signals)}

CRITICAL RULES:
- NEVER use deterministic compatibility claims (e.g., "perfect match", "soulmate", "100% match").
- NEVER use scoring, ranking, or tier language (e.g., "league", "score").
- Keep it reflective and based ONLY on the provided whitelisted signals.

Output:
- 2–3 short reasons
- 1 “good first question”
- 1 “possible mismatch to clarify” (gentle)`,

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

  COMPATIBILITY_REFLECTION: (userA: any, userB: any) => `Compare these two profiles and highlight friction/synergy.
User A percentiles: ${JSON.stringify(userA)}
User B percentiles: ${JSON.stringify(userB)}

CRITICAL RULES:
- NEVER use deterministic compatibility claims (e.g., "perfect match", "doomed", "incompatible").
- NEVER use clinical or diagnostic language.
- Frame differences as "friction loops" to navigate, not dealbreakers.
- Frame similarities as "shared strengths".

Output a compatibility_reflection JSON.`,

  PACING_INTERVENTION: (sessionLength: number, swipeVelocity: number) => `Generate a gentle prompt to take a break.
Session length: ${sessionLength} minutes
Swipe velocity: ${swipeVelocity} swipes/minute
Output a pacing_intervention JSON.`
};
