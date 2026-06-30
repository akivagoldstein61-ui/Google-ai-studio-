import React, { useState } from 'react';
import { ChevronLeft, Brain, Check, AlertTriangle, Play, Pause, Sparkles, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PersonalityAssessment } from '@/components/onboarding/PersonalityAssessment';
import type { PersonalityAssessmentReport } from '@/personality/scoring';

/**
 * LIVE: runs the real, versioned 20-item Kesher assessment used in
 * onboarding (deterministic scoring, no LLM) and shows private domain bands.
 */
const LiveAssessment: React.FC = () => {
  const [report, setReport] = useState<PersonalityAssessmentReport | null>(null);

  if (report) {
    return (
      <section className="p-6 bg-[#2D2926] rounded-[28px] text-white space-y-4 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-[#D4AF37]/10 blur-3xl" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#D4AF37]">
              <Check size={16} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Your deterministic result</span>
            </div>
            <button onClick={() => setReport(null)} className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white">
              <RotateCcw size={12} /> Retake
            </button>
          </div>
          <div className="space-y-2.5">
            {report.domains.map((domain) => (
              <div key={domain.id} className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white/90">{domain.label_en}</span>
                  <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">{domain.band}</span>
                </div>
                <p className="text-[10px] text-white/60 leading-relaxed">{domain.dating_note_he}</p>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-white/40 italic">
            Scored deterministically (no AI) · {report.instrument_version} · {report.score_version}.
            Raw answers stay private and are not included in exports or AI feature prompts.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white border border-[#F3EFEA] rounded-[28px] p-6 space-y-4 shadow-sm">
      <div className="flex items-center gap-2 text-[#C8956B]">
        <Sparkles size={16} />
        <span className="text-[10px] font-bold uppercase tracking-widest">Try the real assessment</span>
      </div>
      <p className="text-xs text-[#6B5E52] leading-relaxed italic">
        This is the same opt-in, versioned 20-item Kesher reflection used in onboarding. Scoring is deterministic — no LLM
        scores you. Reverse-keyed items are handled, and your raw answers never leave your private store.
      </p>
      <PersonalityAssessment onComplete={setReport} />
    </section>
  );
};

const SAMPLE_ITEMS = [
  { id: 'E1', text: 'I am the life of the party', domain: 'Extraversion', aspect: 'Enthusiasm', reversed: false },
  { id: 'E2', text: 'I feel comfortable around people', domain: 'Extraversion', aspect: 'Enthusiasm', reversed: false },
  { id: 'A1', text: 'I sympathize with others\' feelings', domain: 'Agreeableness', aspect: 'Compassion', reversed: false },
  { id: 'C1', text: 'I am always prepared', domain: 'Conscientiousness', aspect: 'Industriousness', reversed: false },
  { id: 'N1', text: 'I get stressed out easily', domain: 'Neuroticism', aspect: 'Volatility', reversed: false },
  { id: 'O1', text: 'I have a vivid imagination', domain: 'Openness', aspect: 'Openness', reversed: false },
  { id: 'E3', text: 'I don\'t talk a lot', domain: 'Extraversion', aspect: 'Assertiveness', reversed: true },
  { id: 'A2', text: 'I am not interested in other people\'s problems', domain: 'Agreeableness', aspect: 'Politeness', reversed: true },
];

const QUALITY_CHECKS = [
  { name: 'Straightlining', method: 'Longest identical-response run', threshold: '>10 consecutive' },
  { name: 'Speed', method: 'Median item response time', threshold: '<1.5s per item' },
  { name: 'Inconsistency', method: 'Variance in reversed-item pairs', threshold: '>2 SD from mean' },
  { name: 'Instructed-response', method: 'Embedded attention items', threshold: 'Any missed' },
  { name: 'Completion', method: 'Items answered / total', threshold: '<80%' },
];

const DOMAIN_LABELS: Record<string, string> = {
  'Neuroticism': 'Emotional Steadiness',
  'Extraversion': 'Social Energy',
  'Openness': 'Curiosity & Openness',
  'Agreeableness': 'Warmth & Consideration',
  'Conscientiousness': 'Planning & Follow-through',
};

export const PersonalityAssessmentSkill: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [referenceStep, setReferenceStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [showScoring, setShowScoring] = useState(false);

  const currentItem = SAMPLE_ITEMS[referenceStep];

  const handleResponse = (value: number) => {
    setResponses(prev => ({ ...prev, [currentItem.id]: value }));
    if (referenceStep < SAMPLE_ITEMS.length - 1) {
      setReferenceStep(prev => prev + 1);
    } else {
      setShowScoring(true);
    }
  };

  const resetDemo = () => {
    setReferenceStep(0);
    setResponses({});
    setShowScoring(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2926]">
      <header className="sticky top-0 z-10 bg-[#FDFCFB]/95 backdrop-blur-sm px-6 py-4 flex items-center gap-4 border-b border-[#F3EFEA]">
        <button onClick={onBack} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center border border-violet-200">
            <Brain size={16} />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-lg font-serif italic">Personality Assessment</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E]">Kesher Reflection Administration</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* LIVE: run the real assessment */}
        <LiveAssessment />

        {/* Production instrument status */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Production Instrument</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#F3EFEA]">
                  <th className="text-left py-2 pr-4 font-bold text-[#2D2926]">Source</th>
                  <th className="text-left py-2 pr-4 font-bold text-[#2D2926]">Use</th>
                  <th className="text-left py-2 pr-4 font-bold text-[#2D2926]">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#F3EFEA]/50">
                  <td className="py-2 pr-4">Kesher original reflection v1</td>
                  <td className="py-2 pr-4"><span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-[10px] font-bold">Owner-only reflection</span></td>
                  <td className="py-2 pr-4"><span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-[10px] font-bold">Live</span></td>
                </tr>
                <tr className="border-b border-[#F3EFEA]/50">
                  <td className="py-2 pr-4">Deterministic score key</td>
                  <td className="py-2 pr-4"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold">No AI scoring</span></td>
                  <td className="py-2 pr-4"><span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-[10px] font-bold">Live</span></td>
                </tr>
                <tr className="border-b border-[#F3EFEA]/50">
                  <td className="py-2 pr-4">Raw answer handling</td>
                  <td className="py-2 pr-4"><span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-[10px] font-bold">Private only</span></td>
                  <td className="py-2 pr-4"><span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-[10px] font-bold">Not exported</span></td>
                </tr>
                <tr className="border-b border-[#F3EFEA]/50">
                  <td className="py-2 pr-4">Public/match surfaces</td>
                  <td className="py-2 pr-4"><span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold">No raw scores</span></td>
                  <td className="py-2 pr-4"><span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-[10px] font-bold">Guarded</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Interactive scoring reference */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Scoring Reference</h2>
            <Button variant="ghost" size="sm" onClick={resetDemo} className="text-[10px] uppercase tracking-widest">
              Reset
            </Button>
          </div>

          {!showScoring ? (
            <div className="space-y-6">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-[#8C7E6E]">
                  <span>Item {referenceStep + 1} of {SAMPLE_ITEMS.length}</span>
                  <span>{currentItem.domain} / {currentItem.aspect}</span>
                </div>
                <div className="h-1.5 bg-[#F3EFEA] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full transition-all duration-300"
                    style={{ width: `${((referenceStep) / SAMPLE_ITEMS.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Item */}
              <div className="text-center space-y-6 py-4">
                <p className="text-lg font-serif italic">{currentItem.text}</p>
                {currentItem.reversed && (
                  <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-bold uppercase tracking-widest rounded-full border border-amber-200">
                    Reverse-keyed
                  </span>
                )}
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(val => (
                    <button
                      key={val}
                      onClick={() => handleResponse(val)}
                      className="w-12 h-12 rounded-full border-2 border-[#F3EFEA] hover:border-violet-400 hover:bg-violet-50 transition-all flex items-center justify-center font-bold text-sm"
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[9px] text-[#8C7E6E] px-2">
                  <span>Strongly Disagree</span>
                  <span>Strongly Agree</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-violet-50 rounded-2xl border border-violet-100 space-y-3">
                <h3 className="text-xs font-bold text-violet-800">Scoring Complete (Demo)</h3>
                <p className="text-xs text-violet-700 italic">
                  The production Kesher reflection uses deterministic scoring. AI may interpret derived cards later,
                  but it never scores responses. Reverse-keyed items use formula: reverse = 6 - response.
                </p>
                <div className="space-y-2">
                  {Object.entries(DOMAIN_LABELS).map(([scientific, friendly]) => (
                    <div key={scientific} className="flex items-center justify-between text-xs">
                      <span className="font-medium">{friendly}</span>
                      <span className="text-[#8C7E6E] italic">{scientific}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-[#F7F2EE] rounded-2xl space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">Sample Reflection Card</h4>
                <div className="text-xs space-y-1">
                  <p className="font-bold">Social Energy</p>
                  <p className="italic text-[#6B5E52]">
                    Your responses suggest you tend toward energetic social engagement.
                    You may find that group settings feel natural and stimulating.
                  </p>
                  <p className="text-[#8C7E6E]">Explore: What kinds of social settings leave you feeling most recharged?</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Quality Checks */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Response Quality Checks</h2>
          <p className="text-xs text-[#6B5E52] italic">Run before scoring. If flagged, output "reflection unavailable" — never force-score.</p>
          <div className="space-y-2">
            {QUALITY_CHECKS.map(check => (
              <div key={check.name} className="flex items-center justify-between p-3 bg-[#F7F2EE] rounded-xl text-xs">
                <div>
                  <span className="font-bold">{check.name}</span>
                  <span className="text-[#8C7E6E] ml-2">{check.method}</span>
                </div>
                <span className="px-2 py-0.5 bg-red-50 text-red-700 rounded-full text-[9px] font-bold border border-red-100">
                  {check.threshold}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Progressive Flow */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Progressive Administration Flow</h2>
          <div className="space-y-3">
            {[
              'Place assessment in Settings/Insights, never first-run onboarding',
              'Show consent gate before first item (see Consent UX skill)',
              'Present items in blocks of 10-15, allow save-and-resume',
              'After ~30 items, offer domain-only reflection; continue for aspect-level',
              'Full measure yields domain + aspect scores',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3 text-xs">
                <span className="w-6 h-6 shrink-0 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-[10px]">
                  {i + 1}
                </span>
                <span className="pt-1">{step}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Bilingual Rules */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Hebrew/English Bilingual Rules</h2>
          <ul className="space-y-2 text-xs">
            {[
              'Store items in both languages keyed by item_id + locale',
              'Present in user\'s app language',
              'Score identically regardless of language',
              'Do NOT compare scores across languages until invariance established',
              'Generate reflection cards from validated bands only after the scoring layer completes',
            ].map((rule, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check size={14} className="mt-0.5 shrink-0 text-violet-500" />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
};
