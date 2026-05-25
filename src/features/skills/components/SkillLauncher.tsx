import React from 'react';
import { ArrowRight, Check, ExternalLink, Lock, X } from 'lucide-react';
import { getSkillEntryPoint } from '../skillRegistry';
import type { SkillDefinition, SkillSurface } from '../types';
import { SkillProgressPill } from './SkillProgressPill';
import { SkillConsentPanel } from './SkillConsentPanel';
import { useSkillState } from '../useSkillState';

export const SkillLauncher: React.FC<{
  skill: SkillDefinition;
  surface: SkillSurface;
  compact?: boolean;
  onOpenSkill?: (skillId: string) => void;
  onOpenRoute?: (path: string) => void;
}> = ({ skill, surface, compact, onOpenSkill, onOpenRoute }) => {
  const { getSkillState, startSkill, completeSkill, applySkill, dismissSkill, gateSkill } = useSkillState();
  const state = getSkillState(skill.id);
  const point = getSkillEntryPoint(skill, surface);
  const Icon = skill.icon;
  const isGated = skill.operationalStatus === 'gated_dependency' || skill.status === 'gated';
  const displayedStatus = isGated && state.status === 'available' ? 'gated' : state.status;

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
    if (isGated) {
      gateSkill(skill.id, surface);
      onOpenSkill?.(skill.id);
      return;
    }
    startSkill(skill.id, surface);
    if (route) {
      const preservedRoute = getPreservedRoute(route);
      if (onOpenRoute) {
        onOpenRoute(preservedRoute);
      } else if (typeof window !== 'undefined') {
        window.location.assign(preservedRoute);
      }
    } else {
      onOpenSkill?.(skill.id);
    }
  };

  const handleSaveInsight = () => {
    completeSkill(skill.id, {
      id: `${skill.id}-${Date.now()}`,
      type: skill.outputType,
      summary: `${skill.shortTitle} output saved from ${surface}.`,
      createdAt: new Date().toISOString(),
      sourceSurface: surface,
    }, surface);
  };

  const handleApply = () => {
    applySkill(skill.id, {
      id: `${skill.id}-applied-${Date.now()}`,
      type: skill.outputType,
      summary: `${skill.shortTitle} applied from ${surface}.`,
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
            <SkillProgressPill status={displayedStatus} progress={state.progress} />
          </div>
          <p className="text-xs leading-relaxed text-[#6B5E52]">{point?.description ?? skill.summary}</p>
        </div>
      </div>
      {!compact && (
        <SkillConsentPanel skill={skill} compact />
      )}
      {!compact && isGated && (
        <div className="rounded-xl bg-blue-50 border border-blue-100 px-3 py-2 text-[11px] leading-relaxed text-blue-900">
          <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-[9px] text-blue-700">
            <Lock size={12} />
            <span>Gated dependency</span>
          </div>
          <p className="mt-1">{skill.demoModeBehavior}</p>
        </div>
      )}
      {!compact && state.status !== 'available' && !isGated && (
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
          {isGated ? 'View fallback' : point?.label ?? 'Start'} {route && !isGated ? <ExternalLink size={11} /> : <ArrowRight size={11} />}
        </button>
        {state.status === 'started' && (
          <>
            <button
              type="button"
              onClick={handleSaveInsight}
              data-testid={`skill-complete-${skill.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#F7F2EE] text-[#2D2926] text-[9px] font-bold uppercase tracking-widest"
            >
              Save <Check size={11} />
            </button>
            <button
              type="button"
              onClick={handleApply}
              data-testid={`skill-apply-${skill.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-bold uppercase tracking-widest"
            >
              Apply <Check size={11} />
            </button>
          </>
        )}
        {state.status !== 'dismissed' && (
          <button
            type="button"
            onClick={() => dismissSkill(skill.id, surface)}
            data-testid={`skill-dismiss-${skill.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-[#F3EFEA] text-[#8C7E6E] text-[9px] font-bold uppercase tracking-widest"
          >
            Dismiss <X size={11} />
          </button>
        )}
      </div>
    </div>
  );
};
