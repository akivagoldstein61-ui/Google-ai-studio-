# ADR 0005 — IPIP Short Form as the production personality instrument

**Status:** Accepted (closes Gate 3)
**Date:** 2026-05-08
**Supersedes:** Tentative use of BFAS-100 (no commercial license confirmed)
**Owner:** @personality-reviewers

---

## Context

Kesher's personality dimension was originally scoped against the Big Five Aspect Scales (BFAS-100), a 100-item validated instrument distinguishing 10 sub-aspects under the five Big Five domains. While BFAS has strong psychometric validation, its commercial license terms are unclear and require direct negotiation with the original authors (DeYoung, Quilty, Peterson). Without a confirmed commercial license, shipping BFAS items in production is a legal risk.

A second option — the BFI-2 (Soto & John) — has clearer commercial terms but still requires written confirmation for a paid SaaS deployment. As of the launch window, BFI-2 commercial confirmation has not been obtained.

The third option is the **International Personality Item Pool (IPIP)** — a peer-reviewed, public-domain set of personality items maintained at https://ipip.ori.org/. IPIP includes representations of all major Big Five frameworks (NEO-PI-R, IPIP-NEO, BFAS proxies) with documented psychometric properties.

---

## Decision

Kesher will ship the **IPIP-NEO short form (20 items)** as the production personality instrument for v1.0.

- **Source:** Goldberg et al., 1999. International Personality Item Pool (IPIP).
- **License:** Public domain. Items may be used freely in commercial applications.
- **Items:** 20 — 4 per Big Five domain × 2 aspects per domain × 2 items per aspect.
- **Scoring:** Deterministic Likert-5 mean per aspect, mapped to 0–100 raw score (NOT a validated percentile).
- **Display label:** "Your tendencies based on how you answered" (HEURISTIC evidence label per `claims/personality.yml`).

---

## Implementation contract

| Requirement | Evidence |
|---|---|
| Items embedded in code (not loaded from network) | `src/components/onboarding/PersonalityAssessment.tsx:8–32` |
| Reverse-keyed items handled | Same file, scoring loop at line 70 |
| Scoring is deterministic, server-independent | Same file; pure function |
| Scoring version is bumped on any item change | `SCORING_VERSION = 'bfas-mvp-v1'` |
| LLM never scores | `outputValidators.ts` rejects raw_personality_scores leakage |
| User can reset / delete / export | `server/trustRoutes.ts` `/personality/{reset,delete,export}` |
| Display copy uses uncertainty markers | `PersonalityProfileScreen.tsx` — "may", "tend to" |
| No clinical or destiny framing | Banned by `outputValidators.PROHIBITED_PATTERNS` |

---

## Trade-offs accepted

- **Lower precision than BFAS:** the 20-item IPIP-NEO short form has lower internal consistency (α ≈ 0.65–0.75 per aspect) than BFAS-100 (α ≈ 0.75–0.90). Mitigation: positioned as a self-reflection tool, not a clinical or matching score.
- **No formal Hebrew validation study:** items are translated by the team; a counter-translation review is scheduled for v1.1 along with cultural-equivalence testing in an Israeli sample.
- **Aspect-level scores are approximations:** while IPIP-NEO short form maps to Big Five domains cleanly, the BFAS aspect granularity is a heuristic projection. Aspect cards are tagged HEURISTIC, not VERIFIED.

---

## Path to a VERIFIED upgrade

To upgrade any personality claim from HEURISTIC to VERIFIED:

1. Either secure written commercial license for BFAS-100 / BFI-2, OR run an Israeli-sample validation study on a Hebrew IPIP short form (n ≥ 500, retest reliability + criterion validity).
2. Submit instrument package (items + scoring + reliability data + Hebrew translation) for review.
3. Update `claims/personality.yml` entries from HEURISTIC to VERIFIED with evidence link.
4. CI gate `lint-claims-registry.mjs` will then permit production exposure of higher-precision claims.

---

## Decision rationale

Public-domain IPIP gives Kesher a working personality instrument at v1.0 with zero licensing risk. The HEURISTIC label is honest about precision; release-gate enforcement keeps high-stakes claims (specific friction predictions, deterministic compatibility) blocked. When the team can fund a validation study or close a license, the upgrade path is clean.

---

## References

- Goldberg, L. R. (1999). A broad-bandwidth, public domain, personality inventory measuring the lower-level facets of several five-factor models. https://ipip.ori.org/
- DeYoung, C. G., Quilty, L. C., & Peterson, J. B. (2007). Between facets and domains: 10 aspects of the Big Five. _JPSP_, 93, 880–896.
- Soto, C. J., & John, O. P. (2017). The next Big Five Inventory (BFI-2). _JPSP_, 113, 117–143.
