---
name: kesher-personality-research
description: Authoritative evidence base for Kesher's personality, compatibility, sharing, and trust features. Use when writing or reviewing user-facing copy about traits or compatibility, choosing between BFAS forms, designing share cards or "why this match" outputs, debating similarity vs complementarity, defending a privacy/visibility default, or grounding a claim with VERIFIED/INFERRED/HEURISTIC/UNKNOWN labels. Pair with the implementation skills below.
---

# Kesher Personality Research

This skill is the canonical, evidence-tagged grounding layer for every Kesher feature that touches personality, compatibility, taste, sharing, or AI-mediated reflection. It does not implement features — it tells you what the evidence does and does not support, so you can keep prompts, copy, schemas, and product defaults defensible.

## When to use

- Writing or auditing a personality report, compatibility card, "why this match" string, or share-card preview.
- Choosing between full BFAS (100 items), short forms (e.g., BFAS-40, BFI-2), or no instrument at all.
- Defending privacy defaults: private-by-default vs mutual-unlock vs public personality display.
- Resolving an internal disagreement about similarity, complementarity, "opposites attract", or "soulmate" framing.
- Reviewing a Gemini structured output for false precision, clinical drift, destiny language, or covert ranking.

## Workflow

1. Open `references/dossier-index.md` and find the dossier(s) closest to the question. Each entry lists the deliverable, the strongest claims, and where to look in `canonical-evidence.md`.
2. Open `references/canonical-evidence.md` and locate the relevant section. Every claim carries an evidence label — keep that label if you propagate the claim into prompts, schemas, or UI copy.
3. Use `references/effect-sizes.md` for the small set of numbers you can quote without overclaiming (actor ≈ 6%, partner ≈ 1–3%, trait similarity < 0.5% of relationship-satisfaction variance after actor/partner controls, etc.).
4. Before shipping user-facing language, run it through `references/copy-do-dont.md`. The safe / risky / unsupported lists are derived from the dossiers and from the existing `docs/personality/prohibited-output-rules.md`.
5. For each architectural choice, cross-check against `references/product-defaults.md` (private-by-default, reflection over prediction, summarized-only sharing, mutual-consent for deeper layers, no paywalled privacy).

## Evidence labels (reused everywhere)

- **VERIFIED** — supported by peer-reviewed research or official platform docs cited in the dossier.
- **INFERRED** — synthesized from multiple verified findings; not directly tested as stated.
- **HEURISTIC** — pragmatic product guidance under uncertainty.
- **UNKNOWN** — not enough public evidence to support the claim.

If a feature relies on an UNKNOWN claim, gate it behind an experiment, not a launch.

## Hard non-negotiables (reaffirmed from dossiers + repo policies)

- No compatibility scores, match percentages, soulmate / bashert / destiny verdicts.
- No raw personality scores, hidden weights, or private-taste exposure to other users.
- No clinical / diagnostic language; trait labels are tendencies, not identity.
- No covert ranking or paywalled privacy controls.
- No protected-trait inference from photos or writing style.
- LLMs may *interpret* deterministic scores; LLMs must not *score* BFAS items.
- See `docs/personality/prohibited-output-rules.md` for the executable language allowlist/blocklist.

## Related implementation skills

- `$kesher-bfas-assessment` — deterministic scoring + opt-in flow.
- `$kesher-personality-profile` — private reflection cards.
- `$kesher-personality-why-match` — explanation outputs with provenance.
- `$kesher-compatibility-reflection` — mutual-consent shared reflection cards.
- `$kesher-personality-visibility` — public/private/mutual surface decisions.
- `$kesher-permissioned-sharing` — share-card grants, revocation, audit ledger.
- `$kesher-private-taste` — private learned-preference store.
- `$kesher-personality-delivery` — browser validation + release workflow.

## Acceptance checks

- Any new product claim about personality, compatibility, or matching cites a dossier section and carries an evidence label.
- Any prompt change preserves probabilistic framing ("you tend to", "may", "one thing to explore").
- Any new schema field is justified by a dossier passage or marked HEURISTIC with a follow-up experiment.
- Reviewers can trace a user-visible string back to a verified or inferred source within two clicks.
