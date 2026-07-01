---
name: kesher-gemini-integration
description: "Integrate Gemini AI into Kesher with structured outputs, function calling, grounding, system instructions, server-side proxy architecture, trust-preserving interaction patterns, and safe fallback behavior."
---

# Kesher Gemini Integration

Use this skill when adding or changing Gemini-backed features. Keep API keys server-side, validate structured outputs, avoid sensitive inference, and fall back to deterministic copy when model output is missing or unsafe.


## Implementation Workflow
1. **Proxy Setup:** Implement a Vercel Edge function in `api/` to act as a secure proxy to the Gemini API.
2. **Authentication:** Ensure the proxy securely injects the `GEMINI_API_KEY`.
3. **Error Handling:** Implement robust error handling and fallback logic for API timeouts or failures.

## Manus Execution Directive
- **Capability:** `web_development`
- **Connector:** Gemini API
- **Action:** Implement the secure Vercel Edge function proxy for the Gemini API.
