# Kesher Gemini / AI Studio Adapter Note

Use when working in Gemini, Google AI Studio, AI Studio Build Mode, Gemini CLI, or Gemini-family agents.

## Preserve

Kesher Universal Safety Core, no secrets or real PII in prompts/client code, frontend is not a security boundary, AI outputs are assistive and untrusted until tested, report/block/moderation/deletion/audit are core infrastructure, structured prompt/eval discipline.

## Adapt/remove

- Replace Lovable Plan Mode with AI Studio Build planning or Gemini system instruction.
- Replace Lovable Security View with Firebase/Firestore rules review, server/client key review, Cloud Run/deployment review, secret scan, and CI tests.
- Replace Lovable GitHub sync assumptions with AI Studio export/GitHub handoff behavior.
- Do not claim native mobile support from Build Mode without a separate mobile toolchain.

## Approval boundary

Do not deploy, set secrets, alter Firebase rules, publish Cloud Run, or merge generated code without explicit approval.
