# Kesher — Reference & Operator Skills Separation Map (PR 0)

> Per the non-negotiable rule: **legal, privacy-law, governance, operator, platform/vendor, research, and external items are NOT member-facing interactive skills and must not be "deepened" as app skills.** This map proposes how PR 1 separates them. PR 0 documents only; no registry change yet.

## 1. Member-facing interactive skills (KEEP in interactive Hub)

Deepen-now (demo-safe, owner-scoped, deterministic fallback, no approval): `private-taste`, `why-this-match`, `pacing-coach` (+ conditional on render: `consent-ux`, `personality-visibility`).
Deepen-after-fix: `personality-profile`, `personality-ocean`, `filtering-marketplace`, `learned-taste`, `permissioned-sharing`, `compatibility-reflection`, `maps-date-planner`, `grounded-search`, `image-analysis`, `personality-assessment`.

## 2. Legal / Privacy references (MOVE → "Legal & Privacy")
- `israeli-privacy` (Amendment 13 / PPA guidance) — policy guidance, not an action.

## 3. Research / Methodology references (MOVE → "Research")
- `psychometric-validation`, `personality-research`.

## 4. Governance / Operator references (MOVE → "Operator")
- `ai-runtime-governance`, `ai-feature-modules`, `low-latency-ai`, `high-thinking-routing`, `system-prompt`, `dark-pattern-audit`, `personality-delivery`, `explainable-ai`, `personality-engine`, `calm-ux`.

## 5. Platform / Vendor references (MOVE → "Platform")
- `gemini-integration`, `google-ai-studio-app-builder`.

## 6. External demo utilities (HIDE / REMOVE from member grid)
- `sparkmatch-dating-app-skill`, `video-generator` (external; no canonical `skillId` link), `voice-integration` (`ENABLE_AI_VOICE_REFLECTION=false`).

## 7. `.agents/skills` bridge wrappers (operator personas — never member skills)
- `kesher-ai-feature-guardian`, `kesher-privacy-safety-redteam`, `kesher-rtl-calm-ux-reviewer`, `kesher-skills-hub-operationalizer`, `kesher-vercel-preview-verifier`. Keep under operator docs; not surfaced in the Hub.

## 8. Proposed PR 1 direction (NOT executed in PR 0)
1. Add a `surfaceClass: 'interactive' | 'reference'` field to `SkillDefinition` / `skillRegistry.ts` (additive, default `'interactive'`).
2. Mark the §2–§6 items `reference`; render them in a separate, clearly-labeled, **non-launchable** "Reference & Operator" section of `SkillsHub.tsx`.
3. Hide flag-off/external items (`voice-integration`, `sparkmatch-dating-app-skill`, `video-generator`) until verified/enabled.
4. Add the missing `skillId` links for the 5 unlinked skills (see INVENTORY §D).
5. **Preserve all knowledge** — move/label, do not erase. Canonical `skills/*/SKILL.md` packages remain.

> Hard rule restated: D/E items are reference-only and are **not** `DEEPEN_NOW`.

## 9. PR 1 — Executed
The §8 direction is now implemented (registry/UI only): `surfaceClass`/`visibility`/`deepeningDecision` added to the registry; the Hub renders grouped sections and hides `hidden` items; reference cards use "Open reference" with no start/complete; the 5 missing `skillId`s were linked without making external/hidden items interactive. Invariants are enforced in `src/features/skills/inventoryConsistency.test.ts`. No backend/auth/Firestore/AI-prompt/deploy change. Operator bridge wrappers in `.agents/skills/*` remain operator-only and are not surfaced in the member Hub.
