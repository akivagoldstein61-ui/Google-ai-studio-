import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Eye,
  Lock,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  IPIP_BFAS_ASPECTS,
  IPIP_BFAS_DOMAINS,
  IPIP_BFAS_ITEMS,
  IPIP_BFAS_SCORING_VERSION,
  IPIP_BFAS_SOURCE_URL,
  SAMPLE_IPIP_BFAS_RESPONSES,
  canScoreIpipBfasLocale,
  scoreIpipBfasResponses,
  type IpipBfasBand,
  type IpipBfasDomain,
} from '@/personality/ipipBfas';

const OPTIONS = [1, 2, 3, 4, 5];

const DOMAIN_LABELS: Record<IpipBfasDomain, string> = {
  Neuroticism: 'Emotional reactivity',
  Agreeableness: 'Warmth and care',
  Conscientiousness: 'Planning and follow-through',
  Extraversion: 'Social energy',
  Openness: 'Curiosity and imagination',
};

const BAND_STYLES: Record<IpipBfasBand, string> = {
  low: 'bg-blue-50 text-blue-800 border-blue-100',
  mid: 'bg-stone-50 text-stone-800 border-stone-200',
  high: 'bg-emerald-50 text-emerald-800 border-emerald-100',
};

const blockItems = IPIP_BFAS_ITEMS.slice(0, 10);

const exportRecord = (payload: unknown) => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'kesher-ipip-bfas-demo-record.json';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

export const PersonalityPrototypeScreen: React.FC = () => {
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [showReflection, setShowReflection] = useState(false);
  const [visibility, setVisibility] = useState<Record<string, 'private' | 'mutual'>>({
    summary: 'private',
    strengths: 'private',
    communication: 'private',
  });
  const [shareCreated, setShareCreated] = useState(false);
  const [mutualReflectionOpen, setMutualReflectionOpen] = useState(false);

  const result = useMemo(() => scoreIpipBfasResponses(responses), [responses]);
  const answered = Object.keys(result.itemScores).length;
  const canShowProfile = result.complete && !result.qualityFlags.includes('straightlining');

  const setResponse = (id: string, value: number) => {
    setResponses((prev) => ({ ...prev, [id]: value }));
  };

  const loadSample = () => {
    setResponses(SAMPLE_IPIP_BFAS_RESPONSES);
    setShowReflection(true);
    setShareCreated(false);
    setMutualReflectionOpen(false);
  };

  const reset = () => {
    setResponses({});
    setShowReflection(false);
    setShareCreated(false);
    setMutualReflectionOpen(false);
    setVisibility({ summary: 'private', strengths: 'private', communication: 'private' });
  };

  const exportPayload = {
    prototypeOnly: true,
    instrumentType: result.instrumentType,
    scoringVersion: result.scoringVersion,
    evidenceLabel: result.evidenceLabel,
    sourceUrl: result.sourceUrl,
    complete: result.complete,
    qualityFlags: result.qualityFlags,
    domainBands: result.domainBands,
    aspectBands: result.aspectBands,
    visibility,
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2926]" data-testid="personality-prototype-screen">
      <header className="sticky top-0 z-20 bg-[#FDFCFB]/95 backdrop-blur-sm px-4 py-4 border-b border-[#F3EFEA]">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <a href="/prototype" className="p-2 rounded-full hover:bg-[#F7F2EE]" aria-label="Back to prototype status">
            <ArrowLeft size={20} />
          </a>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">Prototype only</p>
            <h1 className="text-2xl font-serif italic">IPIP-BFAS 100 Personality Journey</h1>
          </div>
          <a
            href={IPIP_BFAS_SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex px-4 py-2 rounded-full bg-white border border-[#F3EFEA] text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]"
          >
            Source
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <section className="bg-[#2D2926] rounded-[28px] p-6 text-white space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest">
            <ShieldCheck size={16} />
            English scoring active in prototype
          </div>
          <h2 className="text-2xl font-serif italic max-w-3xl">
            A truthful reviewer path for assessment, private reflection, visibility, sharing, and mutual reflection.
          </h2>
          <p className="text-sm text-white/70 max-w-3xl">
            This uses the official IPIP-BFAS 100 English item/key structure and deterministic scoring. It shows
            reflective bands and tendencies, not public rankings or predictions. Hebrew scoring remains disabled
            until localization validation is complete.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={loadSample}
              data-testid="load-sample-responses"
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#D4AF37] text-[#2D2926] rounded-full text-xs font-bold uppercase tracking-widest"
            >
              <Sparkles size={14} />
              Load sample responses
            </button>
            <button
              type="button"
              onClick={() => setShowReflection(true)}
              disabled={!result.complete}
              data-testid="complete-scoring"
              className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 text-white rounded-full text-xs font-bold uppercase tracking-widest border border-white/20 disabled:opacity-40"
            >
              <CheckCircle2 size={14} />
              Complete scoring
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 text-white rounded-full text-xs font-bold uppercase tracking-widest border border-white/20"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6">
          <div className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Instrument block</h3>
                <p className="text-xs text-[#6B5E52]">Showing the first 10 of {IPIP_BFAS_ITEMS.length} English IPIP-BFAS items.</p>
              </div>
              <span className="px-3 py-1 bg-[#F7F2EE] rounded-full text-[10px] font-bold uppercase tracking-widest">
                {answered} / {IPIP_BFAS_ITEMS.length} answered
              </span>
            </div>

            <div className="space-y-3">
              {blockItems.map((item) => (
                <div key={item.id} className="p-4 rounded-2xl bg-[#F7F2EE] border border-[#E5E0DB] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">{item.text}</p>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E]">
                      {item.domain} / {item.aspect}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setResponse(item.id, option)}
                        className={`w-10 h-10 rounded-full border text-xs font-bold ${
                          responses[item.id] === option
                            ? 'bg-[#2D2926] text-white border-[#2D2926]'
                            : 'bg-white text-[#8C7E6E] border-[#E5E0DB] hover:border-[#D4AF37]'
                        }`}
                        aria-label={`${item.text} response ${option}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Scoring contract</h3>
              <div className="space-y-3 text-xs">
                <p><strong>Instrument:</strong> {result.instrumentType}</p>
                <p><strong>Version:</strong> {IPIP_BFAS_SCORING_VERSION}</p>
                <p><strong>Evidence label:</strong> {result.evidenceLabel}</p>
                <p><strong>English scoring:</strong> {canScoreIpipBfasLocale('en-US') ? 'enabled' : 'disabled'}</p>
                <p><strong>Hebrew scoring:</strong> {canScoreIpipBfasLocale('he-IL') ? 'enabled' : 'disabled pending validation'}</p>
              </div>
              {result.qualityFlags.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-900">
                  Quality flags: {result.qualityFlags.join(', ')}
                </div>
              )}
            </section>

            <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Privacy controls</h3>
              {Object.entries(visibility).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 capitalize">
                    {value === 'private' ? <Lock size={14} /> : <Users size={14} />}
                    {key}
                  </div>
                  <button
                    type="button"
                    onClick={() => setVisibility((prev) => ({ ...prev, [key]: value === 'private' ? 'mutual' : 'private' }))}
                    className="px-3 py-1 rounded-full bg-[#F7F2EE] text-[10px] font-bold uppercase tracking-widest"
                  >
                    {value}
                  </button>
                </div>
              ))}
            </section>
          </aside>
        </section>

        {showReflection && (
          <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-6" data-testid="private-reflection-output">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-serif italic">Private reflection bands</h3>
                <p className="text-xs text-[#6B5E52]">
                  Bands are a prototype display layer for self-reflection. They are private by default and not used as a verdict.
                </p>
              </div>
              <button
                type="button"
                onClick={() => exportRecord(exportPayload)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F7F2EE] text-[10px] font-bold uppercase tracking-widest"
              >
                <Download size={14} />
                Export demo record
              </button>
            </div>

            {!canShowProfile ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-sm text-amber-900">
                Reflection unavailable until all items are answered without response-quality flags.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
                {IPIP_BFAS_DOMAINS.map((domain) => {
                  const band = result.domainBands[domain];
                  return (
                    <div key={domain} className={`p-4 rounded-2xl border ${BAND_STYLES[band.band]}`}>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{DOMAIN_LABELS[domain]}</p>
                      <h4 className="mt-2 font-bold">{domain}</h4>
                      <p className="mt-2 text-xs italic">{band.tendency}</p>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#F7F2EE] space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#8C7E6E]">Aspect snapshot</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {IPIP_BFAS_ASPECTS.map((aspect) => (
                    <div key={aspect} className="flex items-center justify-between bg-white rounded-xl px-3 py-2 text-xs">
                      <span>{aspect}</span>
                      <span className="font-bold uppercase text-[10px]">{result.aspectBands[aspect].band}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-[#2D2926] text-white space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Permissioned share card</h4>
                <p className="text-sm text-white/75">
                  This preview shares only selected reflection text with a named recipient. It excludes raw answers,
                  exact values, private taste, messages, and hidden ordering signals.
                </p>
                <button
                  type="button"
                  onClick={() => setShareCreated((prev) => !prev)}
                  data-testid="create-share-card"
                  className="px-4 py-2 rounded-full bg-[#D4AF37] text-[#2D2926] text-[10px] font-bold uppercase tracking-widest"
                >
                  {shareCreated ? 'Revoke share card' : 'Create share card'}
                </button>
                {shareCreated && (
                  <p className="text-xs text-emerald-200" data-testid="share-card-created">
                    Demo share card active for 7 days. Revocation removes future in-app access.
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-serif italic">Mutual reflection scenario</h3>
              <p className="text-xs text-[#6B5E52]">
                Bilateral reflections run only after both people opt in and only use mutually visible or shared inputs.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMutualReflectionOpen((prev) => !prev)}
              data-testid="open-mutual-reflection"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2D2926] text-white text-[10px] font-bold uppercase tracking-widest"
            >
              <Eye size={14} />
              Open mutual reflection scenario
            </button>
          </div>
          {mutualReflectionOpen && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3" data-testid="mutual-reflection-output">
              {[
                ['Shared strength', 'You both appear to value steadiness and thoughtful follow-through.'],
                ['Possible friction', 'One person may prefer fast decisions while the other may need more time to reflect.'],
                ['Question to explore', 'What helps each of you feel heard when plans change?'],
              ].map(([label, copy]) => (
                <div key={label} className="p-4 rounded-2xl bg-[#F7F2EE] border border-[#E5E0DB]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">{label}</p>
                  <p className="mt-2 text-sm italic text-[#6B5E52]">{copy}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
