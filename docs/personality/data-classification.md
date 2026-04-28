# Personality Dimension — Data Classification

This document classifies every data field used by the Kesher Personality Dimension according to sensitivity, visibility, retention, and consent requirements.

---

## Classification tiers

| Tier | Label | Description |
|---|---|---|
| T1 | **Highly Sensitive** | Raw psychometric scores, assessment item responses. Must never be exposed to members or third parties. |
| T2 | **Sensitive** | Derived trait labels, compatibility indicators, messaging behavior patterns. Visible only to the owning user under explicit consent. |
| T3 | **Internal** | Aggregated, anonymised analytics. No individual linkage. No consent required for use. |
| T4 | **Public** | Only data the user has explicitly chosen to make visible to other users. |

---

## Field inventory

| Field name | Tier | Visible to owner? | Visible to matches? | Logged? | Exported? | Retention | Consent required? | Notes |
|---|---|---|---|---|---|---|---|---|
| `trait_scores` | T1 | No (derived summary only) | No | No | Yes (owner only) | Until revoked | Yes — explicit | Raw scores never exposed |
| `trait_labels` | T2 | Yes | Configurable by user | No | Yes (owner only) | Until revoked | Yes — explicit | Summary labels only |
| `compatibility_indicators` | T2 | Yes (as qualitative labels) | No | No | Yes (owner only) | Until revoked | Yes — explicit | No numeric score exposed |
| `assessment_responses` | T1 | No | No | No | Yes (owner only) | Until revoked | Yes — explicit | Item-level responses are T1 |
| `messaging_behavior` | T2 | No | No | No | Yes (owner only) | 90 days rolling | Yes — explicit | Aggregate patterns only |
| `session_metadata` | T3 | No | No | No | No | 30 days | No | Anonymised |
| `consent_records` | T2 | Yes | No | Yes (audit log) | Yes (owner only) | 7 years | N/A — this IS the consent | Required for regulatory compliance |
| `export_payload` | T2 | Yes | No | No | N/A — this IS the export | Generated on demand | Yes — triggered by user action | Must include all T2 fields |

---

## Forbidden fields

The following fields must **never** be created or stored. See `docs/personality/forbidden-patterns.md`.

- `compatibility_score`
- `soulmate_score`
- `marriage_probability`
- `desirability_score`
- `public_trait_rank`
- `raw_trait_public`
- `hidden_personality_rank`
- `diagnosis`
- `protected_trait_inference`

---

## Data lifecycle

### Consent
- All T1 and T2 fields require an explicit, informed consent gate before collection or use.
- Consent must be versioned. Any material change to data use requires fresh consent.

### Revoke
- Users can revoke consent at any time from their profile settings.
- Revocation stops all future processing and triggers deletion of T1 and T2 fields within 30 days.

### Reset
- Users can reset their personality profile, which deletes all T1 and T2 fields and restores them to the pre-assessment state.
- Re-assessment requires fresh consent.

### Delete
- Account deletion triggers deletion of all T1 and T2 fields within 30 days.
- `consent_records` are retained for the regulatory retention period (7 years) after deletion.

### Export
- Users can request a full data export at any time.
- The export payload includes all T1 and T2 fields in a machine-readable format (JSON).
- Export requests must be fulfilled within 30 days.

---

## Adding a new field

1. Raise a [Personality Feature issue](.github/ISSUE_TEMPLATE/personality-feature.yml).
2. Determine the classification tier.
3. Add the field to the inventory table above.
4. Obtain Privacy / Legal approval.
5. Implement the field with appropriate consent gate, revoke, delete, and export paths.
