# BFAS Assessment Contract

## MVP Position

Use BFAS/Big Five Aspects as self-reflection and communication scaffolding. Do not use it as an onboarding gate, hidden ranking oracle, or predictor of romantic destiny.

## Data Rules

- Raw answers: owner-only, server-side/private storage, never shared in explanations.
- Derived domain/aspect values: owner-visible by default, shareable only through explicit permissioned summary flows.
- Algorithm version: persist with the assessment session.
- Normative language: call values "percentiles" only when backed by a real norm table.

## Implementation Notes

- Keep item IDs stable.
- Keep reverse-key metadata explicit.
- Keep scoring deterministic and unit-testable.
- Separate domain and aspect aggregation.
- Prefer a migration path before changing item count or response scale.
