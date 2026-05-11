import React, { useState } from 'react';
import { ChevronLeft, Fingerprint, Check, X, ToggleLeft, ToggleRight, RotateCcw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const SAMPLE_TASTE_PROFILE = [
  { signal: 'Serious relationship intent', weight: 'strong', source: 'explicit', direction: 'toward' },
  { signal: 'Traditional observance', weight: 'moderate', source: 'explicit', direction: 'toward' },
  { signal: 'Long-distance', weight: 'strong', source: 'explicit', direction: 'away' },
  { signal: 'Intellectually curious profiles', weight: 'moderate', source: 'implicit', direction: 'toward' },
  { signal: 'Profiles mentioning family', weight: 'weak', source: 'implicit', direction: 'toward' },
];

const EVENT_TYPES = [
  { event: 'Like / Match', authority: 'High explicit', weight: '0.8', signal: '✓' },
  { event: '"More like this"', authority: 'Highest explicit', weight: '0.95', signal: '✓' },
  { event: '"Less like this"', authority: 'Highest explicit', weight: '-0.95', signal: '✓' },
  { event: 'Profile open (long dwell)', authority: 'Medium implicit', weight: '0.3', signal: '✓' },
  { event: 'Pass', authority: 'Low implicit', weight: '-0.1', signal: '✓' },
  { event: 'Impression only (no action)', authority: 'Not a dislike', weight: '0', signal: '—' },
  { event: 'Message content', authority: 'EXCLUDED', weight: 'n/a', signal: '✗' },
  { event: 'Exact location', authority: 'EXCLUDED', weight: 'n/a', signal: '✗' },
  { event: 'Protected traits', authority: 'EXCLUDED', weight: 'n/a', signal: '✗' },
];

const EXPLANATION_RULES = [
  { rule: 'Never say "your private taste prefers X about this person"', correct: 'Say "based on what is visible on their profile"' },
  { rule: 'Never expose taste vector values or weights in UI', correct: 'Show only editable category-level summaries' },
  { rule: 'Never infer or display protected trait preferences', correct: 'Remove protected-trait fields from taste schema entirely' },
  { rule: 'Never show other users any taste data', correct: 'Taste is strictly owner-only, never surfaced to others' },
];

export const PrivateTasteSkill: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [tasteEnabled, setTasteEnabled] = useState(false);
  const [showConsentGate, setShowConsentGate] = useState(false);

  const handleToggle = () => {
    if (!tasteEnabled) {
      setShowConsentGate(true);
    } else {
      setTasteEnabled(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2926]">
      <header className="sticky top-0 z-10 bg-[#FDFCFB]/95 backdrop-blur-sm px-6 py-4 flex items-center gap-4 border-b border-[#F3EFEA]">
        <button onClick={onBack} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center border border-purple-200">
            <Fingerprint size={16} />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-lg font-serif italic">Private Taste</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E]">Owner-Only Preference Learning</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Consent Gate */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Personalization</h2>
              <p className="text-xs text-[#6B5E52] mt-1 italic">Off by default. Requires explicit consent to activate.</p>
            </div>
            <button onClick={handleToggle} className="transition-all">
              {tasteEnabled
                ? <ToggleRight size={36} className="text-purple-600" />
                : <ToggleLeft size={36} className="text-[#C5B8AE]" />
              }
            </button>
          </div>

          {tasteEnabled && (
            <div className="p-3 bg-purple-50 rounded-xl text-xs text-purple-800 border border-purple-100">
              <span className="font-bold">Active</span> — Kesher is learning your preferences. This is private and only visible to you.
              <button
                onClick={() => setTasteEnabled(false)}
                className="ml-2 underline underline-offset-2"
              >
                Disable
              </button>
            </div>
          )}

          {/* Consent Gate Modal */}
          {showConsentGate && (
            <div className="p-5 bg-[#F7F2EE] rounded-2xl border border-[#E5E0DB] space-y-4">
              <h3 className="font-bold text-sm">Enable Personalization?</h3>
              <div className="text-xs space-y-2 text-[#2D2926]">
                <p>Kesher will learn from how you interact with profiles (likes, passes, dwell time) to improve your Daily Picks.</p>
                <p className="font-medium">What we <span className="text-green-700">do</span> use:</p>
                <ul className="space-y-1 pl-4 text-[#6B5E52]">
                  <li>• Your swipes and likes</li>
                  <li>• Explicit controls (more/less like this)</li>
                  <li>• Approximate session patterns</li>
                </ul>
                <p className="font-medium mt-2">What we <span className="text-red-700">never</span> use:</p>
                <ul className="space-y-1 pl-4 text-[#6B5E52]">
                  <li>• Your message content</li>
                  <li>• Personality assessment answers</li>
                  <li>• Exact location</li>
                  <li>• Protected trait inference</li>
                </ul>
                <p className="text-[#8C7E6E] italic">This is private. Other users never see your taste profile.</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="rounded-full bg-[#2D2926] text-white text-[10px] uppercase tracking-widest"
                  onClick={() => { setTasteEnabled(true); setShowConsentGate(false); }}
                >
                  Enable Personalization
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-[10px] uppercase tracking-widest"
                  onClick={() => setShowConsentGate(false)}
                >
                  Not Now
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* Sample Profile (owner view) */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Sample Taste Profile (Owner View Only)</h2>
          <p className="text-xs text-[#6B5E52] italic">Categories only — no weights, no vectors exposed to UI.</p>
          <div className="space-y-2">
            {SAMPLE_TASTE_PROFILE.map(item => (
              <div key={item.signal} className="flex items-center justify-between p-3 bg-[#F7F2EE] rounded-xl text-xs">
                <div>
                  <span className="font-medium">{item.signal}</span>
                  <span className={`ml-2 px-2 py-0.5 text-[9px] font-bold rounded-full ${
                    item.source === 'explicit'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {item.source}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold ${
                    item.direction === 'toward' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.direction === 'toward' ? '▲ toward' : '▼ away'}
                  </span>
                  <span className="text-[9px] text-[#8C7E6E]">{item.weight}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="ghost" size="sm" className="rounded-full text-[10px] uppercase tracking-widest bg-[#F7F2EE] flex items-center gap-1">
              <RotateCcw size={10} /> Reset Taste
            </Button>
          </div>
        </section>

        {/* Event Taxonomy */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Event Weight Table</h2>
          <p className="text-xs text-[#6B5E52] italic">Explicit controls always outrank implicit signals. Missing impressions are never negative signals.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#F3EFEA]">
                  <th className="text-left py-2 pr-3 font-bold">Event</th>
                  <th className="text-left py-2 pr-3 font-bold">Authority</th>
                  <th className="text-left py-2 pr-3 font-bold">Weight</th>
                  <th className="text-left py-2 font-bold">Used</th>
                </tr>
              </thead>
              <tbody>
                {EVENT_TYPES.map(row => (
                  <tr key={row.event} className="border-b border-[#F3EFEA]/50">
                    <td className="py-2 pr-3">{row.event}</td>
                    <td className="py-2 pr-3">
                      <span className={`text-[9px] font-bold ${
                        row.authority === 'EXCLUDED' ? 'text-red-600' : 'text-[#6B5E52]'
                      }`}>{row.authority}</span>
                    </td>
                    <td className="py-2 pr-3 font-mono">{row.weight}</td>
                    <td className="py-2">
                      <span className={row.signal === '✗' ? 'text-red-600 font-bold' : row.signal === '—' ? 'text-[#8C7E6E]' : 'text-green-600 font-bold'}>
                        {row.signal}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Explanation Boundary Rules */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Explanation Boundary Rules</h2>
          </div>
          <p className="text-xs text-[#6B5E52] italic">
            The taste system influences ranking. The explanation layer MUST NOT reveal how.
          </p>
          <div className="space-y-3">
            {EXPLANATION_RULES.map((item, i) => (
              <div key={i} className="p-3 bg-[#F7F2EE] rounded-xl text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <X size={12} className="mt-0.5 shrink-0 text-red-600" />
                  <span className="text-red-700 line-through">{item.rule}</span>
                </div>
                <div className="flex items-start gap-2 pl-4">
                  <Check size={12} className="mt-0.5 shrink-0 text-green-600" />
                  <span className="text-green-700">{item.correct}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Reset Semantics */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Taste Reset Semantics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-700 mb-2">Clears on reset</h3>
              {['Taste vector', 'Explicit anchors', 'Explanation history cache', 'On-device summaries'].map(s => (
                <div key={s} className="flex items-start gap-2 text-xs mb-1">
                  <RotateCcw size={12} className="mt-0.5 shrink-0 text-red-600" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-amber-700 mb-2">Preserved on reset</h3>
              {['Abuse reports', 'Safety retention records', 'Legal consent records', 'Block / report history'].map(s => (
                <div key={s} className="flex items-start gap-2 text-xs mb-1">
                  <Check size={12} className="mt-0.5 shrink-0 text-amber-600" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
