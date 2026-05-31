import { AI_FEATURE_REGISTRY, getFeatureById } from '@/ai/featureRegistry';
import type { AIFeatureMetadata } from '@/ai/types';

export interface AIFeatureContract {
  featureKey: string;
  riskTier: AIFeatureMetadata['risk_level'];
  modelProvider: 'gemini';
  route: string;
  inputSchema: string;
  outputSchema: string;
  allowedInputs: string[];
  forbiddenInputs: string[];
  consentRequired: boolean;
  retentionPolicy: string;
  fallbackMode: string;
  evalFixturePath: string;
}

const FEATURE_ROUTES: Record<string, string> = {
  bio_coach: '/api/ai/coach-bio',
  profile_completeness: '/api/ai/profile-completeness',
  taste_profile: '/api/ai/taste-profile',
  why_match: '/api/ai/explain-match',
  safety_scan: '/api/ai/message-safety',
  date_planner: '/api/ai/plan-date',
  safety_advice: '/api/ai/safety-advice',
  rephrase_message: '/api/ai/rephrase',
  generate_openers: '/api/ai/openers',
  daily_picks_intro: '/api/ai/daily-picks-intro',
  personality_profile: '/api/ai/personality-profile',
  compatibility_reflection: '/api/ai/compatibility-reflection',
  pacing_coach: '/api/ai/pacing-intervention',
  mod_summarizer: '/api/ai/moderation-summary',
  visual_icebreaker: '/api/ai/analyze-photos',
  voice_reflection: 'gated:ephemeral-live-token-required',
};

export const aiFeatureContracts: AIFeatureContract[] = AI_FEATURE_REGISTRY.map((feature) => ({
  featureKey: feature.id,
  riskTier: feature.risk_level,
  modelProvider: 'gemini',
  route: FEATURE_ROUTES[feature.id] ?? 'demo/local-fallback',
  inputSchema: `${feature.id}.input`,
  outputSchema: `${feature.id}.output`,
  allowedInputs: feature.data_inputs,
  forbiddenInputs: feature.excluded_data,
  consentRequired: feature.requires_consent,
  retentionPolicy: feature.audience === 'internal' ? 'moderation-retention' : 'member-private-best-effort-demo',
  fallbackMode: feature.capability_exception ? 'gated or deterministic fixture' : 'deterministic fallback',
  evalFixturePath: `src/ai/evals/${feature.id}.fixture.json`,
}));

export { AI_FEATURE_REGISTRY as aiFeatureRegistry, getFeatureById };
export type { AIFeatureMetadata };
