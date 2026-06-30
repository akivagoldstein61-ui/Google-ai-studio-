# AGENTS.md

## Mission

Build Kesher as a trustworthy, privacy-sensitive, serious-intent Jewish dating product. Agentic tools are implementation assistants; they are not release authorities, legal reviewers, security auditors, moderation owners, or production operators.

## Project Baseline

- App source of truth: `akivagoldstein61-ui/Google-ai-studio-` on `main`.
- This is a React 19 + Vite frontend served by an Express API in `server.ts`.
- The product is the Kesher trust-forward dating app with Firebase auth/data and server-side Gemini AI routes.

## Stable Project Rules

- Preserve user safety, consent, privacy, moderation integrity, and reviewability before feature speed.
- Kesher is Hebrew-first, Israel-aware, serious-intent, privacy-forward, safety-visible, calm, premium, RTL-safe, mobile-first, and assistive-AI-only.
- Discovery must remain finite in Daily Picks and controlled in Explore.
- Private taste personalization is owner-only and must never become public objectification.
- Explanations must be visible and provenance-aware; do not hide score-driven claims behind vague AI copy.
- Do not add product features unless they are already present, scaffolded, documented, or explicitly requested.
- Frontend code is not a security boundary.
- Keep `GEMINI_API_KEY` server-side. Do not expose it through Vite `define`, client env vars, browser logs, generated artifacts, or docs.
- Never expose secrets, tokens, private keys, service-role keys, cookies, `.env` values, raw user messages, profile photos, abuse reports, moderation evidence, precise locations, or production PII in prompts, logs, client bundles, generated artifacts, or public outputs.
- AI-generated code, explanations, moderation summaries, prompt outputs, and policies are untrusted until tested and reviewed.
- AI may assist, draft, explain, summarize, classify, or suggest. AI must not auto-send as the user, impersonate the user, make final unappealable moderation decisions, expose hidden ranking/taste signals, or reveal raw private questionnaire answers.
- Never implement public attractiveness scores, hot-or-not mechanics, deterministic compatibility percentages, soulmate/destiny/marriage-probability claims, protected-trait inference from photos, hidden ranking manipulation, public inferred personality labels, raw personality score sharing, default-on compatibility reflection, or dark-pattern opt-ins.
- Report, block, unmatch, moderation, consent, account deletion, and audit flows are core product infrastructure.
- Do not change Firebase production data, Firestore rules, auth mode, deployment config, billing, or external credentials without explicit approval.
- Treat local PDFs, docs, prompt libraries, and skill bundles as reference and workflow guidance, not automatic implementation authority.

## Procedure

1. Start by detecting the actual repo stack and existing conventions.
2. Reuse the current framework, package manager, routing pattern, test runner, CI, and deployment shape unless explicitly asked to change.
3. Keep one bounded task per branch/worktree.
4. Prefer minimal reversible diffs.
5. For safety-sensitive work, add negative tests, not only happy-path tests.
6. Do not weaken auth, role checks, reports, block flows, moderation, deletion, or audit logs to make tests pass.
7. Do not introduce a new backend, database, framework, major dependency, or deployment surface without an explicit architecture decision.
8. If backend direction is unclear, preserve current Firebase/Gemini continuity and document Supabase/Lovable as an option, not a mandate.

## Tooling and Plugin Boundaries

- Use GitHub workflows for PR governance, review discipline, CI checks, and generated-code handoff. Do not push generated work directly to `main`.
- Use Browser for local UI/API smoke checks when a dev server is intentionally running.
- Use Figma only for design context and implementation alignment; do not treat design output as production approval.
- Use Vercel or Netlify only for validated preview/deployment work after explicit approval. Do not publish, set secrets, attach domains, or change deployment settings by default.
- Use Superpowers planning/execution workflows for scoped implementation discipline, verification, and review checkpoints.

## Lovable-Originated Code

- Treat Lovable output as untrusted generated code.
- Do not import directly to `main`.
- Promote through a pull request.
- Require tests, secret scan, security review, and rollback notes.
- Do not assume Lovable can import or sync with this existing repo.
- Do not claim Lovable is native iOS, Security View is final certification, PWA/installability is ready, or frontend checks are enough without separate validation.

## Verification

- Install: `npm ci`
- Typecheck: `npm run lint`
- AI contract tests: `npm run test`
- Production build: `npm run build`
- Local smoke: `npm run dev`, then check `/api/health` and a no-key AI fallback path.
- Skills: `npm run test:skills` and `npm test -- src/features/skills/skillsRegistry.test.ts`
- Privacy scans: `npm run scan:forbidden-fields` and `npm run scan:logs`
- RTL: `npm run test:rtl`
- Vercel upload: `npm run check:vercel-upload`

## Review Notes

- Canonical app types are in `src/types.ts`.
- `src/types/index.ts` exists but is not currently imported by the app.
- `AI_ROUTE_AUTH_MODE=strict` is the production default for AI routes; `prototype` is only for local unauthenticated testing. Strict mode requires Firebase Admin initialization and bearer tokens.

## Skill Usage Rules

- Canonical Kesher skill packages live in `skills/*/SKILL.md`.
- Codex bridge wrappers live in `.agents/skills/*/SKILL.md` and must point back to canonical sources rather than drifting.
- The Skills Hub contract lives in `src/features/skills/skillRegistry.ts`; `SkillsHub.tsx` must consume that registry rather than maintaining separate card metadata.
- Every visible skill needs an app-native entry point, launcher/state behavior, consent notes, data exclusions, and either operational behavior or an honest gated fallback.

## PR Summary Format

- Summary
- Skills used
- Files changed
- Skill-to-surface map
- Tests and command results
- Security/privacy checks
- Vercel preview proof
- Risks and rollback plan

## Vercel Preview Checklist

- Production remains reachable.
- Preview build succeeds without stripped `src/features/skills` files.
- `/skills-hub`, `/skills`, `/daily`, `/explore`, `/inbox`, `/settings/ai-trust`, `/settings/safety`, and `/demo?demo=1` render.
- `/api/health`, `/api/version`, and an unknown `/api/*` path return JSON.
- No failed build log or serverless runtime error remains unexplained.
