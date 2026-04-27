export const MODEL_REGISTRY = {
  primaryReasoningModel: 'gemini-2.5-pro',
  primaryStructuredModel: 'gemini-2.5-pro',
  primarySearchGroundedModel: 'gemini-2.5-pro',
  mapsGroundedModel: 'gemini-2.5-flash',
  imageGenerationModel: 'gemini-2.5-flash',
  liveModel: 'gemini-2.5-flash',
  optionalFastFallbackModel: 'gemini-2.5-flash',
  optionalSafeClassifierFallbackModel: 'gemini-2.5-flash',
};

export type ModelRoute = keyof typeof MODEL_REGISTRY;
