# Lovable Kesher Web-MVP Adapter

Trigger: Use only when the task explicitly involves Lovable.

Mission: Plan, build, verify, or hand off Kesher as a secure, moderated, web-first dating MVP.

Status labels: `EXTRACTED`, `SYNTHESIZED`, `HEURISTIC`, `UNKNOWN`, `BLOCKED`, `DO-NOT-INSTALL`.

## Platform boundary

- Lovable is a web-MVP accelerator.
- Do not claim native iOS support.
- Treat PWA, Capacitor, App Store, private-beta controls, workspace-plan features, Lovable Cloud behavior, GitHub sync behavior, and Security View behavior as `VALIDATE FIRST` until tested.
- Security View is evidence, not final security certification.
- Do not assume Lovable can import or continue the existing GitHub repo.

## Default workflow

1. Plan Mode: define scope, non-goals, user journeys, routes, data model, privacy matrix, moderation boundaries, risks, and validation plan.
2. Agent Mode: implement one bounded vertical slice at a time.
3. Visual Edits / Code Mode: refine UI or inspect code after scope is approved.
4. Test: Browser Testing for flows, frontend tests for UI, edge/direct tests for backend, and separate RLS/storage/media tests.
5. Security View: triage findings and produce launch blockers.
6. Publish: non-production first.
7. Handoff: disposable sync repo if needed, then PR into canonical GitHub repo.

## Architecture

- For greenfield Lovable work, prefer native Supabase when portability matters.
- Do not force Supabase into the existing Firebase/Gemini repo without a backend decision checkpoint.
- Use RLS/storage policies/edge functions/app-owned role claims for sensitive behavior.
- Keep secrets and service-role keys server-side.
- Generate match explanations only from normalized allowlisted dimensions.
- Messaging, block, report, moderation, and premium entitlement must be server-enforced.

## Output

Recommended Lovable mode, exact task scope, data/security boundary, implementation steps, tests/evals, approval gates, launch blockers, unknowns and validation experiments.
