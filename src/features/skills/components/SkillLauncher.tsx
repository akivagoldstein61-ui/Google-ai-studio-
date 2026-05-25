import React from 'react';
import { ArrowRight, Check, ExternalLink } from 'lucide-react';
import { getSkillEntryPoint } from '../skillRegistry';
import type { SkillDefinition, SkillSurface } from '../types';
import { SkillProgressPill } from './SkillProgressPill';
import { useSkillState } from '../hooks/useSkillState';

export const SkillLauncher: React.FC<{
  skill: SkillDefinition;
  surface: SkillSurface;
  compact?: boolean;
  onOpenSkill?: (skillId: string) => void;
  onOpenRoute?: (path: string) => void;
}> = ({ skill, surface, compact, onOpenSkill, onOpenRoute }) => {
  const { getSkillState, startSkill, completeSkill } = useSkillState();
  const state = getSkillState(skill.id);
  const point = getSkillEntryPoint(skill, surface);
  const Icon = skill.icon;

  const route = point?.route;
  const getPreservedRoute = (path: string) => {
    if (typeof window === 'undefined') return path;
    const current = new URL(window.location.href);
    if (!current.searchParams.has('demo')) return path;
    const next = new URL(path, window.location.origin);
    next.searchParams.set('demo', current.searchParams.get('demo') ?? '1');
    return `${next.pathname}${next.search}${next.hash}`;
  };

  const handleLaunch = () => {
    startSkill(skill.id, surface);
    if (route) {
      const preservedRoute = getPreservedRoute(route);
      if (onOpenRoute) {
        onOpenRoute(preservedRoute);
      } else if (typeof window !== 'undefined') {
        window.location.href = preservedRoute;
      }
    } else {
      onOpenSkill?.(skill.id);
    }
  };

  const handleSaveInsight = () => {
    completeSkill(skill.id, {
      id: `${skill.id}-${Date.now()}`,
      type: skill.outputType,
      summary: skill.demoModeBehavior,
      createdAt: new Date().toISOString(),
      sourceSurface: surface,
    }, surface);
  };

  return (
    <div
      className="rounded-2xl border border-[#F3EFEA] bg-white p-4 space-y-3 shadow-sm"
      data-testid={`skill-launcher-${skill.id}`}
      data-skill-surface={surface}
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center border shrink-0 ${skill.color}`}>
          <Icon size={16} />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-bold text-[#2D2926] leading-tight">{skill.shortTitle}</h4>
            <SkillProgressPill status={state.status} progress={state.progress} />
          </div>
          <p className="text-xs leading-relaxed text-[#6B5E52]">{point?.description ?? skill.summary}</p>
        </div>
      </div>
      {!compact && state.status !== 'available' && (
        <p className="text-[11px] leading-relaxed text-[#8C7E6E] bg-[#F7F2EE] rounded-xl px-3 py-2">
          {state.status === 'completed' || state.status === 'applied'
            ? 'Saved privately to your skill history.'
            : skill.demoModeBehavior}
        </p>
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleLaunch}
          data-testid={`skill-launch-${skill.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#2D2926] text-white text-[9px] font-bold uppercase tracking-widest"
        >
          {point?.label ?? 'Start'} {route ? <ExternalLink size={11} /> : <ArrowRight size={11} />}
        </button>
        {state.status === 'started' && (
          <button
            type="button"
            onClick={handleSaveInsight}
            data-testid={`skill-complete-${skill.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#F7F2EE] text-[#2D2926] text-[9px] font-bold uppercase tracking-widest"
          >
            Save <Check size={11} />
          </button>
        )}
      </div>
    </div>
  );
};
