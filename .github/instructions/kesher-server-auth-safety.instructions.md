---
applyTo: "server/**/*.{ts,js},firestore.rules,src/services/authFetch.ts"
---

# Kesher Server Auth & Safety Conventions

## Canonical Server Files

| File | Purpose |
|------|---------|
| `server.ts` | Express entry point, route mounting |
| `server/aiRoutes.ts` | 11 AI proxy routes; must stay server-side only |
| `server/authMiddleware.ts` | Firebase Admin token verification |
| `server/trustRoutes.ts` | Report / block / unmatch / delete / privacy / personality paths |
| `firestore.rules` | Firestore security rules |
| `src/services/authFetch.ts` | Client-side Firebase ID token attachment |

## Auth Rules

- Every `/api/ai/*` route must be behind `authMiddleware` in production
- `AI_ROUTE_AUTH_MODE=prototype` bypasses auth for local testing only — never enable in production
- Firebase Admin SDK is the only server-side auth verifier; never trust client-provided UIDs directly
- Bearer token must be validated on every state-changing request
- Do not expose service account keys, Firebase Admin credentials, or `GEMINI_API_KEY` through any API response, log, or client bundle

## Server Boundary Rules

- `GEMINI_API_KEY` lives in server env only; never in `VITE_*`, never in any file that Vite processes
- Client-visible API surfaces return shaped data only; never raw Gemini responses
- Protected actions (report, block, unmatch, delete, privacy reset) must be enforced server-side
- Do not rely on UI-only enforcement for any moderation or account-lifecycle action

## Firestore Rules (`firestore.rules`)

- Users may only read/write their own documents unless explicitly shared
- Report and block records are write-once for the reporting user; unreadable by the reported user
- Admin reads require a verified admin claim; never grant admin via client-side logic
- Match documents: both participants may read; neither may directly write match status (server-side only)

## AI Route Conventions (`server/aiRoutes.ts`)

- Feature ID is validated against the server-side `AI_FEATURE_REGISTRY` allowlist
- Unknown or unlisted feature IDs return `400` — not a fallback Gemini call
- Model routing is determined by `capabilityRouter` on the server; client cannot specify a model
- Structured output is validated by `outputValidators` before returning to client
- `STRICT_DATING` safety thresholds from `src/ai/policies.ts` apply to all Gemini calls

## Sensitive Data — Never Log

- User IDs in combination with message content
- Exact geolocation or home neighborhood
- Religious observance, sexual orientation, health information, or other Amendment 13 sensitive fields
- Full prompt text sent to Gemini
- Firebase tokens or any credential fragment

## Validation

```bash
npm run scan:forbidden-fields   # check for disallowed field access patterns
npm run scan:logs               # check for PII/secret patterns in log statements
npm run test                    # server-side unit tests
npm run build                   # confirms no server-side type errors
```

For Firestore rule testing: use Firebase Emulator Suite locally.
Never test auth bypass paths against the production Firestore instance.
