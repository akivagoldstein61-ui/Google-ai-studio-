# Personality Dimension – Release Gates

> **Status:** Governance scaffold. No personality feature ships without passing all gates below.

---

## Overview

The Kesher Personality Dimension is trust-forward, privacy-preserving, Hebrew-first, and scientifically humble. Features must pass each gate category before merging into `main` and before any production deployment.

Gates are enforced by:

1. CI workflows (`.github/workflows/personality-ci.yml`, `redteam-personality.yml`, `schema-validation.yml`, `rtl-snapshots.yml`)
2. CODEOWNERS review requirements (`.github/CODEOWNERS`)
3. PR template self-certification (`.github/pull_request_template.md`)
4. Local validation scripts (`scripts/`)

---

## Gate Categories

### Gate 1 – Privacy & Consent

**Owner:** @privacy-reviewers

| Requirement | CI Script | Status |
|-------------|-----------|--------|
| Personality data private by default | `scan-forbidden-fields.mjs` | 🔴 required |
| User owns, can inspect, reset, delete, and export personality data | Manual review | 🔴 required |
| Permissioned summaries only — no raw dossier sharing | `scan-forbidden-fields.mjs` | 🔴 required |
| No coercive mutual unlock | Manual review | 🔴 required |
| Privacy/deletion/export controls are never paywalled | Manual review | 🔴 required |
| Consent gate present before first personality data collection | Manual review | 🔴 required |

### Gate 2 – Forbidden Patterns

**Owner:** @privacy-reviewers @safety-reviewers

These must never appear in any personality-related code, schema, prompt, or output:

- No compatibility score
- No soulmate score
- No marriage probability
- No desirability score
- No public trait rank
- No raw trait public exposure
- No hidden personality ranking leakage
- No diagnosis or clinical inference
- No protected-trait inference from proxies (photos, writing style, names, location, observance, ethnicity, religion, politics, sexuality)
- No AI auto-send
- No AI impersonation
- No public attractiveness scoring
- No hidden throttling or ranking manipulation
- No raw inferred personality dossier sharing

See `docs/personality/forbidden-patterns.md` for full definitions and code-level patterns.

CI: `scan-forbidden-fields.mjs` scans source for known forbidden field names and patterns.

### Gate 3 – Psychometric / Scientific Integrity

**Owner:** @psychometric-reviewers

| Requirement | CI Script | Status |
|-------------|-----------|--------|
| No LLM-generated personality scores | `test-personality-scoring.mjs` | 🔴 required |
| Scoring code is deterministic, versioned, testable | `test-personality-scoring.mjs` | 🔴 required |
| Scoring is separated from model-generated interpretation | Manual review | 🔴 required |
| No proprietary assessment item text committed | Manual review | 🔴 required |
| All user-facing claims carry evidence label (VERIFIED / INFERRED / HEURISTIC / UNKNOWN) | Manual review | 🔴 required |
| Instrument license reviewed before activation | Manual review | 🔴 required |
| Hebrew localization and cultural adaptation reviewed | Manual review | 🟡 deferred to instrument activation |

### Gate 4 – AI Safety & Prompt Integrity

**Owner:** @safety-reviewers

| Requirement | CI Script | Status |
|-------------|-----------|--------|
| Output schema enforced for all personality AI responses | `test-personality-schemas.mjs` | 🔴 required |
| Prompt version bumped on any prompt change | Manual review | 🔴 required |
| Red-team scenarios pass | `redteam-personality.mjs` | 🔴 required |
| No deterministic scoring delegated to LLM | `test-personality-scoring.mjs` | 🔴 required |
| Uncertainty language present in AI interpretations | Manual review + `redteam-personality.mjs` | 🔴 required |
| Log hygiene — no raw personality scores or inferred traits in logs | `scan-logs.mjs` | 🔴 required |

### Gate 5 – Hebrew / RTL

**Owner:** @l10n-reviewers @engineering-reviewers

| Requirement | CI Script | Status |
|-------------|-----------|--------|
| All new user-facing strings have Hebrew translations | `test-rtl.mjs` | 🔴 required |
| RTL layout does not break in Hebrew locale | `test-rtl.mjs` | 🔴 required |
| `dir="rtl"` applied correctly to personality UI components | `test-rtl.mjs` | 🔴 required |

### Gate 6 – Engineering

**Owner:** @engineering-reviewers

| Requirement | CI Script | Status |
|-------------|-----------|--------|
| TypeScript typechecks pass (`tsc --noEmit`) | `personality-ci.yml` | 🔴 required |
| Smoke tests pass | `personality-smoke-tests.mjs` | 🔴 required |
| Schema tests pass | `test-personality-schemas.mjs` | 🔴 required |
| No new third-party dependencies unless approved | Manual review | 🔴 required |
| Rollback plan documented in PR | PR template | 🔴 required |

---

## Deployment / Release Approval

In addition to CI gates, personality features require:

1. Written sign-off comment from @privacy-reviewers on the PR.
2. Written sign-off comment from @safety-reviewers on the PR.
3. Written sign-off or explicit deferral from @psychometric-reviewers if any scoring or measurement change is included.
4. Written sign-off from @l10n-reviewers confirming Hebrew translations are complete or explicitly deferred with a tracked issue.

**No merge without all required sign-offs.** CODEOWNERS enforces review requests; humans enforce approval.

---

## Gate Failure Handling

If a CI gate fails:

1. The PR author is responsible for resolving the failure.
2. Gate bypass requires a written exception approved by all required reviewers and recorded in the PR.
3. Exception comments must explain: what gate failed, why bypass is safe, what compensating control exists, and when the gate will be restored.

---

## Version History

| Date | Author | Change |
|------|--------|--------|
| 2026-04-28 | Governance scaffold | Initial draft |
