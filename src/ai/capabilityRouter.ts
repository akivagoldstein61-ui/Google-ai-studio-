import { MODEL_REGISTRY, ModelRoute } from './modelRegistry';

export const capabilityRouter = {
  getRoute(featureId: string): string {
    let route: ModelRoute = 'primaryReasoningModel';

    switch (featureId) {
      case 'bio_coach':
        route = 'primaryStructuredModel';
        break;
      case 'rephrase_message':
      case 'generate_openers':
        route = 'optionalFastFallbackModel';
        break;
      case 'taste_profile':
      case 'why_match':
      case 'safety_scan':
      case 'mod_summarizer':
      case 'profile_completeness':
      case 'daily_picks_intro':
      case 'personality_profile':
      case 'compatibility_reflection':
      case 'pacing_coach':
        route = 'primaryStructuredModel';
        break;
      case 'date_planner':
        route = 'mapsGroundedModel';
        break;
      case 'safety_advice':
        route = 'primarySearchGroundedModel';
        break;
      case 'visual_icebreaker':
        route = 'imageGenerationModel';
        break;
      case 'voice_reflection':
        route = 'liveModel';
        break;
      default:
        route = 'primaryReasoningModel';
    }

    return MODEL_REGISTRY[route];
  },
  
  getRouteName(featureId: string): ModelRoute {
    switch (featureId) {
      case 'bio_coach':
        return 'primaryStructuredModel';
      case 'rephrase_message':
      case 'generate_openers':
        return 'optionalFastFallbackModel';
      case 'taste_profile':
      case 'why_match':
      case 'safety_scan':
      case 'mod_summarizer':
      case 'profile_completeness':
      case 'daily_picks_intro':
      case 'personality_profile':
      case 'compatibility_reflection':
      case 'pacing_coach':
        return 'primaryStructuredModel';
      case 'date_planner':
        return 'mapsGroundedModel';
      case 'safety_advice':
        return 'primarySearchGroundedModel';
      case 'visual_icebreaker':
        return 'imageGenerationModel';
      case 'voice_reflection':
        return 'liveModel';
      default:
        return 'primaryReasoningModel';
    }
  }
};
