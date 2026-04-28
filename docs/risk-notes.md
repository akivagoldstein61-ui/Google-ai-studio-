# Risk Notes

## Security Risks
- Backend requires `AI_ROUTE_AUTH_MODE=strict` in production along with proper Firebase Admin SDK token validation and App Check. Currently supports `prototype` mode to unblock testing without full Firebase initialization.
- App Check is not fully wired on the Vite client side. This leaves the API vulnerable to scraping if deployed without enabling it.

## Privacy Risks
- The current implementation passes real location data to the Maps grounding tool. We rely on the client sending coarse locations (e.g., "Tel Aviv") rather than strict lat/long, but the API could inadvertently process more specific data if the client is modified.
- Metadata logging tracks latencies, usage, and schema validations. We strictly strip `params` and `message` contents from logs, but accidental PII leakage in error traces is a known risk requiring continuous monitoring.

## Product Risks
- Strict API failure states will result in degraded UX (e.g., "AI features unavailable"). The frontend falls back to calm defaults, but loss of service diminishes the app's value.

## AI Behavior Risks
- Gemini models can occasionally bypass system prompt guardrails. Although structured JSON outputs mitigate formatting breaks, semantic hallucinations (e.g., falsely confirming a venue is kosher) remain possible despite grounding.

## Unknowns
- We have not verified how Firebase App Check interacts with the AI Studio iframe/preview environment. Strict mode might require external browser testing.
