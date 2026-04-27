---
name: kesher-trust-safety-ai
description: Trust-preserving AI design for Kesher image analysis, voice conversations, moderation triage, safety support, disclosure, and bounded multimodal features. Use when assessing photo/image analysis, voice AI, Gemini Live, safety center, moderation workflows, or any Kesher AI feature that could infer sensitive traits, objectify users, impersonate a person, or create companion-like dependency.
---

# Kesher Trust Safety AI

## Operating Posture

Treat multimodal and voice AI as bounded utility, not relationship simulation. Use AI to reduce effort, improve accessibility, summarize or triage safety issues, and support human judgment. Never use it to score attractiveness, infer protected traits, auto-flirt, or become an always-available emotional companion.

Read `references/trust-safety-ai.md` for image, voice, and moderation design rules.

## Workflow

1. Identify the surface: member-facing image feedback, moderator triage, voice utility, Safety Center support, or internal review aid.
2. Apply hard red lines: no attractiveness scoring, no sensitive identity inference, no objectifying descriptions, no user impersonation, no companion framing, no unexplained retention.
3. Separate member-facing outputs from moderator-facing signals.
4. Use structured outputs with finite categories, uncertainty flags, rationale snippets, and human review for consequential actions.
5. Add disclosure, consent, retention limits, and user controls.
6. Gate launch through alpha/beta safety tests, especially for Hebrew voice quality and emotional-dependency risk.

## Plugin Routing

Use available plugins when trust/safety AI needs artifacts, testing, or implementation:

- Use GitHub for moderation routes, safety policies, image/voice schemas, feature flags, and review workflows.
- Use Browser Use to inspect disclosure, consent, report/block, Safety Center, and moderation UI behavior.
- Use Figma or Canva for safety-center flows, trust hub artifacts, moderation diagrams, or review decks.
- Use Hugging Face for model, dataset, and evaluation research around safety, image, voice, or moderation tasks.
- Use Cloudflare, Vercel, Netlify, CircleCI, Neon Postgres, or YepCode when safety controls depend on runtime, CI, audit persistence, or controlled experiments.

## Output Rules

- Prefer "readiness feedback" and "accessibility preview" over judging a person.
- For voice, keep the interaction task-bounded and non-bonding.
- For moderation, AI can summarize and triage; humans decide consequential enforcement.
- Include failure modes and abuse cases in any spec.
