# Kesher Personality Skills Bundle

Generated: 2026-05-25T23:19:36.583Z

This shareable bundle contains 43 implementable skills from the canonical `skills/` folder.

---

# google-ai-studio-app-builder

Source: `skills/google-ai-studio-app-builder/SKILL.md`

---
name: google-ai-studio-app-builder
description: "Build, deploy, and harden full-stack AI applications using Google AI Studio. Use when prototyping with Build mode, designing prompt-to-code apps, integrating Firebase AI Logic, deploying to Cloud Run, or following the 7-day hardening plan from prototype to MVP."
---

# Google AI Studio App Builder

Use this skill as a compact implementation pointer for Google AI Studio sourced prototypes. Keep GitHub as the durable handoff, move secrets server-side, add CI gates before production, and verify exported code in the repo before shipping.

---

# kesher-ai-evaluation-observability

Source: `skills/kesher-ai-evaluation-observability/SKILL.md`

---
name: kesher-ai-evaluation-observability
description: Add Kesher AI evals, red-team prompts, latency budgets, output-quality dashboards, route health, and release-blocking model governance.
---

# Kesher AI Evaluation & Observability

Use this skill for AI runtime hardening.

## Requirements

- Every AI route needs schema validation, fallback behavior, privacy exclusions, and unsafe-output tests.
- Log feature id, route, model, fallback status, validator result, latency bucket, and prompt version.
- Sensitive routes must fail closed when consent, provenance, or policy gates are missing.
- Red-team prompts should cover private taste leakage, raw personality answers, hidden ranking weights, and unsafe message automation.

## Acceptance

- AI Ops can see route health and launch blockers.
- Golden tests cover every `/api/ai/*` route.
- Release gates fail when high-risk AI features lack tests or provenance.

---

# kesher-ai-feature-modules

Source: `skills/kesher-ai-feature-modules/SKILL.md`

---
name: kesher-ai-feature-modules
description: "All 11 AI feature modules for the Kesher dating app. Use when implementing, evaluating, or deploying a specific feature module such as bio coaching, values phrasing, taste profiles, daily picks, match explanations, anti-burnout, moderation, scam detection, report intake, AI disclosure, or personality coaching."
---

# Kesher AI Feature Modules

Use this skill to keep Kesher AI surfaces bounded, labeled, user-controlled, and testable. Prefer micro-surfaces over a general chatbot, require human confirmation for consequential actions, and update the AI feature registry whenever capability behavior changes.

---

# kesher-ai-governance

Source: `skills/kesher-ai-governance/SKILL.md`

---
name: kesher-ai-governance
description: "Implement Kesher AI feature allocation, system boundaries, registry governance, model routing, human-in-the-loop triggers, and safety policy enforcement. Use when changing AI feature registry entries, model route choices, trust hub copy, policy checks, or governance docs."
---

# Kesher AI Governance

Use this skill when an AI feature changes what data is processed, which model route is used, or what a user can do with generated output. Keep generated assistance draft-only, structured, disclosed, and reversible where relevant.

---

# kesher-bfas-assessment

Source: `skills/kesher-bfas-assessment/SKILL.md`

---
name: kesher-bfas-assessment
description: Implement and review Kesher's opt-in English IPIP-BFAS 100 / Big Five Aspects assessment prototype, deterministic scoring, answer handling, consent copy, reset/delete behavior, and non-clinical dating-style framing. Use when changing PersonalityAssessment, personality score types, onboarding assessment flows, prototype scoring, persistence for answers or bands, or tests for BFAS scoring and assessment privacy.
---

# Kesher BFAS Assessment

Use this skill to implement personality measurement as a user-owned reflection tool, not a matchmaking oracle.

## Workflow

1. Locate the assessment surface before editing:
   - `src/components/onboarding/PersonalityAssessment.tsx`
   - `src/components/onboarding/ProfileBuilder.tsx`
   - `src/features/onboarding/OnboardingFlow.tsx`
   - `src/ai/types.ts`
   - `src/types.ts`
   - `src/services/trustService.ts`
2. Keep scoring deterministic. Do not use Gemini or any LLM to score answers. LLMs may only interpret already-computed bands in downstream skills.
3. For this prototype, use the official English IPIP-BFAS 100 item/key spine with stable IDs, reverse-key metadata, domain/aspect mapping, and `ipip_bfas_100` scoring-version output.
4. Keep Hebrew scoring disabled until localization validation is complete. Hebrew UI may explain the status, but translated Hebrew items are not scored.
5. Store raw answers and derived scores as private, user-owned data. Do not expose raw answers, exact BFAS/aspect values, or hidden weights in discovery, match explanations, or share cards.
6. Make opt-in, reset, export, and delete controls visible wherever the user can view the profile. Reset clears answers/scores and regenerated summaries; delete removes personality data subject to legal/safety retention rules.
7. Validate copy: no diagnosis, therapy framing, fixed identity labels, fit ratings, certainty claims, or personality-based gatekeeping.

## Scoring Contract

- Score each item from 1 to 5.
- Reverse-key items with `6 - value`.
- Aggregate by domain and aspect separately.
- Convert averages to private display bands/tendencies only. Do not present exact values publicly.
- Version the scoring algorithm and questionnaire. Persist the version with each completed session.
- Never call approximate 0-100 values "validated percentiles" without a real norm table.

Read `references/assessment-contract.md` when changing questionnaire length, score storage, or the distinction between approximation and percentile.

## Acceptance Checks

- Incomplete assessments cannot be submitted.
- Reverse-keyed items change scores in the expected direction.
- The UI says the assessment is private, reflective, editable/resettable, and non-clinical.
- Reset/delete actions route through authenticated server or trust-service paths.
- Downstream AI receives derived bands/summaries only, never raw answers.
- `npm run check` or the narrowest TypeScript/test command passes.

Use `$kesher-personality-delivery` for browser validation, GitHub/CI review, or deployment workflow after implementation.

---

# kesher-calm-ux

Source: `skills/kesher-calm-ux/SKILL.md`

---
name: kesher-calm-ux
description: "Design premium calm UX for the Kesher dating app. Use when designing screens, user flows, onboarding, profile builders, matching interfaces, safety tools, Hebrew-first RTL layouts, accessibility standards, and anti-casino dating mechanics."
---

# Kesher Calm UX

Use this skill to keep Kesher quiet, intentional, and trust-forward. Prefer clear controls, restrained density, calm pacing, RTL-aware layouts, and copy that helps users act without pressure or scarcity mechanics.

---

# kesher-compatibility-reflection

Source: `skills/kesher-compatibility-reflection/SKILL.md`

---
name: kesher-compatibility-reflection
description: Implement and review Kesher's mutual-consent compatibility reflection engine, pair insight schemas, consent gates, whitelisted shared inputs, and no-score safety validation. Use when changing compatibility-reflection API routes, PairInsightReportSchema, compatibility prompts, match-sheet reflection UI, consent checks, or tests for forbidden compatibility language.
---

# Kesher Compatibility Reflection

Use this skill to build pair reflection that helps two opted-in users talk better. It must never decide whether they should date.

## Workflow

1. Inspect these surfaces before editing:
   - `server/aiRoutes.ts`
   - `src/services/aiService.ts`
   - `src/ai/schemas.ts`
   - `src/ai/policies.ts`
   - `src/ai/prompts.ts`
   - `src/ai/outputValidators.ts`
   - `src/features/match/MatchSheet.tsx`
   - `docs/adr/0003-mutual-consent-compatibility-reflection.md`
2. Enforce `mutualConsent === true` and `bothOptedIn === true` before any AI call. Prefer server-side rejection over UI-only gating.
3. Build a minimized shared-input packet. Include only mutually visible or explicitly approved fields.
4. Require `PairInsightReportSchema` and validate with `validateCompatibilityReflection`.
5. Preserve the product promise: shared strengths, friction loops, question to explore, micro-habit, gentle boundary, and `signals_used`.
6. Log provenance separately from prose when available, but do not leak provenance in user-facing copy.

## Forbidden Outputs

Never produce compatibility scores, match percentages, soulmate/destiny claims, perfect-match claims, doomed/incompatible verdicts, attractiveness/desirability rankings, raw personality scores, hidden ranking logic, private taste, private messages, exact location, or protected-trait inferences.

Read `references/reflection-contract.md` before changing prompt or schema language.

## Acceptance Checks

- A request without mutual consent returns `403` and never calls Gemini.
- `signals_used` contains only `COMPATIBILITY_ALLOWED_SIGNALS`.
- Prohibited-language tests cover Hebrew and English examples.
- UI language says reflection, not prediction.
- Fallback behavior returns no invented compatibility report.

Use `$kesher-personality-delivery` for browser and CI checks.

---

# kesher-consent-ux

Source: `skills/kesher-consent-ux/SKILL.md`

---
name: kesher-consent-ux
description: "Design and review Kesher consent UX for personality, AI, sharing, private taste, and Trust Hub flows. Use when changing consent gates, sensitive toggles, grants/revocation copy, consent history, onboarding or settings consent surfaces, or anti-dark-pattern behavior."
---

# Kesher Consent UX

Use this skill when a Kesher flow asks for permission, exposes a sensitive toggle, or lets a user share personality or private preference data.

## Workflow

1. Inspect the surface before editing: `src/features/skills/ConsentUxSkill.tsx`, `src/features/settings/AITrustHub.tsx`, `src/features/settings/PrivateTasteProfile.tsx`, `src/features/settings/PersonalityVisibilitySettings.tsx`, and the relevant server route.
2. Keep each sensitive action separately consented. Do not bundle personality assessment, AI interpretation, sharing, private taste, safety, or analytics into one broad approval.
3. Include the required notice elements in user-facing copy: voluntary action, purpose, controller identity or app owner, recipients or audience, refusal consequence, rights path, and AI involvement if applicable.
4. Default sensitive toggles to off. Require an explicit action to grant consent.
5. Put revoke, reset, export, and delete controls near the feature configuration path.
6. Make revocation no harder than granting. Avoid confirm-shaming, scarcity, countdowns, guilt copy, hidden opt-outs, or repeated prompts after refusal.
7. Do not log consent text with prompts, messages, raw answers, exact locations, or other PII.

## Acceptance Checks

- Consent copy says who can see or process the data.
- The user can decline without losing core matching or safety access.
- Revocation is visible and reachable in the same product area.
- UI state after revocation cannot still show shared personality content.
- Tests or manual QA cover grant, decline, revoke, and fallback states.

---

# kesher-dark-pattern-audit

Source: `skills/kesher-dark-pattern-audit/SKILL.md`

---
name: kesher-dark-pattern-audit
description: "Audit Kesher consent, privacy, personality, premium, onboarding, and sharing UI for dark patterns and coercive mechanics. Use when reviewing sensitive toggles, consent flows, revocation, account deletion, premium boundaries, or discovery pacing."
---

# Kesher Dark Pattern Audit

Use this skill before shipping any Kesher UI that could pressure a user into sharing, buying, continuing, disclosing, or accepting AI processing.

## Workflow

1. Inspect the proposed user path from entry point to exit, including the decline path, revoke path, reset/delete path, and fallback state.
2. Check the six risk families: overloading, skipping, stirring, obstructing, fickle controls, and left-in-the-dark wording.
3. Confirm that default states are neutral or off for sensitive choices.
4. Keep decline, revoke, export, delete, and safety controls available without premium gating.
5. Avoid shame, urgency, scarcity, social pressure, hidden friction, confusing toggles, repeated prompts after refusal, and optimistic copy that hides consequences.
6. For discovery and pacing, prefer finite calm surfaces and dismissible nudges over infinite loops or forced pauses.

## Acceptance Checks

- The user can say no in one clear path without losing core matching or safety features.
- Granting and revoking consent require comparable effort.
- Copy is short enough to understand and names the data, purpose, and audience.
- Premium flows do not imply compatibility scores or degrade core privacy/safety access.
- QA covers default-off, decline, revoke, and repeated-entry behavior.

---

# kesher-data-rights-retention

Source: `skills/kesher-data-rights-retention/SKILL.md`

---
name: kesher-data-rights-retention
description: Implement Kesher export, correction, deletion, retention windows, evidence separation, and privacy-rights audit trails.
---

# Kesher Data Rights & Retention

Use this skill for privacy-rights and retention work.

## Requirements

- Export, correction, deletion, reset, and revocation requests must be user-accessible and auditable.
- Private taste, private personality, share cards, messages, safety records, and billing records need distinct retention rules.
- Taste reset must not erase safety records.
- Share revocation should cascade to recipient-visible copies.

## Acceptance

- Settings exposes data-rights actions with clear status.
- Admin tooling can verify pending, completed, and failed rights requests.
- Retention rules are documented before launch.

---

# kesher-explainable-ai

Source: `skills/kesher-explainable-ai/SKILL.md`

---
name: kesher-explainable-ai
description: "Implement Kesher trust language, explanation provenance, and transparency for AI recommendations. Use when generating safe explanations, source chips, signal allowlists, fallback templates, or management controls for why-match and recommendation surfaces."
---

# Kesher Explainable AI

Use this skill to explain visible signals without revealing private taste, hidden weights, raw personality data, or sensitive inferences. Prefer short provenance-labeled explanations and deterministic fallbacks when model output is unavailable.

---

# kesher-filtering-marketplace

Source: `skills/kesher-filtering-marketplace/SKILL.md`

---
name: kesher-filtering-marketplace
description: "Implement Kesher filtering grammar, discovery marketplace mechanics, reciprocal recommendation ordering, Daily Picks versus Explore distinctions, hard and soft filters, exposure fairness, and anti-starvation safeguards."
---

# Kesher Filtering Marketplace

Use this skill when changing discovery ordering, filters, candidate eligibility, or fairness controls. Keep user-facing explanations limited to visible signals and do not expose hidden weights or private personality/taste internals.

---

# kesher-gemini-integration

Source: `skills/kesher-gemini-integration/SKILL.md`

---
name: kesher-gemini-integration
description: "Integrate Gemini AI into Kesher with structured outputs, function calling, grounding, system instructions, server-side proxy architecture, trust-preserving interaction patterns, and safe fallback behavior."
---

# Kesher Gemini Integration

Use this skill when adding or changing Gemini-backed features. Keep API keys server-side, validate structured outputs, avoid sensitive inference, and fall back to deterministic copy when model output is missing or unsafe.

---

# kesher-grounded-search

Source: `skills/kesher-grounded-search/SKILL.md`

---
name: kesher-grounded-search
description: "Use Google Search grounding in Kesher for cited safety Q&A, event discovery, curated URL context, source rendering, and freshness-sensitive prototype flows without turning search into people-finding or background-check tooling."
---

# Kesher Grounded Search

Use this skill when adding search-grounded features to the Kesher prototype or delivery plan.

## Workflow

1. Confirm the use case needs freshness, citation, or URL context.
2. Prefer deterministic sources for stable domains such as Jewish calendar rules; use search grounding for time-sensitive safety, event, and policy lookup.
3. Render citations and source chips with every grounded answer.
4. Keep search out of people search, background checks, social stalking, broad discovery, and user ranking.
5. Route date-venue details through Maps when place metadata is required.
6. Log only operational metadata; do not store search result content as profile data.

## Prototype Surface

The Vercel prototype page should show the route map, allowed use cases, citation requirements, and blocked use cases.

## Stop Points

Stop before enabling background user lookup, caching third-party search results, removing source attribution, or sending sensitive personality data to a non-approved search workflow.

---

# kesher-high-thinking-routing

Source: `skills/kesher-high-thinking-routing/SKILL.md`

---
name: kesher-high-thinking-routing
description: "Route Kesher Gemini thinking-mode work. Use when deciding when to enable high-thinking controls, configuring thinking budgets, designing fast-plus-thinking patterns, or planning A/B tests for reasoning-heavy AI features."
---

# Kesher High Thinking Routing

Use this skill only for features that genuinely need deeper reasoning. Keep low-risk and latency-sensitive surfaces on faster routes, and reserve higher-thinking paths for safety, reflection, planning, or complex grounded synthesis.

---

# kesher-identity-verification

Source: `skills/kesher-identity-verification/SKILL.md`

---
name: kesher-identity-verification
description: Implement Kesher production auth, profile verification signals, anti-impersonation review, pause/reactivation, and account rights flows.
---

# Kesher Identity Verification

Use this skill when turning Kesher from demo auth into a production identity surface.

## Requirements

- Keep Firebase Auth as the primary identity boundary unless a migration is approved.
- Store verification status as a user-visible signal, not raw document evidence.
- Separate identity evidence from discovery, private taste, personality, and match explanations.
- Support pause, reactivation, account export, correction, and deletion request states.
- Require human review for impersonation, suspicious identity reuse, and verification appeals.

## Acceptance

- Onboarding cannot enter discovery until required profile and terms gates are complete.
- Verification status is recoverable and auditable.
- Account deletion preserves only legally required safety/evidence records.

---

# kesher-image-analysis

Source: `skills/kesher-image-analysis/SKILL.md`

---
name: kesher-image-analysis
description: "Implement trust-forward image analysis for Kesher photo readiness, accessibility alt text, moderation assistance, appeal support, tiered human review, and protected-trait/attractiveness safety boundaries."
---

# Kesher Image Analysis

Use this skill when changing photo upload checks, visual moderation, accessibility alt text, or moderator review tooling.

## Workflow

1. Split member-facing coaching from moderator-facing decision support.
2. Run deterministic checks first: format, resolution, metadata stripping, duplicate detection, and policy prefilters.
3. Use model output only as assistive evidence; punitive actions require human review.
4. Keep member-facing copy constructive, specific, and non-judgmental.
5. Never infer attractiveness, race, ethnicity, religion, body type, emotional state, or personality from appearance.
6. Store minimal decision codes and delete derived image data when the user deletes the photo/account.

## Prototype Surface

The Vercel prototype page should show tiered decisioning, member/moderator schemas, privacy controls, and review queues.

## Stop Points

Stop before adding biometric identification, attractiveness ranking, protected-trait inference, automated punitive action, or long-lived visual descriptors.

---

# kesher-israeli-privacy

Source: `skills/kesher-israeli-privacy/SKILL.md`

---
name: kesher-israeli-privacy
description: "Review Kesher implementation choices against Israeli privacy-sensitive data guardrails for personality, observance, relationship intent, compatibility reflection, AI inference, export, correction, deletion, and transfer-abroad risk. Use for implementation review only, not legal advice."
---

# Kesher Israeli Privacy

Use this skill when product or code changes affect sensitive Kesher data. This is implementation guidance, not legal advice; escalate counsel questions instead of inventing legal certainty.

## Workflow

1. Classify the data involved before editing: personality answers/scores, observance, relationship intent, orientation-adjacent profile data, compatibility reflections, precise location, reports, safety records, and private taste are high-risk.
2. Check the relevant visibility layer using `$kesher-personality-visibility`: public browse, private owner, mutual consent, or system-only.
3. Require explicit, separate consent for personality interpretation, permissioned sharing, mutual reflection, and private taste learning.
4. Preserve access, correction, deletion, export, reset, and revoke paths in settings or Trust Hub.
5. Keep raw answers, raw scores, private taste, private messages, exact locations, prompts, generated sensitive prose, tokens, and secrets out of logs, analytics, browser storage exports, static bundles, and public APIs.
6. Treat cross-border processing, Vertex/Gemini runtime choices, and production auth changes as stop points that need explicit approval.

## Acceptance Checks

- Sensitive fields do not appear in `dist/`, browser logs, AI metadata logs, or public skill exports.
- Server routes enforce the owner or mutual-consent boundary for protected reads/writes.
- User-facing copy uses uncertainty and rights language, not fixed labels or legal overclaims.
- Firebase rules, production auth mode, deployment settings, billing, and credentials are unchanged unless explicitly requested.

---

# kesher-learned-taste

Source: `skills/kesher-learned-taste/SKILL.md`

---
name: kesher-learned-taste
description: "Implement Kesher implicit and explicit preference learning, taste profiles, event capture, taste weights, and hybrid on-device/server recommendation architecture while preserving privacy and user controls."
---

# Kesher Learned Taste

Use this skill when changing taste events, preference weights, or recommendation inputs. Explicit controls outrank implicit observations, private messages/photos/protected traits are excluded, and explanation layers must not reveal hidden taste internals.

---

# kesher-low-latency-ai

Source: `skills/kesher-low-latency-ai/SKILL.md`

---
name: kesher-low-latency-ai
description: "Design server-side AI proxy architecture for low-latency Kesher responses. Use when implementing model routing matrices, latency targets, streaming patterns, feature registry routing, and policy-aware AI request handling."
---

# Kesher Low Latency AI

Use this skill to keep AI surfaces fast without weakening trust controls. Prefer deterministic fallbacks, minimal payloads, schema validation, and feature-specific model routing over broad generic chat calls.

---

# kesher-maps-date-planner

Source: `skills/kesher-maps-date-planner/SKILL.md`

---
name: kesher-maps-date-planner
description: "Build Google Maps-grounded Kesher date planning with venue suggestions, fairness previews, observance-aware scheduling, safe-venue defaults, accessibility-conscious planning, citation UI, and user-reviewed sending."
---

# Kesher Maps Date Planner

Use this skill when changing grounded date suggestions or venue planning. Keep locations coarse unless the user explicitly narrows them, show citations/provenance, and require user review before any plan is sent.

---

# kesher-match-lifecycle

Source: `skills/kesher-match-lifecycle/SKILL.md`

---
name: kesher-match-lifecycle
description: Implement Kesher like/pass/match/chat lifecycle state machines, history, and safe transitions across block, report, unmatch, pause, and delete.
---

# Kesher Match Lifecycle

Use this skill for discovery-to-chat product behavior.

## Requirements

- Treat like, pass, match, message, unmatch, block, report, and delete as explicit state transitions.
- Persist user-visible history so members understand what happened after any safety or privacy action.
- Keep AI outputs draft-only; no opener, rephrase, reflection, or date plan may auto-send.
- Preserve safety records after unmatch, block, and account deletion according to retention policy.

## Acceptance

- Mutual matches create one conversation and one match record.
- Block/report/unmatch remove unsafe access without erasing operator evidence.
- The UI has empty states for no picks, no matches, no conversations, and paused profiles.

---

# kesher-notifications

Source: `skills/kesher-notifications/SKILL.md`

---
name: kesher-notifications
description: Implement Kesher notification preferences and delivery for matches, messages, safety events, date reminders, and consent/share changes.
---

# Kesher Notifications

Use this skill when adding email, push, or SMS delivery.

## Requirements

- Notification categories must be preference-managed and revocable.
- Safety, consent, and account-rights notifications take priority over engagement nudges.
- Never disclose sensitive match, personality, report, or safety details in notification previews.
- Record delivery attempts, failures, unsubscribes, and provider callbacks.

## Acceptance

- Members can change notification categories from settings.
- Delivery providers are called server-side only.
- Notification copy is calm, non-pressuring, and compatible with Hebrew-first localization.

---

# kesher-pacing-coach

Source: `skills/kesher-pacing-coach/SKILL.md`

---
name: kesher-pacing-coach
description: Implement and review Kesher's anti-burnout pacing coach, including swipe/session signals, gentle dismissible interventions, PacingInterventionSchema, prompt safety, and non-manipulative UX. Use when changing pacing_coach registry entries, pacing-intervention routes, discovery session tracking, or break/reflection UI.
---

# Kesher Pacing Coach

Use this skill to create gentle pacing interventions that protect user attention without manipulating them.

## Workflow

1. Inspect these surfaces before editing:
   - `server/aiRoutes.ts`
   - `src/services/aiService.ts`
   - `src/ai/schemas.ts`
   - `src/ai/policies.ts`
   - `src/ai/prompts.ts`
   - `src/ai/featureRegistry.ts`
   - `src/features/discovery/DailyPicksScreen.tsx`
   - `src/features/discovery/ExploreScreen.tsx`
2. Use only coarse session metrics such as session length, swipe velocity, repeated passes, or user-dismissed nudges. Do not use private messages, personality raw answers, or sensitive traits.
3. Keep the intervention easily dismissible. Never block access, shame the user, or create scarcity pressure.
4. Return `message_he` and `reflection_prompt_he` via `PacingInterventionSchema`.
5. Rate-limit nudges so they feel supportive rather than nagging.

Read `references/pacing-contract.md` before changing triggers or prompt copy.

## Copy Standard

Use a calm prompt to pause, breathe, or reflect on what felt energizing or draining. Do not imply the user is addicted, broken, desperate, or making bad decisions.

## Acceptance Checks

- Pacing feature can be disabled or dismissed.
- Trigger thresholds are deterministic and testable.
- Gemini failure produces no intrusive modal.
- Output validator blocks diagnosis, fixed identity, and manipulation language.
- UI does not shift layout or obscure critical discovery controls.

Use `$kesher-personality-delivery` for browser checks across mobile and desktop.

---

# kesher-permissioned-sharing

Source: `skills/kesher-permissioned-sharing/SKILL.md`

---
name: kesher-permissioned-sharing
description: "Implement and review Kesher's permissioned personality sharing flows: previewable share cards, recipient/scope selection, expiry, revoke, audit copy, and mutual-consent disclosure. Use when building personality share-card UI, share/revoke APIs, privacy settings, trust hub controls, or data models for temporary personality access."
---

# Kesher Permissioned Sharing

Use this skill when personality insights move from owner-only to another person by explicit user action.

## Required Flow

1. Preview: show exactly what will be shared before any recipient can access it.
2. Scope: let the owner choose summary-only, strengths/watch-outs, communication notes, or a specific compatibility reflection. Never include raw answers, raw scores, hidden negatives, or private taste.
3. Recipient: require a specific match/user or approved context. Avoid broad public links.
4. Duration: default to temporary access with a clear expiry.
5. Confirm: restate recipient, scope, expiry, and revoke behavior.
6. Revoke: provide a visible revoke path and explain that revocation stops future in-app access but cannot erase screenshots or memory.
7. Audit: record share, view, expiry, and revoke events without storing unnecessary sensitive prose in analytics.

Read `references/share-card-contract.md` before implementing persistence, schemas, or UI.

## Guardrails

- Stop before changing auth, Firebase rules, database schema, migrations, production config, or share/revoke persistence without explicit approval.
- Use server-side authorization for every share-card read.
- Do not allow share cards to become raw psychometric dossiers.
- Keep generated language non-clinical and non-deterministic.

## Acceptance Checks

- A user cannot share without preview and explicit confirmation.
- A non-recipient cannot fetch the shared card.
- Expired or revoked cards are inaccessible.
- The shared card names its limits: summary-only, reflective, not a score.
- Analytics excludes raw answers, private taste, and private messages.

Use `$kesher-personality-visibility` for surface policy and `$kesher-personality-delivery` for release checks.

---

# kesher-personality-delivery

Source: `skills/kesher-personality-delivery/SKILL.md`

---
name: kesher-personality-delivery
description: Coordinate implementation, verification, review, CI, deployment, and platform parity for Kesher personality features using the appropriate repo, browser, CI, review, deploy, database, and native-app plugins. Use after or during personality feature work when planning tasks, running checks, opening browser flows, preparing GitHub/CircleCI/CodeRabbit review, or considering Netlify/Vercel/Cloudflare/Neon/Expo/iOS/macOS delivery.
---

# Kesher Personality Delivery

Use this skill to ship personality work carefully after a feature-specific skill has identified the product contract.

## Workflow

1. Start from `AGENTS.md` and the relevant feature skill.
2. Read `references/plugin-map.md` to choose platform tools. Do not invoke deploy, production config, billing, database migrations, GitHub pushes, PR creation, or external automations without explicit approval.
3. Run the narrowest useful local verification:
   - targeted tests
   - `npm run check`
   - `npm run build` when shared routes or schemas changed
   - browser flow checks for UI work
4. Use Browser Use for localhost visual/interaction checks when a frontend flow changes.
5. Use GitHub, CircleCI, and CodeRabbit only for repo, CI, or review tasks the user has asked for or approved.
6. Use deploy/platform plugins only when the requested work touches that platform.
7. Report exactly what ran, what passed, and what could not run.

## Platform Selection

Read `references/plugin-map.md` for when to use Netlify, Vercel, Cloudflare, Neon Postgres, Expo, iOS, macOS, Quicknode, YepCode, Superpowers, GitHub, CircleCI, CodeRabbit, and Browser Use.

Read `references/verification-matrix.md` before finalizing a personality feature branch.

## Stop Points

Stop and request explicit approval before changing auth, roles, Firebase rules, database schema, migrations, production config, secrets, billing, deploy settings, external automation tools, dependency versions, share/revoke persistence, or personality-based ranking/gating.

## Acceptance Checks

- Feature-specific safety contracts are preserved.
- `docs/adr` and `src/ai/featureRegistry.ts` are updated when behavior or governance changes.
- Validation output is recorded in the final response.
- Browser screenshots or in-app browser checks are used for meaningful UI changes.
- CI/review/deploy plugins are used only when appropriate and approved.

---

# kesher-personality-engine

Source: `skills/kesher-personality-engine/SKILL.md`

---
name: kesher-personality-engine
description: "Implement Kesher personality measurement, deterministic scoring, private reflection reports, mutual-consent discussion prompts, and provenance-labeled match explanations using Big Five or BFAS-style structures without deterministic fit claims."
---

# Kesher Personality Engine

Use this skill for the end-to-end personality pipeline. Keep scoring deterministic and gated, keep interpretation private by default, and use `$kesher-personality-research` before changing measurement, licensing, Hebrew, or validation assumptions.

---

# kesher-personality-ocean

Source: `skills/kesher-personality-ocean/SKILL.md`

---
name: kesher-personality-ocean
description: "Implement Kesher OCEAN/Big Five personality reflection with Jewish observance context and Hebrew-first localization. Use when generating culturally aware reflection cards, consent-scoped discovery experiments, or non-deterministic personality interpretation."
---

# Kesher Personality OCEAN

Use this skill when working with broad Big Five/OCEAN language. Keep observance separate from personality, avoid protected-trait inference, and do not use personality as a hidden public ranking or compatibility verdict.

---

# kesher-personality-profile

Source: `skills/kesher-personality-profile/SKILL.md`

---
name: kesher-personality-profile
description: Implement and review Kesher's private personality profile interpreter, including Gemini structured output, Hebrew-first insight cards, fallback rendering, provenance, and user controls. Use when changing personality-profile routes, PersonalityProfileScreen, PersonalitySummarySchema, personality prompts, output validators, or AI Trust Hub copy for personality insights.
---

# Kesher Personality Profile

Use this skill to translate deterministic BFAS outputs into warm, private, user-visible reflection.

## Workflow

1. Inspect these surfaces before editing:
   - `src/features/settings/PersonalityProfileScreen.tsx`
   - `src/services/aiService.ts`
   - `server/aiRoutes.ts`
   - `src/ai/schemas.ts`
   - `src/ai/policies.ts`
   - `src/ai/prompts.ts`
   - `src/ai/outputValidators.ts`
   - `src/ai/featureRegistry.ts`
2. Ensure the AI receives derived domain/aspect percentiles only. Do not send raw answers, private messages, hidden ranking state, exact location, photos, or private taste details.
3. Keep `SYSTEM_INSTRUCTIONS.PERSONALITY_INTERPRETER` non-clinical and probabilistic. Preferred framing: "you tend to", "you may notice", "a helpful watch-out".
4. Require structured JSON that matches `PersonalitySummarySchema`; update validator coverage when schema fields change.
5. Render a deterministic fallback when Gemini is unavailable. The fallback must not invent a profile from missing data.
6. Keep export, reset, and delete controls available near the profile.

## Output Contract

Read `references/output-contract.md` before changing schemas, prompts, or UI cards.

The profile may include private summary, domain cards, aspect highlights, dating superpower, growth area, communication notes, and repair suggestions.

The profile must not include diagnosis or treatment language, fixed identity labels, match scores, desirability claims, raw BFAS answers, raw score dumps, hidden weights, private taste, or private messages.

## Acceptance Checks

- Validator rejects prohibited language using `outputValidators.validatePersonalityProfile`.
- UI does not expose generated insight cards to other users by default.
- Loading, unavailable-AI, reset, delete, and export states remain reachable.
- Analytics events do not include raw answers or generated sensitive text.
- `npm run check` or a targeted TypeScript/test command passes.

Use `$kesher-personality-delivery` for browser validation and release workflow.

---

# kesher-personality-research

Source: `skills/kesher-personality-research/SKILL.md`

---
name: kesher-personality-research
description: "Convert Kesher personality PDF dossiers and research findings into implementable, evidence-labeled product and engineering guidance. Use when grounding Kesher BFAS/Big Five measurement, instrument licensing, Hebrew feasibility, Israeli privacy, consent, visibility, permissioned sharing, Gemini/Vertex runtime governance, validation gates, repository delivery, or trust-forward personality feature decisions from the PDF corpus."
---

# Kesher Personality Research

Use this skill before implementing or reviewing personality features that depend on the local PDF corpus. Treat the PDFs as grounding material for product contracts, not as permission to ship sensitive scoring.

## Evidence Labels

- `VERIFIED`: directly supported by the PDF corpus, official docs already captured in repo docs, or deterministic code inspection.
- `INFERRED`: a product or engineering conclusion derived from verified material.
- `HEURISTIC`: an operator rule of thumb that still needs review before production use.
- `UNKNOWN`: unresolved, missing evidence, or not yet inspected.
- `BLOCKED`: not implementable for production until a named gate is closed.

## Workflow

1. Start with `references/source-map.md` and choose the capability reference that matches the task.
2. Keep the product stance stable: personality is optional, private by default, deterministic when measured, and reflective rather than predictive.
3. Do not activate production personality scoring unless commercial instrument rights, Hebrew adaptation, privacy counsel review, and data-governance gates are closed.
4. Do not let an LLM score personality. LLMs may only interpret deterministic scores or user-approved summaries through bounded schemas.
5. Convert research into concrete implementation contracts: allowed inputs, blocked inputs, output schema, consent surface, visibility layer, tests, and release gate.
6. Use probabilistic copy: "may", "can", "often", "worth exploring", and "possible friction/strength".
7. Update the relevant feature skill when a PDF finding changes implementation behavior.

## Capability References

- `references/measurement-licensing-hebrew.md`: instrument choice, BFAS/BFI/IPIP rights, Hebrew feasibility, and scoring gates.
- `references/compatibility-reflection-science.md`: relationship-science boundaries and safe reflection language.
- `references/privacy-consent-visibility-sharing.md`: Israeli privacy readiness, consent UX, visibility layers, and permissioned sharing.
- `references/gemini-vertex-runtime-governance.md`: Gemini, Vertex AI, Firebase AI Logic, and sensitive-runtime boundaries.
- `references/validation-release-gates.md`: launch blockers, psychometric validation, invariance, and release checklist.
- `references/tooling-deployment-delivery.md`: GitHub, Vercel, CI, preview verification, and delivery tooling.

## Stop Points

Stop for human approval before changing production auth, Firebase rules, database schema, secrets, billing, deployment settings, instrument item text, commercial instrument activation, personality-driven ordering, or cross-user personality disclosure.

Use `$kesher-personality-delivery` after this skill when implementation, browser verification, CI, or Vercel prototype updates are required.

---

# kesher-personality-visibility

Source: `skills/kesher-personality-visibility/SKILL.md`

---
name: kesher-personality-visibility
description: Design and implement Kesher's personality visibility model across browse, profile, match, settings, and chat surfaces. Use when deciding what personality-derived data can appear publicly, privately, or after mutual consent; when changing profile cards, ProfileDetail, DailyPicks, AITrustHub, PrivateTasteProfile, Settings, or visibility copy.
---

# Kesher Personality Visibility

Use this skill when a personality-related insight might become visible outside the owner-only profile.

## Visibility Layers

1. Public browse layer: self-declared values, intent, observance labels, lifestyle, interests, prompts, and profile fields only.
2. Private owner layer: inferred personality summaries, private taste, generated recommendations, data controls, and explanation history.
3. Mutual-consent layer: short share-card summaries or compatibility reflections after explicit opt-in from the required parties.
4. System-only layer: raw answers, raw scores, hidden ranking features, audit logs, moderation signals, and safety retention records.

Read `references/visibility-rules.md` when changing any UI surface that displays personality-derived data.

## Workflow

1. Identify the surface: browse card, profile detail, match sheet, chat, settings, trust hub, admin, or API.
2. Classify every displayed field into a visibility layer.
3. Remove or mask raw/inferred fields that are not allowed for that surface.
4. Add direct controls when the user can change visibility, including preview, scope, and revoke paths.
5. Keep explanations concrete and calm. Do not say the app is revealing "who they really are" or hidden compatibility.
6. Update docs/ADR if the visibility policy changes.

## Acceptance Checks

- Discovery surfaces never show model-derived trait labels by default.
- "Why This Match" explanations use whitelisted visible signals only.
- Owner-only screens clearly say private/editable/resettable.
- Mutual-consent screens clearly name who can see what and for how long.
- Admin views do not become backdoor profile-dossier views.

Use `$kesher-permissioned-sharing` for share-card implementation and `$kesher-personality-delivery` for browser validation.

---

# kesher-personality-why-match

Source: `skills/kesher-personality-why-match/SKILL.md`

---
name: kesher-personality-why-match
description: Implement and review personality-safe "Why This Match" explanations for Kesher using whitelisted visible signals, structured Gemini output, uncertainty notes, and leakage prevention. Use when changing explain-match routes, WhyThisMatchPayloadSchema, output validators, DailyPicks/ProfileCard explanation UI, or reason-code generation for personality-aware recommendations.
---

# Kesher Personality Why Match

Use this skill when explaining a recommendation that may have been influenced by personality, values, or private preference systems.

## Workflow

1. Inspect these surfaces before editing:
   - `server/aiRoutes.ts`
   - `src/services/aiService.ts`
   - `src/ai/outputValidators.ts`
   - `src/ai/schemas.ts`
   - `src/ai/policies.ts`
   - `src/ai/prompts.ts`
   - `src/features/discovery/DailyPicksScreen.tsx`
   - `src/components/discovery/ProfileCard.tsx`
   - `src/components/discovery/ProfileDetail.tsx`
2. Ensure the route sanitizes inputs with visible-profile pickers and whitelisted signals before calling Gemini.
3. Preserve `signals_used`, `signals_not_used`, and `uncertainty_he` in every generated output.
4. Use only allowed reason codes from `WHY_MATCH_ALLOWED_SIGNALS`.
5. Include forbidden signals in `signals_not_used`: private taste, hidden dealbreakers, hidden ranking, raw personality scores, private messages, exact location, and protected-trait inference.
6. Fall back to deterministic templates when the model fails validation.

Read `references/explanation-contract.md` before changing allowed signals, prompts, or templates.

## Copy Standard

Say "you might connect over", "based on what is visible", or "one thing to explore". Do not say "the algorithm knows", "you are compatible", "98% match", or "your personality proves".

## Acceptance Checks

- Validator rejects forbidden signals and prohibited language.
- Explanations show 2-3 short reasons, a first question, and an uncertainty note.
- Explanations never reveal private taste or raw scores.
- UI provides a path to manage taste/profile controls.
- Tests include at least one leakage attempt.

Use `$kesher-private-taste` for recommender inputs and `$kesher-personality-delivery` for verification.

---

# kesher-privacy-preserving-recommendation

Source: `skills/kesher-privacy-preserving-recommendation/SKILL.md`

---
name: kesher-privacy-preserving-recommendation
description: "Implement Kesher recommendation architecture with silent personalization, safe explanations, permissioned personality boundaries, anti-leakage controls, and release gates before any personality-informed ordering."
---

# Kesher Privacy-Preserving Recommendation

Use this skill when modifying recommendations, Daily Picks, Explore ordering, safe explanations, or personality-informed discovery experiments.

## Workflow

1. Separate the recommendation stack into silent personalization, safe explanation, and permissioned personality layers.
2. Use explicit user preferences and profile logistics before inferred or behavioral signals.
3. Keep private taste and hidden ordering signals owner-only.
4. Do not use personality in ranking until validation, consent, privacy, and release gates are complete.
5. Explain matches only with whitelisted, user-visible, provenance-labeled reasons.
6. Test for leakage: explanations must not reveal private taste, exact values, hidden ordering, or non-shared personality signals.

## Prototype Surface

The Vercel prototype page should show the layer diagram, signal table, blocked release gates, and no-leakage checks.

## Stop Points

Stop before exposing hidden ordering, using personality without consent, adding public fit meters, or changing production ranking behavior.

---

# kesher-private-recommendations

Source: `skills/kesher-private-recommendations/SKILL.md`

---
name: kesher-private-recommendations
description: "Implement Kesher permissioned sharing, private taste profiles, privacy-preserving recommendations, staged disclosure, consent flows, and sensitive-data exclusion schemas without leaking private recommender state."
---

# Kesher Private Recommendations

Use this skill when private personalization affects discovery or explanations. Keep recommender internals owner-only, sanitize explanation packets, and provide reset, disable, and consent controls.

---

# kesher-private-taste

Source: `skills/kesher-private-taste/SKILL.md`

---
name: kesher-private-taste
description: Implement and review Kesher's owner-only private taste learning for personality-aware recommendations, including consent, event minimization, editable/resettable taste profile UI, recommender inputs, and no-leak explanations. Use when changing taste_profile routes, PrivateTasteProfile, recommendation feedback, more/less-like-this controls, taste schemas, or private recommendation copy.
---

# Kesher Private Taste

Use this skill to keep learned preference modeling useful, editable, and strictly private.

## Workflow

1. Inspect these surfaces before editing:
   - `src/features/settings/PrivateTasteProfile.tsx`
   - `src/services/aiService.ts`
   - `server/aiRoutes.ts`
   - `src/ai/featureRegistry.ts`
   - `src/ai/policies.ts`
   - `src/ai/schemas.ts`
   - `src/features/discovery/DailyPicksScreen.tsx`
   - `src/features/discovery/ExploreScreen.tsx`
2. Require consent before creating or updating a private taste profile.
3. Treat implicit behavior as noisy observation, not truth. Explicit controls outrank implicit events.
4. Exclude private messages, exact location, photos, protected traits, attractiveness/desirability, and raw personality answers from taste learning.
5. Give users owner-visible controls: view, edit where possible, reset, disable personalization, and understand why an update happened.
6. Ensure explanation layers verbalize only whitelisted visible reasons, never hidden weights or private taste internals.

Read `references/taste-contract.md` when adding event types, weights, reset semantics, or recommender inputs.

## Ranking Boundary

The recommender may use private taste internally only after consent. Public-facing explanations must receive a sanitized evidence packet and must not say "your private taste profile prefers X" about another person.

## Acceptance Checks

- Consent off means no private taste generation/update.
- Reset clears learned taste and cached explanations but keeps legal/safety records as required.
- Output validator and copy checks block attractiveness, hidden ranking, and protected-trait inference.
- "More like this" and "less like this" are explainable and reversible.
- Private taste never appears in another user's UI.

Use `$kesher-personality-why-match` for explanation-layer work and `$kesher-personality-delivery` for verification.

---

# kesher-psychometric-validation

Source: `skills/kesher-psychometric-validation/SKILL.md`

---
name: kesher-psychometric-validation
description: "Gate Kesher personality assessment, scoring, interpretation, ranking, and compatibility claims through psychometric validation requirements. Use when changing assessment items, scoring, Hebrew/English adaptation, reliability claims, invariance, ranking use, or release readiness."
---

# Kesher Psychometric Validation

Use this skill to decide whether a personality-related feature is prototype-only, blocked, or ready for a validation step.

## Workflow

1. Inspect `src/components/onboarding/PersonalityAssessment.tsx`, `src/personality/personalityService.ts`, `src/personality/types.ts`, `scripts/test-personality-scoring.mjs`, and `docs/personality/*` before changing measurement behavior.
2. Confirm item provenance and commercial-use rights before adding or changing item text.
3. Keep scoring deterministic and testable. LLMs may interpret bounded bands, but must not score answers, infer traits from behavior, photos, messages, or bios, or generate norm claims.
4. Treat Hebrew translation as adaptation work. Do not claim Hebrew validity from translation alone.
5. Block personality-driven ranking, compatibility scores, cross-user trait comparison, and population norm claims until reliability, response quality, test-retest, measurement invariance, incremental validity, and harm gates are documented.
6. Use bands and reflective language for prototypes: "may", "tends to", "possible", "worth discussing". Avoid clinical, destiny, fixed-label, or fit-verdict language.

## Validation Gates

- Instrument rights and item provenance are documented.
- Domain reliability and facet reliability have approved thresholds.
- Response-quality checks can mark reflection unavailable.
- Test-retest and invariance plans exist before cross-language or cross-user comparison.
- Harm testing and privacy review are complete before production use.

## Acceptance Checks

- Tests cover reverse scoring, missing answers, quality flags, reset/delete behavior, and forbidden output language.
- Docs mark production personality ranking as blocked unless all named gates are closed.
- User-visible copy frames personality as optional private reflection, not scientific matchmaking certainty.

---

# kesher-release-readiness

Source: `skills/kesher-release-readiness/SKILL.md`

---
name: kesher-release-readiness
description: Implement Kesher CI, smoke tests, deployment checklist, rollback, preview verification, monitoring, and launch blocker tracking.
---

# Kesher Release Readiness

Use this skill to decide whether Kesher can ship.

## Requirements

- Track launch gates for auth, discovery, match lifecycle, safety ops, AI runtime, payments, notifications, data rights, and observability.
- CI must run typecheck, unit tests, AI contract tests, privacy scans, and build checks.
- Preview verification should cover public, demo, and authenticated routes.
- Rollback and incident response steps must be documented before production promotion.

## Acceptance

- AI Ops or release dashboards show blocker status.
- Required checks are linked from PR/release documentation.
- Production promotion is blocked when P0 gates are missing.

---

# kesher-subscription-entitlements

Source: `skills/kesher-subscription-entitlements/SKILL.md`

---
name: kesher-subscription-entitlements
description: Implement Kesher subscriptions, premium gates, quotas, billing webhooks, refunds, and abuse-resistant trials.
---

# Kesher Subscription Entitlements

Use this skill for commercial readiness.

## Requirements

- Entitlement checks must run server-side and be reflected in client state.
- Premium access cannot bypass safety, identity, privacy, or consent gates.
- Webhook handlers must be idempotent and auditable.
- Refunds, cancellations, trials, and charge disputes must update entitlements predictably.

## Acceptance

- Premium UI reads from canonical entitlement state.
- Trial abuse controls are documented and tested.
- Billing records avoid storing unnecessary sensitive dating data.

---

# kesher-system-prompt

Source: `skills/kesher-system-prompt/SKILL.md`

---
name: kesher-system-prompt
description: "Use the Kesher OS strategic framework for deep research, product evaluation, architecture design, execution planning, run modes, evaluation rubrics, product principles, platform role assignments, and connector design."
---

# Kesher System Prompt

Use this skill for high-level Kesher operating-system work. Keep outputs evidence-labeled, trust-forward, implementation-ready, and routed to the appropriate specialist skill before code changes.

---

# kesher-trust-safety-ops

Source: `skills/kesher-trust-safety-ops/SKILL.md`

---
name: kesher-trust-safety-ops
description: Build Kesher trust and safety operations, including report queue, moderation summaries, scam triage, photo checks, appeals, escalation, and audit logs.
---

# Kesher Trust & Safety Ops

Use this skill for member protection and operator workflows.

## Requirements

- Reports, blocks, unmatches, appeals, moderation summaries, and support contacts must create auditable records.
- AI moderation may summarize and classify but never make final enforcement decisions.
- Separate claims, evidence, AI summaries, human notes, actions, and appeal outcomes.
- Keep safety evidence isolated from recommendation, private taste, and match explanation systems.

## Acceptance

- Operators can see status, severity, assignment, last action, and evidence retention state.
- Scam/payment requests and coercive messages can be escalated.
- Appeal and review decisions are idempotent and logged.

---

# kesher-voice-integration

Source: `skills/kesher-voice-integration/SKILL.md`

---
name: kesher-voice-integration
description: "Implement Kesher voice features with push-to-talk Gemini Live sessions, ephemeral token authentication, transcript visibility, accessibility support, and no emotional companion or auto-send behavior."
---

# Kesher Voice Integration

Use this skill when adding or reviewing voice AI flows.

## Workflow

1. Keep voice utility-focused: safety guidance, accessibility navigation, date-planning support, or rehearsal with explicit user control.
2. Use short-lived ephemeral tokens issued by the authenticated backend.
3. Require microphone consent, a listening indicator, live transcript, mute, and end controls.
4. Do not create persistent voice memory or parallel conversation archives.
5. Confirm every app action before execution; never auto-send messages.
6. Run Hebrew voice QA and accessibility checks before broad rollout.

## Prototype Surface

The Vercel prototype page should show the token route, session lifecycle, consent checklist, feature tiers, and forbidden behaviors.

## Stop Points

Stop before enabling always-listening mode, voice cloning, emotional companion framing, unconfirmed app actions, or production voice tokens without security review.

---

# sparkmatch-dating-app-skill

Source: `skills/sparkmatch-dating-app-skill/SKILL.md`

---
name: sparkmatch-dating-app-skill
description: "Reference dating-app architecture skill for comparing Kesher prototype decisions against swipe-flow, real-time chat, matching, moderation, and subscription patterns without importing hot-or-not mechanics."
---

# SparkMatch Dating App Skill

Use this skill only as comparative product and engineering reference material for Kesher.

## Workflow

1. Identify the reference pattern: matching, chat, moderation, onboarding, monetization, or app shell behavior.
2. Extract the engineering lesson without copying trust-eroding dating mechanics.
3. Reject swipe velocity loops, public desirability cues, scarcity pressure, and paywalled safety/privacy controls.
4. Translate any useful pattern into Kesher's serious-intent, privacy-first, consent-forward UX.
5. Mark uncertain source claims as `UNKNOWN` until the original implementation is inspected.

## Prototype Surface

The Vercel prototype page should show which reference patterns are useful, which are rejected, and how Kesher's safer counterpart is verified.

## Stop Points

Stop before importing casino-style discovery, hidden desirability ranking, public attractiveness mechanics, or monetization that weakens safety.

---

# video-generator

Source: `skills/video-generator/SKILL.md`

---
name: video-generator
description: "Create shareable Kesher prototype walkthrough videos, stakeholder demos, cinematic explainers, and review assets while preserving privacy, consent, and no-impersonation boundaries."
---

# Video Generator

Use this skill when producing video assets for Kesher prototype review, investor walkthroughs, user-testing scripts, or launch-readiness demos.

## Workflow

1. Define the audience, purpose, duration, language, aspect ratio, and required review surfaces.
2. Use fictional demo data only; do not include real users, real profile photos, private messages, secrets, or production records.
3. Storyboard the flow before generating visuals: opening state, user action, safety/consent state, and outcome.
4. Keep narration precise: reflection, tendencies, possible strengths/friction, not predictions.
5. Verify captions, RTL/Hebrew rendering when used, and accessibility contrast.
6. Export a review-ready asset plus the prompt/source notes needed to reproduce it.

## Prototype Surface

The Vercel prototype page should show the delivery checklist, demo script, privacy checklist, and artifact status.

## Stop Points

Stop before using real member data, implying AI impersonation, showing private scoring, or publishing a demo that suggests production activation.

