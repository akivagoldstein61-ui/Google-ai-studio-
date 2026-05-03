# ADR 0003: Mutual Consent for Compatibility Reflection

## Status

Accepted

## Context

Compatibility reflection involves two people. Even when the output is gentle and non-scored, it can reveal sensitive preferences or create social pressure if only one person consented.

## Decision

Compatibility reflection requires mutual consent and both users opting in. It may use only mutually shared inputs and must produce reflection and conversation support, not a verdict.

Required output:

- Shared strengths.
- Possible friction.
- A question to explore.
- A micro-habit or communication suggestion.
- A gentle boundary.

Forbidden output:

- Score, percentage, soulmate, destiny, perfect-match, doomed, incompatible, hidden data, private taste data, or public ranking.

## Consequences

- Route handlers must enforce consent server-side before generating or returning compatibility reflection.
- UI must clearly show opt-in status and revoke paths.
- Tests must cover single-sided consent, expired/revoked grants, and prohibited output language.
