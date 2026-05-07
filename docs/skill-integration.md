# Kesher skill integration — May 2026

This doc summarises the integration pass that wired the Kesher skill specs into
the existing `src/` codebase, plus the standalone prototype at
`prototype-kesher.html`.

## What was added

All new files live under `src/lib/` and are pure TypeScript modules with no
external dependencies — they typecheck cleanly against the existing `Profile`
type in `src/types.ts`.

| File | Skill | Responsibility |
|---|---|---|
| `src/lib/filteringGrammar.ts` | `kesher-filtering-marketplace` | Hard / soft filter taxonomy, directional score (`w1·explicit + w2·implicit + w3·context`), reciprocal harmonic mean, exposure-fairness multiplier (new-user boost / starvation prevention / impression cap). |
| `src/lib/learnedTaste.ts` | `kesher-learned-taste` | Four-class event taxonomy (policy / explicit / high-signal implicit / context), authority hierarchy, dual-memory state (fast 2 wks / slow ~2.5 mo half-life), `Update = Authority × Confidence × Recency × Eligibility` rule, taste-reset semantics. |
| `src/lib/observanceLayer.ts` | `kesher-personality-ocean`, `kesher-observance-layer` | Three-layer observance model: Layer 1 public Hebrew self-description labels, Layer 2 practice bundles (Shabbat / Kashrut / Community / Family), helper `practiceAreaAlignment()` for ranking-only private compat. |
| `src/lib/oceanScoring.ts` | `kesher-personality-ocean` | OCEAN-domain extraction from the existing BFAS quiz output, qualitative `reflectOcean()` (harmony / growth / friction bands — never a single %), Neuroticism → "Emotional Style" relabeling. |
| `src/lib/explanationSchema.ts` | `kesher-explainable-ai` | Whitelisted `EvidencePacket` shape, deterministic Hebrew fallback templates, copy-guideline linter, system-prompt fragment for the Gemini explanation call. |
| `src/lib/integratedRanking.ts` | composes all of the above | End-to-end `rank({viewer, candidate, ...})` that returns `{admissible, finalScore, evidence, privateAlignment}` plus `rankBatch()` for daily-picks. |

## How it connects to the existing app

- `src/types.ts`'s `Profile`, `DiscoveryPreferences`, `TasteProfile` types are
  untouched. The new modules type-import `Profile` and add new orthogonal types
  rather than mutating existing ones.
- `src/services/aiService.ts` already produces a free-form match explanation
  payload. The new `EvidencePacket` schema in `explanationSchema.ts` is the
  type-safe input shape; wire it in by replacing the loose object literal at
  the `aiService.explainMatch` call site.
- `PersonalityAssessment.tsx` continues to emit a flat scores map keyed by
  domain and `${domain}_${aspect}`. `oceanScoring.extractOcean()` reads that
  same map — no migration needed.
- The existing `CompatibilityReflectionPanel.tsx` already gates on
  `bothOptedIn`. Replace its qualitative output with `reflectOcean()` from the
  new module to drop any one-sided personality reading paths.

## Prototype

`prototype-kesher.html` (root of repo) is a single-file demo that mirrors all
of the above logic in vanilla JS. It exposes:

- a discovery surface with hard / soft filter toggles that re-rank live;
- a ranking trace pane showing directional scores, reciprocal mean, fairness
  multiplier, and the whitelisted reason codes / evidence packet;
- a 5-item OCEAN reflection (illustrative, not validated);
- a mutual-consent compatibility reflection (locked until both opt in).

Open it directly in a browser — no build step.

## Verification

The new TypeScript modules typecheck under the repo's `tsconfig.json` settings
(`target: ES2022`, `module: ESNext`, `moduleResolution: bundler`,
`allowImportingTsExtensions: true`, `paths: {"@/*": ["src/*"]}`).
