import React from 'react';
import { ChevronLeft, Sparkles } from 'lucide-react';
import { SkillCard } from './components/SkillCard';
import { SkillRecommendationRail } from './components/SkillRecommendationRail';
import { useSkillState } from './hooks/useSkillState';
import {
  CATEGORY_LABELS,
  SKILL_AUDIT_COUNTS,
  SKILL_COUNTS,
  SKILL_LIVE_ROUTES,
  SKILLS,
} from './skillRegistry';
import type { SkillCategory } from './types';
import type { SkillMeta } from './skillRegistry';

export type { SkillMeta };
export { SKILLS, SKILL_AUDIT_COUNTS, SKILL_COUNTS, SKILL_LIVE_ROUTES };

export const SkillsHub: React.FC<{
  onBack: () => void;
  onSelect: (id: string) => void;
  onOpenFeature?: (path: string) => void;
}> = ({ onBack, onSelect, onOpenFeature }) => {
  const [activeCategory, setActiveCategory] = React.useState<'all' | SkillCategory>('all');
  const { getSkillState } = useSkillState();

  const filtered = activeCategory === 'all'
    ? SKILLS
    : SKILLS.filter((skill) => skill.category === activeCategory);
  const interactive = filtered.filter((skill) => skill.experienceType === 'interactive');
  const needsVerification = filtered.filter((skill) => skill.experienceType === 'needs_verification');
  const reference = filtered.filter((skill) => (
    skill.experienceType === 'reference' || skill.experienceType === 'external_reference'
  ));

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
            {SKILL_AUDIT_COUNTS.interactive} interactive skill prototypes, {SKILL_AUDIT_COUNTS.needsVerification} gated concepts, and{' '}
            {SKILL_AUDIT_COUNTS.reference + SKILL_AUDIT_COUNTS.externalReference} reference modules
          </h2>
          <p className="text-sm text-white/70 leading-relaxed italic">
            Skills are private tools inside Kesher. They can coach, explain, draft, warn, and help you choose,
            but reference modules are not counted as completed app skills until a bespoke interaction is verified.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <span className="px-3 py-1 bg-amber-900/30 text-amber-300 text-[9px] font-bold uppercase tracking-widest rounded-full border border-amber-700/30">
              Interactive: {SKILL_AUDIT_COUNTS.interactive}
            </span>
            <span className="px-3 py-1 bg-purple-900/30 text-purple-200 text-[9px] font-bold uppercase tracking-widest rounded-full border border-purple-700/30">
              Needs verification: {SKILL_AUDIT_COUNTS.needsVerification}
            </span>
            <span className="px-3 py-1 bg-slate-700/30 text-slate-300 text-[9px] font-bold uppercase tracking-widest rounded-full border border-slate-600/30">
              Reference: {SKILL_AUDIT_COUNTS.reference + SKILL_AUDIT_COUNTS.externalReference}
            </span>
            <span className="px-3 py-1 bg-white/10 text-white/60 text-[9px] font-bold uppercase tracking-widest rounded-full border border-white/10">
              Registry total: {SKILLS.length}
            </span>
            {SKILL_COUNTS.live > 0 && (
              <span className="px-3 py-1 bg-green-900/30 text-green-300 text-[9px] font-bold uppercase tracking-widest rounded-full border border-green-700/30">
                Live: {SKILL_COUNTS.live}
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
                  {SKILLS.filter((skill) => skill.category === key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {interactive.length > 0 && (
          <section className="space-y-3">
            <div className="px-1">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Interactive skills</h2>
              <p className="text-xs text-[#6B5E52] italic">Bespoke app surfaces with meaningful state, actions, or user controls.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interactive.map((skill) => (
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
        )}

        {needsVerification.length > 0 && (
          <section className="space-y-3">
            <div className="px-1">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Needs verification before deepening</h2>
              <p className="text-xs text-[#6B5E52] italic">Concepts stay visible for audit, but are not counted as completed interactive skills.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {needsVerification.map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  state={getSkillState(skill.id)}
                  liveRoute={undefined}
                  onSelect={onSelect}
                  onOpenFeature={onOpenFeature}
                />
              ))}
            </div>
          </section>
        )}

        {reference.length > 0 && (
          <section className="space-y-3">
            <div className="px-1">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Reference library</h2>
              <p className="text-xs text-[#6B5E52] italic">Legal, governance, operator, platform, and external-resource material.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reference.map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  state={getSkillState(skill.id)}
                  liveRoute={undefined}
                  onSelect={onSelect}
                  onOpenFeature={onOpenFeature}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
