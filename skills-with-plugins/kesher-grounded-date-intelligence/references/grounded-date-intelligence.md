# Kesher Grounded Date Intelligence Reference

## Source Documents

- `Kesher Maps-Grounded Date Planning Dossier-2.pdf`
- `Use Google Search Data in Kesher-2.pdf`

## Grounding Doctrine

Use Maps and Search grounding narrowly, at moments where freshness or real-world place data changes the answer. The product value is accountability: what is open, nearby, appropriate, current, and source-visible.

Grounding should not become a broad discovery feed or background search surface. It should support finite, intentional date decisions.

## When To Use Grounding

Use grounding for:

- what is open tonight or nearby,
- weekend events or current cultural options,
- backup plans when the first plan fails,
- last-minute pivots,
- place facts such as hours, location, reviews, or accessibility,
- safety/help questions that benefit from current sources,
- date plans with multiple constraints.

Do not use grounding for:

- generic profile/message writing,
- evergreen dating advice,
- broad browsing feeds,
- hidden ranking,
- unbounded "find me everything" exploration.

## Maps vs Search

Prefer Maps when the question is place-grounded:

- venues,
- opening hours,
- distance,
- routing context,
- nearby alternatives,
- place attribution.

Prefer Search when the question needs freshness or web context:

- current events,
- recent safety guidance,
- topical recommendations,
- venue announcements,
- non-place web sources.

Use both when a date plan needs current event context plus place logistics.

## Date Planning Constraints

Collect or infer only what is necessary:

- location,
- time window,
- budget,
- vibe,
- observance/kashrut/Shabbat constraints when volunteered,
- accessibility,
- transportation,
- safety comfort,
- weather/current context when relevant.

Return finite options with tradeoffs, not an infinite feed.

## Trust And Compliance Rules

- Show sources, citations, or attribution in user-facing grounded answers.
- Do not syndicate, resell, or repurpose grounded results.
- Do not perform link-level tracking.
- Do not store grounded results beyond allowed policy and product need.
- Make uncertainty visible when grounding is incomplete, stale, or conflicting.

## Product Pattern

Recommended response shape:

- short plan verdict,
- 2-3 options,
- why each fits the couple and constraints,
- source-visible place/current facts,
- backup option,
- uncertainty note,
- next action.

## Plugin Integration

Use plugins when grounding needs implementation or QA:

- GitHub: inspect route handlers, schemas, source metadata rendering, and feature gates.
- Browser Use: verify citations, attributions, mobile layout, and fallback UX in a running prototype.
- Cloudflare, Vercel, Netlify: design server/edge hosting for grounded responses and preview deployments.
- Neon Postgres: design storage for date plans, source metadata, consent, and retention-limited records.
- CircleCI: enforce automated checks for schema validity and source display.
- YepCode: run isolated API/data experiments when no dedicated connector exists.
