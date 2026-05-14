import React from 'react';
import {
  ChevronLeft, ChevronRight, Shield, Brain, Users, Eye, Lock, Sparkles, Scale,
  FileCheck, Heart, Layers, FileText, Coffee, Fingerprint, Map, ShoppingBag,
  Lightbulb, Activity, Mic, Search, Image, Zap, BookOpen, Cpu, Palette,
  MessageSquare, GitBranch, Star,
} from 'lucide-react';

export interface SkillMeta {
  id: string;
  /** Matches the directory name in skills/ */
  skillId?: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  status: 'live' | 'prototype' | 'planned';
  description: string;
  category?: 'personality' | 'privacy' | 'governance' | 'ux' | 'platform';
  keyFeatures?: string[];
}

export const SKILLS: SkillMeta[] = [
  // ── Personality stack ──────────────────────────────────────────────────────
  {
    id: 'personality-assessment',
    skillId: 'kesher-bfas-assessment',
    title: 'Personality Assessment',
    subtitle: 'Progressive BFAS/IPIP Administration',
    icon: Brain,
    color: 'bg-violet-100 text-violet-700 border-violet-200',
    status: 'prototype',
    category: 'personality',
    description: 'Progressive personality questionnaire with save-and-resume, domain/facet scoring, quality checks, and bilingual reflection card generation.',
    keyFeatures: ['100-item BFAS or IPIP-NEO (public domain)', 'Reverse-keyed items with automatic scoring', 'Response quality gates before scoring', 'Save-and-resume in blocks of 10–15 items'],
  },
  {
    id: 'personality-profile',
    skillId: 'kesher-personality-profile',
    title: 'Personality Profile',
    subtitle: 'Private Reflection Cards',
    icon: FileText,
    color: 'bg-teal-100 text-teal-700 border-teal-200',
    status: 'prototype',
    category: 'personality',
    description: 'Translates deterministic BFAS domain/aspect scores into warm, private reflection cards via Gemini structured output. Owner-only by default.',
    keyFeatures: ['Domain + aspect cards in user\'s language', 'AI receives percentile bands only (not raw scores)', 'Forbidden: clinical language, fixed labels, match claims', 'Export, reset, and delete controls always visible'],
  },
  {
    id: 'personality-engine',
    skillId: 'kesher-personality-engine',
    title: 'Personality Engine',
    subtitle: 'BFAS Scoring & Reflection Pipeline',
    icon: Cpu,
    color: 'bg-violet-100 text-violet-700 border-violet-200',
    status: 'planned',
    category: 'personality',
    description: 'BFAS personality assessment system including test administration, deterministic scoring, reflection reports, compatibility comparisons, and personality-aware match explanations using Big Five Aspect Scales and Gemini structured outputs.',
    keyFeatures: ['Deterministic scoring (no LLM for scoring)', 'Structured output schemas for all reflection types', 'Versioned item bank with migration path', 'Bilingual Hebrew/English with invariance testing'],
  },
  {
    id: 'personality-research',
    skillId: 'kesher-personality-research',
    title: 'Personality Research',
    subtitle: 'Evidence & Claims Grounding',
    icon: BookOpen,
    color: 'bg-violet-100 text-violet-700 border-violet-200',
    status: 'planned',
    category: 'personality',
    description: 'Evidence-tagged grounding for personality claims, compatibility language, and trust copy so feature contracts remain scientifically and ethically defensible.',
    keyFeatures: ['Claim-evidence traceability', 'Research citation discipline', 'Compatibility language safety rails', 'Grounding checks for trust copy'],
  },
  {
    id: 'personality-ocean',
    skillId: 'kesher-personality-ocean',
    title: 'Personality & OCEAN',
    subtitle: 'Jewish Observance Integration',
    icon: Star,
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    status: 'prototype',
    category: 'personality',
    description: 'OCEAN model implementation integrated with Jewish observance layers and Hebrew-first localization. Generates culturally-aware compatibility reports and personality-based filtering with nuanced matching.',
    keyFeatures: ['OCEAN traits mapped to dating-relevant dimensions', 'Observance-layer signals overlay', 'Hebrew-first with RTL layout support', 'Cultural context in reflection cards'],
  },
  {
    id: 'personality-visibility',
    skillId: 'kesher-personality-visibility',
    title: 'Personality Visibility',
    subtitle: 'Four-Layer Visibility Model',
    icon: Eye,
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    status: 'prototype',
    category: 'personality',
    description: 'Defines which personality-derived data can appear at each surface: public browse, private owner, mutual-consent, or system-only. Governs all discovery, profile, match, settings, and chat surfaces.',
    keyFeatures: ['Public / private / mutual-consent / system-only layers', 'Per-surface field classification matrix', 'Discovery surfaces never show model-derived trait labels', 'ADR required for any visibility policy change'],
  },

  // ── Privacy & consent ──────────────────────────────────────────────────────
  {
    id: 'consent-ux',
    title: 'Consent UX',
    subtitle: 'Trust Hub & Grants Ledger',
    icon: Shield,
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    status: 'prototype',
    category: 'privacy',
    description: 'Section 11 consent gates, Trust Hub dashboard, grants ledger, revocation flows, and anti-dark-pattern consent microcopy.',
    keyFeatures: ['Section 11 (PPA) disclosure requirements', 'Pre-checked boxes forbidden; default OFF', 'Revocation in ≤2 taps from Trust Hub', 'Audit log of all consent events'],
  },
  {
    id: 'israeli-privacy',
    title: 'Israeli Privacy Compliance',
    subtitle: 'Amendment 13 & PPA Guidance',
    icon: Lock,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    status: 'prototype',
    category: 'privacy',
    description: 'Data classification matrix, Section 11 notice, access/correction/deletion rights, DPO triggers, and transfer-abroad controls.',
    keyFeatures: ['Sensitive data classification (personality, observance, orientation)', 'Section 11 / 13 / 14 statutory rights', 'DPO trigger conditions', 'Transfer-abroad safeguards'],
  },
  {
    id: 'privacy-recommendation',
    title: 'Privacy-Preserving Recommendation',
    subtitle: 'Three-Layer Architecture',
    icon: Layers,
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    status: 'prototype',
    category: 'privacy',
    description: 'Silent personalization, safe explanation, and permissioned personality layers with signal allowlists and anti-leakage controls.',
    keyFeatures: ['Three-layer signal architecture', 'Explanation layer only uses whitelisted reasons', 'Silent personalization never exposed to other users', 'Anti-leakage controls at every boundary'],
  },
  {
    id: 'private-taste',
    skillId: 'kesher-private-taste',
    title: 'Private Taste',
    subtitle: 'Owner-Only Preference Learning',
    icon: Fingerprint,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    status: 'prototype',
    category: 'privacy',
    description: 'Consent-gated implicit and explicit preference learning. Owner-only taste profile with editable controls, reset semantics, and strict explanation-layer separation.',
    keyFeatures: ['Explicit signals outrank implicit', 'Excluded: messages, photos, protected traits', 'Owner-visible category summaries (no raw weights)', 'Reset clears taste but preserves safety records'],
  },
  {
    id: 'private-recommendations',
    skillId: 'kesher-private-recommendations',
    title: 'Private Recommendations',
    subtitle: 'Permissioned Sharing & Privacy',
    icon: Users,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    status: 'planned',
    category: 'privacy',
    description: 'Implements permissioned sharing, private taste profiles, and privacy-preserving recommendations. Manages consent flows, staged disclosure patterns, and sensitive data exclusion schemas.',
    keyFeatures: ['Staged disclosure architecture', 'Sensitive data exclusion schemas', 'Consent flow design for each sharing level', 'Private taste integration with recommendation engine'],
  },

  // ── Match & explanation ────────────────────────────────────────────────────
  {
    id: 'why-this-match',
    skillId: 'kesher-personality-why-match',
    title: 'Why This Match',
    subtitle: 'Provenance-Labeled Explanations',
    icon: MessageSquare,
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    status: 'prototype',
    category: 'personality',
    description: 'Source chip UI, signal allowlist enforcement, safe formulation patterns, and anti-leakage controls for match explanations.',
    keyFeatures: ['Source chips on every explanation item', 'Max 3 explanation sentences per match', 'Forbidden: percentages, "AI thinks", personality scores', 'Fallback deterministic templates when Gemini fails'],
  },
  {
    id: 'permissioned-sharing',
    skillId: 'kesher-permissioned-sharing',
    title: 'Permissioned Sharing',
    subtitle: 'Share Cards & Mutual Consent',
    icon: Users,
    color: 'bg-pink-100 text-pink-700 border-pink-200',
    status: 'prototype',
    category: 'privacy',
    description: 'Basic/deeper share cards, recipient-scoped previews, deeper card requests, mutual reflection flow, and revocation cascades.',
    keyFeatures: ['Preview exactly what will be shared before sending', 'Scope: summary, strengths, communication notes', 'Expiry defaults to temporary', 'Revoke path ≤2 taps; cascades to mutual reflections'],
  },
  {
    id: 'compatibility-reflection',
    skillId: 'kesher-compatibility-reflection',
    title: 'Compatibility Reflection',
    subtitle: 'Bilateral Personality Insights',
    icon: Heart,
    color: 'bg-rose-100 text-rose-700 border-rose-200',
    status: 'prototype',
    category: 'personality',
    description: 'Values alignment, communication lens, friction forecast, and growth edge reflections with bilateral consent and anti-pattern enforcement.',
    keyFeatures: ['Mutual consent required from both parties', 'Reflection not prediction — conversation starter only', 'Forbidden: compatibility scores, soulmate claims', 'Either party can remove reflection at any time'],
  },
  {
    id: 'explainable-ai',
    skillId: 'kesher-explainable-ai',
    title: 'Explainable AI',
    subtitle: 'Trust Language & Transparency',
    icon: Lightbulb,
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    status: 'planned',
    category: 'governance',
    description: 'Governs how Kesher\'s AI communicates reasoning to users. Explanations use whitelisted signals, protect privacy, and fall back to deterministic templates when the model fails.',
    keyFeatures: ['Signal whitelist enforcement', 'Generative + deterministic fallback pipeline', 'Trust-building copy guidelines (Hebrew-first)', '"Less like this" and management controls alongside explanations'],
  },

  // ── Discovery & marketplace ────────────────────────────────────────────────
  {
    id: 'filtering-marketplace',
    skillId: 'kesher-filtering-marketplace',
    title: 'Filtering & Marketplace',
    subtitle: 'Grammar, Reciprocal Ranking & Fairness',
    icon: ShoppingBag,
    color: 'bg-lime-100 text-lime-700 border-lime-200',
    status: 'prototype',
    category: 'ux',
    description: 'Filtering grammar, marketplace mechanics, and reciprocal ranking. Covers hard vs. soft filters, Daily Picks vs. Explore surface distinction, and anti-starvation exposure fairness.',
    keyFeatures: ['Hard filter (dealbreaker) vs. soft preference grammar', 'Reciprocal scoring: harmonic mean of mutual interest', 'Daily Picks (curated, limited) vs. Explore (user-directed)', 'Impression caps and new-user boost for fairness'],
  },
  {
    id: 'learned-taste',
    skillId: 'kesher-learned-taste',
    title: 'Learned Taste',
    subtitle: 'Implicit & Explicit Preference Learning',
    icon: Activity,
    color: 'bg-green-100 text-green-700 border-green-200',
    status: 'prototype',
    category: 'ux',
    description: 'Event capture taxonomy, taste weight calculation, dual memory (fast/slow), and hybrid on-device/server architecture for privacy-preserving preference learning.',
    keyFeatures: ['Explicit controls always outrank implicit signals', 'Dual memory: fast (1–2 week) + slow (2–3 month) half-life', 'Hybrid: on-device cache + server canonical state', 'Messages, photos, and exact location excluded'],
  },
  {
    id: 'maps-date-planner',
    skillId: 'kesher-maps-date-planner',
    title: 'Maps Date Planner',
    subtitle: 'Google Maps-Grounded Date Planning',
    icon: Map,
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    status: 'planned',
    category: 'platform',
    description: 'Google Maps-grounded date suggestion with fairness preview, observance-aware scheduling, safe-venue defaults, and accessibility concierge. Plan is always user-reviewed before sending.',
    keyFeatures: ['Midpoint venue planning with travel-time fairness preview', 'Shabbat/kashrut/holiday awareness via @hebcal/core', 'Coarse locations only (neighborhood, not address)', 'Manual send only — never auto-sent to match'],
  },
  {
    id: 'pacing-coach',
    skillId: 'kesher-pacing-coach',
    title: 'Pacing Coach',
    subtitle: 'Anti-Burnout Discovery',
    icon: Coffee,
    color: 'bg-green-100 text-green-700 border-green-200',
    status: 'prototype',
    category: 'ux',
    description: 'Gentle, dismissible pacing interventions based on session length, swipe velocity, and pass streaks. Never blocks access, never shames, never uses scarcity pressure.',
    keyFeatures: ['Deterministic triggers (no AI inference)', 'Always dismissible in one tap', 'Gemini failure produces no modal', 'Rate-limited: nudges feel supportive, not nagging'],
  },

  // ── AI & Gemini infrastructure ────────────────────────────────────────────
  {
    id: 'ai-runtime-governance',
    skillId: 'kesher-ai-governance',
    title: 'AI Runtime Governance',
    subtitle: 'Vertex AI & ZDR Controls',
    icon: Sparkles,
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    status: 'prototype',
    category: 'governance',
    description: 'Provider routing decisions, zero-data-retention controls, structured outputs, App Check, feature registry, and provenance ledger.',
    keyFeatures: ['Vertex AI for all personality-sensitive routes (ZDR)', 'Firebase AI Logic for non-sensitive features', 'Feature registry: default OFF for all personality flags', 'Provenance ledger schema per AI output'],
  },
  {
    id: 'ai-feature-modules',
    skillId: 'kesher-ai-feature-modules',
    title: 'AI Feature Modules',
    subtitle: 'F01–F11 Feature Registry',
    icon: GitBranch,
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    status: 'planned',
    category: 'governance',
    description: 'All 11 AI feature modules (F01–F11): bio coaching, values phrasing, taste profiles, daily picks, match explanations, anti-burnout, moderation, scam detection, report intake, AI disclosure, and personality coaching.',
    keyFeatures: ['F01–F11 feature registry with risk tiers', 'Model routing per feature', 'Consent requirements per feature', 'Data inputs and exclusions documented per module'],
  },
  {
    id: 'gemini-integration',
    skillId: 'kesher-gemini-integration',
    title: 'Gemini Integration',
    subtitle: 'Core Patterns & Server-Side Proxy',
    icon: Cpu,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    status: 'planned',
    category: 'platform',
    description: 'Core patterns for Gemini integration: structured outputs, function calling, grounding, system instructions, server-side proxy architecture, and trust-preserving interaction patterns.',
    keyFeatures: ['Server-side only — no API keys in client bundle', 'Structured JSON output for every feature', 'System instruction templates per feature class', 'Prompt sanitization before every call'],
  },
  {
    id: 'low-latency-ai',
    skillId: 'kesher-low-latency-ai',
    title: 'Low-Latency AI',
    subtitle: 'Server-Side Proxy Architecture',
    icon: Zap,
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    status: 'planned',
    category: 'platform',
    description: 'Server-side AI proxy architecture for low-latency responses. Covers model routing matrix, latency targets, streaming patterns, feature registry, and policy-aware AI request handling.',
    keyFeatures: ['Latency targets per feature tier', 'Streaming for long-form outputs', 'Model routing matrix by sensitivity and cost', 'Policy-aware request gating'],
  },
  {
    id: 'high-thinking-routing',
    skillId: 'kesher-high-thinking-routing',
    title: 'High-Thinking Routing',
    subtitle: 'Gemini Thinking Mode Strategy',
    icon: Brain,
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    status: 'planned',
    category: 'platform',
    description: 'Routing strategy for Gemini "high thinking" mode. Covers when to enable thinking controls, configuring thinkingLevel/thinkingBudget, hybrid fast+thinking patterns, and A/B test design.',
    keyFeatures: ['thinkingLevel / thinkingBudget configuration', 'Fast path + deep-thinking hybrid pattern', 'A/B test framework for thinking-enabled features', 'Cost and latency trade-off decision matrix'],
  },
  {
    id: 'grounded-search',
    skillId: 'kesher-grounded-search',
    title: 'Grounded Search',
    subtitle: 'Google Search Integration',
    icon: Search,
    color: 'bg-teal-100 text-teal-700 border-teal-200',
    status: 'planned',
    category: 'platform',
    description: 'Google Search grounding integration for Q&A, event discovery, safety center resources, citation rendering, and URL context features using Gemini grounding capabilities.',
    keyFeatures: ['Search-grounded Q&A with citations', 'Event discovery for date planning', 'Safety center resource grounding', 'Citation UI with source chips'],
  },
  {
    id: 'image-analysis',
    skillId: 'kesher-image-analysis',
    title: 'Image Analysis',
    subtitle: 'Trust-Forward Photo Checks',
    icon: Image,
    color: 'bg-rose-100 text-rose-700 border-rose-200',
    status: 'planned',
    category: 'governance',
    description: 'Trust-forward image analysis for photo readiness checks, content moderation assistance, accessibility alt-text generation, and moderation appeal support with tiered decisioning.',
    keyFeatures: ['Photo readiness checks (not attractiveness scoring)', 'Content moderation assistance for human review', 'Accessibility alt-text generation', 'No attractiveness, race, or protected-trait inference'],
  },
  {
    id: 'voice-integration',
    skillId: 'kesher-voice-integration',
    title: 'Voice Integration',
    subtitle: 'Gemini Live API',
    icon: Mic,
    color: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
    status: 'planned',
    category: 'platform',
    description: 'Voice AI integration using the Gemini Live API. Covers WebSocket sessions, ephemeral token authentication, push-to-talk interfaces, and accessibility-focused voice features.',
    keyFeatures: ['Gemini Live API WebSocket sessions', 'Ephemeral token auth (no long-lived keys on client)', 'Push-to-talk UI with accessibility labels', 'Graceful fallback when voice unavailable'],
  },
  {
    id: 'google-ai-studio-app-builder',
    skillId: 'google-ai-studio-app-builder',
    title: 'AI Studio App Builder',
    subtitle: 'Rapid Prototype Composition',
    icon: Cpu,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    status: 'planned',
    category: 'platform',
    description: 'Captures Google AI Studio app-builder workflows for quickly composing and iterating feature prototypes aligned to Kesher constraints.',
    keyFeatures: ['AI Studio prototype workflows', 'Rapid feature scaffolding guidance', 'Iteration loop for concept validation', 'Alignment with trust-forward constraints'],
  },
  {
    id: 'sparkmatch-dating-app-skill',
    skillId: 'sparkmatch-dating-app-skill',
    title: 'SparkMatch Dating App',
    subtitle: 'Reference App Patterns',
    icon: Heart,
    color: 'bg-pink-100 text-pink-700 border-pink-200',
    status: 'planned',
    category: 'platform',
    description: 'Reference skill package for dating-app flow patterns used as a comparative prototype blueprint for feature-level UX and product decisions.',
    keyFeatures: ['Dating flow reference patterns', 'Feature-level UX blueprinting', 'Prototype parity checks', 'Decision-support examples'],
  },
  {
    id: 'video-generator',
    skillId: 'video-generator',
    title: 'Video Generator',
    subtitle: 'Multimodal Prototype Utility',
    icon: Image,
    color: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
    status: 'planned',
    category: 'platform',
    description: 'Prototype utility for video-generation workflows where multimodal outputs are needed for demos, storytelling, and concept validation.',
    keyFeatures: ['Video generation workflow reference', 'Multimodal demo support', 'Concept storytelling assets', 'Prototype-ready output guidance'],
  },
  {
    id: 'system-prompt',
    skillId: 'kesher-system-prompt',
    title: 'System Prompt',
    subtitle: 'Kesher OS Master Framework',
    icon: BookOpen,
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    status: 'planned',
    category: 'governance',
    description: 'Kesher OS master prompt and strategic framework. Deep research, strategic evaluation, architecture design, and execution planning. Covers run modes, evaluation rubrics, product principles, and connector design.',
    keyFeatures: ['Master system instruction architecture', 'Run mode switching (prototype / production)', 'Evaluation rubrics per feature class', 'Product principles and red-line enforcement'],
  },

  // ── UX ─────────────────────────────────────────────────────────────────────
  {
    id: 'calm-ux',
    skillId: 'kesher-calm-ux',
    title: 'Calm UX',
    subtitle: 'Hebrew-First & Anti-Casino Design',
    icon: Palette,
    color: 'bg-stone-100 text-stone-700 border-stone-200',
    status: 'planned',
    category: 'ux',
    description: 'Premium calm UX strategy: Hebrew-first RTL design, calm aesthetic principles, accessibility standards, and competitive differentiation against casino-mechanic dating apps.',
    keyFeatures: ['Hebrew RTL layout system', 'No infinite scroll / casino mechanics', 'Finite daily discovery batch', 'Calm color palette and typography system'],
  },

  // ── Quality & validation ───────────────────────────────────────────────────
  {
    id: 'psychometric-validation',
    title: 'Psychometric Validation',
    subtitle: 'ESEM/Bifactor Pipeline',
    icon: Scale,
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    status: 'prototype',
    category: 'personality',
    description: 'Adaptation lab, reliability analysis, test-retest stability, response quality audit, measurement invariance, and incremental validity testing.',
    keyFeatures: ['ESEM / bifactor modeling pipeline', 'Measurement invariance across Hebrew/English', 'Test-retest reliability targets', 'Incremental validity over explicit preferences'],
  },
  {
    id: 'dark-pattern-audit',
    title: 'Dark Pattern Audit',
    subtitle: 'EU Taxonomy & Comprehension Tests',
    icon: FileCheck,
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    status: 'prototype',
    category: 'governance',
    description: 'Six-category dark pattern taxonomy audit, comprehension benchmarks, regret/surprise measures, and premium boundary ethics verification.',
    keyFeatures: ['EU six-category dark pattern taxonomy', 'Comprehension test benchmarks', 'Regret/surprise measurement protocol', 'Premium boundary ethics review'],
  },
  {
    id: 'personality-delivery',
    skillId: 'kesher-personality-delivery',
    title: 'Personality Delivery',
    subtitle: 'Verification & Release Workflow',
    icon: GitBranch,
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    status: 'planned',
    category: 'governance',
    description: 'Coordinates implementation handoff, verification, review, CI, and deployment checks for personality-related features across supported delivery paths.',
    keyFeatures: ['Verification matrix before release', 'Browser + CI check orchestration', 'Platform-aware delivery decisions', 'Explicit approval stop points for risky ops'],
  },
];

// ── Computed stats ─────────────────────────────────────────────────────────────
export const SKILL_COUNTS = {
  live: SKILLS.filter(s => s.status === 'live').length,
  prototype: SKILLS.filter(s => s.status === 'prototype').length,
  planned: SKILLS.filter(s => s.status === 'planned').length,
};

const statusBadge = (status: SkillMeta['status']) => {
  const map = {
    live: 'bg-green-100 text-green-700 border-green-200',
    prototype: 'bg-amber-100 text-amber-700 border-amber-200',
    planned: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return map[status];
};

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
  personality: 'Personality',
  privacy: 'Privacy & Consent',
  governance: 'Governance',
  ux: 'UX & Discovery',
  platform: 'Platform & AI',
};

export const SkillsHub: React.FC<{ onBack: () => void; onSelect: (id: string) => void }> = ({ onBack, onSelect }) => {
  const [activeCategory, setActiveCategory] = React.useState<string>('all');

  const filtered = activeCategory === 'all'
    ? SKILLS
    : SKILLS.filter(s => s.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2926]">
      <header className="sticky top-0 z-10 bg-[#FDFCFB]/95 backdrop-blur-sm px-6 py-4 flex items-center gap-4 border-b border-[#F3EFEA]">
        <button onClick={onBack} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
          <ChevronLeft size={20} />
        </button>
        <div className="space-y-0.5">
          <h1 className="text-xl font-serif italic">Kesher Skills Hub</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">
            Privacy-First Personality Architecture
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Hero */}
        <section className="p-6 bg-[#2D2926] rounded-[32px] text-white space-y-4">
          <div className="flex items-center gap-2 text-[#D4AF37]">
            <Sparkles size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Integrated Skill Modules</span>
          </div>
          <h2
            className="text-lg font-serif italic leading-snug"
            data-testid="skills-hub-count"
            data-skill-count={SKILLS.length}
          >
            {SKILLS.length} interconnected capabilities powering Kesher's trust-forward personality system
          </h2>
          <p className="text-sm text-white/60 leading-relaxed italic">
            Each skill module enforces privacy boundaries, Israeli Amendment 13 compliance, and scientific rigor.
            Tap any module to explore its architecture, rules, and interactive prototype.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            {SKILL_COUNTS.live > 0 && (
              <span className="px-3 py-1 bg-green-900/30 text-green-300 text-[9px] font-bold uppercase tracking-widest rounded-full border border-green-700/30">
                Live: {SKILL_COUNTS.live}
              </span>
            )}
            <span className="px-3 py-1 bg-amber-900/30 text-amber-300 text-[9px] font-bold uppercase tracking-widest rounded-full border border-amber-700/30">
              Prototype: {SKILL_COUNTS.prototype}
            </span>
            <span className="px-3 py-1 bg-slate-700/30 text-slate-300 text-[9px] font-bold uppercase tracking-widest rounded-full border border-slate-600/30">
              Planned: {SKILL_COUNTS.planned}
            </span>
          </div>
        </section>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${
                activeCategory === key
                  ? 'bg-[#2D2926] text-white border-[#2D2926]'
                  : 'bg-white text-[#8C7E6E] border-[#F3EFEA] hover:border-[#D4AF37]/40'
              }`}
            >
              {label}
              {key !== 'all' && (
                <span className="ml-1.5 opacity-60">
                  {SKILLS.filter(s => s.category === key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((skill) => {
            const Icon = skill.icon;
            return (
              <button
                key={skill.id}
                onClick={() => onSelect(skill.id)}
                className="text-left p-5 bg-white border border-[#F3EFEA] rounded-[24px] shadow-sm hover:shadow-md hover:border-[#D4AF37]/30 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${skill.color}`}>
                    <Icon size={18} />
                  </div>
                  <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded-full border ${statusBadge(skill.status)}`}>
                    {skill.status}
                  </span>
                </div>
                <div className="mt-3 space-y-1">
                  <h3 className="font-bold text-sm text-[#2D2926] group-hover:text-[#D4AF37] transition-colors">
                    {skill.title}
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">
                    {skill.subtitle}
                  </p>
                  <p className="text-xs text-[#6B5E52] leading-relaxed mt-2">
                    {skill.description}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore <ChevronRight size={12} />
                </div>
              </button>
            );
          })}
        </section>
      </main>
    </div>
  );
};
