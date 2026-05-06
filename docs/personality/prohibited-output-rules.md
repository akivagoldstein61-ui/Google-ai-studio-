# Kesher Prohibited Output Rules

These rules are the first executable safety boundary for Kesher personality features. They do not replace server-side authorization, consent checks, audit logging, or human review.

## Blocked Language Families

- Compatibility scores, match percentages, or score-like claims.
- Soulmate, destiny, bashert, meant-to-be, perfect-match, doomed, or incompatible verdicts.
- Attractiveness, desirability, hotness, or public ranking claims.
- Hidden ranking, hidden dealbreaker, private taste, raw score, private message, or exact-location leakage.
- Diagnosis, therapy/treatment framing, clinical labels, or fixed identity claims.
- Protected-trait inference.
- Auto-send, impersonation, or acting as the user.

## Allowed "Why This Match" Signals

- `visible_values`
- `visible_intent`
- `visible_observance`
- `visible_lifestyle`
- `visible_interests`
- `visible_prompts`
- `self_declared_profile_fields`

## Forbidden "Why This Match" Signals

- `private_taste_profile`
- `hidden_dealbreakers`
- `hidden_ranking_signals`
- `raw_personality_scores`
- `private_messages`
- `exact_location`
- `protected_trait_inference`

Validate AI output before display. Store provenance separately from prose so product and safety reviewers can inspect what was used and what was intentionally excluded.
