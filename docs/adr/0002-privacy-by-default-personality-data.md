# ADR 0002: Privacy by Default for Personality Data

## Status

Accepted

## Context

Personality and taste signals can be intimate. Users need clear boundaries between what is public, what is private, what AI uses internally, and what can be shared by permission.

## Decision

Private taste profiles, hidden weights, raw personality scores, private messages, hidden dealbreakers, and inferred traits are private by default. They must not appear in public profiles, public previews, "Why This Match" explanations, share cards, or compatibility reflection unless a feature has explicit, scoped, user-reviewed sharing rules.

Public personality-adjacent fields may include self-declared values, intent, observance or lifestyle fields the user chose to show, interests, prompts, and values-in-practice summaries.

## Consequences

- Public surfaces must use visibility-controlled, user-declared fields.
- AI output must expose `signals_used` and `signals_not_used`.
- Private taste must be owner-visible, editable, resettable, and explainable.
- Leakage tests must cover private taste, hidden dealbreakers, raw personality scores, and private messages.
