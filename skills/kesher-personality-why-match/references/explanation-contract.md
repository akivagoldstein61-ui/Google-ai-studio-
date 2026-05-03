# Why This Match Explanation Contract

## Allowed Signals

- `visible_values`
- `visible_intent`
- `visible_observance`
- `visible_lifestyle`
- `visible_interests`
- `visible_prompts`
- `self_declared_profile_fields`

## Forbidden Signals

- `private_taste_profile`
- `hidden_dealbreakers`
- `hidden_ranking_signals`
- `raw_personality_scores`
- `private_messages`
- `exact_location`
- `protected_trait_inference`

## Required Shape

Return 2-3 reasons, one first question, `signals_used`, `signals_not_used`, and an uncertainty note. Prefer deterministic templates when validation fails.
