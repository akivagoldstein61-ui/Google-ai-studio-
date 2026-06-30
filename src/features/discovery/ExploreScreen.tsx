import React, { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Profile, DiscoveryPreferences, RecommendationMode } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { SlidersHorizontal, Grid, LayoutList, Check, X, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { SkillContextPanel } from '@/features/skills/components/SkillContextPanel';
import { violatesHardFilters } from '@/lib/filteringGrammar';

export const ExploreScreen: React.FC<{ onSelect: (profile: Profile) => void }> = ({ onSelect }) => {
  const { dailyPicks, exploreProfiles, preferences, setPreferences, resetTasteProfile } = useApp();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const filterCandidatePool = useMemo(
    () => uniqueProfiles([...dailyPicks, ...exploreProfiles]),
    [dailyPicks, exploreProfiles],
  );

  return (
    <div className="h-full flex flex-col px-6 py-4 space-y-6 overflow-hidden">
      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-serif italic text-[#2D2926]">Explore</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">Explore beyond daily picks</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="rounded-full hover:bg-[#F7F2EE]"
          >
            {viewMode === 'grid' ? <LayoutList size={20} /> : <Grid size={20} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowFilters(true)}
            className="rounded-full hover:bg-[#F7F2EE]"
          >
            <SlidersHorizontal size={20} />
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        <div className="mb-5">
          <SkillContextPanel
            surface="explore"
            title="Explore skills"
            description="Tune discovery privately without exposing taste internals or turning people into scores."
            skillIds={['filtering-marketplace', 'private-taste', 'learned-taste']}
            compact
          />
        </div>
        <div className={cn(
          "grid gap-4",
          viewMode === 'grid' ? "grid-cols-2" : "grid-cols-1"
        )}>
          {exploreProfiles.map((profile, i) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelect(profile)}
              className={cn(
                "relative rounded-[32px] overflow-hidden bg-[#F7F2EE] border border-[#F3EFEA] shadow-sm group",
                viewMode === 'list' ? "aspect-[16/9]" : "aspect-[3/4]"
              )}
            >
              <img
                src={profile.photos?.[0]}
                className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-sm">{profile.displayName}, {profile.age}</span>
                    {profile.isVerified && <ShieldCheck size={12} className="text-[#D4AF37]" />}
                  </div>
                  <span className="text-[10px] text-white/80 font-medium italic">{profile.city}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <FilterDrawer
            preferences={preferences}
            profiles={filterCandidatePool}
            onClose={() => setShowFilters(false)}
            onApply={async (prefs) => {
              await setPreferences(prefs);
              setShowFilters(false);
            }}
            onResetTaste={resetTasteProfile}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

type DealbreakerKey = keyof NonNullable<DiscoveryPreferences['dealbreakers']>;
type EditableSoftPreferenceId = 'shared_interests' | 'same_city' | 'similar_observance' | 'similar_age';

const HARD_FILTERS: Array<{
  id: DealbreakerKey;
  label: string;
  detail: string;
  hardFilterId?: string;
}> = [
  { id: 'age', label: 'Age range', detail: 'Strictly exclude profiles outside your age range.' },
  { id: 'verified', label: 'Verified only', detail: 'Only show profiles with ID verification.', hardFilterId: 'verified' },
  { id: 'intent', label: 'Intent alignment', detail: 'Require matching relationship intent.' },
  { id: 'observance', label: 'Observance fit', detail: 'Require selected observance labels.' },
];

const SOFT_PREFS: Array<{
  id: EditableSoftPreferenceId;
  label: string;
  detail: string;
}> = [
  { id: 'shared_interests', label: 'Shared interests', detail: 'Boosts common interests.' },
  { id: 'same_city', label: 'Same city', detail: 'Boosts local overlap.' },
  { id: 'similar_observance', label: 'Similar observance', detail: 'Boosts matching observance labels.' },
  { id: 'similar_age', label: 'Similar age', detail: 'Boosts closer age fit.' },
];

const MODES: Array<{ id: RecommendationMode; label: string }> = [
  { id: 'values_first', label: 'Values' },
  { id: 'balanced', label: 'Balanced' },
  { id: 'serendipity', label: 'Serendipity' },
  { id: 'open_exploration', label: 'Open' },
];

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function clampAgeRange(range: [number, number]): [number, number] {
  const min = Math.max(18, Math.min(80, Math.round(range[0])));
  const max = Math.max(min, Math.min(80, Math.round(range[1])));
  return [min, max];
}

function uniqueProfiles(profiles: Profile[]): Profile[] {
  const seen = new Set<string>();
  return profiles.filter(profile => {
    const key = profile.uid ?? profile.id;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function poolImpact(profiles: Profile[], prefs: DiscoveryPreferences) {
  const total = profiles.length;
  const admitted = profiles.filter(profile => !violatesHardFilters(profile, prefs).violates).length;
  return {
    admitted,
    total,
    percent: total > 0 ? Math.round((admitted / total) * 100) : 0,
  };
}

const FilterDrawer: React.FC<{
  preferences: DiscoveryPreferences,
  profiles: Profile[],
  onClose: () => void,
  onApply: (prefs: DiscoveryPreferences) => Promise<void> | void,
  onResetTaste: () => Promise<void> | void
}> = ({ preferences, profiles, onClose, onApply, onResetTaste }) => {
  const [localPrefs, setLocalPrefs] = useState(preferences);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const impact = useMemo(() => poolImpact(profiles, localPrefs), [profiles, localPrefs]);

  const updateAgeBound = (index: 0 | 1, value: number) => {
    const nextRange: [number, number] = [...localPrefs.ageRange] as [number, number];
    nextRange[index] = value;
    setLocalPrefs({ ...localPrefs, ageRange: clampAgeRange(nextRange) });
  };

  const toggleHardFilter = (id: DealbreakerKey, hardFilterId?: string) => {
    const enabled = localPrefs.dealbreakers?.[id] === true;
    const hardFilters = new Set(localPrefs.hardFilters ?? []);
    if (hardFilterId) {
      if (enabled) hardFilters.delete(hardFilterId);
      else hardFilters.add(hardFilterId);
    }
    setLocalPrefs({
      ...localPrefs,
      hardFilters: Array.from(hardFilters),
      dealbreakers: {
        ...(localPrefs.dealbreakers ?? {}),
        [id]: !enabled,
      },
    });
  };

  const toggleSoftPref = (id: EditableSoftPreferenceId) => {
    const softPreferences = new Set(localPrefs.softPreferences ?? []);
    if (softPreferences.has(id)) softPreferences.delete(id);
    else softPreferences.add(id);
    setLocalPrefs({ ...localPrefs, softPreferences: Array.from(softPreferences) });
  };

  const updateWeight = (id: EditableSoftPreferenceId, value: number) => {
    setLocalPrefs({
      ...localPrefs,
      softPreferenceWeights: {
        ...(localPrefs.softPreferenceWeights ?? {}),
        [id]: clamp01(value),
      },
    });
  };

  const handleApply = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await onApply({
        ...localPrefs,
        ageRange: clampAgeRange(localPrefs.ageRange),
        poolImpact: {
          ...(localPrefs.poolImpact ?? {}),
          current_pool: impact.percent < 35 ? 'very_high' : impact.percent < 55 ? 'high' : impact.percent < 75 ? 'medium' : 'low',
        },
      });
    } catch (error) {
      console.error('Failed to save discovery filters', error);
      setSaveError('Could not save filters. Please try again.');
      setSaving(false);
    }
  };

  const handleResetTaste = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      await onResetTaste();
      onClose();
    } catch (error) {
      console.error('Failed to reset taste learning from Explore filters', error);
      setSaveError('Could not reset taste learning. Please try again.');
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="w-full bg-[#FDFCFB] rounded-t-[48px] p-8 space-y-10 max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex justify-between items-center">
          <div className="space-y-1">
            <h3 className="text-2xl font-serif italic text-[#2D2926]">Refine Discovery</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">Intentional filtering</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
            <X size={24} className="text-[#2D2926]" />
          </button>
        </header>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#2D2926]">Hard Filters</h4>
            <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-widest">Strict exclusions</span>
          </div>

          <div className="p-6 bg-white border border-[#F3EFEA] rounded-[24px] space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-[#2D2926]">Age Range</span>
              <span className="text-xs font-medium text-[#8C7E6E]">{localPrefs.ageRange[0]} - {localPrefs.ageRange[1]}</span>
            </div>
            <input
              type="range"
              min="18"
              max="80"
              className="w-full accent-[#2D2926]"
              value={localPrefs.ageRange[0]}
              onChange={(e) => updateAgeBound(0, Number(e.target.value))}
            />
            <input
              type="range"
              min="18"
              max="80"
              className="w-full accent-[#2D2926]"
              value={localPrefs.ageRange[1]}
              onChange={(e) => updateAgeBound(1, Number(e.target.value))}
            />
            <div className="flex items-center gap-2 text-[9px] text-[#8C7E6E] font-bold uppercase tracking-widest">
              <div className="w-1 h-1 bg-[#D4AF37] rounded-full" />
              <span>Pool impact preview: {impact.percent}% admitted ({impact.admitted}/{impact.total})</span>
            </div>
          </div>

          <div className="space-y-3">
            {HARD_FILTERS.map(filter => {
              const active = localPrefs.dealbreakers?.[filter.id] === true;
              return (
                <button
                  key={filter.id}
                  onClick={() => toggleHardFilter(filter.id, filter.hardFilterId)}
                  className={cn(
                    "w-full p-5 bg-white border rounded-[24px] flex justify-between items-center shadow-sm transition-all text-left",
                    active ? "border-[#2D2926]" : "border-[#F3EFEA]"
                  )}
                >
                  <div className="space-y-1">
                    <span className="text-sm font-bold text-[#2D2926]">{filter.label}</span>
                    <p className="text-[10px] text-[#8C7E6E] font-medium italic">{filter.detail}</p>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest",
                    active ? "bg-[#2D2926] text-white" : "bg-[#F3EFEA] text-[#8C7E6E]"
                  )}>{active ? 'Strict' : 'Flexible'}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#2D2926]">Soft Preferences</h4>
            <span className="text-[9px] font-bold text-[#8C7E6E] uppercase tracking-widest">Ranking only</span>
          </div>

          <div className="space-y-3">
            {SOFT_PREFS.map(pref => {
              const active = localPrefs.softPreferences.includes(pref.id);
              const weight = localPrefs.softPreferenceWeights?.[pref.id] ?? 0.5;
              return (
                <div key={pref.id} className={cn(
                  "p-5 bg-white border rounded-[24px] shadow-sm space-y-3",
                  active ? "border-[#D4AF37]" : "border-[#F3EFEA]"
                )}>
                  <button className="w-full flex items-center justify-between text-left" onClick={() => toggleSoftPref(pref.id)}>
                    <div className="space-y-1">
                      <span className="text-sm font-bold text-[#2D2926]">{pref.label}</span>
                      <p className="text-[10px] text-[#8C7E6E] font-medium italic">{pref.detail}</p>
                    </div>
                    {active ? <Check size={16} className="text-[#D4AF37]" /> : <span className="w-4 h-4 rounded-full border border-[#E5E0DB]" />}
                  </button>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={weight}
                      disabled={!active}
                      onChange={(e) => updateWeight(pref.id, Number(e.target.value))}
                      className="flex-1 accent-[#D4AF37] disabled:opacity-30"
                    />
                    <span className="text-[10px] font-mono text-[#8C7E6E] w-8 text-right">{weight.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <SkillContextPanel
          surface="explore"
          title="Preference skills"
          description="Use filters and learned taste as private controls. Other members never see your taste profile."
          skillIds={['filtering-marketplace', 'learned-taste', 'privacy-recommendation']}
          compact
        />

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#2D2926]">Recommendation Mode</h4>
            <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-widest">Learned taste</span>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {MODES.map(mode => (
              <button
                key={mode.id}
                onClick={() => setLocalPrefs({ ...localPrefs, recommendationMode: mode.id })}
                className={cn(
                  "p-4 rounded-[20px] text-[10px] font-bold uppercase tracking-widest transition-all border flex flex-col items-center gap-2",
                  localPrefs.recommendationMode === mode.id ? "bg-[#F7F2EE] text-[#D4AF37] border-[#D4AF37]" : "bg-white text-[#8C7E6E] border-[#F3EFEA]"
                )}
              >
                {localPrefs.recommendationMode === mode.id && <Sparkles size={14} />}
                {mode.label}
              </button>
            ))}
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-[#F3EFEA]">
            <div className="space-y-1">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#2D2926]">Taste Profile</h4>
              <p className="text-[10px] text-[#8C7E6E] font-medium italic">Your private learned preferences</p>
            </div>
            <button
              onClick={handleResetTaste}
              disabled={saving}
              className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] hover:text-[#B8962E] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Reset Learning'}
            </button>
          </div>
        </section>

        <div className="pt-4 space-y-4">
          <div className="flex items-center justify-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E]">
            <Sparkles size={12} />
            <span>Based on your settings - Human Control</span>
          </div>
          {saveError && (
            <p className="text-center text-[11px] font-bold text-red-700" role="alert">
              {saveError}
            </p>
          )}
          <Button
            className="w-full h-16 text-lg font-bold rounded-[24px] bg-[#2D2926] text-white hover:bg-[#1A1816] shadow-xl shadow-black/10 transition-all disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saving}
            onClick={handleApply}
          >
            {saving ? 'Saving...' : 'Apply Filters'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
