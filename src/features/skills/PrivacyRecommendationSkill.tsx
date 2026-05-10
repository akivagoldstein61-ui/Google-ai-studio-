import React from 'react';
import { ChevronLeft, Layers, Check, X, Shield, Eye, EyeOff } from 'lucide-react';

const SIGNAL_TABLE = [
  { signal: 'Shared values', source: 'Profile', layers: '1, 2', explanation: true },
  { signal: 'Relationship intent', source: 'Profile', layers: '1, 2', explanation: true },
  { signal: 'Location/logistics', source: 'Profile', layers: '1, 2', explanation: true },
  { signal: 'Observance/lifestyle', source: 'Profile', layers: '1, 2', explanation: true },
  { signal: 'Explicit preferences', source: 'Settings', layers: '1', explanation: false },
  { signal: 'Behavioral likes/passes', source: 'Interaction', layers: '1', explanation: false },
  { signal: 'Dwell time', source: 'Telemetry', layers: '1', explanation: false },
  { signal: 'Personality domains', source: 'Assessment', layers: '3 only', explanation: false },
  { signal: 'Private taste vector', source: 'Derived', layers: '1', explanation: false },
  { signal: 'Inferred traits', source: 'Prohibited', layers: 'None', explanation: false },
];

export const PrivacyRecommendationSkill: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2926]">
      <header className="sticky top-0 z-10 bg-[#FDFCFB]/95 backdrop-blur-sm px-6 py-4 flex items-center gap-4 border-b border-[#F3EFEA]">
        <button onClick={onBack} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center border border-indigo-200">
            <Layers size={16} />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-lg font-serif italic">Privacy-Preserving Recommendation</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E]">Three-Layer Architecture</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Three-Layer Architecture */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E] px-2">Architecture Layers</h2>
          
          {/* Layer 1 */}
          <div className="p-5 bg-white border border-[#F3EFEA] rounded-[24px] space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">1</span>
              <div>
                <h3 className="font-bold text-sm">Silent Personalization</h3>
                <p className="text-[9px] text-[#8C7E6E] uppercase tracking-widest">Invisible to user • No personality</p>
              </div>
            </div>
            <p className="text-xs text-[#6B5E52]">Orders candidate pool using only explicit signals. Output is an ordered list with no scores shown to user.</p>
            <div className="flex flex-wrap gap-1">
              {['Values', 'Intent', 'Observance', 'Logistics', 'Preferences', 'Behavioral feedback'].map(s => (
                <span key={s} className="px-2 py-0.5 bg-green-50 text-green-700 text-[9px] font-bold rounded-full border border-green-100">{s}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {['Personality scores', 'Taste vectors', 'Inferred traits'].map(s => (
                <span key={s} className="px-2 py-0.5 bg-red-50 text-red-700 text-[9px] font-bold rounded-full border border-red-100 line-through">{s}</span>
              ))}
            </div>
          </div>

          {/* Layer 2 */}
          <div className="p-5 bg-white border border-[#F3EFEA] rounded-[24px] space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">2</span>
              <div>
                <h3 className="font-bold text-sm">Safe Explanation</h3>
                <p className="text-[9px] text-[#8C7E6E] uppercase tracking-widest">Visible • Public signals only • No personality</p>
              </div>
            </div>
            <p className="text-xs text-[#6B5E52]">"Why This Match" chips draw ONLY from whitelisted public/permissioned signals. Never reveals ordering logic or personality usage.</p>
            <div className="p-3 bg-[#F7F2EE] rounded-xl text-xs space-y-1">
              <p className="font-bold text-[#8C7E6E]">Key constraints:</p>
              <ul className="space-y-1 text-[#6B5E52]">
                <li>• Never reveal that personality was or was not used in ordering</li>
                <li>• Never imply a compatibility score exists</li>
                <li>• Explanation is assistive context, not recommendation justification</li>
              </ul>
            </div>
          </div>

          {/* Layer 3 */}
          <div className="p-5 bg-white border border-red-200 rounded-[24px] space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm">3</span>
              <div>
                <h3 className="font-bold text-sm">Permissioned Personality</h3>
                <p className="text-[9px] text-red-600 uppercase tracking-widest font-bold">BLOCKED — Requires validation</p>
              </div>
            </div>
            <p className="text-xs text-[#6B5E52]">Personality MUST NOT influence ranking until all prerequisites are met through validation studies.</p>
            <div className="space-y-2">
              {[
                'User completed assessment',
                'User explicitly consented to AI recommendation use',
                'Psychometric validation confirms incremental validity',
                'Measurement invariance established',
                'A/B testing shows personality adds value',
              ].map((req, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <div className={`w-4 h-4 shrink-0 rounded-full flex items-center justify-center ${i < 2 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {i < 2 ? <Check size={10} /> : <X size={10} />}
                  </div>
                  <span className={i >= 2 ? 'text-[#8C7E6E]' : ''}>{req}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Signal Classification */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Signal Classification</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#F3EFEA]">
                  <th className="text-left py-2 pr-3 font-bold">Signal</th>
                  <th className="text-left py-2 pr-3 font-bold">Source</th>
                  <th className="text-left py-2 pr-3 font-bold">Layer</th>
                  <th className="text-left py-2 font-bold">Explainable?</th>
                </tr>
              </thead>
              <tbody>
                {SIGNAL_TABLE.map(row => (
                  <tr key={row.signal} className="border-b border-[#F3EFEA]/50">
                    <td className="py-2 pr-3">{row.signal}</td>
                    <td className="py-2 pr-3 text-[#8C7E6E]">{row.source}</td>
                    <td className="py-2 pr-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        row.layers === 'None' ? 'bg-red-50 text-red-700' : 'bg-indigo-50 text-indigo-700'
                      }`}>{row.layers}</span>
                    </td>
                    <td className="py-2">
                      {row.explanation ? <Eye size={14} className="text-green-600" /> : <EyeOff size={14} className="text-[#8C7E6E]" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Coarse Compatibility Bands */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Coarse Compatibility Bands</h2>
          <p className="text-xs text-[#6B5E52] italic">If personality is ever validated for recommendation use, express fit as coarse bands, never numeric scores.</p>
          <div className="space-y-2">
            <div className="p-3 bg-green-50 rounded-xl text-xs flex items-center justify-between border border-green-100">
              <span className="font-bold text-green-700">High alignment</span>
              <span className="text-green-600 italic">"You share several approaches to [domain]"</span>
            </div>
            <div className="p-3 bg-[#F7F2EE] rounded-xl text-xs flex items-center justify-between">
              <span className="font-bold text-[#8C7E6E]">Moderate alignment</span>
              <span className="text-[#8C7E6E] italic">No special indicator</span>
            </div>
            <div className="p-3 bg-[#F7F2EE] rounded-xl text-xs flex items-center justify-between">
              <span className="font-bold text-[#8C7E6E]">Low alignment</span>
              <span className="text-[#8C7E6E] italic">No negative indicator shown</span>
            </div>
          </div>
          <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-xs text-red-700 space-y-1">
            <p className="font-bold">Never:</p>
            <ul className="space-y-0.5 pl-3">
              <li>• Show "X% compatible"</li>
              <li>• Rank matches by compatibility score visibly</li>
              <li>• Use "soulmate," "perfect match," or "destiny" language</li>
            </ul>
          </div>
        </section>

        {/* Anti-Leakage */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Anti-Leakage Rules</h2>
          <div className="space-y-2">
            {[
              '"Why This Match" must not hint at personality unless user has shared a card',
              'Daily Picks ordering must not visibly correlate with personality scores',
              'Conversation starters must not reference personality traits',
              'Profile suggestions must not be personality-derived',
            ].map((rule, i) => (
              <div key={i} className="flex items-start gap-2 p-3 bg-[#F7F2EE] rounded-xl text-xs">
                <Shield size={14} className="mt-0.5 shrink-0 text-indigo-600" />
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
