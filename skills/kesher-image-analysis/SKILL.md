---
name: kesher-image-analysis
description: "Implement trust-forward image analysis for Kesher photo readiness, accessibility alt text, moderation assistance, appeal support, tiered human review, and protected-trait/attractiveness safety boundaries."
---

# Kesher Image Analysis

Use this skill when changing photo upload checks, visual moderation, accessibility alt text, or moderator review tooling.

## Workflow

1. Split member-facing coaching from moderator-facing decision support.
2. Run deterministic checks first: format, resolution, metadata stripping, duplicate detection, and policy prefilters.
3. Use model output only as assistive evidence; punitive actions require human review.
4. Keep member-facing copy constructive, specific, and non-judgmental.
5. Never infer attractiveness, race, ethnicity, religion, body type, emotional state, or personality from appearance.
6. Store minimal decision codes and delete derived image data when the user deletes the photo/account.

## Prototype Surface

The Vercel prototype page should show tiered decisioning, member/moderator schemas, privacy controls, and review queues.

## Stop Points

Stop before adding biometric identification, attractiveness ranking, protected-trait inference, automated punitive action, or long-lived visual descriptors.


## Implementation Workflow
1. **Upload Handling:** Implement the photo upload flow to Firebase Storage.
2. **Vision API Call:** Implement a server route to call the Gemini Vision API with the uploaded photo.
3. **Schema Parsing:** Parse the response into the `PhotoAnalysisSchema` and flag issues for human review if necessary.

## Manus Execution Directive
- **Capability:** `web_development`
- **Connector:** Gemini API
- **Action:** Implement the Gemini Vision API integration for photo analysis and moderation flagging.
