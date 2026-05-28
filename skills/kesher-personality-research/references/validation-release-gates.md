# Validation and Release Gates

## Source Dossiers

- `Kesher Personality Validation Roadmap.pdf`
- `Kesher Personality Dimension Verification Report.pdf`
- `Kesher Personality Kernel Release Dossier.pdf`
- `Kesher Personality and AI Repo Audit Dossier.pdf`

## Release Verdict

- `BLOCKED`: Do not launch a production personality system until commercial instrument rights, Hebrew/English validation, privacy counsel review, and sensitive-runtime governance are closed.
- `IMPLEMENTABLE NOW`: Consent surfaces, deletion/export/reset controls, static skills, trust copy, release-gate docs, validators, demo-only prototypes, and non-sensitive scaffolding.
- `IMPLEMENTABLE WITH PREREQUISITES`: Assessment scoring, profile interpretation, permissioned sharing, and pair reflection after the required rights, validation, and privacy gates are documented.

## Psychometric Gates

- Confirm instrument rights and permitted commercial use.
- Confirm item provenance before committing item text.
- Test Hebrew and English comprehension.
- Validate translation/adaptation, not just literal translation.
- Check internal consistency, response quality, test-retest stability, and measurement invariance before cross-language comparison.
- Separate measurement validity from dating-outcome claims.

## Product Gates

- Personality is opt-in and private by default.
- User can inspect, reset, delete, and export data.
- Raw answers and raw scores never leave owner/system boundaries.
- Pair reflection requires mutual consent.
- No hidden personality-driven ordering launches without explicit review.
- Claims carry evidence labels.

## CI and Review Gates

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run scan:forbidden-fields`
- `npm run scan:logs`
- `npm run test:schemas`
- `npm run test:scoring`
- `npm run test:rtl`
- `npm run redteam:personality` when prompts or output copy change
- Browser verification for visible prototype changes
