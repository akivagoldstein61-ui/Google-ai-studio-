import React from 'react';
import { Sparkles } from 'lucide-react';
import { getRecommendedSkillsForSurface, getSkillById } from '../skillRegistry';
import type { SkillDefinition, SkillSurface } from '../types';
import { SkillLauncher } from './SkillLauncher';

export const SkillContextPanel: React.FC<{
  surface: SkillSurface;
  title?: string;
  description?: string;
  skillIds?: string[];
  limit?: number;
  compact?: boolean;
  includeInternal?: boolean;
  onOpenSkill?: (skillId: string) => void;
  onOpenRoute?: (path: string) => void;
}> = ({
  surface,
  title = 'Skills for this moment',
  description = 'Private tools that help you reflect, communicate, and stay in control.',
  skillIds,
  limit = 3,
  compact,
  includeInternal,
  onOpenSkill,
  onOpenRoute,
}) => {
  const skills = React.useMemo<SkillDefinition[]>(() => {
    if (skillIds?.length) {
      return skillIds.map((id) => getSkillById(id)).filter((skill): skill is SkillDefinition => Boolean(skill)).slice(0, limit);
    }
    return getRecommendedSkillsForSurface(surface, { limit, includeInternal });
  }, [includeInternal, limit, skillIds, surface]);

  if (!skills.length) return null;

  return (
    <section
      className="rounded-[24px] border border-[#F3EFEA] bg-[#FDFCFB] p-4 space-y-4"
      data-testid={`skill-context-panel-${surface}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center shrink-0">
          <Sparkles size={16} />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-[#2D2926]">{title}</h3>
          {!compact && <p className="text-xs leading-relaxed text-[#8C7E6E]">{description}</p>}
        </div>
      </div>
      <div className="grid gap-3">
        {skills.map((skill) => (
          <SkillLauncher
            key={skill.id}
            skill={skill}
            surface={surface}
            compact={compact}
            onOpenSkill={onOpenSkill}
            onOpenRoute={onOpenRoute}
          />
        ))}
      </div>
    </section>
  );
};
