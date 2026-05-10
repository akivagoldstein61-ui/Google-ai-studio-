import React from 'react';
import { ChevronLeft, Scale, Check, X, ArrowRight } from 'lucide-react';

const PHASES = [
  { phase: '1. Adaptation Lab', status: 'Implementable', gate: 'No item with repeated severe comprehension failure survives', color: 'bg-green-50 text-green-700 border-green-200' },
  { phase: '2. Psychometric Alpha', status: 'Implementable', gate: 'Omega ≥ .80 domain, ≥ .70 facet; ESEM structure replicates', color: 'bg-green-50 text-green-700 border-green-200' },
  { phase: '3. Test-Retest', status: 'Implementable', gate: 'Domain retest ≥ .75; mean drift < .20 SD', color: 'bg-green-50 text-green-700 border-green-200' },
  { phase: '4. Response Quality', status: 'Implementable', gate: '<10% flagged sessions in live traffic', color: 'bg-green-50 text-green-700 border-green-200' },
  { phase: '5. Invariance', status: 'Research needed', gate: 'ΔCFI < .01, ΔRMSEA < .015 across groups', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { phase: '6. Incremental Validity', status: 'Blocked', gate: 'Personality adds replicated value over explicit baseline', color: 'bg-red-50 text-red-700 border-red-200' },
  { phase: '7. Harm Testing', status: 'Research needed', gate: 'No harm measure exceeds control by >0.3 SD', color: 'bg-amber-50 text-amber-700 border-amber-200' },
];

const METRICS = [
  { metric: 'Omega (domains)', target: '≥ .80', notes: 'With confidence intervals' },
  { metric: 'Omega (facets)', target: '≥ .70, prefer .75+', notes: 'Below .70 = remove from interpretation' },
  { metric: 'CFI/TLI', target: '~.95', notes: 'Heuristic, not sacred' },
  { metric: 'RMSEA', target: '~.06', notes: 'Screening target' },
  { metric: 'SRMR', target: '~.08', notes: 'Screening target' },
  { metric: 'Target loadings', target: 'Interpretable', notes: 'Must replicate in holdout' },
];

export const PsychometricValidationSkill: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2926]">
      <header className="sticky top-0 z-10 bg-[#FDFCFB]/95 backdrop-blur-sm px-6 py-4 flex items-center gap-4 border-b border-[#F3EFEA]">
        <button onClick={onBack} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center border border-cyan-200">
            <Scale size={16} />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-lg font-serif italic">Psychometric Validation</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E]">ESEM/Bifactor Pipeline</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Pipeline Overview */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Validation Pipeline</h2>
          <p className="text-xs text-[#6B5E52] italic">Each phase has go/no-go gates. Later phases are BLOCKED until earlier phases pass.</p>
          <div className="space-y-2">
            {PHASES.map(phase => (
              <div key={phase.phase} className="p-3 bg-[#F7F2EE] rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{phase.phase}</span>
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${phase.color}`}>
                    {phase.status}
                  </span>
                </div>
                <p className="text-[10px] text-[#6B5E52]">Gate: {phase.gate}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why ESEM */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Why ESEM (Not Simple CFA)</h2>
          <div className="p-4 bg-cyan-50 rounded-2xl border border-cyan-100 text-xs text-cyan-800 space-y-2">
            <p>Personality inventories have systematic cross-loadings. Strict CFA forces them to zero, producing poor fit and misleading modification indices.</p>
            <p className="font-bold">ESEM allows target loadings while estimating cross-loadings. Bifactor-ESEM additionally models general factors and acquiescence.</p>
          </div>
        </section>

        {/* Metrics */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Target Metrics</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#F3EFEA]">
                  <th className="text-left py-2 pr-3 font-bold">Metric</th>
                  <th className="text-left py-2 pr-3 font-bold">Target</th>
                  <th className="text-left py-2 font-bold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {METRICS.map(row => (
                  <tr key={row.metric} className="border-b border-[#F3EFEA]/50">
                    <td className="py-2 pr-3 font-medium">{row.metric}</td>
                    <td className="py-2 pr-3"><span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded-full text-[9px] font-bold">{row.target}</span></td>
                    <td className="py-2 text-[#6B5E52]">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Sample Sizes */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Sample Size Planning</h2>
          <div className="space-y-2">
            {[
              { study: 'Alpha study', size: '400-600 per language' },
              { study: 'Bilingual bridge', size: '~200 (counterbalanced)' },
              { study: 'Retest subset', size: '150-200 per language at 2-6 weeks' },
              { study: 'Cognitive interviews', size: '24-36 per language across 2-3 rounds' },
              { study: 'Harm testing', size: '300-500 users per arm' },
              { study: 'Incremental validity', size: 'Tens of thousands of ranking opportunities' },
            ].map(item => (
              <div key={item.study} className="flex items-center justify-between p-3 bg-[#F7F2EE] rounded-xl text-xs">
                <span className="font-bold">{item.study}</span>
                <span className="text-[#8C7E6E]">{item.size}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Measurement Invariance */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Measurement Invariance</h2>
          <p className="text-xs text-[#6B5E52] italic">Required before any cross-group comparison or shared ranking pool.</p>
          <div className="space-y-2">
            {[
              { level: 'Configural', meaning: 'Same factor structure', required: 'Basic interpretation' },
              { level: 'Metric', meaning: 'Same factor loadings', required: 'Comparing correlations' },
              { level: 'Scalar', meaning: 'Same intercepts', required: 'Comparing means/scores' },
            ].map(item => (
              <div key={item.level} className="p-3 bg-[#F7F2EE] rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold">{item.level}</span>
                  <span className="text-[9px] text-[#8C7E6E]">Required for: {item.required}</span>
                </div>
                <p className="text-[#6B5E52]">{item.meaning}</p>
              </div>
            ))}
          </div>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-800">
            Groups to test: Hebrew vs English, Gender, Age bands, Observance/lifestyle, Geography (Israel vs diaspora)
          </div>
        </section>

        {/* Preregistration */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Preregistration Families</h2>
          <div className="space-y-2">
            {[
              'Item-comprehension rounds',
              'Psychometric structure/reliability',
              'Response-quality/faking challenge studies',
              'Explanation trust/creepiness randomized trials',
              'Incremental-validity ranking trials',
            ].map((family, i) => (
              <div key={family} className="flex items-start gap-3 text-xs">
                <span className="w-5 h-5 shrink-0 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-[9px]">{i + 1}</span>
                <span>{family}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
