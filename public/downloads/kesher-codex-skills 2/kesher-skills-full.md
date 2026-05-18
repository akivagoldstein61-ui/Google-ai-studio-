# Kesher Skills - Full Shareable Markdown

Generated from the repository `skills/` directory. Reference files remain in their extracted folders and the installable zip.

---

# google-ai-studio-app-builder

Source: `skills/google-ai-studio-app-builder/SKILL.md`

---
name: google-ai-studio-app-builder
description: Build, deploy, and harden full-stack AI applications using Google AI Studio. Use when prototyping with Build mode, designing prompt-to-code apps, integrating Firebase AI Logic, deploying to Cloud Run, or following the 7-day hardening plan from prototype to MVP.
---

# Google AI Studio App Builder

Use this skill as a compact implementation pointer for Google AI Studio sourced prototypes. Keep GitHub as the durable handoff, move secrets server-side, add CI gates before production, and verify exported code in the repo before shipping.

---

# kesher-ai-feature-modules

Source: `skills/kesher-ai-feature-modules/SKILL.md`

---
name: kesher-ai-feature-modules
description: All 11 AI feature modules for the Kesher dating app. Use when implementing, evaluating, or deploying a specific feature module such as bio coaching, values phrasing, taste profiles, daily picks, match explanations, anti-burnout, moderation, scam detection, report intake, AI disclosure, or personality coaching.
---

# Kesher AI Feature Modules

Use this skill to keep Kesher AI surfaces bounded, labeled, user-controlled, and testable. Prefer micro-surfaces over a general chatbot, require human confirmation for consequential actions, and update the AI feature registry whenever capability behavior changes.

---

# kesher-ai-governance

Source: `skills/kesher-ai-governance/SKILL.md`

---
name: kesher-ai-governance
description: Implement Kesher AI feature allocation, system boundaries, registry governance, model routing, human-in-the-loop triggers, and safety policy enforcement. Use when changing AI feature registry entries, model route choices, trust hub copy, policy checks, or governance docs.
---

# Kesher AI Governance

Use this skill when an AI feature changes what data is processed, which model route is used, or what a user can do with generated output. Keep generated assistance draft-only, structured, disclosed, and reversible where relevant.

---

# kesher-bfas-assessment

Source: `skills/kesher-bfas-assessment/SKILL.md`

---
name: kesher-bfas-assessment
description: Implement and review Kesher's opt-in BFAS/Big Five Aspects assessment flow, deterministic scoring, answer handling, consent copy, reset/delete behavior, and non-clinical dating-style framing. Use when changing PersonalityAssessment, personality score types, onboarding assessment flows, Firestore/Firebase persistence for answers or scores, or tests for BFAS scoring and assessment privacy.
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
2. Keep scoring deterministic. Do not use Gemini or any LLM to score answers. LLMs may only interpret already-computed percentiles in downstream skills.
3. Treat the current short form as MVP scaffolding. If expanding beyond 20 items, prefer a versioned item bank with stable IDs, reverse-key metadata, domain/aspect mapping, and a migration path for old sessions.
4. Store raw answers and derived scores as private, user-owned data. Do not expose raw answers, raw BFAS/aspect scores, or hidden weights in discovery, match explanations, or share cards.
5. Make opt-in, reset, export, and delete controls visible wherever the user can view the profile. Reset clears answers/scores and regenerated summaries; delete removes personality data subject to legal/safety retention rules.
6. Validate copy: no diagnosis, therapy framing, fixed identity labels, compatibility scores, soulmate/destiny claims, or personality-based gatekeeping.
7. Read `$kesher-personality-research/references/measurement-licensing-hebrew.md` before adding or changing item text, Hebrew copy, instrument names, or production activation language.

## Scoring Contract

- Score each item from 1 to 5.
- Reverse-key items with `6 - value`.
- Aggregate by domain and aspect separately.
- Convert MVP averages to 0-100 display values only as an approximation unless normative percentiles are available.
- Version the scoring algorithm and questionnaire. Persist the version with each completed session.
- Never call approximate 0-100 values "validated percentiles" without a real norm table.
- No commercial instrument is active until rights, Hebrew adaptation, privacy review, and validation gates are documented.

Read `references/assessment-contract.md` when changing questionnaire length, score storage, or the distinction between approximation and percentile.

## Acceptance Checks

- Incomplete assessments cannot be submitted.
- Reverse-keyed items change scores in the expected direction.
- The UI says the assessment is private, reflective, editable/resettable, and non-clinical.
- Reset/delete actions route through authenticated server or trust-service paths.
- Downstream AI receives derived percentiles/summaries only, never raw answers.
- `npm run check` or the narrowest TypeScript/test command passes.

Use `$kesher-personality-delivery` for browser validation, GitHub/CI review, or deployment workflow after implementation.

---

# kesher-calm-ux

Source: `skills/kesher-calm-ux/SKILL.md`

---
name: kesher-calm-ux
description: Design premium calm UX for the Kesher dating app. Use when designing screens, user flows, onboarding, profile builders, matching interfaces, safety tools, Hebrew-first RTL layouts, accessibility standards, and anti-casino dating mechanics.
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
7. Read `$kesher-personality-research/references/compatibility-reflection-science.md` before changing trait claims, pair-reflection claims, or relationship-science copy.

## Forbidden Outputs

Never produce compatibility scores, match percentages, soulmate/destiny claims, perfect-match claims, doomed/incompatible verdicts, attractiveness/desirability rankings, raw personality scores, hidden ranking logic, private taste, private messages, exact location, or protected-trait inferences.

Use "possible strength", "possible friction", "worth discussing", and "may notice" language. Do not imply Kesher can know whether two people should date.

Read `references/reflection-contract.md` before changing prompt or schema language.

## Acceptance Checks

- A request without mutual consent returns `403` and never calls Gemini.
- `signals_used` contains only `COMPATIBILITY_ALLOWED_SIGNALS`.
- Prohibited-language tests cover Hebrew and English examples.
- UI language says reflection, not prediction.
- Fallback behavior returns no invented compatibility report.

Use `$kesher-personality-delivery` for browser and CI checks.

---

# kesher-explainable-ai

Source: `skills/kesher-explainable-ai/SKILL.md`

---
name: kesher-explainable-ai
description: Implement Kesher trust language, explanation provenance, and transparency for AI recommendations. Use when generating safe explanations, source chips, signal allowlists, fallback templates, or management controls for why-match and recommendation surfaces.
---

# Kesher Explainable AI

Use this skill to explain visible signals without revealing private taste, hidden weights, raw personality data, or sensitive inferences. Prefer short provenance-labeled explanations and deterministic fallbacks when model output is unavailable.

---

# kesher-filtering-marketplace

Source: `skills/kesher-filtering-marketplace/SKILL.md`

---
name: kesher-filtering-marketplace
description: Implement Kesher filtering grammar, discovery marketplace mechanics, reciprocal recommendation ordering, Daily Picks versus Explore distinctions, hard and soft filters, exposure fairness, and anti-starvation safeguards.
---

# Kesher Filtering Marketplace

Use this skill when changing discovery ordering, filters, candidate eligibility, or fairness controls. Keep user-facing explanations limited to visible signals and do not expose hidden weights or private personality/taste internals.

---

# kesher-gemini-integration

Source: `skills/kesher-gemini-integration/SKILL.md`

---
name: kesher-gemini-integration
description: Integrate Gemini AI into Kesher with structured outputs, function calling, grounding, system instructions, server-side proxy architecture, trust-preserving interaction patterns, and safe fallback behavior.
---

# Kesher Gemini Integration

Use this skill when adding or changing Gemini-backed features. Keep API keys server-side, validate structured outputs, avoid sensitive inference, and fall back to deterministic copy when model output is missing or unsafe.

---

# kesher-high-thinking-routing

Source: `skills/kesher-high-thinking-routing/SKILL.md`

---
name: kesher-high-thinking-routing
description: Route Kesher Gemini thinking-mode work. Use when deciding when to enable high-thinking controls, configuring thinking budgets, designing fast-plus-thinking patterns, or planning A/B tests for reasoning-heavy AI features.
---

# Kesher High Thinking Routing

Use this skill only for features that genuinely need deeper reasoning. Keep low-risk and latency-sensitive surfaces on faster routes, and reserve higher-thinking paths for safety, reflection, planning, or complex grounded synthesis.

---

# kesher-learned-taste

Source: `skills/kesher-learned-taste/SKILL.md`

---
name: kesher-learned-taste
description: Implement Kesher implicit and explicit preference learning, taste profiles, event capture, taste weights, and hybrid on-device/server recommendation architecture while preserving privacy and user controls.
---

# Kesher Learned Taste

Use this skill when changing taste events, preference weights, or recommendation inputs. Explicit controls outrank implicit observations, private messages/photos/protected traits are excluded, and explanation layers must not reveal hidden taste internals.

---

# kesher-low-latency-ai

Source: `skills/kesher-low-latency-ai/SKILL.md`

---
name: kesher-low-latency-ai
description: Design server-side AI proxy architecture for low-latency Kesher responses. Use when implementing model routing matrices, latency targets, streaming patterns, feature registry routing, and policy-aware AI request handling.
---

# Kesher Low Latency AI

Use this skill to keep AI surfaces fast without weakening trust controls. Prefer deterministic fallbacks, minimal payloads, schema validation, and feature-specific model routing over broad generic chat calls.

---

# kesher-maps-date-planner

Source: `skills/kesher-maps-date-planner/SKILL.md`

---
name: kesher-maps-date-planner
description: Build Google Maps-grounded Kesher date planning with venue suggestions, fairness previews, observance-aware scheduling, safe-venue defaults, accessibility-conscious planning, citation UI, and user-reviewed sending.
---

# Kesher Maps Date Planner

Use this skill when changing grounded date suggestions or venue planning. Keep locations coarse unless the user explicitly narrows them, show citations/provenance, and require user review before any plan is sent.

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
6. Read `$kesher-personality-research/references/compatibility-reflection-science.md` and `$kesher-personality-research/references/privacy-consent-visibility-sharing.md` before adding personality-derived triggers.

Read `references/pacing-contract.md` before changing triggers or prompt copy.

## Copy Standard

Use a calm prompt to pause, breathe, or reflect on what felt energizing or draining. Do not imply the user is addicted, broken, desperate, or making bad decisions.

Default to coarse session signals. Personality-derived triggers are blocked for production until measurement and consent gates explicitly approve them.

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
description: Implement and review Kesher's permissioned personality sharing flows: previewable share cards, recipient/scope selection, expiry, revoke, audit copy, and mutual-consent disclosure. Use when building personality share-card UI, share/revoke APIs, privacy settings, trust hub controls, or data models for temporary personality access.
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
Read `$kesher-personality-research/references/privacy-consent-visibility-sharing.md` before changing audience labels, consent steps, revoke copy, or analytics fields.

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
- Revocation copy says it blocks future in-app access and does not promise to erase screenshots or memory.

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
2. Read `$kesher-personality-research/references/tooling-deployment-delivery.md` and `references/plugin-map.md` to choose platform tools. Do not invoke deploy, production config, billing, database migrations, GitHub pushes, PR creation, or external automations without explicit approval.
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

Stop and request explicit approval before changing auth, roles, Firebase rules, database schema, migrations, production config, secrets, billing, deploy settings, external automation tools, dependency versions, share/revoke persistence, or personality-driven ordering/gating.

## Acceptance Checks

- Feature-specific safety contracts are preserved.
- `docs/adr` and `src/ai/featureRegistry.ts` are updated when behavior or governance changes.
- Validation output is recorded in the final response.
- Browser screenshots or in-app browser checks are used for meaningful UI changes.
- CI/review/deploy plugins are used only when appropriate and approved.
- Vercel prototype artifacts (`/prototype`, `/skills-hub`, `/prototype/skills.html`, `/downloads/kesher-personality-skills.zip`) stay synchronized with canonical `skills/`.

---

# kesher-personality-engine

Source: `skills/kesher-personality-engine/SKILL.md`

---
name: kesher-personality-engine
description: Implement Kesher personality measurement, deterministic scoring, private reflection reports, mutual-consent discussion prompts, and provenance-labeled match explanations using Big Five or BFAS-style structures without deterministic fit claims.
---

# Kesher Personality Engine

Use this skill for the end-to-end personality pipeline. Keep scoring deterministic and gated, keep interpretation private by default, and use `$kesher-personality-research` before changing measurement, licensing, Hebrew, or validation assumptions.

---

# kesher-personality-ocean

Source: `skills/kesher-personality-ocean/SKILL.md`

---
name: kesher-personality-ocean
description: Implement Kesher OCEAN/Big Five personality reflection with Jewish observance context and Hebrew-first localization. Use when generating culturally aware reflection cards, consent-scoped discovery experiments, or non-deterministic personality interpretation.
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
7. Read `$kesher-personality-research/references/gemini-vertex-runtime-governance.md` before changing model routing, prompt inputs, logging, or runtime copy.

## Output Contract

Read `references/output-contract.md` before changing schemas, prompts, or UI cards.

The profile may include private summary, domain cards, aspect highlights, dating superpower, growth area, communication notes, and repair suggestions.

The profile must not include diagnosis or treatment language, fixed identity labels, match scores, desirability claims, raw BFAS answers, raw score dumps, hidden weights, private taste, or private messages.

The profile must make measurement limits visible when instrument rights, Hebrew adaptation, or validation are not production-ready.

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
description: Convert Kesher personality PDF dossiers and research findings into implementable, evidence-labeled product and engineering guidance. Use when grounding Kesher BFAS/Big Five measurement, instrument licensing, Hebrew feasibility, Israeli privacy, consent, visibility, permissioned sharing, Gemini/Vertex runtime governance, validation gates, repository delivery, or trust-forward personality feature decisions from the PDF corpus.
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
7. Read `$kesher-personality-research/references/privacy-consent-visibility-sharing.md` before changing visibility defaults, consent copy, share-card copy, or revoke behavior.

## Acceptance Checks

- Discovery surfaces never show model-derived trait labels by default.
- "Why This Match" explanations use whitelisted visible signals only.
- Owner-only screens clearly say private/editable/resettable.
- Mutual-consent screens clearly name who can see what and for how long.
- Admin views do not become backdoor profile-dossier views.
- Public surfaces use self-declared values and visible signals only; model-derived personality remains private unless the owner explicitly shares a reviewed summary.

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

# kesher-private-recommendations

Source: `skills/kesher-private-recommendations/SKILL.md`

---
name: kesher-private-recommendations
description: Implement Kesher permissioned sharing, private taste profiles, privacy-preserving recommendations, staged disclosure, consent flows, and sensitive-data exclusion schemas without leaking private recommender state.
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
7. Read `$kesher-personality-research/references/privacy-consent-visibility-sharing.md` before changing data classification, consent, reset, or sharing behavior.

Read `references/taste-contract.md` when adding event types, weights, reset semantics, or recommender inputs.

## Ranking Boundary

The recommender may use private taste internally only after consent. Public-facing explanations must receive a sanitized evidence packet and must not say "your private taste profile prefers X" about another person.

Treat private taste as sensitive personal data operationally. If used for ordering, keep the influence private, auditable, resettable, and clearly disclosed in the Trust Hub.

## Acceptance Checks

- Consent off means no private taste generation/update.
- Reset clears learned taste and cached explanations but keeps legal/safety records as required.
- Output validator and copy checks block attractiveness, hidden ranking, and protected-trait inference.
- "More like this" and "less like this" are explainable and reversible.
- Private taste never appears in another user's UI.

Use `$kesher-personality-why-match` for explanation-layer work and `$kesher-personality-delivery` for verification.

---

# kesher-system-prompt

Source: `skills/kesher-system-prompt/SKILL.md`

---
name: kesher-system-prompt
description: Use the Kesher OS strategic framework for deep research, product evaluation, architecture design, execution planning, run modes, evaluation rubrics, product principles, platform role assignments, and connector design.
---

# Kesher System Prompt

Use this skill for high-level Kesher operating-system work. Keep outputs evidence-labeled, trust-forward, implementation-ready, and routed to the appropriate specialist skill before code changes.

