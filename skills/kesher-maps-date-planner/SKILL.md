---
name: kesher-maps-date-planner
description: "Build Google Maps-grounded Kesher date planning with venue suggestions, fairness previews, observance-aware scheduling, safe-venue defaults, accessibility-conscious planning, citation UI, and user-reviewed sending."
---

# Kesher Maps Date Planner

Use this skill when changing grounded date suggestions or venue planning. Keep locations coarse unless the user explicitly narrows them, show citations/provenance, and require user review before any plan is sent.


## Implementation Workflow
1. **API Integration:** Integrate the Google Maps Places API in the backend route.
2. **Data Formatting:** Format the Maps data into the `DateIdeasSchema`.
3. **UI Rendering:** Render the date ideas in the `DatePlannerModal.tsx`.

## Manus Execution Directive
- **Capability:** `web_development`
- **Action:** Implement the Google Maps Places API integration and format the output.
