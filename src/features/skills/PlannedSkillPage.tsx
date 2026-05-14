import React from 'react';
import { ChevronLeft, Clock, ExternalLink } from 'lucide-react';
import type { SkillMeta } from './SkillsHub';

interface PlannedSkillPageProps {
  skill: SkillMeta;
  onBack: () => void;
}

export const PlannedSkillPage: React.FC<PlannedSkillPageProps> = ({ skill, onBack }) => {
  const Icon = skill.icon;

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
        {/* Status Banner */}
        <section className="p-6 bg-[#F7F2EE] rounded-[24px] border border-[#E5E0DB] space-y-4">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-[#8C7E6E]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">
              {skill.status === 'planned' ? 'Planned' : skill.status === 'prototype' ? 'Prototype' : 'Live'}
            </span>
          </div>
          <h2 className="text-base font-serif italic text-[#2D2926]">{skill.title}</h2>
          <p className="text-sm text-[#6B5E52] leading-relaxed">{skill.description}</p>
        </section>

        {/* Skill ID */}
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

        {/* What this skill does */}
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

        {/* Implementation note */}
        <section className="bg-[#2D2926] rounded-[24px] p-6 space-y-3 text-white">
          <p className="text-sm italic text-white/80">
            This skill module is defined in the Kesher skills directory. The interactive prototype
            implementation is coming soon.
          </p>
          <p className="text-[9px] text-white/40 font-mono">
            skills/{skill.skillId ?? skill.id}
          </p>
        </section>
      </main>
    </div>
  );
};
