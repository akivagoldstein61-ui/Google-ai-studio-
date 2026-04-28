# Personality Dimension — Agent Review Instructions

This document provides a reusable review prompt for GitHub Copilot or any other AI coding agent reviewing pull requests that touch Kesher's Personality Dimension.

---

## How to use

1. Open the pull request in GitHub.
2. Start a GitHub Copilot Chat session on the PR, or invoke your preferred coding agent.
3. Paste the prompt below as your first message.
4. The agent will return blocking issues first, followed by non-blocking observations.

---

## Agent review prompt

```
Review this PR for the following categories of issues. Return blocking issues first, then non-blocking observations. For each issue found, state: (1) the category, (2) the file and line, (3) what the problem is, and (4) what the fix should be.

Categories to check:

1. PERSONALITY PRIVACY LEAKAGE
   - Does any API response, schema, or client-side code expose raw trait scores, assessment item responses, or T1/T2 data fields to unintended recipients?
   - Are trait scores or assessment responses written to logs?

2. HIDDEN RANKING LEAKAGE
   - Does any response expose a user's relative rank among other users?
   - Are fields like `public_trait_rank`, `hidden_personality_rank`, `desirability_score`, or equivalent computed values present?

3. OVERCLAIMING
   - Does any UI copy, AI output, or comment claim predictive validity not supported by evidence?
   - Are any claims absent from the claim registry (docs/personality/claim-registry.md)?
   - Does the UI use absolute language ("perfect match", "soulmate", "will get along")?

4. RAW SCORE EXPOSURE
   - Are raw numeric psychometric scores returned to the client or shown in the UI?
   - Are assessment item responses exposed anywhere outside T1 storage?

5. DIAGNOSIS LANGUAGE
   - Do any AI prompts, AI outputs, UI strings, or code comments use clinical or diagnostic language (e.g. "diagnosis", "disorder", "condition", "mental health label")?

6. PROTECTED-TRAIT INFERENCE
   - Does any code, prompt, or schema infer or store protected characteristics (religion, health status, sexual orientation, ethnicity, political views) from personality or behavioral data?

7. AI AUTOSEND PATHS
   - Does any code path allow AI to send a message or take an action on behalf of a user without a discrete, explicit user action immediately before?
   - Is the `auto_send` field or equivalent present?

8. MISSING CONSENT GATES
   - Does any new data collection or new use of existing data lack an explicit consent gate?
   - Is there a path to process T1 or T2 data without checking consent status?

9. MISSING REVOKE / DELETE / EXPORT PATHS
   - If a new data field is introduced, are revoke, delete, and export paths implemented?
   - Are these paths tested?

10. HEBREW RTL REGRESSIONS
    - If Hebrew strings or RTL layouts are changed, are RTL snapshot tests updated?
    - Do new UI components have RTL-safe CSS (e.g. `dir="rtl"`, logical properties)?

11. FORBIDDEN FIELDS
    - Do any of the following appear in member-facing code, schemas, or AI prompts?
      compatibility_score, soulmate_score, marriage_probability, desirability_score,
      public_trait_rank, raw_trait_public, hidden_personality_rank, diagnosis,
      protected_trait_inference, auto_send, perfect_match

After your review, summarise:
- BLOCKING issues (must be fixed before merge)
- NON-BLOCKING observations (should be tracked as follow-up issues)
```

---

## When to invoke this agent

- On every PR that touches `src/ai/`, `src/prompts/`, `src/schemas/`, `src/personality/`, or any file flagged by CODEOWNERS.
- Before requesting CODEOWNERS approval.
- After any significant rebase or merge conflict resolution.

---

## Interpreting results

| Agent finding | Action |
|---|---|
| BLOCKING issue | Fix before requesting merge. Open a [Red-Team Finding issue](.github/ISSUE_TEMPLATE/ai-redteam-finding.yml) if it is a new pattern. |
| NON-BLOCKING observation | Open a follow-up issue and link it in the PR description. |
| False positive | Add a comment explaining why it is not an issue. Tag `@org/privacy-legal` or `@org/trust-safety` if uncertain. |
