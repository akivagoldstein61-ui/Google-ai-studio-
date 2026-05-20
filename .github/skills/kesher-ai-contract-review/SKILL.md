# Kesher AI Contract Review Skill

**Purpose**: Review an AI feature in the Kesher app as a versioned contract — checking schema completeness, prompt safety, validator correctness, evidence labels, data boundaries, and server route hardening.

---

## When to Use This Skill

Invoke when:
- A new AI feature is being added or changed
- A PR touches `src/ai/**` or `server/aiRoutes.ts`
- You need to confirm an AI feature is safe to ship
- A red-team exercise is needed before launch

---

## Trigger

> "Review the AI contract for [feature]" / "Is this AI feature safe to ship?" / "Audit the [feature-id] schema"

---

## Review Checklist

### Registry (featureRegistry.ts)
- [ ] Feature `id` matches the route in `server/aiRoutes.ts`
- [ ] `risk` level is appropriate (low / medium / high)
- [ ] `data_inputs` lists every field used in the prompt template
- [ ] `excluded_data` lists fields the prompt must never include
- [ ] `consent` flag is present if sensitive data is involved

### Schema (schemas.ts)
- [ ] All required output fields declared
- [ ] No `any` or untyped `string | object` fields
- [ ] Evidence label field present where claims are shown to users

### Prompt Template (prompts.ts)
- [ ] All user inputs pass through `promptSanitizer`
- [ ] No `excluded_data` field is interpolated
- [ ] No field outside `data_inputs` is interpolated
- [ ] No claim of certainty about compatibility or romance
- [ ] No attractiveness scoring instruction
- [ ] No instruction to auto-send or impersonate user
- [ ] Private data from one user cannot appear in another user's output

### Output Validator (outputValidators.ts)
- [ ] Rejects output with missing required fields
- [ ] Rejects output with wrong types
- [ ] Tested with missing-key fixtures
- [ ] Tested with adversarial inputs
- [ ] Fallback object includes `fallback: true`
- [ ] `INFERRED` data cannot be labeled as `VERIFIED`

### Evidence Labels
- [ ] Every claim shown to users carries: VERIFIED · INFERRED · HEURISTIC · UNKNOWN
- [ ] UI displays label alongside claim

### Server Route (server/aiRoutes.ts)
- [ ] `authMiddleware` applied
- [ ] Feature ID validated against server-side registry
- [ ] Model assigned by `capabilityRouter`, not client input
- [ ] `STRICT_DATING` safety settings applied

---

## Evidence Label Definitions

| Label | Meaning |
|-------|---------|
| `VERIFIED` | From structured data the user entered |
| `INFERRED` | Model-derived; may be wrong |
| `HEURISTIC` | Pattern-based estimate |
| `UNKNOWN` | No basis for a claim |

---

## Data Boundary Quick Check

Run through mentally:
1. What private data could reach Gemini from this feature?
2. Is all of it in `data_inputs`?
3. Is `excluded_data` enforced at the prompt-building level?

---

## Output Format

For each checklist section: **PASS** / **FAIL** / **PARTIAL**

For each failure:
- File + line reference
- Specific violation
- Recommended fix

Summary: overall **SAFE TO SHIP** / **NEEDS WORK** / **BLOCKED**

---

## Must Not

- Ship a feature without a validator
- Ship without at least one adversarial test fixture
- Allow client input to select the model
- Weaken `STRICT_DATING` settings
