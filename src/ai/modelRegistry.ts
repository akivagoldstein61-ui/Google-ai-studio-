export const MODEL_REGISTRY = {
  primaryReasoningModel: 'gemini-3.1-pro-preview',
  primaryStructuredModel: 'gemini-3.1-pro-preview',
  primarySearchGroundedModel: 'gemini-3.1-pro-preview',
  mapsGroundedModel: 'gemini-2.5-flash', // Maps grounding is only supported in Gemini 2.5 series
  imageGenerationModel: 'gemini-3.1-flash-image-preview',
  liveModel: 'gemini-2.5-flash-native-audio-preview-12-2025',
  optionalFastFallbackModel: 'gemini-3-flash-preview',
  optionalSafeClassifierFallbackModel: 'gemini-3-flash-preview',
};

export type ModelRoute = keyof typeof MODEL_REGISTRY;
