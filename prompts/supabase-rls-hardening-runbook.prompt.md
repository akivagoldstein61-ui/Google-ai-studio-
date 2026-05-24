# Supabase/RLS Hardening Runbook for Kesher

Trigger: Use only when approved backend path is Supabase or when drafting migration options.

## Procedure

1. Inventory sensitive data: profile private fields, questionnaire answers, private taste profile, messages, blocks, reports, moderation actions, media/storage objects, billing/entitlement records.
2. Enable RLS on exposed tables.
3. Create bucket/path-scoped storage policies.
4. Use app-owned role claims or reviewed role tables. Do not use user-editable metadata for authorization.
5. Put report triage, block enforcement, match explanation generation, entitlement checks, moderation actions, and admin reads behind server/edge functions.
6. Keep service-role keys and secrets out of browser/client code.
7. Draft policy explanations in plain English.
8. Run negative tests: User A cannot read User B private data; blocked/unmatched users cannot send; regular users cannot access moderator/admin routes.
9. Record residual risks, rollback notes, and launch blockers.

Do not apply migrations or role changes without explicit human approval.
