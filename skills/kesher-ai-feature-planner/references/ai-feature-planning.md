# Kesher AI Feature Planning Reference

## Source Documents

- `Kesher AI Feature Modules Deep Research.pdf`
- `Kesher Deep Research Dossier on Adding Gemini Intelligence.pdf`
- `Kesher Gemini Chatbot Surface Dossier.pdf`
- `Kesher Gemini Chatbot Surface Decision Dossier.pdf`
- `Kesher strategic dossier on the top five Google AI Studio features.pdf`

## Executive Doctrine

Gemini is high-leverage for Kesher only as a bounded assistive layer with structured outputs, explicit user control, and tooling where freshness matters. The value is real in Hebrew-first articulation help, explainable finite discovery, review-before-send messaging coaching, grounded date planning, and trust/safety triage.

The main trust risk is not that AI makes mistakes. The sharper risk is that the product creates a believable simulation of a person the user did not author. That can feel like deception or chatfishing even when the intent is assistance.

## What To Ship First

Highest-confidence phase-one wins:

- Hebrew-first "keep my voice" profile drafting and clarity audit.
- Review-before-send message coaching for warmth, clarity, boundaries, polite decline, de-escalation, and observance-sensitive phrasing.
- "Why this match" explanations framed as hypotheses from whitelisted signals.
- Optional first-question suggestions that do not impersonate the user.
- Safety Center Q&A with grounding when current guidance matters.
- Trust Hub/settings explainers about AI labels, controls, and data use.

## Chatbot Surface Decision

Do not ship a general-purpose "chat with Kesher" as a primary interaction mode. If a chat-like surface exists, keep it secondary, scoped, and utilitarian:

- Safety Center guide with citations and non-emergency framing.
- Settings or AI Trust Hub explainer.
- Bounded task help for a specific flow.

Avoid:

- a companion-style bot,
- open-ended romantic advice destination,
- hidden memory or personality simulation,
- AI speaking as the user,
- assistant outputs that look like authentic user-authored messages without labels.

## Google AI Studio / Gemini Capabilities

Top capabilities for Kesher:

- Core Gemini intelligence for calm Hebrew-first communication help.
- System instructions and structured JSON outputs for bounded behavior.
- Google Search grounding for freshness and citations.
- Google Maps grounding for real date logistics.
- Multimodal image understanding for bounded safety/quality signals.
- Thinking controls for complex or sensitive reasoning, not routine tasks.

## Required Controls

Every feature spec should define:

- allowed input data,
- output schema,
- labels and disclosure,
- preview/edit/confirm step,
- consent requirement,
- prohibited claims,
- human review requirement for consequential actions,
- logging and observability,
- failure and refusal behavior.

## Hard Language Rules

Use:

- "draft",
- "suggestion",
- "hypothesis",
- "based on what you shared",
- "review before sending",
- "you stay in control."

Avoid:

- "AI chose",
- "perfect match",
- "guaranteed chemistry",
- "Kesher knows",
- "send for me",
- "be more attractive",
- any copy implying hidden profiling or deterministic compatibility.

## Plugin Integration

Use plugin capabilities to move from AI concept to verified artifact:

- GitHub: inspect feature registries, schemas, prompt files, server routes, and AI policy tests.
- Browser Use: verify UI labels, preview/edit controls, source displays, and consent flows in a running app.
- Figma and Canva: create or refine AI feature flows, trust-hub screens, and stakeholder decks.
- Vercel, Netlify, Cloudflare, CircleCI, Neon Postgres: plan deployment, server-side routing, CI checks, observability, data storage, and retention.
- Hugging Face: inspect non-Gemini models, datasets, Spaces, papers, or evaluation artifacts where relevant.
- YepCode: run small auditable scripts for API experiments, data transformation, or workflow automation.
- Build iOS Apps: plan native iOS surfaces, App Intents, SwiftUI UX, and simulator verification for mobile AI features.
