# Data Protection Impact Assessment — Kesher Personality & AI Stack

> **Status:** v1.0 — closes Gate 7 (Claim Substantiation) and Gate 8 prerequisite
> **Owner:** @privacy-reviewers
> **Last reviewed:** 2026-05-08
> **Next review:** before any feature flips from `prototype_only` to `active`, and at least every 12 months

---

## 1. Project context

Kesher is a Hebrew-first dating app for serious Jewish singles in Israel. It collects identity, location, observance, and behavioral data, plus optional personality assessment scores. AI features generate Hebrew bio drafts, why-this-match explanations, compatibility reflections, and safety classifications.

This DPIA covers the **personality and AI stack only**. Standard account/profile data is covered by the general Privacy Notice.

---

## 2. Data flows

```
[ User device ]
    ↓ HTTPS + App Check + Firebase Auth (idToken)
[ Vercel Edge → /api/index serverless function ]
    ↓ requireAppCheck → requireAuth → requireUserRateLimit
    ├─→ Firestore (Tel Aviv me-west1) — profile, consents, cards
    └─→ Gemini API (Google) — system instruction + user content; no identity sent
            ↓ structured JSON response
        outputValidators → banned-copy linter → response to client
            ↓
        ai_route_metadata audit log → Vercel/Cloud Logging
```

No personality data leaves Israel except in the form of:
1. The **textual prompt** to Gemini (no uid, no email, no phone, no exact location)
2. The **encrypted backup** to Google Cloud (Tel Aviv region preferred, fall-back EU)

---

## 3. Risk assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Re-identification from personality scores | Low | Med | Scores never publicly displayed; share cards require mutual consent |
| Prompt-injection extracting other-user data | Low | High | Each call has its own session; no cross-user state in prompts |
| LLM hallucinated compatibility verdict | Med | High | `outputValidators` reject any banned phrase before response leaves server |
| Stolen Firebase API key abuse | Med | Med | Server-side only Gemini calls; App Check on client→server; per-user rate limits |
| Account takeover → personality data exfil | Low | High | 2FA via SMS (Firebase phone auth); audit log; rate limit on /personality/export |
| Mass-export by malicious admin | Low | High | Admin actions logged; quarterly access review |
| Cross-border transfer to non-adequate country | Low | Med | DPA with Google; SCCs; EU/IL region preference |
| Failure to honor deletion request | Low | High | `/personality/delete` endpoint; integration tests; audit log |
| Children using the service | Low | High | Age gate at onboarding; reporting flow; manual review |
| Gemini retention of inputs | Low | Med | Paid API tier confirmed not used for training; verify yearly |

---

## 4. Necessity & proportionality

**Personality scoring (IPIP):**
- Necessary? No — service works without it. Optional opt-in only.
- Proportionate? Scores are deterministic, never hidden-ranking, user-controlled.

**Why-this-match AI:**
- Necessary? Builds trust by surfacing reasoning for recommendations.
- Proportionate? Uses only whitelisted public signals (`WHY_MATCH_ALLOWED_SIGNALS`). Forbidden signals enforced by `outputValidators`.

**Compatibility reflection AI:**
- Necessary? Optional — replaces a problematic compatibility-score feature.
- Proportionate? Mutual consent (Gate 5); revocation cascades; signals are visible profile content only.

**Bio coach + values phrasing:**
- Necessary? Helps Hebrew expression — the differentiating product feature.
- Proportionate? Drafts only; no auto-send; no retention beyond user's own input.

---

## 5. Rights & controls evidence

| User right | Implementation | Evidence |
|---|---|---|
| Access | `/api/profile/personality/export` | `server/trustRoutes.ts:240` |
| Correction | Profile edit screens | `ProfileBuilder.tsx` |
| Deletion (personality) | `/api/profile/personality/delete` | `server/trustRoutes.ts:219` |
| Deletion (account) | `/api/account/delete-request` | `server/trustRoutes.ts:138` |
| Reset assessment | `/api/profile/personality/reset` | `server/trustRoutes.ts:199` |
| Withdraw consent | `/api/consent/revoke` | `server/consentRoutes.ts` |
| Export (machine-readable) | JSON download from `/personality/export` | Tested manually; QA scripted |
| Object | AI Trust Hub feature toggles | `src/features/settings/AITrustHub.tsx` |
| Complain | privacy@kesher.app + link to Israeli Privacy Authority | `PrivacyNoticeScreen.tsx` |

---

## 6. Compliance summary

| Regulation | Article / clause | Status |
|---|---|---|
| Israeli Protection of Privacy Law (Amendment 13) | Notice §11 | ✅ `PrivacyNoticeScreen.tsx` |
| Israeli Privacy Law — sensitive data | §17(1) | ✅ Granular opt-in for personality data |
| Israeli Privacy Law — DPO | Reg. 9 (Amendment 13) | ⏳ DPO appointment pending Gate 8 |
| Israeli Privacy Law — breach notification | §17AA | ✅ Procedure in `docs/operator/risk-register.md` |
| Israeli Privacy Law — registry | §8 | ⏳ Filing pending Gate 8 |
| GDPR (for EU residents) | Art. 35 (DPIA) | ✅ This document |
| GDPR | Art. 22 (automated decisions) | ✅ Section 5 above |

---

## 7. Sign-off (production prerequisite)

- [ ] Internal privacy reviewer: ____________  date: ____
- [ ] DPO: ____________  date: ____
- [ ] Israeli outside counsel: ____________  date: ____
- [ ] Engineering lead: ____________  date: ____

Until all four signatures are present, `claims/personality.yml` Gate 8 status remains `pending`.
