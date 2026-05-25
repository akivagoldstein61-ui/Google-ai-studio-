import React from 'react';
import type { SkillStateStatus } from '../types';

const STATUS_LABELS: Record<SkillStateStatus, string> = {
  locked: 'Locked',
  available: 'Available',
  started: 'Started',
  completed: 'Completed',
  applied: 'Applied',
  dismissed: 'Dismissed',
  gated: 'Gated',
};

const STATUS_CLASS: Record<SkillStateStatus, string> = {
  locked: 'bg-slate-100 text-slate-500 border-slate-200',
  available: 'bg-[#F7F2EE] text-[#8C7E6E] border-[#E5DED5]',
  started: 'bg-[#D4AF37]/10 text-[#9A7628] border-[#D4AF37]/20',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  applied: 'bg-teal-50 text-teal-700 border-teal-100',
  dismissed: 'bg-stone-100 text-stone-500 border-stone-200',
  gated: 'bg-blue-50 text-blue-700 border-blue-100',
};

export const SkillProgressPill: React.FC<{ status: SkillStateStatus; progress?: number }> = ({ status, progress }) => (
  <span
    data-testid="skill-progress-pill"
    data-skill-state={status}
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[8px] font-bold uppercase tracking-widest ${STATUS_CLASS[status]}`}
  >
    {STATUS_LABELS[status]}
    {typeof progress === 'number' && progress > 0 && progress < 1 && (
      <span className="opacity-70">{Math.round(progress * 100)}%</span>
    )}
  </span>
);
