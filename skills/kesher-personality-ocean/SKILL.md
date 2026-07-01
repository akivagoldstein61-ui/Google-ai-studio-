---
name: kesher-personality-ocean
description: "Implement Kesher OCEAN/Big Five personality reflection with Jewish observance context and Hebrew-first localization. Use when generating culturally aware reflection cards, consent-scoped discovery experiments, or non-deterministic personality interpretation."
---

# Kesher Personality OCEAN

Use this skill when working with broad Big Five/OCEAN language. Keep observance separate from personality, avoid protected-trait inference, and do not use personality as a hidden public ranking or compatibility verdict.


## Implementation Workflow
1. **Trait Mapping:** Map the calculated OCEAN scores to specific behavioral archetypes (e.g., High Openness -> "Exploratory").
2. **Copy Generation:** Write calm, non-judgmental copy for each archetype to be used in the `Private Owner` profile.
3. **UI Integration:** Render the archetypes in the `PersonalityProfileSkill.tsx`.

## Output Pattern: Trait Copy
```json
{
  "trait": "Openness",
  "level": "High",
  "copy": "You tend to seek out new experiences and ideas. You might enjoy dates that involve learning or exploring unfamiliar places."
}
```

## Manus Execution Directive
- **Capability:** `technical_writing`, `web_development`
- **Action:** Map OCEAN scores to behavioral archetypes and implement the corresponding copy in the UI.
