---
name: kesher-match-lifecycle
description: Implement Kesher like/pass/match/chat lifecycle state machines, history, and safe transitions across block, report, unmatch, pause, and delete.
---

# Kesher Match Lifecycle

Use this skill for discovery-to-chat product behavior.

## Requirements

- Treat like, pass, match, message, unmatch, block, report, and delete as explicit state transitions.
- Persist user-visible history so members understand what happened after any safety or privacy action.
- Keep AI outputs draft-only; no opener, rephrase, reflection, or date plan may auto-send.
- Preserve safety records after unmatch, block, and account deletion according to retention policy.

## Acceptance

- Mutual matches create one conversation and one match record.
- Block/report/unmatch remove unsafe access without erasing operator evidence.
- The UI has empty states for no picks, no matches, no conversations, and paused profiles.
