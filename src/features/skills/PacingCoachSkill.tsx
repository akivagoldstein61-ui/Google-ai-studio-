import React, { useState, useEffect } from 'react';
import { ChevronLeft, Coffee, Check, X, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const TRIGGER_THRESHOLDS = [
  { signal: 'Session length', threshold: '> 25 minutes continuous', description: 'Gentle break suggestion' },
  { signal: 'Swipe velocity', threshold: '> 30 swipes in 10 minutes', description: 'Slow-down nudge' },
  { signal: 'Repeated passes', threshold: '> 12 passes in a row', description: 'Reflection prompt' },
  { signal: 'Dismissed nudges', threshold: '≥ 3 dismissals this session', description: 'No more nudges for session' },
  { signal: 'Sessions per day', threshold: '> 4 sessions', description: 'End-of-day reflection offer' },
];

const COPY_RULES = [
  { allowed: '"This is a good moment to pause."', forbidden: false },
  { allowed: '"What felt energizing in today\'s browsing?"', forbidden: false },
  { allowed: '"Take your time — there\'s no rush."', forbidden: false },
  { allowed: '"You seem tired — are you okay?"', forbidden: true },
  { allowed: '"You\'ve been swiping a lot. Are you desperate?"', forbidden: true },
  { allowed: '"Don\'t miss your daily picks before they expire!"', forbidden: true },
];

const SAMPLE_NUDGES = [
  {
    trigger: 'Long session',
    message: "You've been exploring for a while. A short pause might help you stay present with what's actually interesting you.",
    reflection: 'What kinds of profiles felt most alive to you today?',
    tone: 'calm',
  },
  {
    trigger: 'High velocity',
    message: "You're moving quickly. Taking a breath sometimes helps — no one is going anywhere.",
    reflection: 'Is there a profile you passed quickly that you want to revisit?',
    tone: 'gentle',
  },
  {
    trigger: 'Repeated passes',
    message: "Seems like nothing's quite landing right now. That's completely normal.",
    reflection: 'What would feel genuinely interesting to you today?',
    tone: 'reflective',
  },
];

export const PacingCoachSkill: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [activeDemoIdx, setActiveDemoIdx] = useState(0);
  const [dismissed, setDismissed] = useState<number[]>([]);
  const [sessionMinutes, setSessionMinutes] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionMinutes(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeNudge = SAMPLE_NUDGES[activeDemoIdx];
  const isDismissed = dismissed.includes(activeDemoIdx);

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2926]">
      <header className="sticky top-0 z-10 bg-[#FDFCFB]/95 backdrop-blur-sm px-6 py-4 flex items-center gap-4 border-b border-[#F3EFEA]">
        <button onClick={onBack} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center border border-green-200">
            <Coffee size={16} />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-lg font-serif italic">Pacing Coach</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E]">Anti-Burnout Discovery</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Core Principle */}
        <section className="p-6 bg-green-50 rounded-[24px] border border-green-100 space-y-3">
          <div className="flex items-center gap-2 text-green-700">
            <Coffee size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Core Principle</span>
          </div>
          <p className="text-xs text-green-800 leading-relaxed">
            Gentle pacing interventions that protect user attention without manipulating them.
            Nudges are always <strong>dismissible</strong>, never blocking, and never use shame, scarcity, or urgency.
          </p>
          <div className="flex items-center gap-2 text-[10px] text-green-700">
            <Clock size={12} />
            <span>Simulated session: {sessionMinutes}s elapsed</span>
          </div>
        </section>

        {/* Interactive Demo */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Nudge Demo</h2>
            <div className="flex gap-1">
              {SAMPLE_NUDGES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setActiveDemoIdx(i); setDismissed(prev => prev.filter(x => x !== i)); }}
                  className={`w-6 h-6 rounded-full text-[10px] font-bold transition-all ${
                    activeDemoIdx === i ? 'bg-green-600 text-white' : 'bg-[#F7F2EE] text-[#8C7E6E]'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-[#F7F2EE] rounded-2xl border border-[#E5E0DB] space-y-1">
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E]">
              Trigger: {activeNudge.trigger}
            </span>
          </div>

          {!isDismissed ? (
            <div className="p-5 bg-white border border-green-200 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-3 flex-1">
                  <p className="text-sm leading-relaxed text-[#2D2926] italic">{activeNudge.message}</p>
                  <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-green-700 mb-1">Reflection prompt</p>
                    <p className="text-xs text-green-800 italic">{activeNudge.reflection}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDismissed(prev => [...prev, activeDemoIdx])}
                  className="text-[10px] uppercase tracking-widest bg-[#F7F2EE] rounded-full flex-1"
                >
                  Dismiss
                </Button>
                <Button
                  size="sm"
                  className="text-[10px] uppercase tracking-widest bg-green-600 text-white rounded-full flex-1"
                >
                  Take a Break
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-[#F7F2EE] rounded-2xl text-center">
              <p className="text-xs text-[#8C7E6E] italic">Nudge dismissed. No more nudges for this trigger this session.</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDismissed(prev => prev.filter(x => x !== activeDemoIdx))}
                className="mt-2 text-[10px] uppercase tracking-widest"
              >
                Reset demo
              </Button>
            </div>
          )}
        </section>

        {/* Trigger Thresholds */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Trigger Thresholds</h2>
          <p className="text-xs text-[#6B5E52] italic">All thresholds are deterministic and testable. No AI inference for triggers.</p>
          <div className="space-y-2">
            {TRIGGER_THRESHOLDS.map(item => (
              <div key={item.signal} className="flex items-center justify-between p-3 bg-[#F7F2EE] rounded-xl text-xs">
                <div>
                  <span className="font-bold">{item.signal}</span>
                  <span className="text-[#8C7E6E] ml-2">{item.description}</span>
                </div>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[9px] font-bold border border-amber-100 ml-2 shrink-0">
                  {item.threshold}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Copy Standards */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Copy Standards</h2>
          <div className="space-y-2">
            {COPY_RULES.map((item, i) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-xl text-xs border ${
                item.forbidden ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'
              }`}>
                {item.forbidden
                  ? <X size={14} className="mt-0.5 shrink-0 text-red-600" />
                  : <Check size={14} className="mt-0.5 shrink-0 text-green-600" />
                }
                <span className={item.forbidden ? 'text-red-800 line-through' : 'text-green-800'}>
                  {item.allowed}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Signals Used */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Data Inputs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-green-700">Used signals (coarse only)</h3>
              {['Session length (minutes)', 'Swipe count this session', 'Pass streak count', 'Nudge dismissal count', 'Sessions per day (count)'].map(s => (
                <div key={s} className="flex items-start gap-2 text-xs">
                  <Check size={12} className="mt-0.5 shrink-0 text-green-600" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-700">Never used</h3>
              {['Private messages', 'Personality scores / raw answers', 'Sensitive trait labels', 'Other users\' data', 'Precise location'].map(s => (
                <div key={s} className="flex items-start gap-2 text-xs">
                  <X size={12} className="mt-0.5 shrink-0 text-red-600" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Acceptance Checks */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Acceptance Checks</h2>
          <div className="space-y-2">
            {[
              'Pacing feature can be fully disabled from Settings',
              'Every nudge has a visible dismiss / "not now" path',
              'Gemini failure produces no intrusive modal',
              'Nudges never block access to discovery or navigation',
              'Output validator blocks diagnosis, urgency, and shame language',
              'Rate limiter prevents nudging more than once per trigger per session',
            ].map((check, i) => (
              <div key={i} className="flex items-start gap-2 p-3 bg-[#F7F2EE] rounded-xl text-xs">
                <Check size={14} className="mt-0.5 shrink-0 text-green-600" />
                <span>{check}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
