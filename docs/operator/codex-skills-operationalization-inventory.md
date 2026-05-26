# Kesher Codex Skills Operationalization Inventory

Date: 2026-05-25  
Branch: `codex/operationalize-skills-hub`  
Base: `origin/main` at `59e128f2f45b3e0137cbb56d5b3bff16fa3f9980`  
Production prototype: `https://google-ai-studio-sage-sigma.vercel.app`

## Repo-Local Codex Skills

Discovered under `skills/*/SKILL.md`:

- `google-ai-studio-app-builder`
- `kesher-ai-feature-modules`
- `kesher-ai-governance`
- `kesher-bfas-assessment`
- `kesher-calm-ux`
- `kesher-compatibility-reflection`
- `kesher-consent-ux`
- `kesher-dark-pattern-audit`
- `kesher-explainable-ai`
- `kesher-filtering-marketplace`
- `kesher-gemini-integration`
- `kesher-grounded-search`
- `kesher-high-thinking-routing`
- `kesher-image-analysis`
- `kesher-israeli-privacy`
- `kesher-learned-taste`
- `kesher-low-latency-ai`
- `kesher-maps-date-planner`
- `kesher-pacing-coach`
- `kesher-permissioned-sharing`
- `kesher-personality-delivery`
- `kesher-personality-engine`
- `kesher-personality-ocean`
- `kesher-personality-profile`
- `kesher-personality-research`
- `kesher-personality-visibility`
- `kesher-personality-why-match`
- `kesher-privacy-preserving-recommendation`
- `kesher-private-recommendations`
- `kesher-private-taste`
- `kesher-psychometric-validation`
- `kesher-system-prompt`
- `kesher-voice-integration`
- `sparkmatch-dating-app-skill`
- `video-generator`

## `.agents/skills` Bridge

Created wrappers:

- `kesher-skills-hub-operationalizer`
- `kesher-ai-feature-guardian`
- `kesher-rtl-calm-ux-reviewer`
- `kesher-vercel-preview-verifier`
- `kesher-privacy-safety-redteam`

Bridge documentation: `docs/operator/codex-skills-bridge.md`.

## Visible Session / Global / Plugin Skills

Visible to this run through Codex skill registry:

- Core local: `codex-app-builder-operator`, `github-agentic-delivery`, `playwright`, `pdf`, `deployment-traceability-operator`.
- Kesher global/local: `kesher-system-prompt`, `kesher-personality-delivery`, `kesher-ai-governance`, `kesher-ai-feature-modules`, `kesher-gemini-integration`, `kesher-low-latency-ai`, `kesher-high-thinking-routing`, `kesher-explainable-ai`, `kesher-bfas-assessment`, `kesher-personality-profile`, `kesher-personality-engine`, `kesher-personality-research`, `kesher-personality-ocean`, `kesher-personality-visibility`, `kesher-private-taste`, `kesher-private-recommendations`, `kesher-personality-why-match`, `kesher-compatibility-reflection`, `kesher-filtering-marketplace`, `kesher-learned-taste`, `kesher-maps-date-planner`, `kesher-pacing-coach`, `kesher-calm-ux`, `kesher-trust-safety-ai`.
- Plugin-provided: GitHub, Vercel, Netlify, Expo, CodeRabbit, Neon Postgres, Render, Supabase, Cloudflare, OpenAI Developers, Figma, Browser, Build Web Apps, Codex Security, Superpowers, YepCode.
- Missing from repo-local requested list at inventory time: `kesher-israeli-privacy` exists repo-local; `kesher-consent-ux` exists repo-local; `kesher-dark-pattern-audit` exists repo-local; `kesher-psychometric-validation` exists repo-local; `kesher-private-recommendations` exists repo-local; no missing requested Kesher skill package was found.

## Relevant Plugins / MCP

Enabled and relevant:

- GitHub: repo/PR context and CI review flow.
- Vercel: deployment status, build log, and preview verification.
- Browser: local route and visual smoke checks when a dev server is running.
- Codex Security: secret exposure and AI/privacy review workflows.
- OpenAI Developers: current OpenAI/Codex product guidance when needed.
- Build Web Apps: React/Vite implementation conventions.
- Superpowers: execution, verification, and branch finishing workflow.

Available but not materially used for this implementation unless a later task needs them: Netlify, Expo, CodeRabbit, Neon Postgres, Render, Supabase, Cloudflare, Figma, YepCode.

## Existing App Surfaces

- `/`: app root redirects through auth/onboarding into `/daily`.
- `/prototype`: deployment/status prototype page.
- `/skills`: direct unauthenticated deep link wrapped with `AppProvider`, plus authenticated in-app navigation when already inside the router.
- `/skills-hub`: compatibility alias for the public Skills Hub.
- `/daily`: finite Daily Picks, why-match explanation, pacing intervention, skills rail.
- `/explore`: controlled Explore and filter drawer, skills rail.
- `/inbox`: conversation list, AI safety tip, chat skills rail.
- `/settings`: settings hub.
- `/settings/personality`: private personality profile and assessment route.
- `/settings/personality-visibility`: owner controls for personality visibility.
- `/settings/taste-profile`: private taste controls and reset/export semantics.
- `/settings/ai-trust`: AI feature registry and consent/trust hub.
- `/settings/safety`: Safety Center, report flow, safety/resource skills.
- `/admin/ai-ops`: internal AI ops and moderation summary console.
- `/admin/experiments`: internal experiments/eval console.
- `/demo?demo=1`: demo mode recognized by `isPrototypeDemoMode()`.

## Existing Skills Hub Implementation

- Hub shell: `src/features/skills/SkillsHub.tsx`.
- Router: `src/features/skills/SkillsRouter.tsx`.
- Canonical registry: `src/features/skills/skillRegistry.ts`.
- Types/state/events: `src/features/skills/types.ts`, `src/features/skills/useSkillState.ts`, `src/features/skills/skillEvents.ts`.
- Components: `SkillCard`, `SkillLauncher`, `SkillConsentPanel`, `SkillContextPanel`, `SkillRecommendationRail`, `SkillProgressPill`.
- Implemented skill pages: personality assessment/profile/ocean/visibility, consent/privacy/recommendation/private taste, why-match, permissioned sharing, compatibility reflection, filtering, learned taste, pacing, AI governance, psychometric validation, dark-pattern audit.
- Fallback page: `PlannedSkillPage.tsx`, now a useful app-native launcher/contract surface for gated/reference modules.
- Skill packages: 43 `skills/*/SKILL.md` packages.
- Legacy `.skill` exports: none discovered.

## Package Scripts

- Build: `npm run build`
- Typecheck/lint: `npm run lint`, `npm run typecheck`
- Tests: `npm test`, `npm run test:schemas`, `npm run test:scoring`
- Skill tests: `npm run test:skills`
- RTL: `npm run test:rtl`
- Forbidden-field scan: `npm run scan:forbidden-fields`
- Log scan: `npm run scan:logs`
- Deployment smoke: `npm run smoke:deployment`
- Vercel upload check: `npm run check:vercel-upload`

## Verification Snapshot

Baseline local checks before implementation in this worktree:

- Vitest: 130 tests passed.
- TypeScript: passed.
- Skill package script: 43 skills validated.

Known production issue at start:

- Production `/api/health`, `/api/version`, and `/__version` were reachable.
- Unknown `/api/*` returned a 500 text response instead of JSON 404. This branch changes `api/[...path].ts` to return JSON 404 before lazy Express imports for unsupported namespaces.

## PR #58 Prior-Art Risks

Corrected while porting:

- Removed hardcoded compatibility consent.
- Avoided numeric `0` rendering in why-match signal sections.
- Typed consent labels as `Record<SkillConsentType, string>`.
- Replaced Skills Hub inline metadata with canonical registry.
- Avoided `window.location.href` fallback in the launcher.
- Saved output summaries now summarize the output instead of reusing `demoModeBehavior`.
- Moved persistence out of React state updaters.
