---
name: kesher-high-thinking-routing
description: "Route Kesher Gemini thinking-mode work. Use when deciding when to enable high-thinking controls, configuring thinking budgets, designing fast-plus-thinking patterns, or planning A/B tests for reasoning-heavy AI features."
---

# Kesher High Thinking Routing

Use this skill only for features that genuinely need deeper reasoning. Keep low-risk and latency-sensitive surfaces on faster routes, and reserve higher-thinking paths for safety, reflection, planning, or complex grounded synthesis.


## Implementation Workflow
1. **Complexity Assessment:** Implement logic to assess the complexity of an incoming AI request.
2. **Model Selection:** Route simple requests to fast models (e.g., `gemini-1.5-flash`) and complex requests to reasoning models (e.g., `gemini-1.5-pro`).
3. **Fallback Logic:** Implement fallback routing if the primary model fails.

## Manus Execution Directive
- **Capability:** `web_development`
- **Connector:** Gemini API
- **Action:** Implement the dynamic model routing matrix based on request complexity.
