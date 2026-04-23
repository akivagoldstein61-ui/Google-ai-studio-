# Kesher Codex Master Skills

Copy-paste prompt kit for GitHub-connected Codex working directly inside this repository.

## How to use this kit

- Use **one prompt at a time**.
- Let Codex read `AGENTS.md` first.
- Prefer a **branch + PR-sized diff** over broad rewrites.
- Use the current repo commands unless the task explicitly changes tooling:
  - build: `npm run build`
  - typecheck/lint: `npm run lint`
  - run locally: `npm run dev`
  - tests: no test runner exists yet in `package.json`; Codex must not invent one silently
- If a prompt touches auth, data, moderation, billing, deletion/export, or AI authority boundaries, Codex should plan first and pause at the approval boundary before any irreversible or high-blast-radius change.

---

## Skill 01 — Corpus Canon Freeze + ADR Lock

```text
You are operating inside GitHub-connected Codex with direct access to the Kesher repository.
Follow AGENTS.md first.

MISSION
Turn the current repo and attached Kesher corpus into canonical build authority.
Do not write broad strategy prose.
Create or update repo docs that lock source-of-truth and architecture decisions.

PRIMARY OUTPUTS
1. a canon map
2. a supersession map
3. a source-of-truth hierarchy
4. ADR drafts for implementation lock

REQUIRED REPO ARTIFACTS
Create or update:
- docs/adr/ADR-001-source-of-truth.md
- docs/adr/ADR-002-auth-and-data-substrate.md
- docs/adr/ADR-003-ranking-authority.md
- docs/adr/ADR-004-ai-boundaries.md
- docs/adr/ADR-005-safety-release-gate.md
- docs/adr/ADR-006-localization-observance.md
- docs/canon/KESHER_CANON_MAP.md

RULES
- Prefer current code and current repo audit over stale planning docs.
- Label claims as VERIFIED, INFERRED, HEURISTIC, or UNKNOWN.
- Do not flatten contradictions.
- Keep docs concise and operational.
- If a required doc path does not exist, create it.

WORKFLOW
1. Inspect the current repo and relevant docs.
2. Produce a short plan.
3. List files to add or update.
4. Create the minimum doc set.
5. Run verification:
   - confirm markdown files exist
   - confirm internal links/paths are valid where used
6. Return a summary with risks and unresolved decisions.

OUTPUT CONTRACT
Return:
1. Assumptions
2. Files inspected
3. Files added or updated
4. Canon decisions locked
5. Unresolved decisions
6. Verification results
7. Risks and follow-ups
```

---

## Skill 02 — Repo Contract Drift Repair + Minimal Diff Patch

```text
You are operating inside GitHub-connected Codex with direct access to the Kesher repository.
Follow AGENTS.md first.

MISSION
Inspect the repo for contract drift between server routes, client services, schemas, validators, and UI consumers.
Then implement the smallest safe patch set that restores semantic alignment.

PRIORITY FILES
- server/aiRoutes.ts
- src/services/aiService.ts
- src/services/aiSafetyService.ts
- src/services/aiDatePlannerService.ts
- src/ai/featureRegistry.ts
- src/ai/capabilityRouter.ts
- src/ai/schemas.ts
- src/ai/outputValidators.ts
- src/features/chat/ChatThread.tsx
- src/components/onboarding/ProfileBuilder.tsx
- src/types/index.ts

RULES
- Keep diffs minimal and reversible.
- Fix runtime-breaking mismatches before anything strategic.
- Do not widen feature scope.
- Do not invent missing tests; if no test harness exists, use build + lint + targeted behavior checks.

PHASE 1
1. Map producer vs consumer contracts.
2. Produce a mismatch table with severity.
3. Propose the smallest ordered patch plan.
4. Then implement.

VERIFICATION
- `npm run lint`
- `npm run build`
- name any manual behavior checks needed

OUTPUT CONTRACT
Return:
1. Assumptions
2. Files inspected
3. Contract drift table
4. Files changed
5. Verification results
6. Risks and rollback notes
```

---

## Skill 03 — Trust Substrate, Identity, and Data Ownership

```text
You are operating inside GitHub-connected Codex with direct access to the Kesher repository.
Follow AGENTS.md first.

MISSION
Decide and scaffold the production trust substrate for Kesher.
If the repo is not ready for a full migration, land ADRs, interfaces, and type boundaries only.
Do not perform destructive data migrations.

DECISION SCOPE
- auth authority
- hot operational state
- trust ledgers
- moderation records
- consent logs
- premium entitlements
- deletion/export workflows

DELIVERABLE SHAPE
If safe to code, create:
- ADR docs
- interface/type stubs
- config boundary docs
- TODO markers only where they reduce ambiguity

DO NOT
- silently switch the stack
- create peer auth authorities
- add production secrets
- invent data retention behavior

WORKFLOW
1. Inspect current Firebase-shaped repo assumptions.
2. Compare against the intended trust substrate.
3. Create or update ADRs and boundary docs.
4. If justified, add minimal interface scaffolding only.
5. Verify with `npm run lint` and `npm run build` if code changed.

OUTPUT CONTRACT
Return:
1. Assumptions
2. Current stack reading
3. Files added or updated
4. Canonical ownership map
5. What was deliberately not implemented
6. Verification results
7. Risks and blockers
```

---

## Skill 04 — Reciprocal Ranking, Daily Picks, and Marketplace Mechanics

```text
You are operating inside GitHub-connected Codex with direct access to the Kesher repository.
Follow AGENTS.md first.

MISSION
Implement the smallest safe ranking-system foundation for Kesher.
Preserve Daily Picks + Explore and Hard Filters + Soft Preferences + Learned Taste.
Do not let LLMs own ranking authority.

REPO GOALS
- remove obvious mock or random ranking behavior where this task touches it
- define deterministic mutual eligibility
- define Daily Picks vs Explore contracts in code and docs
- keep learned taste as reranking only, not eligibility

ALLOWED CHANGES
- types
- pure ranking utilities
- server-side ranking scaffolding
- docs explaining ranking contracts
- replacement of clearly placeholder/random matching logic if reached safely

NOT ALLOWED
- hidden sensitive inference
- attractiveness or chemistry scoring
- broad auth/data rewrites unless explicitly needed

VERIFICATION
- `npm run lint`
- `npm run build`
- manual check: Daily Picks and Explore still render
- manual check: no new public explanation leaks private signals

OUTPUT CONTRACT
Return:
1. Assumptions
2. Files inspected
3. Files changed
4. Ranking contract implemented
5. Verification results
6. Risks and next steps
```

---

## Skill 05 — Learned Taste V1, Explicit-First, Private, Auditable

```text
You are operating inside GitHub-connected Codex with direct access to the Kesher repository.
Follow AGENTS.md first.

MISSION
Implement the lowest-risk Learned Taste v1 for Kesher.
Explicit signals first. Private. Inspectable. Resettable. No covert profiling.

ALLOWED SIGNALS
- hard filters
- soft preferences
- recommendation mode
- manual taste edits
- explicit “More like this” / “Less like this”
- likes and passes only as weak hints if already used in touched codepaths

BANNED SIGNALS
- messages or message sentiment for taste learning
- photo embeddings
- attractiveness proxies
- inferred religiosity, ethnicity, politics, sexuality, health, or status
- hidden popularity/desirability metrics

REQUIRED ARTIFACTS
If code changes are safe, create or update:
- taste state types
- provenance/confidence fields where justified
- reset/edit control hooks
- docs for allowed vs banned signals

VERIFICATION
- `npm run lint`
- `npm run build`
- manual check: user controls still exist and private-taste surfaces still render

OUTPUT CONTRACT
Return:
1. Assumptions
2. Files changed
3. Learned Taste scope implemented now
4. What remains validate-first or off-by-default
5. Verification results
6. Risks and follow-ups
```

---

## Skill 06 — Assistive AI Wave 1, Bounded and Human-in-Control

```text
You are operating inside GitHub-connected Codex with direct access to the Kesher repository.
Follow AGENTS.md first.

MISSION
Implement the safest Wave 1 AI slice for Kesher.
Bounded, assistive, structured, and human-in-control.

WAVE 1 TARGETS
- Hebrew-first bio coach
- values / observance phrasing assistant
- AI disclosure + human-in-control composer
- harassment / toxicity classifier surface wiring
- report intake assistant

DO NOT BUILD IN THIS PASS
- AI auto-send
- AI impersonation
- synthetic dating behavior
- unsupported chemistry or compatibility claims

REQUIRED PATTERN
For each touched feature:
- structured output
- visible draft/assist label where relevant
- user confirmation before outward-facing use
- fallback or fail-closed behavior if schema validation fails

VERIFICATION
- `npm run lint`
- `npm run build`
- manual check for each touched AI surface

OUTPUT CONTRACT
Return:
1. Assumptions
2. Features touched
3. Files changed
4. Disclosure and control behavior preserved
5. Verification results
6. Risks and next actions
```

---

## Skill 07 — Explainability, Trust Copy, and AI Trust Hub

```text
You are operating inside GitHub-connected Codex with direct access to the Kesher repository.
Follow AGENTS.md first.

MISSION
Make Kesher’s explanation and trust language clearer, calmer, and less creepy.
Implement copy and UI refinements that make AI feel bounded and adjustable.

COPY GOALS
- helpful, not clairvoyant
- specific, not mystical
- adjustable, not authoritative
- trust-calibrating, not hypey

IMPLEMENTATION SCOPE
- AI Trust Hub copy
- explanation labels for “why shown” or “why this match” if present in touched surfaces
- banned or risky terms in touched files such as chemistry theater, hidden certainty, or mind-reading language

RULES
- Keep outward copy close to explicit user choices and visible signals.
- Do not imply destiny, deep diagnosis, or total understanding.
- If Hebrew copy is touched, preserve RTL and mixed-language readability.

VERIFICATION
- `npm run lint`
- `npm run build`
- manual UI check on any touched copy surfaces

OUTPUT CONTRACT
Return:
1. Assumptions
2. Files changed
3. Vocabulary changes made
4. Risky language removed or downgraded
5. Verification results
6. Follow-ups
```

---

## Skill 08 — Safety, Moderation, Privacy, and Release Gate

```text
You are operating inside GitHub-connected Codex with direct access to the Kesher repository.
Follow AGENTS.md first.

MISSION
Turn the repo’s current safety and privacy posture into an operational release gate.
If implementation is too broad for one pass, land the checklist, docs, and smallest enabling code only.

HIGH-PRIORITY AREAS
- report/block visibility
- deletion / account removal visibility
- AI disclosure surfaces
- moderation queue or summarization boundaries
- age-gate or underage risk notes if represented in repo docs

DO NOT
- fake compliance completion
- claim a public-launch-ready state without evidence
- automate consequential moderation actions

REQUIRED ARTIFACTS
Create or update:
- release checklist doc
- blocker list
- touched trust/safety UI copy if clearly missing

VERIFICATION
- `npm run lint`
- `npm run build`
- manual check on touched safety/settings surfaces

OUTPUT CONTRACT
Return:
1. Assumptions
2. Files changed
3. Release blockers captured
4. What is still missing for beta vs public launch
5. Verification results
6. Risks and follow-ups
```

---

## Skill 09 — Hebrew-First Localization, Observance Taxonomy, and RTL QA

```text
You are operating inside GitHub-connected Codex with direct access to the Kesher repository.
Follow AGENTS.md first.

MISSION
Improve the repo’s Hebrew-first and Israel-first correctness without flattening observance or breaking RTL.
If the task is too broad for one pass, land the smallest high-leverage localization slice plus QA notes.

PRIORITIES
- Hebrew-first visible flows
- observance wording that stays explicit-only
- RTL and bidi correctness
- mixed Hebrew/English rendering sanity

DO NOT
- infer observance
- paste diaspora taxonomy into Hebrew without product judgment
- hardcode left/right assumptions

SAFE CHANGES
- copy improvements
- labels and taxonomy fields in touched surfaces
- RTL-safe layout fixes
- QA docs and bidi test cases

VERIFICATION
- `npm run lint`
- `npm run build`
- manual check of touched Hebrew/RTL surfaces

OUTPUT CONTRACT
Return:
1. Assumptions
2. Files changed
3. Localization or taxonomy changes made
4. RTL / bidi checks performed
5. Verification results
6. Risks and next steps
```

---

## Skill 10 — Grounded Utilities, High-Thinking Routing, and Evaluation Gates

```text
You are operating inside GitHub-connected Codex with direct access to the Kesher repository.
Follow AGENTS.md first.

MISSION
Safely extend or document advanced utilities in Kesher:
- Maps-grounded date planning
- Search-grounded freshness/help
- image analysis for bounded readiness/moderation assist
- voice as task-bounded utility
- high-thinking or low-latency routing by feature class

USE THIS PROMPT ONLY FOR A NARROW SLICE
If multiple advanced utilities are implicated, inspect first and choose the smallest safe slice.

RULES
- source-visible grounding only
- no voice companion framing
- no image-based person scoring
- no thinking-as-certainty theater
- kill switches, fallback paths, and feature flags must remain explicit

ALLOWED CHANGES
- route or config alignment
- feature gating
- docs and evaluation notes
- small UI disclosure adjustments

VERIFICATION
- `npm run lint`
- `npm run build`
- manual behavior check for the touched utility path

OUTPUT CONTRACT
Return:
1. Assumptions
2. Utility slice chosen
3. Files changed
4. Safety and disclosure posture preserved
5. Verification results
6. Revalidation needs and follow-ups
```

---

## Recommended execution order inside Codex

1. Skill 01 — Canon Freeze + ADR Lock
2. Skill 02 — Contract Drift Repair
3. Skill 03 — Trust Substrate
4. Skill 04 — Ranking + Marketplace Mechanics
5. Skill 05 — Learned Taste V1
6. Skill 06 — Assistive AI Wave 1
7. Skill 07 — Explainability + Trust Hub
8. Skill 08 — Safety + Release Gate
9. Skill 09 — Localization + RTL QA
10. Skill 10 — Grounded Utilities + Evaluation Gates

## Important note

These prompts are intentionally tailored for direct repo work.
They should produce either:
- a minimal safe code/doc diff, or
- a clear stop with blockers and the smallest next safe action.

They should not trigger a repo-wide rewrite in one pass.
