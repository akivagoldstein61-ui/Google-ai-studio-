import React from 'react';
import { BookOpen, ChevronLeft, Sparkles } from 'lucide-react';
import { SkillCard } from './components/SkillCard';
import { SkillRecommendationRail } from './components/SkillRecommendationRail';
import { useSkillState } from './hooks/useSkillState';
import {
  CATEGORY_LABELS,
  SKILL_COUNTS,
  SKILL_LIVE_ROUTES,
  SKILLS,
  getInteractiveSkills,
  getMemberVisibleSkills,
  getReferenceSkills,
} from './skillRegistry';
import type { SkillCategory } from './types';
import type { SkillMeta } from './skillRegistry';

export type { SkillMeta };
export { SKILLS, SKILL_COUNTS, SKILL_LIVE_ROUTES };

export const SkillsHub: React.FC<{
  onBack: () => void;
  onSelect: (id: string) => void;
  onOpenFeature?: (path: string) => void;
}> = ({ onBack, onSelect, onOpenFeature }) => {
  const [activeCategory, setActiveCategory] = React.useState<'all' | SkillCategory>('all');
  const { getSkillState } = useSkillState();

  // Member hub never shows operator/internal (admin) skills.
  const memberSkills = React.useMemo(() => getMemberVisibleSkills(), []);
  const interactiveSkills = React.useMemo(() => getInteractiveSkills(), []);
  const referenceSkills = React.useMemo(() => getReferenceSkills(), []);

  const byCategory = <T extends { category: SkillCategory }>(skills: T[]) => (
    activeCategory === 'all' ? skills : skills.filter((skill) => skill.category === activeCategory)
  );

  const filteredInteractive = byCategory(interactiveSkills);
  const filteredReference = byCategory(referenceSkills);

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2926] overflow-y-auto">
      <header className="sticky top-0 z-10 bg-[#FDFCFB]/95 backdrop-blur-sm px-6 py-4 flex items-center gap-4 border-b border-[#F3EFEA]">
        <button onClick={onBack} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all" aria-label="Back">
          <ChevronLeft size={20} />
        </button>
        <div className="space-y-0.5">
          <h1 className="text-xl font-serif italic">Kesher Skills Hub</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">
            Integrated relationship readiness system
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <section className="p-6 bg-[#2D2926] rounded-[32px] text-white space-y-4">
          <div className="flex items-center gap-2 text-[#D4AF37]">
            <Sparkles size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest">In-App Skill Modules</span>
          </div>
          <h2
            className="text-lg font-serif italic leading-snug"
            data-testid="skills-hub-count"
            data-skill-count={interactiveSkills.length}
          >
            {interactiveSkills.length} capabilities for relationship readiness, safety, taste, compatibility, and AI transparency
          </h2>
          <p className="text-sm text-white/70 leading-relaxed italic">
            Skills are private tools inside Kesher. They can coach, explain, draft, warn, and help you choose,
            but they never impersonate you or expose hidden signals to other members.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            {SKILL_COUNTS.live > 0 && (
              <span className="px-3 py-1 bg-green-900/30 text-green-300 text-[9px] font-bold uppercase tracking-widest rounded-full border border-green-700/30">
                Live: {SKILL_COUNTS.live}
              </span>
            )}
            <span className="px-3 py-1 bg-amber-900/30 text-amber-300 text-[9px] font-bold uppercase tracking-widest rounded-full border border-amber-700/30">
              Prototype: {SKILL_COUNTS.prototype}
            </span>
            {SKILL_COUNTS.planned > 0 && (
              <span className="px-3 py-1 bg-slate-700/30 text-slate-300 text-[9px] font-bold uppercase tracking-widest rounded-full border border-slate-600/30">
                Planned: {SKILL_COUNTS.planned}
              </span>
            )}
          </div>
        </section>

        <SkillRecommendationRail
          surface="skills"
          title="Continue or start"
          subtitle="Featured capabilities you can launch from the app today."
          skillIds={['why-this-match', 'private-taste', 'pacing-coach', 'personality-profile']}
          onOpenRoute={onOpenFeature}
        />

        <div className="flex flex-wrap gap-2">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key as 'all' | SkillCategory)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${
                activeCategory === key
                  ? 'bg-[#2D2926] text-white border-[#2D2926]'
                  : 'bg-white text-[#8C7E6E] border-[#F3EFEA] hover:border-[#D4AF37]/40'
              }`}
            >
              {label}
              {key !== 'all' && (
                <span className="ml-1.5 opacity-60">
                  {memberSkills.filter((skill) => skill.category === key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {filteredInteractive.length > 0 ? (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="skills-interactive-grid">
            {filteredInteractive.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                state={getSkillState(skill.id)}
                liveRoute={SKILL_LIVE_ROUTES[skill.id]}
                onSelect={onSelect}
                onOpenFeature={onOpenFeature}
              />
            ))}
          </section>
        ) : (
          <p className="text-xs text-[#8C7E6E] italic">
            No launchable capabilities in this category yet — see Reference & Governance below.
          </p>
        )}

        {filteredReference.length > 0 && (
          <section className="space-y-4" data-testid="skills-reference-section">
            <div className="flex items-center gap-2 pt-2 border-t border-[#F3EFEA]">
              <BookOpen size={16} className="text-[#8C7E6E]" />
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#2D2926]">
                  Reference &amp; Governance
                </h3>
                <p className="text-[11px] text-[#8C7E6E] leading-relaxed">
                  How Kesher works behind the scenes. These explainers are not launchable tools — they
                  describe policy, architecture, and the boundaries the product holds to.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReference.map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  state={getSkillState(skill.id)}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
