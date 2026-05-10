import React from 'react';
import { ChevronLeft, ChevronRight, Shield, Brain, Users, Eye, Lock, Sparkles, Scale, FileCheck, Heart, Layers } from 'lucide-react';

export interface SkillMeta {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  status: 'live' | 'prototype' | 'planned';
  description: string;
}

export const SKILLS: SkillMeta[] = [
  {
    id: 'personality-assessment',
    title: 'Personality Assessment',
    subtitle: 'Progressive BFAS/IPIP Administration',
    icon: Brain,
    color: 'bg-violet-100 text-violet-700 border-violet-200',
    status: 'prototype',
    description: 'Progressive personality questionnaire with save-and-resume, domain/facet scoring, quality checks, and bilingual reflection card generation.',
  },
  {
    id: 'consent-ux',
    title: 'Consent UX',
    subtitle: 'Trust Hub & Grants Ledger',
    icon: Shield,
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    status: 'prototype',
    description: 'Section 11 consent gates, Trust Hub dashboard, grants ledger, revocation flows, and anti-dark-pattern consent microcopy.',
  },
  {
    id: 'israeli-privacy',
    title: 'Israeli Privacy Compliance',
    subtitle: 'Amendment 13 & PPA Guidance',
    icon: Lock,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    status: 'prototype',
    description: 'Data classification matrix, Section 11 notice, access/correction/deletion rights, DPO triggers, and transfer-abroad controls.',
  },
  {
    id: 'privacy-recommendation',
    title: 'Privacy-Preserving Recommendation',
    subtitle: 'Three-Layer Architecture',
    icon: Layers,
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    status: 'prototype',
    description: 'Silent personalization, safe explanation, and permissioned personality layers with signal allowlists and anti-leakage controls.',
  },
  {
    id: 'why-this-match',
    title: 'Why This Match',
    subtitle: 'Provenance-Labeled Explanations',
    icon: Eye,
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    status: 'prototype',
    description: 'Source chip UI, signal allowlist enforcement, safe formulation patterns, and anti-leakage controls for match explanations.',
  },
  {
    id: 'permissioned-sharing',
    title: 'Permissioned Sharing',
    subtitle: 'Share Cards & Mutual Consent',
    icon: Users,
    color: 'bg-pink-100 text-pink-700 border-pink-200',
    status: 'prototype',
    description: 'Basic/deeper share cards, recipient-scoped previews, deeper card requests, mutual reflection flow, and revocation cascades.',
  },
  {
    id: 'compatibility-reflection',
    title: 'Compatibility Reflection',
    subtitle: 'Bilateral Personality Insights',
    icon: Heart,
    color: 'bg-rose-100 text-rose-700 border-rose-200',
    status: 'prototype',
    description: 'Values alignment, communication lens, friction forecast, and growth edge reflections with bilateral consent and anti-pattern enforcement.',
  },
  {
    id: 'psychometric-validation',
    title: 'Psychometric Validation',
    subtitle: 'ESEM/Bifactor Pipeline',
    icon: Scale,
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    status: 'planned',
    description: 'Adaptation lab, reliability analysis, test-retest stability, response quality audit, measurement invariance, and incremental validity testing.',
  },
  {
    id: 'dark-pattern-audit',
    title: 'Dark Pattern Audit',
    subtitle: 'EU Taxonomy & Comprehension Tests',
    icon: FileCheck,
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    status: 'planned',
    description: 'Six-category dark pattern taxonomy audit, comprehension benchmarks, regret/surprise measures, and premium boundary ethics verification.',
  },
  {
    id: 'ai-runtime-governance',
    title: 'AI Runtime Governance',
    subtitle: 'Vertex AI & ZDR Controls',
    icon: Sparkles,
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    status: 'prototype',
    description: 'Provider routing decisions, zero-data-retention controls, structured outputs, App Check, feature registry, and provenance ledger.',
  },
];

const statusBadge = (status: SkillMeta['status']) => {
  const map = {
    live: 'bg-green-100 text-green-700 border-green-200',
    prototype: 'bg-amber-100 text-amber-700 border-amber-200',
    planned: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return map[status];
};

export const SkillsHub: React.FC<{ onBack: () => void; onSelect: (id: string) => void }> = ({ onBack, onSelect }) => {
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
        {/* Hero */}
        <section className="p-6 bg-[#2D2926] rounded-[32px] text-white space-y-4">
          <div className="flex items-center gap-2 text-[#D4AF37]">
            <Sparkles size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Integrated Skill Modules</span>
          </div>
          <h2 className="text-lg font-serif italic leading-snug">
            10 interconnected capabilities powering Kesher's trust-forward personality system
          </h2>
          <p className="text-sm text-white/60 leading-relaxed italic">
            Each skill module enforces privacy boundaries, Israeli Amendment 13 compliance, and scientific rigor.
            Tap any module to explore its architecture, rules, and interactive prototype.
          </p>
          <div className="flex gap-3 pt-2">
            <span className="px-3 py-1 bg-green-900/30 text-green-300 text-[9px] font-bold uppercase tracking-widest rounded-full border border-green-700/30">
              Live: 0
            </span>
            <span className="px-3 py-1 bg-amber-900/30 text-amber-300 text-[9px] font-bold uppercase tracking-widest rounded-full border border-amber-700/30">
              Prototype: 8
            </span>
            <span className="px-3 py-1 bg-slate-700/30 text-slate-300 text-[9px] font-bold uppercase tracking-widest rounded-full border border-slate-600/30">
              Planned: 2
            </span>
          </div>
        </section>

        {/* Skills Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SKILLS.map((skill) => {
            const Icon = skill.icon;
            return (
              <button
                key={skill.id}
                onClick={() => onSelect(skill.id)}
                className="text-left p-5 bg-white border border-[#F3EFEA] rounded-[24px] shadow-sm hover:shadow-md hover:border-[#D4AF37]/30 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${skill.color}`}>
                    <Icon size={18} />
                  </div>
                  <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded-full border ${statusBadge(skill.status)}`}>
                    {skill.status}
                  </span>
                </div>
                <div className="mt-3 space-y-1">
                  <h3 className="font-bold text-sm text-[#2D2926] group-hover:text-[#D4AF37] transition-colors">
                    {skill.title}
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">
                    {skill.subtitle}
                  </p>
                  <p className="text-xs text-[#6B5E52] leading-relaxed mt-2">
                    {skill.description}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore <ChevronRight size={12} />
                </div>
              </button>
            );
          })}
        </section>
      </main>
    </div>
  );
};
