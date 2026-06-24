import type React from 'react';

export type SkillCategory = 'personality' | 'privacy' | 'governance' | 'ux' | 'platform';

export type SkillStatus = 'live' | 'prototype' | 'planned';

export type SkillDataStatus = 'live' | 'gated_pending_validation';

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

/**
 * Whether a skill is a launchable, member-operable capability ('interactive')
 * or read-only explainer/governance material ('reference'). A reference card is
 * not a capability and must never present a "launch feature" affordance.
 */
export type SkillKind = 'interactive' | 'reference';

/**
 * Who a skill is for. 'admin' skills are operator/internal-only and must be
 * hidden from the member Skills Hub. Derived from safetyLevel === 'internal'
 * or an admin_only consent requirement unless explicitly overridden.
 */
export type SkillAudience = 'member' | 'admin';

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

/**
 * PR 1 — Skills Hub truth labels.
 * surfaceClass separates member-facing interactive skills from reference,
 * operator, legal/privacy, platform/vendor, external, and hidden items.
 */
export type SkillSurfaceClass =
  | 'member_interactive'
  | 'settings_control'
  | 'trust_safety'
  | 'reference'
  | 'research'
  | 'operator'
  | 'legal_privacy'
  | 'platform_vendor'
  | 'external_demo'
  | 'hidden_until_verified';

export type SkillVisibility = 'member_visible' | 'reference_visible' | 'hidden';

export type SkillDeepeningDecision =
  | 'DEEPEN_NOW'
  | 'DEEPEN_AFTER_FIX'
  | 'DO_NOT_DEEPEN_REFERENCE_ONLY'
  | 'MOVE_TO_REFERENCE_SECTION'
  | 'REMOVE_OR_HIDE_UNTIL_VERIFIED'
  | 'UNKNOWN_PENDING_RENDERED_TEST';

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
  kind: SkillKind;
  audience: SkillAudience;
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
  dataStatus?: SkillDataStatus;
  /** PR 1 truth labels — additive classification used for hub grouping + launch gating. */
  surfaceClass: SkillSurfaceClass;
  visibility: SkillVisibility;
  deepeningDecision: SkillDeepeningDecision;
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
