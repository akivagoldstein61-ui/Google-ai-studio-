import React, { useState } from 'react';
import { ChevronLeft, Star, Check, Info, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  OCEAN_DOMAINS,
  reflectOcean,
  userFacingDomainLabel,
  type OceanScores,
} from '@/lib/oceanScoring';
import {
  SELF_DESCRIPTION_LABELS,
  PRACTICE_BUNDLES,
  practiceAreaAlignment,
  type ObservanceProfile,
} from '@/lib/observanceLayer';

const FRIENDLY: Record<string, string> = {
  Openness: 'Curiosity & Openness',
  Conscientiousness: 'Planning & Follow-through',
  Extraversion: 'Social Energy',
  Agreeableness: 'Warmth & Consideration',
  Neuroticism: 'Emotional Style',
};

const DEMO_PROFILE_HIGH_WARMTH: OceanScores = { Openness: 72, Conscientiousness: 65, Extraversion: 55, Agreeableness: 80, Neuroticism: 30 };
const DEMO_PROFILE_BALANCED: OceanScores = { Openness: 60, Conscientiousness: 70, Extraversion: 40, Agreeableness: 75, Neuroticism: 50 };

const OBSERVANCE_DATI_LEUMI: ObservanceProfile = { selfDescriptionId: 'dati_leumi', practiceIds: ['shomer_shabbat', 'kasher', 'mitpalel_shabbatot', 'rotze_yeladim'] };
const OBSERVANCE_MASORTI_DATI: ObservanceProfile = { selfDescriptionId: 'masorti_dati', practiceIds: ['shomer_masoret', 'kasher_babayit', 'beit_knesset_paam', 'rotze_yeladim'] };

const AREA_LABELS: Record<string, string> = { shabbat: 'Shabbat', kashrut: 'Kashrut', community: 'Community', family: 'Family' };

const OCEAN_KEYS = ['Openness', 'Conscientiousness', 'Extraversion', 'Agreeableness', 'Neuroticism'] as const;

/**
 * LIVE: renders the signed-in user's REAL deterministic OCEAN domain scores
 * (from the opt-in assessment) as owner-only reflection bars. Tendencies, not
 * fixed labels; observance is shown as a separate self-declared layer.
 */
const LiveOcean: React.FC = () => {
  const { user } = useApp();
  const scores = (user?.personalityScores ?? {}) as Record<string, number>;
  const has = OCEAN_KEYS.some((k) => typeof scores[k] === 'number');

  return (
    <section className="p-6 bg-[#2D2926] rounded-[28px] text-white space-y-4 relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-[#D4AF37]/10 blur-3xl" />
      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-2 text-[#D4AF37]"><Sparkles size={16} /><span className="text-[10px] font-bold uppercase tracking-widest">Your OCEAN profile</span></div>
        {!user ? (
          <p className="text-sm text-white/70 italic">Sign in to see your private OCEAN reflection.</p>
        ) : !has ? (
          <p className="text-sm text-white/70 italic leading-relaxed">Take the optional personality assessment first — your five OCEAN domains will appear here as a private reflection.</p>
        ) : (
          <div className="space-y-2.5">
            {OCEAN_KEYS.map((k) => {
              const v = typeof scores[k] === 'number' ? Math.max(0, Math.min(100, scores[k])) : null;
              if (v === null) return null;
              return (
                <div key={k} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white/90">{FRIENDLY[k] ?? k}</span>
                    <span className="text-[10px] text-white/50 font-mono">{v}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#D4AF37] rounded-full" style={{ width: `${v}%` }} />
                  </div>
                </div>
              );
            })}
            <p className="text-[9px] text-white/40 italic pt-1">Owner-only. Tendencies, not fixed labels — and never a compatibility score. Observance is a separate self-declared layer below.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export const PersonalityOceanSkill: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [profileA, setProfileA] = useState<OceanScores>({ ...DEMO_PROFILE_HIGH_WARMTH });
  const [showObservance, setShowObservance] = useState(false);

  const reflection = reflectOcean(profileA, DEMO_PROFILE_BALANCED);
  const observanceResult = practiceAreaAlignment(OBSERVANCE_DATI_LEUMI, OBSERVANCE_MASORTI_DATI);

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2926]">
      <header className="sticky top-0 z-10 bg-[#FDFCFB]/95 backdrop-blur-sm px-6 py-4 flex items-center gap-4 border-b border-[#F3EFEA]">
        <button onClick={onBack} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center border border-amber-200">
            <Star size={16} />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-lg font-serif italic">Personality & OCEAN</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E]">Jewish Observance Integration</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* LIVE: real OCEAN reflection */}
        <LiveOcean />

        {/* What this does */}
        <section className="p-6 bg-amber-50 rounded-[24px] border border-amber-100 space-y-2">
          <div className="flex items-center gap-2 text-amber-700">
            <Info size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">What this is</span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            OCEAN-domain views on BFAS scores, plus a three-layer observance model.
            Pair output is <strong>qualitative reflection only</strong> — no numeric fit rating
            is ever shown to users.
          </p>
        </section>

        {/* Interactive OCEAN sliders for Profile A */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Profile A — Adjust & Explore</h2>
          <p className="text-xs text-[#6B5E52] italic">Slide any domain to see how the compatibility reflection updates.</p>
          <div className="space-y-4">
            {OCEAN_DOMAINS.map((d) => (
              <div key={d} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">{FRIENDLY[d]}</span>
                  <span className="text-[#8C7E6E] font-mono">{profileA[d]}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={profileA[d]}
                  onChange={(e) => setProfileA(prev => ({ ...prev, [d]: Number(e.target.value) }))}
                  className="w-full accent-amber-500"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Reflection output */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Pair Reflection (A ↔ B)</h2>
          <p className="text-[9px] text-[#8C7E6E] italic">
            Bands: harmony |Δ| ≤ 12 · growth 12–35 · friction |Δ| ≥ 35. No single % ever exposed.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Harmony', areas: reflection.harmonyAreas, bg: 'bg-green-50 border-green-100 text-green-800', badge: 'bg-green-100 text-green-700' },
              { label: 'Growth (complementary)', areas: reflection.growthAreas, bg: 'bg-amber-50 border-amber-100 text-amber-800', badge: 'bg-amber-100 text-amber-700' },
              { label: 'Friction', areas: reflection.frictionAreas, bg: 'bg-red-50 border-red-100 text-red-800', badge: 'bg-red-100 text-red-700' },
            ].map(({ label, areas, bg, badge }) => (
              <div key={label} className={`p-4 rounded-2xl border space-y-2 ${bg}`}>
                <p className="text-[10px] font-bold uppercase tracking-widest">{label}</p>
                {areas.length === 0 ? (
                  <p className="text-[10px] italic opacity-60">—</p>
                ) : (
                  areas.map(d => (
                    <span key={d} className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold mr-1 mb-1 ${badge}`}>
                      {userFacingDomainLabel(d)}
                    </span>
                  ))
                )}
              </div>
            ))}
          </div>
          <p className="text-[9px] text-[#8C7E6E] italic">
            Internal similarity: {(reflection.internalSimilarity * 100).toFixed(0)} / 100 — ranking-only, never shown to users.
          </p>
        </section>

        {/* Observance layer */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Three-Layer Observance Model</h2>
            <button
              onClick={() => setShowObservance(v => !v)}
              className="text-[10px] font-bold text-amber-700 uppercase tracking-widest"
            >
              {showObservance ? 'Hide' : 'Show'} detail
            </button>
          </div>
          <div className="space-y-2">
            {(['Layer 1: Self-description (public Hebrew label)', 'Layer 2: Practice bundles (private compat)', 'Layer 3: Private compat via learnedTaste'] as const).map((l, i) => (
              <div key={i} className="flex items-start gap-2 p-3 bg-[#F7F2EE] rounded-xl text-xs">
                <span className="w-5 h-5 shrink-0 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-[9px]">{i + 1}</span>
                <span>{l}</span>
              </div>
            ))}
          </div>

          {showObservance && (
            <div className="space-y-4 pt-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E] mb-2">Layer 1 labels (sample)</p>
                <div className="flex flex-wrap gap-1">
                  {SELF_DESCRIPTION_LABELS.slice(0, 8).map(l => (
                    <span key={l.id} className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-[9px] font-bold">
                      {l.he} · {l.en}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E] mb-2">Demo practice alignment (A ↔ B)</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['shabbat', 'kashrut', 'community', 'family'] as const).map(area => {
                    const aligned = observanceResult.alignedAreas.includes(area);
                    return (
                      <div key={area} className={`p-3 rounded-xl text-center text-xs border ${aligned ? 'bg-green-50 border-green-100' : 'bg-[#F7F2EE] border-[#F3EFEA]'}`}>
                        <Check size={12} className={`mx-auto mb-1 ${aligned ? 'text-green-600' : 'text-[#C5B8AE]'}`} />
                        <span className={`font-bold text-[10px] ${aligned ? 'text-green-800' : 'text-[#8C7E6E]'}`}>{AREA_LABELS[area]}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[9px] text-[#8C7E6E] italic mt-2">
                  Aligned {observanceResult.alignedAreas.length} / {observanceResult.totalAreas} areas. Never shown as a score — feeds ranking only.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Key rules */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Key Rules</h2>
          {[
            'OCEAN output is always qualitative bands, never a single compatibility %',
            'Neuroticism shown as "Emotional Style" in all user-facing copy',
            'Observance Layer 2 & 3 are private compat — never exposed to the other user',
            'Hebrew-first: Layer 1 labels in Hebrew, with English subtitle',
            'Compatibility reflection is a conversation starter, not a prediction',
          ].map((rule, i) => (
            <div key={i} className="flex items-start gap-2 p-3 bg-[#F7F2EE] rounded-xl text-xs">
              <Check size={12} className="mt-0.5 shrink-0 text-amber-500" />
              <span>{rule}</span>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};
