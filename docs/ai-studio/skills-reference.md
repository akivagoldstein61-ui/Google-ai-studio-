# Kesher Skills Reference

This document is a concise reference for all 10 Kesher skills. It can be pasted as a **context document** in Google AI Studio alongside the system prompt, or used as a quick-reference card during development.

---

## Skill 1 — Personality Assessment (`kesher-personality-assessment`)

**Canonical Codex skill:** `kesher-bfas-assessment`

**Purpose:** Administer and score a public-domain Big Five personality instrument (BFAS or IPIP-NEO) in a trust-forward, consent-gated, progressive flow.

**Key Decisions:**

| Decision | Rule |
|---|---|
| Instrument | BFAS (100 items) or IPIP-NEO — public domain only |
| Scoring | Deterministic (mean of aspect items; reverse: 6 - raw) |
| LLM role | Language generation only — never scoring |
| Placement | Settings/Insights — never first-run onboarding |
| Quality gate | Run 5 checks before scoring; flag → "reflection unavailable" |
| Language | Probabilistic ("tends to", "may") — never deterministic |

**Go/No-Go:** Omega ≥ .80 per domain before reflection cards go live.

---

## Skill 2 — Consent UX (`kesher-consent-ux`)

**Canonical Codex skill:** `kesher-consent-ux`

**Purpose:** Design all consent interactions to meet Israeli Section 11 requirements and EU dark-pattern-free standards.

**Section 11 Checklist (every consent screen):**
- Voluntariness statement
- Purpose statement
- Controller identity
- Recipients list
- Refusal consequence
- Rights disclosure
- AI disclosure (if applicable)

**Trust Hub (required settings screen):** Assessment status + reset, active shares + revoke, AI usage toggle (default OFF), data export/delete, consent history log.

**Anti-dark-pattern rules:** All toggles default OFF. Revocation ≤ granting effort. No bundled consent. No confirm-shaming.

---

## Skill 3 — Permissioned Sharing (`kesher-permissioned-sharing`)

**Canonical Codex skill:** `kesher-permissioned-sharing`

**Purpose:** Allow users to voluntarily share personality cards with specific matches under explicit, previewed, revocable consent.

**Card Types:** Basic (domain-level) → Deeper (domain + aspect) → Mutual Reflection (bilateral).

**Flow:** Generate → Preview → Select recipient → Confirm → Recipient notified → Revocable anytime.

**Never include in cards:** Raw item responses, numeric scores, percentiles, population comparisons, attachment labels, clinical terms, private taste data.

---

## Skill 4 — AI Runtime Governance (`kesher-ai-runtime-governance`)

**Canonical Codex skill:** `kesher-ai-governance`

**Purpose:** Route AI calls to the correct provider and enforce zero-data-retention (ZDR) for sensitive personality data.

**Routing Matrix:**

| Feature | Provider | Reason |
|---|---|---|
| Personality reflection | Vertex AI | ZDR required |
| Compatibility reflection | Vertex AI | ZDR required |
| Share card generation | Vertex AI | ZDR required |
| Date planning | Firebase AI Logic | Non-sensitive |
| Why This Match (public) | Firebase AI Logic | Non-sensitive |
| Conversation starters | Firebase AI Logic | Non-sensitive |

**Critical:** Never use free-tier Gemini API for personality data. All personality feature flags default OFF.

---

## Skill 5 — Privacy-Preserving Recommendation (`kesher-privacy-recommendation`)

**Canonical Codex skill:** `kesher-private-recommendations`

**Purpose:** Deliver personalized recommendations without leaking personality data to other users or using it without consent.

**Three Layers:**

| Layer | Signals | Personality |
|---|---|---|
| 1 — Silent | Explicit profile signals | Never |
| 2 — Safe explanation | Whitelisted public signals | Never |
| 3 — Permissioned | Consented personality | Only after validation |

**Layer 3 is blocked** until all 7 psychometric validation phases pass.

---

## Skill 6 — Why This Match (`kesher-why-this-match`)

**Canonical Codex skill:** `kesher-personality-why-match`

**Purpose:** Generate honest, provenance-labeled match explanations using only whitelisted, user-visible signals.

**Allowed signals:** Shared values, relationship intent, observance/lifestyle (both displayed), location proximity (coarse), shared interests, age alignment, personality card (if shared).

**Source chips (required):** "From your profile" / "From their profile" / "Shared with you" / "You both listed".

**Max 3 items.** Generic fallback if no overlap. No compatibility scores, no "AI thinks", no destiny language.

---

## Skill 7 — Israeli Privacy Compliance (`kesher-israeli-privacy`)

**Canonical Codex skill:** `kesher-israeli-privacy`

**Purpose:** Ensure all personality and sensitive data handling complies with Israel's Privacy Protection Law (Amendment 13) and PPA guidance.

**Special-sensitivity data:** Personality scores, observance, orientation, relationship intent, compatibility reflections, precise location.

**User rights:** Section 13 (access/export), Section 14 (correction/deletion). Provide Export and Delete buttons in Trust Hub.

**DPO:** Appoint before 100K opted-in personality users.

**Transfer abroad:** Execute DPA with Vertex AI / Google Cloud before any personality data leaves Israel.

---

## Skill 8 — Psychometric Validation (`kesher-psychometric-validation`)

**Canonical Codex skill:** `kesher-psychometric-validation`

**Purpose:** Ensure the personality instrument is reliable, valid, and fair before using scores in any product feature.

**7-Phase Pipeline:**

| Phase | Requirement | Gate |
|---|---|---|
| 1. Adaptation lab | Cognitive interviews, translation | All items pass |
| 2. Alpha study | Omega ≥ .80 domains, ≥ .70 facets | ESEM structure confirmed |
| 3. Test-retest | Domain retest ≥ .75, drift < .20 SD | Stable |
| 4. Response quality | <10% flagged sessions | Acceptable |
| 5. Invariance | ΔCFI < .01, ΔRMSEA < .015 | Cross-group valid |
| 6. Incremental validity | Personality adds value over explicit baseline | Replicated |
| 7. Harm testing | No harm measure > control by 0.3 SD | Safe |

**Personality in ranking is BLOCKED until all 7 phases pass.**

---

## Skill 9 — Compatibility Reflection (`kesher-compatibility-reflection`)

**Canonical Codex skill:** `kesher-compatibility-reflection`

**Purpose:** Help two mutually consenting users reflect on their personality overlap through conversation-starting lenses — not predictions.

**Prerequisites:** Both users have shared a basic card with each other AND both explicitly consented to mutual reflection.

**Lenses (max 3):** Values Alignment, Communication, Friction Forecast, Growth Edge.

**Prohibited:** Compatibility scores, soulmate/destiny language, prediction of success/failure, one-sided advice.

**Revocation:** Either user revoking their card or consent → reflection disappears for both.

---

## Skill 10 — Dark Pattern Audit (`kesher-dark-pattern-audit`)

**Canonical Codex skill:** `kesher-dark-pattern-audit`

**Purpose:** Audit all consent and personality UX against the EU six-category dark pattern taxonomy and comprehension standards.

**Six Prohibited Categories:** Overloading, Skipping, Stirring, Obstructing, Fickle, Left in the Dark.

**Comprehension standard:** ≥80% of users correctly answer all 5 standard questions about any consent action.

**Regret standard (24-hour follow-up):** ≥90% recall, ≥85% would repeat, <15% surprised, mean pressure ≤2.0/5.0.

**Premium rules:** Core matching never degraded. Reflection available to all. No premium-gated compatibility scores (scores are prohibited entirely).

---

## Quick Reference: What Is Always Forbidden

| Request | Reason | Skill |
|---|---|---|
| Compatibility score or % | Reflective, not predictive | 9 |
| Personality in ranking without validation | 7 phases not complete | 8 |
| Private taste shown to another user | Owner-only | 5 |
| Pre-checked consent toggle | All toggles default OFF | 2 |
| Free-tier Gemini for personality data | ZDR required | 4 |
| Infer personality from photos or behavior | Explicit opt-in only | 1 |
| Raw scores in AI prompts | Use enum bands instead | 4 |
| Cross-user score comparison without invariance | Phase 5 not complete | 8 |
| "Soulmate", "perfect match", "destiny" | Prohibited language | 6, 9 |
| Personality-based push notification segmentation | Israeli privacy law | 7 |
