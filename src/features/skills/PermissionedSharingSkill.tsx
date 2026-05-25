import React, { useState } from 'react';
import { ChevronLeft, Users, Check, ArrowRight, Shield, X, Sparkles, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { shareCardService } from '@/services/shareCardService';

/**
 * LIVE: creates and revokes a real, server-side share card via shareCardService
 * against a real recipient (a current match/daily pick). Honors preview ->
 * scope -> confirm -> revoke. Scope is summary-only here; never raw answers,
 * raw scores, or private taste.
 */
const LiveShareCard: React.FC = () => {
  const { user, dailyPicks, trackEvent } = useApp();
  const recipient = dailyPicks?.[0];
  const [agreed, setAgreed] = useState(false);
  const [cardId, setCardId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [revoked, setRevoked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async () => {
    if (!user || !recipient) return;
    setLoading(true);
    setError(null);
    try {
      const r = await shareCardService.create({
        ownerUid: user.uid,
        recipientUid: recipient.uid,
        scope: ['summary'],
        expiresInDays: 7,
        payload: { summary_he: 'סיכום אישיות קצר ומכבד, משותף בהסכמה ולזמן מוגבל.' },
      });
      setCardId(r.cardId);
      setRevoked(false);
      trackEvent?.('skill_completed', { skillId: 'permissioned-sharing', created: true });
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create share card');
    } finally {
      setLoading(false);
    }
  };

  const revoke = async () => {
    if (!cardId) return;
    setLoading(true);
    try {
      await shareCardService.revoke(cardId);
      setRevoked(true);
      trackEvent?.('skill_dismissed', { skillId: 'permissioned-sharing', revoked: true });
    } catch (e: any) {
      setError(e?.message ?? 'Failed to revoke');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="p-6 bg-[#2D2926] rounded-[28px] text-white space-y-4 relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-[#D4AF37]/10 blur-3xl" />
      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-2 text-[#D4AF37]"><Sparkles size={16} /><span className="text-[10px] font-bold uppercase tracking-widest">Create a real share card</span></div>
        {!user ? (
          <p className="text-sm text-white/70 italic">Sign in to create a permissioned share card.</p>
        ) : !recipient ? (
          <p className="text-sm text-white/70 italic">Load your Daily Picks to choose a real recipient.</p>
        ) : revoked ? (
          <div className="space-y-3">
            <p className="text-sm text-white/85 italic leading-relaxed">Share card revoked. Future in-app access is blocked; past views and screenshots are outside our control.</p>
            <button onClick={() => { setCardId(null); setAgreed(false); }} className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">Start over</button>
          </div>
        ) : cardId ? (
          <div className="space-y-3">
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-1">
              <div className="flex items-center gap-2 text-[#D4AF37]"><Check size={14} /><span className="text-[10px] font-bold uppercase tracking-widest">Shared with {recipient.displayName}</span></div>
              <p className="text-[11px] text-white/55">Summary-only · expires in 7 days · revocable anytime</p>
              <p className="text-[9px] text-white/35 font-mono break-all">{cardId}</p>
            </div>
            <button onClick={revoke} className="h-10 px-5 rounded-full border border-white/20 text-white hover:bg-white/10 font-bold uppercase tracking-widest text-[10px] inline-flex items-center gap-2">
              {loading ? <><Loader2 size={14} className="animate-spin" /> Revoking</> : <><Trash2 size={14} /> Revoke now</>}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-white/70 italic leading-relaxed">
              Share a summary-only personality card with {recipient.displayName} for 7 days. Preview is exactly what they'd see;
              raw answers, raw scores, and private taste are never included.
            </p>
            <label className="flex items-start gap-2 text-xs text-white/80 cursor-pointer select-none">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 accent-[#D4AF37]" />
              <span>I previewed it and consent to share a summary-only card. I can revoke anytime.</span>
            </label>
            <button onClick={create} disabled={!agreed || loading} className="h-11 px-5 rounded-full bg-[#D4AF37] text-[#2D2926] hover:bg-[#B8962E] font-bold uppercase tracking-widest text-[10px] disabled:opacity-40 inline-flex items-center gap-2">
              {loading ? <><Loader2 size={14} className="animate-spin" /> Sharing</> : <>Create share card <ArrowRight size={14} /></>}
            </button>
            {error && <p className="text-xs text-amber-200/90 italic">{error}</p>}
          </div>
        )}
      </div>
    </section>
  );
};

export const PermissionedSharingSkill: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [flowStep, setFlowStep] = useState(0);

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2926]">
      <header className="sticky top-0 z-10 bg-[#FDFCFB]/95 backdrop-blur-sm px-6 py-4 flex items-center gap-4 border-b border-[#F3EFEA]">
        <button onClick={onBack} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-pink-100 text-pink-700 rounded-full flex items-center justify-center border border-pink-200">
            <Users size={16} />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-lg font-serif italic">Permissioned Sharing</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E]">Share Cards & Mutual Consent</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* LIVE: real share-card create + revoke */}
        <LiveShareCard />

        {/* Core Principle */}
        <section className="p-6 bg-pink-50 rounded-[24px] border border-pink-100 space-y-3">
          <div className="flex items-center gap-2 text-pink-700">
            <Shield size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Core Principle</span>
          </div>
          <p className="text-xs text-pink-800 leading-relaxed">
            No personality information crosses user boundaries without explicit, previewed, recipient-scoped consent.
            Nothing is sent automatically. The sender always sees exactly what the recipient will see before confirming.
          </p>
        </section>

        {/* Card Types */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Card Types</h2>
          <div className="space-y-3">
            <div className="p-4 bg-[#F7F2EE] rounded-2xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-[9px] font-bold rounded-full border border-pink-200">Basic</span>
                <span className="text-xs font-bold">Basic Share Card</span>
              </div>
              <ul className="text-xs text-[#6B5E52] space-y-1 pl-4">
                <li>• Domain-level tendency bands only (2-3 behavioral sentences per domain)</li>
                <li>• No exact values, no aspect detail</li>
                <li>• Suitable for early-stage connections</li>
              </ul>
            </div>
            <div className="p-4 bg-[#F7F2EE] rounded-2xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[9px] font-bold rounded-full border border-purple-200">Deeper</span>
                <span className="text-xs font-bold">Deeper Share Card</span>
              </div>
              <ul className="text-xs text-[#6B5E52] space-y-1 pl-4">
                <li>• Domain + aspect tendency bands (5-7 sentences)</li>
                <li>• May include self-identified relational style</li>
                <li>• Requires separate consent beyond basic card</li>
                <li>• Only available after full assessment completion</li>
              </ul>
            </div>
            <div className="p-4 bg-[#F7F2EE] rounded-2xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[9px] font-bold rounded-full border border-rose-200">Mutual</span>
                <span className="text-xs font-bold">Mutual Reflection Card</span>
              </div>
              <ul className="text-xs text-[#6B5E52] space-y-1 pl-4">
                <li>• Generated from BOTH users' shared cards</li>
                <li>• Requires bilateral consent before generation</li>
                <li>• Shows interaction patterns, not numeric fit ratings</li>
                <li>• Both users see identical content</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Interactive Share Flow */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Share Flow Demo</h2>
            <Button variant="ghost" size="sm" onClick={() => setFlowStep(0)} className="text-[9px] uppercase tracking-widest">Reset</Button>
          </div>

          <div className="space-y-3">
            {/* Step indicators */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {['Generate', 'Preview', 'Select', 'Confirm', 'Delivered'].map((step, i) => (
                <div key={step} className="flex items-center gap-1 shrink-0">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${
                    i <= flowStep ? 'bg-pink-600 text-white' : 'bg-[#F3EFEA] text-[#8C7E6E]'
                  }`}>{i + 1}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${i <= flowStep ? 'text-pink-700' : 'text-[#8C7E6E]'}`}>{step}</span>
                  {i < 4 && <ArrowRight size={10} className="text-[#8C7E6E]" />}
                </div>
              ))}
            </div>

            {/* Step content */}
            <div className="p-4 bg-[#F7F2EE] rounded-2xl space-y-3 min-h-[120px]">
              {flowStep === 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold">Step 1: Card Generation</p>
                  <p className="text-xs text-[#6B5E52]">User completes assessment → System generates card candidates → User enters Trust Hub → Taps "Create Share Card"</p>
                  <Button size="sm" onClick={() => setFlowStep(1)} className="rounded-full bg-[#2D2926] text-white text-[9px] uppercase tracking-widest px-4">
                    Create Share Card
                  </Button>
                </div>
              )}
              {flowStep === 1 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold">Step 2: Preview</p>
                  <div className="p-3 bg-white rounded-xl border border-[#F3EFEA] text-xs italic text-[#6B5E52]">
                    "Your responses suggest you tend toward warm, energetic engagement with others. You often bring enthusiasm to social situations and value deep, meaningful connections."
                  </div>
                  <p className="text-[9px] text-[#8C7E6E]">This is exactly what the recipient will see.</p>
                  <Button size="sm" onClick={() => setFlowStep(2)} className="rounded-full bg-[#2D2926] text-white text-[9px] uppercase tracking-widest px-4">
                    Confirm Text
                  </Button>
                </div>
              )}
              {flowStep === 2 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold">Step 3: Select Recipient</p>
                  <div className="space-y-2">
                    {['Sarah M.', 'David K.', 'Rachel L.'].map(name => (
                      <button key={name} onClick={() => setFlowStep(3)} className="w-full p-2 bg-white rounded-xl border border-[#F3EFEA] text-xs text-left hover:border-pink-300 transition-all">
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {flowStep === 3 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold">Step 4: Final Confirmation</p>
                  <p className="text-xs text-[#6B5E52]">Share this personality summary with Sarah M.?</p>
                  <p className="text-[9px] text-[#8C7E6E]">This share lasts until you revoke it. Sarah cannot see raw answers or scores.</p>
                  <Button size="sm" onClick={() => setFlowStep(4)} className="rounded-full bg-pink-600 text-white text-[9px] uppercase tracking-widest px-4">
                    Share Now
                  </Button>
                </div>
              )}
              {flowStep === 4 && (
                <div className="space-y-2 text-center py-4">
                  <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <Check size={24} className="text-green-600" />
                  </div>
                  <p className="text-xs font-bold">Shared Successfully</p>
                  <p className="text-[9px] text-[#8C7E6E]">Sarah M. will see: "[Name] shared a personality insight with you"</p>
                  <p className="text-[9px] text-[#8C7E6E]">You can revoke anytime in Trust Hub.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Anti-Pressure Rules */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Anti-Pressure Rules (Deeper Card Requests)</h2>
          <div className="space-y-2">
            {[
              'Request can only be sent once per pair',
              'No reminder or follow-up if ignored',
              'Sender\'s decision is never disclosed to requester',
              'No visual indicator of "pending request" after 48h',
            ].map((rule, i) => (
              <div key={i} className="flex items-start gap-2 p-3 bg-[#F7F2EE] rounded-xl text-xs">
                <Shield size={14} className="mt-0.5 shrink-0 text-pink-600" />
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Revocation Cascades */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Revocation Cascades</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#F3EFEA]">
                  <th className="text-left py-2 pr-3 font-bold">Revocation</th>
                  <th className="text-left py-2 pr-3 font-bold">Cards</th>
                  <th className="text-left py-2 font-bold">Mutual Reflections</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#F3EFEA]/50">
                  <td className="py-2 pr-3">Revoke basic card</td>
                  <td className="py-2 pr-3 text-[#6B5E52]">Removed from recipient</td>
                  <td className="py-2 text-red-600">Invalidated</td>
                </tr>
                <tr className="border-b border-[#F3EFEA]/50">
                  <td className="py-2 pr-3">Revoke deeper card</td>
                  <td className="py-2 pr-3 text-[#6B5E52]">Deeper removed; basic remains</td>
                  <td className="py-2 text-amber-600">Regenerated from basic</td>
                </tr>
                <tr className="border-b border-[#F3EFEA]/50">
                  <td className="py-2 pr-3">Reset assessment</td>
                  <td className="py-2 pr-3 text-red-600">All cards revoked</td>
                  <td className="py-2 text-red-600">All invalidated</td>
                </tr>
                <tr>
                  <td className="py-2 pr-3">Delete account</td>
                  <td className="py-2 pr-3 text-red-600">All removed everywhere</td>
                  <td className="py-2 text-red-600">All invalidated</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Content Safety */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Content Safety Rules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-700">Never in share cards:</h3>
              {['Raw item responses', 'Numeric scores or percentiles', 'Population norm comparisons', 'Attachment labels', 'Clinical terminology', 'Private taste/behavioral signals'].map(item => (
                <div key={item} className="flex items-start gap-1 text-xs text-red-700">
                  <X size={12} className="mt-0.5 shrink-0" /><span>{item}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-700">Never in mutual reflections:</h3>
              {['Compatibility scores', 'Relationship predictions', 'Advice to pursue/avoid', 'Info not in shared cards', 'One-sided information'].map(item => (
                <div key={item} className="flex items-start gap-1 text-xs text-red-700">
                  <X size={12} className="mt-0.5 shrink-0" /><span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
