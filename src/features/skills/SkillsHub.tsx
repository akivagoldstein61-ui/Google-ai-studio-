import React from 'react';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { SkillCard } from './components/SkillCard';
import { SkillRecommendationRail } from './components/SkillRecommendationRail';
import { useSkillState } from './hooks/useSkillState';
import {
  SKILL_COUNTS,
  SKILL_LIVE_ROUTES,
  SKILL_SECTIONS,
  SKILLS,
  getMemberVisibleSkills,
} from './skillRegistry';
import type { SkillMeta } from './skillRegistry';

export type { SkillMeta };
export { SKILLS, SKILL_COUNTS, SKILL_LIVE_ROUTES };

export const SkillsHub: React.FC<{
  onBack: () => void;
  onSelect: (id: string) => void;
  onOpenFeature?: (path: string) => void;
}> = ({ onBack, onSelect, onOpenFeature }) => {
  const { getSkillState } = useSkillState();
  const memberSkills = getMemberVisibleSkills();

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
            data-skill-count={SKILLS.length}
          >
            {SKILLS.length} capabilities for relationship readiness, safety, taste, compatibility, and AI transparency
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

        {SKILL_SECTIONS.map((section) => {
          const sectionSkills = memberSkills.filter((skill) => section.classes.includes(skill.surfaceClass));
          if (!sectionSkills.length) return null;
          const isReferenceSection = section.key === 'reference' || section.key === 'platform';
          return (
            <section key={section.key} className="space-y-3" data-testid={`skills-section-${section.key}`}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#8C7E6E]">
                  {section.label}
                  <span className="ml-2 opacity-60">{sectionSkills.length}</span>
                </h3>
                {isReferenceSection && (
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#B6A597]">
                    Reference — not a member skill
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sectionSkills.map((skill) => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    state={getSkillState(skill.id)}
                    liveRoute={SKILL_LIVE_ROUTES[skill.id]}
                    onSelect={onSelect}
                    onOpenFeature={onOpenFeature}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
};
