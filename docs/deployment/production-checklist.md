# Kesher — Production Deployment Checklist

> **Repo:** https://github.com/akivagoldstein61-ui/Google-ai-studio-
> **Stable URL:** https://google-ai-studio-sage-sigma.vercel.app

---

## Phase 0 — Pre-flight (one-time)

| # | Task | Owner | Status |
|---|------|-------|--------|
| 0.1 | Confirm GitHub repo access (collaborators, branch protection) | @owner | ⬜ |
| 0.2 | Confirm Vercel project linked to repo | @owner | ⬜ |
| 0.3 | Confirm Firebase project (`gen-lang-client-0904321862`) | @owner | ⬜ |
| 0.4 | Confirm Google AI Studio API key (paid tier — no training on inputs) | @owner | ⬜ |
| 0.5 | Review `claims/personality.yml` — all `active` claims gate-cleared | @reviewers | ⬜ |
| 0.6 | Israeli privacy counsel engaged (Gate 8) | @legal | ⬜ |
| 0.7 | DPA signed with Google, Vercel, Firebase | @legal | ⬜ |

---

## Phase 1 — Environment variables

These must be set in **Vercel → Project Settings → Environment Variables** (Production scope):

### Required (production)
| Var | Where it's used | Sensitive |
|---|---|---|
| `GEMINI_API_KEY` | server/aiRoutes.ts | 🔒 |
| `FIREBASE_PROJECT_ID` | firebase-admin init | |
| `FIREBASE_CLIENT_EMAIL` | service-account auth | 🔒 |
| `FIREBASE_PRIVATE_KEY` | service-account auth | 🔒 |
| `FIREBASE_APP_CHECK_ENABLED` | `"true"` to enforce App Check | |
| `AI_ROUTE_AUTH_MODE` | `"production"` to require Auth + App Check | |
| `NODE_ENV` | `"production"` | |
| `DATABASE_MODE` | `"firestore"` (or `"neon"` if Postgres backed) | |
| `DATABASE_URL` | Neon connection string (if used) | 🔒 |
| `VITE_PROTOTYPE_DEMO_MODE` | `"false"` in production | |

### Optional but recommended
| Var | Purpose |
|---|---|
| `SENTRY_DSN` | Server-side error tracking |
| `ANALYTICS_KEY` | Aggregate analytics (no PII) |
| `RATE_LIMIT_REDIS_URL` | Multi-instance per-user rate limiting |

---

## Phase 2 — Firebase configuration

| # | Task | Verify by |
|---|------|-----------|
| 2.1 | Enable Firebase Authentication providers (Phone, Google) | Firebase console → Auth |
| 2.2 | Configure authorized domains: production URL + preview URLs | Firebase console → Auth → Settings |
| 2.3 | Deploy `firestore.rules` (this repo) | `firebase deploy --only firestore:rules` |
| 2.4 | Enable Firebase App Check with reCAPTCHA Enterprise (web) and DeviceCheck/AppAttest (iOS) | Firebase console → App Check |
| 2.5 | Confirm Firestore indexes for queries | Run app, check console for missing-index warnings |
| 2.6 | Set up backup schedule (daily) | Firebase console → Firestore → Backups |

---

## Phase 3 — CI/CD gates

All must pass on the production branch before merge:

```bash
npm run lint:claims              # Banned-copy linter + claim registry validation
npm run scan:forbidden-fields    # No forbidden personality fields in code
npm run test:rtl                 # Hebrew RTL render snapshots match
npm run test:schemas             # Personality schemas validate
npm run test:scoring             # Deterministic scoring pipeline correct
npm run typecheck                # Zero TS errors
npm run redteam:personality      # Red-team prompts produce no violations
```

CI workflows that must be green:

| Workflow | File |
|----------|------|
| Personality CI | `.github/workflows/personality-ci.yml` |
| Schema validation | `.github/workflows/schema-validation.yml` |
| RTL snapshots | `.github/workflows/rtl-snapshots.yml` |
| Red-team | `.github/workflows/redteam-personality.yml` |
| Preview verification | `.github/workflows/preview-verification.yml` |
| Deploy | `.github/workflows/deploy.yml` |

---

## Phase 4 — Release gates (claims/personality.yml)

Before ANY personality-stack feature flips from `prototype_only` to `active`:

| Gate | Description | Owner |
|------|-------------|-------|
| Gate 1 | Privacy & consent (export/delete/reset working) | @privacy-reviewers |
| Gate 2 | Forbidden patterns scan passes | @safety-reviewers |
| Gate 3 | Psychometric integrity (IPIP decision memo signed) | @personality-reviewers |
| Gate 4 | Hebrew RTL passes Bidi stress tests | @localization |
| Gate 5 | Mutual consent flow live (`server/consentRoutes.ts`) | @privacy-reviewers |
| Gate 6 | Leakage red-team (`scripts/redteam-personality.mjs`) clean | @safety-reviewers |
| Gate 7 | Claim substantiation matrix complete | @personality-reviewers |
| Gate 8 | Israeli counsel sign-off (Amendment 13) | @legal |

`scripts/lint-claims-registry.mjs` enforces this in CI — any `active` claim depending on a `pending` gate fails the build.

---

## Phase 5 — Day-of deployment

```bash
# 1. Final main-branch CI green
gh pr list --state open                           # confirm nothing pending
gh run list --workflow=personality-ci.yml --limit 5

# 2. Tag the release
git tag v1.0.0 -m "Production release v1.0.0"
git push origin v1.0.0

# 3. Vercel auto-deploys main → production. Confirm:
curl -fsSL https://google-ai-studio-sage-sigma.vercel.app/api/health
curl -fsSL https://google-ai-studio-sage-sigma.vercel.app/api/health/ready

# 4. Smoke-test core paths
npm run smoke:deployment

# 5. Manual QA
#    - Sign-in flow (phone + Google)
#    - Profile creation
#    - Personality assessment (IPIP)
#    - Daily Picks (cards render with intro + why-this-match)
#    - Bio coach (drafts only, no auto-send)
#    - Values phrasing coach
#    - Safety center (cited answers)
#    - AI Trust Hub controls toggle
#    - Personality data export (JSON downloads)
#    - Personality data delete (confirms then clears)

# 6. Monitor for 1 hour
#    - Vercel Logs → no 5xx spikes
#    - Firebase Auth → no failed-sign-in spike
#    - Gemini API console → quota/cost normal
```

---

## Phase 6 — Rollback procedure

If anything goes wrong in the first hour:

```bash
# Instant: redirect production back to last known good deploy in Vercel UI
# CLI alternative:
vercel rollback https://google-ai-studio-sage-sigma.vercel.app

# Revert the merge if a code issue:
git revert <merge-commit>
git push origin main
# Vercel auto-deploys the revert
```

If a personality-stack issue is found in production:
1. Disable the feature in `AITrustHub.tsx` (default-enabled toggle, ~5 min hot-deploy)
2. Update `claims/personality.yml` status to `incident_disabled`
3. Open a postmortem — see `docs/operator/risk-register.md`

---

## Phase 7 — Steady-state monitoring

Daily:
- Cost dashboard (Gemini API)
- Error rate (Vercel Logs / Sentry)
- Auth failure rate (Firebase Auth)
- Rate-limit 429 rate (per `userRateLimit.ts`)

Weekly:
- Run `npm run redteam:personality` against current prompts
- Review `claims/personality.yml` for new pending claims
- Audit log review (5% sample)

Monthly:
- DPIA review
- Pen-test cycle if features changed
- Consent revocation rate (high rate = bad onboarding copy)
