import React, { useEffect, useState } from 'react';
import { ChevronLeft, Eye, EyeOff, Users, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { trustService } from '@/services/trustService';
import {
  PERSONALITY_VISIBILITY_FIELDS,
  type PersonalityVisibilityField,
  type PersonalityVisibilityScope,
} from '@/ai/schemas';
import { cn } from '@/lib/utils';

const FIELD_LABELS: Record<PersonalityVisibilityField, { en: string; he: string; hint: string }> = {
  trait_summary: {
    en: 'Trait summary',
    he: 'סיכום אישיות',
    hint: 'Your warm two-sentence summary.',
  },
  strengths: {
    en: 'Strengths',
    he: 'נקודות חוזק',
    hint: 'What you bring into a relationship.',
  },
  watch_outs: {
    en: 'Watch-outs',
    he: 'נקודות לתשומת לב',
    hint: 'Friction loops you tend to fall into.',
  },
  communication_notes: {
    en: 'Communication notes',
    he: 'הערות תקשורת',
    hint: 'How you respond best in conversation.',
  },
};

const SCOPES: { value: PersonalityVisibilityScope; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'private',
    label: 'Private',
    description: 'Only you can see this.',
    icon: <EyeOff size={16} />,
  },
  {
    value: 'mutual',
    label: 'Mutual consent',
    description: 'Visible only inside a share card you approve.',
    icon: <Users size={16} />,
  },
  {
    value: 'public',
    label: 'Public',
    description: 'Visible on your profile to everyone you appear to.',
    icon: <Eye size={16} />,
  },
];

const DEFAULT_FIELDS: Record<PersonalityVisibilityField, PersonalityVisibilityScope> = {
  trait_summary: 'private',
  strengths: 'private',
  watch_outs: 'private',
  communication_notes: 'private',
};

export const PersonalityVisibilitySettings: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user } = useApp();
  const [fields, setFields] = useState<Record<PersonalityVisibilityField, PersonalityVisibilityScope>>(DEFAULT_FIELDS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!user) return;
      try {
        const result = await trustService.getPersonalityVisibility(user.uid);
        if (cancelled) return;
        const next = { ...DEFAULT_FIELDS };
        if (result?.fields && typeof result.fields === 'object') {
          for (const key of PERSONALITY_VISIBILITY_FIELDS) {
            const v = result.fields[key];
            if (v === 'private' || v === 'public' || v === 'mutual') next[key] = v;
          }
        }
        setFields(next);
      } catch (error) {
        console.error('Failed to load personality visibility', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const updateField = async (key: PersonalityVisibilityField, scope: PersonalityVisibilityScope) => {
    if (!user) return;
    const next = { ...fields, [key]: scope };
    setFields(next);
    setSaving(true);
    try {
      await trustService.updatePersonalityVisibility(user.uid, next);
      setSavedAt(new Date().toISOString());
    } catch (error) {
      console.error('Failed to update personality visibility', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col bg-[#FDFCFB] items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-[#D4AF37]" size={32} />
        <p className="text-[#8C7E6E] italic font-serif">Loading visibility settings…</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#FDFCFB]">
      <header className="px-6 py-4 flex items-center gap-4 border-b border-[#F3EFEA] sticky top-0 bg-[#FDFCFB] z-10">
        <button onClick={onBack} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
          <ChevronLeft size={20} className="text-[#2D2926]" />
        </button>
        <div className="space-y-0.5">
          <h2 className="text-xl font-serif italic text-[#2D2926]">Personality Visibility</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">Owner-only by default</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-24">
        <section className="p-6 bg-[#2D2926] rounded-[32px] text-white space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">How visibility works</p>
          <p className="text-sm text-white/80 leading-relaxed">
            Personality data is private to you by default. Choose <span className="font-bold">Mutual consent</span> to allow it inside an approved share card with a specific match, or <span className="font-bold">Public</span> to display it on your profile to everyone you appear to. Raw answers and raw scores never leave your private storage.
          </p>
        </section>

        <section className="space-y-4">
          {PERSONALITY_VISIBILITY_FIELDS.map((key) => {
            const meta = FIELD_LABELS[key];
            const current = fields[key];
            return (
              <div key={key} className="p-6 bg-white border border-[#F3EFEA] rounded-[32px] space-y-4 shadow-sm">
                <div className="space-y-1">
                  <h5 className="font-bold text-[#2D2926]">{meta.en}</h5>
                  <p className="text-[11px] text-[#8C7E6E] italic">{meta.hint}</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {SCOPES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => updateField(key, s.value)}
                      className={cn(
                        'p-3 rounded-2xl border text-left text-xs transition-all space-y-1',
                        current === s.value
                          ? 'border-[#D4AF37] bg-[#D4AF37]/5 text-[#2D2926]'
                          : 'border-[#F3EFEA] text-[#8C7E6E] hover:border-[#D4AF37]/30',
                      )}
                    >
                      <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-[10px]">
                        {s.icon}
                        <span>{s.label}</span>
                      </div>
                      <p className="text-[10px] leading-snug italic">{s.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        <p className="text-[10px] text-[#8C7E6E] italic text-center">
          {saving ? 'Saving…' : savedAt ? `Saved ${new Date(savedAt).toLocaleTimeString()}` : 'Changes save automatically.'}
        </p>
      </div>
    </div>
  );
};
