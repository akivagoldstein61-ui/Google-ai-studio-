import React from 'react';
import { ShieldCheck } from 'lucide-react';
import type { SkillConsentType, SkillDefinition } from '../types';

const CONSENT_LABELS: Record<SkillConsentType, string> = {
  none: 'No extra consent',
  ai_assist: 'AI assistance',
  profile_data: 'Profile data',
  private_taste: 'Private taste',
  match_context: 'Match context',
  message_text: 'Message text you choose',
  photo_analysis: 'Photo analysis',
  mutual_consent: 'Mutual consent',
  admin_only: 'Internal only',
};

export const SkillConsentPanel: React.FC<{ skill: SkillDefinition; compact?: boolean }> = ({ skill, compact }) => (
  <div className="rounded-2xl border border-[#F3EFEA] bg-[#FDFCFB] p-4 space-y-3">
    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">
      <ShieldCheck size={14} className="text-[#D4AF37]" />
      <span>Consent and privacy</span>
    </div>
    <div className="flex flex-wrap gap-2">
      {skill.requiredConsent.map((consent) => (
        <span key={consent} className="px-2.5 py-1 rounded-full bg-white border border-[#F3EFEA] text-[9px] font-bold uppercase tracking-widest text-[#6B5E52]">
          {CONSENT_LABELS[consent]}
        </span>
      ))}
    </div>
    {!compact && (
      <ul className="space-y-2">
        {skill.privacyNotes.map((note) => (
          <li key={note} className="text-xs leading-relaxed text-[#6B5E52]">
            {note}
          </li>
        ))}
      </ul>
    )}
  </div>
);
