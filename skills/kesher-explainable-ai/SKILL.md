---
name: kesher-explainable-ai
description: "Implement Kesher trust language, explanation provenance, and transparency for AI recommendations. Use when generating safe explanations, source chips, signal allowlists, fallback templates, or management controls for why-match and recommendation surfaces."
---

# Kesher Explainable AI

Use this skill to explain visible signals without revealing private taste, hidden weights, raw personality data, or sensitive inferences. Prefer short provenance-labeled explanations and deterministic fallbacks when model output is unavailable.


## Implementation Workflow
1. **Fallback Definitions:** Define hardcoded, deterministic fallback responses for critical AI features.
2. **Error Interception:** Intercept AI generation errors or safety blockages.
3. **Fallback Rendering:** Render the deterministic fallback response when an error is intercepted.

## Manus Execution Directive
- **Capability:** `web_development`
- **Action:** Implement deterministic fallback logic for all critical AI features.
