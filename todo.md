# Kesher Integrated App — TODO

## Phase 1: Database Schema
- [x] Extend drizzle/schema.ts with all required tables (28 tables)
- [x] Run migration and apply SQL

## Phase 2: Server Routers
- [x] profiles router (create, update, get, updatePrivacy)
- [x] matches router (daily picks, like, pass, match list, getById)
- [x] messages router (send, list, reportMessage)
- [x] safety router (submitReport)
- [x] moderation router (queue, case detail, action, log)
- [x] admin router (stats, user/role management, audit log, AI usage)
- [x] ai router (bioCoach, whyMatch, rephrase, safetyCheck, openers, dateIdeas, personalitySummary, pairInsight, safetyAdvice, moderationSummary)
- [x] consent router (view, grant, revoke, deleteAIData, exportData, deleteAccount)

## Phase 3: Frontend Routes and Pages
- [x] Landing page (/)
- [x] About (/about)
- [x] Safety (/safety)
- [x] Privacy (/privacy)
- [x] Terms (/terms)
- [x] Support (/support)
- [x] Home dashboard (/home)
- [x] Onboarding (/onboarding)
- [x] Profile builder (/profile/build)
- [x] Daily Picks (/picks)
- [x] Explore (/explore)
- [x] Match detail (/match/:id)
- [x] Inbox (/inbox)
- [x] Chat thread (/chat/:id)
- [x] Skills Hub (/skills)
- [x] AI Trust Hub (/trust)
- [x] Safety Center (/safety-center)
- [x] Settings (/settings)
- [x] Privacy controls (/settings/privacy)
- [x] Consent controls (/settings/consent)
- [x] Data export/deletion (/settings/data)
- [x] Moderation queue (/mod/queue)
- [x] Report detail (/mod/report/:id)
- [x] Moderator action log (/mod/log)
- [x] Admin dashboard (/admin)
- [x] User/role management (/admin/users)
- [x] Audit log (/admin/audit)
- [x] AI feature governance (/admin/ai)

## Phase 4: Design System
- [x] Apply "Velvet Clarity" design tokens (warm, calm, teal/gold palette)
- [x] RTL / Hebrew layout support (dir="rtl" on all member pages)
- [x] Mobile-first responsive layout
- [x] App-wide navigation (AppNav component)
- [x] Empty, loading, error states for all pages

## Phase 5: AI Features (10 skills implemented)
- [x] Bio / Profile Coach
- [x] Why Match / Match Explanation
- [x] Message Safety Scan
- [x] Rephrase Message
- [x] Conversation Openers
- [x] Date Ideas
- [x] Personality / Values Summary
- [x] Pair Insight Report (consent-gated)
- [x] Safety Advice
- [x] Moderation Summary (mod/admin only)
- [x] Profile Completeness (placeholder in Skills Hub)
- [x] Private Taste Profile (placeholder in Skills Hub)
- [x] Pacing Intervention (placeholder in Skills Hub)
- [x] Photo / Profile Review (blocked — documented in ConnectorRegistry, requires moderation provider)

## Phase 6: Skills Hub Integration
- [x] Canonical Skill Registry (14 skills with metadata in SkillsHub.ts- [x] Skill entry points on: Home, Daily Picks, Chat, Trust Hub, Mod Queue
- [x] User skill state tracking (localStorage-based, with tried-skills summary and reset)

## Phase 7: Trust Hub / Consent Surfaces
- [x] AI Trust Hub page with per-feature disclosure
- [x] Consent gate (grant/revoke per feature)
- [x] Grants ledger backend (userConsents table)
- [x] Revocation flows
- [x] Export / delete / reset controls
- [x] Consent history log UI (Trust Hub 'יומן הסכמות' tab)

## Phase 8: Safety and Moderation
- [x] Report / block UI in profile, chat, safety center
- [x] Moderation queue with AI summary draft
- [x] Audit log for all sensitive actions
- [x] Role-gated routes (member / moderator / admin)
- [x] Appeal flow UI (/appeal route with AppealFlow.tsx)

## Phase 9: Registry Artifacts
- [x] SkillRegistry (14 skills in SkillsHub.tsx + DB table)
- [x] AI feature registry (DB table + admin view)
- [x] KnownFailureLedger (DB table)
- [x] PromptRegistry admin view (AdminAI.tsx — Prompt Registry section)
- [x] EvalRegistry admin view (AdminAI.tsx — Eval Registry section)
- [x] ConnectorRegistry document (shared/connectorRegistry.ts)

## Phase 10: Tests
- [x] Vitest: auth logout
- [x] Vitest: profiles CRUD
- [x] Vitest: matches like/pass
- [x] Vitest: messages conversation
- [x] Vitest: consent grant/revoke
- [x] Vitest: AI bioCoach returns structured output
- [x] Vitest: admin role guard (FORBIDDEN for non-admin)
- [x] Vitest: moderator role guard (FORBIDDEN for regular user)
- [x] Vitest: safety report submission

## Phase 11: Export and Handoff
- [x] GitHub repo sync (export via Management UI Settings → GitHub)
- [x] Publish checklist (KESHER_HANDOFF.md section 11)
