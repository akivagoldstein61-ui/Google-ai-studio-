## Kesher Personality Dimension — Pull Request

> **Complete every section.** PRs with incomplete checklists will not be merged.
> If a section is not applicable, write `N/A` and explain why.

---

### 1. What feature or change is this?

<!-- One-sentence description of what this PR does. -->

---

### 2. What data classes are touched?

<!-- Select all that apply:
- trait_scores
- compatibility_indicators
- assessment_responses
- messaging_behavior
- session_metadata
- consent_records
- export_payload
- none
-->

---

### 3. What consent is required?

<!-- Describe any new or modified consent gates, including the trigger, copy, and revoke path. -->

---

### 4. What visibility applies?

<!-- internal-only | user-visible-private | user-visible-public | aggregated-anonymous -->

---

### 5. Does AI touch this feature?

<!-- Yes / No. If yes, describe the AI role and where it is called. -->

---

### 6. What deterministic boundary exists?

<!-- Describe the hard constraint (schema, enum, rule-based filter) that prevents AI producing unconstrained output. -->

---

### 7. What schemas validate output?

<!-- List schema file(s) and field(s) that constrain AI or computed output. -->

---

### 8. What inputs are explicitly NOT used?

<!-- List any user attributes or signals that are intentionally excluded from this feature (e.g. location, photo, protected attributes). -->

---

### 9. How does Revoke / Reset / Delete / Export work?

<!-- Describe the data lifecycle: how a user can revoke consent, reset their personality profile, delete their data, and export their data. -->

---

### 10. What Hebrew RTL checks were run?

<!-- Describe RTL snapshot tests run, visual checks performed, or confirm N/A with reason. -->

---

### 11. What red-team tests were added?

<!-- List new or updated tests in `npm run redteam:personality`. If none, explain why and reference an open issue. -->

---

### 12. What claim does the UI make, and what evidence label supports it?

<!-- Quote any UI claim (e.g. "People with similar openness report higher conversation satisfaction").
State the evidence label that appears next to it in the UI and its source in claim-registry.md. -->

---

## Required Checklist

### Engineering
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run test` passes
- [ ] `npm run test:schemas` passes
- [ ] `npm run test:scoring` passes
- [ ] `npm run scan:forbidden-fields` passes (no forbidden fields in member-facing code or schemas)
- [ ] `npm run scan:logs` passes (no sensitive fields logged)

### Privacy & Safety
- [ ] No forbidden field appears in member-facing output or schema (`compatibility_score`, `soulmate_score`, `marriage_probability`, `desirability_score`, `public_trait_rank`, `raw_trait_public`, `hidden_personality_rank`, `diagnosis`, `protected_trait_inference`, `auto_send`, `perfect_match`)
- [ ] Privacy / Legal approval obtained (required if consent, sharing, retention, or export paths changed)
- [ ] Safety / Trust & Safety approval obtained (required if AI messaging or moderation-adjacent features changed)

### Research & Content
- [ ] Psychometric / Research approval obtained (required if assessment or interpretation copy changed)
- [ ] Claim registry updated (`docs/personality/claim-registry.md`) if any UI claim was added or modified

### Localization
- [ ] Localization / Hebrew RTL approval obtained (required if Hebrew copy or RTL layouts changed)
- [ ] `npm run test:rtl` passes (or N/A with reason)

### Red-Team
- [ ] `npm run redteam:personality` passes
- [ ] New adversarial test cases added for any new AI-touched path

---

## Agent Review Prompt

> Copy this prompt into GitHub Copilot or another coding agent to get a structured review:
>
> *"Review this PR for personality privacy leakage, hidden ranking leakage, overclaiming, raw score exposure, diagnosis language, protected-trait inference, AI autosend paths, missing consent gates, missing revoke/delete/export paths, and Hebrew RTL regressions. Return blocking issues first."*
