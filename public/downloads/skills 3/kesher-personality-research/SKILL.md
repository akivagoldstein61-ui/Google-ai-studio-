---
name: kesher-personality-research
description: Convert Kesher personality PDF dossiers and research findings into implementable, evidence-labeled product and engineering guidance. Use when grounding Kesher BFAS/Big Five measurement, instrument licensing, Hebrew feasibility, Israeli privacy, consent, visibility, permissioned sharing, Gemini/Vertex runtime governance, validation gates, repository delivery, or trust-forward personality feature decisions from the PDF corpus.
---

# Kesher Personality Research

Use this skill before implementing or reviewing personality features that depend on the local PDF corpus. Treat the PDFs as grounding material for product contracts, not as permission to ship sensitive scoring.

## Evidence Labels

- `VERIFIED`: directly supported by the PDF corpus, official docs already captured in repo docs, or deterministic code inspection.
- `INFERRED`: a product or engineering conclusion derived from verified material.
- `HEURISTIC`: an operator rule of thumb that still needs review before production use.
- `UNKNOWN`: unresolved, missing evidence, or not yet inspected.
- `BLOCKED`: not implementable for production until a named gate is closed.

## Workflow

1. Start with `references/source-map.md` and choose the capability reference that matches the task.
2. Keep the product stance stable: personality is optional, private by default, deterministic when measured, and reflective rather than predictive.
3. Do not activate production personality scoring unless commercial instrument rights, Hebrew adaptation, privacy counsel review, and data-governance gates are closed.
4. Do not let an LLM score personality. LLMs may only interpret deterministic scores or user-approved summaries through bounded schemas.
5. Convert research into concrete implementation contracts: allowed inputs, blocked inputs, output schema, consent surface, visibility layer, tests, and release gate.
6. Use probabilistic copy: "may", "can", "often", "worth exploring", and "possible friction/strength".
7. Update the relevant feature skill when a PDF finding changes implementation behavior.

## Capability References

- `references/measurement-licensing-hebrew.md`: instrument choice, BFAS/BFI/IPIP rights, Hebrew feasibility, and scoring gates.
- `references/compatibility-reflection-science.md`: relationship-science boundaries and safe reflection language.
- `references/privacy-consent-visibility-sharing.md`: Israeli privacy readiness, consent UX, visibility layers, and permissioned sharing.
- `references/gemini-vertex-runtime-governance.md`: Gemini, Vertex AI, Firebase AI Logic, and sensitive-runtime boundaries.
- `references/validation-release-gates.md`: launch blockers, psychometric validation, invariance, and release checklist.
- `references/tooling-deployment-delivery.md`: GitHub, Vercel, CI, preview verification, and delivery tooling.

## Stop Points

Stop for human approval before changing production auth, Firebase rules, database schema, secrets, billing, deployment settings, instrument item text, commercial instrument activation, personality-driven ordering, or cross-user personality disclosure.

Use `$kesher-personality-delivery` after this skill when implementation, browser verification, CI, or Vercel prototype updates are required.
