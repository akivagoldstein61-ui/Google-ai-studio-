import {
  Activity,
  BookOpen,
  Brain,
  Coffee,
  Cpu,
  Eye,
  FileCheck,
  FileText,
  Fingerprint,
  GitBranch,
  Heart,
  Image,
  Layers,
  Lightbulb,
  Lock,
  Map,
  MessageSquare,
  Mic,
  Palette,
  Scale,
  Search,
  Shield,
  ShoppingBag,
  Sparkles,
  Star,
  Users,
  Zap,
} from 'lucide-react';
import type {
  SkillAudience,
  SkillCategory,
  SkillConsentType,
  SkillDefinition,
  SkillDeepeningDecision,
  SkillEntryPoint,
  SkillKind,
  SkillOutputType,
  SkillSafetyLevel,
  SkillStatus,
  SkillSurface,
  SkillSurfaceClass,
  SkillVisibility,
} from './types';

export type SkillMeta = SkillDefinition;

type SkillInput = {
  id: string;
  skillId?: string;
  title: string;
  shortTitle?: string;
  subtitle: string;
  icon: SkillDefinition['icon'];
  color: string;
  status: SkillStatus;
  category: SkillCategory;
  description: string;
  keyFeatures: string[];
  primarySurface: SkillSurface;
  entryPoints: SkillEntryPoint[];
  requiredConsent?: SkillConsentType[];
  privacyNotes?: string[];
  safetyLevel?: SkillSafetyLevel;
  aiFeatureKey?: string;
  outputType?: SkillOutputType;
  prerequisites?: string[];
  recommendedNextActions?: string[];
  demoModeBehavior?: string;
  featured?: boolean;
  kind?: SkillKind;
  audience?: SkillAudience;
};

/**
 * Canonical source of truth for which skills are launchable, member-operable
 * capabilities. Each id here MUST have an explicit `case` in SkillsRouter.tsx
 * (guarded by a test) — everything else falls through to the read-only
 * PlannedSkillPage and is classified as reference material.
 */
export const INTERACTIVE_SKILL_IDS = [
  'personality-assessment',
  'personality-profile',
  'personality-ocean',
  'personality-visibility',
  'consent-ux',
  'israeli-privacy',
  'privacy-recommendation',
  'private-taste',
  'why-this-match',
  'permissioned-sharing',
  'compatibility-reflection',
  'psychometric-validation',
  'dark-pattern-audit',
  'ai-runtime-governance',
  'pacing-coach',
  'learned-taste',
  'filtering-marketplace',
] as const;

const INTERACTIVE_SKILL_ID_SET = new Set<string>(INTERACTIVE_SKILL_IDS);

const entry = (
  surface: SkillSurface,
  label: string,
  description: string,
  route?: string,
  featured = false,
): SkillEntryPoint => ({ surface, label, description, route, featured });

const DEFAULT_PRIVACY_NOTES = [
  'Uses the minimum context needed for the surface.',
  'Does not expose private taste internals, hidden ranking weights, or other members raw answers.',
  'AI output is assistive only; the member stays in control.',
];

// ---------------------------------------------------------------------------
// PR 1 — Skills Hub truth labels.
// Classification is centralized here (additive) so the 35 defineSkill() calls
// stay unchanged. surfaceClass drives hub grouping; visibility hides non-member
// items; deepeningDecision records the PR 0 inventory decision. See
// docs/skills/INVENTORY.md.
// ---------------------------------------------------------------------------
type SkillClassification = {
  surfaceClass: SkillSurfaceClass;
  visibility: SkillVisibility;
  deepeningDecision: SkillDeepeningDecision;
};

const DEFAULT_CLASSIFICATION: SkillClassification = {
  surfaceClass: 'reference',
  visibility: 'reference_visible',
  deepeningDecision: 'UNKNOWN_PENDING_RENDERED_TEST',
};

const member = (
  surfaceClass: Extract<SkillSurfaceClass, 'member_interactive' | 'settings_control' | 'trust_safety'>,
  deepeningDecision: SkillDeepeningDecision,
): SkillClassification => ({ surfaceClass, visibility: 'member_visible', deepeningDecision });

const ref = (surfaceClass: SkillSurfaceClass): SkillClassification => ({
  surfaceClass,
  visibility: 'reference_visible',
  deepeningDecision: 'MOVE_TO_REFERENCE_SECTION',
});

const hide = (surfaceClass: Extract<SkillSurfaceClass, 'external_demo' | 'hidden_until_verified'>): SkillClassification => ({
  surfaceClass,
  visibility: 'hidden',
  deepeningDecision: 'REMOVE_OR_HIDE_UNTIL_VERIFIED',
});

const SKILL_CLASSIFICATION: Record<string, SkillClassification> = {
  // Interactive + controls (member-facing)
  'private-taste': member('settings_control', 'DEEPEN_NOW'),
  'why-this-match': member('member_interactive', 'DEEPEN_NOW'),
  'pacing-coach': member('member_interactive', 'DEEPEN_NOW'),
  'consent-ux': member('settings_control', 'DEEPEN_AFTER_FIX'),
  'personality-visibility': member('settings_control', 'DEEPEN_AFTER_FIX'),
  'personality-profile': member('member_interactive', 'DEEPEN_AFTER_FIX'),
  'personality-ocean': member('member_interactive', 'DEEPEN_AFTER_FIX'),
  'personality-assessment': member('member_interactive', 'DEEPEN_AFTER_FIX'),
  'filtering-marketplace': member('member_interactive', 'DEEPEN_AFTER_FIX'),
  'learned-taste': member('member_interactive', 'DEEPEN_AFTER_FIX'),
  'privacy-recommendation': member('member_interactive', 'DEEPEN_AFTER_FIX'),
  'permissioned-sharing': member('trust_safety', 'DEEPEN_AFTER_FIX'),
  'compatibility-reflection': member('member_interactive', 'DEEPEN_AFTER_FIX'),
  'maps-date-planner': member('member_interactive', 'DEEPEN_AFTER_FIX'),
  'grounded-search': member('trust_safety', 'DEEPEN_AFTER_FIX'),
  'image-analysis': member('trust_safety', 'DEEPEN_AFTER_FIX'),
  // Legal / research / operator / reference (not member-facing interactive)
  'israeli-privacy': ref('legal_privacy'),
  'psychometric-validation': ref('research'),
  'personality-research': ref('research'),
  'ai-runtime-governance': ref('operator'),
  'ai-feature-modules': ref('operator'),
  'low-latency-ai': ref('operator'),
  'high-thinking-routing': ref('operator'),
  'system-prompt': ref('operator'),
  'personality-delivery': ref('operator'),
  'dark-pattern-audit': ref('reference'),
  'explainable-ai': ref('reference'),
  'personality-engine': ref('reference'),
  'calm-ux': ref('reference'),
  'private-recommendations': ref('reference'),
  // Platform / vendor
  'gemini-integration': ref('platform_vendor'),
  'google-ai-studio-app-builder': ref('platform_vendor'),
  // Hidden / external (flag-off or not a Kesher member feature)
  'voice-integration': hide('hidden_until_verified'),
  'sparkmatch-dating-app-skill': hide('external_demo'),
  'video-generator': hide('external_demo'),
};

const defineSkill = (input: SkillInput): SkillDefinition => {
  const surfaces = new Set<SkillSurface>(['skills-hub', 'skills', input.primarySurface]);
  input.entryPoints.forEach((point) => surfaces.add(point.surface));

  const isInternal = input.safetyLevel === 'internal'
    || (input.requiredConsent ?? []).includes('admin_only');
  const classification = SKILL_CLASSIFICATION[input.id] ?? DEFAULT_CLASSIFICATION;

  return {
    id: input.id,
    slug: input.id,
    skillId: input.skillId,
    title: input.title,
    shortTitle: input.shortTitle ?? input.title,
    subtitle: input.subtitle,
    category: input.category,
    kind: input.kind ?? (INTERACTIVE_SKILL_ID_SET.has(input.id) ? 'interactive' : 'reference'),
    audience: input.audience ?? (isInternal ? 'admin' : 'member'),
    summary: input.description,
    fullDescription: `${input.description} ${input.keyFeatures.join(' ')}`,
    featured: input.featured ?? true,
    icon: input.icon,
    color: input.color,
    primarySurface: input.primarySurface,
    availableSurfaces: Array.from(surfaces),
    entryPoints: input.entryPoints,
    requiredConsent: input.requiredConsent ?? ['none'],
    privacyNotes: input.privacyNotes ?? DEFAULT_PRIVACY_NOTES,
    safetyLevel: input.safetyLevel ?? 'low',
    aiFeatureKey: input.aiFeatureKey,
    outputType: input.outputType ?? 'reference',
    status: input.status,
    surfaceClass: classification.surfaceClass,
    visibility: classification.visibility,
    deepeningDecision: classification.deepeningDecision,
    prerequisites: input.prerequisites ?? ['Member is signed into the Kesher prototype.'],
    recommendedNextActions: input.recommendedNextActions ?? input.entryPoints.map((point) => point.label),
    demoModeBehavior: input.demoModeBehavior ?? 'Starts a demo-safe skill state and opens the related prototype surface when available.',
    description: input.description,
    keyFeatures: input.keyFeatures,
  };
};

export const SKILLS: SkillDefinition[] = [
  defineSkill({
    id: 'personality-assessment',
    skillId: 'kesher-bfas-assessment',
    title: 'Personality Assessment',
    shortTitle: 'Assessment',
    subtitle: 'Progressive BFAS/IPIP Administration',
    icon: Brain,
    color: 'bg-violet-100 text-violet-700 border-violet-200',
    status: 'prototype',
    category: 'personality',
    description: 'Progressive personality questionnaire with save-and-resume, domain and facet scoring, quality checks, and bilingual reflection card generation.',
    keyFeatures: ['100-item BFAS or IPIP-NEO public-domain paths', 'Reverse-keyed items with deterministic scoring', 'Response quality gates before scoring', 'Save-and-resume in blocks of 10 to 15 items'],
    primarySurface: 'onboarding',
    entryPoints: [
      entry('profile-builder', 'Start assessment', 'Open the private personality assessment from profile setup.', '/settings/personality', true),
      entry('settings', 'Manage assessment', 'Review or reset the personality journey.', '/settings/personality'),
    ],
    requiredConsent: ['profile_data'],
    aiFeatureKey: 'personality_profile',
    outputType: 'reflection',
  }),
  defineSkill({
    id: 'personality-profile',
    skillId: 'kesher-personality-profile',
    title: 'Personality Profile',
    shortTitle: 'Profile Cards',
    subtitle: 'Private Reflection Cards',
    icon: FileText,
    color: 'bg-teal-100 text-teal-700 border-teal-200',
    status: 'prototype',
    category: 'personality',
    description: 'Translates deterministic BFAS domain and aspect scores into warm private reflection cards via structured Gemini output. Owner-only by default.',
    keyFeatures: ['Domain and aspect cards in the member language', 'AI receives tendency bands only, not exact values', 'No clinical labels, fixed identities, or match claims', 'Export, reset, and delete controls remain visible'],
    primarySurface: 'settings',
    entryPoints: [
      entry('profile-builder', 'Review reflection cards', 'Save private reflection output during profile setup.', '/settings/personality', true),
      entry('settings', 'Open profile cards', 'Manage owner-only personality cards.', '/settings/personality'),
    ],
    requiredConsent: ['profile_data', 'ai_assist'],
    aiFeatureKey: 'personality_profile',
    outputType: 'reflection',
  }),
  defineSkill({
    id: 'personality-engine',
    skillId: 'kesher-personality-engine',
    title: 'Personality Engine',
    shortTitle: 'Engine',
    subtitle: 'BFAS Scoring & Reflection Pipeline',
    icon: Cpu,
    color: 'bg-violet-100 text-violet-700 border-violet-200',
    status: 'prototype',
    category: 'personality',
    description: 'BFAS assessment system covering test administration, deterministic scoring, private reports, pair reflections, and personality-aware explanation guardrails.',
    keyFeatures: ['Deterministic scoring with no LLM scoring', 'Structured output schemas for reflections', 'Versioned item bank with migration path', 'Bilingual Hebrew and English support with invariance checks'],
    primarySurface: 'profile-builder',
    entryPoints: [
      entry('profile-builder', 'Use scoring pipeline', 'Open the profile builder assessment flow.', '/settings/personality', true),
      entry('ai-trust', 'Inspect AI boundary', 'Review how personality outputs are governed.', '/settings/ai-trust'),
    ],
    requiredConsent: ['profile_data', 'ai_assist'],
    aiFeatureKey: 'personality_profile',
    outputType: 'reflection',
  }),
  defineSkill({
    id: 'personality-research',
    skillId: 'kesher-personality-research',
    title: 'Personality Research',
    shortTitle: 'Research',
    subtitle: 'Evidence & Claims Grounding',
    icon: BookOpen,
    color: 'bg-violet-100 text-violet-700 border-violet-200',
    status: 'prototype',
    category: 'personality',
    description: 'Evidence-tagged grounding for personality claims, compatibility language, and trust copy so contracts remain scientifically and ethically defensible.',
    keyFeatures: ['Claim-evidence traceability', 'Research citation discipline', 'Compatibility language safety rails', 'Grounding checks for trust copy'],
    primarySurface: 'profile-builder',
    entryPoints: [
      entry('profile-builder', 'Use evidence-grounded prompts', 'Apply research-safe language while building the profile.', '/profile/edit', true),
      entry('ai-trust', 'Review claim boundaries', 'Open AI transparency controls.', '/settings/ai-trust'),
    ],
    requiredConsent: ['none'],
    outputType: 'reference',
  }),
  defineSkill({
    id: 'personality-ocean',
    skillId: 'kesher-personality-ocean',
    title: 'Personality & OCEAN',
    shortTitle: 'OCEAN',
    subtitle: 'Jewish Observance Integration',
    icon: Star,
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    status: 'prototype',
    category: 'personality',
    description: 'OCEAN model implementation integrated with Jewish observance layers and Hebrew-first localization for culturally aware reflection cards.',
    keyFeatures: ['OCEAN traits mapped to dating-relevant dimensions', 'Observance-layer signals overlay', 'Hebrew-first with RTL layout support', 'Cultural context in reflection cards'],
    primarySurface: 'profile-builder',
    entryPoints: [
      entry('profile-builder', 'Reflect on values', 'Use culturally aware reflection during profile building.', '/settings/personality', true),
      entry('daily', 'See values context', 'Review visible overlap in Daily Picks.', '/daily'),
    ],
    requiredConsent: ['profile_data'],
    aiFeatureKey: 'personality_profile',
    outputType: 'reflection',
  }),
  defineSkill({
    id: 'personality-visibility',
    skillId: 'kesher-personality-visibility',
    title: 'Personality Visibility',
    shortTitle: 'Visibility',
    subtitle: 'Four-Layer Visibility Model',
    icon: Eye,
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    status: 'prototype',
    category: 'personality',
    description: 'Defines which personality-derived data can appear in public browse, private owner, mutual-consent, or system-only surfaces.',
    keyFeatures: ['Public, private, mutual-consent, and system-only layers', 'Per-surface field classification matrix', 'Discovery never shows model-derived trait labels', 'ADR required for any visibility policy change'],
    primarySurface: 'settings',
    entryPoints: [
      entry('settings', 'Open visibility settings', 'Control what personality context can be shared.', '/settings/personality-visibility', true),
      entry('ai-trust', 'Review data use', 'See the AI and privacy boundary.', '/settings/ai-trust'),
    ],
    requiredConsent: ['profile_data'],
    outputType: 'settings',
  }),
  defineSkill({
    id: 'consent-ux',
    skillId: 'kesher-consent-ux',
    title: 'Consent UX',
    shortTitle: 'Consent',
    subtitle: 'Trust Hub & Grants Ledger',
    icon: Shield,
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    status: 'prototype',
    category: 'privacy',
    description: 'Section 11 consent gates, Trust Hub dashboard, grants ledger, revocation flows, and anti-dark-pattern consent microcopy.',
    keyFeatures: ['Section 11 disclosure requirements', 'Pre-checked boxes forbidden and default off', 'Revocation in two taps from Trust Hub', 'Audit log of consent events'],
    primarySurface: 'ai-trust',
    entryPoints: [
      entry('ai-trust', 'Open consent controls', 'Manage grants and revocation from the AI Trust Hub.', '/settings/ai-trust', true),
      entry('onboarding', 'Review consent before AI', 'Show consent before optional coaching.', '/profile/edit'),
    ],
    requiredConsent: ['none'],
    outputType: 'settings',
  }),
  defineSkill({
    id: 'israeli-privacy',
    skillId: 'kesher-israeli-privacy',
    title: 'Israeli Privacy Compliance',
    shortTitle: 'Privacy Law',
    subtitle: 'Amendment 13 & PPA Guidance',
    icon: Lock,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    status: 'prototype',
    category: 'privacy',
    description: 'Data classification matrix, Section 11 notice, access, correction, deletion rights, DPO triggers, and transfer-abroad controls.',
    keyFeatures: ['Sensitive data classification', 'Statutory access, correction, and deletion rights', 'DPO trigger conditions', 'Transfer-abroad safeguards'],
    primarySurface: 'ai-trust',
    entryPoints: [
      entry('ai-trust', 'Review privacy controls', 'Open AI and privacy transparency.', '/settings/ai-trust', true),
      entry('safety', 'Open safety and rights', 'Keep privacy rights near safety actions.', '/settings/safety'),
    ],
    requiredConsent: ['none'],
    safetyLevel: 'medium',
    outputType: 'settings',
  }),
  defineSkill({
    id: 'privacy-recommendation',
    skillId: 'kesher-privacy-preserving-recommendation',
    title: 'Privacy-Preserving Recommendation',
    shortTitle: 'Private Ranking',
    subtitle: 'Three-Layer Architecture',
    icon: Layers,
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    status: 'prototype',
    category: 'privacy',
    description: 'Silent personalization, safe explanation, and permissioned personality layers with signal allowlists and anti-leakage controls.',
    keyFeatures: ['Three-layer signal architecture', 'Explanation layer uses only whitelisted reasons', 'Silent personalization never exposed to other users', 'Anti-leakage controls at every boundary'],
    primarySurface: 'daily',
    entryPoints: [
      entry('daily', 'Tune Daily Picks privately', 'Use private ranking without exposing taste internals.', '/daily', true),
      entry('ai-trust', 'Review recommendation privacy', 'Open AI data controls.', '/settings/ai-trust'),
    ],
    requiredConsent: ['private_taste'],
    aiFeatureKey: 'taste_profile',
    outputType: 'settings',
  }),
  defineSkill({
    id: 'private-taste',
    skillId: 'kesher-private-taste',
    title: 'Private Taste',
    shortTitle: 'Taste',
    subtitle: 'Owner-Only Preference Learning',
    icon: Fingerprint,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    status: 'prototype',
    category: 'privacy',
    description: 'Consent-gated preference learning with owner-only taste summaries, editable controls, reset semantics, and strict explanation-layer separation.',
    keyFeatures: ['Explicit signals outrank implicit signals', 'Private conversations, photos, and sensitive-trait guesses are excluded', 'Owner-visible category summaries only', 'Reset clears taste but preserves safety records'],
    primarySurface: 'settings',
    entryPoints: [
      entry('settings', 'Open taste profile', 'Inspect and reset owner-only taste settings.', '/settings/taste-profile', true),
      entry('daily', 'Tune from Daily Picks', 'Use more and less signals without public objectification.', '/daily'),
    ],
    requiredConsent: ['private_taste'],
    privacyNotes: [
      'Private taste learning is off until the member explicitly enables it.',
      'Taste summaries are owner-only and never become public profile labels or scores.',
      'Events exclude private conversations, assessment answer text, GPS-level location, sensitive-trait guesses, and ranking internals.',
    ],
    aiFeatureKey: 'taste_profile',
    outputType: 'settings',
  }),
  defineSkill({
    id: 'private-recommendations',
    skillId: 'kesher-private-recommendations',
    title: 'Private Recommendations',
    shortTitle: 'Recommendations',
    subtitle: 'Permissioned Sharing & Privacy',
    icon: Users,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    status: 'prototype',
    category: 'privacy',
    description: 'Implements permissioned sharing, private taste profiles, staged disclosure patterns, and sensitive data exclusion schemas.',
    keyFeatures: ['Staged disclosure architecture', 'Sensitive data exclusion schemas', 'Consent flow design per sharing level', 'Private taste integration with recommendation engine'],
    primarySurface: 'daily',
    entryPoints: [
      entry('daily', 'Review recommendation controls', 'Keep Daily Picks finite and privacy-preserving.', '/daily', true),
      entry('settings', 'Manage private taste', 'Open owner-only recommendation settings.', '/settings/taste-profile'),
    ],
    requiredConsent: ['private_taste'],
    aiFeatureKey: 'taste_profile',
    outputType: 'settings',
  }),
  defineSkill({
    id: 'why-this-match',
    skillId: 'kesher-personality-why-match',
    title: 'Why This Match',
    shortTitle: 'Why Match',
    subtitle: 'Provenance-Labeled Explanations',
    icon: MessageSquare,
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    status: 'prototype',
    category: 'personality',
    description: 'Source-chip UI, signal allowlist enforcement, safe formulation patterns, and anti-leakage controls for match explanations.',
    keyFeatures: ['Source chips on explanation items', 'Short explanations per match', 'No percentages, personality scores, or certainty claims', 'Deterministic fallback templates when Gemini fails'],
    primarySurface: 'daily',
    entryPoints: [
      entry('daily', 'Understand a Daily Pick', 'Explain visible overlap without hidden signals.', '/daily', true),
      entry('match', 'Understand this match', 'Save a gentle insight after matching.', '/inbox'),
      entry('profile', 'Review visible reasons', 'Open profile detail explanation context.', '/daily'),
    ],
    requiredConsent: ['match_context'],
    aiFeatureKey: 'why_match',
    outputType: 'insight',
  }),
  defineSkill({
    id: 'permissioned-sharing',
    skillId: 'kesher-permissioned-sharing',
    title: 'Permissioned Sharing',
    shortTitle: 'Sharing',
    subtitle: 'Share Cards & Mutual Consent',
    icon: Users,
    color: 'bg-pink-100 text-pink-700 border-pink-200',
    status: 'prototype',
    category: 'privacy',
    description: 'Basic and deeper share cards, recipient-scoped previews, deeper card requests, mutual reflection flow, and revocation cascades.',
    keyFeatures: ['Preview exactly what will be shared', 'Scope limited to summary, strengths, and communication notes', 'Temporary sharing by default', 'Revoke path in two taps with cascades'],
    primarySurface: 'match',
    entryPoints: [
      entry('match', 'Preview a share card', 'Show exactly what would be shared before consent.', '/inbox', true),
      entry('chat', 'Request mutual context', 'Keep personality sharing permissioned in chat.', '/inbox'),
    ],
    requiredConsent: ['mutual_consent'],
    outputType: 'settings',
  }),
  defineSkill({
    id: 'compatibility-reflection',
    skillId: 'kesher-compatibility-reflection',
    title: 'Compatibility Reflection',
    shortTitle: 'Reflection',
    subtitle: 'Bilateral Personality Insights',
    icon: Heart,
    color: 'bg-rose-100 text-rose-700 border-rose-200',
    status: 'prototype',
    category: 'personality',
    description: 'Values alignment, communication lens, friction forecast, and growth-edge reflections with bilateral consent and anti-pattern enforcement.',
    keyFeatures: ['Mutual consent required from both parties', 'Reflection is a conversation starter only', 'No numeric fit ratings or certainty claims', 'Either party can remove the reflection'],
    primarySurface: 'match',
    entryPoints: [
      entry('match', 'Save match insight', 'Create a consent-aware reflection from a match sheet.', '/inbox', true),
      entry('chat', 'Open conversation lens', 'Use reflection without sending a message automatically.', '/inbox'),
    ],
    requiredConsent: ['mutual_consent'],
    aiFeatureKey: 'compatibility_reflection',
    safetyLevel: 'medium',
    outputType: 'reflection',
  }),
  defineSkill({
    id: 'explainable-ai',
    skillId: 'kesher-explainable-ai',
    title: 'Explainable AI',
    shortTitle: 'Explainability',
    subtitle: 'Trust Language & Transparency',
    icon: Lightbulb,
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    status: 'prototype',
    category: 'governance',
    description: 'Governs how Kesher AI communicates reasoning with whitelisted signals, privacy protection, and deterministic fallback behavior.',
    keyFeatures: ['Signal whitelist enforcement', 'Generative and deterministic fallback pipeline', 'Hebrew-first trust-building copy', 'Management controls alongside explanations'],
    primarySurface: 'ai-trust',
    entryPoints: [
      entry('ai-trust', 'Open explanation controls', 'See which AI features explain decisions.', '/settings/ai-trust', true),
      entry('daily', 'Inspect explanation chips', 'Review why-match copy in Daily Picks.', '/daily'),
    ],
    requiredConsent: ['none'],
    outputType: 'settings',
  }),
  defineSkill({
    id: 'filtering-marketplace',
    skillId: 'kesher-filtering-marketplace',
    title: 'Filtering & Marketplace',
    shortTitle: 'Filters',
    subtitle: 'Grammar, Reciprocal Ranking & Fairness',
    icon: ShoppingBag,
    color: 'bg-lime-100 text-lime-700 border-lime-200',
    status: 'prototype',
    category: 'ux',
    description: 'Filtering grammar, marketplace mechanics, reciprocal ranking, Daily Picks versus Explore boundaries, and anti-starvation exposure fairness.',
    keyFeatures: ['Hard dealbreaker versus soft preference grammar', 'Reciprocal scoring based on mutual interest', 'Daily Picks are curated and limited while Explore is user-directed', 'Impression caps and new-user boost for fairness'],
    primarySurface: 'explore',
    entryPoints: [
      entry('explore', 'Tune Explore filters', 'Adjust filters without turning people into scores.', '/explore', true),
      entry('daily', 'Reflect on Daily Picks', 'Use finite-picks reflection for calmer discovery.', '/daily'),
    ],
    requiredConsent: ['none'],
    outputType: 'settings',
  }),
  defineSkill({
    id: 'learned-taste',
    skillId: 'kesher-learned-taste',
    title: 'Learned Taste',
    shortTitle: 'Learned Taste',
    subtitle: 'Implicit & Explicit Preference Learning',
    icon: Activity,
    color: 'bg-green-100 text-green-700 border-green-200',
    status: 'prototype',
    category: 'ux',
    description: 'Event taxonomy, taste-weight calculation, dual memory, and hybrid on-device/server architecture for privacy-preserving preference learning.',
    keyFeatures: ['Explicit controls always outrank implicit signals', 'Fast and slow memory windows', 'Hybrid on-device cache and canonical server state', 'Messages, photos, and exact location excluded'],
    primarySurface: 'daily',
    entryPoints: [
      entry('daily', 'Adjust taste gently', 'Use more and less signals from Daily Picks.', '/daily', true),
      entry('settings', 'Reset learned taste', 'Open private taste controls.', '/settings/taste-profile'),
    ],
    requiredConsent: ['private_taste'],
    aiFeatureKey: 'taste_profile',
    outputType: 'settings',
  }),
  defineSkill({
    id: 'maps-date-planner',
    skillId: 'kesher-maps-date-planner',
    title: 'Maps Date Planner',
    shortTitle: 'Date Planner',
    subtitle: 'Google Maps-Grounded Date Planning',
    icon: Map,
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    status: 'prototype',
    category: 'platform',
    description: 'Google Maps-grounded date suggestions with fairness preview, observance-aware scheduling, safe-venue defaults, and accessibility concierge.',
    keyFeatures: ['Midpoint venue planning with travel-time fairness preview', 'Shabbat, kashrut, and holiday awareness', 'Coarse locations only, never exact address', 'Manual send only and never auto-sent to a match'],
    primarySurface: 'match',
    entryPoints: [
      entry('match', 'Plan a reviewed date', 'Draft safe venue options for a matched pair.', '/inbox', true),
      entry('chat', 'Draft date ideas', 'Place reviewed date ideas near the composer, never auto-send.', '/inbox'),
      entry('safety', 'Review date safety', 'Open date-safety planning guidance.', '/settings/safety'),
    ],
    requiredConsent: ['match_context'],
    aiFeatureKey: 'date_planner',
    safetyLevel: 'medium',
    outputType: 'draft',
  }),
  defineSkill({
    id: 'pacing-coach',
    skillId: 'kesher-pacing-coach',
    title: 'Pacing Coach',
    shortTitle: 'Pacing',
    subtitle: 'Anti-Burnout Discovery',
    icon: Coffee,
    color: 'bg-green-100 text-green-700 border-green-200',
    status: 'prototype',
    category: 'ux',
    description: 'Gentle dismissible pacing interventions based on session length, action velocity, and pass streaks. Never blocks access or uses pressure.',
    keyFeatures: ['Deterministic triggers with no identity inference', 'Always dismissible in one tap', 'Gemini failure produces no modal', 'Rate-limited supportive nudges'],
    primarySurface: 'daily',
    entryPoints: [
      entry('daily', 'Resume pacing reflection', 'Reflect after a finite Daily Picks session.', '/daily', true),
      entry('chat', 'Check conversation pace', 'Suggest calmer pacing without sending anything.', '/inbox'),
    ],
    requiredConsent: ['none'],
    aiFeatureKey: 'pacing_coach',
    outputType: 'reflection',
  }),
  defineSkill({
    id: 'ai-runtime-governance',
    skillId: 'kesher-ai-governance',
    title: 'AI Runtime Governance',
    shortTitle: 'AI Governance',
    subtitle: 'Vertex AI & ZDR Controls',
    icon: Sparkles,
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    status: 'prototype',
    category: 'governance',
    description: 'Provider routing decisions, zero-data-retention controls, structured outputs, App Check, feature registry, and provenance ledger.',
    keyFeatures: ['Vertex AI for personality-sensitive routes', 'Firebase AI Logic for non-sensitive features', 'Feature registry starts sensitive flags off', 'Provenance ledger schema per AI output'],
    primarySurface: 'ai-trust',
    entryPoints: [
      entry('ai-trust', 'Inspect AI controls', 'Review which skills use AI and what data they can use.', '/settings/ai-trust', true),
      entry('admin', 'Open AI ops', 'Internal governance view for operators only.', '/admin/ai-ops'),
    ],
    requiredConsent: ['admin_only'],
    safetyLevel: 'internal',
    outputType: 'reference',
  }),
  defineSkill({
    id: 'ai-feature-modules',
    skillId: 'kesher-ai-feature-modules',
    title: 'AI Feature Modules',
    shortTitle: 'AI Modules',
    subtitle: 'F01-F11 Feature Registry',
    icon: GitBranch,
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    status: 'prototype',
    category: 'governance',
    description: 'AI feature modules for bio coaching, values phrasing, taste profiles, Daily Picks, match explanations, pacing, moderation, scam detection, report intake, disclosure, and personality coaching.',
    keyFeatures: ['Feature registry with risk tiers', 'Model routing per feature', 'Consent requirements per feature', 'Data inputs and exclusions documented per module'],
    primarySurface: 'ai-trust',
    entryPoints: [
      entry('ai-trust', 'Review AI feature list', 'Control visible AI modules and data scopes.', '/settings/ai-trust', true),
      entry('profile-builder', 'Use profile coach module', 'Run profile completeness without sending hidden data.', '/profile/edit'),
    ],
    requiredConsent: ['ai_assist'],
    outputType: 'settings',
  }),
  defineSkill({
    id: 'gemini-integration',
    skillId: 'kesher-gemini-integration',
    title: 'Gemini Integration',
    shortTitle: 'Gemini',
    subtitle: 'Core Patterns & Server-Side Proxy',
    icon: Cpu,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    status: 'prototype',
    category: 'platform',
    description: 'Core Gemini patterns for structured outputs, function calling, grounding, system instructions, server-side proxy architecture, and trust-preserving interactions.',
    keyFeatures: ['Server-side only with no API keys in the client bundle', 'Structured JSON output for every feature', 'System instruction templates per feature class', 'Prompt sanitization before every call'],
    primarySurface: 'ai-trust',
    entryPoints: [
      entry('ai-trust', 'Inspect server-side AI', 'Explain that AI calls are server-routed.', '/settings/ai-trust', true),
      entry('admin', 'Open AI operations', 'Internal operator view of AI routes.', '/admin/ai-ops'),
    ],
    requiredConsent: ['admin_only'],
    safetyLevel: 'internal',
    outputType: 'reference',
  }),
  defineSkill({
    id: 'low-latency-ai',
    skillId: 'kesher-low-latency-ai',
    title: 'Low-Latency AI',
    shortTitle: 'Latency',
    subtitle: 'Server-Side Proxy Architecture',
    icon: Zap,
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    status: 'prototype',
    category: 'platform',
    description: 'Server-side AI proxy architecture for low-latency responses with model routing, streaming patterns, feature registry, and policy-aware request handling.',
    keyFeatures: ['Latency targets per feature tier', 'Streaming for longer outputs', 'Model routing matrix by sensitivity and cost', 'Policy-aware request gating'],
    primarySurface: 'ai-trust',
    entryPoints: [
      entry('ai-trust', 'Review AI responsiveness', 'Show fast-path versus careful-path controls.', '/settings/ai-trust', true),
      entry('admin', 'Inspect route health', 'Operator route and latency reference.', '/admin/ai-ops'),
    ],
    requiredConsent: ['admin_only'],
    safetyLevel: 'internal',
    outputType: 'reference',
  }),
  defineSkill({
    id: 'high-thinking-routing',
    skillId: 'kesher-high-thinking-routing',
    title: 'High-Thinking Routing',
    shortTitle: 'Thinking',
    subtitle: 'Gemini Thinking Mode Strategy',
    icon: Brain,
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    status: 'prototype',
    category: 'platform',
    description: 'Routing strategy for high-thinking model modes, including when to enable thinking controls, hybrid fast plus careful paths, and evaluation design.',
    keyFeatures: ['Thinking configuration guidance', 'Fast path plus careful-path hybrid pattern', 'A/B test framework for thinking-enabled features', 'Cost and latency trade-off matrix'],
    primarySurface: 'ai-trust',
    entryPoints: [
      entry('ai-trust', 'Review careful AI mode', 'Explain when Kesher uses deeper reasoning.', '/settings/ai-trust', true),
      entry('admin', 'Open experiment controls', 'Operator-only experiment settings.', '/admin/experiments'),
    ],
    requiredConsent: ['admin_only'],
    safetyLevel: 'internal',
    outputType: 'reference',
  }),
  defineSkill({
    id: 'grounded-search',
    skillId: 'kesher-grounded-search',
    title: 'Grounded Search',
    shortTitle: 'Search Grounding',
    subtitle: 'Google Search Integration',
    icon: Search,
    color: 'bg-teal-100 text-teal-700 border-teal-200',
    status: 'prototype',
    category: 'platform',
    description: 'Search grounding for Q&A, event discovery, safety resources, citation rendering, and URL-context features through server-side AI routes.',
    keyFeatures: ['Search-grounded Q&A with citations', 'Event discovery for date planning', 'Safety center resource grounding', 'Citation UI with source chips'],
    primarySurface: 'safety',
    entryPoints: [
      entry('safety', 'Open grounded safety help', 'Use cited safety resources without exposing private chat context.', '/settings/safety', true),
      entry('match', 'Ground date resources', 'Support reviewed date planning.', '/inbox'),
    ],
    requiredConsent: ['none'],
    aiFeatureKey: 'safety_advice',
    outputType: 'insight',
  }),
  defineSkill({
    id: 'image-analysis',
    skillId: 'kesher-image-analysis',
    title: 'Image Analysis',
    shortTitle: 'Photo Checks',
    subtitle: 'Trust-Forward Photo Checks',
    icon: Image,
    color: 'bg-rose-100 text-rose-700 border-rose-200',
    status: 'prototype',
    category: 'governance',
    description: 'Trust-forward image analysis for photo readiness checks, content moderation assistance, accessibility alt text, and moderation appeal support.',
    keyFeatures: ['Photo readiness checks, not attractiveness scoring', 'Content moderation assistance for human review', 'Accessibility alt-text generation', 'No attractiveness, race, or protected-trait inference'],
    primarySurface: 'profile-builder',
    entryPoints: [
      entry('profile-builder', 'Check photo readiness', 'Review profile photos for safety and clarity.', '/profile/edit', true),
      entry('safety', 'Review photo safety', 'Keep photo reporting guidance visible.', '/settings/safety'),
    ],
    requiredConsent: ['photo_analysis'],
    safetyLevel: 'medium',
    outputType: 'insight',
  }),
  defineSkill({
    id: 'voice-integration',
    skillId: 'kesher-voice-integration',
    title: 'Voice Integration',
    shortTitle: 'Voice',
    subtitle: 'Gemini Live API',
    icon: Mic,
    color: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
    status: 'prototype',
    category: 'platform',
    description: 'Voice AI integration using Gemini Live API patterns for ephemeral authentication, push-to-talk interfaces, and accessibility-focused voice features.',
    keyFeatures: ['Gemini Live API WebSocket session patterns', 'Ephemeral token auth only', 'Push-to-talk UI with accessibility labels', 'Graceful fallback when voice is unavailable'],
    primarySurface: 'chat',
    entryPoints: [
      entry('chat', 'Review voice prototype', 'Demo-disabled voice reference in chat context.', '/inbox', true),
      entry('ai-trust', 'Check voice permissions', 'Keep voice opt-in controls explicit.', '/settings/ai-trust'),
    ],
    requiredConsent: ['ai_assist'],
    aiFeatureKey: 'voice_reflection',
    outputType: 'reference',
    demoModeBehavior: 'Starts a reference panel only. No microphone session is opened in the prototype.',
  }),
  defineSkill({
    id: 'google-ai-studio-app-builder',
    skillId: 'google-ai-studio-app-builder',
    title: 'AI Studio App Builder',
    shortTitle: 'AI Studio',
    subtitle: 'Rapid Prototype Composition',
    icon: Cpu,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    status: 'prototype',
    category: 'platform',
    description: 'Captures AI Studio app-builder workflows for composing and iterating feature prototypes aligned to Kesher constraints.',
    keyFeatures: ['Prototype workflow guidance', 'Rapid feature scaffolding', 'Iteration loop for concept validation', 'Alignment with trust-forward constraints'],
    primarySurface: 'admin',
    entryPoints: [
      entry('admin', 'Open prototype controls', 'Operator-facing prototype reference.', '/admin/experiments', true),
      entry('skills', 'Review builder skill', 'Keep prototype builder context in the Skills library.', '/skills'),
    ],
    requiredConsent: ['admin_only'],
    safetyLevel: 'internal',
    outputType: 'reference',
  }),
  defineSkill({
    id: 'sparkmatch-dating-app-skill',
    skillId: 'sparkmatch-dating-app-skill',
    title: 'SparkMatch Dating App',
    shortTitle: 'Reference App',
    subtitle: 'Reference App Patterns',
    icon: Heart,
    color: 'bg-pink-100 text-pink-700 border-pink-200',
    status: 'prototype',
    category: 'platform',
    description: 'Reference skill package for dating-app flow patterns used as a comparative blueprint for feature-level UX and product decisions.',
    keyFeatures: ['Dating flow reference patterns', 'Feature-level UX blueprinting', 'Prototype parity checks', 'Decision-support examples'],
    primarySurface: 'admin',
    entryPoints: [
      entry('admin', 'Review reference patterns', 'Operator-only comparison patterns.', '/admin/experiments', true),
      entry('explore', 'Apply calm flow checks', 'Use reference patterns only through Kesher safety constraints.', '/explore'),
    ],
    requiredConsent: ['admin_only'],
    safetyLevel: 'internal',
    outputType: 'reference',
  }),
  defineSkill({
    id: 'video-generator',
    skillId: 'video-generator',
    title: 'Video Generator',
    shortTitle: 'Video',
    subtitle: 'Multimodal Prototype Utility',
    icon: Image,
    color: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
    status: 'prototype',
    category: 'platform',
    description: 'Prototype utility for video-generation workflows where multimodal outputs are needed for demos, storytelling, and concept validation.',
    keyFeatures: ['Video generation workflow reference', 'Multimodal demo support', 'Concept storytelling assets', 'Prototype-ready output guidance'],
    primarySurface: 'admin',
    entryPoints: [
      entry('admin', 'Review video controls', 'Operator-only reference; no member-facing fake generation.', '/admin/experiments', true),
      entry('ai-trust', 'Review media AI policy', 'Show media AI as controlled and opt-in only.', '/settings/ai-trust'),
    ],
    requiredConsent: ['admin_only'],
    safetyLevel: 'internal',
    aiFeatureKey: 'visual_icebreaker',
    outputType: 'reference',
    demoModeBehavior: 'Starts a reference state only. The prototype does not generate videos.',
  }),
  defineSkill({
    id: 'system-prompt',
    skillId: 'kesher-system-prompt',
    title: 'System Prompt',
    shortTitle: 'Prompt Policy',
    subtitle: 'Kesher OS Master Framework',
    icon: BookOpen,
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    status: 'prototype',
    category: 'governance',
    description: 'Kesher OS master framework for strategic evaluation, architecture design, execution planning, run modes, rubrics, and product red lines.',
    keyFeatures: ['Master system instruction architecture', 'Run mode switching', 'Evaluation rubrics per feature class', 'Product principles and red-line enforcement'],
    primarySurface: 'ai-trust',
    entryPoints: [
      entry('ai-trust', 'Review AI principles', 'Show that AI assists and never impersonates.', '/settings/ai-trust', true),
      entry('admin', 'Open operator controls', 'Operator-only prompt governance reference.', '/admin/ai-ops'),
    ],
    requiredConsent: ['admin_only'],
    safetyLevel: 'internal',
    outputType: 'reference',
  }),
  defineSkill({
    id: 'calm-ux',
    skillId: 'kesher-calm-ux',
    title: 'Calm UX',
    shortTitle: 'Calm UX',
    subtitle: 'Hebrew-First & Anti-Casino Design',
    icon: Palette,
    color: 'bg-stone-100 text-stone-700 border-stone-200',
    status: 'prototype',
    category: 'ux',
    description: 'Premium calm UX strategy for Hebrew-first RTL design, accessibility standards, and differentiation from pressure-based dating mechanics.',
    keyFeatures: ['Hebrew RTL layout system', 'No infinite-scroll pressure mechanics', 'Finite daily discovery batch', 'Calm color palette and typography system'],
    primarySurface: 'daily',
    entryPoints: [
      entry('daily', 'Reflect on calmer discovery', 'Support finite Daily Picks and mindful pacing.', '/daily', true),
      entry('explore', 'Review Explore calm controls', 'Keep Explore controlled and filter-led.', '/explore'),
    ],
    requiredConsent: ['none'],
    outputType: 'reflection',
  }),
  defineSkill({
    id: 'psychometric-validation',
    skillId: 'kesher-psychometric-validation',
    title: 'Psychometric Validation',
    shortTitle: 'Validation',
    subtitle: 'ESEM/Bifactor Pipeline',
    icon: Scale,
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    status: 'prototype',
    category: 'personality',
    description: 'Adaptation lab, reliability analysis, test-retest stability, response quality audit, measurement invariance, and incremental validity testing.',
    keyFeatures: ['ESEM and bifactor modeling pipeline', 'Measurement invariance across Hebrew and English', 'Test-retest reliability targets', 'Incremental validity over explicit preferences'],
    primarySurface: 'profile-builder',
    entryPoints: [
      entry('profile-builder', 'Validate assessment quality', 'Show quality checks around assessment completion.', '/settings/personality', true),
      entry('ai-trust', 'Review personality safeguards', 'Open AI transparency for personality features.', '/settings/ai-trust'),
    ],
    requiredConsent: ['profile_data'],
    outputType: 'reference',
  }),
  defineSkill({
    id: 'dark-pattern-audit',
    skillId: 'kesher-dark-pattern-audit',
    title: 'Dark Pattern Audit',
    shortTitle: 'Pattern Audit',
    subtitle: 'EU Taxonomy & Comprehension Tests',
    icon: FileCheck,
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    status: 'prototype',
    category: 'governance',
    description: 'Dark-pattern taxonomy audit, comprehension benchmarks, regret and surprise measures, and premium-boundary ethics verification.',
    keyFeatures: ['EU dark-pattern taxonomy', 'Comprehension test benchmarks', 'Regret and surprise measurement protocol', 'Premium boundary ethics review'],
    primarySurface: 'ai-trust',
    entryPoints: [
      entry('ai-trust', 'Audit consent design', 'Check AI and privacy controls for coercive patterns.', '/settings/ai-trust', true),
      entry('safety', 'Review safety access', 'Keep report and block actions direct.', '/settings/safety'),
    ],
    requiredConsent: ['none'],
    outputType: 'reference',
  }),
  defineSkill({
    id: 'personality-delivery',
    skillId: 'kesher-personality-delivery',
    title: 'Personality Delivery',
    shortTitle: 'Delivery',
    subtitle: 'Verification & Release Workflow',
    icon: GitBranch,
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    status: 'prototype',
    category: 'governance',
    description: 'Coordinates implementation handoff, verification, review, CI, and deployment checks for personality-related features across delivery paths.',
    keyFeatures: ['Verification matrix before release', 'Browser and CI check orchestration', 'Platform-aware delivery decisions', 'Explicit approval stop points for risky operations'],
    primarySurface: 'admin',
    entryPoints: [
      entry('admin', 'Open release controls', 'Operator-only delivery and verification view.', '/admin/experiments', true),
      entry('skills', 'Review release skill', 'Keep skill delivery visible in the Skills library.', '/skills'),
    ],
    requiredConsent: ['admin_only'],
    safetyLevel: 'internal',
    outputType: 'reference',
  }),
];

export const SKILL_DEFINITIONS = SKILLS;

export const SKILL_COUNTS = {
  live: SKILLS.filter((skill) => skill.status === 'live').length,
  prototype: SKILLS.filter((skill) => skill.status === 'prototype').length,
  planned: SKILLS.filter((skill) => skill.status === 'planned').length,
};

export const CATEGORY_LABELS: Record<'all' | SkillCategory, string> = {
  all: 'All',
  personality: 'Personality',
  privacy: 'Privacy & Consent',
  governance: 'Governance',
  ux: 'UX & Discovery',
  platform: 'Platform & AI',
};

export const SKILL_LIVE_ROUTES: Record<string, { path: string; label: string }> = SKILLS.reduce(
  (routes, skill) => {
    const point = skill.entryPoints.find((entryPoint) => entryPoint.route && entryPoint.featured)
      ?? skill.entryPoints.find((entryPoint) => entryPoint.route);
    if (point?.route) {
      routes[skill.id] = { path: point.route, label: point.label };
    }
    return routes;
  },
  {} as Record<string, { path: string; label: string }>,
);

export const getSkillById = (skillId: string) => SKILLS.find((skill) => skill.id === skillId);

export const getFeaturedSkills = () => SKILLS.filter((skill) => skill.featured);

/** Skills a signed-in member may see. Excludes operator/internal (admin) skills. */
export const getMemberVisibleSkills = () => SKILLS.filter((skill) => skill.audience === 'member');

/** Member-facing, launchable capabilities (real component + SkillsRouter case). */
export const getInteractiveSkills = () => (
  getMemberVisibleSkills().filter((skill) => skill.kind === 'interactive')
);

/** Member-facing, read-only explainer/governance material (not launchable). */
export const getReferenceSkills = () => (
  getMemberVisibleSkills().filter((skill) => skill.kind === 'reference')
);

export const getSkillsForSurface = (surface: SkillSurface, options?: { includeInternal?: boolean }) => (
  SKILLS.filter((skill) => {
    if (!options?.includeInternal && skill.safetyLevel === 'internal' && surface !== 'admin') return false;
    return skill.availableSurfaces.includes(surface) || skill.entryPoints.some((point) => point.surface === surface);
  })
);

export const getRecommendedSkillsForSurface = (
  surface: SkillSurface,
  options?: { limit?: number; includeInternal?: boolean },
) => getSkillsForSurface(surface, { includeInternal: options?.includeInternal })
  .sort((a, b) => Number(b.primarySurface === surface) - Number(a.primarySurface === surface))
  .slice(0, options?.limit ?? 4);

export const getSkillEntryPoint = (skill: SkillDefinition, surface: SkillSurface) => (
  skill.entryPoints.find((point) => point.surface === surface)
  ?? skill.entryPoints.find((point) => point.featured)
  ?? skill.entryPoints[0]
);

// ---------------------------------------------------------------------------
// PR 1 — truth-label helpers for hub grouping + launch gating.
// ---------------------------------------------------------------------------
export const INTERACTIVE_SURFACE_CLASSES: SkillSurfaceClass[] = [
  'member_interactive',
  'settings_control',
  'trust_safety',
];

/** A skill is launchable as a practice surface only if member-visible AND interactive. */
export const isInteractiveSkill = (skill: SkillDefinition): boolean =>
  skill.visibility === 'member_visible' && INTERACTIVE_SURFACE_CLASSES.includes(skill.surfaceClass);

/** Skills shown in the member-facing Hub (everything except `hidden`). */
export const SKILL_SECTIONS: { key: string; label: string; classes: SkillSurfaceClass[] }[] = [
  { key: 'interactive', label: 'Interactive Skills', classes: ['member_interactive'] },
  { key: 'controls', label: 'Settings & Controls', classes: ['settings_control'] },
  { key: 'trust', label: 'Trust & Safety', classes: ['trust_safety'] },
  { key: 'reference', label: 'Reference & Governance', classes: ['reference', 'research', 'operator', 'legal_privacy'] },
  { key: 'platform', label: 'Platform / Vendor', classes: ['platform_vendor'] },
];
