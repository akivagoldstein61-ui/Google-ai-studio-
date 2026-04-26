# ADR 0004: Draft-Only AI Messaging Assistance

## Status

Accepted

## Context

Dating messages carry identity, consent, tone, and emotional stakes. AI can help users write more respectfully, but it must not impersonate users or take action on their behalf.

## Decision

Kesher messaging assistance must be rewrite-first and draft-only. The user must review and send any message manually. The assistant must not auto-send, impersonate the user, invent facts, imply relationship progress, or escalate beyond the user's stated intent.

## Consequences

- Messaging APIs must never expose auto-send behavior.
- UI copy must make review and manual send explicit.
- Generated drafts should preserve the user's intent and avoid invented details.
- Tests must block auto-send, impersonation, and invented-fact patterns.
