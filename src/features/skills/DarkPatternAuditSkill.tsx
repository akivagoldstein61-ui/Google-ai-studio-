import React from 'react';
import { ChevronLeft, FileCheck, Check, X, AlertTriangle, Eye } from 'lucide-react';

const TAXONOMY = [
  {
    category: 'Overloading',
    description: 'Presenting so much information that users cannot make informed decisions',
    checks: [
      { check: 'Consent text length', pass: '<150 words per screen', fail: '800-word wall of text' },
      { check: 'Choices per screen', pass: '≤3 primary actions', fail: '7 toggles on one page' },
    ],
  },
  {
    category: 'Skipping',
    description: 'Designing flows so users skip past important decisions',
    checks: [
      { check: 'Consent prominence', pass: 'Full-screen, explicit action', fail: 'Small banner at bottom' },
      { check: 'Default states', pass: 'All sensitive toggles OFF', fail: 'Pre-checked "Share with matches"' },
    ],
  },
  {
    category: 'Stirring',
    description: 'Using emotional manipulation to push toward a specific choice',
    checks: [
      { check: 'Button language', pass: 'Neutral for both options', fail: '"Yes!" vs "No, I prefer bad matches"' },
      { check: 'Visual weight', pass: 'Equal prominence accept/decline', fail: 'Giant green vs tiny gray' },
    ],
  },
  {
    category: 'Obstructing',
    description: 'Making it harder to decline/revoke than to accept/share',
    checks: [
      { check: 'Revocation effort', pass: 'Same taps as granting', fail: 'Grant: 2 taps; Revoke: 5 taps + email' },
      { check: 'Delete accessibility', pass: 'Trust Hub, max 2 taps', fail: 'Settings > Account > Advanced > Data' },
    ],
  },
  {
    category: 'Fickle',
    description: 'Inconsistent design that confuses users about consent state',
    checks: [
      { check: 'Terminology', pass: 'Same word = same meaning', fail: '"Share" means different things' },
      { check: 'State visibility', pass: 'Current state always visible', fail: "Can't tell what's shared" },
    ],
  },
  {
    category: 'Left in the Dark',
    description: 'Failing to inform users about data processing',
    checks: [
      { check: 'AI disclosure', pass: 'User knows when AI processes data', fail: 'AI generates with no disclosure' },
      { check: 'Recipient visibility', pass: 'User knows exactly who sees what', fail: '"Shared with matches" (which?)' },
    ],
  },
];

const COMPREHENSION_QUESTIONS = [
  { q: '"What did you just agree to?"', pass: 'User identifies specific action' },
  { q: '"Who can see this information?"', pass: 'User correctly identifies recipients' },
  { q: '"How do you undo this?"', pass: 'User can describe revocation path' },
  { q: '"What happens if you say no?"', pass: 'User knows core experience continues' },
  { q: '"Is this permanent?"', pass: 'User knows they can revoke/delete anytime' },
];

export const DarkPatternAuditSkill: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2926]">
      <header className="sticky top-0 z-10 bg-[#FDFCFB]/95 backdrop-blur-sm px-6 py-4 flex items-center gap-4 border-b border-[#F3EFEA]">
        <button onClick={onBack} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center border border-orange-200">
            <FileCheck size={16} />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-lg font-serif italic">Dark Pattern Audit</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E]">EU Taxonomy & Comprehension Tests</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* EU Taxonomy */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E] px-2">Six-Category Dark Pattern Taxonomy (EU-aligned)</h2>
          {TAXONOMY.map(cat => (
            <div key={cat.category} className="bg-white border border-[#F3EFEA] rounded-[24px] p-5 space-y-3">
              <div>
                <h3 className="font-bold text-sm">{cat.category}</h3>
                <p className="text-xs text-[#6B5E52] italic">{cat.description}</p>
              </div>
              <div className="space-y-2">
                {cat.checks.map(check => (
                  <div key={check.check} className="grid grid-cols-3 gap-2 text-xs p-2 bg-[#F7F2EE] rounded-xl">
                    <span className="font-medium">{check.check}</span>
                    <span className="text-green-700 flex items-start gap-1"><Check size={12} className="mt-0.5 shrink-0" />{check.pass}</span>
                    <span className="text-red-700 flex items-start gap-1"><X size={12} className="mt-0.5 shrink-0" />{check.fail}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Comprehension Test */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Comprehension Test Protocol</h2>
          <p className="text-xs text-[#6B5E52] italic">5 benchmark questions asked post-consent. Acceptance: ≥80% correct on each question.</p>
          <div className="space-y-2">
            {COMPREHENSION_QUESTIONS.map(item => (
              <div key={item.q} className="p-3 bg-[#F7F2EE] rounded-xl text-xs space-y-1">
                <p className="font-bold">{item.q}</p>
                <p className="text-green-700 flex items-start gap-1"><Check size={12} className="mt-0.5 shrink-0" />Pass: {item.pass}</p>
              </div>
            ))}
          </div>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-800">
            <AlertTriangle size={14} className="inline mr-1" />
            Sample: 50-100 users per consent flow, stratified by language, age, tech literacy. Run after every major UX change.
          </div>
        </section>

        {/* Regret Measures */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">24-Hour Regret & Surprise Measures</h2>
          <div className="space-y-2">
            {[
              { measure: 'Recall', threshold: '≥90% remember the action', action: 'Consent flow too easy to skip' },
              { measure: 'Comfort', threshold: 'Mean ≥4.0 / 5.0', action: 'Review what\'s being shared' },
              { measure: 'Surprise', threshold: '<15% surprised', action: 'Improve preview accuracy' },
              { measure: 'Repeat choice', threshold: '≥85% would do again', action: 'Check for pressure/manipulation' },
              { measure: 'Pressure', threshold: 'Mean ≤2.0 / 5.0', action: 'Remove urgency/social proof' },
            ].map(item => (
              <div key={item.measure} className="flex items-center justify-between p-3 bg-[#F7F2EE] rounded-xl text-xs">
                <span className="font-bold">{item.measure}</span>
                <span className="text-[#8C7E6E]">{item.threshold}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Premium Boundary Ethics */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Premium Boundary Ethics</h2>
          <div className="space-y-2">
            {[
              'Core matching never degraded for free users',
              'No "see who likes you" gated behind personality',
              'Reflection available to all who complete assessment',
              'Sharing available to all (not premium-gated)',
              'No "personality boost" that increases visibility',
              'No "fit-rating unlock" for premium',
            ].map(rule => (
              <div key={rule} className="flex items-start gap-2 p-3 bg-green-50 rounded-xl text-xs border border-green-100">
                <Check size={14} className="mt-0.5 shrink-0 text-green-600" />
                <span className="text-green-800">{rule}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Stop Criteria */}
        <section className="p-6 bg-red-50 rounded-[24px] border border-red-100 space-y-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest">30-Day Stop Criteria</span>
          </div>
          <div className="space-y-2">
            {[
              'Opt-out rate >2x control',
              'Delete rate >3x baseline',
              'Support tickets spike >5x',
              'Qualitative themes of "creepy," "invasive," "trapped"',
              'Any subgroup shows >2x harm rate vs. overall',
            ].map(criterion => (
              <div key={criterion} className="flex items-start gap-2 text-xs text-red-800">
                <X size={12} className="mt-0.5 shrink-0" />
                <span>{criterion}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
