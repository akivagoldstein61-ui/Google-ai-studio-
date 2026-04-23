# Kesher Trust Safety AI Reference

## Source Documents

- `Kesher Image Analysis Dossier for Trust-Forward “Analyse images”.pdf`
- `Kesher Voice Conversations Dossier.pdf`

## Multimodal Doctrine

Image and voice AI can be useful only as bounded utility. Kesher should use these capabilities for safety, accessibility, quality feedback, and effort reduction, not identity inference, attractiveness scoring, or relationship simulation.

## Image Analysis

Safe member-facing surfaces:

- photo-readiness feedback,
- accessibility alt-text preview,
- quality guidance such as lighting, blur, cropping, group-photo ambiguity,
- policy-safe upload guidance.

Safe moderator-facing surfaces:

- suspected nudity/violence/policy violation categories,
- ambiguity flags,
- rationale snippets,
- triage summaries,
- escalation recommendations.

Hard prohibitions:

- attractiveness scores,
- sensitive trait inference,
- protected-class guesses,
- objectifying descriptions,
- identity classification,
- "who is this person" claims,
- hidden ranking signals from photos.

## Voice AI

Voice should launch only as a tightly bounded utility layer:

- accessibility support,
- hands-free drafting,
- Safety Center guidance,
- short task help,
- internal alpha before premium beta.

Do not launch:

- broad always-available voice companion,
- romantic practice partner,
- emotional confidant,
- proactive bonding,
- affective mirroring mode,
- auto-flirting,
- "I miss you" style retention copy.

## Moderation And Safety

AI may:

- classify,
- summarize,
- draft explanation,
- flag ambiguity,
- prepare human-review context.

AI must not:

- make final consequential enforcement decisions,
- hide rationale from operators,
- overstate certainty,
- apply policies inconsistently without audit.

## Launch Gates

Before launch, require:

- explicit labels and consent,
- retention explanation,
- opt-out where appropriate,
- structured output schemas,
- safety tests,
- Hebrew quality tests for voice,
- human review for consequential actions,
- abuse-case review.

## Plugin Integration

Use plugins to verify trust and safety claims against artifacts:

- GitHub: inspect moderation flows, trust policies, schema validation, report/block code, and PRs.
- Browser Use: exercise consent, safety-center, report/block, and moderation interfaces.
- Figma and Canva: create trust-hub flows, moderation diagrams, safety review decks, and stakeholder collateral.
- Hugging Face: research models, datasets, papers, and evaluations for moderation, image, voice, and safety tasks.
- Cloudflare, Vercel, Netlify, CircleCI, Neon Postgres, YepCode: design runtime enforcement, CI gates, audit storage, retention, and controlled experiments.
