# Personality Dimension — Forbidden Patterns

This document defines field names, language patterns, and code patterns that must never appear in member-facing code, schemas, AI prompts, or UI copy.

CI will fail if any of these patterns are detected. See `.github/workflows/personality-ci.yml` and `.github/workflows/redteam-personality.yml`.

---

## Forbidden field names

These field names must not appear in any member-facing API response, schema, or client-side code.

| Field name | Reason forbidden |
|---|---|
| `compatibility_score` | Implies deterministic romantic compatibility — overclaims what personality data can predict |
| `soulmate_score` | Same as above; additionally uses harmful romantic absolutism language |
| `marriage_probability` | Highly overclaiming; implies predictive validity not supported by evidence |
| `desirability_score` | Hidden ranking of people; dehumanising and privacy-violating |
| `public_trait_rank` | Exposes relative ranking of users to others; violates user expectation |
| `raw_trait_public` | Exposes raw psychometric scores not intended for user-facing display |
| `hidden_personality_rank` | Same as `public_trait_rank`; hidden ranking leakage |
| `diagnosis` | Implies clinical or medical assessment; not appropriate for a social platform |
| `protected_trait_inference` | Inferring protected characteristics (religion, health, etc.) from personality data |
| `auto_send` | AI-triggered automatic message sending without explicit user action |
| `perfect_match` | Absolutist compatibility claim not supported by evidence |

---

## Forbidden language patterns (AI prompts and UI copy)

These patterns must not appear in AI prompt templates, AI output, or UI strings.

| Pattern | Reason forbidden |
|---|---|
| "soulmate" | Absolutist romantic claim |
| "perfect match" | Absolutist compatibility claim |
| "marriage probability" / "marriage score" | Overclaiming predictive validity |
| "diagnosis" / "diagnose" | Clinical language inappropriate for social platform |
| "disorder" (in personality context) | Clinical language |
| "mental health label" | Clinical language |
| "compatibility score" (as a number) | Overclaiming |
| "desirability" (as a ranking) | Hidden ranking / dehumanising |
| Any inferred protected attribute (e.g. inferred religion, inferred health status) | Protected-trait inference |

---

## Forbidden code patterns

| Pattern | Reason forbidden |
|---|---|
| Auto-sending a message without a discrete user action | Removes user agency; autosend path |
| Returning raw assessment item responses to the client | Raw score exposure |
| Logging trait scores or assessment responses | Privacy / data minimisation |
| Exposing relative rank of user among other users | Hidden ranking leakage |
| Calling AI inference on protected attributes | Protected-trait inference |
| Displaying AI output without a deterministic schema constraint | Unconstrained AI output |
| Skipping consent gate for new data uses | Missing consent gate |
| No revoke/delete path for a new data class | Missing data lifecycle |

---

## How to add a new forbidden pattern

1. Raise a [Privacy Risk issue](.github/ISSUE_TEMPLATE/privacy-risk.yml) or [Red-Team Finding issue](.github/ISSUE_TEMPLATE/ai-redteam-finding.yml).
2. Get Privacy/Legal and Safety approval.
3. Add the pattern to this document.
4. Update the grep pattern in `.github/workflows/personality-ci.yml` (`scan-forbidden-fields` job) and `.github/workflows/redteam-personality.yml` (`forbidden-language-scan` job).
5. Update `npm run scan:forbidden-fields` script to cover the new pattern.
