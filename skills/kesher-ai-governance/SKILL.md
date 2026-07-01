---
name: kesher-ai-governance
description: "Implement Kesher AI feature allocation, system boundaries, registry governance, model routing, human-in-the-loop triggers, and safety policy enforcement. Use when changing AI feature registry entries, model route choices, trust hub copy, policy checks, or governance docs."
---

# Kesher AI Governance

Use this skill when an AI feature changes what data is processed, which model route is used, or what a user can do with generated output. Keep generated assistance draft-only, structured, disclosed, and reversible where relevant.


## Implementation Workflow
1. **Ledger Update:** When a new AI feature is added, update the `aiGovernanceRoutes.ts` to include the new route in the health endpoint.
2. **Runtime Log Audit:** Periodically use the Vercel MCP `get_runtime_logs` tool to audit production AI routes for latency spikes or error clusters.
3. **Gate Promotion:** Once a feature has stable runtime logs, update its status in `completionPlan.ts` from `prototype` to `live`.

## Manus Execution Directive
- **Capability:** `web_development`, `shell`
- **Connector:** Vercel MCP
- **Action:** Maintain the AI provenance ledger and audit runtime logs using Vercel MCP to ensure AI features meet latency and safety targets.
