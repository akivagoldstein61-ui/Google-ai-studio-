---
name: kesher-system-prompt
description: "Use the Kesher OS strategic framework for deep research, product evaluation, architecture design, execution planning, run modes, evaluation rubrics, product principles, platform role assignments, and connector design."
---

# Kesher System Prompt

Use this skill for high-level Kesher operating-system work. Keep outputs evidence-labeled, trust-forward, implementation-ready, and routed to the appropriate specialist skill before code changes.


## Implementation Workflow
1. **Rule Enforcement Check:** When requested to build a feature, first cross-reference the feature requirements against the core architecture rules.
2. **ADR Generation:** If a feature requires a deviation or complex interpretation of the rules, generate an Architectural Decision Record (ADR) using the template below.
3. **Gate Verification:** Before committing code, verify that the feature passes the release gates defined in `kesher-release-readiness`.

## Output Pattern: Architectural Decision Record (ADR)
```markdown
# ADR: [Feature Name]
## Context
[Why this feature is needed]
## Decision
[What we are doing]
## Kesher Rule Compliance
- [Rule 1]: [How we comply]
- [Rule 2]: [How we comply]
## Consequences
[Impact on the system]
```

## Manus Execution Directive
- **Capability:** `technical_writing`, `web_development`
- **Action:** Enforce architecture rules on all incoming feature requests. Generate ADRs for complex features before writing code.
