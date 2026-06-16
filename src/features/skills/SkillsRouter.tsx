import React, { useState } from 'react';
import { SkillsHub } from './SkillsHub';
import { SKILLS, isInteractiveSkill } from './skillRegistry';
import { PersonalityAssessmentSkill } from './PersonalityAssessmentSkill';
import { ConsentUxSkill } from './ConsentUxSkill';
import { IsraeliPrivacySkill } from './IsraeliPrivacySkill';
import { PrivacyRecommendationSkill } from './PrivacyRecommendationSkill';
import { WhyThisMatchSkill } from './WhyThisMatchSkill';
import { PermissionedSharingSkill } from './PermissionedSharingSkill';
import { CompatibilityReflectionSkill } from './CompatibilityReflectionSkill';
import { PsychometricValidationSkill } from './PsychometricValidationSkill';
import { DarkPatternAuditSkill } from './DarkPatternAuditSkill';
import { AIRuntimeGovernanceSkill } from './AIRuntimeGovernanceSkill';
import { PersonalityProfileSkill } from './PersonalityProfileSkill';
import { PacingCoachSkill } from './PacingCoachSkill';
import { PrivateTasteSkill } from './PrivateTasteSkill';
import { PersonalityVisibilitySkill } from './PersonalityVisibilitySkill';
import { PersonalityOceanSkill } from './PersonalityOceanSkill';
import { LearnedTasteSkill } from './LearnedTasteSkill';
import { FilteringMarketplaceSkill } from './FilteringMarketplaceSkill';
import { PlannedSkillPage } from './PlannedSkillPage';
import { useSkillState } from './hooks/useSkillState';
import { useApp } from '@/context/AppContext';
import { emitSkillEvent } from './skillEvents';

/**
 * Bespoke skill pages keyed by skill id. Skills not listed here fall back to
 * PlannedSkillPage (interactive when member-visible, read-only for reference).
 * Exported so route→component resolution can be asserted in tests without
 * mounting every page. Keep this map and `resolveSkillView` in sync.
 */
export const BESPOKE_SKILL_COMPONENTS: Record<string, React.FC<{ onBack: () => void }>> = {
  'personality-assessment': PersonalityAssessmentSkill,
  'consent-ux': ConsentUxSkill,
  'israeli-privacy': IsraeliPrivacySkill,
  'privacy-recommendation': PrivacyRecommendationSkill,
  'why-this-match': WhyThisMatchSkill,
  'permissioned-sharing': PermissionedSharingSkill,
  'compatibility-reflection': CompatibilityReflectionSkill,
  'psychometric-validation': PsychometricValidationSkill,
  'dark-pattern-audit': DarkPatternAuditSkill,
  'ai-runtime-governance': AIRuntimeGovernanceSkill,
  'personality-profile': PersonalityProfileSkill,
  'pacing-coach': PacingCoachSkill,
  'private-taste': PrivateTasteSkill,
  'personality-visibility': PersonalityVisibilitySkill,
  'personality-ocean': PersonalityOceanSkill,
  'learned-taste': LearnedTasteSkill,
  'filtering-marketplace': FilteringMarketplaceSkill,
};

export type SkillView =
  | { kind: 'bespoke'; component: React.FC<{ onBack: () => void }> }
  | { kind: 'planned'; skill: (typeof SKILLS)[number]; readOnly: boolean }
  | { kind: 'not-found' };

/**
 * Pure route→component resolver. Every registered skill id must resolve to a
 * bespoke page or an explicitly-flagged PlannedSkillPage; only unknown ids
 * resolve to `not-found` (which the router treats as "return to the hub").
 */
export const resolveSkillView = (skillId: string): SkillView => {
  const component = BESPOKE_SKILL_COMPONENTS[skillId];
  if (component) {
    return { kind: 'bespoke', component };
  }
  const skill = SKILLS.find((s) => s.id === skillId);
  if (skill) {
    return { kind: 'planned', skill, readOnly: !isInteractiveSkill(skill) };
  }
  return { kind: 'not-found' };
};

export const SkillsRouter: React.FC<{
  onBack: () => void;
  onOpenFeature?: (path: string) => void;
}> = ({ onBack, onOpenFeature }) => {
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const { startSkill } = useSkillState();
  const { trackEvent } = useApp();

  const handleSelectSkill = (skillId: string) => {
    emitSkillEvent(trackEvent, 'skill_viewed', { skillId, surface: 'skills-hub' });
    // Reference/operator/legal/platform/hidden items are not practice surfaces:
    // opening one must not create skill progress/completion history.
    const meta = SKILLS.find((skill) => skill.id === skillId);
    if (meta && isInteractiveSkill(meta)) {
      startSkill(skillId, 'skills-hub');
    }
    setActiveSkill(skillId);
  };

  if (!activeSkill) {
    return <SkillsHub onBack={onBack} onSelect={handleSelectSkill} onOpenFeature={onOpenFeature} />;
  }

  const onBackToHub = () => setActiveSkill(null);
  const view = resolveSkillView(activeSkill);

  if (view.kind === 'bespoke') {
    const Bespoke = view.component;
    return <Bespoke onBack={onBackToHub} />;
  }
  if (view.kind === 'planned') {
    return <PlannedSkillPage skill={view.skill} onBack={onBackToHub} readOnly={view.readOnly} />;
  }
  return <SkillsHub onBack={onBack} onSelect={handleSelectSkill} onOpenFeature={onOpenFeature} />;
};
