import { describe, it, expect } from 'vitest';
import { capabilityRouter } from './capabilityRouter';
import { MODEL_REGISTRY } from './modelRegistry';
import { AI_FEATURE_REGISTRY } from './featureRegistry';

describe('capabilityRouter', () => {
  describe('getRoute', () => {
    it('routes bio_coach to primaryStructuredModel', () => {
      expect(capabilityRouter.getRoute('bio_coach')).toBe(MODEL_REGISTRY.primaryStructuredModel);
    });

    it('routes taste_profile to primaryStructuredModel', () => {
      expect(capabilityRouter.getRoute('taste_profile')).toBe(MODEL_REGISTRY.primaryStructuredModel);
    });

    it('routes why_match to primaryStructuredModel', () => {
      expect(capabilityRouter.getRoute('why_match')).toBe(MODEL_REGISTRY.primaryStructuredModel);
    });

    it('routes safety_scan to primaryStructuredModel', () => {
      expect(capabilityRouter.getRoute('safety_scan')).toBe(MODEL_REGISTRY.primaryStructuredModel);
    });

    it('routes date_planner to mapsGroundedModel', () => {
      expect(capabilityRouter.getRoute('date_planner')).toBe(MODEL_REGISTRY.mapsGroundedModel);
    });

    it('routes safety_advice to primarySearchGroundedModel', () => {
      expect(capabilityRouter.getRoute('safety_advice')).toBe(MODEL_REGISTRY.primarySearchGroundedModel);
    });

    it('routes visual_icebreaker to imageGenerationModel', () => {
      expect(capabilityRouter.getRoute('visual_icebreaker')).toBe(MODEL_REGISTRY.imageGenerationModel);
    });

    it('routes voice_reflection to liveModel', () => {
      expect(capabilityRouter.getRoute('voice_reflection')).toBe(MODEL_REGISTRY.liveModel);
    });

    it('routes unknown features to primaryReasoningModel', () => {
      expect(capabilityRouter.getRoute('nonexistent_feature')).toBe(MODEL_REGISTRY.primaryReasoningModel);
    });
  });

  describe('getRouteName', () => {
    it('returns route name for structured features', () => {
      expect(capabilityRouter.getRouteName('bio_coach')).toBe('primaryStructuredModel');
      expect(capabilityRouter.getRouteName('profile_completeness')).toBe('primaryStructuredModel');
    });

    it('returns mapsGroundedModel for date_planner', () => {
      expect(capabilityRouter.getRouteName('date_planner')).toBe('mapsGroundedModel');
    });

    it('returns primaryReasoningModel for unknown features', () => {
      expect(capabilityRouter.getRouteName('unknown')).toBe('primaryReasoningModel');
    });
  });

  describe('registry consistency', () => {
    it('every registry feature routes to a valid model string', () => {
      for (const feature of AI_FEATURE_REGISTRY) {
        const model = capabilityRouter.getRoute(feature.id);
        expect(model, `Feature ${feature.id} should resolve to a model string`).toBeTruthy();
        expect(typeof model).toBe('string');
      }
    });

    it('every registry feature route name matches its declared runtime_model_route', () => {
      for (const feature of AI_FEATURE_REGISTRY) {
        const routeName = capabilityRouter.getRouteName(feature.id);
        expect(routeName, `Feature ${feature.id} routeName should match registry`).toBe(feature.runtime_model_route);
      }
    });

    it('every registry actual_model_string matches MODEL_REGISTRY lookup', () => {
      for (const feature of AI_FEATURE_REGISTRY) {
        const route = feature.runtime_model_route as keyof typeof MODEL_REGISTRY;
        expect(feature.actual_model_string).toBe(MODEL_REGISTRY[route]);
      }
    });
  });
});
