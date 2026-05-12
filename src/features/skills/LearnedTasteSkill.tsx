import React, { useState } from 'react';
import { ChevronLeft, Activity, Check, X, Info, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  authority,
  signOf,
  applyEvent,
  implicitAffinity,
  emptyTasteState,
  FAST_HALFLIFE_MS,
  SLOW_HALFLIFE_MS,
  type EventName,
  type TasteState,
} from '@/lib/learnedTaste';
import { cloneTasteState } from '@/lib/tastePersistence';

const EVENT_CLASS_COLORS: Record<string, string> = {
  policy_consent: 'bg-slate-50 text-slate-700 border-slate-200',
  explicit_preference: 'bg-green-50 text-green-700 border-green-200',
  high_signal_implicit: 'bg-blue-50 text-blue-700 border-blue-200',
  context: 'bg-gray-50 text-gray-700 border-gray-200',
};

type DemoEventRow = { name: EventName; label: string; classLabel: string };
const DEMO_EVENTS: DemoEventRow[] = [
  { name: 'more_like_this', label: '"More like this"', classLabel: 'explicit_preference' },
  { name: 'like', label: 'Like', classLabel: 'explicit_preference' },
  { name: 'reply_received', label: 'Reply received', classLabel: 'explicit_preference' },
  { name: 'long_dwell', label: 'Long dwell (8 s)', classLabel: 'high_signal_implicit' },
  { name: 'profile_open', label: 'Profile open', classLabel: 'high_signal_implicit' },
  { name: 'pass', label: 'Pass', classLabel: 'explicit_preference' },
  { name: 'less_like_this', label: '"Less like this"', classLabel: 'explicit_preference' },
  { name: 'block', label: 'Block', classLabel: 'explicit_preference' },
];

const CANDIDATE_FEATURES = ['intent_serious', 'observance_dati', 'tag_travel', 'tag_music'];

function authorityBar(a: number) {
  if (a === 0) return <span className="text-[9px] text-[#8C7E6E]">—</span>;
  return (
    <div className="flex items-center gap-1">
      <div className="h-1.5 bg-[#F3EFEA] rounded-full overflow-hidden w-16">
        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${a * 100}%` }} />
      </div>
      <span className="text-[9px] font-mono text-[#8C7E6E]">{a.toFixed(2)}</span>
    </div>
  );
}

export const LearnedTasteSkill: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [tasteState, setTasteState] = useState<TasteState>(emptyTasteState(Date.now()));
  const [log, setLog] = useState<string[]>([]);

  const fireEvent = (ev: DemoEventRow) => {
    const next = cloneTasteState(tasteState);
    applyEvent(next, {
      name: ev.name,
      class: ev.classLabel as any,
      candidateFeatures: CANDIDATE_FEATURES,
      value: ev.name === 'long_dwell' ? 8000 : undefined,
      occurredAt: Date.now(),
    });
    setTasteState(next);
    const sign = signOf(ev.name);
    const a = authority(ev.name);
    setLog(prev => [`${ev.label} (auth=${a.toFixed(2)}, sign=${sign > 0 ? '+' : sign < 0 ? '−' : '0'})`, ...prev.slice(0, 9)]);
  };

  const reset = () => {
    setTasteState(emptyTasteState(Date.now()));
    setLog([]);
  };

  const affinity = implicitAffinity(tasteState, CANDIDATE_FEATURES);

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2926]">
      <header className="sticky top-0 z-10 bg-[#FDFCFB]/95 backdrop-blur-sm px-6 py-4 flex items-center gap-4 border-b border-[#F3EFEA]">
        <button onClick={onBack} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center border border-green-200">
            <Activity size={16} />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-lg font-serif italic">Learned Taste</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E]">Implicit & Explicit Preference Learning</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Purpose */}
        <section className="p-6 bg-green-50 rounded-[24px] border border-green-100 space-y-2">
          <div className="flex items-center gap-2 text-green-700">
            <Info size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">What this is</span>
          </div>
          <p className="text-xs text-green-800 leading-relaxed">
            Consent-gated implicit and explicit preference learning with a dual-memory (fast + slow)
            state. Update rule: <code className="font-mono">Δ = authority × confidence × sign</code>.
            Message text, photos, and protected traits are <strong>never captured</strong>.
          </p>
        </section>

        {/* Event taxonomy */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Event Authority Hierarchy</h2>
          <p className="text-xs text-[#6B5E52] italic">Higher authority = more trusted signal. Explicit always outranks implicit.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#F3EFEA]">
                  <th className="text-left py-2 pr-4 font-bold text-[#2D2926]">Event</th>
                  <th className="text-left py-2 pr-4 font-bold text-[#2D2926]">Class</th>
                  <th className="text-left py-2 pr-4 font-bold text-[#2D2926]">Authority</th>
                  <th className="text-left py-2 font-bold text-[#2D2926]">Sign</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_EVENTS.map(ev => {
                  const a = authority(ev.name);
                  const s = signOf(ev.name);
                  return (
                    <tr key={ev.name} className="border-b border-[#F3EFEA]/50">
                      <td className="py-2 pr-4 font-medium">{ev.label}</td>
                      <td className="py-2 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${EVENT_CLASS_COLORS[ev.classLabel]}`}>
                          {ev.classLabel.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2 pr-4">{authorityBar(a)}</td>
                      <td className="py-2">
                        <span className={`font-bold ${s > 0 ? 'text-green-600' : s < 0 ? 'text-red-600' : 'text-[#8C7E6E]'}`}>
                          {s > 0 ? '+' : s < 0 ? '−' : '0'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Interactive demo */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Live Taste State Demo</h2>
            <Button variant="ghost" size="sm" onClick={reset} className="text-[10px] uppercase tracking-widest flex items-center gap-1">
              <RotateCcw size={12} /> Reset
            </Button>
          </div>
          <p className="text-xs text-[#6B5E52] italic">
            Fire events on a demo candidate with features: <code className="font-mono text-[9px]">{CANDIDATE_FEATURES.join(', ')}</code>
          </p>
          <div className="flex flex-wrap gap-2">
            {DEMO_EVENTS.map(ev => (
              <button
                key={ev.name}
                onClick={() => fireEvent(ev)}
                className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full border border-[#F3EFEA] bg-[#F7F2EE] hover:border-green-300 hover:bg-green-50 transition-all"
              >
                {ev.label}
              </button>
            ))}
          </div>

          {/* Affinity meter */}
          <div className="p-4 bg-[#F7F2EE] rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold">Implicit affinity (70% fast + 30% slow)</span>
              <span className={`font-mono font-bold ${affinity > 0.1 ? 'text-green-700' : affinity < -0.1 ? 'text-red-700' : 'text-[#8C7E6E]'}`}>
                {affinity.toFixed(3)}
              </span>
            </div>
            <div className="h-2 bg-[#E5E0DB] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${affinity >= 0 ? 'bg-green-400' : 'bg-red-400'}`}
                style={{ width: `${Math.abs(affinity) * 100}%`, marginLeft: affinity >= 0 ? '50%' : `${50 - Math.abs(affinity) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-[#8C7E6E]">
              <span>Away −1</span>
              <span>Neutral 0</span>
              <span>Toward +1</span>
            </div>
          </div>

          {/* Event log */}
          {log.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">Event log</p>
              {log.map((entry, i) => (
                <div key={i} className="text-[10px] font-mono text-[#6B5E52] p-2 bg-[#F7F2EE] rounded-lg">
                  {entry}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Memory half-lives */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Dual Memory Half-Lives</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-700">Fast Memory</p>
              <p className="text-xl font-bold text-blue-900">{Math.round(FAST_HALFLIFE_MS / 86_400_000)} days</p>
              <p className="text-[10px] text-blue-700 italic">Captures mood + recent activity</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-purple-700">Slow Memory</p>
              <p className="text-xl font-bold text-purple-900">{Math.round(SLOW_HALFLIFE_MS / 86_400_000)} days</p>
              <p className="text-[10px] text-purple-700 italic">Captures durable preferences</p>
            </div>
          </div>
          <p className="text-xs text-[#6B5E52] italic">
            Slow memory integrates at 40% the rate of fast memory. Both decay continuously via exponential decay.
          </p>
        </section>

        {/* Privacy rules */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Privacy Rules</h2>
          {[
            { ok: false, text: 'Message content captured in taste profile' },
            { ok: false, text: 'Photo metadata or exact location as taste signals' },
            { ok: false, text: 'Protected traits (religion, ethnicity) as taste features' },
            { ok: true,  text: 'Explicit signals always outrank implicit' },
            { ok: true,  text: 'Taste reset clears vectors but preserves safety records' },
            { ok: true,  text: 'Owner-visible summaries only — raw weights never shown' },
          ].map((item, i) => (
            <div key={i} className={`flex items-start gap-2 p-3 rounded-xl text-xs border ${item.ok ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
              {item.ok ? <Check size={12} className="mt-0.5 shrink-0 text-green-600" /> : <X size={12} className="mt-0.5 shrink-0 text-red-600" />}
              <span className={item.ok ? 'text-green-800' : 'text-red-800 line-through'}>{item.text}</span>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};
