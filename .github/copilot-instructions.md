Use `AGENTS.md` as the repo operating contract.

## Kesher product truth

Preserve:
- Hebrew-first Jewish dating for Israel, with English support
- serious, respectful, verified dating
- Daily Picks + Explore
- Hard Filters + Soft Preferences + Learned Taste
- explainable recommendations
- private editable taste profile
- visible trust system
- premium calm

## Red lines

Never introduce:
- public attractiveness scores
- hot-or-not mechanics
- anonymous random chat
- AI impersonation or auto-send
- protected-trait inference from photos
- hidden ranking or filter manipulation
- client-side secrets
- uncontrolled production writes

## Repo behavior rules

- read repo truth before suggesting abstractions
- prefer one vertical slice at a time
- preserve current visual language unless redesign is requested
- keep privileged logic server-side
- keep ranking authority outside the LLM
- keep explanations limited to whitelisted signals
- do not widen scope without being asked
- UNKNOWN stays UNKNOWN

## Implementation rules

- inspect existing schemas, validators, feature flags, and wrappers first
- prefer additive changes over broad rewrites
- keep frontend, backend, and persistence naming aligned
- handle loading, empty, success, and error states
- preserve RTL and Hebrew quality
- do not present placeholder logic as complete

## AI-specific rules

For any user-facing AI feature, preserve or add:
- feature registry alignment
- policy or system instruction alignment
- schema
- validator
- safe server route
- UI disclosure and user control

LLMs may:
- draft
- explain
- summarize
- structure output

LLMs may not:
- rank candidates
- decide eligibility
- enforce sanctions
- auto-send content
- own irreversible writes

## Validation expectations

After meaningful changes, prefer the narrowest high-signal checks available:
- targeted tests
- typecheck
- lint
- build
- route checks
- changed-flow verification

Never claim success without stating what actually passed.

## Preferred summary shape

When finishing a task, report:
1. what changed
2. user flow affected
3. why
4. files changed
5. what was verified
6. residual risk or blocker
