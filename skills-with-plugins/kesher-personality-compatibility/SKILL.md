---
name: kesher-personality-compatibility
description: BFAS and Big Five personality productization for Kesher, including reflective compatibility, user-owned measurement, non-deterministic interpretation, communication coaching, and Gemini integration. Use when designing personality questionnaires, compatibility reflections, trait-based prompts, dating communication guidance, or trust-forward personality features without hidden scoring or deterministic matching claims.
---

# Kesher Personality Compatibility

## Operating Posture

Use personality as reflection and communication scaffolding, not as a hidden ranking oracle. BFAS can help users understand tendencies, friction points, strengths, questions, and micro-habits, but it must not claim fate, diagnosis, or synthetic certainty.

Read `references/personality-compatibility.md` for BFAS structure, relationship-science boundaries, and product patterns.

## Workflow

1. Decide whether the feature measures traits, explains traits, compares reflections, or coaches communication.
2. Keep measurement deterministic, auditable, opt-in, and user-owned. Do not let an LLM score BFAS.
3. Interpret traits as tendencies with uncertainty markers.
4. Avoid compatibility scores as destiny. Prefer reflective summaries, possible strengths/frictions, questions to discuss, and concrete communication habits.
5. Separate actor effects, partner effects, and similarity claims.
6. Add consent, visibility controls, editability, and no hidden ranking use.

## Plugin Routing

Use available plugins when personality work needs implementation, research, or design support:

- Use GitHub for questionnaire code, scoring logic, schemas, settings screens, and trust-control implementation.
- Use Neon Postgres for opt-in trait storage, sharing controls, retention, auditability, and privacy-sensitive persistence design.
- Use Figma or Canva for reflection cards, sharing surfaces, onboarding flows, or explanatory diagrams.
- Use Browser Use to verify consent, editability, settings-only placement, and no-hidden-ranking UI.
- Use Hugging Face for research papers, datasets, or model/eval artifacts related to personality, compatibility, or communication coaching.

## Output Rules

- Use probabilistic language: "may", "can", "often", "worth exploring."
- Avoid diagnosis, protected-trait inference, or claims that Kesher knows who belongs together.
- When creating product copy, make it calm, non-judgmental, and user-owned.
- Escalate general AI feature policy to `kesher-ai-feature-planner`.
