export type CompletionCategory =
  | 'identity'
  | 'discovery'
  | 'match'
  | 'trust_safety'
  | 'ai_runtime'
  | 'commercial'
  | 'engagement'
  | 'delivery';

export type CompletionStatus = 'operational' | 'prototype' | 'gated' | 'missing';

export type CompletionPriority = 'p0' | 'p1' | 'p2';

export interface ProductCompletionSkill {
  id: string;
  title: string;
  shortTitle: string;
  category: CompletionCategory;
  priority: CompletionPriority;
  status: CompletionStatus;
  summary: string;
  ownerSkill: string;
  implementationSurfaces: string[];
  acceptanceCriteria: string[];
  requiredPlugins: string[];
}

export interface DeepenedSkill {
  id: string;
  status: CompletionStatus;
  summary: string;
  productionDelta: string[];
  acceptanceCriteria: string[];
}

export interface CompletionGate {
  id: string;
  label: string;
  category: CompletionCategory;
  status: CompletionStatus;
  evidence: string[];
  nextAction: string;
}

export interface RecommendedPlugin {
  id: string;
  label: string;
  role: string;
  useWhen: string;
}

export const ADDED_PRODUCT_SKILLS: ProductCompletionSkill[] = [
  {
    id: 'kesher-identity-verification',
    title: 'Identity Verification',
    shortTitle: 'Identity',
    category: 'identity',
    priority: 'p0',
    status: 'gated',
    ownerSkill: 'skills/kesher-identity-verification/SKILL.md',
    summary: 'Production auth, profile verification signals, anti-impersonation review, pause/reactivation, and account rights.',
    implementationSurfaces: ['WelcomeScreen', 'SettingsScreen', 'SafetyCenter', 'Firestore user/private documents'],
    acceptanceCriteria: [
      'Authenticated users can complete onboarding and keep a verified profile state.',
      'Verification signals are visible without exposing documents or sensitive evidence.',
      'Pause, reactivation, export, correction, and deletion flows create auditable requests.',
    ],
    requiredPlugins: ['Google AI Studio App Builder', 'Build Web Apps', 'GitHub'],
  },
  {
    id: 'kesher-match-lifecycle',
    title: 'Match Lifecycle',
    shortTitle: 'Lifecycle',
    category: 'match',
    priority: 'p0',
    status: 'prototype',
    ownerSkill: 'skills/kesher-match-lifecycle/SKILL.md',
    summary: 'Like/pass/mutual-match/chat state machine with user-visible history and safe transition rules.',
    implementationSurfaces: ['DailyPicksScreen', 'ExploreScreen', 'MatchSheet', 'InboxScreen', 'ChatThread'],
    acceptanceCriteria: [
      'Likes, passes, matches, conversations, unmatches, and blocks are stateful and recoverable.',
      'No AI draft or date plan is auto-sent.',
      'History remains understandable after pause, block, report, or account deletion.',
    ],
    requiredPlugins: ['Build Web Apps', 'GitHub'],
  },
  {
    id: 'kesher-trust-safety-ops',
    title: 'Trust & Safety Ops',
    shortTitle: 'Safety Ops',
    category: 'trust_safety',
    priority: 'p0',
    status: 'prototype',
    ownerSkill: 'skills/kesher-trust-safety-ops/SKILL.md',
    summary: 'Report queue, moderation summaries, scam triage, photo checks, appeal states, escalation, and operator audit logs.',
    implementationSurfaces: ['SafetyCenter', 'ReportFlow', 'AIOpsScreen', 'server/trustRoutes.ts', 'server/aiRoutes.ts'],
    acceptanceCriteria: [
      'Reports, blocks, unmatches, appeals, and support contacts create immutable operator evidence.',
      'AI moderation summaries separate claims from evidence and never make final enforcement decisions.',
      'Safety records are retained separately from private taste and match explanations.',
    ],
    requiredPlugins: ['Google AI Studio App Builder', 'Codex Security', 'GitHub'],
  },
  {
    id: 'kesher-notifications',
    title: 'Notifications',
    shortTitle: 'Notify',
    category: 'engagement',
    priority: 'p1',
    status: 'missing',
    ownerSkill: 'skills/kesher-notifications/SKILL.md',
    summary: 'Preference-managed email, push, and SMS notifications for matches, messages, safety, date reminders, and consent changes.',
    implementationSurfaces: ['SettingsScreen', 'notification worker/API', 'email/SMS provider webhooks'],
    acceptanceCriteria: [
      'Members can opt in or out by notification class.',
      'Safety and consent-change notices are prioritized over growth messaging.',
      'Delivery attempts, failures, and unsubscribes are auditable.',
    ],
    requiredPlugins: ['Vercel', 'Build Web Apps'],
  },
  {
    id: 'kesher-subscription-entitlements',
    title: 'Subscription Entitlements',
    shortTitle: 'Entitlements',
    category: 'commercial',
    priority: 'p1',
    status: 'missing',
    ownerSkill: 'skills/kesher-subscription-entitlements/SKILL.md',
    summary: 'Pricing, premium gates, quotas, invoices, refunds, and abuse-resistant trial entitlement checks.',
    implementationSurfaces: ['SettingsScreen', 'entitlement service/API', 'billing webhooks'],
    acceptanceCriteria: [
      'Premium capability checks happen server-side and are reflected in UI state.',
      'Trials cannot bypass safety, identity, or consent gates.',
      'Refunds and entitlement changes are idempotent and auditable.',
    ],
    requiredPlugins: ['Build Web Apps', 'Vercel'],
  },
  {
    id: 'kesher-ai-evaluation-observability',
    title: 'AI Evaluation & Observability',
    shortTitle: 'AI Evals',
    category: 'ai_runtime',
    priority: 'p0',
    status: 'prototype',
    ownerSkill: 'skills/kesher-ai-evaluation-observability/SKILL.md',
    summary: 'Golden tests, red-team prompts, latency budgets, output-quality dashboards, route health, and model-quality release gates.',
    implementationSurfaces: ['AIOpsScreen', 'AI_FEATURE_REGISTRY', 'tests', 'scripts/redteam-personality.mjs'],
    acceptanceCriteria: [
      'Every AI route has a schema or contract test with privacy-exclusion assertions.',
      'Ops can see latency, fallback use, validator outcomes, and route ownership.',
      'Release gates fail closed when sensitive features lack tests or provenance.',
    ],
    requiredPlugins: ['Google AI Studio App Builder', 'OpenAI Developers', 'GitHub'],
  },
  {
    id: 'kesher-data-rights-retention',
    title: 'Data Rights & Retention',
    shortTitle: 'Data Rights',
    category: 'trust_safety',
    priority: 'p0',
    status: 'prototype',
    ownerSkill: 'skills/kesher-data-rights-retention/SKILL.md',
    summary: 'Export, correction, deletion, retention windows, evidence separation, and statutory privacy-rights audit trails.',
    implementationSurfaces: ['SettingsScreen', 'AITrustHub', 'server/trustRoutes.ts', 'server/shareRoutes.ts'],
    acceptanceCriteria: [
      'Export/delete/reset requests are accessible from settings and logged with status.',
      'Taste reset does not erase safety evidence.',
      'Private personality and taste records have explicit retention and revocation rules.',
    ],
    requiredPlugins: ['Google AI Studio App Builder', 'GitHub'],
  },
  {
    id: 'kesher-release-readiness',
    title: 'Release Readiness',
    shortTitle: 'Release',
    category: 'delivery',
    priority: 'p0',
    status: 'prototype',
    ownerSkill: 'skills/kesher-release-readiness/SKILL.md',
    summary: 'CI, smoke tests, deployment checklist, rollback, preview verification, monitoring, and launch-blocker tracking.',
    implementationSurfaces: ['docs/operator', 'scripts/smoke-deployment.mjs', 'AIOpsScreen', 'GitHub Actions'],
    acceptanceCriteria: [
      'Release dashboards show gate status for auth, discovery, AI, safety, data rights, and deployment.',
      'Preview and production smoke checks cover public, demo, and authenticated routes.',
      'Rollback steps and launch blockers are documented before production promotion.',
    ],
    requiredPlugins: ['GitHub', 'Vercel', 'Build Web Apps'],
  },
];

export const DEEPENED_EXISTING_SKILLS: DeepenedSkill[] = [
  {
    id: 'kesher-private-taste',
    status: 'prototype',
    summary: 'Owner-only preference learning already exists; production completion requires stricter event coverage and privacy-safe explanation boundaries.',
    productionDelta: ['real event ingestion', 'server canonical state', 'reset/export/delete audit', 'no hidden-signal explanations'],
    acceptanceCriteria: ['Taste events persist with consent.', 'Export/delete/reset work without leaking private ranking weights.'],
  },
  {
    id: 'kesher-learned-taste',
    status: 'prototype',
    summary: 'Implicit and explicit taste are wired into ranking; production completion requires calibrated weights, fairness checks, and pool-impact reporting.',
    productionDelta: ['explicit controls precedence', 'fast/slow memory tuning', 'fairness impact monitoring'],
    acceptanceCriteria: ['Explicit preferences outrank implicit signals.', 'Fairness dashboards detect starvation or over-personalization.'],
  },
  {
    id: 'kesher-private-recommendations',
    status: 'prototype',
    summary: 'Private ranking architecture is present; production completion requires reciprocal ranking, exposure fairness, and user-readable explanation provenance.',
    productionDelta: ['reciprocal ranking', 'finite Daily Picks quota', 'Explore versus Daily boundary', 'source-chip explanations'],
    acceptanceCriteria: ['Daily Picks are finite and explainable.', 'Explore remains user-directed and filter-led.'],
  },
  {
    id: 'kesher-personality-profile',
    status: 'prototype',
    summary: 'Private personality interpretation exists; production completion requires stable consent, export/delete, no-clinical-label tests, and bilingual copy review.',
    productionDelta: ['owner-only default', 'structured Gemini output', 'visibility integration', 'red-team tests'],
    acceptanceCriteria: ['Raw answers never enter match explanations.', 'Reflection copy avoids clinical and deterministic claims.'],
  },
  {
    id: 'kesher-personality-visibility',
    status: 'prototype',
    summary: 'Four-layer visibility rules are present; production completion requires enforcement at every browse, match, share, and admin surface.',
    productionDelta: ['field-level policy matrix', 'share preview', 'revocation cascades'],
    acceptanceCriteria: ['Members preview personality data before sharing.', 'Revocation removes shared cards from recipient views.'],
  },
  {
    id: 'kesher-compatibility-reflection',
    status: 'prototype',
    summary: 'Bilateral reflection has guardrails; production completion requires mutual-consent storage, removal, and anti-score contract tests.',
    productionDelta: ['mutual consent records', 'removal by either party', 'pair-level provenance ledger'],
    acceptanceCriteria: ['No compatibility scores or destiny claims.', 'Either party can remove the reflection.'],
  },
  {
    id: 'kesher-maps-date-planner',
    status: 'gated',
    summary: 'Date planning UI and API route exist; production completion requires real Maps/Places grounding, coarse location handling, and venue safety review.',
    productionDelta: ['Places integration', 'coarse midpoint planning', 'observance-aware scheduling', 'manual-send-only drafts'],
    acceptanceCriteria: ['Exact addresses are excluded.', 'Suggestions are public, source-backed, and never auto-sent.'],
  },
  {
    id: 'kesher-ai-governance',
    status: 'prototype',
    summary: 'Feature registry and route metadata exist; production completion requires dashboarded provenance, route health, and release-blocking tests.',
    productionDelta: ['provenance ledger', 'feature registry dashboard', 'ZDR/provider routing evidence'],
    acceptanceCriteria: ['Sensitive AI routes fail closed without consent.', 'Ops can identify route, model, fallback, and validator result.'],
  },
  {
    id: 'kesher-gemini-integration',
    status: 'prototype',
    summary: 'Server-routed Gemini APIs exist; production completion requires prompt/version tracking, schema validation, and provider-specific fallback behavior.',
    productionDelta: ['server-only secrets', 'structured output every route', 'prompt version metadata'],
    acceptanceCriteria: ['No client API keys.', 'Invalid AI JSON falls back to deterministic safe copy.'],
  },
  {
    id: 'kesher-explainable-ai',
    status: 'prototype',
    summary: 'Signal allowlists and validators exist; production completion requires explanation source chips everywhere decisions are explained.',
    productionDelta: ['source chips', 'signal whitelist enforcement', 'deterministic fallback templates'],
    acceptanceCriteria: ['No hidden ranking weights or private taste signals appear in explanations.'],
  },
];

export const PRODUCT_COMPLETION_GATES: CompletionGate[] = [
  {
    id: 'auth_onboarding_verification',
    label: 'Auth, Onboarding & Verification',
    category: 'identity',
    status: 'prototype',
    evidence: ['Firebase auth guard', 'onboarding flow', 'settings verification entry'],
    nextAction: 'Add production verification review states and anti-impersonation evidence handling.',
  },
  {
    id: 'real_discovery_marketplace',
    label: 'Real Discovery Marketplace',
    category: 'discovery',
    status: 'prototype',
    evidence: ['Daily Picks', 'Explore filters', 'learned taste ranking', 'hard-filter grammar'],
    nextAction: 'Persist reciprocal ranking, exposure fairness, empty states, and pool-impact telemetry.',
  },
  {
    id: 'match_chat_lifecycle',
    label: 'Match & Chat Lifecycle',
    category: 'match',
    status: 'prototype',
    evidence: ['Match sheet', 'Inbox', 'Chat thread', 'message coach routes'],
    nextAction: 'Make match transitions recoverable across like/pass/match/unmatch/block/report/delete.',
  },
  {
    id: 'trust_safety_operations',
    label: 'Trust & Safety Operations',
    category: 'trust_safety',
    status: 'prototype',
    evidence: ['Safety center', 'report flow', 'trust routes', 'moderation summary route'],
    nextAction: 'Add report queue states, appeals, operator assignment, and immutable evidence retention.',
  },
  {
    id: 'ai_runtime_governance',
    label: 'AI Runtime Governance',
    category: 'ai_runtime',
    status: 'prototype',
    evidence: ['AI feature registry', 'capability router', 'output validators', 'route metadata logs'],
    nextAction: 'Promote AI route health, provenance, prompt versions, and red-team status into release gates.',
  },
  {
    id: 'payments_entitlements',
    label: 'Payments & Entitlements',
    category: 'commercial',
    status: 'missing',
    evidence: ['Premium UI banner only'],
    nextAction: 'Add server-side entitlement checks, billing webhooks, subscription screens, and trial abuse controls.',
  },
  {
    id: 'notification_delivery',
    label: 'Notification Delivery',
    category: 'engagement',
    status: 'missing',
    evidence: ['Settings notification row only'],
    nextAction: 'Add preference-managed email, push, and SMS delivery with consent and safety priority rules.',
  },
  {
    id: 'observability_release_gates',
    label: 'Observability & Release Gates',
    category: 'delivery',
    status: 'prototype',
    evidence: ['CI docs', 'smoke scripts', 'prototype status page', 'AI Ops console'],
    nextAction: 'Block release when core journey, AI contract, safety, or privacy checks fail.',
  },
];

export const RECOMMENDED_PRODUCT_PLUGINS: RecommendedPlugin[] = [
  {
    id: 'google-ai-studio-app-builder',
    label: 'Google AI Studio App Builder',
    role: 'Gemini/Firebase hardening',
    useWhen: 'Keep generated AI Studio code server-side, deployable, and production-safe.',
  },
  {
    id: 'build-web-apps',
    label: 'Build Web Apps',
    role: 'React UI and testing',
    useWhen: 'Build responsive, accessible product surfaces and browser-verify core journeys.',
  },
  {
    id: 'vercel',
    label: 'Vercel',
    role: 'Deploy, env vars, functions, flags, cron, preview verification',
    useWhen: 'Ship preview and production releases with observable server/API behavior.',
  },
  {
    id: 'github',
    label: 'GitHub',
    role: 'CI, PRs, issues, release traceability',
    useWhen: 'Convert readiness gates into reviewable tasks and required checks.',
  },
  {
    id: 'supabase-neon-postgres',
    label: 'Supabase or Neon Postgres',
    role: 'Relational audit and marketplace analytics',
    useWhen: 'Use only if Firestore queries become too limited for matching, ops, audit, or reporting.',
  },
  {
    id: 'openai-developers',
    label: 'OpenAI Developers',
    role: 'Cross-provider evals and moderation experiments',
    useWhen: 'Compare AI contracts, moderation behavior, or agentic admin tooling across providers.',
  },
  {
    id: 'figma',
    label: 'Figma',
    role: 'RTL/mobile design system and trust UX review',
    useWhen: 'Finalize Hebrew-first flows, consent previews, and safety states before launch.',
  },
  {
    id: 'google-drive',
    label: 'Spreadsheets or Google Drive',
    role: 'Launch inventories and compliance matrices',
    useWhen: 'Keep research matrices, release checklists, and compliance inventories reviewable.',
  },
];

export const getCompletionStatusCounts = () =>
  PRODUCT_COMPLETION_GATES.reduce<Record<CompletionStatus, number>>(
    (counts, gate) => {
      counts[gate.status] += 1;
      return counts;
    },
    { operational: 0, prototype: 0, gated: 0, missing: 0 },
  );

export const getAddedSkillById = (id: string) =>
  ADDED_PRODUCT_SKILLS.find((skill) => skill.id === id);

export const getP0CompletionSkills = () =>
  ADDED_PRODUCT_SKILLS.filter((skill) => skill.priority === 'p0');

export const getLaunchBlockingGates = () =>
  PRODUCT_COMPLETION_GATES.filter((gate) => gate.status !== 'operational');
