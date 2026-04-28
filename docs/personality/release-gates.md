# Personality Dimension — Release Gates

This document defines the mandatory checks that must pass before any personality feature is shipped to production.

---

## Automated gates (CI — must be green)

| Check | Command | Blocks merge? |
|---|---|---|
| Lint | `npm run lint` | ✅ Yes |
| Type-check | `npm run typecheck` | ✅ Yes |
| Unit tests | `npm run test` | ✅ Yes |
| Schema validation | `npm run test:schemas` | ✅ Yes |
| Scoring tests | `npm run test:scoring` | ✅ Yes |
| Forbidden field scan | `npm run scan:forbidden-fields` | ✅ Yes |
| Log scan | `npm run scan:logs` | ✅ Yes |
| Red-team suite | `npm run redteam:personality` | ✅ Yes |
| RTL snapshot tests | `npm run test:rtl` | ✅ Yes (when Hebrew copy or RTL layout changed) |

---

## Human approval gates (CODEOWNERS — required before merge)

| Scope of change | Required approver |
|---|---|
| AI prompts, inference schemas | `@org/ai-platform` |
| Assessment copy, scoring logic, interpretation text | `@org/psychometric-research` |
| Consent flows, data sharing, retention, deletion, export | `@org/privacy-legal` |
| Hebrew copy, RTL layout | `@org/localization` |
| Recommender logic, Why This Match | `@org/ml-product` |
| AI messaging, moderation-adjacent features | `@org/trust-safety` |
| All unowned files | `@org/engineering-leads` |

> **Note:** CODEOWNERS approval is enforced via GitHub branch protection "Require review from Code Owners". Each team above must approve changes in their area before the PR can merge.

---

## Branch protection settings (configure in GitHub → Settings → Branches)

Apply to `main` (and any release branches):

- [x] Require a pull request before merging
- [x] Require approvals — minimum **2**
- [x] Dismiss stale pull request approvals when new commits are pushed
- [x] Require review from Code Owners
- [x] Require status checks to pass before merging
  - `Lint`
  - `Type-check`
  - `Unit tests`
  - `Schema validation tests`
  - `Scoring tests`
  - `Forbidden field scan`
  - `Log scan (no sensitive fields in logs)`
  - `Personality red-team checks`
  - `AI output forbidden language scan`
  - `Validate personality schemas`
- [x] Require branches to be up to date before merging
- [x] Require linear history
- [x] Do not allow bypassing the above settings

---

## Pre-release checklist

Before deploying to production, the release manager must confirm:

- [ ] All CI gates pass on the release commit
- [ ] All required CODEOWNERS approvals are on record
- [ ] Privacy / Legal sign-off documented (link to approval issue or comment)
- [ ] Psychometric / Research sign-off documented (if assessment/scoring changed)
- [ ] Localization sign-off documented (if Hebrew copy or RTL changed)
- [ ] Safety sign-off documented (if AI messaging or moderation features changed)
- [ ] Claim registry updated (`docs/personality/claim-registry.md`)
- [ ] Data classification updated (`docs/personality/data-classification.md`) if new data fields introduced
- [ ] Incident response runbook updated if new failure mode introduced
- [ ] Rollback plan documented
