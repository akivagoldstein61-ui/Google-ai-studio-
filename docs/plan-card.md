# Plan Card: Security, Permission Minimization, and AI Route Governance

## Goal
Implement a security and governance layer for all `/api/ai/*` routes, minimize iframe permissions, and establish safe server-side metadata logging without retaining PII.

## Must-Change Files
- `server/aiRoutes.ts` (Auth middleware, logging middleware)
- `metadata.json` (Permission minimization)
- `.env.example` (Auth configuration placeholders)
- `src/services/aiSafetyService.ts`, `src/services/aiService.ts`, `src/services/aiDatePlannerService.ts` (Include Auth headers)

## Must-Not-Change Files
- Core Gemini system instructions (preserve AI behavior)
- Existing mock data schemas
- UI layout and core matching logic

## User-Facing Behavior Changes
- Camera permission prompt removed.
- Geolocation requested only strictly when Date Planner is used (if applicable at client level).
- AI features may gracefully display error states if auth fails in strict mode.

## Server / Secret Boundaries
- `GEMINI_API_KEY` remains server-side.
- Added Firebase admin validation or strict prototype-mode gating for `/api/ai/*`.

## Approval Gates
- Strict mode vs Prototype mode toggle must be documented.
- No PII logged in the metadata logger.

## Verification Steps
- App compiles and runs.
- `AI_ROUTE_AUTH_MODE=prototype` allows requests.
- `AI_ROUTE_AUTH_MODE=strict` blocks unauthenticated requests.
- Bio coach, date planner, and safety scan function normally.

## Unresolved Risks
- App Check enforcement requires client-side Firebase configuration not fully implemented in this slice.
