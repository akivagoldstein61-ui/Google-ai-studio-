/**
 * AI Feature System Types
 */

export type AIFeatureCategory = 'core_enabled' | 'beta_opt_in' | 'internal_only' | 'labs_off_by_default';

export type AIAudience = 'user' | 'premium' | 'internal' | 'lab';

export type AIRiskLevel = 'low' | 'medium' | 'high';

export interface AIFeatureMetadata {
  id: string;
  name: string;
  category: AIFeatureCategory;
  user_visible: boolean;
  default_enabled: boolean;
  audience: AIAudience;
  runtime_model_route: string;
  actual_model_string: string;
  structured_output_used: boolean;
  function_calling_used: boolean;
  maps_used: boolean;
  search_used: boolean;
  url_context_used: boolean;
  files_used: boolean;
  file_search_used: boolean;
  live_api_used: boolean;
  code_execution_used: boolean;
  image_analysis_used: boolean;
  image_generation_used: boolean;
  requires_consent: boolean;
  requires_citation_ui: boolean;
  requires_human_confirmation: boolean;
  risk_level: AIRiskLevel;
  data_inputs: string[];
  excluded_data: string[];
  notes?: string;
  capability_exception: boolean;
  exception_reason?: string;
}

export interface AIResponse<T> {
  data: T;
  metadata: {
    featureId: string;
    model: string;
    usage?: {
      promptTokens: number;
      candidatesTokens: number;
      totalTokens: number;
    };
    safetyRatings?: any[];
    citations?: AICitation[];
  };
}

export interface AICitation {
  uri: string;
  title?: string;
  snippet?: string;
}

export interface AIFeatureStatus {
  featureId: string;
  enabled: boolean;
  optedIn: boolean;
}
