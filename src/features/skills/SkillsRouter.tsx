import React, { useState } from 'react';
import { SkillsHub } from './SkillsHub';
import { SKILLS } from './skillRegistry';
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

export const SkillsRouter: React.FC<{
  onBack: () => void;
  onOpenFeature?: (path: string) => void;
}> = ({ onBack, onOpenFeature }) => {
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const { startSkill } = useSkillState();
  const { trackEvent } = useApp();

  const handleSelectSkill = (skillId: string) => {
    emitSkillEvent(trackEvent, 'skill_viewed', { skillId, surface: 'skills-hub' });
    startSkill(skillId, 'skills-hub');
    setActiveSkill(skillId);
  };

  if (!activeSkill) {
    return <SkillsHub onBack={onBack} onSelect={handleSelectSkill} onOpenFeature={onOpenFeature} />;
  }

  const skillProps = { onBack: () => setActiveSkill(null) };

  switch (activeSkill) {
    case 'personality-assessment':
      return <PersonalityAssessmentSkill {...skillProps} />;
    case 'consent-ux':
      return <ConsentUxSkill {...skillProps} />;
    case 'israeli-privacy':
      return <IsraeliPrivacySkill {...skillProps} />;
    case 'privacy-recommendation':
      return <PrivacyRecommendationSkill {...skillProps} />;
    case 'why-this-match':
      return <WhyThisMatchSkill {...skillProps} />;
    case 'permissioned-sharing':
      return <PermissionedSharingSkill {...skillProps} />;
    case 'compatibility-reflection':
      return <CompatibilityReflectionSkill {...skillProps} />;
    case 'psychometric-validation':
      return <PsychometricValidationSkill {...skillProps} />;
    case 'dark-pattern-audit':
      return <DarkPatternAuditSkill {...skillProps} />;
    case 'ai-runtime-governance':
      return <AIRuntimeGovernanceSkill {...skillProps} />;
    case 'personality-profile':
      return <PersonalityProfileSkill {...skillProps} />;
    case 'pacing-coach':
      return <PacingCoachSkill {...skillProps} />;
    case 'private-taste':
      return <PrivateTasteSkill {...skillProps} />;
    case 'personality-visibility':
      return <PersonalityVisibilitySkill {...skillProps} />;
    case 'personality-ocean':
      return <PersonalityOceanSkill {...skillProps} />;
    case 'learned-taste':
      return <LearnedTasteSkill {...skillProps} />;
    case 'filtering-marketplace':
      return <FilteringMarketplaceSkill {...skillProps} />;
    default: {
      const meta = SKILLS.find(s => s.id === activeSkill);
      if (meta) {
        return <PlannedSkillPage skill={meta} onBack={() => setActiveSkill(null)} />;
      }
      return <SkillsHub onBack={onBack} onSelect={handleSelectSkill} onOpenFeature={onOpenFeature} />;
    }
  }
};
