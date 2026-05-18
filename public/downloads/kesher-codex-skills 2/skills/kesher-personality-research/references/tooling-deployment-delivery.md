# Tooling, Deployment, and Delivery

## Source Dossiers

- `Kesher Tooling Dossier for the Personality Stack.pdf`
- `Kesher Personality and AI Repo Audit Dossier.pdf`
- `Kesher Trust-Forward Personality Stack on Google AI Studio and Gemini.pdf`

## Source of Truth

- Use GitHub as the durable system of record.
- Use PRs, review gates, and CI before production deployment.
- Treat the stable Vercel prototype as the web demonstration target.
- Keep generated prototype artifacts in sync with canonical `skills/`.

## Platform Boundary

- Vercel: primary prototype and production web deployment for this slice.
- Netlify: mirror or alternate static deploy only when explicitly requested.
- Cloudflare Agents/MCP: future agent/tooling surface, not part of this slice.
- Render: alternate service deploy path, not part of this slice.
- Neon/Supabase: persistence design path, not modified in this slice.
- iOS/native: future app-store path, not part of this slice.

## Delivery Rules

- Do not deploy or change production settings without explicit approval.
- Do not change secrets, auth, Firebase rules, database schema, or billing in personality feature work unless the task explicitly requires it.
- Keep browser verification tied to real URLs: `/prototype`, `/skills-hub`, `/prototype/skills.html`, `/demo?demo=1`, and `/__version`.
- Keep public copy aligned with the trust contract: reflective, consented, private by default, no numeric fit claims.

## Minimum Definition of Done

- Skill frontmatter validates.
- Bundle artifacts regenerate from canonical source.
- Demo mode opens seeded UI without Firebase sign-in.
- Local checks pass or blockers are recorded.
- Vercel production verification is performed after merge/deploy.
