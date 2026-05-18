# Measurement, Licensing, and Hebrew Feasibility

## Source Dossiers

- `Kesher Personality Measurement Selection Dossier.pdf`
- `Kesher Dossier on Personality Instrument Licensing and Hebrew App Feasibility.pdf`
- `Dossier on Personality Assessment for Kesher.pdf`
- `Personality Matrix Deep Research_ Big Five Aspects, Dating Compatibility, and Gemini Integration.pdf`

## Implementation Contract

- `VERIFIED`: A hierarchical Big Five model is the defensible normal-range personality frame. Type systems and clinical/personality-disorder frames are not appropriate for Kesher dating UX.
- `VERIFIED`: BFAS-style aspect structure is scientifically serious, but a commercial product layer or relationship report does not automatically grant Kesher deployable rights or dating-matchmaking validity.
- `VERIFIED`: IPIP item/scales are the cleanest public-domain path for copied or adapted item text. Official BFI-2 and other named instruments need rights review before commercial mobile-app use.
- `VERIFIED`: Hebrew availability is not the same as Hebrew product validity. Translation, adaptation, comprehension testing, and measurement checks are required before production claims.
- `BLOCKED`: Do not ship production personality measurement until instrument rights, Hebrew adaptation, privacy review, and validation gates are closed.

## Engineering Rules

- Keep scoring deterministic, versioned, and testable.
- Never use Gemini, Vertex, OpenAI, or any LLM to compute scores from answers, bios, photos, messages, or behavior.
- Persist item bank version, scoring version, locale, completion status, and response quality metadata with any assessment session.
- Do not commit proprietary item text. If item provenance is uncertain, replace it with placeholders and block production activation.
- Call 0-100 MVP values "approximations" or "bands" unless a real norm table exists.

## Product Copy

Use:

- "private reflection"
- "tendencies"
- "possible strengths"
- "possible friction"
- "communication habits"
- "not a diagnosis"

Avoid:

- claims that Kesher knows the user's true personality
- deterministic fit language
- comparative public rankings
- any suggestion that the assessment is active in production before gates close
