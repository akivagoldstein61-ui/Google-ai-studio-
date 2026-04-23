# Plugin-Aware Kesher Codex Skills

This directory contains repo-local Codex skills for Kesher work, with plugin routing guidance included in each skill.

## Skills

- `ai-app-builder-operator`: AI Studio, Manus, hosted app, GitHub handoff, and prototype build planning.
- `kesher-ai-feature-planner`: trust-forward Gemini feature planning and AI module decisions.
- `kesher-gemini-routing`: model lane, thinking budget, latency, cost, and server-side AI routing policy.
- `kesher-grounded-date-intelligence`: Search/Maps-grounded date planning, freshness, citations, and attribution.
- `kesher-personality-compatibility`: BFAS/Big Five reflection without deterministic scoring or hidden ranking.
- `kesher-product-strategist`: Kesher product strategy, trust critique, roadmap, UX, and execution planning.
- `kesher-trust-safety-ai`: bounded image, voice, moderation, and safety AI surfaces.

## Structure

Each skill follows this shape:

- `SKILL.md`: trigger, operating posture, workflow, plugin routing, and output rules.
- `agents/openai.yaml`: OpenAI interface metadata.
- `references/*.md`: compact source-backed operating doctrine.

Use these skills alongside `AGENTS.md` and `docs/codex/KESHER_CODEX_MASTER_SKILLS.md` when planning or implementing Kesher work.
