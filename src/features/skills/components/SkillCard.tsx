import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { SkillDefinition, UserSkillState } from '../types';
import { SkillProgressPill } from './SkillProgressPill';

const statusBadge = (status: SkillDefinition['status']) => {
  const map = {
    live: 'bg-green-100 text-green-700 border-green-200',
    prototype: 'bg-amber-100 text-amber-700 border-amber-200',
    planned: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return map[status];
};

export const SkillCard: React.FC<{
  skill: SkillDefinition;
  state?: UserSkillState;
  onSelect: (id: string) => void;
  onOpenFeature?: (path: string) => void;
  liveRoute?: { path: string; label: string };
}> = ({ skill, state, onSelect, onOpenFeature, liveRoute }) => {
  const Icon = skill.icon;
  return (
    <div
      className="flex flex-col p-5 bg-white border border-[#F3EFEA] rounded-[24px] shadow-sm hover:shadow-md hover:border-[#D4AF37]/30 transition-all group"
      data-testid={`skill-card-${skill.id}`}
      data-skill-id={skill.id}
    >
      <button onClick={() => onSelect(skill.id)} className="text-left w-full">
        <div className="flex items-start justify-between gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${skill.color}`}>
            <Icon size={18} />
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded-full border ${statusBadge(skill.status)}`}
              data-skill-status={skill.status}
            >
              {skill.status}
            </span>
            {state && <SkillProgressPill status={state.status} progress={state.progress} />}
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <h3 className="font-bold text-sm text-[#2D2926] group-hover:text-[#D4AF37] transition-colors">
            {skill.title}
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">
            {skill.subtitle}
          </p>
          <p className="text-xs text-[#6B5E52] leading-relaxed mt-2">
            {skill.summary}
          </p>
        </div>
      </button>
      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          onClick={() => onSelect(skill.id)}
          className="flex items-center gap-1 text-[10px] font-bold text-[#8C7E6E] hover:text-[#D4AF37] uppercase tracking-widest transition-colors"
        >
          Explore <ChevronRight size={12} />
        </button>
        {liveRoute && onOpenFeature && (
          <button
            onClick={() => onOpenFeature(liveRoute.path)}
            data-testid={`skill-open-live-${skill.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2D2926] text-white text-[9px] font-bold uppercase tracking-widest hover:bg-[#1A1816] transition-all"
          >
            {liveRoute.label} <ChevronRight size={11} />
          </button>
        )}
      </div>
    </div>
  );
};
