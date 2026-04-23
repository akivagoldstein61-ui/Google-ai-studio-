# AGENTS.md

Kesher operator contract for Codex CLI, GitHub coding agent, and other repo-local coding agents.

This file exists to keep implementation aligned with Kesher product truth, trust boundaries, and the current repo reality.

For repo-wide and multi-phase work, use the companion master prompt kit at `docs/codex/KESHER_CODEX_MASTER_SKILLS.md`.

## 1. Mission

Build Kesher as a trust-forward, Hebrew-first Jewish dating product for Israel.

Optimize for:
- trust before growth
- intent before dopamine
- clarity before cleverness
- private personalization before public scoring
- finite quality before infinite quantity
- human control before AI autonomy
- local fluency before generic scale

Do not optimize for:
- endless browsing
- swipe-casino mechanics
- manipulative monetization
- faux exclusivity
- novelty AI for its own sake

## 2. Product truth to preserve

Treat these as canonical unless an explicitly approved product decision changes them:
- Hebrew-first Jewish dating for Israel, with English support
- serious, respectful, verified dating
- two discovery modes: Daily Picks and Explore
- three-layer filter grammar: Hard Filters, Soft Preferences, Learned Taste
- explainable recommendations
- visible trust system
- assistive AI only
- premium calm, not casino-like
- dignified free path
- premium refines or accelerates, never degrades dignity

## 3. Non-negotiable red lines

Never introduce or normalize:
- public attractiveness scores
- hot-or-not mechanics
- anonymous random chat
- hookup-first framing
- AI pretending to be the user
- AI auto-sending messages or flirtation
- protected-trait inference from photos
- deceptive ranking or hidden throttling
- manipulative monetization
- safety theater
- client-side secrets
- uncontrolled production writes by agents
- direct agent-to-production destructive actions
- paywall on match-to-message
- paywall on safety, reporting, blocking, or account deletion

## 4. Repo reality and implementation stance

This repo is still a prototype moving toward production.

Assume:
- some navigation is still prototype-shaped
- some auth/state flows are still mocked or simplified
- current UI imports are a useful surface inventory, not final architecture

Do not fossilize prototype convenience into permanent structure.

When in doubt:
- preserve the user-facing product shell
- prefer documenting and structuring over rewriting large logic flows
- isolate low-risk refactors
- avoid touching auth, data, billing, or moderation workflows unless the task requires it

## 5. Canonical current surface inventory

Public product surfaces currently represented in the repo include:
- WelcomeScreen
- OnboardingFlow
- DailyPicksScreen
- ExploreScreen
- InboxScreen
- ChatThread
- SettingsScreen
- AITrustHub
- PrivateTasteProfile
- ProfileDetail
- MatchSheet
- SafetyCenter

Internal/admin surfaces currently represented:
- AIOpsScreen
- ExperimentsScreen

Treat public and internal surfaces as separate systems.
Do not accidentally expose internal/admin surfaces inside public UX.

## 6. Target route contract

Use this as the intended UI/flow contract when organizing screens and components:
- /welcome
- /onboarding
- /daily
- /explore
- /inbox
- /inbox/:conversationId
- /profile/:profileId
- /settings
- /settings/safety
- /settings/ai-trust
- /settings/taste-profile
- /admin/ai-ops
- /admin/experiments

If current code still uses boolean or local-state navigation, treat that as temporary implementation detail.

## 7. AI and trust boundaries

Respect the AI feature registry and its constraints.

Default rules:
- user-facing AI is assistive, not authoritative
- drafts require user review when authorship matters
- explanations must use whitelisted, user-visible signals only
- citations must be surfaced when grounding/search/maps are used
- consent must remain explicit where currently required
- exact addresses must not be introduced into date-planning flows
- high-risk safety or moderation outputs must not silently become automated enforcement

Never weaken existing guardrails around:
- consent
- human confirmation
- citation UI
- excluded data
- internal-only features

## 8. Design-system implementation rules

When doing UI work:
- prefer extracting reusable wrappers over copy-pasting one-off UI
- keep RTL and Hebrew first-class, not bolt-on
- use logical direction semantics, not left/right assumptions
- model loading, empty, error, disabled, blocked, and AI-unavailable states
- keep trust signals visible but not noisy
- keep motion restrained and calm

Preferred component groups:
- Foundations
- RTL + Hebrew
- Primitives
- Trust + AI patterns
- Discovery
- Messaging + Match
- Settings
- Safety
- Premium
- Admin/Internal

## 9. Files to inspect first for most UI/architecture tasks

Start with:
- src/App.tsx
- src/ai/featureRegistry.ts
- docs/claude-import-refresh/08_first_implementation_slices.md

Then inspect the specific feature file you are touching.

## 10. Safe default behavior for coding agents

Do:
- make PR-sized diffs
- prefer additive docs before risky rewrites
- preserve existing imports and screen names unless cleanup is explicitly required
- leave clear follow-up notes when a larger architectural change is needed
- keep auth, billing, moderation, and deletion/export flows conservative
- use server-side patterns for AI and secrets

Do not:
- invent product rules
- silently broaden feature scope
- merge public and internal UX flows
- introduce broad router/auth/data rewrites unless explicitly requested
- remove screens just because they are imperfect
- convert reflective AI into predictive or deterministic compatibility claims

## 11. Output contract for agent tasks

For implementation tasks, return:
1. What changed
2. Why it changed
3. What files were added or modified
4. What was deliberately not changed
5. Risks or follow-up items

If a requested change would violate product truth or trust boundaries, stop and say so clearly.

## 12. Definition of done

A task is done only when:
- the requested artifact exists in the repo in a usable form
- the change respects product canon and red lines
- syntax is valid for the changed surface
- nearby behavior is not obviously regressed
- any trust/AI constraints remain intact
- the final summary names residual risk if any

## 13. Preferred near-term contribution types

High-value, low-risk work in this repo includes:
- canonical UI map docs
- route inventory docs
- component taxonomy docs
- extraction of shared presentation wrappers
- trust/AI disclosure components
- empty/loading/error state coverage
- RTL/Hebrew polish
- test scaffolding for pure functions and validators

Lower-priority or higher-risk work that needs explicit approval:
- auth rewrites
- billing/entitlement logic
- moderation enforcement changes
- data model migrations
- production deployment changes
- changing AI policy boundaries

## 14. Final rule

Kesher should feel like a calm, trustworthy matchmaker with modern product craft.
Not a slot machine.
Not a chatbot costume.
Not a growth hack with a nicer font.
