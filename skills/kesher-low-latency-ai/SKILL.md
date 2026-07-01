---
name: kesher-low-latency-ai
description: "Design server-side AI proxy architecture for low-latency Kesher responses. Use when implementing model routing matrices, latency targets, streaming patterns, feature registry routing, and policy-aware AI request handling."
---

# Kesher Low Latency AI

Use this skill to keep AI surfaces fast without weakening trust controls. Prefer deterministic fallbacks, minimal payloads, schema validation, and feature-specific model routing over broad generic chat calls.


## Implementation Workflow
1. **Caching Strategy:** Implement Vercel KV caching for deterministic or semi-deterministic AI responses.
2. **Streaming Implementation:** Implement Server-Sent Events (SSE) or HTTP streaming for long-running AI generations.
3. **Performance Monitoring:** Use Vercel MCP `get_runtime_logs` to monitor latency.

## Manus Execution Directive
- **Capability:** `web_development`
- **Connector:** Vercel MCP
- **Action:** Implement KV caching and streaming responses to optimize AI latency.
