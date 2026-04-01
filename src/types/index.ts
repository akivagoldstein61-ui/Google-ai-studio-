export type Gender = 'male' | 'female' | 'other';

export type IntentType = 
  | 'serious_relationship' 
  | 'marriage_minded' 
  | 'open_to_long_term' 
  | 'still_figuring_out';

export type ObservanceLevel = 
  | 'secular' 
  | 'traditional' 
  | 'masorti' 
  | 'dati' 
  | 'modern_orthodox' 
  | 'other' 
  | 'prefer_not_to_say';

export type VerificationLevel = 
  | 'none' 
  | 'contact_verified' 
  | 'photo_verified' 
  | 'id_verified';

export type PreferenceStrength = 'low' | 'medium' | 'high' | 'strict';

export interface ProfilePhoto {
  id: string;
  url: string;
  order: number;
  isPrimary: boolean;
}

export interface ProfilePrompt {
  id: string;
  question: string;
  answer: string;
}

export interface Profile {
  id: string;
  uid?: string;
  displayName: string;
  age: number;
  city: string;
  gender: Gender;
  bio: string;
  photos: string[];
  prompts: (ProfilePrompt | { id: string; question: string; answer: string })[];
  intent: IntentType;
  observance: ObservanceLevel;
  verificationLevel?: VerificationLevel;
  isVerified: boolean;
  isPremium?: boolean;
  distance?: number;
  lastActive?: string;
  tags: string[];
}

export interface HardFilter {
  key: string;
  value: any;
  isActive: boolean;
  poolImpact?: number;
}

export interface SoftPreference {
  key: string;
  value: any;
  strength: PreferenceStrength;
  isActive: boolean;
}

export interface DiscoveryPreferences {
  genderPreference: Gender[];
  ageRange: [number, number];
  maxDistance: number;
  observancePreference: ObservanceLevel[];
  intentPreference: IntentType[];
  hardFilters: (string | HardFilter)[];
  softPreferences: (string | SoftPreference)[];
  recommendationMode: 'values-first' | 'values_first' | 'balanced' | 'chemistry-first' | 'chemistry_first';
}

export interface TasteProfile {
  attractionTags: string[];
  valuesTags: string[];
  weightingAppearance: number;
  weightingValues: number;
  weightingVerification: number;
}

export interface MatchExplanation {
  reason: string;
  type: 'hard' | 'soft' | 'learned';
}

export interface DailyPick {
  profile: Profile;
  explanation: MatchExplanation;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp?: string;
  createdAt?: string;
  status?: 'sent' | 'delivered' | 'read';
  aiAssisted?: boolean;
  imageUrl?: string;
}

export interface Conversation {
  id: string;
  participants: Profile[];
  lastMessage?: Message;
  messages: Message[];
  unreadCount?: number;
  isPaused?: boolean;
}

export interface Match {
  id: string;
  users: string[];
  status: 'active' | 'paused' | 'unmatched' | 'blocked';
  createdAt: string;
  whyThisMatch: string;
  participants: Profile[];
}

export type ReportReason = 
  | 'fake_profile' 
  | 'harassment' 
  | 'sexual_content' 
  | 'scam_or_fraud' 
  | 'hate_or_abuse' 
  | 'underage_concern' 
  | 'offline_safety_concern' 
  | 'other';

export interface Report {
  id: string;
  reporterId: string;
  reportedId: string;
  reason: ReportReason;
  notes?: string;
  timestamp: string;
}

// Compatibility aliases for types.ts consumers
export type ReligiousObservance = ObservanceLevel;
export type Intent = IntentType;

export type AnalyticsEvent =
  | 'landing_viewed'
  | 'signup_started'
  | 'verification_started'
  | 'verification_completed'
  | 'onboarding_started'
  | 'intent_selected'
  | 'profile_completed'
  | 'daily_picks_viewed'
  | 'explore_opened'
  | 'hard_filter_set'
  | 'soft_preference_set'
  | 'taste_profile_adjusted'
  | 'like_sent'
  | 'pass_sent'
  | 'why_this_match_opened'
  | 'match_created'
  | 'opener_suggested'
  | 'message_sent'
  | 'report_submitted'
  | 'block_confirmed'
  | 'premium_viewed'
  | 'premium_started'
  | 'delete_account_started'
  | 'account_deleted';
