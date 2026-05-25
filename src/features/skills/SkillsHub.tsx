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

type SkillFilter = 'all' | SkillCategory;

export { SKILLS, SKILL_LIVE_ROUTES };
export type { SkillMeta };

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
