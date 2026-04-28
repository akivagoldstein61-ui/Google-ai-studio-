# Personality Dimension – Data Classification

> **Status:** Normative. All personality-related data fields must be classified before use in production.

---

## Classification Levels

### P0 – Critical

**Definition:** Data that, if exposed, would cause direct harm to the user or violate core privacy contracts.

**Examples:**
- Inferred raw personality trait scores (e.g., `{ openness: 72, conscientiousness: 58, ... }`)
- Full inferred personality dossier
- Behavioral signals used to derive personality scores (raw interaction logs)
- Assessment item responses

**Controls required:**
- Private by default. Never exposed to other users without explicit user-initiated permissioned summary.
- Encrypted at rest and in transit.
- Accessible only to the data subject and authorized internal systems.
- Audit log on every access.
- Deletable and resettable on demand, with confirmation.
- Exportable on demand in a structured format.
- Retention period must be defined, disclosed, and enforced.
- No third-party sharing without explicit, revocable consent.

---

### P1 – Sensitive

**Definition:** User-authored or user-consented data directly related to personality that is less critical than raw inferred scores but still deserves strong protection.

**Examples:**
- User-authored personality reflection text
- Completed assessment responses (before scoring)
- User-selected personality sharing preferences
- User-authored "about me" text that feeds into personality signals

**Controls required:**
- Private by default.
- Visible to the user in their profile/settings.
- Deletable and resettable on demand.
- Exportable on demand.
- Shareable only with explicit user consent on a per-recipient basis.
- Not used as a hidden ranking signal without disclosure.

---

### P2 – Internal

**Definition:** Aggregated, anonymized, or de-identified signals derived from personality data for research, analytics, or system improvement purposes.

**Examples:**
- Anonymized aggregate trait distribution statistics
- Model performance metrics derived from anonymized data
- Feature engagement rates (e.g., % of users who completed assessment)

**Controls required:**
- Must be genuinely de-identified (k-anonymity ≥ 5 at minimum; higher for sensitive dimensions).
- Must not be re-linkable to individual users.
- Not exposed to end users in raw form.
- Governed by internal data policy.

---

### P3 – Non-Sensitive

**Definition:** Personality-adjacent preferences or settings that do not reveal trait information.

**Examples:**
- Whether a user has enabled personality features (boolean toggle, not the data itself)
- UI display preferences for personality cards
- Opt-in/opt-out status for personality-based discovery (binary, no trait detail)

**Controls required:**
- Standard access controls.
- Deletable with account deletion.

---

## Field Classification Table

_Fields will be added as personality features are developed. No personality fields are active in production yet._

| Field Name | Classification | Description | Retention | Exposed To |
|------------|---------------|-------------|-----------|-----------|
| _(none yet)_ | | | | |

---

## Classification Change Process

1. Propose a new field or reclassification via a Personality Feature Issue.
2. Tag @privacy-reviewers for classification review.
3. Add the approved classification to the table above in the PR.
4. Update any schema or policy files that reference the field.

---

## Version History

| Date | Author | Change |
|------|--------|--------|
| 2026-04-28 | Governance scaffold | Initial draft |
