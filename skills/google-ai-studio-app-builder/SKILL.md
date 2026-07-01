---
name: google-ai-studio-app-builder
description: "Build, deploy, and harden full-stack AI applications using Google AI Studio. Use when prototyping with Build mode, designing prompt-to-code apps, integrating Firebase AI Logic, deploying to Cloud Run, or following the 7-day hardening plan from prototype to MVP."
---

# Google AI Studio App Builder

Use this skill as a compact implementation pointer for Google AI Studio sourced prototypes. Keep GitHub as the durable handoff, move secrets server-side, add CI gates before production, and verify exported code in the repo before shipping.


## Implementation Workflow
1. **Scaffolding:** Use `init_project` to scaffold the initial application structure.
2. **Component Generation:** Generate React components based on design specifications.
3. **State Management:** Implement global state management (e.g., React Context or Zustand).

## Manus Execution Directive
- **Capability:** `web_development`
- **Action:** Scaffold and build application components according to the Kesher architecture rules.
