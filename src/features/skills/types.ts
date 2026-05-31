import type React from 'react';

export type SkillCategory = 'personality' | 'privacy' | 'governance' | 'ux' | 'platform';

export type SkillStatus = 'live' | 'prototype' | 'planned';

export type SkillClassification =
  | 'A Fully functioning interactive skill'
  | 'B Functioning interactive skill that should be deepened'
  | 'C Interactive concept present but not functioning enough to deepen yet'
  | 'D Internal reference-only page'
  | 'E External reference-only resource'
  | 'F Unknown / needs verification';

export type SkillDeepeningDecision =
  | 'DEEPEN_NOW'
  | 'DEEPEN_AFTER_FIX'
  | 'DO_NOT_DEEPEN_REFERENCE_ONLY'
  | 'MOVE_TO_REFERENCE_SECTION'
  | 'REMOVE_OR_HIDE_UNTIL_VERIFIED'
  | 'UNKNOWN_PENDING_RENDERED_TEST';

export type SkillEvidenceLabel = 'VERIFIED' | 'INFERRED' | 'HEURISTIC' | 'UNKNOWN' | 'BLOCKED';

export type SkillRouterStatus = 'bespoke' | 'planned fallback' | 'missing';

export type SkillExperienceType = 'interactive' | 'reference' | 'external_reference' | 'needs_verification';

export type SkillReferenceSection =
  | 'Interactive Skills'
  | 'Future Capability Holding Area'
  | 'Legal / Privacy Reference'
  | 'Governance / AI Runtime Reference'
  | 'Product / Operator Reference'
  | 'UX / Safety Review Reference'
  | 'External Platform Reference';

export type SkillSurface =
  | 'skills-hub'
  | 'skills'
  | 'home'
  | 'daily'
  | 'explore'
  | 'onboarding'
  | 'profile-builder'
  | 'profile'
  | 'match'
  | 'chat'
  | 'safety'
  | 'ai-trust'
  | 'settings'
  | 'admin';

export type SkillSafetyLevel = 'low' | 'medium' | 'high' | 'internal';

export type SkillOutputType =
  | 'none'
  | 'draft'
  | 'insight'
  | 'reflection'
  | 'settings'
  | 'safety_plan'
  | 'admin_summary'
  | 'reference';

export type SkillConsentType =
  | 'none'
  | 'ai_assist'
  | 'profile_data'
  | 'private_taste'
  | 'match_context'
  | 'message_text'
  | 'photo_analysis'
  | 'mutual_consent'
  | 'admin_only';

export type UserSkillStatus = 'locked' | 'available' | 'started' | 'completed' | 'applied' | 'dismissed';

export type SkillEventName =
  | 'skill_viewed'
  | 'skill_started'
  | 'skill_completed'
  | 'skill_applied'
  | 'skill_dismissed'
  | 'skill_recommended'
  | 'skill_consent_viewed'
  | 'skill_consent_accepted'
  | 'skill_consent_declined';

export interface SkillEntryPoint {
  surface: SkillSurface;
  label: string;
  description: string;
  route?: string;
  featured?: boolean;
  internalOnly?: boolean;
}

export interface SkillDefinition {
  id: string;
  slug: string;
  /** Matches the directory name in skills/ when one exists. */
  skillId?: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  category: SkillCategory;
  summary: string;
  fullDescription: string;
  featured: boolean;
  icon: React.ElementType;
  color: string;
  primarySurface: SkillSurface;
  availableSurfaces: SkillSurface[];
  entryPoints: SkillEntryPoint[];
  requiredConsent: SkillConsentType[];
  privacyNotes: string[];
  safetyLevel: SkillSafetyLevel;
  aiFeatureKey?: string;
  outputType: SkillOutputType;
  status: SkillStatus;
  classification: SkillClassification;
  deepeningDecision: SkillDeepeningDecision;
  evidenceLabel: SkillEvidenceLabel;
  routerStatus: SkillRouterStatus;
  experienceType: SkillExperienceType;
  referenceSection: SkillReferenceSection;
  renderedStatus: string;
  prerequisites: string[];
  recommendedNextActions: string[];
  demoModeBehavior: string;
  description: string;
  keyFeatures: string[];
}

export interface SavedSkillOutputRef {
  id: string;
  type: SkillOutputType;
  summary?: string;
  createdAt: string;
  sourceSurface?: SkillSurface;
}

export interface SkillConsentSnapshot {
  accepted: SkillConsentType[];
  declined?: SkillConsentType[];
  acceptedAt?: string;
  version: string;
}

export interface UserSkillState {
  userId: string;
  skillId: string;
  status: UserSkillStatus;
  progress: number;
  lastUsedAt?: string;
  completedAt?: string;
  surfaceUsedFrom?: SkillSurface;
  savedOutputRefs: SavedSkillOutputRef[];
  consentSnapshot?: SkillConsentSnapshot;
  updatedAt: string;
}

export interface SkillTransitionOptions {
  surface?: SkillSurface;
  outputRef?: SavedSkillOutputRef;
  consentSnapshot?: SkillConsentSnapshot;
  now?: string;
}
