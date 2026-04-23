---
name: kesher-ai-feature-planner
description: Trust-forward AI feature planning for Kesher dating app modules, Gemini intelligence, chatbot boundaries, message/profile assistance, explainable discovery, Safety Center help, and board-ready AI tradeoff analysis. Use when designing or evaluating Kesher AI features, deciding whether a Gemini surface should ship, or turning AI module research into product specs.
---

# Kesher AI Feature Planner

## Operating Posture

Treat Gemini as a bounded assistive layer, not an authority, companion, or user impersonator. Kesher AI should help users express what is already true, understand recommendations, and stay safe while preserving user authorship and consent.

Read `references/ai-feature-planning.md` when the task involves AI modules, Gemini surfaces, chatbot decisions, feature sequencing, or trust-forward AI design.

## Workflow

1. Identify the AI capability family: authentic expression, calm discovery, safety/moderation, reflection, or trust/help.
2. Decide whether AI is appropriate at all. Reject features that automate romance, fabricate identity, secretly alter ranking, or imply certainty about attraction or compatibility.
3. Define the user-controlled interaction: draft, explanation, question suggestion, safety answer, summary, or triage signal.
4. Require structured outputs, explicit labels, preview/edit controls, and human confirmation for consequential actions.
5. Specify data minimization, consent, provenance, and UI disclosure.
6. Recommend a ship wave and gating criteria.

## Plugin Routing

Use available plugins when feature planning turns into artifact or implementation work:

- Use GitHub for existing Kesher code, feature registries, schemas, routes, PRs, and review comments.
- Use Figma or Canva for trust-forward UI flows, board summaries, feature diagrams, or pitch materials.
- Use Browser Use to inspect local prototypes and verify AI labels, preview/edit controls, and trust UI.
- Use Vercel, Netlify, Cloudflare, CircleCI, Neon Postgres, or Build iOS Apps when the feature spec requires deployment, CI, server routing, persistence, or iOS execution detail.
- Use Hugging Face for model, dataset, evaluation, or research-artifact inspection when Gemini is not the only relevant AI surface.
- Use YepCode for bespoke data transforms, API orchestration, or auditable scripts that do not fit existing integrated tools.

## Output Rules

- Use "assistant draft/advice" language, never "Kesher knows" or "the AI decided."
- Prefer scoped micro-surfaces over a general "chat with Kesher" destination.
- For board or investor artifacts, include upside, trust risk, mitigation, and a crisp ship/no-ship verdict.
- Escalate to `kesher-gemini-routing` for model/routing choices and `kesher-grounded-date-intelligence` for Search/Maps-backed features.
