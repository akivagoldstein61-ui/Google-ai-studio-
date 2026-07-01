---
name: kesher-filtering-marketplace
description: "Implement Kesher filtering grammar, discovery marketplace mechanics, reciprocal recommendation ordering, Daily Picks versus Explore distinctions, hard and soft filters, exposure fairness, and anti-starvation safeguards."
---

# Kesher Filtering Marketplace

Use this skill when changing discovery ordering, filters, candidate eligibility, or fairness controls. Keep user-facing explanations limited to visible signals and do not expose hidden weights or private personality/taste internals.


## Implementation Workflow
1. **Algorithm Selection:** Choose the appropriate matching algorithm (e.g., Gale-Shapley for stable matching, or a reciprocal scoring heuristic).
2. **Backend Implementation:** Implement the algorithm in `server/matchingRoutes.ts`.
3. **Performance Testing:** Test the algorithm with simulated data to ensure it meets latency targets.

## Manus Execution Directive
- **Capability:** `web_development`, `data_analysis`
- **Action:** Implement and test the reciprocal matching algorithm in the backend routes.
