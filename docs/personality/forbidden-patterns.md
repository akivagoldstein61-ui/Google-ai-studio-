# Personality Dimension – Forbidden Patterns

> **Status:** Normative. These patterns are prohibited in all personality-related code, schemas, prompts, API responses, and UI.

---

## Overview

This document defines patterns that are permanently forbidden in Kesher's Personality Dimension. These rules exist to protect users from harm, preserve scientific integrity, and prevent the system from becoming a ranking or sorting engine disguised as a connection tool.

CI script `scripts/scan-forbidden-fields.mjs` scans source code for known field names and string patterns associated with these rules.

---

## Forbidden Pattern Catalogue

### FP-01 – Compatibility Score

**Rule:** No feature may compute, store, display, or imply a numeric compatibility score between two users based on personality, behavioral signals, or any combination thereof.

**Why:** Reduces complex humans to a number. Creates false certainty. Encourages gaming the system.

**Forbidden field names / patterns:**
- `compatibilityScore`, `compatibility_score`, `matchScore`, `match_score`
- `compatibilityPercentage`, `compatibility_percentage`
- `isCompatible` (as a public-facing signal)
- Any UI text containing "% compatible", "compatibility rating", "match rating"

---

### FP-02 – Soulmate Score

**Rule:** No feature may compute, store, display, or imply a "soulmate" designation or score.

**Forbidden patterns:**
- `soulmateScore`, `soulmate_score`, `isSoulmate`
- Any UI text containing "soulmate", "bashert score", "perfect match"

---

### FP-03 – Marriage Probability

**Rule:** No feature may compute, store, display, or imply a probability or likelihood of marriage.

**Forbidden patterns:**
- `marriageProbability`, `marriage_probability`, `weddingProbability`
- Any UI text containing "marriage probability", "% likely to marry", "wedding likelihood"

---

### FP-04 – Desirability Score

**Rule:** No feature may compute, store, display, or imply a desirability ranking or score.

**Forbidden patterns:**
- `desirabilityScore`, `desirability_score`, `attractivenessScore`, `attractiveness_score`
- `hotScore`, `popularityScore`, `likeabilityScore`
- Any UI text containing "desirability", "attractiveness score", "popularity score"

---

### FP-05 – Public Trait Rank

**Rule:** Personality trait scores or dimensions must never be ranked relative to other users or displayed as a comparative ranking.

**Forbidden patterns:**
- `traitRank`, `trait_rank`, `personalityRank`, `personality_rank`
- `bigFiveRank`, `opennessRank`, `conscientiousnessRank`
- Any UI text containing "you rank #", "top X% in", "higher than average"

---

### FP-06 – Raw Trait Public Exposure

**Rule:** Raw numeric trait scores (e.g., O=72, C=58) must never be displayed publicly or shared with other users without explicit user-controlled permissioning through reviewed summaries.

**Forbidden patterns:**
- `rawTraitScore`, `raw_trait_score`, `traitVector`, `trait_vector`
- Direct exposure of `{ openness: number, conscientiousness: number, ... }` to the public profile API

---

### FP-07 – Hidden Personality Ranking Leakage

**Rule:** Personality data must not be used as a hidden ranking or sorting signal in discovery, feed, or match algorithms without explicit disclosure and consent.

**Forbidden patterns:**
- `personalityBoost`, `personality_boost`, `traitWeightedRank`
- Using personality scores silently in `sort()`, `score()`, or feed-ranking logic without disclosure

---

### FP-08 – Diagnosis or Clinical Inference

**Rule:** No feature may produce, imply, or suggest a psychological diagnosis, clinical label, or pathology indicator.

**Why:** The app is not a clinical tool. Misuse could cause real psychological harm.

**Forbidden patterns:**
- `diagnosis`, `clinicalLabel`, `clinical_label`, `mentalHealthScore`
- Any UI text containing "disorder", "clinical", "diagnosis", "pathology", "symptom"
- MBTI-like type labels used as clinical categories

---

### FP-09 – Protected-Trait Inference from Proxies

**Rule:** No feature may infer protected characteristics (religion, ethnicity, politics, sexuality, disability, health status, etc.) from proxies such as photos, writing style, names, location, observance signals, or behavioral patterns.

**Why:** Proxy-based inference of protected traits is discriminatory and legally high-risk.

**Forbidden patterns:**
- `inferredReligion`, `inferred_religion`, `inferredEthnicity`, `inferred_ethnicity`
- `inferredSexuality`, `inferred_sexuality`, `inferredPolitics`
- Any model prompt instructing inference of protected characteristics from profile signals

---

### FP-10 – AI Auto-Send

**Rule:** AI may never automatically send a message, match request, or any user-attributed communication without explicit human review and confirmation.

**Forbidden patterns:**
- `autoSend`, `auto_send`, `automaticMessage`, `automaticallySend`
- Any code path where an AI-generated message is submitted without a user confirmation step

---

### FP-11 – AI Impersonation

**Rule:** AI-generated content must always be clearly labeled as AI-assisted. The system must never present AI-generated text as if it were written by the user.

**Forbidden patterns:**
- Sending AI-generated message drafts without a visible "AI-assisted" disclosure label
- Storing AI-generated text in user message history without an `aiGenerated: true` flag

---

### FP-12 – Public Attractiveness Scoring

**Rule:** No feature may compute, store, or display an attractiveness score derived from photos or any other signal.

**Forbidden patterns:**
- `attractivenessScore`, `photoScore`, `photo_score`, `lookScore`
- Any model prompt instructing photo-based attractiveness scoring

---

### FP-13 – Hidden Throttling or Ranking Manipulation

**Rule:** If personality data influences discovery ranking or message delivery, this must be disclosed to users. Hidden algorithmic manipulation based on personality signals is prohibited.

**Forbidden patterns:**
- Undisclosed personality-based throttling of message delivery
- Undisclosed personality-based suppression of profiles in discovery

---

### FP-14 – Raw Inferred Personality Dossier Sharing

**Rule:** The full inferred personality profile (all traits, scores, and signals) must never be shared with another user, exported to a third party, or used in inter-user comparison without explicit user consent and a reviewed permissioned summary.

**Forbidden patterns:**
- `exportFullDossier`, `sharePersonalityDossier`, `fullPersonalityExport` (without consent gate)

---

### FP-15 – Coercive Mutual Unlock

**Rule:** Users must not be coerced into sharing personality data to unlock basic app functionality. Mutual personality disclosure must be entirely optional and clearly labeled.

**Forbidden patterns:**
- Blocking messaging or profile viewing based on personality data sharing
- Requiring personality assessment completion before match access

---

### FP-16 – Paywalled Privacy and Safety Controls

**Rule:** The following must always be free and immediately accessible regardless of subscription status:
- Data deletion
- Data reset
- Data export
- Consent revocation
- Personality data visibility controls
- Safety reporting

**Forbidden patterns:**
- `isPremiumFeature: true` on any deletion, reset, export, revoke, or safety control
- Any paywall gate on the above controls

---

## Scanning

CI runs `scripts/scan-forbidden-fields.mjs` on every PR touching personality-related paths. The script scans TypeScript, JavaScript, and JSON files for the field names and string patterns listed above.

To run locally:

```bash
npm run scan:forbidden-fields
```

---

## Version History

| Date | Author | Change |
|------|--------|--------|
| 2026-04-28 | Governance scaffold | Initial draft |
