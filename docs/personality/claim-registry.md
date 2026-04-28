# Personality Dimension — Claim Registry

Every claim the UI makes about personality must be registered here with its evidence label, source, and approval status. **Do not ship a new UI claim without adding it here and obtaining research approval.**

---

## Format

Each claim entry contains:

- **Claim ID** — unique identifier (e.g. `CLM-001`)
- **UI copy** — exact string shown to users (Hebrew and English)
- **Evidence label** — short label displayed next to the claim in UI
- **Underlying evidence** — study, dataset, or internal analysis supporting the claim
- **Confidence level** — `high` / `medium` / `low`
- **Approved by** — `@org/psychometric-research` sign-off
- **Added** — date added
- **Status** — `active` / `deprecated` / `under-review`

---

## Registry

| Claim ID | UI copy (English) | Evidence label | Underlying evidence | Confidence | Approved by | Added | Status |
|---|---|---|---|---|---|---|---|
| CLM-001 | *(placeholder — add first real claim here)* | *(label)* | *(study/dataset reference)* | medium | pending | — | under-review |

---

## Adding a new claim

1. Raise a [Personality Feature issue](.github/ISSUE_TEMPLATE/personality-feature.yml) or include the claim in your PR description.
2. Provide the exact UI copy (English and Hebrew), the evidence label, and the supporting evidence.
3. Obtain sign-off from `@org/psychometric-research`.
4. Add the claim row to this table and reference it in `docs/personality/release-gates.md`.

---

## Deprecated claims

Claims removed from the UI should be moved here with a deprecation date and reason.

| Claim ID | UI copy | Reason deprecated | Deprecated |
|---|---|---|---|
| — | — | — | — |
