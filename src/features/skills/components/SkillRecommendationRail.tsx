import React from 'react';
import { Sparkles } from 'lucide-react';
import { getRecommendedSkillsForSurface, getSkillById } from '../skillRegistry';
import type { SkillDefinition, SkillSurface } from '../types';
import { SkillLauncher } from './SkillLauncher';

export const SkillRecommendationRail: React.FC<{
  surface: SkillSurface;
  title?: string;
  subtitle?: string;
  skillIds?: string[];
  limit?: number;
  includeInternal?: boolean;
  onOpenRoute?: (path: string) => void;
}> = ({
  surface,
  title = 'Skills for today',
  subtitle = 'Quiet tools for readiness, safety, and better communication.',
  skillIds,
  limit = 4,
  includeInternal,
  onOpenRoute,
}) => {
  const allSkillsHref = React.useMemo(() => {
    if (typeof window === 'undefined') return '/skills';
    const current = new URL(window.location.href);
    return current.searchParams.has('demo') ? '/skills?demo=1' : '/skills';
  }, []);

  const skills = React.useMemo<SkillDefinition[]>(() => {
    if (skillIds?.length) {
      return skillIds.map((id) => getSkillById(id)).filter((skill): skill is SkillDefinition => Boolean(skill)).slice(0, limit);
    }
    return getRecommendedSkillsForSurface(surface, { limit, includeInternal });
  }, [includeInternal, limit, skillIds, surface]);

  if (!skills.length) return null;

  return (
    <section
      className="w-full space-y-3"
      data-testid={`skill-recommendation-rail-${surface}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
            <Sparkles size={13} />
            <span>{title}</span>
          </div>
          <p className="text-xs text-[#8C7E6E] leading-relaxed">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (onOpenRoute) {
              onOpenRoute(allSkillsHref);
            } else if (typeof window !== 'undefined') {
              window.location.assign(allSkillsHref);
            }
          }}
          className="text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E] hover:text-[#D4AF37]"
        >
          All skills
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 snap-x">
        {skills.map((skill) => (
          <div key={skill.id} className="min-w-[250px] snap-start">
            <SkillLauncher skill={skill} surface={surface} compact onOpenRoute={onOpenRoute} />
          </div>
        ))}
      </div>
    </section>
  );
};
