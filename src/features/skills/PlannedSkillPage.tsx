import React from 'react';
import { ChevronLeft, CheckCircle2, ExternalLink, GitBranch, ShieldCheck } from 'lucide-react';
import type { SkillDefinition } from './types';
import { SkillConsentPanel } from './components/SkillConsentPanel';
import { SkillLauncher } from './components/SkillLauncher';

interface PlannedSkillPageProps {
  skill: SkillDefinition;
  onBack: () => void;
  onOpenFeature?: (path: string) => void;
  onOpenSkill?: (skillId: string) => void;
}

export const PlannedSkillPage: React.FC<PlannedSkillPageProps> = ({
  skill,
  onBack,
  onOpenFeature,
  onOpenSkill,
}) => {
  const Icon = skill.icon;
  const isGated = skill.operationalStatus === 'gated_dependency';
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
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <SkillLauncher
          skill={skill}
          surface={skill.primarySurface}
          onOpenRoute={onOpenFeature}
          onOpenSkill={onOpenSkill}
        />

        <section className="p-6 bg-[#F7F2EE] rounded-[24px] border border-[#E5E0DB] space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className={isGated ? 'text-blue-700' : 'text-emerald-700'} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">
              {isGated ? 'Gated with useful fallback' : 'Operational prototype experience'}
            </span>
          </div>
          <h2 className="text-base font-serif italic text-[#2D2926]">{skill.title}</h2>
          <p className="text-sm text-[#6B5E52] leading-relaxed">{skill.description}</p>
          <p className="text-xs text-[#6B5E52] leading-relaxed">{skill.demoModeBehavior}</p>
        </section>

        <SkillConsentPanel skill={skill} />

        {skill.skillId && (
          <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">Skill Reference</h3>
            <div className="flex items-center gap-3 p-3 bg-[#F7F2EE] rounded-xl">
              <code className="text-xs font-mono text-[#2D2926]">{skill.canonicalCodexSkill}</code>
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

        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Operational Contract</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              ['Status', `${skill.status} / ${skill.operationalStatus}`],
              ['Primary surface', skill.primarySurface],
              ['Output', skill.outputType],
              ['AI feature', skill.aiFeatureKey ?? 'none'],
              ['Server route', skill.serverRoute ?? 'demo/local fallback'],
              ['Safety', skill.safetyLevel],
            ].map(([label, value]) => (
              <div key={label} className="p-3 bg-[#F7F2EE] rounded-xl text-xs">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E]">{label}</p>
                <p className="mt-1 text-[#2D2926]">{value}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Key Features</h3>
          <div className="space-y-2">
            {skill.keyFeatures.map((feature, i) => (
              <div key={feature} className="flex items-start gap-3 p-3 bg-[#F7F2EE] rounded-xl text-xs">
                <span className="w-5 h-5 shrink-0 rounded-full bg-[#2D2926] text-white flex items-center justify-center text-[9px] font-bold">
                  {i + 1}
                </span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </section>

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
        </section>

        <section className="bg-[#2D2926] rounded-[24px] p-6 space-y-3 text-white">
          <p className="text-sm italic text-white/80">
            This page is an app-native fallback for the skill contract. It shows launch state, consent, inputs,
            exclusions, and the safe surface Kesher can use today.
          </p>
          <p className="text-[9px] text-white/40 font-mono">
            {skill.skillId ? `skills/${skill.skillId}` : `prototype/${skill.id}`}
          </p>
        </section>
      </main>
    </div>
  );
};
