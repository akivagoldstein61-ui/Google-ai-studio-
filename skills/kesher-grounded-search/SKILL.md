---
name: kesher-grounded-search
description: "Use Google Search grounding in Kesher for cited safety Q&A, event discovery, curated URL context, source rendering, and freshness-sensitive prototype flows without turning search into people-finding or background-check tooling."
---

# Kesher Grounded Search

Use this skill when adding search-grounded features to the Kesher prototype or delivery plan.

## Workflow

1. Confirm the use case needs freshness, citation, or URL context.
2. Prefer deterministic sources for stable domains such as Jewish calendar rules; use search grounding for time-sensitive safety, event, and policy lookup.
3. Render citations and source chips with every grounded answer.
4. Keep search out of people search, background checks, social stalking, broad discovery, and user ranking.
5. Route date-venue details through Maps when place metadata is required.
6. Log only operational metadata; do not store search result content as profile data.

## Prototype Surface

The Vercel prototype page should show the route map, allowed use cases, citation requirements, and blocked use cases.

## Stop Points

Stop before enabling background user lookup, caching third-party search results, removing source attribution, or sending sensitive personality data to a non-approved search workflow.


## Implementation Workflow
1. **Tool Configuration:** Configure the Gemini API call to include the Google Search grounding tool.
2. **Citation Parsing:** Parse the response to extract and render citations correctly in the UI.
3. **Use Case Restriction:** Ensure grounding is only used for approved use cases (e.g., safety advice, event discovery).

## Manus Execution Directive
- **Capability:** `web_development`
- **Connector:** Gemini API
- **Action:** Implement Google Search grounding in the Gemini API call and render citations.
