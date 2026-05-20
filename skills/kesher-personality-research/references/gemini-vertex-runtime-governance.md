# Gemini and Vertex Runtime Governance

## Source Dossiers

- `Kesher AI Runtime Governance Verdict.pdf`
- `Kesher Trust-Forward Personality Stack on Google AI Studio and Gemini.pdf`
- `Kesher Personality Kernel Release Dossier.pdf`

## Runtime Decision

- `VERIFIED`: Sensitive personality, compatibility, private preference, and moderation flows should use a server-side runtime with enterprise controls rather than direct client calls.
- `INFERRED`: Vertex AI is the preferred Google-native path for sensitive production personality flows because it offers stronger enterprise governance controls than direct client-side model access.
- `INFERRED`: Firebase AI Logic can remain limited to low-risk convenience features where no sensitive personality, private preference, or moderation data is processed.

## AI Boundary

- LLMs may draft, summarize, and interpret bounded inputs.
- LLMs must not score personality, infer protected traits, decide fit, impersonate users, or auto-send messages.
- Structured output schemas and validators are required for personality-adjacent AI responses.
- Generated copy must carry uncertainty and avoid clinical, fixed-identity, or destiny language.

## Safe Input Policy

Allowed for personality interpretation:

- deterministic domain/aspect bands
- locale
- user-visible settings
- owner-approved share-card summaries

Blocked:

- raw assessment answers
- private messages
- exact location
- photos for sensitive inference
- private taste internals
- hidden ranking weights
- protected-trait proxies

## Implementation Checks

- Keep API keys server-side.
- Record model route and schema version.
- Validate outputs before rendering.
- Log metadata only, not prompts, raw answers, generated sensitive prose, or private recommendations.
