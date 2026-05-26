# Kesher Skills Reference

This document is a concise reference for all 43 Kesher skills. It can be pasted as a context document in Google AI Studio, used in the Vercel prototype review, or shared with implementation agents.

## Skill 1 — google-ai-studio-app-builder

**Source:** `skills/google-ai-studio-app-builder/SKILL.md`

Build, deploy, and harden full-stack AI applications using Google AI Studio. Use when prototyping with Build mode, designing prompt-to-code apps, integrating Firebase AI Logic, deploying to Cloud Run, or following the 7-day hardening plan from prototype to MVP.

## Skill 2 — kesher-ai-evaluation-observability

**Source:** `skills/kesher-ai-evaluation-observability/SKILL.md`

Add Kesher AI evals, red-team prompts, latency budgets, output-quality dashboards, route health, and release-blocking model governance.

## Skill 3 — kesher-ai-feature-modules

**Source:** `skills/kesher-ai-feature-modules/SKILL.md`

All 11 AI feature modules for the Kesher dating app. Use when implementing, evaluating, or deploying a specific feature module such as bio coaching, values phrasing, taste profiles, daily picks, match explanations, anti-burnout, moderation, scam detection, report intake, AI disclosure, or personality coaching.

## Skill 4 — kesher-ai-governance

**Source:** `skills/kesher-ai-governance/SKILL.md`

Implement Kesher AI feature allocation, system boundaries, registry governance, model routing, human-in-the-loop triggers, and safety policy enforcement. Use when changing AI feature registry entries, model route choices, trust hub copy, policy checks, or governance docs.

## Skill 5 — kesher-bfas-assessment

**Source:** `skills/kesher-bfas-assessment/SKILL.md`

Implement and review Kesher's opt-in English IPIP-BFAS 100 / Big Five Aspects assessment prototype, deterministic scoring, answer handling, consent copy, reset/delete behavior, and non-clinical dating-style framing. Use when changing PersonalityAssessment, personality score types, onboarding assessment flows, prototype scoring, persistence for answers or bands, or tests for BFAS scoring and assessment privacy.

## Skill 6 — kesher-calm-ux

**Source:** `skills/kesher-calm-ux/SKILL.md`

Design premium calm UX for the Kesher dating app. Use when designing screens, user flows, onboarding, profile builders, matching interfaces, safety tools, Hebrew-first RTL layouts, accessibility standards, and anti-casino dating mechanics.

## Skill 7 — kesher-compatibility-reflection

**Source:** `skills/kesher-compatibility-reflection/SKILL.md`

Implement and review Kesher's mutual-consent compatibility reflection engine, pair insight schemas, consent gates, whitelisted shared inputs, and no-score safety validation. Use when changing compatibility-reflection API routes, PairInsightReportSchema, compatibility prompts, match-sheet reflection UI, consent checks, or tests for forbidden compatibility language.

## Skill 8 — kesher-consent-ux

**Source:** `skills/kesher-consent-ux/SKILL.md`

Design and review Kesher consent UX for personality, AI, sharing, private taste, and Trust Hub flows. Use when changing consent gates, sensitive toggles, grants/revocation copy, consent history, onboarding or settings consent surfaces, or anti-dark-pattern behavior.

## Skill 9 — kesher-dark-pattern-audit

**Source:** `skills/kesher-dark-pattern-audit/SKILL.md`

Audit Kesher consent, privacy, personality, premium, onboarding, and sharing UI for dark patterns and coercive mechanics. Use when reviewing sensitive toggles, consent flows, revocation, account deletion, premium boundaries, or discovery pacing.

## Skill 10 — kesher-data-rights-retention

**Source:** `skills/kesher-data-rights-retention/SKILL.md`

Implement Kesher export, correction, deletion, retention windows, evidence separation, and privacy-rights audit trails.

## Skill 11 — kesher-explainable-ai

**Source:** `skills/kesher-explainable-ai/SKILL.md`

Implement Kesher trust language, explanation provenance, and transparency for AI recommendations. Use when generating safe explanations, source chips, signal allowlists, fallback templates, or management controls for why-match and recommendation surfaces.

## Skill 12 — kesher-filtering-marketplace

**Source:** `skills/kesher-filtering-marketplace/SKILL.md`

Implement Kesher filtering grammar, discovery marketplace mechanics, reciprocal recommendation ordering, Daily Picks versus Explore distinctions, hard and soft filters, exposure fairness, and anti-starvation safeguards.

## Skill 13 — kesher-gemini-integration

**Source:** `skills/kesher-gemini-integration/SKILL.md`

Integrate Gemini AI into Kesher with structured outputs, function calling, grounding, system instructions, server-side proxy architecture, trust-preserving interaction patterns, and safe fallback behavior.

## Skill 14 — kesher-grounded-search

**Source:** `skills/kesher-grounded-search/SKILL.md`

Use Google Search grounding in Kesher for cited safety Q&A, event discovery, curated URL context, source rendering, and freshness-sensitive prototype flows without turning search into people-finding or background-check tooling.

## Skill 15 — kesher-high-thinking-routing

**Source:** `skills/kesher-high-thinking-routing/SKILL.md`

Route Kesher Gemini thinking-mode work. Use when deciding when to enable high-thinking controls, configuring thinking budgets, designing fast-plus-thinking patterns, or planning A/B tests for reasoning-heavy AI features.

## Skill 16 — kesher-identity-verification

**Source:** `skills/kesher-identity-verification/SKILL.md`

Implement Kesher production auth, profile verification signals, anti-impersonation review, pause/reactivation, and account rights flows.

## Skill 17 — kesher-image-analysis

**Source:** `skills/kesher-image-analysis/SKILL.md`

Implement trust-forward image analysis for Kesher photo readiness, accessibility alt text, moderation assistance, appeal support, tiered human review, and protected-trait/attractiveness safety boundaries.

## Skill 18 — kesher-israeli-privacy

**Source:** `skills/kesher-israeli-privacy/SKILL.md`

Review Kesher implementation choices against Israeli privacy-sensitive data guardrails for personality, observance, relationship intent, compatibility reflection, AI inference, export, correction, deletion, and transfer-abroad risk. Use for implementation review only, not legal advice.

## Skill 19 — kesher-learned-taste

**Source:** `skills/kesher-learned-taste/SKILL.md`

Implement Kesher implicit and explicit preference learning, taste profiles, event capture, taste weights, and hybrid on-device/server recommendation architecture while preserving privacy and user controls.

## Skill 20 — kesher-low-latency-ai

**Source:** `skills/kesher-low-latency-ai/SKILL.md`

Design server-side AI proxy architecture for low-latency Kesher responses. Use when implementing model routing matrices, latency targets, streaming patterns, feature registry routing, and policy-aware AI request handling.

## Skill 21 — kesher-maps-date-planner

**Source:** `skills/kesher-maps-date-planner/SKILL.md`

Build Google Maps-grounded Kesher date planning with venue suggestions, fairness previews, observance-aware scheduling, safe-venue defaults, accessibility-conscious planning, citation UI, and user-reviewed sending.

## Skill 22 — kesher-match-lifecycle

**Source:** `skills/kesher-match-lifecycle/SKILL.md`

Implement Kesher like/pass/match/chat lifecycle state machines, history, and safe transitions across block, report, unmatch, pause, and delete.

## Skill 23 — kesher-notifications

**Source:** `skills/kesher-notifications/SKILL.md`

Implement Kesher notification preferences and delivery for matches, messages, safety events, date reminders, and consent/share changes.

## Skill 24 — kesher-pacing-coach

**Source:** `skills/kesher-pacing-coach/SKILL.md`

Implement and review Kesher's anti-burnout pacing coach, including swipe/session signals, gentle dismissible interventions, PacingInterventionSchema, prompt safety, and non-manipulative UX. Use when changing pacing_coach registry entries, pacing-intervention routes, discovery session tracking, or break/reflection UI.

## Skill 25 — kesher-permissioned-sharing

**Source:** `skills/kesher-permissioned-sharing/SKILL.md`

Implement and review Kesher's permissioned personality sharing flows: previewable share cards, recipient/scope selection, expiry, revoke, audit copy, and mutual-consent disclosure. Use when building personality share-card UI, share/revoke APIs, privacy settings, trust hub controls, or data models for temporary personality access.

## Skill 26 — kesher-personality-delivery

**Source:** `skills/kesher-personality-delivery/SKILL.md`

Coordinate implementation, verification, review, CI, deployment, and platform parity for Kesher personality features using the appropriate repo, browser, CI, review, deploy, database, and native-app plugins. Use after or during personality feature work when planning tasks, running checks, opening browser flows, preparing GitHub/CircleCI/CodeRabbit review, or considering Netlify/Vercel/Cloudflare/Neon/Expo/iOS/macOS delivery.

## Skill 27 — kesher-personality-engine

**Source:** `skills/kesher-personality-engine/SKILL.md`

Implement Kesher personality measurement, deterministic scoring, private reflection reports, mutual-consent discussion prompts, and provenance-labeled match explanations using Big Five or BFAS-style structures without deterministic fit claims.

## Skill 28 — kesher-personality-ocean

**Source:** `skills/kesher-personality-ocean/SKILL.md`

Implement Kesher OCEAN/Big Five personality reflection with Jewish observance context and Hebrew-first localization. Use when generating culturally aware reflection cards, consent-scoped discovery experiments, or non-deterministic personality interpretation.

## Skill 29 — kesher-personality-profile

**Source:** `skills/kesher-personality-profile/SKILL.md`

Implement and review Kesher's private personality profile interpreter, including Gemini structured output, Hebrew-first insight cards, fallback rendering, provenance, and user controls. Use when changing personality-profile routes, PersonalityProfileScreen, PersonalitySummarySchema, personality prompts, output validators, or AI Trust Hub copy for personality insights.

## Skill 30 — kesher-personality-research

**Source:** `skills/kesher-personality-research/SKILL.md`

Convert Kesher personality PDF dossiers and research findings into implementable, evidence-labeled product and engineering guidance. Use when grounding Kesher BFAS/Big Five measurement, instrument licensing, Hebrew feasibility, Israeli privacy, consent, visibility, permissioned sharing, Gemini/Vertex runtime governance, validation gates, repository delivery, or trust-forward personality feature decisions from the PDF corpus.

## Skill 31 — kesher-personality-visibility

**Source:** `skills/kesher-personality-visibility/SKILL.md`

Design and implement Kesher's personality visibility model across browse, profile, match, settings, and chat surfaces. Use when deciding what personality-derived data can appear publicly, privately, or after mutual consent; when changing profile cards, ProfileDetail, DailyPicks, AITrustHub, PrivateTasteProfile, Settings, or visibility copy.

## Skill 32 — kesher-personality-why-match

**Source:** `skills/kesher-personality-why-match/SKILL.md`

Implement and review personality-safe "Why This Match" explanations for Kesher using whitelisted visible signals, structured Gemini output, uncertainty notes, and leakage prevention. Use when changing explain-match routes, WhyThisMatchPayloadSchema, output validators, DailyPicks/ProfileCard explanation UI, or reason-code generation for personality-aware recommendations.

## Skill 33 — kesher-privacy-preserving-recommendation

**Source:** `skills/kesher-privacy-preserving-recommendation/SKILL.md`

Implement Kesher recommendation architecture with silent personalization, safe explanations, permissioned personality boundaries, anti-leakage controls, and release gates before any personality-informed ordering.

## Skill 34 — kesher-private-recommendations

**Source:** `skills/kesher-private-recommendations/SKILL.md`

Implement Kesher permissioned sharing, private taste profiles, privacy-preserving recommendations, staged disclosure, consent flows, and sensitive-data exclusion schemas without leaking private recommender state.

## Skill 35 — kesher-private-taste

**Source:** `skills/kesher-private-taste/SKILL.md`

Implement and review Kesher's owner-only private taste learning for personality-aware recommendations, including consent, event minimization, editable/resettable taste profile UI, recommender inputs, and no-leak explanations. Use when changing taste_profile routes, PrivateTasteProfile, recommendation feedback, more/less-like-this controls, taste schemas, or private recommendation copy.

## Skill 36 — kesher-psychometric-validation

**Source:** `skills/kesher-psychometric-validation/SKILL.md`

Gate Kesher personality assessment, scoring, interpretation, ranking, and compatibility claims through psychometric validation requirements. Use when changing assessment items, scoring, Hebrew/English adaptation, reliability claims, invariance, ranking use, or release readiness.

## Skill 37 — kesher-release-readiness

**Source:** `skills/kesher-release-readiness/SKILL.md`

Implement Kesher CI, smoke tests, deployment checklist, rollback, preview verification, monitoring, and launch blocker tracking.

## Skill 38 — kesher-subscription-entitlements

**Source:** `skills/kesher-subscription-entitlements/SKILL.md`

Implement Kesher subscriptions, premium gates, quotas, billing webhooks, refunds, and abuse-resistant trials.

## Skill 39 — kesher-system-prompt

**Source:** `skills/kesher-system-prompt/SKILL.md`

Use the Kesher OS strategic framework for deep research, product evaluation, architecture design, execution planning, run modes, evaluation rubrics, product principles, platform role assignments, and connector design.

## Skill 40 — kesher-trust-safety-ops

**Source:** `skills/kesher-trust-safety-ops/SKILL.md`

Build Kesher trust and safety operations, including report queue, moderation summaries, scam triage, photo checks, appeals, escalation, and audit logs.

## Skill 41 — kesher-voice-integration

**Source:** `skills/kesher-voice-integration/SKILL.md`

Implement Kesher voice features with push-to-talk Gemini Live sessions, ephemeral token authentication, transcript visibility, accessibility support, and no emotional companion or auto-send behavior.

## Skill 42 — sparkmatch-dating-app-skill

**Source:** `skills/sparkmatch-dating-app-skill/SKILL.md`

Reference dating-app architecture skill for comparing Kesher prototype decisions against swipe-flow, real-time chat, matching, moderation, and subscription patterns without importing hot-or-not mechanics.

## Skill 43 — video-generator

**Source:** `skills/video-generator/SKILL.md`

Create shareable Kesher prototype walkthrough videos, stakeholder demos, cinematic explainers, and review assets while preserving privacy, consent, and no-impersonation boundaries.


## Global Safety Contract

- Use reflection, tendencies, possible strengths/friction, and uncertainty-aware copy.
- Do not use public rankings, public exact values, hidden fit meters, certainty claims, or production activation from the prototype.
- Keep English IPIP-BFAS scoring prototype-only; Hebrew validation remains pending.
