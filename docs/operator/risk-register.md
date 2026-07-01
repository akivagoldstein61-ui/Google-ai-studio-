# Risk Register

| Risk | Severity | Evidence | Current Mitigation | Required Before Production |
|---|---:|---|---|---|
| Local prototype auth mode can allow unauthenticated AI routes if enabled in production | High | `AI_ROUTE_AUTH_MODE=prototype` bypasses AI route auth | Production default is `strict`; `.env.example` sets strict | Verify Vercel env does not override `AI_ROUTE_AUTH_MODE=prototype` and Firebase Admin initializes |
| Firestore security model needs end-to-end validation | High | `firestore.rules`, client writes in `AppContext`, server writes in `trustRoutes` | Owner/admin checks exist | Run emulator rules tests before real users |
| Missing Gemini key previously looked like validator success | Medium | `server/aiRoutes.ts` fallback handling | Contract test now asserts safe fallback metadata | Monitor config errors separately from schema success |
| AI fallback content can mask production outages | Medium | Many `/api/ai/*` catches return defaults | Metadata logs `fallback_used` | Alert on fallback rate and fail closed for high-risk routes |
| Prompt outputs may be schema-valid but semantically unsafe | High | Personality, compatibility, why-match, openers routes | `outputValidators` block prohibited language | Add fixtures/evals for deterministic claims, clinical claims, private-signal leaks |
| Maps/date planner may process overly precise locations | Medium | `DATE_PLANNER` prompt and route accept client params | Policy says coarse locations only | Validate/redact location inputs server-side |
| Admin screens are present without proven role gating | High | `AIOpsScreen`, `ExperimentsScreen`, settings navigation | Internal-only intent documented | Gate by admin role before production |
| Duplicate source-of-truth type files | Low | `src/types.ts`, `src/types/index.ts` | App imports canonical `src/types.ts` | Remove or reconcile unused file in a focused cleanup |
| Dependency vulnerabilities from current lockfile | Medium | `npm ci` reports 16 vulnerabilities | No dependency upgrades in this baseline | Triage `npm audit` in a separate approved PR |
| Large client bundle | Low | Vite build warns about >500 kB chunk | Build passes | Consider route-level code splitting later |
