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

export type FamilyPlans = 'want_someday' | 'dont_want' | 'have_and_want_more' | 'have_and_dont_want_more' | 'not_sure_yet';

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

export interface CandidateProfile {
  id: string;
  name: string;
  age: number;
  city: string;
  distanceMiles: number;
  relationshipIntent: IntentType;
  observance: ObservanceLevel;
  familyPlans: FamilyPlans;
  verified: boolean;
  languages: string[];
  bio: string;
  prompts: ProfilePrompt[];
  interests: string[];
  lifestyleTags: string[];
  lastActiveLabel: string;
  // added for compatibility
  photos: ProfilePhoto[];
  gender: Gender;
}

export type RecommendationMode = 'values_first' | 'balanced' | 'exploratory';

export interface SoftPreference {
  id: string;
  category: string;
  label: string;
  strength: PreferenceStrength;
  userEditable: boolean;
}

export interface UserDiscoveryPreferences {
  ageRange: [number, number];
  maxDistanceMiles: number;
  relationshipIntent: IntentType[];
  observance: ObservanceLevel[];
  familyPlans: FamilyPlans[];
  verifiedOnly: boolean;
  languages: string[];
  dealbreakers: string[];
  softPreferences: SoftPreference[];
  recommendationMode: RecommendationMode;
}

export interface TastePattern {
  id: string;
  category: string;
  value: string;
  sourceClass: string;
  provenanceSummary: string;
  confidence: number;
  supportCount: number;
  distinctSessionCount: number;
  lastConfirmedAt: string;
  decayHalfLifeDays: number;
  expiresAt: string;
  userLocked: boolean;
  userHidden: boolean;
  rankWeightCap: number;
  eligibleForRanking: boolean;
  sensitivityTier: number;
}

export interface InteractionEvent {
  id: string;
  candidateId: string;
  type: 'like' | 'pass' | 'more_like_this' | 'less_like_this';
  surface: string;
  createdAt: string;
}

export interface RecommendationResult {
  candidateId: string;
  surface: string;
  hardFilterEligible: boolean;
  score: number;
  reasons: string[];
  disclosures: string[];
}

export interface MatchExplanation {
  reason: string;
  type: 'hard' | 'soft' | 'learned';
}

export interface DailyPick {
  profile: CandidateProfile;
  explanation: MatchExplanation;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  aiAssisted?: boolean;
  imageUrl?: string;
}

export interface Conversation {
  id: string;
  participants: CandidateProfile[];
  lastMessage?: Message;
  unreadCount: number;
  isPaused: boolean;
}

export interface Match {
  id: string;
  users: string[];
  status: 'active' | 'paused' | 'unmatched';
  createdAt: string;
  whyThisMatch?: string;
  participants: CandidateProfile[];
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

export type AnalyticsEvent = 
  | 'landing_viewed'
  | 'onboarding_started'
  | 'daily_picks_viewed'
  | 'explore_opened'
  | 'taste_profile_adjusted'
  | 'like_sent'
  | 'pass_sent'
  | 'more_like_this'
  | 'less_like_this'
  | 'why_this_match_opened'
  | 'report_submitted';

