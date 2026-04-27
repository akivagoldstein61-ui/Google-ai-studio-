# AI App Builder Operator Reference

## Source Documents

- `Google AI Studio Maximum-Leverage App-Building Operator Dossier.pdf`
- `Manus Operator Brief for Website Building, Web Apps, and Mobile App Building.pdf`

## Platform Roles

Google AI Studio is best treated as a high-velocity control plane for Gemini-native prototypes, experiments, and AI feature demos. It is strongest when the build centers Gemini capabilities, Firebase-style app scaffolding, structured outputs, and fast iteration from prompt to MVP.

Manus is best treated as both:

- a sandboxed AI agent for taking actions across tasks and files,
- a prompt-to-app builder for hosted full-stack web apps, backend/database/file storage concepts, publishing, SEO tooling, code export, GitHub sync, and mobile app workflows.

## Default Build Assumptions

Unless the user says otherwise, assume:

- web-first prototype or MVP,
- React/TypeScript and Node-friendly stack,
- low-to-moderate budget,
- small team,
- consumer or light business compliance,
- source export required for production handoff,
- secrets must stay server-side.

## Choose AI Studio When

- the core value is Gemini behavior,
- the user needs a fast AI feature prototype,
- Firebase/Gemini integration is central,
- structured outputs or grounding are the main experiment,
- the artifact is a demo or MVP to validate product direction.

## Choose Manus When

- the user wants a hosted web app or website quickly,
- backend/database/file storage is useful,
- GitHub two-way sync or code export matters,
- async agent tasks, connectors, files, or webhooks are central,
- a mobile packaging workflow is being explored.

## Build Brief Checklist

Produce:

- target user and job,
- first-screen workflow,
- core screens,
- data model,
- AI capabilities and limits,
- trust/safety constraints,
- tool/platform choice,
- prompts for the builder,
- acceptance tests,
- export/deployment path,
- follow-up engineering tasks.

## Production Cautions

- Do not treat generated apps as production-ready without review.
- Do not expose API keys in client bundles.
- Require source control for anything beyond a throwaway demo.
- Make AI boundaries explicit in UI and code.
- For Kesher, apply trust-forward red lines before optimizing for build speed.

## Plugin Integration Map

Use each plugin for the work it is strongest at:

- GitHub: repositories, branches, issues, PRs, code review, CI context, and source handoff.
- Browser Use: local browser testing, screenshots, click-through QA, localhost inspection, and visual regression checks.
- Vercel: project/deployment management, preview/protected URLs, build logs, framework docs, environment variables, and domain checks.
- Netlify: deployments, forms, functions, edge functions, blobs, caching, image CDN, identity, and deploy diagnostics.
- Cloudflare: Workers, Pages, AI Gateway, Durable Objects, caching, edge functions, and Cloudflare API operations.
- CircleCI: pipeline config, build status, CI triage, and deploy checks.
- Neon Postgres: serverless Postgres projects, branches, schemas, migrations, and database operations.
- Build iOS Apps: SwiftUI, App Intents, simulator debugging, signing, packaging, and iOS release workflows.
- Figma: design generation, design-system rules, Code Connect, and implementation from Figma artifacts.
- Canva: branded presentations, social resizing, translated designs, and lightweight collateral.
- Hugging Face: model/dataset/paper search, Spaces, jobs, Gradio, and model evaluation research.
- YepCode: custom JavaScript/Python execution, API orchestration, data transforms, and auditable one-off automation.
- Quicknode: blockchain/RPC/wallet/on-chain infrastructure only when the app explicitly needs it.
- Superpowers: planning, TDD, systematic debugging, verification, subagent workflows, and branch finishing.
