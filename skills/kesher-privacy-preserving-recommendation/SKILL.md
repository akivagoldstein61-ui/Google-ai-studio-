---
name: kesher-privacy-preserving-recommendation
description: "Implement Kesher recommendation architecture with silent personalization, safe explanations, permissioned personality boundaries, anti-leakage controls, and release gates before any personality-informed ordering."
---

# Kesher Privacy-Preserving Recommendation

Use this skill when modifying recommendations, Daily Picks, Explore ordering, safe explanations, or personality-informed discovery experiments.

## Workflow

1. Separate the recommendation stack into silent personalization, safe explanation, and permissioned personality layers.
2. Use explicit user preferences and profile logistics before inferred or behavioral signals.
3. Keep private taste and hidden ordering signals owner-only.
4. Do not use personality in ranking until validation, consent, privacy, and release gates are complete.
5. Explain matches only with whitelisted, user-visible, provenance-labeled reasons.
6. Test for leakage: explanations must not reveal private taste, exact values, hidden ordering, or non-shared personality signals.

## Prototype Surface

The Vercel prototype page should show the layer diagram, signal table, blocked release gates, and no-leakage checks.

## Stop Points

Stop before exposing hidden ordering, using personality without consent, adding public fit meters, or changing production ranking behavior.
