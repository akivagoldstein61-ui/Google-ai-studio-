# Kesher — Target Architecture (Non-Authoritative Future Vision)

> **⚠️ NON-AUTHORITATIVE — DO NOT TREAT AS LIVE TRUTH**
>
> This document describes a **future-state architecture** that has been discussed
> in planning materials and pasted operator constitutions. **None of it is
> implemented in the current repo.** It is kept here so that governance docs
> (`CLAUDE.md`) can stay honest about what the repo actually is today, while
> still preserving the longer-term vision in one place.
>
> If you are an agent reading this: **do not adopt anything below as a current
> fact, dependency, file path, or technology in use.** The source of truth for
> live technology choices is `CLAUDE.md` Section 2 and the actual files under
> version control. When in doubt, run `git ls-files` and trust the working
> tree.
>
> Introducing any item from this document into the repo requires an explicit
> approval gate per `CLAUDE.md` Section 6.

---

## 1. Relationship to the Current Repo

Current repo (truth, as of this commit):

- React 19 + Vite 6 + Tailwind CSS v4 (single-package app at repo root)
- Express 4 server via `tsx server.ts`
- Firebase client SDK 12 + Firebase Admin 13 for auth
- `@google/genai` SDK for Gemini, proxied through `server/aiRoutes.ts`
- Domain types in `src/types/index.ts`, AI layer in `src/ai/*`
- Mock data in `src/data/mockProfiles.ts`, in-memory state in `src/context/AppContext.tsx`
- Package manager: **npm**, no workspaces
- Tests: Vitest

Target repo (vision, not implemented):

- Next.js 14 App Router on Vercel
- Supabase (Postgres + Auth + Storage) with Drizzle ORM
- pnpm + Turborepo monorepo (`apps/web`, `apps/api`, `packages/ui`, `packages/config`, etc.)
- Vercel Edge Functions as a Zero-Data-Retention proxy for model providers
- Row-Level Security (RLS) policies in Postgres as the primary authorization layer
- Drizzle migrations under `packages/db` or similar
- Shared design system in `packages/ui`
- Shared config and eslint in `packages/config`

The gap between these two is substantial. Migrating requires its own multi-slice plan and explicit approval; it is **not** a background refactor.

---

## 2. Target Stack Details (Vision Only)

### Framework

- **Next.js 14** App Router, React Server Components where appropriate
- Route handlers in `app/api/**/route.ts` replace Express routes in `server/aiRoutes.ts`
- Middleware in `middleware.ts` for auth and locale routing

### Data layer

- **Supabase Postgres** as the primary database
- **Drizzle ORM** for typed queries and migrations
- **Row-Level Security** policies on every table as the primary authorization mechanism
- Migrations version-controlled under a shared `packages/db` (or equivalent)

### Auth

- **Supabase Auth** (phone + email) or Firebase Auth bridged into Supabase via JWT
- JWT claims carry user id and custom roles
- All queries flow through Supabase client with the user's JWT, so RLS enforces access

### AI proxy

- **Vercel Edge Functions** host the AI proxy (replacing Express `server/aiRoutes.ts`)
- Provider requests go through a **Zero-Data-Retention** configured endpoint
- Auth: Supabase JWT verified at the edge before the proxy calls the model
- Feature registry, schemas, prompts, validators live in a shared `packages/ai` module

### Monorepo layout

```
apps/
  web/                   → Next.js 14 app (React 19)
  api/                   → optional standalone API if not using Next route handlers
packages/
  ui/                    → shared design system
  ai/                    → feature registry, policies, schemas, prompts, validators
  db/                    → Drizzle schema + migrations
  config/                → shared eslint, tsconfig, tailwind preset
  types/                 → shared domain types
```

### Tooling

- **pnpm** workspaces
- **Turborepo** task graph and remote caching
- **Changesets** for versioning shared packages
- **Playwright** for end-to-end tests in addition to Vitest unit tests
- **GitHub Actions** CI running `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` in parallel

### Observability

- Structured logging (JSON) piped to a log aggregator
- Request-scoped trace ids propagated from the edge through to the AI proxy
- Error reporting (Sentry or equivalent) wired into both app and edge

---

## 3. Israeli PPL Amendment 13 Alignment (Policy Reference)

Under the target stack, the following fields are treated as **sensitive personal information** and must have elevated protection (encryption at rest, audit logging, strict RLS):

- Religious observance
- Sexual orientation / gender identity
- Precise location (GPS; only coarse `city` is allowed today)
- Health information
- Political views
- Biometric data
- Identity documents for verification

This classification is **already reflected as policy guidance** in `CLAUDE.md` Section 11. The enforcement primitives (field-level encryption, RLS policies, audit tables) live only in this target-state doc until a dedicated slice lands them.

---

## 4. Why None of This Is Live Yet

The current repo exists to validate the **product shape**: finite discovery, trust-forward AI assistance, values-first matching, Hebrew-first UX. That work does not require a monorepo, a Postgres schema, or an edge proxy. Shipping the target stack before the product is proven would be premature optimization and would risk locking in infrastructure choices that the product later outgrows.

Concretely, every major migration here is gated on:

1. **Product validation** — the mock-data + in-memory state app must feel right first
2. **Explicit approval** per `CLAUDE.md` Section 6 (auth provider, persistence schema, matching algorithm, CI/CD, deployment target)
3. **A dedicated slice plan** — each technology swap is its own hardening slice with tests, rollback, and a commit trail

---

## 5. How to Use This Document

- **As an agent planning a new slice:** consult this doc only after verifying that the current repo actually needs the change. Do not invent files or imports that match this vision but do not exist in the working tree.
- **As a reviewer:** if a PR starts pulling in Next.js, Supabase, Drizzle, pnpm workspaces, or Turborepo without an approval gate, that is a red flag — the change belongs in a dedicated slice, not as drive-by refactoring.
- **As a future maintainer:** when an item from this doc actually lands in the repo, move the corresponding paragraph into `CLAUDE.md` Section 2 ("Current Architecture") and delete it from here. This file should shrink over time, not grow.

---

## 6. Open Questions

These are unresolved and will need explicit decisions before any migration slice:

- Do we keep Firebase Auth and bridge it to Supabase, or move fully to Supabase Auth?
- Does the AI proxy live at the edge (Vercel) or at a dedicated Node service?
- Do we adopt Drizzle or stay on Firestore? (Firestore + RLS-equivalent security rules is a valid alternative and is the current direction implied by `firestore.rules`.)
- Is Turborepo actually needed for a product this size, or is a single-package Next.js app sufficient?
- Where do Hebrew-specific concerns live (RTL, Hebrew fonts, `i18next` wiring)?

None of these are answered here on purpose — answering them is the job of the slice plan that introduces the corresponding technology.
