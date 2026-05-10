import React from 'react';
import { ChevronLeft, Eye, Check, X, Tag } from 'lucide-react';

const SOURCE_CHIPS = [
  { label: 'From your profile', meaning: 'Signal from viewing user\'s public fields', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { label: 'From their profile', meaning: 'Signal from match\'s public fields', color: 'bg-green-100 text-green-700 border-green-200' },
  { label: 'Shared with you', meaning: 'From a personality card they shared', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { label: 'You both listed', meaning: 'Mutual explicit overlap', color: 'bg-amber-100 text-amber-700 border-amber-200' },
];

const ALLOWED_SIGNALS = [
  { signal: 'Shared values', condition: 'Both users set field to public' },
  { signal: 'Relationship intent', condition: 'Both users set field to public' },
  { signal: 'Observance/lifestyle', condition: 'Both users chose to display' },
  { signal: 'Location proximity', condition: 'Coarse only (neighborhood, not address)' },
  { signal: 'Shared interests/hobbies', condition: 'Explicitly listed by both users' },
  { signal: 'Age/stage alignment', condition: 'Both within each other\'s stated range' },
  { signal: 'Personality insight', condition: 'ONLY if sender shared a card with recipient' },
];

const EXCLUDED_SIGNALS = [
  'Private personality scores',
  'Private taste profile',
  'Behavioral patterns (swipes, dwell)',
  'Inferred traits',
  'Attractiveness/desirability ranking',
  'Other users\' data about this person',
  'Blocked/reported history',
];

export const WhyThisMatchSkill: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2926]">
      <header className="sticky top-0 z-10 bg-[#FDFCFB]/95 backdrop-blur-sm px-6 py-4 flex items-center gap-4 border-b border-[#F3EFEA]">
        <button onClick={onBack} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center border border-amber-200">
            <Eye size={16} />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-lg font-serif italic">Why This Match</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E]">Provenance-Labeled Explanations</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Live Demo */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Interactive Demo</h2>
          <div className="p-5 bg-[#F7F2EE] rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-[#8C7E6E] uppercase tracking-widest">Why you might connect:</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold rounded-full border border-amber-200 shrink-0">
                  You both listed
                </span>
                <span className="text-sm">You both value family and tradition</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[9px] font-bold rounded-full border border-green-200 shrink-0">
                  From their profile
                </span>
                <span className="text-sm">They're also looking for something serious</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-bold rounded-full border border-blue-200 shrink-0">
                  From your profile
                </span>
                <span className="text-sm">You're in the same neighborhood</span>
              </div>
            </div>
            <p className="text-[9px] text-[#8C7E6E] italic pt-2 border-t border-[#E5E0DB]">
              Maximum 3 explanation items per match • Each item carries a source chip
            </p>
          </div>
        </section>

        {/* Source Chips */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Source Chips</h2>
          <p className="text-xs text-[#6B5E52] italic">Every explanation element carries a visible source chip indicating provenance. Chips are tappable.</p>
          <div className="space-y-3">
            {SOURCE_CHIPS.map(chip => (
              <div key={chip.label} className="flex items-center gap-3 p-3 bg-[#F7F2EE] rounded-xl">
                <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${chip.color}`}>
                  {chip.label}
                </span>
                <span className="text-xs text-[#6B5E52]">{chip.meaning}</span>
              </div>
            ))}
          </div>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-800">
            <Tag size={14} className="inline mr-1" />
            Rule: If no chip can be assigned, the sentence cannot appear.
          </div>
        </section>

        {/* Signal Allowlist */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Signal Allowlist</h2>
          <div className="space-y-2">
            {ALLOWED_SIGNALS.map(item => (
              <div key={item.signal} className="flex items-start gap-2 p-3 bg-green-50 rounded-xl text-xs border border-green-100">
                <Check size={14} className="mt-0.5 shrink-0 text-green-600" />
                <div>
                  <span className="font-bold text-green-800">{item.signal}</span>
                  <span className="text-green-700 ml-2">— {item.condition}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Signal Exclusion */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Signal Exclusion List (NEVER use)</h2>
          <div className="space-y-2">
            {EXCLUDED_SIGNALS.map(signal => (
              <div key={signal} className="flex items-start gap-2 p-3 bg-red-50 rounded-xl text-xs border border-red-100">
                <X size={14} className="mt-0.5 shrink-0 text-red-600" />
                <span className="text-red-800">{signal}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Safe vs Prohibited Patterns */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Safe vs Prohibited Patterns</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-green-700">Allowed</h3>
              {[
                '"You both value [shared value]."',
                '"You\'re both looking for [shared intent]."',
                '"You both mentioned [shared interest]."',
                '"You\'re in the same area."',
              ].map(p => (
                <div key={p} className="p-2 bg-green-50 rounded-lg text-xs text-green-800 border border-green-100">{p}</div>
              ))}
            </div>
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-700">Prohibited</h3>
              {[
                '"You\'re X% compatible."',
                '"Our AI thinks you\'d be great together."',
                '"Based on your personality, strong match."',
                '"Better match than others in your queue."',
              ].map(p => (
                <div key={p} className="p-2 bg-red-50 rounded-lg text-xs text-red-800 border border-red-100 line-through">{p}</div>
              ))}
            </div>
          </div>
        </section>

        {/* Generation Pipeline */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Generation Pipeline</h2>
          <div className="space-y-3">
            {[
              { step: '1. Signal Collection', desc: 'Collect public fields from both profiles, check shared card grants' },
              { step: '2. Overlap Detection', desc: 'Find intersections: shared values, interests, compatible intent, proximity' },
              { step: '3. Explanation Generation', desc: 'Route to Firebase AI Logic (non-sensitive) or Vertex AI (if shared card)' },
              { step: '4. Validation', desc: 'Verify allowed signal, accurate chip, no prohibited patterns, max 3 items' },
              { step: '5. Display', desc: 'Render with source chips, tappable provenance, viewer\'s locale' },
            ].map(item => (
              <div key={item.step} className="flex items-start gap-3 text-xs">
                <span className="w-6 h-6 shrink-0 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-[10px]">
                  {item.step.charAt(0)}
                </span>
                <div>
                  <span className="font-bold">{item.step}</span>
                  <p className="text-[#6B5E52] mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
