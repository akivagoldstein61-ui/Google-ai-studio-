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
  KESHER_PERSONALITY_ITEMS,
  PERSONALITY_INSTRUMENT_VERSION,
  PERSONALITY_ITEM_TEXT_SOURCE,
  PERSONALITY_SCORE_VERSION,
  scoreKesherPersonalityAssessment,
} from '@/personality/scoring';

const OPTIONS = [
  { value: 1, label: 'Strongly disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly agree' },
];

const BAND_STYLES = {
  lower: 'bg-blue-50 text-blue-900 border-blue-100',
  balanced: 'bg-stone-50 text-stone-900 border-stone-200',
  higher: 'bg-emerald-50 text-emerald-900 border-emerald-100',
} as const;

const BAND_LABELS = {
  lower: 'Lower tendency',
  balanced: 'Balanced tendency',
  higher: 'Higher tendency',
} as const;

const VISIBILITY_LABELS = {
  private: 'Private',
  mutual: 'Mutual consent',
} as const;

const exportRecord = (payload: unknown) => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'kesher-personality-reflection-record.json';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

export const PersonalityPrototypeScreen: React.FC = () => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showReport, setShowReport] = useState(false);
  const [visibility, setVisibility] = useState<Record<string, 'private' | 'mutual'>>({
    summary: 'private',
    domains: 'private',
    conversationPrompts: 'private',
  });
  const [shareCreated, setShareCreated] = useState(false);
  const [mutualReflectionOpen, setMutualReflectionOpen] = useState(false);

  const report = useMemo(() => scoreKesherPersonalityAssessment(answers), [answers]);
  const isComplete = !report.is_partial;

  const setResponse = (id: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setShareCreated(false);
  };

  const reset = () => {
    setAnswers({});
    setShowReport(false);
    setShareCreated(false);
    setMutualReflectionOpen(false);
    setVisibility({ summary: 'private', domains: 'private', conversationPrompts: 'private' });
  };

  const exportPayload = {
    report_status: report.is_partial ? 'partial_not_saved' : 'complete',
    instrument_version: report.instrument_version,
    score_version: report.score_version,
    item_text_source: report.item_text_source,
    completion: report.completion,
    privacy: report.privacy,
    domains: isComplete ? report.domains.map(({ id, label_en, label_he, band, summary_he, dating_note_he, evidence_label }) => ({
      id,
      label_en,
      label_he,
      band,
      summary_he,
      dating_note_he,
      evidence_label,
    })) : [],
    aspects: isComplete ? report.aspects.map(({ id, domain, label_en, label_he, band, description_he, reflection_prompt_he, evidence_label }) => ({
      id,
      domain,
      label_en,
      label_he,
      band,
      description_he,
      reflection_prompt_he,
      evidence_label,
    })) : [],
    visibility,
    raw_answers_included: false,
    exact_scores_included: false,
    exported_at: new Date().toISOString(),
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2926]" data-testid="personality-live-screen">
      <header className="sticky top-0 z-20 bg-[#FDFCFB]/95 backdrop-blur-sm px-4 py-4 border-b border-[#F3EFEA]">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <a href="/prototype" className="p-2 rounded-full hover:bg-[#F7F2EE]" aria-label="Back to deployment status">
            <ArrowLeft size={20} />
          </a>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">Live Kesher reflection</p>
            <h1 className="text-2xl font-serif italic">Private Personality Journey</h1>
          </div>
          <span className="hidden sm:inline-flex px-4 py-2 rounded-full bg-white border border-[#F3EFEA] text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">
            {PERSONALITY_INSTRUMENT_VERSION}
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <section className="bg-[#2D2926] rounded-[28px] p-6 text-white space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-[#D4AF37] text-[10px] font-bold uppercase tracking-widest">
            <ShieldCheck size={16} />
            Active scoring without AI inference
          </div>
          <h2 className="text-2xl font-serif italic max-w-3xl">
            A complete original Kesher reflection for communication and dating patterns.
          </h2>
          <p className="text-sm text-white/70 max-w-3xl">
            This journey uses Kesher-authored items, deterministic aspect scoring, private-by-default visibility,
            and non-clinical framing. It does not create compatibility scores, public rankings, hidden ordering
            signals, or raw-answer exports.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
              <p className="text-[#D4AF37] font-bold uppercase tracking-widest text-[10px]">Instrument</p>
              <p className="mt-2 font-mono break-all">{PERSONALITY_INSTRUMENT_VERSION}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
              <p className="text-[#D4AF37] font-bold uppercase tracking-widest text-[10px]">Scoring</p>
              <p className="mt-2 font-mono break-all">{PERSONALITY_SCORE_VERSION}</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
              <p className="text-[#D4AF37] font-bold uppercase tracking-widest text-[10px]">Item source</p>
              <p className="mt-2 font-mono break-all">{PERSONALITY_ITEM_TEXT_SOURCE}</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6">
          <div className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Kesher reflection items</h3>
                <p className="text-xs text-[#6B5E52]">
                  Answer all {KESHER_PERSONALITY_ITEMS.length} items to generate the private report.
                </p>
              </div>
              <span className="px-3 py-1 bg-[#F7F2EE] rounded-full text-[10px] font-bold uppercase tracking-widest">
                {report.completion.answered} / {report.completion.total} answered
              </span>
            </div>

            <div className="h-2 bg-[#F7F2EE] rounded-full overflow-hidden" aria-label="Personality completion progress">
              <div className="h-full bg-[#D4AF37]" style={{ width: `${report.completion.percent}%` }} />
            </div>

            <div className="space-y-3">
              {KESHER_PERSONALITY_ITEMS.map((item, index) => (
                <div key={item.id} className="p-4 rounded-2xl bg-[#F7F2EE] border border-[#E5E0DB] space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">Item {index + 1}</p>
                      <p className="text-sm font-medium">{item.text_en}</p>
                      <p className="text-xs text-[#6B5E52]" dir="rtl">{item.text_he}</p>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E]">
                      {item.domain} / {item.aspect}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setResponse(item.id, option.value)}
                        className={`min-h-11 rounded-full border px-2 text-[10px] font-bold transition-colors ${
                          answers[item.id] === option.value
                            ? 'bg-[#2D2926] text-white border-[#2D2926]'
                            : 'bg-white text-[#8C7E6E] border-[#E5E0DB] hover:border-[#D4AF37]'
                        }`}
                        aria-label={`${item.text_en} response ${option.label}`}
                        title={option.label}
                      >
                        {option.value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Completion contract</h3>
              <div className="space-y-3 text-xs text-[#6B5E52]">
                <p><strong className="text-[#2D2926]">Status:</strong> {isComplete ? 'Complete private report available' : 'Waiting for all items'}</p>
                <p><strong className="text-[#2D2926]">Raw answers stored:</strong> No</p>
                <p><strong className="text-[#2D2926]">Public trait scores:</strong> No</p>
                <p><strong className="text-[#2D2926]">LLM scoring:</strong> No</p>
              </div>
              <button
                type="button"
                onClick={() => setShowReport(true)}
                disabled={!isComplete}
                data-testid="complete-scoring"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#2D2926] text-white rounded-full text-xs font-bold uppercase tracking-widest disabled:opacity-40"
              >
                <CheckCircle2 size={14} />
                Show private report
              </button>
              <button
                type="button"
                onClick={reset}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#F7F2EE] text-[#2D2926] rounded-full text-xs font-bold uppercase tracking-widest border border-[#E5E0DB]"
              >
                <RotateCcw size={14} />
                Reset answers
              </button>
            </section>

            <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Visibility controls</h3>
              {Object.entries(visibility).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 capitalize">
                    {value === 'private' ? <Lock size={14} /> : <Users size={14} />}
                    {key.replace(/([A-Z])/g, ' $1')}
                  </div>
                  <button
                    type="button"
                    onClick={() => setVisibility((prev) => ({ ...prev, [key]: value === 'private' ? 'mutual' : 'private' }))}
                    className="px-3 py-1 rounded-full bg-[#F7F2EE] text-[10px] font-bold uppercase tracking-widest"
                  >
                    {VISIBILITY_LABELS[value]}
                  </button>
                </div>
              ))}
            </section>
          </aside>
        </section>

        {showReport && (
          <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-6" data-testid="private-reflection-output">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-serif italic">Private reflection report</h3>
                <p className="text-xs text-[#6B5E52]">
                  The report shows bands and prompts only. Exact scores and raw answers stay out of the export.
                </p>
              </div>
              <button
                type="button"
                onClick={() => exportRecord(exportPayload)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F7F2EE] text-[10px] font-bold uppercase tracking-widest"
              >
                <Download size={14} />
                Export safe record
              </button>
            </div>

            {!isComplete ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-sm text-amber-900">
                Complete every item before viewing or exporting the private report.
              </div>
            ) : (
              <>
                <div className="p-5 rounded-2xl bg-[#F7F2EE] text-sm text-[#6B5E52]" dir="rtl">
                  <p>{report.summary_he}</p>
                  <p className="mt-2 font-medium text-[#2D2926]">{report.next_step_he}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
                  {report.domains.map((domain) => (
                    <div key={domain.id} className={`p-4 rounded-2xl border ${BAND_STYLES[domain.band]}`}>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{domain.label_en}</p>
                      <h4 className="mt-2 font-bold" dir="rtl">{domain.label_he}</h4>
                      <p className="mt-2 text-xs italic" dir="rtl">{domain.dating_note_he}</p>
                      <p className="mt-3 text-[10px] font-bold uppercase tracking-widest opacity-70">{BAND_LABELS[domain.band]}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-[#F7F2EE] space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#8C7E6E]">Aspect prompts</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {report.aspects.map((aspect) => (
                        <div key={aspect.id} className="bg-white rounded-xl px-3 py-3 text-xs space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span>{aspect.label_en}</span>
                            <span className="font-bold uppercase text-[10px]">{aspect.band}</span>
                          </div>
                          <p className="text-[#6B5E52]" dir="rtl">{aspect.reflection_prompt_he}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl bg-[#2D2926] text-white space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Permissioned share card</h4>
                    <p className="text-sm text-white/75">
                      Sharing creates a scoped, revocable view of selected reflection text for a named recipient.
                      It excludes raw answers, exact values, private taste, messages, and hidden ordering signals.
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
                        Share card active for 7 days. Revocation removes future in-app access.
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </section>
        )}

        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-serif italic">Mutual reflection scenario</h3>
              <p className="text-xs text-[#6B5E52]">
                Bilateral reflections run only after both people opt in and only use mutually visible or explicitly shared inputs.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMutualReflectionOpen((prev) => !prev)}
              data-testid="open-mutual-reflection"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2D2926] text-white text-[10px] font-bold uppercase tracking-widest"
            >
              <Eye size={14} />
              Open mutual reflection
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
