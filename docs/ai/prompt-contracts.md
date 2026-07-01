# AI Prompt Contracts

## Global Rules
- Gemini SDK calls must stay in `server/aiRoutes.ts`.
- `GEMINI_API_KEY` must remain server-side.
- Metadata logs may include route, feature id, prompt/schema version, validator result, fallback flag, latency, status, and error class only.
- Do not log prompts, message text, raw reports, profile payloads, exact locations, tokens, or secrets.
- Outputs must avoid clinical/diagnostic labels, destiny claims, match percentages, attractiveness scoring, hidden ranking disclosure, and private preference leakage.
- Personality assessment scoring is deterministic only. LLMs may not score assessment answers.
- AI route payloads fail validation if they include `compatibility_score`, `soulmate_score`, `marriage_probability`, `desirability_score`, `public_trait_rank`, `raw_trait_public`, `auto_send`, `diagnosis`, `protected_trait_inference`, or `hidden_personality_rank`.

## Model Routing
| Route Name | Model |
|---|---|
| `primaryReasoningModel` | `gemini-2.5-pro` |
| `primaryStructuredModel` | `gemini-2.5-pro` |
| `primarySearchGroundedModel` | `gemini-2.5-pro` |
| `mapsGroundedModel` | `gemini-2.5-flash` |
| `imageGenerationModel` | `gemini-2.5-flash` |
| `liveModel` | `gemini-2.5-flash` |
| `optionalFastFallbackModel` | `gemini-2.5-flash` |
| `optionalSafeClassifierFallbackModel` | `gemini-2.5-flash` |

## Route Contracts
| API Path | Feature ID | Prompt Template / System Instruction | Schema / Validator | Inputs | Safe Fallback |
|---|---|---|---|---|---|
| `/api/ai/safety-advice` | `safety_advice` | inline prompt + safety assistant instruction | unstructured text | `question` | Generic support/safety advice string |
| `/api/ai/plan-date` | `date_planner` | `DATE_PLANNER` | `DateIdeasSchema`, `validateDatePlanner` | `params` with coarse location/time/budget/vibe | Empty `venues` and empty tip |
| `/api/ai/taste-profile` | `taste_profile` | `TASTE_PROFILE` | `TasteProfileSchema`, `validateTasteProfile` | `interactions`, `currentProfile` | Empty private taste profile with neutral weights |
| `/api/ai/profile-completeness` | `profile_completeness` | `PROFILE_COMPLETENESS` | `ProfileCompletenessSchema`, `validateProfileCompleteness` | `profile` | Default completeness suggestion |
| `/api/ai/coach-bio` | `bio_coach` | `BIO_COACH` | `BioCoachSchema`, `validateBioCoach` | `params` | Three conservative Hebrew draft examples |
| `/api/ai/daily-picks-intro` | `daily_picks_intro` | inline daily picks prompt | `DailyPicksIntroSchema`, `validateDailyPicksIntro` | `userProfile` | Static Hebrew/English daily picks intro |
| `/api/ai/explain-match` | `why_match` | `WHY_MATCH` from a whitelisted explanation bundle | `WhyThisMatchPayloadSchema`, `validateWhyMatch`, `WhyThisMatchCardSchema` | Public profile fields and requested signals only; excludes private personality, private taste, safety flags, hidden rank, raw messages | Deterministic `createFallbackWhyThisMatchCard` with `signals_used` / `signals_not_used` |
| `/api/ai/openers` | `generate_openers` | `GENERATE_OPENERS` | `OpenersSchema`, `validateOpeners` | `profileName`, `bio`, `prompt` | Empty opener list |
| `/api/ai/rephrase` | `rephrase_message` | `REPHRASE_MESSAGE` | `RephraseSchema`, `validateRephrase` | `text` | Original text only |
| `/api/ai/message-safety` | `message_safety_scan` | inline message safety prompt | `MessageSafetyScanSchema`, `validateMessageSafetyScan` | `text` | `level: none` with empty notes |
| `/api/ai/personality-profile` | `personality_profile` | `PERSONALITY_INTERPRETER` | `PersonalitySummarySchema`, `validatePersonalityProfile` | Versioned deterministic personality report only; no raw answers | Short reflective default profile |
| `/api/ai/compatibility-reflection` | `compatibility_reflection` | `COMPATIBILITY_REFLECTION` | `PairInsightReportSchema`, `validateCompatibilityReflection` | `userA`, `userB` | Generic shared strengths and no friction loops |
| `/api/ai/pacing-intervention` | `pacing_coach` | `PACING_INTERVENTION` | `PacingInterventionSchema`, `validatePacingIntervention` | `sessionLength`, `swipeVelocity` | Gentle break prompt |
| `/api/ai/analyze-photos` | `analyze_photos` | inline photo URL prompt | `PhotoAnalysisSchema`, `validatePhotoAnalysis` | `photoUrl` | Appropriate/medium clarity with no flags |
| `/api/ai/moderation-summary` | `moderation_summary` | `MOD_SUMMARIZER` | `ModerationSummarySchema`, `validateModerationSummary` | `reports[]` | Failed summary with low risk/no escalation |

## Test Coverage
- `tests/aiRoutes.test.ts` verifies missing Gemini API keys return safe fallback output and metadata logs `missing_api_key` / `configuration_error` instead of validator success.
- `tests/aiRoutes.test.ts` verifies forbidden personality fields reject at the route boundary and raw assessment answers do not appear in metadata logs.
- `tests/personalityFoundation.test.ts` covers deterministic Kesher-original scoring, Zod schema validation, forbidden fields, Why This Match leakage, reset/delete cascade ledgers, and log redaction.
- Add fixture tests before changing personality, compatibility, why-match, moderation, date-planner, or photo-analysis prompts.
