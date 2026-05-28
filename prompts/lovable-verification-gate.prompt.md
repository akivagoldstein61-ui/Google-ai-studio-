# Lovable Kesher Verification Gate

Trigger: Use before beta, publish, custom domain, repo handoff, or launch claim.

## Required checks

1. Browser Testing: signup, onboarding, profile creation, preferences, match list, messaging, report/block, moderation route access, mobile layout.
2. Frontend tests: questionnaire rendering, privacy toggles, conditional UI, protected route behavior.
3. Edge/direct backend tests: match explanation, report creation, block enforcement, entitlement checks if present.
4. Data isolation tests: User A/User B private data isolation, unauthorized report reads fail, unauthorized moderation reads fail.
5. Media/storage tests: user can upload only to allowed location, cannot overwrite another user's media, unauthorized direct reads fail.
6. Security View: RLS findings, database security findings, code security findings, dependency findings.

## Output

Pass/fail matrix, evidence notes, critical/high findings, launch blockers, accepted risks, follow-up tasks.

Security View is evidence, not final security review. Production or beta expansion requires human approval.
