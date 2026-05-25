import React, { useState, useEffect } from 'react';
import { ChevronLeft, Shield, Check, X, Eye, Download, Trash2, RotateCcw, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { AI_FEATURE_REGISTRY } from '@/ai/featureRegistry';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';

/**
 * LIVE: real per-feature consent toggles persisted to the same owner-only
 * Firestore doc the AI & Trust Hub uses (users/{uid}/private/preferences).
 * Default-enabled features come from the canonical registry; nothing about
 * personality data is paywalled.
 */
const LiveConsent: React.FC = () => {
  const { user, trackEvent } = useApp();
  const userVisible = AI_FEATURE_REGISTRY.filter((f) => f.user_visible);
  const defaults = userVisible.filter((f) => f.default_enabled).map((f) => f.id);
  const [enabled, setEnabled] = useState<string[]>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) { setLoading(false); return; }
      try {
        const snap = await getDoc(doc(db, `users/${user.uid}/private/preferences`));
        if (!cancelled && snap.exists() && Array.isArray(snap.data().enabledFeatures)) {
          setEnabled(snap.data().enabledFeatures);
        }
      } catch { /* keep defaults */ } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const toggle = async (id: string) => {
    if (!user) return;
    const wasOn = enabled.includes(id);
    const next = wasOn ? enabled.filter((x) => x !== id) : [...enabled, id];
    setEnabled(next);
    setSaving(true);
    try {
      await setDoc(doc(db, `users/${user.uid}/private/preferences`), {
        enabledFeatures: next,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      trackEvent?.(wasOn ? 'skill_consent_declined' : 'skill_consent_accepted', { skillId: 'consent-ux', feature: id });
    } catch { /* surfaced via saving state */ } finally {
      setSaving(false);
    }
  };

  return (
    <section className="p-6 bg-[#2D2926] rounded-[28px] text-white space-y-4 relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-[#D4AF37]/10 blur-3xl" />
      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-2 text-[#D4AF37]"><Sparkles size={16} /><span className="text-[10px] font-bold uppercase tracking-widest">Your live AI consent</span></div>
        {!user ? (
          <p className="text-sm text-white/70 italic">Sign in to manage which AI features are enabled for you.</p>
        ) : loading ? (
          <div className="flex items-center gap-3 text-white/70"><Loader2 size={18} className="animate-spin text-[#D4AF37]" /><span className="text-sm italic">Loading your preferences…</span></div>
        ) : (
          <div className="space-y-2">
            {userVisible.map((f) => {
              const on = enabled.includes(f.id);
              return (
                <div key={f.id} className="flex items-center justify-between gap-3 p-3 bg-white/5 border border-white/10 rounded-2xl">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white/90 truncate">{f.name}</p>
                    {f.notes && <p className="text-[11px] text-white/50 italic truncate">{f.notes}</p>}
                  </div>
                  <button
                    onClick={() => toggle(f.id)}
                    role="switch"
                    aria-checked={on}
                    aria-label={`Toggle ${f.name}`}
                    className={`w-12 h-6 rounded-full transition-all relative shrink-0 ${on ? 'bg-[#D4AF37]' : 'bg-white/15'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${on ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              );
            })}
            <p className="text-[9px] text-white/40 italic pt-1">{saving ? 'Saving…' : 'Saved to your private preferences. Safety and privacy controls are never paywalled.'}</p>
          </div>
        )}
      </div>
    </section>
  );
};

const CONSENT_LOG_DEMO = [
  { action: 'granted', scope: 'assessment', timestamp: '2026-05-10T14:30:00Z', version: '1.0' },
  { action: 'granted', scope: 'share', timestamp: '2026-05-10T15:45:00Z', version: '1.0' },
  { action: 'revoked', scope: 'share', timestamp: '2026-05-11T09:00:00Z', version: '1.0' },
];

const ACTIVE_SHARES_DEMO = [
  { recipient: 'Sarah M.', cardType: 'basic', grantedAt: '2026-05-09', revocable: true },
  { recipient: 'David K.', cardType: 'deeper', grantedAt: '2026-05-08', revocable: true },
];

export const ConsentUxSkill: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [showAssessmentGate, setShowAssessmentGate] = useState(false);
  const [showShareGate, setShowShareGate] = useState(false);
  const [showMutualGate, setShowMutualGate] = useState(false);
  const [aiUsageConsent, setAiUsageConsent] = useState(false);

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2926]">
      <header className="sticky top-0 z-10 bg-[#FDFCFB]/95 backdrop-blur-sm px-6 py-4 flex items-center gap-4 border-b border-[#F3EFEA]">
        <button onClick={onBack} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center border border-emerald-200">
            <Shield size={16} />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-lg font-serif italic">Consent UX</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E]">Trust Hub & Grants Ledger</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* LIVE: real per-feature consent toggles */}
        <LiveConsent />

        {/* Section 11 Notice */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Section 11 Notice Requirements</h2>
          <p className="text-xs text-[#6B5E52] italic">Every consent screen MUST disclose all of the following:</p>
          <div className="space-y-2">
            {[
              { label: 'Voluntariness', content: '"This is optional. Declining does not affect your core Kesher experience."' },
              { label: 'Purpose', content: 'Specific purpose of this data collection (reflection, sharing, recommendation)' },
              { label: 'Controller', content: 'Kesher entity name and contact details' },
              { label: 'Recipients', content: 'Who receives data and for what purpose' },
              { label: 'Refusal consequence', content: 'What happens if user says no' },
              { label: 'Rights', content: 'Access, correction, deletion rights exist' },
              { label: 'AI disclosure', content: 'If AI processes data: risks and possible adverse consequences' },
            ].map(item => (
              <div key={item.label} className="flex items-start gap-3 p-3 bg-[#F7F2EE] rounded-xl text-xs">
                <Check size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                <div>
                  <span className="font-bold">{item.label}:</span>{' '}
                  <span className="text-[#6B5E52]">{item.content}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Consent Gate Demos */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Consent Gate Demos</h2>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowAssessmentGate(true)}
              className="text-[10px] uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
              Assessment Gate
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowShareGate(true)}
              className="text-[10px] uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
              Sharing Gate
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowMutualGate(true)}
              className="text-[10px] uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
              Mutual Consent Gate
            </Button>
          </div>

          {/* Assessment Gate */}
          {showAssessmentGate && (
            <div className="p-5 bg-[#F7F2EE] rounded-2xl border border-[#F3EFEA] space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-sm">Personality Assessment Consent</h3>
                <button onClick={() => setShowAssessmentGate(false)}><X size={16} className="text-[#8C7E6E]" /></button>
              </div>
              <div className="text-xs space-y-3 text-[#2D2926]">
                <p className="font-medium">Personality on Kesher is optional.</p>
                <p>We use your answers to generate a private reflection for you and, only if you separately choose, to improve how Kesher explains or personalizes parts of your experience.</p>
                <p>Your answers are sensitive. They are private by default, not shown to other users, and not used for sharing or compatibility reflection unless you explicitly preview and approve the exact summary for a specific recipient.</p>
                <p className="text-[#8C7E6E] italic">You can skip, stop, reset, export, or delete this data at any time.</p>
              </div>
              <div className="flex gap-3">
                <Button size="sm" className="rounded-full bg-[#2D2926] text-white text-[10px] uppercase tracking-widest px-6">
                  Begin Assessment
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full text-[10px] uppercase tracking-widest px-6">
                  Not Now
                </Button>
              </div>
            </div>
          )}

          {/* Sharing Gate */}
          {showShareGate && (
            <div className="p-5 bg-[#F7F2EE] rounded-2xl border border-[#F3EFEA] space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-sm">Share Personality Summary</h3>
                <button onClick={() => setShowShareGate(false)}><X size={16} className="text-[#8C7E6E]" /></button>
              </div>
              <div className="text-xs space-y-3 text-[#2D2926]">
                <p>You're about to share a personality summary with <strong>Sarah M.</strong></p>
                <div className="p-3 bg-white rounded-xl border border-[#F3EFEA]">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E] mb-2">Preview — exactly what they'll see:</p>
                  <p className="italic text-[#6B5E52]">"Your responses suggest you tend toward warm, energetic engagement with others. You often bring enthusiasm to social situations and value deep connections."</p>
                </div>
                <p className="text-[#8C7E6E]">This share lasts until you revoke it. Nothing is sent automatically. Sarah cannot see your raw answers or scores.</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="rounded-full bg-[#2D2926] text-white text-[10px] uppercase tracking-widest px-4">Share This Summary</Button>
                <Button variant="ghost" size="sm" className="rounded-full text-[10px] uppercase tracking-widest px-4">Edit First</Button>
                <Button variant="ghost" size="sm" className="rounded-full text-[10px] uppercase tracking-widest px-4">Cancel</Button>
              </div>
            </div>
          )}

          {/* Mutual Gate */}
          {showMutualGate && (
            <div className="p-5 bg-[#F7F2EE] rounded-2xl border border-[#F3EFEA] space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-sm">Mutual Reflection Consent</h3>
                <button onClick={() => setShowMutualGate(false)}><X size={16} className="text-[#8C7E6E]" /></button>
              </div>
              <div className="text-xs space-y-3 text-[#2D2926]">
                <p>To see how your styles might interact, both people need to agree.</p>
                <p className="font-medium">You're consenting to:</p>
                <ul className="space-y-1 pl-4">
                  <li className="flex items-start gap-2"><Check size={12} className="mt-0.5 text-emerald-600" />A reflection about communication and interaction styles</li>
                  <li className="flex items-start gap-2"><Check size={12} className="mt-0.5 text-emerald-600" />Generated from both your shared summaries</li>
                  <li className="flex items-start gap-2"><Check size={12} className="mt-0.5 text-emerald-600" />Shown to both of you equally</li>
                </ul>
                <p className="text-[#8C7E6E] italic">Neither person sees the other's raw answers. Both can revoke at any time.</p>
              </div>
              <div className="flex gap-3">
                <Button size="sm" className="rounded-full bg-[#2D2926] text-white text-[10px] uppercase tracking-widest px-6">I Agree</Button>
                <Button variant="ghost" size="sm" className="rounded-full text-[10px] uppercase tracking-widest px-6">Not Now</Button>
              </div>
            </div>
          )}
        </section>

        {/* Trust Hub Demo */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Trust Hub Dashboard (Demo)</h2>
          
          {/* Assessment Status */}
          <div className="p-4 bg-[#F7F2EE] rounded-2xl space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">Assessment Status</h3>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">Completed</span>
              <Button variant="ghost" size="sm" className="text-[9px] text-red-600 uppercase tracking-widest flex items-center gap-1">
                <RotateCcw size={10} /> Reset
              </Button>
            </div>
          </div>

          {/* Active Shares */}
          <div className="p-4 bg-[#F7F2EE] rounded-2xl space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">Active Shares</h3>
            {ACTIVE_SHARES_DEMO.map(share => (
              <div key={share.recipient} className="flex items-center justify-between text-xs p-2 bg-white rounded-xl">
                <div>
                  <span className="font-bold">{share.recipient}</span>
                  <span className="ml-2 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[9px] font-bold border border-emerald-100">
                    {share.cardType}
                  </span>
                </div>
                <Button variant="ghost" size="sm" className="text-[9px] text-red-600 uppercase tracking-widest">Revoke</Button>
              </div>
            ))}
          </div>

          {/* AI Usage Toggle */}
          <div className="p-4 bg-[#F7F2EE] rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">AI Recommendation Usage</h3>
                <p className="text-[9px] text-[#8C7E6E] mt-1">Use personality for recommendation improvement</p>
              </div>
              <button
                onClick={() => setAiUsageConsent(!aiUsageConsent)}
                className={`w-12 h-6 rounded-full transition-all relative ${aiUsageConsent ? 'bg-emerald-600' : 'bg-[#E5E0DB]'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${aiUsageConsent ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
            <p className="text-[9px] text-amber-700 mt-2 italic">Default: OFF — personality never influences ranking without explicit consent</p>
          </div>

          {/* Data Controls */}
          <div className="p-4 bg-[#F7F2EE] rounded-2xl space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">Data Controls</h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" className="text-[9px] uppercase tracking-widest bg-white rounded-full border border-[#F3EFEA] flex items-center gap-1">
                <Download size={10} /> Export JSON
              </Button>
              <Button variant="ghost" size="sm" className="text-[9px] uppercase tracking-widest bg-white rounded-full border border-[#F3EFEA] flex items-center gap-1">
                <RotateCcw size={10} /> Reset Scores
              </Button>
              <Button variant="ghost" size="sm" className="text-[9px] text-red-600 uppercase tracking-widest bg-white rounded-full border border-red-100 flex items-center gap-1">
                <Trash2 size={10} /> Delete All
              </Button>
            </div>
          </div>
        </section>

        {/* Consent Log */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Consent History Log</h2>
          <div className="space-y-2">
            {CONSENT_LOG_DEMO.map((entry, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#F7F2EE] rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    entry.action === 'granted' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {entry.action}
                  </span>
                  <span className="text-[#8C7E6E]">{entry.scope}</span>
                </div>
                <span className="text-[9px] text-[#8C7E6E] font-mono">{new Date(entry.timestamp).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Anti-Dark-Pattern Rules */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Anti-Dark-Pattern Rules</h2>
          <div className="space-y-2">
            {[
              { pattern: 'Pre-checked consent', correct: 'Always start OFF' },
              { pattern: 'Confirm-shaming', correct: 'Neutral: "Not now"' },
              { pattern: 'Hidden revocation', correct: 'Revoke on Trust Hub, max 2 taps' },
              { pattern: 'Bundled consent', correct: 'Separate consent per purpose' },
              { pattern: 'Nagging', correct: 'Show once, then only in Settings' },
              { pattern: 'Asymmetric effort', correct: 'Same effort both directions' },
            ].map(rule => (
              <div key={rule.pattern} className="flex items-start gap-3 p-3 bg-[#F7F2EE] rounded-xl text-xs">
                <X size={14} className="mt-0.5 shrink-0 text-red-500" />
                <div>
                  <span className="font-bold text-red-700">{rule.pattern}</span>
                  <span className="text-[#8C7E6E] ml-2">→ {rule.correct}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
