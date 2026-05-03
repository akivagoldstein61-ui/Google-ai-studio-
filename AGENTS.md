# Kesher Agent Operating Canon

This repository is the implementation surface for Kesher, a serious Hebrew-first dating app. Personality and AI features must support self-understanding, values-first discovery, private taste learning, transparent explanations, permissioned sharing, mutual-consent reflection, and respectful messaging help.

## Non-Negotiable Product Boundaries

Allowed:

- Self-reflection, communication tendencies, strengths, watch-outs, and micro-habits.
- Owner-visible private taste learning that is editable, resettable, and explainable.
- Values-first discovery using visible profile fields.
- Transparent "Why This Match" explanations using only visible signals.
- Share cards only after user preview, scope selection, recipient selection, expiry, and revoke path.
- Compatibility reflection only after mutual consent and both users opt in.
- Messaging assistance that is draft-only or rewrite-only.

Forbidden:

- Compatibility scores, match percentages, soulmate, destiny, perfect-match, doomed, or incompatible verdicts.
- Attractiveness scores, desirability tiers, hidden ranking explanations, or public ranking.
- Protected-trait inference or sensitive identity inference.
- Raw BFAS/aspect score sharing, raw personality dossiers, hidden weights, private taste leakage, or private message leakage.
- AI impersonation, auto-send, invented facts, or escalation beyond user intent.
- Personality-based gating without explicit consent and validation.

## Approval Boundaries

Stop before changing auth, roles, Firebase rules, database schema, migrations, production config, secrets, billing, deploy settings, external tools, dependency versions, share/revoke persistence, or any personality-based ranking/gating.

Do not push, create PRs, merge, deploy, publish, or run destructive git/filesystem commands without explicit approval.

## Validation Expectations

Run the narrowest useful check after meaningful changes:

1. Targeted tests.
2. Typecheck.
3. Lint.
4. Build.
5. Route/API smoke check.
6. Browser/app flow check.

Report exactly what ran, what passed, and what could not run.
