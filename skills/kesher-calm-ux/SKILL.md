---
name: kesher-calm-ux
description: "Design premium calm UX for the Kesher dating app. Use when designing screens, user flows, onboarding, profile builders, matching interfaces, safety tools, Hebrew-first RTL layouts, accessibility standards, and anti-casino dating mechanics."
---

# Kesher Calm UX

Use this skill to keep Kesher quiet, intentional, and trust-forward. Prefer clear controls, restrained density, calm pacing, RTL-aware layouts, and copy that helps users act without pressure or scarcity mechanics.


## Implementation Workflow
1. **Typography Audit:** Audit the codebase for typography classes to ensure they use the defined calm, serif-heavy style.
2. **RTL Support:** Ensure all layout classes use logical properties (e.g., `ms-`, `me-` instead of `ml-`, `mr-`) to support Hebrew RTL rendering.
3. **Color Palette:** Verify adherence to the defined calm color palette.

## Manus Execution Directive
- **Capability:** `web_development`, `shell`
- **Action:** Audit Tailwind classes using `grep` to ensure RTL support and adherence to the calm UX guidelines.
