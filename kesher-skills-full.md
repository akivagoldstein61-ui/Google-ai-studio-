# Kesher Skills - Full Shareable Markdown

This file combines every `SKILL.md` found in the bundle and app repo. Reference files remain in the extracted folders and installable zip.


---

# google-ai-studio-app-builder

Source: `.claude/skills/google-ai-studio-app-builder/SKILL.md`

---
name: google-ai-studio-app-builder
description: Build, deploy, and harden full-stack AI applications using Google AI Studio. Use when prototyping with Build mode, designing prompt-to-code apps, integrating Firebase AI Logic, deploying to Cloud Run, or following the 7-day hardening plan from prototype to MVP.
---

# Google AI Studio App Builder

Build AI-powered applications using Google AI Studio's **Build mode**, Gemini API, and Firebase ecosystem. From prototype to production.

## App Building Patterns

| Pattern | Description | Key Tools |
|---------|-------------|-----------|
| A: Prompt Experiment | Prompt playground to contract | AI Studio prompt editor |
| B: Prompt-to-Code Demo | Build mode scaffold | AI Studio Build mode |
| C: Grounded Answers | Search + URL Context app | Google Search grounding |
| D: RAG App | File Search for retrieval | File Search API |
| E: Voice/Multimodal Live | Real-time voice/video | Gemini Live API |
| F: Mobile Client | Client-side model calls | Firebase AI Logic |
| G: Open-Weight | Self-hosted models | Gemma 4 series |

## Build Mode Workflow

1. **Prompt** → Write system instructions and test in playground
2. **Baseline scaffold** → Use Build mode to generate initial app
3. **Lock contract** → Define input/output schemas, safety settings
4. **Iterate** → Chat or annotate to refine
5. **Integrate** → Add secrets, external APIs
6. **Firebase provision** → Set up auth, database, hosting
7. **Export** → Push to GitHub repo

## Production Handoff

### GitHub Export

```
AI Studio Build mode → Export to GitHub → CI pipeline → Cloud Run
```

### CI/CD Pipeline

```yaml
# Recommended pipeline stages
lint → test → build → deploy
```

### Cloud Run Deployment

- Build mode's default Cloud Run deploy is NOT production-safe
- Set up proper billing isolation
- Configure abuse controls (rate limits, quotas)
- Add observability (logging, monitoring, alerting)

## 7-Day Hardening Plan

| Day | Focus | Deliverable |
|-----|-------|-------------|
| 1 | Contract freeze | Locked schemas, system instructions, safety settings |
| 2 | Repo setup | GitHub repo, CI pipeline, linting |
| 3 | Observability | Logging, monitoring, dashboards |
| 4 | Abuse controls | Rate limits, quotas, input validation |
| 5 | Evaluation | Test harness, golden cases, regression tests |
| 6 | Security | Auth, secrets management, prompt injection defense |
| 7 | Production posture | Rollback plan, on-call, launch decision |

## Key Technical Concepts

### Structured Outputs

```js
generationConfig: {
  responseMimeType: "application/json",
  responseSchema: { /* JSON Schema */ }
}
```

### Function Calling

```js
tools: [{
  functionDeclarations: [{
    name: "get_weather",
    description: "Get current weather",
    parameters: { type: "object", properties: { location: { type: "string" } } }
  }]
}]
```

### Thought Signatures

Use `thought_signature` in responses for debugging and correctness verification.

### Tool Incompatibilities

- Structured outputs + File Search: **incompatible** in same request
- Verify tool combinations before production

## Firebase AI Logic

For client-side model calls (mobile apps):

- Use Firebase AI Logic SDK
- Require Firebase App Check for abuse prevention
- Implement per-user quotas
- Use ephemeral tokens for Live API sessions

## Models

| Model | Best For | Notes |
|-------|----------|-------|
| Gemini 3 / 3.1 | Latest capabilities | Preview, may not be stable |
| Gemini 2.5 Pro | Complex reasoning | Production-ready |
| Gemini 2.5 Flash | Balanced speed/quality | Primary workhorse |
| Gemini 2.5 Flash-Lite | Speed-critical tasks | Lowest latency |
| Gemma 4 (31B) | Self-hosted, open-weight | Full control, no API dependency |

## Best Practices

- Prefer contracts over folklore — define schemas explicitly
- Use thinking controls intentionally (not by default)
- Grounding and RAG are different tools for different problems
- Never embed API keys in client code
- Use ephemeral tokens for production Live API
- Revalidate model strings before production — prefer stable versions
- Do not treat Build mode deploys as production-safe

## References

- **Prompting playbooks**: See `references/prompting_playbooks.md` for task-specific prompt templates
- **Manus operator patterns**: See `references/manus_patterns.md` for Manus-specific app building workflows


---

# kesher-ai-feature-modules

Source: `.claude/skills/kesher-ai-feature-modules/SKILL.md`

---
name: kesher-ai-feature-modules
description: All 11 AI feature modules (F01-F11) for the Kesher dating app. Use when implementing, evaluating, or deploying any specific feature module — bio coaching, values phrasing, taste profiles, daily picks, match explanations, anti-burnout, moderation, scam detection, report intake, AI disclosure, or personality coaching.
---

# Kesher AI Feature Modules

Eleven AI feature modules organized in three deployment waves. Gemini handles the **language layer only** — ranking, enforcement, and core logic are deterministic.

## Module Inventory

| ID | Module | Wave | Category |
|----|--------|------|----------|
| F01 | Hebrew-first Bio Coach | 1: Trust Foundation | Coaching |
| F02 | Values / Observance Phrasing | 1: Trust Foundation | Coaching |
| F10 | AI Disclosure + Human-in-Control Composer | 1: Trust Foundation | Trust |
| F06 | Anti-Burnout Pacing Coach | 1: Trust Foundation | Wellbeing |
| F04 | Daily Picks + "Why These" | 2: Matching Intelligence | Matching |
| F05 | "Why This Match" Cards | 2: Matching Intelligence | Matching |
| F03 | Private Editable Taste Profile | 2: Matching Intelligence | Personalization |
| F07 | Harassment / Toxicity Classifier | 2: Matching Intelligence | Safety |
| F09 | Report Intake Assistant | 2: Matching Intelligence | Safety |
| F08 | Scam / Financial Solicitation Detector | 2: Matching Intelligence | Safety |
| F11 | Personality / Communication Coach | 3: Reflection Layer | Coaching |

## Deployment Waves

### Wave 1: Trust Foundation

Build user trust before adding intelligence features. Deploy F01, F02, F10, F06 first.

### Wave 2: Matching Intelligence

Add AI-powered matching and safety features. Deploy F04, F05, F03, F07, F09, F08.

### Wave 3: Reflection Layer

Add deeper coaching after trust and matching are established. Deploy F11.

## Shared Contracts

### Moderation Contract

All safety modules (F07, F08, F09) share:
- Deterministic rules run first, then LLM assessment
- Human moderator reviews all punitive actions
- Decision codes logged (not detailed descriptions)
- Escalation paths to human support

### Answer Contract

Every module must specify:
- Input schema and validation rules
- Output schema (user-facing + internal reasoning)
- Model and thinking level
- Consent requirements
- Approval boundary (what requires human approval)

## Per-Module Quick Reference

For detailed specs on each module, see the references directory:

- **F01-F02 Coaching modules**: See `references/coaching_modules.md`
- **F03-F06 Matching and wellbeing**: See `references/matching_modules.md`
- **F07-F09 Safety modules**: See `references/safety_modules.md`
- **F10-F11 Trust and reflection**: See `references/trust_modules.md`

## Hebrew/RTL Requirements

All modules must:
- Generate Hebrew-first content with proper RTL handling
- Follow Unicode Bidirectional Algorithm (UAX #9)
- Follow W3C RTL Authoring Guidance
- Pass Bidi stress testing before deployment
- Support mixed Hebrew/English content gracefully

## Guiding Principles

- **Bounded AI, not maximal AI** — enhance clarity, calm, and safety
- **Coaching over generation** — keep the user's voice central
- **Provenance and auditability** — trace all AI claims to user data
- **Human-in-control** — explicit user approval for all actions
- **Sensitive data minimization** — minimize religious and personality data storage
- **No secret ranking** — AI never secretly ranks or scores users
- **No chatfishing** — clear authorship attribution, manual sending required


---

# kesher-ai-governance

Source: `.claude/skills/kesher-ai-governance/SKILL.md`

---
name: kesher-ai-governance
description: Implements AI feature allocation, system boundaries, and governance for the Kesher dating app. Use this skill to manage the AI feature registry, model routing logic, and enforce strict safety policies and human-in-the-loop triggers.
---

# Kesher AI Governance & System Boundaries Skill

This skill provides the framework for managing and governing all AI features within the Kesher app. It ensures that AI is deployed responsibly, safely, and transparently, adhering to strict red lines and operational boundaries.

## Core Principles

1.  **Centralized Registry:** All AI features must be registered in a central catalog defining their purpose, required consent, data access, and fallback behavior.
2.  **Model Routing by Task:** Use lightweight, fast models (e.g., Gemini Flash) for low-latency, deterministic tasks (like structured extraction). Reserve heavier models (e.g., Gemini Pro) for complex reasoning or creative generation (if permitted).
3.  **Strict Red Lines:** Enforce absolute prohibitions on certain AI behaviors (e.g., photo-based trait inference, automated chatting).
4.  **Human-in-the-Loop (HITL):** Define clear thresholds where AI systems must escalate to human moderators (e.g., high-confidence abuse detection).

## Implementation Workflow

### 1. The AI Feature Registry

The registry is the source of truth for all AI capabilities in the app. Before any AI feature can be executed, it must be validated against its registry entry.

*See `/home/ubuntu/skills/kesher-ai-governance/references/feature_registry_schema.md` for the registry definition format.*

**Key Registry Fields:**
-   `feature_id`: Unique identifier (e.g., `generate_explanation`, `extract_hobbies`).
-   `requires_consent`: Boolean indicating if explicit user opt-in is needed.
-   `allowed_data_scopes`: Which data domains the feature can access (e.g., `public_profile`, `private_taste`).
-   `prohibited_data`: Data that must be scrubbed before execution (e.g., `messages`, `exact_location`).
-   `fallback_action`: What to do if the AI service fails or is blocked by safety filters.

### 2. Model Routing Heuristics

Kesher uses a multi-model strategy to balance cost, latency, and capability.

-   **Tier 1: Deterministic / Local:** Use on-device logic or simple server-side heuristics for tasks that don't require LLM reasoning (e.g., hard filter matching, basic dwell time calculation).
-   **Tier 2: Fast LLM (e.g., Gemini Flash):** Use for tasks requiring natural language understanding but low latency, such as extracting structured data from profile prompts or generating short, template-based explanations.
-   **Tier 3: Heavy LLM (e.g., Gemini Pro):** Use sparingly, only for complex, offline tasks (e.g., periodic batch analysis of anonymized system-wide trends, if approved by policy). Do not use for real-time ranking or chat generation.

### 3. Safety Policy Enforcement (The Red Lines)

The governance layer must enforce the following absolute prohibitions programmatically:

1.  **No Automated Chatting:** The AI must never generate or send messages on behalf of a user.
2.  **No Photo Inference of Sensitive Traits:** Computer vision models may only be used for basic moderation (e.g., detecting nudity or violence) or verifying that a photo contains a face. They must *never* be used to infer Jewish status, observance level, ethnicity, or attractiveness.
3.  **No Hidden Manipulation:** Ranking algorithms must not use hidden weights to optimize for metrics that misalign with user intent (e.g., intentionally hiding good matches to prolong app usage).

### 4. Human-in-the-Loop (HITL) Triggers

AI systems are used to flag potential issues, but human moderators make the final decisions on severe actions.

**HITL Escalation Scenarios:**
-   **High-Confidence Abuse Flag:** If the NLP model detects potential harassment or hate speech in a prompt or message (if message scanning is enabled for safety), the content is hidden, and the profile is queued for human review.
-   **Identity Verification Failure:** If the automated verification system flags a profile as highly suspicious (e.g., potential bot or impersonation), human review is required before the profile is banned.
-   **Model Degradation:** If the explanation generator repeatedly triggers safety filters or falls back to generic templates, an alert is sent to the engineering team for review.

## Bundled Resources

-   **`references/feature_registry_schema.md`**: The JSON schema for defining AI features and their boundaries.
-   **`references/safety_policies.md`**: Detailed documentation of the red lines and HITL workflows.


---

# kesher-calm-ux

Source: `.claude/skills/kesher-calm-ux/SKILL.md`

---
name: kesher-calm-ux
description: Premium calm UX strategy for the Kesher dating app. Use when designing screens, user flows, onboarding, profile builders, matching interfaces, or safety tools. Covers Hebrew-first RTL design, calm aesthetic principles, accessibility standards, and competitive differentiation.
---

# Kesher Calm UX

Design a **premium, calm, relationship-minded** dating experience. Low stimulation, high clarity, Hebrew-first.

## Design Principles

| Principle | Implementation |
|-----------|---------------|
| Calm over stimulation | Muted palette, generous whitespace, no gamification |
| Clarity over cleverness | Plain language, obvious actions, no dark patterns |
| Hebrew-first | RTL layout, Hebrew typography, mixed-language support |
| Explanation over mystery | Show why matches were suggested, how AI helps |
| Coached authenticity | Help users be themselves, not perform |
| Premium = less noise | Premium reduces clutter, not adds social leverage |

## Core User Flows

### Onboarding

Multi-step process grouped by meaning:
1. **Identity**: Name, age, photos
2. **Goals**: Relationship intent, timeline
3. **Values**: Observance, lifestyle, deal-breakers
4. **Profile**: Bio (with coach rail), prompts

Each step has a "coach rail" — optional AI assistance that suggests, never auto-fills.

### Discovery

Two modes:
- **Daily Picks**: Finite batch (e.g., 5-10) with "Why these" explanations
- **Explore**: Broader browsing with filters

Daily Picks are the primary mode. Finite batches prevent swipe fatigue.

### Matching

- Match explanations visible on every profile card
- Post-match: Suggest grounded next actions (openers, voice notes)
- No "super likes" or engagement-maximizing mechanics

### Safety

- Report and block accessible from profile and chat
- Safety Centre with Q&A
- AI Trust Hub for transparency

## Hebrew-First Design

### Typography
- Primary: Hebrew typeface optimized for screen readability
- Support mixed Hebrew/English content
- Minimum body text size: 16px

### RTL Layout
- Follow W3C RTL Authoring Guidance
- Mirror all directional UI elements
- Test with Bidi stress testing
- Handle mixed-direction text (Hebrew + English names, URLs)

### Cultural Considerations
- Shabbat-aware notifications (optional quiet mode)
- Jewish holiday awareness
- Observance spectrum respect (secular to ultra-orthodox)

## Accessibility

Follow WCAG 2.2 AA minimum:
- Color contrast ratios (4.5:1 for text)
- Touch targets (minimum 44x44px)
- Screen reader compatibility
- Keyboard navigation support
- Reduced motion option
- Voice navigation support (see `kesher-voice-integration` skill)

## Premium Feature Philosophy

Premium features should:
- Reduce noise and save time
- Provide deeper insights (not more matches)
- Offer advanced planning tools
- Never sell social leverage or unfair advantages

Premium should NOT:
- Gate basic safety features
- Create "pay-to-win" dynamics
- Offer unlimited swipes or matches
- Provide "who liked you" as primary value

## Competitive Differentiation

| Competitor Pattern | Kesher Alternative |
|-------------------|-------------------|
| Infinite swipe | Finite daily picks with explanations |
| Gamification (streaks, coins) | Calm, purposeful interactions |
| Premium = more matches | Premium = deeper tools |
| Hidden algorithms | Transparent "why this match" |
| AI chatbot companion | Bounded AI utilities |
| English-first with translation | Hebrew-first with English support |

## References

- **Apple HIG**: Follow for iOS design patterns
- **Material Design**: Follow for Android design patterns
- **SF Symbols**: Use for iconography on iOS


---

# kesher-explainable-ai

Source: `.claude/skills/kesher-explainable-ai/SKILL.md`

---
name: kesher-explainable-ai
description: Implements "Why this match" explanations, trust language, and transparency for the Kesher dating app. Use this skill to generate safe, calm, and accurate explanations for AI recommendations using whitelisted signals and fallback templates.
---

# Kesher Explainable AI & Trust Language Skill

This skill governs how Kesher's AI communicates its reasoning to users. It ensures that explanations for matches ("Why this match") are safe, understandable, and build trust by adhering to strict guidelines on what can and cannot be said.

## Core Principles

1.  **AI as Assistant, Not Authority:** The language must frame the AI as a helpful tool suggesting possibilities, not an oracle dictating destiny. Avoid deterministic phrases like "perfect match" or "soulmate."
2.  **Whitelisted Signals Only:** Explanations can *only* use signals from a pre-approved whitelist (e.g., shared hobbies, overlapping explicit filters). They must never reveal hidden weights or inferred traits.
3.  **Protect the Other Person's Privacy:** An explanation must never reveal the other person's private preferences or swiping history. It can only reference what the other person has made public on their profile.
4.  **Calm and Concrete Language:** Use natural, grounded language (in Hebrew) rather than overly technical or mystical terms.
5.  **Graceful Degradation:** If the generative model fails safety checks or if the user has disabled personalization, the system must fall back to generic, deterministic templates.

## Implementation Workflow

### 1. The Explanation Pipeline

The process of generating an explanation is distinct from the ranking process:

1.  **Ranking Authority:** The ranking engine scores candidates and outputs an "evidence packet" containing only whitelisted reason codes.
2.  **Explanation Generation:** The explanation service (using Gemini or deterministic templates) takes this evidence packet and renders it into human-readable text.
3.  **Safety Validation:** The generated text is checked against safety policies before being displayed to the user.

### 2. Whitelisted Signals

The evidence packet provided to the explanation generator may only contain data from this whitelist:

-   Shared explicit interests/hobbies listed on public profiles.
-   Overlapping hard filters or soft preferences (e.g., both looking for a serious relationship).
-   Compatible observance self-descriptions (if explicitly user-facing).
-   Recent activity freshness (e.g., "Active recently").

*See `/home/ubuntu/skills/kesher-explainable-ai/references/signal_whitelist.md` for the complete schema.*

### 3. Generating the Explanation

**Using Generative AI (Gemini):**

When using a model like Gemini to generate natural language explanations, use a strict system prompt and require structured output (JSON) to ensure the model doesn't hallucinate reasons.

*See `/home/ubuntu/skills/kesher-explainable-ai/references/explanation_prompts.md` for the specific prompt templates and JSON schemas.*

**Deterministic Fallbacks:**

If the generative model fails, or if the user has opted out of personalized taste learning, use pre-written templates.

*Example Fallback:* "Shown because they match your current filters and are active in your area."

### 4. Trust-Building Copy Guidelines

All copy related to AI features must follow these guidelines:

-   **Do use:** "Based on what you both shared...", "It looks like...", "You might connect over..."
-   **Do not use:** "Our algorithm determined...", "You are a 98% match...", "We know what you want..."
-   **Always provide a way out:** Include clear UI controls (e.g., "Less like this", "Manage Taste Profile") alongside the explanation.

## Bundled Resources

-   **`references/signal_whitelist.md`**: The definitive list of data points allowed in explanations.
-   **`references/explanation_prompts.md`**: System prompts and structured output schemas for generative explanations.


---

# kesher-filtering-marketplace

Source: `.claude/skills/kesher-filtering-marketplace/SKILL.md`

---
name: kesher-filtering-marketplace
description: Implements filtering grammar, marketplace mechanics, and reciprocal ranking for the Kesher dating app. Use this skill to manage hard vs. soft filters, structure Daily Picks vs. Explore surfaces, and enforce exposure fairness.
---

# Kesher Filtering Grammar & Marketplace Mechanics Skill

This skill defines the operational specifications for Kesher's dating marketplace. It establishes the rules for what users can filter out, how the system ranks candidates reciprocally, and how different product surfaces (Daily Picks vs. Explore) behave to maintain a healthy, liquid marketplace.

## Core Principles

1.  **Reciprocal Recommendation:** Dating is a two-sided market. The system must score matches based on the likelihood of *mutual* interest, not just one-sided attraction.
2.  **Hard Filters vs. Soft Preferences:** The system enforces a strict distinction between absolute dealbreakers (hard filters) and ranking signals (soft preferences).
3.  **Surface Distinction:** "Daily Picks" is highly curated, AI-driven, and limited. "Explore" is user-directed, filter-driven, and exhaustive.
4.  **Exposure Fairness:** The system must actively prevent "starvation" (where some users get zero visibility) by balancing relevance with equitable distribution of impressions.

## Implementation Workflow

### 1. Filtering Grammar

Kesher uses a specific grammar to define how user preferences interact with the candidate pool.

-   **Hard Filters (Dealbreakers):** These are absolute exclusions. If a candidate violates a hard filter, they are removed from the candidate pool entirely (Score = 0).
    *   *Examples:* Age range, maximum distance, specific observance red lines (e.g., must be Shomer Shabbat).
-   **Soft Preferences (Ranking Signals):** These influence the ranking score but do not exclude candidates. They are used to order the eligible pool.
    *   *Examples:* Preferred communication style, specific hobbies, "more like this" behavioral signals.
-   **System Exclusions:** The system automatically excludes candidates based on trust and safety rules (e.g., blocked users, reported users, suspected bots).

### 2. Reciprocal Scoring Formula

To ensure mutual compatibility, the final ranking score for a pair (User A and User B) must incorporate both perspectives.

`Final_Score(A, B) = f( Score(A likes B), Score(B likes A) )`

A common heuristic is to use the harmonic mean, which penalizes pairs where one-sided interest is very low:

`Final_Score = (2 * Score(A likes B) * Score(B likes A)) / (Score(A likes B) + Score(B likes A))`

*See `/home/ubuntu/skills/kesher-filtering-marketplace/references/scoring_heuristics.md` for detailed scoring logic.*

### 3. Marketplace Surfaces

The app divides discovery into two distinct surfaces to balance AI curation with user agency.

| Surface | Characteristics | AI Role | Goal |
| :--- | :--- | :--- | :--- |
| **Daily Picks** | Limited batch (e.g., 5-10 per day). High relevance threshold. | Heavy curation based on learned taste, reciprocal scoring, and exposure fairness. | Drive high-quality mutual matches and trust in the system. |
| **Explore** | Uncapped browsing. Driven by explicit user filters. | Minimal curation. Primarily orders candidates matching hard/soft filters. | Provide user agency and exhaust the local liquidity pool. |

### 4. Exposure Fairness & Anti-Starvation

To maintain a healthy marketplace, the ranking system must not overly concentrate impressions on a small percentage of "highly attractive" users.

-   **Impression Caps:** Implement a soft cap on the number of times a highly popular profile is shown in a given period.
-   **Boost for New Users:** Artificially inflate the ranking score of new users for their first 48-72 hours to gather initial behavioral data and provide a welcoming experience.
-   **Starvation Prevention:** Monitor users who have received zero impressions in the last 7 days and apply a temporary ranking boost to ensure they are seen by compatible candidates.

## Bundled Resources

-   **`references/scoring_heuristics.md`**: Detailed formulas and weights for reciprocal scoring and exposure fairness adjustments.


---

# kesher-gemini-integration

Source: `.claude/skills/kesher-gemini-integration/SKILL.md`

---
name: kesher-gemini-integration
description: Core patterns for integrating Gemini AI into the Kesher dating app. Use when building, configuring, or debugging any Gemini-powered feature — structured outputs, function calling, grounding, system instructions, server-side proxy architecture, and trust-preserving interaction patterns.
---

# Kesher Gemini Integration

Integrate Gemini as a **bounded assistive layer** across Kesher surfaces. Gemini is a tool, not a companion.

## Core Architecture

All Gemini calls go through a **server-side proxy** (`/api/ai/*`). Never expose API keys to the client.

```
Client → Express route → Policy gate → Gemini API → Structured JSON → Client
```

### Model Selection

| Model | Use Case | Notes |
|-------|----------|-------|
| Gemini 2.5 Flash-Lite | Silent tasks (safety scan, classification) | Lowest latency |
| Gemini 2.5 Flash | User-visible generation (rephrase, coaching) | Balanced |
| Gemini 2.5 Pro / 3 | Multi-constraint planning, deep help | Higher cost, use selectively |

### Structured Outputs

Always use JSON mode for predictable results:

```js
const result = await model.generateContent({
  contents: [{ role: "user", parts: [{ text: prompt }] }],
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: { /* JSON Schema */ }
  }
});
```

Separate output schema into **user-facing text** and **internal reasoning** fields.

### Thinking Controls

- Gemini 3: use `thinkingLevel` (e.g., `"medium"`, `"high"`)
- Gemini 2.5: use `thinkingBudget` (token count)
- Access reasoning via `includeThoughts: true`

## Surface-by-Surface Feature Map

| Surface | Feature | Model Tier |
|---------|---------|------------|
| OnboardingFlow | Bio coaching, field explanation | Flash |
| ProfileBuilder | Draft generation, clarity audit | Flash |
| DailyPicksScreen | "Why these" explanations | Flash |
| ExploreScreen | Match explanations | Flash |
| ChatThread | Rephrase, safety scan, opener suggestions | Flash-Lite (scan), Flash (rephrase) |
| SafetyCentre | Q&A with Search grounding | Flash + Search |
| DatePlanner | Venue suggestions with Maps grounding | Pro + Maps |
| ReportFlow | Report drafting assistance | Flash |
| AITrustHub | Disclosures, settings explanation | Deterministic + Flash |

## Tooling Integration

### Google Search Grounding

```js
tools: [{ googleSearch: {} }]
```

Use for: Safety Centre Q&A, event discovery, freshness-dependent answers. Always render `groundingMetadata` citations.

### Google Maps Grounding

```js
tools: [{ googleMaps: {} }]
```

Use for: Date planning, venue suggestions. Render `googleMapsWidgetContextToken` for interactive maps.

### URL Context

```js
tools: [{ urlContext: {} }]
```

Use for: Internal policy lookups, curated resource pages.

## Trust Principles

1. **User authorship** — All AI output is a draft; user must explicitly confirm/send
2. **No impersonation** — AI never acts as or speaks for the user
3. **No auto-send** — Messages require manual sending
4. **Transparency** — Mark AI-generated content; disclose data handling in AI Trust Hub
5. **Safety is free** — Never paywall dignity, safety, or basic self-expression
6. **Bounded scope** — Stateless by default; session-only context; no companion behavior

## Security Checklist

- Auth gating on all `/api/ai/*` routes
- Rate limits and per-user quotas
- Input sanitization against prompt injection
- Feature registry with allowlisted capabilities
- Feature flags and experiments as ship gates
- 55-day data retention for abuse monitoring (Google policy)
- `store: false` with Interactions API unless state explicitly required

## Banned Uses

- AI impersonation of users
- Attractiveness scoring
- Deceptive profile enhancement
- Auto-messaging or auto-booking
- Background checks on matches
- Emotional companion framing

## References

- **Surface details**: See `references/surfaces.md` for per-surface implementation specs
- **Schema examples**: See `references/schemas.md` for JSON Schema templates


---

# kesher-high-thinking-routing

Source: `.claude/skills/kesher-high-thinking-routing/SKILL.md`

---
name: kesher-high-thinking-routing
description: Routing strategy for Gemini "high thinking" mode in the Kesher dating app. Use when deciding when to enable thinking controls, configuring thinkingLevel/thinkingBudget, designing hybrid fast+thinking patterns, or planning A/B tests for thinking-enabled features.
---

# Kesher High Thinking Routing

Use Gemini's **thinking capability** selectively for tasks requiring judgment under ambiguity. Not for speed-dominant tasks.

## When to Use High Thinking

| Use Case | Thinking? | Rationale |
|----------|-----------|-----------|
| Multi-constraint date planning | Yes | Location + budget + time + observance + safety |
| Trust-preserving phrasing | Yes | Nuanced language that avoids harm |
| Compatibility report synthesis | Yes | Multi-signal personality analysis |
| Report severity classification | Yes | Judgment under ambiguity |
| Appeal draft support | Yes | Complex context evaluation |
| Chat rephrase | No | Speed-dominant, simple task |
| Safety scan (pre-send) | No | Must be fast and silent |
| Simple content generation | No | Low complexity, high volume |
| Bio draft generation | No | Flash is sufficient |

## Configuration

### Gemini 3 Series

```js
generationConfig: {
  thinkingConfig: {
    thinkingLevel: "medium" // "none" | "low" | "medium" | "high"
  }
}
```

### Gemini 2.5 Series

```js
generationConfig: {
  thinkingConfig: {
    thinkingBudget: 2048 // token count for thinking
  }
}
```

### Accessing Thoughts

```js
generationConfig: {
  thinkingConfig: {
    includeThoughts: true // returns reasoning in response
  }
}
```

Use `includeThoughts` for debugging and observability, not for user display.

## Hybrid Pattern

For complex tasks, use a **two-stage hybrid**:

1. **Stage 1**: Fast model (Flash-Lite) performs structured extraction or grounding
2. **Stage 2**: High-thinking model synthesizes the extracted data

```
User request → Flash-Lite (extract/ground) → Structured data → Pro+Thinking (synthesize) → Response
```

This reduces cost and latency while preserving quality for the synthesis step.

## Cost-Benefit Framework

| Factor | Low Thinking | High Thinking |
|--------|-------------|---------------|
| Latency | ~200-500ms | ~2-8s |
| Cost per request | Low | 3-10x higher |
| Quality for simple tasks | Sufficient | Overkill |
| Quality for ambiguous tasks | May miss nuance | Significantly better |
| User expectation | Instant response | Willing to wait for "deep help" |

## User-Visible "Deep Help" Mode

When high thinking is engaged for user-facing features:
- Show a **"Thinking deeply..."** indicator
- Clearly disclose that the AI is taking more time for a better answer
- Frame as a premium feature where appropriate
- Never use high thinking silently on free-tier features that should be fast

## A/B Testing Plan

| Experiment | Control | Treatment | Metric |
|-----------|---------|-----------|--------|
| Date planning quality | Flash only | Flash + Pro thinking | User satisfaction, plan acceptance rate |
| Match explanation depth | Flash | Flash + thinking | Engagement with explanation cards |
| Report classification | Flash | Flash + thinking | Moderator agreement rate |
| Appeal support | Flash | Pro + high thinking | Appeal resolution time |

## Observability Metrics

- Token count (input + output + thinking tokens)
- Latency (P50, P95, P99)
- Thinking token ratio (thinking tokens / total tokens)
- User satisfaction per feature
- Cost per request by feature and thinking level

## Red Lines

- Never use high thinking to create "compatibility certainty theater"
- Frame outputs as "signals + questions + caveats"
- Route safety/mental-health crises to real support, not deeper AI thinking
- Do not use thinking to generate pseudo-therapeutic content


---

# kesher-learned-taste

Source: `.claude/skills/kesher-learned-taste/SKILL.md`

---
name: kesher-learned-taste
description: Implements implicit and explicit preference learning, taste profiles, and ranking authority for the Kesher dating app. Use this skill to manage event capture, calculate taste weights, and structure hybrid (on-device/server) recommendation architectures.
---

# Kesher Learned Taste & Preference Learning Skill

This skill defines the architecture and algorithms for Kesher's learned taste system. It transforms explicit user controls and implicit behavioral traces into a persistent preference state used during ranking, ensuring auditable ranking authority and safe, explainable recommendations.

## Core Principles

1.  **Explicit Over Implicit:** Explicit controls (e.g., hard filters, "more like this") always outrank implicit behavioral hints (e.g., dwell time, passive swiping).
2.  **Behavior as Observation, Not Truth:** Implicit events are treated as noisy observations with variable confidence, not as direct negatives or stable ground truth.
3.  **Temporal Dynamics (Dual Memory):** Recency is modeled with both short-term (fast) and long-term (slow) memory states to react to current moods without discarding durable preferences.
4.  **Hybrid Architecture:** Event capture, buffering, and local cache live on the device. Canonical ranking, cross-user learning, and audit controls live on the server.
5.  **Strict Bounding:** The ranking authority decides what is eligible and scored. The explanation layer only verbalizes whitelisted reasons emitted by the ranking authority.

## Implementation Workflow

### 1. Event Capture Taxonomy

The system must capture four classes of events to build the taste profile. Crucially, message text, photos, and precise locations are excluded from taste learning for privacy reasons.

| Event Class | Description | Examples |
| :--- | :--- | :--- |
| **Policy & Consent** | High-level user decisions regarding their data and experience. | Onboarding completion, hard filter edits, taste-profile consent, taste reset. |
| **Explicit Preference** | Direct, intentional signals of attraction or aversion. | Like, pass, "more like this," "less like this," hide, block, direct tag edits. |
| **High-Signal Implicit** | Behavioral traces that strongly suggest interest or engagement. | Profile open, photo carousel depth, prompt expansion, long dwell time, reply received. |
| **Context** | Environmental factors that may influence current preferences. | Surface (Daily Picks vs. Explore), time of day, session stage, device class. |

*See `/home/ubuntu/skills/kesher-learned-taste/references/event_schemas.md` for detailed JSON schemas.*

### 2. Weighting Policy (The Update Rule)

The system calculates preference updates using a signed update rule:

`Update = Authority × Confidence × Recency × Eligibility`

**Authority Hierarchy:**
1.  **Absolute Controls:** Block, report, hard filters.
2.  **Highest Preference Controls:** "More like this," "less like this," direct tag edits, reset.
3.  **Strong Supervised Outcomes:** Like, mutual match, message sent, reply received.
4.  **Medium Implicit Cues:** Profile open, long dwell, prompt expansion.
5.  **Weak Implicit Cues:** Impression only (Note: Missing impressions are never interpreted as dislike).

### 3. Temporal Dynamics (Dual Memory)

To balance immediate mood with long-term compatibility, maintain two simultaneous memory states:

-   **Fast Taste State:** Half-life of 1-2 weeks. Used to adapt the Daily Picks algorithm to recent activity.
-   **Slow Taste State:** Half-life of 2-3 months. Used to stabilize the user embedding and prevent mood swings from causing long-term distortion.

### 4. Taste Reset Semantics

When a user triggers a "Taste Reset," the system must clear the learned taste vector, explicit anchors, explanation history cache, and on-device summaries. It must **not** clear abuse, consent, or legal-retention records.

## Bundled Resources

-   **`references/event_schemas.md`**: JSON schemas for capturing the four classes of events (Policy, Explicit, Implicit, Context).
-   **`references/hybrid_architecture.md`**: Detailed breakdown of responsibilities between the client (on-device) and the server.


---

# kesher-low-latency-ai

Source: `.claude/skills/kesher-low-latency-ai/SKILL.md`

---
name: kesher-low-latency-ai
description: Server-side AI proxy architecture for low-latency responses in the Kesher dating app. Use when implementing the model routing matrix, latency targets, streaming patterns, feature registry, or policy-aware AI request handling.
---

# Kesher Low-Latency AI

Move from Google AI Studio prototype to a **production-ready, server-side routing architecture** that matches the right model to each user moment.

## Architecture Components

```
Client → Express API → Feature Registry → Policy Layer → Model Router → Gemini API → Schema Validator → Client
```

### Feature Registry

Allowlist of registered AI capabilities with metadata:

```js
const featureRegistry = {
  safety_scan: { model: 'flash-lite', policy: 'silent', streaming: false },
  rephrase_message: { model: 'flash', policy: 'visible', streaming: true },
  bio_coaching: { model: 'flash', policy: 'visible', streaming: true },
  date_planner: { model: 'pro', policy: 'grounded', streaming: false },
  match_explanation: { model: 'flash', policy: 'visible', streaming: false },
  deep_help: { model: 'pro', policy: 'thinking', streaming: true }
};
```

### Policy Layer

Enforces rules before any model call:
- Auth verification
- Rate limiting (per-user, per-feature)
- Input sanitization
- Feature flag check
- Consent verification (for personality/location features)

### Model Router

Maps features to routing lanes:

| Lane | Model | Streaming | Use Cases |
|------|-------|-----------|-----------|
| Fast | Flash-Lite | No | Safety scan, classification, silent tasks |
| Fast Visible | Flash | SSE | Rephrase, openers, coaching tips |
| Balanced | Flash | SSE | Bio coaching, match explanations |
| Grounded Planning | Pro + Maps/Search | No (buffer until validated) | Date planner, safety Q&A |
| Deep Planning | Pro + Thinking | SSE | Multi-constraint plans, deep help |

## Latency Targets

| Surface | P50 Target | P95 Target | Strategy |
|---------|-----------|-----------|----------|
| Messaging (safety scan) | <200ms | <500ms | Flash-Lite, no streaming |
| Messaging (rephrase) | <800ms | <1.5s | Flash, SSE streaming |
| Onboarding (bio coach) | <1s | <2s | Flash, SSE streaming |
| Planning (date planner) | <3s | <6s | Pro, buffer then render |
| Deep help | <5s | <10s | Pro + thinking, SSE with indicator |

## Streaming Strategy

### Server-Sent Events (SSE)

Use SSE for user-visible text generation:

```js
app.get('/api/ai/stream/:feature', authMiddleware, async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  const stream = await model.generateContentStream(/* ... */);
  for await (const chunk of stream) {
    res.write(`data: ${JSON.stringify(chunk)}\n\n`);
  }
  res.end();
});
```

### Buffered Responses

Use buffered responses for structured data that must be validated before display:

```js
app.post('/api/ai/:feature', authMiddleware, async (req, res) => {
  const result = await model.generateContent(/* ... */);
  const validated = validateSchema(result, featureRegistry[req.params.feature].schema);
  res.json(validated);
});
```

## Monetization Boundaries

- **Free**: Core safety features, basic rephrase, simple coaching
- **Premium**: Deep help, concierge planning, advanced coaching
- **Never paywalled**: Safety scans, report assistance, basic self-expression

Do not sell "premium speed" for core/safety features. Monetize depth and advanced planning.

## MVP Experiment

Validate the routing stack on three features before full rollout:

1. `safety_scan` — Fast lane validation
2. `rephrase_message` — Streaming validation
3. `date_planner` — Grounded planning validation

Measure: latency (P50/P95), error rate, user satisfaction, cost per request.

## Observability Dashboard

Track per-feature:
- Request volume and error rates
- Latency distribution (P50, P95, P99)
- Model token usage and cost
- Cache hit rates
- Feature flag activation rates


---

# kesher-maps-date-planner

Source: `.claude/skills/kesher-maps-date-planner/SKILL.md`

---
name: kesher-maps-date-planner
description: Google Maps-grounded date planning for the Kesher dating app. Use when building date suggestion features, venue recommendations, fairness previews, observance-aware scheduling, or accessibility-conscious date planning with the Gemini API and Google Maps Platform.
---

# Kesher Maps Date Planner

Plan dates using **Google Maps grounding** as an evidence layer for facts. Deterministic guardrails handle fairness, safety, and consent.

## Core Features

| Feature | Tier | Description |
|---------|------|-------------|
| Midpoint Plan Card | Free | 3-5 venue options near geographic midpoint |
| Fairness Preview | Free | Travel time comparison before sending |
| Safe-First Defaults | Free | Public, well-reviewed venues only |
| Plan Message Draft | Free | Editable message for user to send manually |
| One-Tap Open in Maps | Free | Direct link to Google Maps |
| Concierge Plan with Backups | Premium | Multi-stop itinerary with backup venues |
| Observance-Aware Scheduling | Premium | Shabbat, kashrut, holiday awareness |
| Accessibility Concierge | Premium | Wheelchair access, sensory considerations |
| Travel-Time Fairness Optimizer | Premium | Route optimization for equitable travel |

## Workflow

1. **Consent**: Both matched users agree to plan a date
2. **Input**: Requesting user provides constraints (area, budget, time, preferences)
3. **Generate**: Gemini + Maps grounding produces venue suggestions
4. **Fairness Preview**: Show travel times for both users before sending
5. **User Review**: User edits the plan message draft
6. **Manual Send**: User sends the plan to their match (never auto-sent)

## Technical Implementation

### Model Configuration

```js
const result = await model.generateContent({
  contents: [{ role: "user", parts: [{ text: planRequest }] }],
  tools: [{ googleMaps: {} }],
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: datePlanSchema
  }
});
```

**Models**: Gemini 2.5 Pro (complex plans), Gemini 2.5 Flash (simple suggestions)

### Maps Platform APIs

- **Places API**: Venue search, details, reviews, photos
- **Routes API**: Travel time calculations between locations

### Privacy Constraints

- Use **coarse locations** only (neighborhood/area, never exact address)
- Cache **Place IDs** only — not other Places content (per API terms)
- Never store or transmit precise user home locations

## Venue Safety Criteria

Default to venues that are:
- Public and well-lit
- Have Google reviews (minimum threshold)
- Open during planned time
- Accessible by public transport or have parking
- Not isolated locations

Expand venue types gradually based on moderation learning.

## Observance-Aware Features

- Use `@hebcal/core` for Shabbat times and Jewish holidays (deterministic, not AI)
- Filter venues for kashrut certification when user preference is set
- Avoid suggesting activities during Shabbat for observant users
- Include eruv-aware walking suggestions where relevant

## Output Schema

```json
{
  "venues": [{
    "name": "string",
    "type": "string",
    "area": "string",
    "travel_time_a": "string",
    "travel_time_b": "string",
    "maps_link": "string",
    "place_id": "string",
    "accessibility_notes": "string|null"
  }],
  "fairness_note": "string",
  "observance_note": "string|null",
  "plan_message_draft": "string",
  "backup_venues": [{ "...same structure..." }]
}
```

## Best Practices

- Maps grounding is an evidence layer — not an arbiter of fairness or safety
- Always show source attribution for Maps-grounded data
- Start conservative with venue types; expand based on feedback
- Never auto-send plan messages
- Render `googleMapsWidgetContextToken` for interactive map embeds


---

# kesher-personality-engine

Source: `.claude/skills/kesher-personality-engine/SKILL.md`

---
name: kesher-personality-engine
description: BFAS personality assessment system for the Kesher dating app. Use when implementing personality tests, scoring, reflection reports, compatibility comparisons, or personality-aware match explanations using Big Five Aspect Scales and Gemini structured outputs.
---

# Kesher Personality Engine

Implement a **trust-forward personality assessment** using the Big Five Aspect Scales (BFAS). Frame insights as tendencies, not predictions.

## BFAS Framework

### Five Domains and Ten Aspects

| Domain | Aspect 1 | Aspect 2 |
|--------|----------|----------|
| Extraversion | Enthusiasm | Assertiveness |
| Neuroticism | Withdrawal | Volatility |
| Agreeableness | Compassion | Politeness |
| Conscientiousness | Industriousness | Orderliness |
| Openness/Intellect | Openness | Intellect |

### Assessment

- 100-item BFAS questionnaire (based on Peterson framework)
- **Scoring is deterministic** — no AI involved in scoring
- Results expressed as percentile rankings for 5 domains and 10 aspects
- Store raw scores server-side; derive percentiles from normative data

## Core Experiences

### 1. Personality Reflection Report

Generate a personal insight report from BFAS scores using Gemini.

**Model**: Gemini 2.5 Flash

**System instruction**: Frame all insights as tendencies. Never use clinical language. Use "you tend to..." not "you are..."

**Output schema**:
```json
{
  "domain_insights": [{ "domain": "string", "percentile": "number", "reflection": "string" }],
  "aspect_highlights": [{ "aspect": "string", "insight": "string" }],
  "growth_areas": ["string"],
  "framing_note": "string"
}
```

### 2. Compatibility Comparison

Compare two users' BFAS profiles after **mutual consent**.

**Prerequisite**: Both users must opt in to share personality data.

**Output schema**:
```json
{
  "shared_strengths": ["string"],
  "potential_friction": ["string"],
  "conversation_starters": ["string"],
  "framing_note": "string"
}
```

**Constraints**: Never output "soulmate" claims, compatibility percentages, or deterministic predictions.

### 3. "Why This Match" with Personality

Enrich match explanations with personality signals (when user has opted in).

**Whitelisted signals**: Shared high/low aspects, complementary patterns, stated preferences alignment.

### 4. Personality-Aware Bio Coach

Optionally incorporate personality insights into bio drafting suggestions via user toggle.

## Ethical Boundaries

- No attractiveness scoring from personality data
- No clinical diagnoses or mental health assessments
- No deterministic compatibility scores — always probabilistic framing
- User owns their data — view, edit, reset, delete at any time
- Opt-in only — personality features require explicit consent
- No sharing without mutual consent
- TTL policies for automatic data expiration
- Provenance ledger — track which data was used in which AI output

## Technical Integration

- Store raw BFAS scores in Firestore with user-controlled access
- Use Firebase Auth for consent management
- Structured outputs with JSON Schema for all personality features
- System instructions must include ethical framing constraints

## References

- **BFAS scoring**: See `references/bfas_scoring.md` for item mapping and normative data
- **Compatibility matrix**: See `references/compatibility_matrix.md` for aspect-pair interaction patterns


---

# kesher-personality-ocean

Source: `.claude/skills/kesher-personality-ocean/SKILL.md`

---
name: kesher-personality-ocean
description: Implements personality assessment for the Kesher dating app using the OCEAN model, integrated with Jewish observance layers and Hebrew-first localization. Use this skill to generate compatibility reports, power personality-based filtering, and provide nuanced, culturally-aware matching.
---

# Kesher Personality & OCEAN Modeling Skill

This skill provides the complete implementation for assessing user personality within the Kesher dating app. It combines the five-factor (OCEAN) personality model with a nuanced, three-layer model of Jewish observance and identity, designed specifically for a Hebrew-first user base.

## Core Principles

1.  **Trait-Based, Not Typological:** The model is based on continuous OCEAN traits (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism), not rigid personality "types."
2.  **Culturally Nuanced:** It integrates a three-layer observance model (self-description, practice bundles, private compatibility) to capture the complexity of Israeli Jewish identity.
3.  **Hebrew-First:** All user-facing language, from assessment questions to compatibility explanations, is designed to be locally credible and natural in Hebrew.
4.  **Transparent & Controllable:** Users have visibility into their assessed traits and control over how they are used in matching.

## Implementation Workflow

### 1. Personality Assessment

To assess a user's personality, present them with a questionnaire based on the IPIP-NEO-120. For a shorter, mobile-friendly experience, a validated short-form version such as the IPIP-NEO-30 can be used.

-   **Reference:** For detailed descriptions of each OCEAN trait and its facets, see `/home/ubuntu/skills/kesher-personality-ocean/references/ocean_traits.md`.

### 2. Observance & Identity Layering

After the core personality assessment, collect information on Jewish observance and identity using the following three-layer model:

| Layer | Description | Implementation | Reference |
| :--- | :--- | :--- | :--- |
| **1. Self-Description** | A user-chosen public label in natural Hebrew. | Present a list of common Israeli Jewish identity labels. | See `/home/ubuntu/skills/kesher-personality-ocean/references/hebrew_localization.md` for the canonical list. |
| **2. Practice Bundles** | Concrete practices related to Shabbat, kashrut, community, and family life. | A multi-select or checklist interface for specific practices. | See `/home/ubuntu/skills/kesher-personality-ocean/references/hebrew_localization.md` for practice bundle items. |
| **3. Private Compatibility** | A private layer that learns preferences from explicit user feedback. | This is handled by the `kesher-learned-taste` skill. |

### 3. Generating Compatibility Reports

When comparing two users, generate a compatibility report that highlights both shared traits and complementary differences. The language should be warm, encouraging, and avoid deterministic or judgmental statements.

**Prompt Template for Generating a Compatibility Report:**

```
Given the following OCEAN personality profiles for User A and User B, and their Jewish observance practices, generate a brief, encouraging compatibility summary in Hebrew. Focus on potential areas of harmony and growth. Do not mention Neuroticism directly; instead, frame it as 'Emotional Style.'

User A Profile:
- Openness: [Score or Percentile]
- Conscientiousness: [Score or Percentile]
- Extraversion: [Score or Percentile]
- Agreeableness: [Score or Percentile]
- Neuroticism: [Score or Percentile]
- Observance Self-Description: [Label]
- Observance Practices: [List of practices]

User B Profile:
- Openness: [Score or Percentile]
- Conscientiousness: [Score or Percentile]
- Extraversion: [Score or Percentile]
- Agreeableness: [Score or Percentile]
- Neuroticism: [Score or Percentile]
- Observance Self-Description: [Label]
- Observance Practices: [List of practices]

Compatibility Summary (Hebrew):
```

## Bundled Resources

-   **`references/ocean_traits.md`**: Detailed descriptions of the five OCEAN personality traits and their facets.
-   **`references/hebrew_localization.md`**: Canonical lists of Hebrew self-description labels and practice bundle items for the observance layers.


---

# kesher-personality-research

Source: `kesher-app/skills/kesher-personality-research/SKILL.md`

---
name: kesher-personality-research
description: Authoritative evidence base for Kesher's personality, compatibility, sharing, and trust features. Use when writing or reviewing user-facing copy about traits or compatibility, choosing between BFAS forms, designing share cards or "why this match" outputs, debating similarity vs complementarity, defending a privacy/visibility default, or grounding a claim with VERIFIED/INFERRED/HEURISTIC/UNKNOWN labels. Pair with the implementation skills below.
---

# Kesher Personality Research

This skill is the canonical, evidence-tagged grounding layer for every Kesher feature that touches personality, compatibility, taste, sharing, or AI-mediated reflection. It does not implement features — it tells you what the evidence does and does not support, so you can keep prompts, copy, schemas, and product defaults defensible.

## When to use

- Writing or auditing a personality report, compatibility card, "why this match" string, or share-card preview.
- Choosing between full BFAS (100 items), short forms (e.g., BFAS-40, BFI-2), or no instrument at all.
- Defending privacy defaults: private-by-default vs mutual-unlock vs public personality display.
- Resolving an internal disagreement about similarity, complementarity, "opposites attract", or "soulmate" framing.
- Reviewing a Gemini structured output for false precision, clinical drift, destiny language, or covert ranking.

## Workflow

1. Open `references/dossier-index.md` and find the dossier(s) closest to the question. Each entry lists the deliverable, the strongest claims, and where to look in `canonical-evidence.md`.
2. Open `references/canonical-evidence.md` and locate the relevant section. Every claim carries an evidence label — keep that label if you propagate the claim into prompts, schemas, or UI copy.
3. Use `references/effect-sizes.md` for the small set of numbers you can quote without overclaiming (actor ≈ 6%, partner ≈ 1–3%, trait similarity < 0.5% of relationship-satisfaction variance after actor/partner controls, etc.).
4. Before shipping user-facing language, run it through `references/copy-do-dont.md`. The safe / risky / unsupported lists are derived from the dossiers and from the existing `docs/personality/prohibited-output-rules.md`.
5. For each architectural choice, cross-check against `references/product-defaults.md` (private-by-default, reflection over prediction, summarized-only sharing, mutual-consent for deeper layers, no paywalled privacy).

## Evidence labels (reused everywhere)

- **VERIFIED** — supported by peer-reviewed research or official platform docs cited in the dossier.
- **INFERRED** — synthesized from multiple verified findings; not directly tested as stated.
- **HEURISTIC** — pragmatic product guidance under uncertainty.
- **UNKNOWN** — not enough public evidence to support the claim.

If a feature relies on an UNKNOWN claim, gate it behind an experiment, not a launch.

## Hard non-negotiables (reaffirmed from dossiers + repo policies)

- No compatibility scores, match percentages, soulmate / bashert / destiny verdicts.
- No raw personality scores, hidden weights, or private-taste exposure to other users.
- No clinical / diagnostic language; trait labels are tendencies, not identity.
- No covert ranking or paywalled privacy controls.
- No protected-trait inference from photos or writing style.
- LLMs may *interpret* deterministic scores; LLMs must not *score* BFAS items.
- See `docs/personality/prohibited-output-rules.md` for the executable language allowlist/blocklist.

## Related implementation skills

- `$kesher-bfas-assessment` — deterministic scoring + opt-in flow.
- `$kesher-personality-profile` — private reflection cards.
- `$kesher-personality-why-match` — explanation outputs with provenance.
- `$kesher-compatibility-reflection` — mutual-consent shared reflection cards.
- `$kesher-personality-visibility` — public/private/mutual surface decisions.
- `$kesher-permissioned-sharing` — share-card grants, revocation, audit ledger.
- `$kesher-private-taste` — private learned-preference store.
- `$kesher-personality-delivery` — browser validation + release workflow.

## Acceptance checks

- Any new product claim about personality, compatibility, or matching cites a dossier section and carries an evidence label.
- Any prompt change preserves probabilistic framing ("you tend to", "may", "one thing to explore").
- Any new schema field is justified by a dossier passage or marked HEURISTIC with a follow-up experiment.
- Reviewers can trace a user-visible string back to a verified or inferred source within two clicks.


---

# kesher-private-recommendations

Source: `.claude/skills/kesher-private-recommendations/SKILL.md`

---
name: kesher-private-recommendations
description: Implements permissioned sharing, private taste profiles, and privacy-preserving recommendations for the Kesher dating app. Use this skill to manage consent flows, staged disclosure patterns, and sensitive data exclusion schemas.
---

# Kesher Private Recommendations & Permissioned Sharing Skill

This skill defines the privacy and consent architecture for Kesher's recommendation engine. It ensures that the "Private Taste Profile" remains strictly private, implements "staged disclosure" to protect users in small communities, and enforces strict red lines against inferring sensitive traits.

## Core Principles

1.  **Strictly Private Taste:** The learned taste profile is never shared with other users. It is an internal tool used solely for generating recommendations and explanations.
2.  **Consent-Gated:** AI features, particularly the creation and use of the Private Taste Profile, require explicit, informed user consent.
3.  **Staged Disclosure:** Sensitive information (e.g., exact location, specific synagogue, mutual friends) is not revealed upfront. It is disclosed progressively as mutual interest and trust are established.
4.  **No Sensitive Inference:** The system must never infer protected traits (e.g., Jewish status, halachic validity, exact observance level, ethnicity, attractiveness) from photos, text, or location data.

## Implementation Workflow

### 1. Consent Flow & Privacy Policy

Before activating the learned taste features, users must complete a clear consent flow.

-   **Overt Data Collection:** The UI must clearly state what data is collected (explicit actions, implicit behavior), how it is used (to improve recommendations), and what is *not* used (private messages, hidden attractiveness scores).
-   **Opt-In/Opt-Out:** Users must have the ability to opt-out of personalized recommendations, falling back to basic filter-driven discovery (Explore).

*See `/home/ubuntu/skills/kesher-private-recommendations/references/privacy_policy_templates.md` for recommended copy and consent UI flows.*

### 2. Staged Disclosure Pattern

To protect privacy in small, overlapping communities (a key concern in Israeli/Jewish dating), Kesher implements a staged disclosure model:

| Stage | Trigger | Disclosed Information |
| :--- | :--- | :--- |
| **1. Public Profile** | Default view in Daily Picks/Explore | First name, age, coarse location (city/region), chosen self-description label, public photos, basic prompts. |
| **2. Mutual Match** | Both users "Like" each other | Full name (if opted-in), more detailed prompts, ability to message. |
| **3. Trust Check (Opt-In)** | Explicit request by either user | Shared mutual friends (via contact list hashing), specific community affiliations, detailed observance practices. |

### 3. Data Exclusion Schema (The Red Lines)

The AI models (both ranking and explanation) must be strictly prevented from accessing or inferring certain data points.

**Never Inferred or Used for Ranking:**
-   Jewish status (e.g., Cohen, Levi, convert).
-   Halachic validity for marriage.
-   Ethnicity or origin (e.g., Ashkenazi, Sephardi).
-   Socioeconomic status.
-   Attractiveness (no internal ELO scoring based on facial features).
-   Political affiliation.
-   Exact address or real-time location.

*See `/home/ubuntu/skills/kesher-private-recommendations/references/exclusion_schemas.md` for the technical implementation of these boundaries.*

## Bundled Resources

-   **`references/privacy_policy_templates.md`**: Recommended copy for the AI Trust Hub, consent flows, and privacy policy.
-   **`references/exclusion_schemas.md`**: JSON schemas defining the data fields that must be masked or excluded before being passed to any AI model.


---

# kesher-system-prompt

Source: `.claude/skills/kesher-system-prompt/SKILL.md`

---
name: kesher-system-prompt
description: Kesher OS master prompt and strategic framework. Use when performing deep research, strategic evaluation, architecture design, or execution planning for the Kesher dating app. Covers run modes, evaluation rubrics, product principles, platform role assignments, and connector design.
---

# Kesher System Prompt

Operate as the **KESHER OS** — master strategist, evaluator, and architect for the Kesher trust-forward dating app.

## Run Modes

Select the appropriate mode based on the task:

| Mode | When to Use | Output |
|------|------------|--------|
| DEEP RESEARCH | Market analysis, competitor evaluation, technology assessment | Research dossier with citations |
| STRATEGIC EVALUATION | Feature prioritization, build/skip decisions, risk assessment | Scorecard with classification |
| ARCHITECTURE + INTEGRATION DESIGN | System design, API integration, data flow planning | Architecture document with diagrams |
| AGENTIC EXECUTION PLANNING | Implementation planning, sprint breakdown, task assignment | Execution plan with milestones |

For complex requests spanning multiple modes, execute sequentially in the order listed.

## Product Principles

All decisions must align with these core principles:

1. **Hebrew-first** — Primary language and cultural context
2. **Serious and respectful** — Not casual or gamified
3. **Verified users** — Trust through identity verification
4. **Intent-focused** — Designed for people seeking relationships
5. **Finite discovery** — Curated, not infinite
6. **Private personalization** — User-controlled, transparent
7. **Assistive AI** — Tool, not companion
8. **Premium and calm** — Low stimulation, high quality
9. **Trust-forward** — Transparent, auditable, honest
10. **Culturally fluent** — Respects the full spectrum of Jewish life

## Feature Evaluation Framework

Evaluate every AI feature using this rubric:

| Criterion | Weight | Scale |
|-----------|--------|-------|
| User value | High | Does it solve a real user problem? |
| Trust impact | High | Does it build or erode trust? |
| Risk level | High | What could go wrong? |
| Technical feasibility | Medium | Can we build it reliably? |
| Cost efficiency | Medium | Is the cost justified? |
| Differentiation | Medium | Does it set Kesher apart? |

### Classification Output

- **MUST BUILD NOW** — High value, low risk, trust-building
- **BUILD NEXT** — High value, moderate complexity
- **EXPERIMENT FIRST** — Promising but needs validation
- **DEFER** — Low priority or high risk
- **DO NOT BUILD** — Violates principles or trust

## Platform Role Assignments

| Platform | Role | Scope |
|----------|------|-------|
| Google AI Studio | Prototyping | Prompt experiments, model testing |
| GitHub | Source of truth | Code, reviews, CI/CD |
| Claude Code | Deep refactoring | Terminal-based code transformation |
| VS Code + Copilot | Daily engineering | Primary development environment |
| Replit | Disposable experiments | Quick prototypes, throwaway code |
| Lovable | UI exploration | Front-end and workflow spikes |
| Antigravity | Large missions | Multi-file, multi-step engineering |
| Manus | Research and operations | Dossiers, automation, analysis |
| Firebase | Infrastructure | Auth, database, hosting, feature flags |
| Cloud Run | Deployment | Container hosting for backend |

## Connector Design

Design all connectors with **least-privilege** principle:

```
Connector: [Name]
Capabilities: [Read/Write/Execute]
Scope: [Specific resources]
Approval: [Auto/Manual/Admin]
Secrets: [Server-side only]
```

## Architecture Principles

- Conventional, auditable production architecture over "agent magic"
- Clear separation of concerns
- Defined canonical sources-of-truth for all system components
- Secrets remain server-side — never in client code
- Prompts treated as formal contracts with explicit definitions

## References

- **Evaluation rubrics**: See `references/evaluation_rubrics.md` for detailed scoring criteria
- **Implementation workflow**: See `references/implementation_workflow.md` for Claude Code process

