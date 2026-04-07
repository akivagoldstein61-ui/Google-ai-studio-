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

  WHY_MATCH: (params: { user_profile: any; candidate_profile: any; signals: string[] }) => `Create a "Why you're seeing this" explanation.
User profile summary: ${sanitize.profile(params.user_profile)}
Candidate profile summary: ${sanitize.profile(params.candidate_profile)}
Whitelisted match signals: ${sanitize.profile(params.signals)}

Output:
- 2–3 short reasons
- 1 "good first question"
- 1 "possible mismatch to clarify" (gentle)`,

  SAFETY_SCAN: (params: { message_text: string; context: string }) => `Classify the following message for safety risk.
Message: ${sanitize.message(params.message_text)}
Context: ${sanitize.short(params.context)}

Return risk level, categories, recommended action, and short rationale.`,

  DATE_PLANNER: (params: { area: string; time: string; preferences: string; budget: string }) => `Suggest 4 safe first-date venues that fit these constraints:
- City/area: ${sanitize.short(params.area)}
- Time: ${sanitize.short(params.time)}
- Preferences: ${sanitize.short(params.preferences)}
- Budget: ${sanitize.short(params.budget)}

Output venues with name, why_good, safety_note, and meeting window.`,

  TASTE_PROFILE: (interactions: any, currentProfile: any) => `Analyze these recent interactions and update the user's private taste profile.
Current Profile: ${sanitize.profile(currentProfile)}
Recent Interactions: ${sanitize.profile(interactions)}`,

  PROFILE_COMPLETENESS: (profile: any) => `Analyze this profile for completeness and quality: ${sanitize.profile(profile)}`,

  REPHRASE_MESSAGE: (text: string) => `Rephrase this message to be more polite and clear, but keep the original intent: "${sanitize.message(text)}"`,

  GENERATE_OPENERS: (profile: any) => `Generate 3 respectful, engaging opening messages based on this profile: ${sanitize.profile(profile)}`,

  SAFETY_ADVICE: (topic: string) => `Provide brief, practical safety advice for online dating regarding: ${sanitize.topic(topic)}`,

  MOD_SUMMARIZER: (reports: any[]) => `Summarize these user reports for a moderator: ${sanitize.reports(reports)}`
};
