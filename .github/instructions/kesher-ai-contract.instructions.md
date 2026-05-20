---
applyTo: "src/ai/**,server/aiRoutes.ts"
---

# Kesher AI Contract Conventions

## The AI Contract Principle

Every AI feature is a **versioned contract**, not a vibe.
Schema in → structured output out → validator guards → evidence labels shown.
No AI feature ships without a validator and tests.

## Canonical AI Layer Files (read before editing any AI feature)

```
src/ai/
  featureRegistry.ts    — feature metadata, risk, consent, data_inputs, excluded_data
  policies.ts           — STRICT_DATING safety settings and system instructions
  prompts.ts            — parameterized prompt templates (all user input sanitized)
  schemas.ts            — Gemini structured output schemas (7 schemas)
  outputValidators.ts   — runtime validators (6 validators, all tested)
  capabilityRouter.ts   — feature → model routing
  modelRegistry.ts      — model route definitions
```

## Eval-First Order for New AI Features

1. Define feature in `featureRegistry.ts` — id, risk level, data_inputs, excluded_data, consent flag
2. Define structured output schema in `schemas.ts`
3. Define prompt template in `prompts.ts` — always run user inputs through `promptSanitizer`
4. Define runtime validator in `outputValidators.ts`
5. **Write tests first** — validator edge cases, missing-key fixtures, adversarial inputs
6. Wire model routing in `capabilityRouter.ts` + `modelRegistry.ts`
7. Add server route in `server/aiRoutes.ts` behind `authMiddleware`
8. Wire client call via `authFetch`

## Evidence Labels

Every AI-generated claim shown to users must carry one of:

| Label | Meaning |
|-------|---------|
| `VERIFIED` | Directly from user-submitted profile data |
| `INFERRED` | Derived from patterns, not direct input |
| `HEURISTIC` | Based on general heuristic, not this user's data |
| `UNKNOWN` | AI generated without traceable signal |

Never hide the label. Never upgrade `INFERRED` to `VERIFIED`.

## What AI Must Never Do

- Auto-send a message on behalf of the user
- Claim certainty about compatibility or romantic outcomes
- Infer race, ethnicity, religion, or sexual orientation from photos
- Generate manipulative dating copy (urgency, scarcity, jealousy triggers)
- Score physical attractiveness
- Expose private fields from one user to another
- Use `excluded_data` fields listed in the feature registry

## Data Minimization

Each feature in `featureRegistry.ts` must declare:
- `data_inputs` — fields that may be included in the prompt
- `excluded_data` — fields that must never be included

Before building a prompt, verify: every field used is in `data_inputs`. Any field in `excluded_data` causes a build-time error.

## Prompt Injection Prevention

All user-provided text must pass through `promptSanitizer` before being embedded in a prompt.
Sanitizer responsibilities: length-bound, strip control characters, neutralize role markers.
Do not bypass or inline user text without sanitization.

## Fallback Behavior

- If Gemini returns an invalid structured output, the validator must reject it — do not silently pass junk to the UI
- If the feature is unavailable, return a typed fallback object with `fallback: true`, not an error string
- Fallback use must be visible to the user (e.g., "AI suggestion unavailable")

## Validation

```bash
npm run test:schemas      # structured output schema tests
npm run test              # includes outputValidator tests
npm run redteam:personality  # adversarial prompt fixtures
npm run scan:logs         # confirms no prompt content in logs
```
