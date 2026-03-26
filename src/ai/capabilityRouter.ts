import { MODEL_REGISTRY, ModelRoute } from './modelRegistry';

export const capabilityRouter = {
  getRoute(featureId: string): string {
    // Default to primary reasoning model
    let route: ModelRoute = 'primaryReasoningModel';

    switch (featureId) {
      case 'bio_coach':
      case 'taste_profile':
      case 'why_match':
      case 'safety_scan':
      case 'mod_summarizer':
      case 'rephrase_message':
      case 'generate_openers':
      case 'profile_completeness':
        route = 'primaryStructuredModel';
        break;
      case 'date_planner':
        route = 'mapsGroundedModel'; // Requires Maps grounding
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
      case 'taste_profile':
      case 'why_match':
      case 'safety_scan':
      case 'mod_summarizer':
      case 'rephrase_message':
      case 'generate_openers':
      case 'profile_completeness':
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
