# Lovable Kesher Preflight Checklist

Trigger: Use before any Lovable task that could create code, data, deployment, or repo side effects.

Before acting, classify:

1. Phase: planning, implementation, verification, publish, GitHub handoff, mobile/PWA handoff.
2. Lovable surface: Plan Mode, Agent Mode, Visual Edits, Code Mode, Browser Testing, Security View, Publish.
3. Backend path: greenfield Lovable + native Supabase, Lovable Cloud, existing Firebase/Gemini repo continuity, hybrid/prototype bridge, UNKNOWN.
4. Data handling: synthetic only, redacted only, no production PII, no real messages/photos/reports, no secrets/tokens/service-role keys.
5. Side effects requested: create backend, apply migration, connect GitHub, publish URL, set custom domain, configure billing, package mobile, change auth/roles.
6. Approval required: human approval before side effects, security approval before launch, repo-owner approval before sync, release approval before beta/production.

If workspace plan, privacy settings, backend, repo sync behavior, deployment target, or mobile claim is unknown, mark `VALIDATE FIRST` and do not proceed with side-effecting actions.
