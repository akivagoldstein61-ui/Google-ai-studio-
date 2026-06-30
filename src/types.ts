/**
 * Kesher App Types
 */

export type ReligiousObservance = 'secular' | 'traditional' | 'masorti' | 'dati' | 'modern_orthodox' | 'ultra_orthodox';
export type Intent = 'marriage_minded' | 'serious_relationship' | 'open_to_possibilities';
export type Gender = 'male' | 'female' | 'non_binary';
export type RecommendationMode = 'values_first' | 'balanced' | 'serendipity' | 'open_exploration';
export type TasteProvenance = 'manual' | 'explicit_event' | 'weak_first_party_event' | 'model_suggestion';

export interface Profile {
  id: string;
  uid: string;
  displayName: string;
  age: number;
  gender: Gender;
  city: string;
  photos: string[];
  bio: string;
  observance: ReligiousObservance;
  intent: Intent;
  prompts: { id: string; question: string; answer: string }[];
  isVerified: boolean;
  isPremium: boolean;
  tags: string[];
  lastActive?: string;
  personalityScores?: Record<string, number>;
  role?: string;
}

export interface DiscoveryPreferences {
  genderPreference: Gender[];
  ageRange: [number, number];
  maxDistance: number;
  observancePreference: ReligiousObservance[];
  intentPreference: Intent[];
  hardFilters: string[]; // IDs of filters that are strict
  softPreferences: string[]; // IDs of priorities used for ranking only
  recommendationMode: RecommendationMode;
  dealbreakers?: {
    age?: boolean;
    distance?: boolean;
    gender?: boolean;
    intent?: boolean;
    observance?: boolean;
    verified?: boolean;
  };
  softPreferenceWeights?: {
    shared_interests?: number;
    same_city?: number;
    similar_observance?: number;
    similar_age?: number;
    values_alignment?: number;
    pacing_alignment?: number;
  };
  poolImpact?: Record<string, 'low' | 'medium' | 'high' | 'very_high'>;
}

export interface Match {
  id: string;
  users: [string, string];
  status: 'active' | 'unmatched' | 'blocked';
  createdAt: string;
  whyThisMatch: string;
  participants: Profile[];
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
  aiAssisted?: boolean;
  safetyFlag?: 'none' | 'warn' | 'scam_risk';
}

export interface Conversation {
  id: string;
  participants: Profile[];
  lastMessage?: Message;
  messages: Message[];
}

export interface TasteProfile {
  id: string;
  userId: string;
  hardDealbreakers: string[];
  softPreferences: string[];
  thingsToAvoid: string[];
  weights: {
    values_vs_lifestyle: number; // 0 to 1
    distance_tolerance: number; // 0 to 1
    values_weight?: number;
    stability_weight?: number;
    pacing_weight?: number;
  };
  learning?: {
    paused: boolean;
    optedOut: boolean;
    lastUpdatedAt: string | null;
  };
  provenance?: Record<string, TasteProvenance>;
  lockedItems?: string[];
  removedItems?: string[];
  explanation?: string;
}

export interface TasteProfileDraft {
  hard_dealbreakers: string[];
  soft_preferences: string[];
  things_to_avoid: string[];
  weights: {
    values_weight: number;
    stability_weight: number;
    pacing_weight: number;
  };
  learning: {
    paused: boolean;
    optedOut: boolean;
    lastUpdatedAt: string | null;
  };
  provenance: Record<string, TasteProvenance>;
  lockedItems: string[];
  removedItems: string[];
  explanation: string;
}

export interface AnalyticsEvent {
  id: string;
  type: string;
  payload: any;
  timestamp: string;
  userId?: string;
}
