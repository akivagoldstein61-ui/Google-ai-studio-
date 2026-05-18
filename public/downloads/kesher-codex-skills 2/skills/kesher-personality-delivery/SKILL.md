---
name: kesher-personality-delivery
description: Coordinate implementation, verification, review, CI, deployment, and platform parity for Kesher personality features using the appropriate repo, browser, CI, review, deploy, database, and native-app plugins. Use after or during personality feature work when planning tasks, running checks, opening browser flows, preparing GitHub/CircleCI/CodeRabbit review, or considering Netlify/Vercel/Cloudflare/Neon/Expo/iOS/macOS delivery.
---

# Kesher Personality Delivery

Use this skill to ship personality work carefully after a feature-specific skill has identified the product contract.

## Workflow

1. Start from `AGENTS.md` and the relevant feature skill.
2. Read `$kesher-personality-research/references/tooling-deployment-delivery.md` and `references/plugin-map.md` to choose platform tools. Do not invoke deploy, production config, billing, database migrations, GitHub pushes, PR creation, or external automations without explicit approval.
3. Run the narrowest useful local verification:
   - targeted tests
   - `npm run check`
   - `npm run build` when shared routes or schemas changed
   - browser flow checks for UI work
4. Use Browser Use for localhost visual/interaction checks when a frontend flow changes.
5. Use GitHub, CircleCI, and CodeRabbit only for repo, CI, or review tasks the user has asked for or approved.
6. Use deploy/platform plugins only when the requested work touches that platform.
7. Report exactly what ran, what passed, and what could not run.

## Platform Selection

Read `references/plugin-map.md` for when to use Netlify, Vercel, Cloudflare, Neon Postgres, Expo, iOS, macOS, Quicknode, YepCode, Superpowers, GitHub, CircleCI, CodeRabbit, and Browser Use.

Read `references/verification-matrix.md` before finalizing a personality feature branch.

## Stop Points

Stop and request explicit approval before changing auth, roles, Firebase rules, database schema, migrations, production config, secrets, billing, deploy settings, external automation tools, dependency versions, share/revoke persistence, or personality-driven ordering/gating.

## Acceptance Checks

- Feature-specific safety contracts are preserved.
- `docs/adr` and `src/ai/featureRegistry.ts` are updated when behavior or governance changes.
- Validation output is recorded in the final response.
- Browser screenshots or in-app browser checks are used for meaningful UI changes.
- CI/review/deploy plugins are used only when appropriate and approved.
- Vercel prototype artifacts (`/prototype`, `/skills-hub`, `/prototype/skills.html`, `/downloads/kesher-personality-skills.zip`) stay synchronized with canonical `skills/`.
