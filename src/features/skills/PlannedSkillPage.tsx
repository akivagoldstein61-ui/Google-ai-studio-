import React from 'react';
import { ChevronLeft, CheckCircle2, ExternalLink, GitBranch, ShieldCheck } from 'lucide-react';
import type { SkillDefinition } from './types';
import { SkillConsentPanel } from './components/SkillConsentPanel';
import { SkillProgressPill } from './components/SkillProgressPill';
import { useSkillState } from './hooks/useSkillState';

interface PlannedSkillPageProps {
  skill: SkillDefinition;
  onBack: () => void;
  /** Reference/operator/legal/platform items: show documentation, never a startable practice surface. */
  readOnly?: boolean;
}

export const PlannedSkillPage: React.FC<PlannedSkillPageProps> = ({ skill, onBack, readOnly = false }) => {
  const Icon = skill.icon;
  const { getSkillState, startSkill, completeSkill } = useSkillState();
  const state = getSkillState(skill.id);
  const isPlatform = skill.category === 'platform' || skill.category === 'governance';
  const prototypeSteps = isPlatform
    ? ['Route through GitHub PR review', 'Verify on Vercel preview', 'Capture smoke evidence', 'Keep production gated']
    : ['Open the user-facing flow', 'Review consent and visibility state', 'Run seeded demo data', 'Verify reflective language'];

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2926]">
      <header className="sticky top-0 z-10 bg-[#FDFCFB]/95 backdrop-blur-sm px-6 py-4 flex items-center gap-4 border-b border-[#F3EFEA]">
        <button onClick={onBack} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${skill.color}`}>
            <Icon size={16} />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-lg font-serif italic">{skill.title}</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E]">{skill.subtitle}</p>
          </div>
          {!readOnly && <SkillProgressPill status={state.status} progress={state.progress} />}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <section className="p-6 bg-[#F7F2EE] rounded-[24px] border border-[#E5E0DB] space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-700" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">
              {readOnly ? 'Reference' : 'Prototype experience'}
            </span>
          </div>
          <h2 className="text-base font-serif italic text-[#2D2926]">{skill.title}</h2>
          <p className="text-sm text-[#6B5E52] leading-relaxed">{skill.description}</p>
          {readOnly ? (
            <p className="text-[11px] leading-relaxed text-[#8C7E6E] bg-white border border-[#E5E0DB] rounded-xl px-3 py-2">
              This is a reference page, not a member skill. It documents how Kesher approaches this area —
              there is nothing to start or complete here.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => startSkill(skill.id, 'skills-hub')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#2D2926] text-white rounded-full text-[10px] font-bold uppercase tracking-widest"
              >
                Start skill
              </button>
              <button
                type="button"
                onClick={() => completeSkill(skill.id, {
                  id: `${skill.id}-prototype-note`,
                  type: skill.outputType,
                  summary: skill.demoModeBehavior,
                  createdAt: new Date().toISOString(),
                  sourceSurface: 'skills-hub',
                }, 'skills-hub')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#2D2926] border border-[#E5E0DB] rounded-full text-[10px] font-bold uppercase tracking-widest"
              >
                Save note
              </button>
            </div>
          )}
        </section>

        <SkillConsentPanel skill={skill} />

        {skill.skillId && (
          <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">Skill Reference</h3>
            <div className="flex items-center gap-3 p-3 bg-[#F7F2EE] rounded-xl">
              <code className="text-xs font-mono text-[#2D2926]">{skill.skillId}</code>
              <a
                href={`https://github.com/akivagoldstein61-ui/Google-ai-studio-/tree/main/skills/${skill.skillId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1 text-[10px] text-[#C8956B] hover:underline"
              >
                View in repo <ExternalLink size={10} />
              </a>
            </div>
          </section>
        )}

        {skill.keyFeatures && skill.keyFeatures.length > 0 && (
          <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Key Features</h3>
            <div className="space-y-2">
              {skill.keyFeatures.map((feature, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-[#F7F2EE] rounded-xl text-xs">
                  <span className="w-5 h-5 shrink-0 rounded-full bg-[#2D2926] text-white flex items-center justify-center text-[9px] font-bold">
                    {i + 1}
                  </span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <div className="flex items-center gap-2">
            {isPlatform ? <GitBranch size={16} className="text-[#C8956B]" /> : <ShieldCheck size={16} className="text-[#C8956B]" />}
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">
              {isPlatform ? 'Delivery dashboard' : 'Prototype flow'}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {prototypeSteps.map((step, index) => (
              <div key={step} className="p-3 bg-[#F7F2EE] rounded-xl text-xs flex items-start gap-3">
                <span className="w-5 h-5 shrink-0 rounded-full bg-[#2D2926] text-white flex items-center justify-center text-[9px] font-bold">
                  {index + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <a
              href="/prototype/personality"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#2D2926] text-white rounded-full text-[10px] font-bold uppercase tracking-widest"
            >
              Open personality journey
            </a>
            <a
              href="/prototype"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#F7F2EE] text-[#2D2926] rounded-full text-[10px] font-bold uppercase tracking-widest"
            >
              View deployment status
            </a>
          </div>
        </section>

        <section className="bg-[#2D2926] rounded-[24px] p-6 space-y-3 text-white">
          <p className="text-sm italic text-white/80">
            This page is a working prototype surface for the skill contract. It shows what reviewers can inspect,
            which checks must pass, and how the feature remains assistive, private, and member-controlled.
          </p>
          <p className="text-[9px] text-white/40 font-mono">
            {skill.skillId ? `skills/${skill.skillId}` : `prototype/${skill.id}`}
          </p>
        </section>
      </main>
    </div>
  );
};
