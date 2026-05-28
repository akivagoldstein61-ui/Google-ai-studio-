import React, { useState, useEffect } from 'react';
import { ChevronLeft, Eye, EyeOff, Lock, Check, X, Users, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { trustService } from '@/services/trustService';

type Scope = 'private' | 'public' | 'mutual';
const VIS_FIELDS: { key: string; label: string; hint: string }[] = [
  { key: 'trait_summary', label: 'Trait summary', hint: 'Your warm two-sentence summary' },
  { key: 'strengths', label: 'Strengths', hint: 'What you bring to a connection' },
  { key: 'watch_outs', label: 'Watch-outs', hint: 'Friction loops to navigate' },
  { key: 'communication_notes', label: 'Communication notes', hint: 'How you respond best' },
];
const SCOPES: { value: Scope; label: string; icon: React.ElementType }[] = [
  { value: 'private', label: 'Private', icon: EyeOff },
  { value: 'mutual', label: 'Mutual', icon: Users },
  { value: 'public', label: 'Public', icon: Eye },
];

/**
 * LIVE: reads and writes the signed-in user's real per-field personality
 * visibility via the trust service (users/{uid}/private/visibility).
 */
const LiveVisibility: React.FC = () => {
  const { user, trackEvent } = useApp();
  const [fields, setFields] = useState<Record<string, Scope>>({
    trait_summary: 'private', strengths: 'private', watch_outs: 'private', communication_notes: 'private',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) { setLoading(false); return; }
      try {
        const res = await trustService.getPersonalityVisibility(user.uid);
        if (!cancelled && res?.fields) {
          setFields((prev) => {
            const next = { ...prev };
            for (const f of VIS_FIELDS) {
              const v = res.fields[f.key];
              if (v === 'private' || v === 'public' || v === 'mutual') next[f.key] = v;
            }
            return next;
          });
        }
      } catch { /* keep defaults */ } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const setScope = async (key: string, scope: Scope) => {
    if (!user) return;
    const previous = fields;
    const next = { ...fields, [key]: scope };
    setFields(next);
    setSaving(true);
    setSaveError(false);
    try {
      await trustService.updatePersonalityVisibility(user.uid, next);
      trackEvent?.('skill_applied', { skillId: 'personality-visibility', field: key, scope });
    } catch {
      setFields(previous);
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="p-6 bg-[#2D2926] rounded-[28px] text-white space-y-4 relative overflow-hidden">
      <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-[#D4AF37]/10 blur-3xl" />
      <div className="relative z-10 space-y-4">
        <div className="flex items-center gap-2 text-[#D4AF37]"><Sparkles size={16} /><span className="text-[10px] font-bold uppercase tracking-widest">Your live visibility controls</span></div>
        {!user ? (
          <p className="text-sm text-white/70 italic">Sign in to manage what stays private, mutual-consent, or public.</p>
        ) : loading ? (
          <div className="flex items-center gap-3 text-white/70"><Loader2 size={18} className="animate-spin text-[#D4AF37]" /><span className="text-sm italic">Loading your settings…</span></div>
        ) : (
          <div className="space-y-3">
            {VIS_FIELDS.map((f) => (
              <div key={f.key} className="p-3 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                <div><p className="text-sm font-bold text-white/90">{f.label}</p><p className="text-[11px] text-white/50 italic">{f.hint}</p></div>
                <div className="grid grid-cols-3 gap-1.5">
                  {SCOPES.map((s) => {
                    const Icon = s.icon;
                    const active = fields[f.key] === s.value;
                    return (
                      <button key={s.value} onClick={() => setScope(f.key, s.value)}
                        className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${active ? 'bg-[#D4AF37] text-[#2D2926]' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}>
                        <Icon size={12} /> {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <p className={`text-[9px] italic ${saveError ? 'text-red-400' : 'text-white/40'}`}>{saving ? 'Saving…' : saveError ? 'Save failed — your change was reverted. Please try again.' : 'Saved automatically. Default is private; raw answers and scores never leave your private store.'}</p>
          </div>
        )}
      </div>
    </section>
  );
};

type Layer = 'public' | 'private' | 'mutual' | 'system';

const VISIBILITY_LAYERS: Array<{
  id: Layer;
  name: string;
  description: string;
  color: string;
  badgeColor: string;
  icon: React.ElementType;
}> = [
  {
    id: 'public',
    name: 'Public Browse Layer',
    description: 'Visible to all users while browsing, no consent required.',
    color: 'bg-blue-50 border-blue-200 text-blue-800',
    badgeColor: 'bg-blue-100 text-blue-700',
    icon: Eye,
  },
  {
    id: 'private',
    name: 'Private Owner Layer',
    description: 'Visible only to the profile owner. Never shown to others by default.',
    color: 'bg-purple-50 border-purple-200 text-purple-800',
    badgeColor: 'bg-purple-100 text-purple-700',
    icon: Lock,
  },
  {
    id: 'mutual',
    name: 'Mutual-Consent Layer',
    description: 'Visible to a specific other person after explicit opt-in by both parties.',
    color: 'bg-pink-50 border-pink-200 text-pink-800',
    badgeColor: 'bg-pink-100 text-pink-700',
    icon: Users,
  },
  {
    id: 'system',
    name: 'System-Only Layer',
    description: 'Internal audit, safety, and retention data. Not shown to any user — ever.',
    color: 'bg-slate-50 border-slate-200 text-slate-800',
    badgeColor: 'bg-slate-100 text-slate-700',
    icon: EyeOff,
  },
];

const FIELD_MATRIX: Array<{
  field: string;
  public: boolean | null;
  private: boolean | null;
  mutual: boolean | null;
  system: boolean | null;
  note?: string;
}> = [
  { field: 'Name / Age / Location (coarse)', public: true, private: false, mutual: false, system: false },
  { field: 'Profile photos', public: true, private: false, mutual: false, system: false },
  { field: 'Observance / lifestyle labels', public: true, private: false, mutual: false, system: false },
  { field: 'Relationship intent', public: true, private: false, mutual: false, system: false },
  { field: 'Interests & hobbies (explicit)', public: true, private: false, mutual: false, system: false },
  { field: 'Explicit personal prompts', public: true, private: false, mutual: false, system: false },
  { field: 'BFAS domain reflection card', public: false, private: true, mutual: false, system: false },
  { field: 'Aspect highlights', public: false, private: true, mutual: false, system: false },
  { field: 'Dating superpower / growth edge', public: false, private: true, mutual: false, system: false },
  { field: 'Private taste profile', public: false, private: true, mutual: false, system: false },
  { field: 'Share card summary (basic)', public: false, private: true, mutual: true, system: false, note: 'After share' },
  { field: 'Share card (deeper)', public: false, private: true, mutual: true, system: false, note: 'After mutual opt-in' },
  { field: 'Compatibility reflection', public: false, private: false, mutual: true, system: false, note: 'Both opted in' },
  { field: 'Raw BFAS answers', public: false, private: false, mutual: false, system: true },
  { field: 'Exact numeric scores', public: false, private: false, mutual: false, system: true },
  { field: 'Taste vector weights', public: false, private: false, mutual: false, system: true },
  { field: 'Moderation / safety logs', public: false, private: false, mutual: false, system: true },
];

const SURFACE_RULES = [
  { surface: 'Browse / Daily Picks', rule: 'Public layer only. No personality-derived trait labels.' },
  { surface: 'Profile Detail', rule: 'Public layer only. "Why This Match" uses visible-signal allowlist.' },
  { surface: 'Settings / Profile', rule: 'Private layer for owner. Includes controls for all data.' },
  { surface: 'AI Trust Hub', rule: 'Private layer + consent management. Mutual layer grants visible.' },
  { surface: 'Match Sheet', rule: 'Public + optional mutual layer if both consented.' },
  { surface: 'Chat', rule: 'Public layer only. Never injects personality into message drafts.' },
  { surface: 'Admin / AI Ops', rule: 'No user personality dossier access. Aggregate metrics only.' },
];

const layerBadge = (value: boolean | null, note?: string) => {
  if (value === true) return (
    <span className="flex items-center gap-1 text-[9px] font-bold text-green-700">
      <Check size={10} /> {note && <span className="text-[8px] text-green-600 italic">{note}</span>}
    </span>
  );
  if (value === false) return <X size={10} className="text-[#C5B8AE]" />;
  return <span className="text-[9px] text-[#8C7E6E]">—</span>;
};

export const PersonalityVisibilitySkill: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [selectedLayer, setSelectedLayer] = useState<Layer>('public');

  const filtered = FIELD_MATRIX.filter(f => {
    if (selectedLayer === 'public') return f.public === true;
    if (selectedLayer === 'private') return f.private === true;
    if (selectedLayer === 'mutual') return f.mutual === true;
    if (selectedLayer === 'system') return f.system === true;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#2D2926]">
      <header className="sticky top-0 z-10 bg-[#FDFCFB]/95 backdrop-blur-sm px-6 py-4 flex items-center gap-4 border-b border-[#F3EFEA]">
        <button onClick={onBack} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center border border-orange-200">
            <Eye size={16} />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-lg font-serif italic">Personality Visibility</h1>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E]">Four-Layer Visibility Model</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* LIVE: real per-field visibility controls */}
        <LiveVisibility />

        {/* Layer Overview */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Visibility Layers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {VISIBILITY_LAYERS.map(layer => {
              const Icon = layer.icon;
              return (
                <button
                  key={layer.id}
                  onClick={() => setSelectedLayer(layer.id)}
                  className={`text-left p-4 rounded-2xl border-2 transition-all ${layer.color} ${
                    selectedLayer === layer.id ? 'shadow-md ring-2 ring-offset-1 ring-current/20' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon size={14} className="shrink-0" />
                    <span className="font-bold text-xs">{layer.name}</span>
                  </div>
                  <p className="text-[10px] leading-relaxed opacity-80">{layer.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Field Visibility Matrix — filtered by selected layer */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Field Matrix</h2>
            <span className={`px-3 py-1 text-[9px] font-bold rounded-full border ${
              VISIBILITY_LAYERS.find(l => l.id === selectedLayer)?.badgeColor
            }`}>
              {VISIBILITY_LAYERS.find(l => l.id === selectedLayer)?.name}
            </span>
          </div>
          {filtered.length === 0 ? (
            <p className="text-xs text-[#8C7E6E] italic">No fields in this layer.</p>
          ) : (
            <div className="space-y-2">
              {filtered.map(field => (
                <div key={field.field} className="flex items-center justify-between p-3 bg-[#F7F2EE] rounded-xl text-xs">
                  <span className="font-medium">{field.field}</span>
                  {field.note && (
                    <span className="text-[9px] text-[#8C7E6E] italic ml-2">{field.note}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          <details className="group">
            <summary className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E] cursor-pointer hover:text-[#2D2926] transition-colors">
              Show full matrix ▾
            </summary>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#F3EFEA]">
                    <th className="text-left py-2 pr-3 font-bold">Field</th>
                    <th className="text-center py-2 px-2 font-bold text-blue-700">Public</th>
                    <th className="text-center py-2 px-2 font-bold text-purple-700">Private</th>
                    <th className="text-center py-2 px-2 font-bold text-pink-700">Mutual</th>
                    <th className="text-center py-2 px-2 font-bold text-slate-700">System</th>
                  </tr>
                </thead>
                <tbody>
                  {FIELD_MATRIX.map(row => (
                    <tr key={row.field} className="border-b border-[#F3EFEA]/50">
                      <td className="py-2 pr-3">{row.field}</td>
                      <td className="py-2 px-2 text-center">{layerBadge(row.public)}</td>
                      <td className="py-2 px-2 text-center">{layerBadge(row.private)}</td>
                      <td className="py-2 px-2 text-center">{layerBadge(row.mutual, row.note)}</td>
                      <td className="py-2 px-2 text-center">{layerBadge(row.system)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </section>

        {/* Surface Rules */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Per-Surface Rules</h2>
          <div className="space-y-2">
            {SURFACE_RULES.map(item => (
              <div key={item.surface} className="flex items-start gap-3 p-3 bg-[#F7F2EE] rounded-xl text-xs">
                <span className="font-bold shrink-0 min-w-[120px]">{item.surface}</span>
                <span className="text-[#6B5E52]">{item.rule}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Key Constraints */}
        <section className="bg-white border border-[#F3EFEA] rounded-[24px] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Key Constraints</h2>
          </div>
          <div className="space-y-2">
            {[
              'Discovery surfaces never show model-derived trait labels by default',
              '"Why This Match" uses only the public-layer allowlist',
              'Owner-only screens clearly say: private, editable, resettable',
              'Mutual-consent screens state who can see what and for how long',
              'Admin views cannot become backdoor profile-dossier views',
              'Any visibility change requires a documented ADR update',
            ].map((constraint, i) => (
              <div key={i} className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl text-xs border border-amber-100">
                <Check size={14} className="mt-0.5 shrink-0 text-amber-600" />
                <span className="text-amber-800">{constraint}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
