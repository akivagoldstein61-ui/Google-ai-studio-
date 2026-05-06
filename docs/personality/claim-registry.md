# Personality Dimension – Claim Registry

> **Status:** Governance scaffold. All user-facing personality claims must be registered here before shipping.

---

## Overview

Every user-facing claim made by Kesher's Personality Dimension must carry an evidence label:

| Label | Meaning |
|-------|---------|
| **VERIFIED** | Based on a validated, peer-reviewed psychometric instrument with documented reliability/validity. License confirmed. |
| **INFERRED** | Derived from behavioral signals using a defined algorithm. No external validation study. Uncertainty must be disclosed. |
| **HEURISTIC** | Rule-based logic with no validation study. Engineering judgment only. Must be disclosed as a rough guide. |
| **UNKNOWN** | Not yet classified. Must not be shown to users in production. |

---

## Measurement Architecture

Kesher uses a **measurement-adapter architecture**. The scoring instrument is replaceable without changing the interpretation or UI layer.

**Current status:**
- No psychometric instrument is active in production.
- The launch-safe path is an optional, progressive Big Five implementation (likely BFI-2 or a licensed equivalent pending rights review).
- The deep-dive path (BFAS/BFAS-40 aspects) is deferred pending licensing, Hebrew localization, and cultural validation.

**Hard constraints:**
- An LLM must never score personality. LLMs may only interpret deterministic scores through bounded schemas with uncertainty language.
- Scoring code must be deterministic, versioned, testable, and separated from AI interpretation.
- No proprietary assessment item text may be committed to this repository.

---

## Active Claims

_No active claims. This registry will be updated when personality features ship._

---

## Proposed Claims (Pre-Review)

| Claim ID | Claim Text | Label | Instrument | Reviewer | Status |
|----------|-----------|-------|-----------|---------|--------|
| _(none yet)_ | | | | | |

---

## Retired Claims

| Claim ID | Claim Text | Retired Date | Reason |
|----------|-----------|-------------|--------|
| _(none yet)_ | | | |

---

## How to Register a Claim

1. Open a [Personality Feature Issue](.github/ISSUE_TEMPLATE/personality-feature.yml) and select the appropriate evidence label.
2. Add an entry to the **Proposed Claims** table above in your PR.
3. Tag @psychometric-reviewers for review if the label is VERIFIED or INFERRED.
4. On approval, move the entry to **Active Claims** and record the instrument version, reviewer, and date.

---

## Version History

| Date | Author | Change |
|------|--------|--------|
| 2026-04-28 | Governance scaffold | Initial draft |
