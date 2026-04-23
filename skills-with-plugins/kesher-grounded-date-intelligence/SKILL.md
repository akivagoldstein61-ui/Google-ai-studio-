---
name: kesher-grounded-date-intelligence
description: Search- and Maps-grounded date intelligence for Kesher, including date planning, current/open-nearby checks, citations, attribution, freshness rules, Israel-local logistics, and source-visible product flows. Use when designing Kesher date-planning features, grounded recommendations, backup plans, weekend ideas, or safety/help answers that need current external information.
---

# Kesher Grounded Date Intelligence

## Operating Posture

Use grounding only when freshness, location, opening hours, real-world availability, or source accountability materially changes the answer. Kesher should not become a broad discovery feed; grounded intelligence should make a concrete dating decision easier and safer.

Read `references/grounded-date-intelligence.md` for Maps/Search decision rules, attribution requirements, and product patterns.

## Workflow

1. Decide whether grounding is needed: current events, open-now checks, nearby places, last-minute pivots, safety/help guidance, or live logistics.
2. Choose Maps, Search, or both. Prefer Maps for place facts and logistics; use Search for freshness, events, safety guidance, or when Maps is insufficient.
3. Preserve user constraints: location, budget, time, observance, accessibility, transportation, vibe, safety, and weather/context when available.
4. Return finite options with reasons, caveats, and source-visible attribution.
5. Include fallback plans and uncertainty handling for closed venues, stale information, or missing sources.
6. Keep the UX calm: no infinite feed, no hidden ranking, no ungrounded certainty.

## Plugin Routing

Use available plugins when grounded-date work needs implementation or verification:

- Use GitHub to inspect date-planning routes, schemas, feature flags, or source-rendering code.
- Use Browser Use to verify citation/attribution UI, mobile layout, and local prototype behavior.
- Use Cloudflare, Vercel, or Netlify for server, edge, preview, and deploy patterns around grounded responses.
- Use Neon Postgres when planning storage for date plans, consent, source metadata, or retention policy.
- Use CircleCI for automated checks around grounded output schemas and source-display tests.
- Use YepCode for one-off API experiments or source-data transformations when no dedicated connector exists.

## Output Rules

- Show citations or attribution in any user-facing grounded answer.
- Do not store or reuse grounded results beyond what the applicable policy allows.
- Avoid background scraping, broad search feeds, or link-level tracking.
- Route complex multi-constraint planning to higher-thinking policy only when the tradeoffs justify latency.
