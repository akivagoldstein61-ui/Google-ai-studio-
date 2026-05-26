import React from 'react';
import { ChevronLeft, Sparkles } from 'lucide-react';
import {
  CATEGORY_LABELS,
  SKILL_COUNTS,
  SKILL_LIVE_ROUTES,
  SKILLS,
  type SkillMeta,
} from './skillRegistry';
import { SkillCard } from './components/SkillCard';
import { useSkillState } from './useSkillState';
import type { SkillCategory } from './types';
import {
  PRODUCT_COMPLETION_GATES,
  getCompletionStatusCounts,
  getLaunchBlockingGates,
  getP0CompletionSkills,
  type CompletionStatus,
} from '@/product/completionPlan';

type SkillFilter = 'all' | SkillCategory;

export { SKILLS, SKILL_LIVE_ROUTES };
export type { SkillMeta };

const completionStatusClass = (status: CompletionStatus) => {
  const map = {
    operational: 'bg-green-100 text-green-700 border-green-200',
    prototype: 'bg-amber-100 text-amber-700 border-amber-200',
    gated: 'bg-blue-100 text-blue-700 border-blue-200',
    missing: 'bg-red-100 text-red-700 border-red-200',
  };
  return map[status];
};

export const SkillsHub: React.FC<{
  onBack: () => void;
  onSelect: (id: string) => void;
  onOpenFeature?: (path: string) => void;
}> = ({ onBack, onSelect, onOpenFeature }) => {
  const [activeCategory, setActiveCategory] = React.useState<SkillFilter>('all');
  const { getSkillState } = useSkillState();

  const filtered = activeCategory === 'all'
    ? SKILLS
    : SKILLS.filter((skill) => skill.category === activeCategory);
  const completionCounts = getCompletionStatusCounts();
  const blockingGateCount = getLaunchBlockingGates().length;
  const p0Skills = getP0CompletionSkills();

  const handleSelect = (skillId: string) => onSelect(skillId);

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2926]">
      <header className="sticky top-0 z-10 bg-[#FDFCFB]/95 backdrop-blur-sm px-6 py-4 flex items-center gap-4 border-b border-[#F3EFEA]">
        <button onClick={onBack} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
          <ChevronLeft size={20} />
        </button>
        <div className="space-y-0.5">
          <h1 className="text-xl font-serif italic">Kesher Skills Hub</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">
            Privacy-First Personality Architecture
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <section className="p-6 bg-[#2D2926] rounded-[32px] text-white space-y-4">
          <div className="flex items-center gap-2 text-[#D4AF37]">
            <Sparkles size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Integrated Skill Modules</span>
          </div>
          <h2
            className="text-lg font-serif italic leading-snug"
            data-testid="skills-hub-count"
            data-skill-count={SKILLS.length}
          >
            {SKILLS.length} interconnected capabilities powering Kesher's trust-forward personality system
          </h2>
          <p className="text-sm text-white/60 leading-relaxed italic">
            Every module is backed by the canonical skill registry, with privacy boundaries, consent notes,
            launch state, and app-native entry points.
          </p>
          <a
            href="/prototype/personality"
            data-testid="skills-hub-personality-prototype-link"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-[#2D2926] rounded-full text-[10px] font-bold uppercase tracking-widest"
          >
            Open IPIP-BFAS journey
          </a>
          <div className="flex flex-wrap gap-3 pt-2">
            {SKILL_COUNTS.live > 0 && (
              <span className="px-3 py-1 bg-green-900/30 text-green-300 text-[9px] font-bold uppercase tracking-widest rounded-full border border-green-700/30">
                Live: {SKILL_COUNTS.live}
              </span>
            )}
            <span className="px-3 py-1 bg-amber-900/30 text-amber-300 text-[9px] font-bold uppercase tracking-widest rounded-full border border-amber-700/30">
              Prototype: {SKILL_COUNTS.prototype}
            </span>
            {SKILL_COUNTS.gated > 0 && (
              <span className="px-3 py-1 bg-blue-900/30 text-blue-300 text-[9px] font-bold uppercase tracking-widest rounded-full border border-blue-700/30">
                Gated: {SKILL_COUNTS.gated}
              </span>
            )}
            {SKILL_COUNTS.planned > 0 && (
              <span className="px-3 py-1 bg-slate-700/30 text-slate-300 text-[9px] font-bold uppercase tracking-widest rounded-full border border-slate-600/30">
                Planned: {SKILL_COUNTS.planned}
              </span>
            )}
          </div>
        </section>

        <section className="space-y-4" data-testid="product-completion-gates">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 px-1">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">Product Completion Plan</p>
              <h2 className="text-lg font-bold text-[#2D2926]">Final-product readiness gates</h2>
              <p className="text-sm text-[#6B5E52] leading-relaxed">
                The registry now separates concept cards from launch blockers: auth, discovery, matching,
                safety operations, AI governance, payments, notifications, and release monitoring.
              </p>
            </div>
            <div className="shrink-0 text-left sm:text-right">
              <p className="text-2xl font-bold text-[#2D2926]" data-testid="launch-blocker-count">
                {blockingGateCount}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">Open gates</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(completionCounts).map(([status, count]) => (
              <div key={status} className="bg-white border border-[#F3EFEA] rounded-2xl p-4">
                <p className="text-xl font-bold text-[#2D2926]">{count}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E]">{status}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PRODUCT_COMPLETION_GATES.map((gate) => (
              <article key={gate.id} className="bg-white border border-[#F3EFEA] rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-[#2D2926]">{gate.label}</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">
                      {gate.category.replace('_', ' ')}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded-full border ${completionStatusClass(gate.status)}`}>
                    {gate.status}
                  </span>
                </div>
                <p className="text-xs text-[#6B5E52] leading-relaxed">{gate.nextAction}</p>
                <div className="flex flex-wrap gap-1.5">
                  {gate.evidence.map((item) => (
                    <span key={item} className="px-2 py-1 rounded-full bg-[#F7F2EE] text-[#6B5E52] text-[9px]">
                      {item}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 px-1">
            {p0Skills.map((skill) => (
              <span key={skill.id} className="px-3 py-1 rounded-full bg-[#2D2926] text-white text-[9px] font-bold uppercase tracking-widest">
                {skill.shortTitle}: {skill.status}
              </span>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key as SkillFilter)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${
                activeCategory === key
                  ? 'bg-[#2D2926] text-white border-[#2D2926]'
                  : 'bg-white text-[#8C7E6E] border-[#F3EFEA] hover:border-[#D4AF37]/40'
              }`}
            >
              {label}
              {key !== 'all' && (
                <span className="ml-1.5 opacity-60">
                  {SKILLS.filter((skill) => skill.category === key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              state={getSkillState(skill.id)}
              onSelect={handleSelect}
              onOpenFeature={onOpenFeature}
              liveRoute={SKILL_LIVE_ROUTES[skill.id]}
            />
          ))}
        </section>
      </main>
    </div>
  );
};
