# 05 — Unified Ownership Model

> Who owns what in the Kesher system going forward.
> Based on evidence from codebase audit and Kesher canon.

---

## Ownership Layers

### 1. AI Studio Export → Prototype Authority Only

The Google AI Studio export is the **sole artifact** in this repo. It is treated as a prototype, not production code.

**What it legitimately owns (salvage):**
- AI feature registry metadata (`src/ai/featureRegistry.ts`)
- AI safety policies and system instructions (`src/ai/policies.ts`)
- AI prompt templates (`src/ai/prompts.ts`)
- AI structured output schemas (`src/ai/schemas.ts`)
- AI output validators (`src/ai/outputValidators.ts`)
- AI capability router (`src/ai/capabilityRouter.ts`)
- AI model registry (`src/ai/modelRegistry.ts`)
- AI feature flags (`src/ai/featureFlags.ts`)
- AI type definitions (`src/ai/types.ts`)
- Design tokens and aesthetic direction (`src/index.css`)
- Screen structure and product flow (Daily Picks → Explore → Inbox → Settings)
- Firestore security rule structure (`firestore.rules`)
- Domain type taxonomy (`src/types/index.ts`)
- UI component patterns (Badge, Button, Input)

**What it does NOT own (must be rebuilt):**
- Auth (fake)
- Data persistence (mock)
- AI service transport (client-side, key-exposed)
- Matching algorithm (Math.random)
- Navigation (useState booleans)
- State management (single context, no persistence)
- Tests (none)
- CI/CD (none)
- i18n (none)
- Deployment config (AI Studio-managed only)

---

### 2. Server → Must Own Security-Sensitive Operations

The Express server (`server.ts`) currently has only `/api/health`. It must become the authority for:

| Operation | Why Server | Current State |
|-----------|-----------|---------------|
| All Gemini API calls | API key must never reach client | Client-side |
| Auth token validation | Firebase Admin SDK for server-side verification | Not implemented |
| Firestore writes for sensitive ops | Rate limiting, validation, abuse prevention | Not implemented |
| Taste profile analysis | Private preference data must not leave server | Client-side |
| Safety scan execution | Must not be bypassable by client manipulation | Client-side |
| Report submission | Must be tamper-proof | Not implemented |
| Match creation | Must verify mutual like server-side | Client-side Math.random |
| Account deletion | Must cascade across collections | Not implemented |

**Proposed API surface:**

```
POST /api/ai/bio-coach
POST /api/ai/taste-profile
POST /api/ai/why-match
POST /api/ai/safety-scan
POST /api/ai/date-planner
POST /api/ai/safety-advice
POST /api/ai/rephrase
POST /api/ai/openers
POST /api/ai/profile-completeness
POST /api/ai/daily-picks-intro
GET  /api/health
```

Each route:
- Validates Firebase Auth token from request header
- Calls Gemini with server-side key
- Returns structured response
- Logs usage for audit

---

### 3. Client → Owns UI Rendering, Local State, Animations

The React client retains ownership of:

| Responsibility | Current Files | Changes Needed |
|---------------|---------------|----------------|
| Screen rendering | `src/features/*`, `src/components/*` | Wire to real data |
| Animation / transitions | Motion library usage | None |
| Local UI state (active tab, selected profile, modals) | `App.tsx` + future router | Move to router params |
| Design system rendering | `src/index.css`, `src/lib/utils.ts` | None |
| Form state (onboarding steps, profile editing) | Various screens | None |
| Analytics event emission | `analyticsService.ts` | Wire to real provider |

The client must **NOT** own:
- API keys
- AI model calls
- Auth verification
- Data truth (all reads via Firestore SDK or server API)
- Matching decisions
- Report processing

---

### 4. Claude Code → Owns Integration, Hardening, Testing

Claude Code is the **integration brain** for this project. It owns:

| Responsibility | How |
|---------------|-----|
| Codebase-wide understanding | Full repo reads, dependency analysis |
| Security review | Identify exposed keys, unsafe patterns, XSS vectors |
| Type consolidation | Merge dual type files, resolve conflicts |
| Server route creation | Build Express API routes for AI proxy |
| Test creation | Vitest setup, unit tests for pure functions |
| Migration planning | Dependency-ordered implementation slices |
| PR-shaped diffs | Small, reviewable, rollback-safe changes |
| Prompt contract auditing | Verify system instructions align with canon |
| Dead code removal | Delete duplicates, stale generator artifacts |

Claude Code must **NOT** own:
- Product truth (comes from canon / user)
- Auth provider decisions (needs approval)
- Premium tier definitions (needs approval)
- Deployment platform choice (needs approval)
- Matching algorithm design (needs approval)

---

### 5. GitHub → Canonical Change Control

All meaningful change flows through Git:

| Artifact | Git Status |
|----------|-----------|
| Source code | Tracked, committed |
| Planning docs | Tracked under `docs/claude-import-refresh/` |
| Configuration | Tracked (except `.env*`) |
| Secrets | **Never tracked** — `.env*` gitignored |
| Test results | Via CI (when built) |
| PR reviews | GitHub native |

**Branch model:**
- `main` — stable, protected
- `claude/*` — Claude Code working branches
- Feature branches for approved slices

---

### 6. Kesher Canon → Owns Product Truth

The Kesher canon (from session operating prompts) is the final authority on:

- What Kesher is and is not
- Red lines (no attractiveness scores, no AI auto-send, no photo inference, etc.)
- Premium philosophy (refinement, not ransom)
- Trust posture (trust-forward, not growth-first)
- Discovery model (finite, intentional, not dopamine scroll)
- AI boundaries (assistive only, never impersonation)
- Cultural context (Hebrew-first, Israel-focused, Jewish values)

**No code change may override canon without explicit user approval.**

---

## Ownership Matrix Summary

| Layer | Owns | Does Not Own |
|-------|------|-------------|
| **AI Studio Export** | AI governance layer, design tokens, screen structure, type taxonomy | Auth, data, transport, matching, tests, deployment |
| **Server** | AI calls, auth validation, sensitive writes, rate limiting | UI rendering, animation, local state |
| **Client** | UI rendering, local state, animations, form state | API keys, AI calls, auth verification, matching logic |
| **Claude Code** | Integration, hardening, testing, security review, migration planning | Product truth, provider choices, premium definitions |
| **GitHub** | Change control, PRs, CI results, branch governance | Runtime state, secrets, deployment |
| **Kesher Canon** | Product identity, red lines, premium philosophy, trust posture, AI boundaries | Implementation details, library choices |
