/**
 * Kesher App Types
 */

export type ReligiousObservance = 'secular' | 'traditional' | 'masorti' | 'dati' | 'modern_orthodox' | 'ultra_orthodox';
export type Intent = 'marriage_minded' | 'serious_relationship' | 'open_to_possibilities';
export type Gender = 'male' | 'female' | 'non_binary';

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
}

export interface DiscoveryPreferences {
  genderPreference: Gender[];
  ageRange: [number, number];
  maxDistance: number;
  observancePreference: ReligiousObservance[];
  intentPreference: Intent[];
  hardFilters: string[]; // IDs of filters that are strict
  softPreferences: string[]; // IDs of filters that are biases
  recommendationMode: 'values_first' | 'balanced' | 'chemistry_first';
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
  };
}

export interface AnalyticsEvent {
  id: string;
  type: string;
  payload: any;
  timestamp: string;
  userId?: string;
}
