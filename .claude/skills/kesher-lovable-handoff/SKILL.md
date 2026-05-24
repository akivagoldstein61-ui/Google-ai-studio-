# Kesher Lovable Handoff Skill for Claude Code

## Trigger

Use when Claude Code reviews, adapts, or integrates Lovable-originated Kesher code.

## Operating mode

Start in planning/read-only mode when possible. Do not edit files until the operator approves the plan.

## Procedure

1. Inspect generated code and canonical repo conventions.
2. Identify stack mismatch: Supabase greenfield, Firebase/Gemini continuity, hybrid/prototype bridge, or unknown.
3. Identify sensitive paths: auth, roles, profiles, messages, reports, moderation, AI prompts/routes, media/storage, deployment/secrets.
4. Flag frontend-only security, client secrets, missing negative tests, raw private data exposure, unsupported native iOS/PWA claims.
5. Draft minimal integration plan.
6. Ask for approval before edits.
7. After approval, make minimal diffs and run tests.
8. Produce PR-ready summary.
