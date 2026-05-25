import React from 'react';
import { ChevronLeft, Sparkles, Check, X, AlertTriangle, Shield, Server } from 'lucide-react';
import { AI_FEATURE_REGISTRY } from '@/ai/featureRegistry';

/**
 * LIVE: renders the actual AI_FEATURE_REGISTRY — the real governance state that
 * the server enforces. Model route, risk, consent, and human-confirmation flags
 * are read straight from the canonical registry, so this view can never drift
 * from what the app actually does.
 */
const RISK_CHIP: Record<string, string> = {
  low: 'bg-white/5 text-white/60',
  medium: 'bg-amber-500/15 text-amber-300',
  high: 'bg-red-500/15 text-red-300',
};

const LiveGovernance: React.FC = () => {
  const features = [...AI_FEATURE_REGISTRY].sort((a, b) => a.category.localeCompare(b.category));
  const consentCount = AI_FEATURE_REGISTRY.filter((f) => f.requires_consent).length;
  const humanCount = AI_FEATURE_REGISTRY.filter((f) => f.requires_human_confirmation).length;

  return (
    <section className="p-6 bg-[#2D2926] rounded-[28px] text-white space-y-4 relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-[#D4AF37]/10 blur-3xl" />
      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-2 text-[#D4AF37]"><Sparkles size={16} /><span className="text-[10px] font-bold uppercase tracking-widest">Live feature registry</span></div>
        <p className="text-sm text-white/70 italic leading-relaxed">
          The actual governance table the server enforces — {AI_FEATURE_REGISTRY.length} features, {consentCount} consent-gated,
          {' '}{humanCount} requiring human confirmation. Read straight from <code className="text-[#D4AF37]">AI_FEATURE_REGISTRY</code>.
        </p>
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {features.map((f) => (
            <div key={f.id} className="p-3 bg-white/5 border border-white/10 rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-white/90">{f.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest ${RISK_CHIP[f.risk_level] ?? RISK_CHIP.low}`}>{f.risk_level}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded-md text-[9px] font-mono bg-white/5 text-white/55">{f.runtime_model_route}</span>
                <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest bg-white/5 text-white/45">{f.category.replace(/_/g, ' ')}</span>
                {f.requires_consent && <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest bg-blue-500/15 text-blue-300">consent</span>}
                {f.requires_human_confirmation && <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest bg-[#D4AF37]/15 text-[#D4AF37]">human confirm</span>}
                {f.requires_citation_ui && <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest bg-teal-500/15 text-teal-300">citations</span>}
                {f.capability_exception && <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest bg-purple-500/15 text-purple-300" title={f.exception_reason}>exception</span>}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[9px] text-white/40 italic">This is the source of truth — the server validates every AI call against these entries.</p>
      </div>
    </section>
  );
};

const PROVIDER_MATRIX = [
  { feature: 'Personality scoring/reflection', provider: 'Vertex AI', rationale: 'ZDR, no training on data, enterprise DPA' },
  { feature: 'Compatibility reflection', provider: 'Vertex AI', rationale: 'Sensitive dyadic data, audit trail needed' },
  { feature: 'Share card generation', provider: 'Vertex AI', rationale: 'Contains personality outputs' },
  { feature: 'Date planning', provider: 'Firebase AI Logic', rationale: 'Lower cost, acceptable retention' },
  { feature: '"Why This Match" (public only)', provider: 'Firebase AI Logic', rationale: 'No sensitive data in prompt' },
  { feature: 'Search grounding', provider: 'Gemini + Maps', rationale: 'Non-personality, structured metadata' },
  { feature: 'Conversation starters', provider: 'Firebase AI Logic', rationale: 'Uses only public profile fields' },
];

const PROHIBITED_PATTERNS = [
  { pattern: 'Free-tier AI Studio for personality', alternative: 'Vertex AI paid tier' },
  { pattern: 'Raw scores in AI prompts', alternative: 'Pass as structured enum bands' },
  { pattern: 'Personality in ranking without consent', alternative: 'Keep personality out of ranking' },
  { pattern: 'Auto-generated numeric fit ratings', alternative: 'Interaction-pattern reflections only' },
  { pattern: 'Hidden personality inference from behavior', alternative: 'Explicit opt-in assessment only' },
  { pattern: 'Cross-user score comparison', alternative: 'Individual reflection only' },
  { pattern: 'Personality data in analytics pipeline', alternative: 'Separate research-safe schema' },
];

const RATE_LIMITS = [
  { action: 'Assessment completion', limit: '1 per 24 hours' },
  { action: 'Reflection regeneration', limit: '3 per day' },
  { action: 'Share card generation', limit: '5 per day' },
  { action: 'Mutual reflection request', limit: '2 per day' },
];

export const AIRuntimeGovernanceSkill: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2926]">
      <header className="sticky top-0 z-10 bg-[#FDFCFB]/95 backdrop-blur-sm px-6 py-4 flex items-center gap-4 border-b border-[#F3EFEA]">
        <button onClick={onBack} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center border border-slate-200">
            <Sparkles size={16} />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-lg font-serif italic">AI Runtime Governance</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E]">Vertex AI & ZDR Controls</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* LIVE: real feature registry */}
        <LiveGovernance />

        {/* Critical Rule */}
        <section className="p-6 bg-red-50 rounded-[24px] border border-red-200 space-y-3">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Critical Rule: Unpaid vs Paid Gemini</span>
          </div>
          <p className="text-xs text-red-800 leading-relaxed font-bold">
            NEVER use Google AI Studio (free tier) or unpaid Gemini Developer API for personality data.
          </p>
          <p className="text-xs text-red-700">
            Unpaid services allow Google to use prompts/responses to improve products and permit human review.
            Paid services (billing-enabled Gemini API, Vertex AI) have different data-use terms.
          </p>
        </section>

        {/* Provider Decision Matrix */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Provider Decision Matrix</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#F3EFEA]">
                  <th className="text-left py-2 pr-3 font-bold">Feature</th>
                  <th className="text-left py-2 pr-3 font-bold">Provider</th>
                  <th className="text-left py-2 font-bold">Rationale</th>
                </tr>
              </thead>
              <tbody>
                {PROVIDER_MATRIX.map(row => (
                  <tr key={row.feature} className="border-b border-[#F3EFEA]/50">
                    <td className="py-2 pr-3">{row.feature}</td>
                    <td className="py-2 pr-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        row.provider.includes('Vertex') ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>{row.provider}</span>
                    </td>
                    <td className="py-2 text-[#6B5E52]">{row.rationale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ZDR Controls */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Zero-Data-Retention (ZDR) Controls</h2>
          <div className="space-y-2">
            {[
              { type: 'Personality prompts/responses', retention: '0 days (ZDR)', control: 'Vertex AI enterprise terms' },
              { type: 'Abuse monitoring logs', retention: '55 days (Google policy)', control: 'Cannot override; minimize PII' },
              { type: 'Non-sensitive AI calls', retention: '30 days', control: 'Firebase AI Logic default' },
              { type: 'Structured output schemas', retention: 'No retention', control: 'Defined client-side' },
            ].map(item => (
              <div key={item.type} className="flex items-center justify-between p-3 bg-[#F7F2EE] rounded-xl text-xs">
                <div>
                  <span className="font-bold">{item.type}</span>
                  <span className="text-[#8C7E6E] ml-2">— {item.control}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  item.retention === '0 days (ZDR)' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>{item.retention}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Registry */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Feature Registry (Default OFF)</h2>
          <p className="text-xs text-[#6B5E52] italic">All personality-related features MUST be registered with default-OFF state.</p>
          <div className="p-4 bg-[#F7F2EE] rounded-2xl font-mono text-[10px] space-y-1 overflow-x-auto">
            <p className="text-[#8C7E6E]">{'// Feature registry pattern'}</p>
            <p>assessment_enabled: <span className="text-red-600">false</span> → requires: [consent_assessment]</p>
            <p>reflection_cards: <span className="text-red-600">false</span> → requires: [consent_assessment, valid_scores]</p>
            <p>share_basic: <span className="text-red-600">false</span> → requires: [consent_share, active_card]</p>
            <p>share_deeper: <span className="text-red-600">false</span> → requires: [consent_share_deeper, full_assessment]</p>
            <p>mutual_reflection: <span className="text-red-600">false</span> → requires: [bilateral_consent, both_shared]</p>
            <p>ai_recommendation_use: <span className="text-red-600">false</span> → requires: [consent_ai_usage, valid_scores]</p>
          </div>
        </section>

        {/* Rate Limits */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Rate Limits</h2>
          <div className="space-y-2">
            {RATE_LIMITS.map(item => (
              <div key={item.action} className="flex items-center justify-between p-3 bg-[#F7F2EE] rounded-xl text-xs">
                <span className="font-bold">{item.action}</span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-[9px] font-bold border border-slate-200">{item.limit}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Prohibited Patterns */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Prohibited Production Patterns</h2>
          <div className="space-y-2">
            {PROHIBITED_PATTERNS.map(item => (
              <div key={item.pattern} className="p-3 bg-[#F7F2EE] rounded-xl text-xs space-y-1">
                <div className="flex items-start gap-2">
                  <X size={12} className="mt-0.5 shrink-0 text-red-600" />
                  <span className="text-red-700 line-through">{item.pattern}</span>
                </div>
                <div className="flex items-start gap-2 pl-4">
                  <Check size={12} className="mt-0.5 shrink-0 text-green-600" />
                  <span className="text-green-700">{item.alternative}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Provenance Ledger */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Provenance Ledger Schema</h2>
          <div className="p-4 bg-[#F7F2EE] rounded-2xl font-mono text-[10px] space-y-1 overflow-x-auto">
            <p>{'{'}</p>
            <p className="pl-4">"output_id": "uuid",</p>
            <p className="pl-4">"model": "gemini-2.5-flash",</p>
            <p className="pl-4">"provider": "vertex-ai",</p>
            <p className="pl-4">"timestamp": "ISO-8601",</p>
            <p className="pl-4">"input_signals": ["domain_scores", "user_locale"],</p>
            <p className="pl-4">"signal_sources": ["self_report_assessment"],</p>
            <p className="pl-4">"consent_basis": ["consent_assessment", "consent_reflection"],</p>
            <p className="pl-4">"retention_class": "zdr"</p>
            <p>{'}'}</p>
          </div>
        </section>
      </main>
    </div>
  );
};
