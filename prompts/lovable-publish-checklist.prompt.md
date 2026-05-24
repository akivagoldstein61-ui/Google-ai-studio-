# Lovable Publish Checklist - Kesher

Before publishing:

- Approved bounded slice only.
- No unsupported native iOS/PWA claims.
- Synthetic/redacted data only.
- No production PII in prompts or seed data.
- No secrets in client code.
- Browser Testing passed for core flows.
- Frontend, backend, RLS/Firestore/storage/media negative tests run as applicable.
- Report/block/moderation access tested.
- Match explanation privacy tested.
- Security View reviewed.
- No unexplained critical/high findings.
- Publish to non-production URL first.

Decision: `HOLD` / `NON-PRODUCTION PUBLISH ONLY` / `READY FOR PR HANDOFF` / `READY FOR BETA REVIEW`.
