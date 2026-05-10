import React, { useState } from 'react';
import { SkillsHub } from './SkillsHub';
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

export const SkillsRouter: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeSkill, setActiveSkill] = useState<string | null>(null);

  if (!activeSkill) {
    return <SkillsHub onBack={onBack} onSelect={setActiveSkill} />;
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
    default:
      return <SkillsHub onBack={onBack} onSelect={setActiveSkill} />;
  }
};
