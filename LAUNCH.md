# Kesher — Launch Runbook

> Single page that takes you from "code committed locally" → "production live in Israel."
> Every step is **doable today** — the only blocker before flipping the switch is Gate 8 (counsel sign-off).

---

## TL;DR

```bash
# 1. Push code to GitHub
git push origin feat/learned-taste-ranking-integration
gh pr create --base main --title "Production-ready stack"
gh pr merge --merge

# 2. Tag a release (triggers release-gate CI)
git tag v1.0.0 -m "v1.0.0 — production launch"
git push origin v1.0.0

# 3. Set production env vars in Vercel (one-time)
#    Use .env.production.example as the template

# 4. Vercel auto-deploys. Verify:
curl -fsSL https://google-ai-studio-sage-sigma.vercel.app/api/health/ready
node scripts/smoke-production.mjs

# 5. Flip claims/personality.yml gates as counsel signs off
#    Then merge to main → instant prod refresh
```

---

## Pre-merge checklist

- [ ] All 3 commits on `feat/learned-taste-ranking-integration` reviewed
- [ ] CI green: `npm run lint:claims` + every workflow in `.github/workflows/`
- [ ] DPIA reviewed: `docs/privacy/dpia.md`
- [ ] IPIP decision memo signed: `docs/adr/0005-ipip-instrument-decision.md`
- [ ] Substantiation matrix current: `claims/substantiation-matrix.md`
- [ ] Israeli counsel scheduled for Gate 8 review

---

## Vercel environment variables

Set these in **Vercel → Project → Settings → Environment Variables → Production**:

| Variable | Where to get it |
|----------|-----------------|
| `GEMINI_API_KEY` | Google AI Studio → API Keys → paid tier |
| `FIREBASE_PROJECT_ID` | `gen-lang-client-0904321862` |
| `FIREBASE_CLIENT_EMAIL` | Firebase console → Project Settings → Service accounts → Generate key |
| `FIREBASE_PRIVATE_KEY` | (same — base64 the JSON's private_key, or paste with `\n` escapes) |
| `FIREBASE_APP_CHECK_ENABLED` | `"true"` |
| `AI_ROUTE_AUTH_MODE` | `"production"` |
| `RATE_LIMIT_BACKEND` | `"firestore"` |
| `VITE_RECAPTCHA_ENTERPRISE_KEY` | Google Cloud → reCAPTCHA Enterprise → Create site key for App Check |
| `VITE_PROTOTYPE_DEMO_MODE` | `"false"` |
| `NODE_ENV` | `"production"` |
| `VITE_SENTRY_DSN` _(optional)_ | Sentry → Project → Settings → Client Keys |
| `SENTRY_DSN` _(optional)_ | (same) |

Reference the full template: `.env.production.example`.

---

## Firebase one-time setup

```bash
# Install firebase-tools and sign in
npm i -g firebase-tools
firebase login

# Deploy security rules (matches firestore.rules in repo)
firebase deploy --only firestore:rules

# Enable App Check in console:
#   Firebase console → App Check → Apps → register web app
#   → ReCaptcha Enterprise → paste your site key
#   → Enforce on Firestore + Auth

# Add authorized domains:
#   Firebase console → Authentication → Settings → Authorized domains
#   → add: google-ai-studio-sage-sigma.vercel.app
#   → add any custom domain you'll use

# Configure backups:
#   Firebase console → Firestore → Backups → daily, 30-day retention
```

---

## Day-of launch

```bash
# 1. Confirm release CI green
gh run list --workflow=release.yml --limit 1
# Expect: completed/success on tag v1.0.0

# 2. Promote main → production (Vercel auto-deploys main pushes;
#    if you use a branch-protected production env, promote manually)

# 3. Smoke-test production
node scripts/smoke-production.mjs --strict

# 4. Manual QA — 15-minute checklist
#    a. Open https://google-ai-studio-sage-sigma.vercel.app in incognito
#    b. Phone sign-in → completes in <30s
#    c. Onboarding: ToS screen renders → Privacy notice screen renders →
#       three checkboxes required → continue
#    d. Profile builder: photo upload, prompts, IPIP assessment (20 items)
#    e. Daily Picks: cards render, "Why this match" returns reasons,
#       no "soulmate" / "perfect match" / "% match" anywhere
#    f. Bio coach: drafts only, no auto-send
#    g. Values phrasing: 3-6 Hebrew options, RTL renders correctly
#    h. Match → mutual consent sheet → grant → reflection card renders
#    i. Settings → AI Trust Hub → toggle a feature off → confirm
#    j. Settings → Personality data → Export (downloads JSON)
#    k. Settings → Personality data → Delete → confirms → goes back

# 5. Watch for first hour
#    - Vercel logs: error rate < 1%
#    - Firebase Auth: sign-in success > 95%
#    - Gemini API console: cost < $5/hour
#    - Sentry (if enabled): no sustained error spikes
```

---

## Gate-8 sign-off procedure

Once Israeli counsel has reviewed:

1. Counsel signs the four signature blocks in `docs/privacy/dpia.md` §7
2. Counsel signs the privacy notice copy: `src/features/onboarding/PrivacyNoticeScreen.tsx`
3. Open a PR that:
   - Updates `claims/personality.yml` → `gate_8_legal_counsel: passing`
   - Flips `CL-001`, `CL-003`, `CL-P001`, `CL-P002` to `status: active`
4. CI's `lint-claims-registry.mjs` will re-validate that all gates these claims depend on are now `passing`
5. Merge → claims become live in production

---

## Rollback

```bash
# Instant: Vercel UI → Deployments → previous → Promote
vercel rollback https://google-ai-studio-sage-sigma.vercel.app

# Or revert the merge commit:
git revert -m 1 <merge-sha>
git push origin main
# Vercel auto-deploys the revert
```

If a personality-stack issue is discovered post-launch:

1. Immediately set `claims/personality.yml` status of affected claim → `incident_disabled`
2. Disable the feature toggle in `AITrustHub.tsx` default
3. Open postmortem: `docs/operator/risk-register.md`

---

## Steady-state operations

| Cadence | Task |
|---------|------|
| Per request | App Check + Auth + Rate limit (automatic) |
| Per response | Banned-copy validator + audit log (automatic) |
| Daily | Cost dashboard review (Gemini), error rate, 429 rate |
| Weekly | `npm run redteam:personality` against current prompts |
| Monthly | Substantiation matrix review (`claims/substantiation-matrix.md`) |
| Quarterly | DPIA re-review (`docs/privacy/dpia.md`) |
| Quarterly | Penetration test cycle if any feature changed |
| Annually | Counsel re-review of privacy notice |

---

## Help

- Engineering: see `AGENTS.md` for repo conventions and code-owner map
- Privacy: privacy@kesher.app
- Incidents: see `docs/operator/risk-register.md`
- Production checklist: `docs/deployment/production-checklist.md`
