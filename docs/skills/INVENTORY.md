# Kesher Skills Hub — Source-of-Truth Inventory (PR 0)

> **Status:** Inventory & contract reconciliation only (PR 0). No runtime behavior change.
> **Commit:** `506e27e` · **Branch:** `claude/trusting-cori-6pnwv`
> **Rendered verification:** **BLOCKED** — both prototypes (Vercel `google-ai-studio-sage-sigma.vercel.app` and the Replit URL) return **HTTP 403** on every route. No mobile/RTL/render claims are made here.
> This document is the canonical crosswalk. The older `docs/skills-hub-integration-inventory.md` is superseded for inventory counts where they disagree.

---

## A. Executive Summary (counts, TARGET-VERIFIED)

| Metric | Count | Source |
|---|---:|---|
| Visible Skills Hub entries | **35** | `src/features/skills/skillRegistry.ts` (`SKILLS`); asserted by `skillsRegistry.test.ts` |
| Bespoke router pages | **17** | `SkillsRouter.tsx` switch cases |
| `PlannedSkillPage` fallbacks | **18** | 35 − 17 |
| Canonical skill packages (`skills/*/SKILL.md`) | **43** | `ls skills/*/SKILL.md` |
| Canonical dirs NOT surfaced in Hub | **8** | = `completionPlan.ts` `ADDED_PRODUCT_SKILLS` |
| `.agents/skills` bridge wrappers | **5** | `ls .agents/skills/*/SKILL.md` |
| Visible skills missing the `skillId` link | **5** | registry entries w/o `skillId` field |
| AI features (`AI_FEATURE_REGISTRY`) | **15** | `src/ai/featureRegistry.ts` |
| AI feature flags | **15** | `src/ai/featureFlags.ts` (2 OFF) |
| Model routes | **8** (all `gemini-2.5-*`) | `src/ai/modelRegistry.ts` |
| Product-completion: added / deepened / gates | **8 / 10 / 8** | `src/product/completionPlan.ts` |
| Reference/operator/legal/platform/external skills (to move/hide) | **~16** | this doc §C classification |
| Deepen-now candidates | **3** (+2 conditional) | this doc §C |

All 35 visible skills are `status:'prototype'`.

---

## B. Definitions

- **Visible Skills Hub entry** — an item in `SKILLS` (`skillRegistry.ts`) rendered as a `SkillCard` in `SkillsHub.tsx`.
- **Canonical skill package** — a `skills/<id>/SKILL.md` directory (the shareable contract).
- **Codex bridge wrapper** — a `.agents/skills/<id>/SKILL.md` operator persona (NOT a member skill).
- **Product-completion skill** — an entry in `completionPlan.ts` describing production work, not a Hub card.
- **App-native interactive skill** — a skill with a real in-app action (input/selection/draft/checklist/setting) producing/managing skill-specific output, beyond reading a card.
- **Planned fallback** — a skill rendered by `PlannedSkillPage` (teaching card + generic Start/Save-note; completion not tied to real output).
- **Reference-only item** — legal/governance/operator/research content that teaches but is not a member action (classification **D**).
- **External/platform item** — vendor docs or external reference apps (classification **E**).
- **AI feature** — an entry in `AI_FEATURE_REGISTRY` with a server route, schema, validator, prompt, model route.
- **Server route** — an Express handler under `/api/*` (`server/*.ts`).

---

## C. Visible-Skill Crosswalk (all 35)

Page: **B** = bespoke component, **P** = `PlannedSkillPage`. Render/mobile/RTL = `BLOCKED` (403) for all. Bespoke depth = `UNKNOWN` until rendered. Class A–F / decision per the agreed sets.

| # | id | canonical skillId | Page | route | aiFeatureKey | AI feature exists? | data/consent boundary | Class | Decision | Blocker | Required tests |
|---|---|---|---|---|---|---|---|---|---|---|---|
|1|personality-assessment|kesher-bfas-assessment|B|/settings/personality|personality_profile|✓|profile_data; sensitive|F|DEEPEN_AFTER_FIX|render+psychometric|no-raw-score; RTL|
|2|personality-profile|kesher-personality-profile|B|/settings/personality|personality_profile|✓|profile_data,ai_assist; owner-only|B|DEEPEN_AFTER_FIX|render|export/delete; leak|
|3|personality-engine|kesher-personality-engine|P|/settings/personality|personality_profile|✓|sensitive|D|MOVE_TO_REFERENCE|not an action|—|
|4|personality-research|kesher-personality-research|P|/profile/edit|—|n/a|none|D|MOVE_TO_REFERENCE|reference|—|
|5|personality-ocean|kesher-personality-ocean|B|/settings/personality|personality_profile|✓|profile_data|C|DEEPEN_AFTER_FIX|dup of #1/#2|dedupe; RTL|
|6|personality-visibility|kesher-personality-visibility|B|/settings/personality-visibility|—|n/a|profile_data; settings|B|DEEPEN_NOW¹|render|toggle persist; leak|
|7|consent-ux|kesher-consent-ux|B|/settings/ai-trust|—|n/a|consent ledger|B|DEEPEN_NOW¹|render|revoke 2-tap; audit|
|8|israeli-privacy|kesher-israeli-privacy|B|/settings/ai-trust|—|n/a|**legal**|D|MOVE_TO_REFERENCE|legal≠skill|—|
|9|privacy-recommendation|kesher-privacy-preserving-recommendation|B|/daily|taste_profile|✓|private_taste|C|DEEPEN_AFTER_FIX|overlaps #10/#17|leak|
|10|private-taste|kesher-private-taste|B|/settings/taste-profile|taste_profile|✓|private_taste; owner-only|B|**DEEPEN_NOW**|render|export/delete; leak; RTL|
|11|private-recommendations|kesher-private-recommendations|P|/daily|taste_profile|✓|private_taste|C|MOVE_TO_REFERENCE|dup of #10|—|
|12|why-this-match|kesher-personality-why-match|B|/daily,/inbox|why_match|✓|match_context; visible-signal allowlist|B|**DEEPEN_NOW**|render|source-chips; no %/score|
|13|permissioned-sharing|kesher-permissioned-sharing|B|/inbox|—|n/a|mutual_consent; shareCards backend|B|DEEPEN_AFTER_FIX|mutual match|revoke cascade; expiry|
|14|compatibility-reflection|kesher-compatibility-reflection|B|/inbox|compatibility_reflection|✓|mutual_consent; sensitive|B|DEEPEN_AFTER_FIX|2 users|no fit-score; consent gate|
|15|explainable-ai|kesher-explainable-ai|P|/settings/ai-trust|—|n/a|governance|D|MOVE_TO_REFERENCE|doctrine|—|
|16|filtering-marketplace|kesher-filtering-marketplace|B|/explore|—|n/a|prefs write|B|DEEPEN_AFTER_FIX|render|filter persist; RTL|
|17|learned-taste|kesher-learned-taste|B|/daily|taste_profile|✓|private_taste|B|DEEPEN_AFTER_FIX|overlaps #10|leak|
|18|maps-date-planner|kesher-maps-date-planner|P|/inbox|date_planner|✓|match_context; coarse-loc|C|DEEPEN_AFTER_FIX|no bespoke page|no-autosend; coarse-loc|
|19|pacing-coach|kesher-pacing-coach|B|/daily|pacing_coach|✓|none; deterministic|B|**DEEPEN_NOW**|render|dismiss; no-modal-on-fail|
|20|ai-runtime-governance|kesher-ai-governance|B|/settings/ai-trust,/admin/ai-ops|—|n/a|**operator**|D|MOVE_TO_REFERENCE|admin_only|—|
|21|ai-feature-modules|kesher-ai-feature-modules|P|/settings/ai-trust|—|n/a|governance; "F01-F11" stale|D|MOVE_TO_REFERENCE|registry doc|—|
|22|gemini-integration|kesher-gemini-integration|P|/settings/ai-trust,/admin|—|n/a|**vendor platform**|E|MOVE_TO_REFERENCE|vendor doc|—|
|23|low-latency-ai|kesher-low-latency-ai|P|/admin/ai-ops|—|n/a|operator|D|MOVE_TO_REFERENCE|internal|—|
|24|high-thinking-routing|kesher-high-thinking-routing|P|/admin/experiments|—|n/a|operator|D|MOVE_TO_REFERENCE|internal|—|
|25|grounded-search|**(missing — should be `kesher-grounded-search`)**|P|/settings/safety|safety_advice|✓|citations|C|DEEPEN_AFTER_FIX|no bespoke page; **skillId missing**|citation chips|
|26|image-analysis|**(missing — should be `kesher-image-analysis`)**|P|/profile/edit|— (none)|n/a|photo_analysis; sensitive|C|DEEPEN_AFTER_FIX|**skillId missing; no aiFeatureKey; flag-off feature is visual_icebreaker**|no attractiveness/trait|
|27|voice-integration|**(missing — should be `kesher-voice-integration`)**|P|/inbox|voice_reflection|✓ (flag OFF)|beta|C|REMOVE_OR_HIDE_UNTIL_VERIFIED|**skillId missing; ENABLE_AI_VOICE_REFLECTION=false**|flag-consistency|
|28|google-ai-studio-app-builder|google-ai-studio-app-builder|P|/admin/experiments|—|n/a|**external platform**|E|MOVE_TO_REFERENCE|platform|—|
|29|sparkmatch-dating-app-skill|**(missing — dir `sparkmatch-dating-app-skill` exists)**|P|/admin/experiments|—|n/a|**external app**|E|REMOVE_OR_HIDE_UNTIL_VERIFIED|skillId missing; not Kesher|—|
|30|video-generator|**(missing — dir `video-generator` exists)**|P|/admin/experiments|visual_icebreaker|✓ (flag OFF)|**external utility**|E|REMOVE_OR_HIDE_UNTIL_VERIFIED|skillId missing; flag-off|—|
|31|system-prompt|kesher-system-prompt|P|/settings/ai-trust,/admin|—|n/a|**operator doctrine**|D|MOVE_TO_REFERENCE|admin_only|—|
|32|calm-ux|kesher-calm-ux|P|/daily|—|n/a|design doctrine|D|MOVE_TO_REFERENCE|not an action|—|
|33|psychometric-validation|kesher-psychometric-validation|B|/settings/personality|—|n/a|**research**|D|MOVE_TO_REFERENCE|research|—|
|34|dark-pattern-audit|kesher-dark-pattern-audit|B|/settings/ai-trust|—|n/a|governance audit|D|MOVE_TO_REFERENCE|operator|—|
|35|personality-delivery|kesher-personality-delivery|P|/admin/experiments|—|n/a|operator/release|D|MOVE_TO_REFERENCE|not member-facing|—|

¹ `DEEPEN_NOW` for #6/#7 is conditional on render verification (currently BLOCKED). If render fails → downgrade to `DEEPEN_AFTER_FIX`.

**Buckets:** DEEPEN_NOW = 3 (#10/#12/#19) + 2 conditional (#6/#7). DEEPEN_AFTER_FIX ≈ 9. MOVE_TO_REFERENCE ≈ 13. REMOVE_OR_HIDE ≈ 3 (#27/#29/#30). Consolidate (taste overlap) = #9/#11/#17 → fold into #10.

---

## D. Canonical Skills (`skills/*/SKILL.md`, 43 dirs)

| canonical dir | In Hub? | Maps to | Status |
|---|---|---|---|
| google-ai-studio-app-builder | #28 | external platform | reference |
| kesher-ai-evaluation-observability | **no** | `completionPlan` ADDED | product-completion (p0) |
| kesher-ai-feature-modules | #21 | governance | reference |
| kesher-ai-governance | #20 | operator | reference |
| kesher-bfas-assessment | #1 | personality | sensitive/gated |
| kesher-calm-ux | #32 | design | reference |
| kesher-compatibility-reflection | #14 | match | deepen-after-fix |
| kesher-consent-ux | #7 | settings | deepen-now¹ |
| kesher-dark-pattern-audit | #34 | governance | reference |
| kesher-data-rights-retention | **no** | `completionPlan` ADDED | product-completion (p0) |
| kesher-explainable-ai | #15 | governance | reference |
| kesher-filtering-marketplace | #16 | discovery | deepen-after-fix |
| kesher-gemini-integration | #22 | vendor | reference |
| kesher-grounded-search | #25 (skillId NOT linked) | safety | link + deepen-after-fix |
| kesher-high-thinking-routing | #24 | operator | reference |
| kesher-identity-verification | **no** | `completionPlan` ADDED | product-completion (p0, gated) |
| kesher-image-analysis | #26 (skillId NOT linked) | profile/photo | link + deepen-after-fix |
| kesher-israeli-privacy | #8 | legal | reference |
| kesher-learned-taste | #17 | discovery | deepen-after-fix |
| kesher-low-latency-ai | #23 | operator | reference |
| kesher-maps-date-planner | #18 | match | deepen-after-fix |
| kesher-match-lifecycle | **no** | `completionPlan` ADDED | product-completion (p0) |
| kesher-notifications | **no** | `completionPlan` ADDED | product-completion (p1, missing) |
| kesher-pacing-coach | #19 | discovery | deepen-now |
| kesher-permissioned-sharing | #13 | match | deepen-after-fix |
| kesher-personality-delivery | #35 | operator | reference |
| kesher-personality-engine | #3 | personality | reference |
| kesher-personality-ocean | #5 (+ dup `(1)` flat file) | personality | deepen-after-fix |
| kesher-personality-profile | #2 | personality | deepen-after-fix |
| kesher-personality-research | #4 | research | reference |
| kesher-personality-visibility | #6 | settings | deepen-now¹ |
| kesher-personality-why-match | #12 | match | deepen-now |
| kesher-privacy-preserving-recommendation | #9 | discovery | consolidate |
| kesher-private-recommendations | #11 | discovery | consolidate |
| kesher-private-taste | #10 | settings | deepen-now |
| kesher-psychometric-validation | #33 | research | reference |
| kesher-release-readiness | **no** | `completionPlan` ADDED | product-completion (p0) |
| kesher-subscription-entitlements | **no** | `completionPlan` ADDED | product-completion (p1, missing) |
| kesher-system-prompt | #31 | operator | reference |
| kesher-trust-safety-ops | **no** | `completionPlan` ADDED | product-completion (p0) |
| kesher-voice-integration | #27 (skillId NOT linked) | chat | hide (flag off) |
| sparkmatch-dating-app-skill | #29 (skillId NOT linked) | external | remove/hide |
| video-generator | #30 (skillId NOT linked) | external | remove/hide |

**Inventory drift to fix (registry change → PR 1, not PR 0):** 5 visible skills omit the `skillId` field although a canonical dir exists — `grounded-search`→`kesher-grounded-search`, `image-analysis`→`kesher-image-analysis`, `voice-integration`→`kesher-voice-integration`, `sparkmatch-dating-app-skill`→`sparkmatch-dating-app-skill`, `video-generator`→`video-generator`.

---

## E. Product Completion (`src/product/completionPlan.ts`)

- **ADDED_PRODUCT_SKILLS (8)** — not member-facing Hub skills yet; each owns a `skills/*` dir not in the Hub:
  `kesher-identity-verification` (p0, gated), `kesher-match-lifecycle` (p0), `kesher-trust-safety-ops` (p0), `kesher-notifications` (p1, missing), `kesher-subscription-entitlements` (p1, missing), `kesher-ai-evaluation-observability` (p0), `kesher-data-rights-retention` (p0), `kesher-release-readiness` (p0).
- **DEEPENED_EXISTING_SKILLS (10)** — production deltas for: private-taste, learned-taste, private-recommendations, personality-profile, personality-visibility, compatibility-reflection, maps-date-planner, ai-governance, gemini-integration, explainable-ai.
- **PRODUCT_COMPLETION_GATES (8)** — auth/onboarding/verification, real-discovery-marketplace, match/chat-lifecycle, trust-safety-operations, ai-runtime-governance, payments-entitlements (missing), notification-delivery (missing), observability-release-gates.
- **Require future approval:** identity/verification, payments/entitlements, notifications, moderation/trust ops, Firestore schema/retention, deployment/release gates.

---

## F. AI Feature Crosswalk & Drift

`visibleSkill.aiFeatureKey → AI_FEATURE_REGISTRY id → /api/ai route (aiFeatureRegistry) → schema/validator/prompt/fallback`.

15 AI features (all present, all `gemini-2.5-*`): `bio_coach, taste_profile, why_match, safety_scan, date_planner, safety_advice, rephrase_message, generate_openers, profile_completeness, voice_reflection, mod_summarizer, visual_icebreaker, personality_profile, compatibility_reflection, pacing_coach`. Skill `aiFeatureKey`s used (`personality_profile, taste_profile, why_match, compatibility_reflection, date_planner, pacing_coach, safety_advice, voice_reflection, visual_icebreaker`) all exist.

**Known drift (fix in later PRs, eval-first):**
1. **`image-analysis` (#26)** has **no `aiFeatureKey`** and there is **no `image_analysis`/`analyze_photos` feature** — the only photo feature is `visual_icebreaker` (image *generation*, OFF). Skill copy implies analysis that isn't wired.
2. **`safety_scan`** feature vs route `/api/ai/message-safety` (key/path naming mismatch to document).
3. **Eval fixtures missing:** `aiFeatureRegistry.ts` references `src/ai/evals/<id>.fixture.json`, but **`src/ai/evals/` does not exist** (there is a `docs/evals/`).
4. **Flag-off but visible interactive:** `voice-integration` (#27, `voice_reflection` OFF) and `video-generator` (#30, `visual_icebreaker` OFF).
5. `ai-feature-modules` subtitle "F01-F11" stale (15 features).
6. `schemas.ts` / `outputValidators.ts` / `prompts.ts` / `server/aiRoutes.ts` per-feature alignment **not yet line-verified** (UNKNOWN — PR 5/6).

---

## G. Rendered Verification Status

**BLOCKED.** Vercel and Replit prototypes return HTTP 403 on every probed route (`/`, `/skills-hub`, `/api/health`, `/api/version`, unknown `/api/*`). No mobile/RTL/render result is asserted. This is a deployment-reachability finding, not evidence of broken app logic. Resolve via authorized preview access (PR 10).
