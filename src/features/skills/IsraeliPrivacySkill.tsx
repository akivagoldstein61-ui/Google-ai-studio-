import React from 'react';
import { ChevronLeft, Lock, Check, AlertTriangle, Shield, Database, Globe } from 'lucide-react';

const DATA_CLASSIFICATION = [
  { type: 'Personality quiz answers', classification: 'Special sensitivity', handling: 'Separate consent, separate storage' },
  { type: 'Computed personality scores', classification: 'Special sensitivity', handling: 'Same as raw answers' },
  { type: 'Personality embeddings', classification: 'Special sensitivity', handling: 'Same as raw answers' },
  { type: 'AI-generated narrative', classification: 'Special sensitivity', handling: 'Correction/deletion rights apply' },
  { type: 'Observance/denomination', classification: 'Special sensitivity', handling: 'High-sensitivity handling' },
  { type: 'Sexual orientation signals', classification: 'Special sensitivity', handling: 'Separate access restrictions' },
  { type: 'Behavioral taste profile', classification: 'Personal data (elevated)', handling: 'Elevate if used for personality inference' },
  { type: 'Compatibility reflection', classification: 'Special sensitivity', handling: 'Bilateral consent required' },
  { type: 'Location (coarse/city)', classification: 'Personal data', handling: 'Standard handling' },
  { type: 'Basic account identifiers', classification: 'Personal data', handling: 'Standard handling' },
];

const RIGHTS = [
  { action: 'View all data', scope: 'Full personality record', basis: 'Section 13 (statutory)' },
  { action: 'Correct answers', scope: 'Individual item responses', basis: 'Section 14 (statutory)' },
  { action: 'Delete personality', scope: 'All assessment data', basis: 'Section 14 + product choice' },
  { action: 'Reset scores', scope: 'Computed scores only', basis: 'Product choice' },
  { action: 'Export', scope: 'Machine-readable download', basis: 'Product choice' },
  { action: 'Account deletion', scope: 'All personal data', basis: 'Product choice' },
];

export const IsraeliPrivacySkill: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2926]">
      <header className="sticky top-0 z-10 bg-[#FDFCFB]/95 backdrop-blur-sm px-6 py-4 flex items-center gap-4 border-b border-[#F3EFEA]">
        <button onClick={onBack} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center border border-blue-200">
            <Lock size={16} />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-lg font-serif italic">Israeli Privacy Compliance</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E]">Amendment 13 & PPA Guidance</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* Amendment 13 Overview */}
        <section className="p-6 bg-blue-50 rounded-[24px] border border-blue-100 space-y-4">
          <div className="flex items-center gap-2 text-blue-700">
            <Shield size={18} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Amendment 13 Overview</span>
          </div>
          <p className="text-xs text-blue-800 leading-relaxed">
            Amendment 13 to Israel's Protection of Privacy Law was published August 2024 and took effect August 2025.
            It materially changes the operative framework for consumer personalization products.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              'Broadened "personal data" definition',
              'New "data of special sensitivity" category',
              'Controller/processor concepts added',
              'Enhanced notice requirements (Section 11)',
              'DPO triggers for large-scale processing',
              'Stronger enforcement powers',
            ].map(change => (
              <div key={change} className="flex items-start gap-2 text-xs text-blue-700">
                <Check size={12} className="mt-0.5 shrink-0" />
                <span>{change}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Data Classification Matrix */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Data Classification Matrix</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#F3EFEA]">
                  <th className="text-left py-2 pr-3 font-bold">Data Type</th>
                  <th className="text-left py-2 pr-3 font-bold">Classification</th>
                  <th className="text-left py-2 font-bold">Handling</th>
                </tr>
              </thead>
              <tbody>
                {DATA_CLASSIFICATION.map(row => (
                  <tr key={row.type} className="border-b border-[#F3EFEA]/50">
                    <td className="py-2 pr-3">{row.type}</td>
                    <td className="py-2 pr-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        row.classification.includes('Special') ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-slate-50 text-slate-700 border border-slate-200'
                      }`}>
                        {row.classification}
                      </span>
                    </td>
                    <td className="py-2 text-[#6B5E52]">{row.handling}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Access, Correction, Deletion Rights */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Access, Correction & Deletion Rights</h2>
          <div className="space-y-2">
            {RIGHTS.map(right => (
              <div key={right.action} className="flex items-center justify-between p-3 bg-[#F7F2EE] rounded-xl text-xs">
                <div>
                  <span className="font-bold">{right.action}</span>
                  <span className="text-[#8C7E6E] ml-2">({right.scope})</span>
                </div>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[9px] font-bold border border-blue-100">
                  {right.basis}
                </span>
              </div>
            ))}
          </div>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-800">
            <AlertTriangle size={14} className="inline mr-1" />
            Israel does NOT have a broad statutory "right to be forgotten." Kesher provides broader deletion as a product choice, not a legal obligation.
          </div>
        </section>

        {/* DPO Trigger Analysis */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">DPO Trigger Analysis</h2>
          <p className="text-xs text-[#6B5E52] italic">A Data Protection Officer is mandatory when core activities involve large-scale processing of special-sensitivity data.</p>
          <div className="space-y-2">
            {[
              { factor: 'Personality assessment at scale', assessment: 'Likely triggers if >100K users opt in' },
              { factor: 'Behavioral profiling (taste/dwell)', assessment: 'PPA says app activity tracking is "especially relevant"' },
              { factor: 'Observance/sexuality fields', assessment: 'Special-sensitivity data at scale' },
              { factor: 'Recommendation engine', assessment: 'Ongoing systematic monitoring if core product logic' },
            ].map(item => (
              <div key={item.factor} className="flex items-start gap-3 p-3 bg-[#F7F2EE] rounded-xl text-xs">
                <Database size={14} className="mt-0.5 shrink-0 text-blue-600" />
                <div>
                  <span className="font-bold">{item.factor}</span>
                  <p className="text-[#8C7E6E] mt-0.5">{item.assessment}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 bg-green-50 rounded-xl border border-green-100 text-xs text-green-800">
            <Check size={14} className="inline mr-1" />
            Recommendation: Appoint DPO proactively before reaching trigger thresholds.
          </div>
        </section>

        {/* Transfer Abroad */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Transfer-Abroad Requirements</h2>
          <div className="space-y-3">
            {[
              'Verify processing region (prefer Israel/EU)',
              'Execute DPA with transfer-abroad clauses',
              'Document onward transfer controls',
              'Verify subprocessor list and notification rights',
              'Recipient must provide written guarantee of adequate privacy measures',
            ].map((req, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <Globe size={14} className="mt-0.5 shrink-0 text-blue-600" />
                <span>{req}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Implementation Checklist */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Implementation Checklist</h2>
          <div className="space-y-2">
            {[
              'Data classification matrix applied to all data types in schema',
              'Section 11 notice elements on every collection screen',
              'AI-specific disclosure on personality and recommendation screens',
              'Access/export functionality in Trust Hub',
              'Correction flow for individual items',
              'Deletion cascade tested end-to-end',
              'DPO appointment timeline established',
              '100K notification package prepared',
              'Transfer-abroad DPA executed with AI provider',
              'Processor contracts signed with all vendors',
              'No personality-based push notification segmentation',
              'Consent log retained after data deletion (audit trail)',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 p-2 text-xs">
                <div className="w-4 h-4 shrink-0 rounded border border-blue-300 bg-blue-50 flex items-center justify-center">
                  <Check size={10} className="text-blue-600" />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
