# Kesher Integrated App — Handoff Document

**Version:** 1.0.0-alpha  
**Built:** May 2026  
**Stack:** React 19 + Tailwind 4 + Express 4 + tRPC 11 + Drizzle ORM + MySQL/TiDB  
**Platform:** Manus Web App (hosted, auth, storage, LLM, notifications all built-in)

---

## 1. What Was Built

This is the full Kesher web application — a privacy-first, AI-assisted intentional-relationships platform for the Israeli and global Jewish market. It includes:

- **28 database tables** covering users, profiles, media, preferences, matches, conversations, messages, blocks, reports, moderation, audit, consents, privacy requests, skills, and AI governance
- **All tRPC routers**: profiles, matches, messages, blocks, safety, moderation, admin, consent, AI skills
- **10 AI skills** fully wired end-to-end (bio coach, why match, rephrase, safety scan, openers, date ideas, personality summary, pair insight, safety advice, moderation summary)
- **4 AI skills** in demo-safe placeholder state (profile completeness, private taste profile, pacing intervention, scam warning)
- **All frontend pages** across 4 roles: public visitor, authenticated member, moderator, admin
- **AI Trust Hub** with per-feature consent grant/revoke and grants ledger
- **Full block flow** with match invalidation and audit logging
- **Moderation queue** with AI-assisted draft summaries (human decision required)
- **Admin surfaces**: stats dashboard, user/role management, audit log, AI governance
- **18 Vitest tests** covering all critical paths

---

## 2. Architecture Overview

```
client/src/
  pages/          ← 28 page components
  components/     ← AppNav, DashboardLayout, AIChatBox, shadcn/ui
  contexts/       ← ThemeContext
  hooks/          ← useAuth, useMobile, useComposition
  lib/trpc.ts     ← tRPC client binding

server/
  routers.ts      ← All tRPC procedures (profiles, matches, messages, blocks, safety, moderation, admin, consent, ai)
  db.ts           ← All Drizzle query helpers
  _core/          ← Auth, LLM, storage, notifications, OAuth (DO NOT EDIT)

drizzle/
  schema.ts       ← 28-table schema

shared/
  skillRegistry.ts        ← Canonical 14-skill registry with full metadata
  connectorRegistry.ts    ← All external service integrations
  toolPolicyRegistry.ts   ← Per-skill allowed/prohibited signals and output constraints
  dataClassificationPolicy.ts ← Data field sensitivity tiers and legal bases
```

---

## 3. Role System

| Role | Access |
|---|---|
| `user` | All member pages, own data only |
| `moderator` | All member pages + /mod/* routes |
| `admin` | All routes including /admin/* |

To promote a user to moderator or admin, update the `role` field in the `users` table via the Database panel in the Manus Management UI.

---

## 4. AI Skills Summary

| Slug | Status | Consent Required | Role |
|---|---|---|---|
| bio-coach | Working | No | user+ |
| profile-completeness | Demo-safe | No | user+ |
| private-taste-profile | Demo-safe | No | user+ |
| why-match | Working | No | user+ |
| message-safety-scan | Working | No | user+ |
| rephrase | Working | No | user+ |
| openers | Working | No | user+ |
| date-ideas | Working | No | user+ |
| personality-summary | Working | No | user+ |
| pair-insight | Working | **Yes** | user+ |
| pacing-intervention | Demo-safe | No | user+ |
| safety-advice | Working | No | user+ |
| scam-warning | Demo-safe | No | user+ |
| moderation-summary | Working | No | moderator+ |

All AI calls are **server-side only** via `invokeLLM()`. No API keys are exposed to the frontend.

---

## 5. Privacy and Consent Architecture

### Consent Gate
- `user_consents` table tracks per-user, per-feature consent with timestamps
- `consent.grantConsent` / `consent.revokeConsent` tRPC mutations
- `getConsentByFeature()` DB helper used in AI procedures to enforce consent server-side
- Trust Hub (`/trust`) provides full grants ledger UI

### Data Rights
- **Export**: `consent.exportData` returns all user data as JSON
- **Delete AI data**: `consent.deleteAIData` clears skill outputs and consents
- **Delete account**: `consent.deleteAccount` removes all user data

### Israeli Privacy Law Alignment
- Religious observance (`observance` field) classified as **special category** — requires explicit consent
- Profile photos classified as **biometric data** — photo moderation provider blocked until DPA signed
- Consent audit trail (`user_consents`) retained 5 years per legal obligation
- Audit log retained 2 years

---

## 6. Blocked Features (Require External Provider Setup)

| Feature | Blocker | Action Required |
|---|---|---|
| Photo moderation | No provider selected | Select AWS Rekognition / Sightengine / Hive, sign DPA, set `PHOTO_MOD_API_KEY` |
| Identity verification | No provider selected | Select Onfido / Persona / AU10TIX, sign DPA, review biometric rules |
| Stripe payments | Not integrated | Run `webdev_add_feature stripe` in Manus |
| Scam warning (full) | Needs message history analysis | Implement server-side pattern detection |
| Pacing intervention (full) | Needs message history analysis | Implement server-side escalation detection |

---

## 7. Environment Variables

All secrets are injected by the Manus platform. See `server/_core/env.ts` for the full list. Additional secrets needed:

| Variable | Purpose | Status |
|---|---|---|
| `PHOTO_MOD_API_KEY` | Photo moderation | Blocked |
| `PHOTO_MOD_API_URL` | Photo moderation | Blocked |
| `IDENTITY_VERIFY_API_KEY` | Identity verification | Blocked |
| `STRIPE_SECRET_KEY` | Payments | Placeholder |
| `STRIPE_WEBHOOK_SECRET` | Payments | Placeholder |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Payments | Placeholder |

---

## 8. GitHub Repo

The selected GitHub integration repo is: `akivagoldstein61-ui/Google-ai-studio-`

To export this codebase to GitHub, use the **GitHub** panel in the Manus Management UI Settings → GitHub.

Related Kesher repos in the same account:
- `akivagoldstein61-ui/kesher` — original prototype
- `akivagoldstein61-ui/kesher-connect-00` — earlier integration attempt
- `akivagoldstein61-ui/kesher-skills-bundle` — skills bundle

---

## 9. Known Gaps and Next Steps

### High Priority
1. **Block UI in chat and profile pages** — block router is wired, UI entry points need to be added to ChatThread and MatchDetail pages
2. **Consent history log UI** — data is in DB, UI page pending
3. **Appeal flow UI** — `appeals` table exists, UI pending
4. **Profile completeness** — deterministic computation (no LLM needed), straightforward to implement
5. **Self-hosting Google Fonts** — for full privacy compliance, fonts should be served locally

### Medium Priority
6. **Paging / infinite scroll** on Explore and Inbox
7. **Real-time messaging** — currently poll-based; consider WebSocket upgrade
8. **Push notifications** — Manus notification API is wired for owner; user push notifications need separate integration
9. **Hebrew RTL** — applied to member pages; verify all edge cases with native Hebrew speakers
10. **Accessibility audit** — keyboard navigation, ARIA labels, screen reader testing

### Low Priority
11. **Dark mode** — ThemeProvider supports it; CSS variables are defined; toggle UI not exposed
12. **Admin policy config page** — `/admin/policy` route placeholder
13. **System health page** — `/admin/health` route placeholder

---

## 10. Test Coverage

| Test | File | Status |
|---|---|---|
| Auth logout | server/auth.logout.test.ts | ✅ |
| profiles.get | server/kesher.test.ts | ✅ |
| profiles.update | server/kesher.test.ts | ✅ |
| matches.getDailyPicks | server/kesher.test.ts | ✅ |
| matches.like | server/kesher.test.ts | ✅ |
| messages.getConversation | server/kesher.test.ts | ✅ |
| consent.getConsents | server/kesher.test.ts | ✅ |
| consent.grantConsent | server/kesher.test.ts | ✅ |
| consent.revokeConsent | server/kesher.test.ts | ✅ |
| admin.getStats (admin) | server/kesher.test.ts | ✅ |
| admin.getStats (user — FORBIDDEN) | server/kesher.test.ts | ✅ |
| moderation.getQueue (moderator) | server/kesher.test.ts | ✅ |
| moderation.getQueue (user — FORBIDDEN) | server/kesher.test.ts | ✅ |
| ai.bioCoach | server/kesher.test.ts | ✅ |
| safety.submitReport | server/kesher.test.ts | ✅ |
| blocks.block | server/kesher.test.ts | ✅ |
| blocks.unblock | server/kesher.test.ts | ✅ |
| blocks.list | server/kesher.test.ts | ✅ |

---

## 11. Publish Checklist

Before publishing to production:

- [ ] Verify all environment variables are set in Manus Secrets panel
- [ ] Promote at least one user to `admin` role via Database panel
- [ ] Review and accept Google Fonts privacy implications (or self-host)
- [ ] Review Israeli Privacy Protection Law notice requirements for the consent screens
- [ ] Test auth flow end-to-end in a fresh browser session
- [ ] Test block flow: block a user, verify match is invalidated
- [ ] Test moderation queue: submit a report, verify it appears in /mod/queue
- [ ] Test AI Trust Hub: grant and revoke consent for bio-coach
- [ ] Test data export: verify exported JSON contains all user data
- [ ] Test account deletion: verify all user data is removed
- [ ] Run `pnpm test` — all 18 tests must pass
- [ ] Run `pnpm check` — zero TypeScript errors
- [ ] Create checkpoint in Manus Management UI
- [ ] Click Publish in Manus Management UI

---

## 12. Skill Registry Files

All registry artifacts are in `shared/`:

| File | Purpose |
|---|---|
| `skillRegistry.ts` | 14 AI skills with full metadata, I/O contracts, acceptance criteria |
| `connectorRegistry.ts` | 9 external service connectors with privacy and legal metadata |
| `toolPolicyRegistry.ts` | Per-skill allowed/prohibited signals and output constraints |
| `dataClassificationPolicy.ts` | All data fields with sensitivity tiers and legal bases |

These files are TypeScript-typed and can be imported anywhere in the codebase. They also serve as the canonical governance documentation for the Kesher AI runtime.
