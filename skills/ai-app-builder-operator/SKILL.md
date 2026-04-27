---
name: ai-app-builder-operator
description: Operator workflow for turning app ideas into execution-ready builds using Google AI Studio, Manus, web apps, mobile app workflows, GitHub sync/export, and AI prototyping tools. Use when planning how to build a Kesher feature or AI app prototype with AI Studio, Manus, React/Node, Firebase, Expo/mobile workflows, hosted web apps, or prompt-to-app builders.
---

# AI App Builder Operator

## Operating Posture

Treat AI Studio and Manus as rapid app-building control planes, not substitutes for product judgment, security, or source-controlled engineering. Use them to prototype, validate flows, and produce implementation plans while keeping data boundaries and export paths clear.

Read `references/app-builder-operator.md` for platform roles, decision rules, and build workflow.

## Workflow

1. Identify the target: prototype, MVP, internal tool, production web app, mobile app, or design artifact.
2. Choose the builder path: Google AI Studio for Gemini/Firebase-native AI prototypes; Manus for hosted full-stack web apps, agent tasks, GitHub sync, or exportable builds.
3. Define product scope before prompting: user, workflow, screens, data model, AI capability, safety constraints, and acceptance criteria.
4. Require source control/export for anything that may become production.
5. Keep secrets server-side and avoid shipping client-exposed API keys.
6. Produce a build brief with prompts, architecture, test scenarios, and handoff steps.

## Plugin Routing

Use available plugins as execution rails:

- Use GitHub for repositories, issues, PRs, branches, reviews, code search, and source-controlled handoff.
- Use Browser Use for opening localhost, testing web prototypes, clicking flows, screenshots, and visual QA.
- Use Vercel or Netlify for project hosting, deployments, previews, logs, environment variables, forms, protected URLs, and domain checks.
- Use Cloudflare for Workers, Pages, AI Gateway, Durable Objects, caching, edge functions, and Cloudflare API operations.
- Use CircleCI for build pipelines, config validation, CI failure triage, and deployment checks.
- Use Neon Postgres for managed Postgres projects, schema planning, migrations, branches, and production database concerns.
- Use Build iOS Apps for SwiftUI, App Intents, simulator debugging, signing, packaging, and iOS-specific build/run workflows.
- Use Figma for generating, implementing, or connecting design systems and UI designs.
- Use Canva for branded presentations, design resizing, translated designs, and visual collateral.
- Use Hugging Face for models, datasets, papers, Gradio Spaces, jobs, and model/evaluation research.
- Use YepCode for custom auditable JavaScript/Python scripts, bespoke API orchestration, and data transformations.
- Use Quicknode only when the app involves blockchain, wallets, RPC infrastructure, or on-chain integrations.
- Use Superpowers for planning, TDD, systematic debugging, verification, subagent workflows, and branch finishing.

## Output Rules

- Prefer prototype-first execution when requirements are still uncertain.
- Include data model, user flows, AI boundaries, and deployment path in build plans.
- For mobile workflows, call out Expo/TestFlight/store-submission assumptions when relevant.
- For Kesher work, apply the trust-forward product constraints from the Kesher skills before recommending build mechanics.
