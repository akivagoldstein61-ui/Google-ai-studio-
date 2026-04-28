## Checklist

<!-- Complete ALL sections. PRs touching personality/* paths require additional reviewer sign-off. -->

### Type of Change

- [ ] Governance / CI / Tooling (no production code change)
- [ ] Personality Dimension – new feature
- [ ] Personality Dimension – behavior change
- [ ] Personality Dimension – bug fix
- [ ] Privacy or safety fix
- [ ] Schema change
- [ ] Prompt / PromptOps change
- [ ] Documentation
- [ ] Other: _______________

---

### Summary

<!-- 1–3 sentences describing what this PR does and why. -->

---

### Personality Dimension – Safety Contract

_Skip this section only if this PR touches zero personality-related code, schemas, prompts, or data flows._

#### Forbidden Patterns (all must remain false)

| Rule | Status |
|------|--------|
| No compatibility score | ☐ confirmed |
| No soulmate score | ☐ confirmed |
| No marriage probability | ☐ confirmed |
| No desirability score | ☐ confirmed |
| No public trait rank | ☐ confirmed |
| No raw trait public exposure | ☐ confirmed |
| No hidden personality ranking leakage | ☐ confirmed |
| No diagnosis or clinical inference | ☐ confirmed |
| No protected-trait inference from proxies | ☐ confirmed |
| No AI auto-send | ☐ confirmed |
| No AI impersonation | ☐ confirmed |
| No public attractiveness scoring | ☐ confirmed |
| No hidden throttling or ranking manipulation | ☐ confirmed |
| No raw inferred personality dossier sharing | ☐ confirmed |
| No coercive mutual unlock | ☐ confirmed |
| No paywalled privacy/consent/safety controls | ☐ confirmed |

See `docs/personality/forbidden-patterns.md` for full definitions.

---

### Privacy Impact

- [ ] This PR does NOT change how personality data is collected, inferred, stored, or exposed.
- [ ] This PR DOES change personality data handling. Describe below:

<!-- If applicable: what data, what change, what consent gate, what deletion path? -->

---

### Psychometric / Measurement Notes

- [ ] No measurement instrument or scoring algorithm is introduced or changed.
- [ ] A measurement change IS introduced. See linked issue and psychometric review sign-off below.

**Instrument / method (if applicable):**
<!-- Name, version, license status, Hebrew localization status -->

**Claim evidence label (if applicable):**
- [ ] VERIFIED
- [ ] INFERRED
- [ ] HEURISTIC
- [ ] UNKNOWN

---

### Hebrew / RTL

- [ ] No new user-facing strings introduced.
- [ ] New strings have Hebrew translations (or a tracking issue is linked).
- [ ] RTL layout tested locally or tracked in a linked issue.

---

### Schema / Prompt Changes

- [ ] No schema changes.
- [ ] Schema changed. `npm run test:schemas` passes locally.
- [ ] No prompt changes.
- [ ] Prompt changed. Prompt version bumped. `npm run redteam:personality` passes locally.

---

### CI Gates

- [ ] `npm run scan:forbidden-fields` — passes
- [ ] `npm run scan:logs` — passes
- [ ] `npm run test:schemas` — passes
- [ ] `npm run test:scoring` — passes (or N/A – no scoring code)
- [ ] `npm run test:rtl` — passes
- [ ] `npm run redteam:personality` — passes (or N/A – no prompt changes)

---

### Required Reviewers

PRs touching `src/ai/**`, `src/features/personality/**`, `docs/personality/**`, or `scripts/*personality*` must receive sign-off from:

- [ ] **@privacy-reviewers** – privacy impact, consent, data handling
- [ ] **@psychometric-reviewers** – if scoring or measurement changes (may be async/deferred)
- [ ] **@safety-reviewers** – AI output safety
- [ ] **@l10n-reviewers** – if new Hebrew strings

CODEOWNERS will automatically request the appropriate reviewers. Do not merge without required approvals.

---

### Testing

<!-- Describe what you tested and how. -->

---

### Rollback Plan

<!-- How can this change be reverted if it causes issues? -->

---

### Linked Issues

<!-- Closes # -->
