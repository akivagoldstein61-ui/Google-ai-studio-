# Privacy, Consent, Visibility, and Sharing

## Source Dossiers

- `Israeli Privacy Readiness Dossier for Kesher.pdf`
- `Kesher dossier on Israeli privacy law for personality, inference, and AI matching.pdf`
- `Kesher Consent UX Research Report.pdf`
- `Kesher Personality Visibility Dossier.pdf`
- `Kesher permissioned personality sharing and private recommendation dossier.pdf`

## Legal and Trust Posture

- `VERIFIED`: Israeli privacy law treats personality-assessment outputs as highly sensitive personal information when the system is designed to evaluate significant personality characteristics.
- `INFERRED`: Inferred taste and compatibility layers should be treated with similar operational caution unless counsel narrows scope.
- `VERIFIED`: Consent should not be bundled into one broad approval. Sensitive actions need separate, visible, reversible choices.
- `INFERRED`: Permissioned sharing is safer than public personality profiles when the user can preview, scope, revoke, and understand limits.

## Visibility Layers

- Public browse: self-declared profile fields, intent, observance, interests, lifestyle tags, and prompts.
- Private owner: assessment answers, derived scores/bands, generated reflection cards, private taste, and controls.
- Mutual consent: owner-approved share cards and pair reflection after required parties opt in.
- System only: raw answers, audit logs, hidden recommender state, safety records, model traces, and legal retention records.

## Consent UX Rules

- Default sensitive toggles to off.
- Use layered notices, plain language, and just-in-time prompts.
- Name the audience: only me, specific match, both of us, or system only.
- Put revoke, reset, export, and delete controls on the same path where the feature is configured.
- Explain revocation accurately: it blocks future in-app access, but cannot erase screenshots or memory.

## Implementation Checks

- Do not expose raw answers or exact numeric trait values outside owner-only controls.
- Do not put personality or taste data in analytics payloads, logs, public APIs, or static exports.
- Do not paywall privacy, safety, reset, export, delete, or revoke controls.
- Require server-side authorization for share-card reads.
