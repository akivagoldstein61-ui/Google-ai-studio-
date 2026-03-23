import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Profile, DiscoveryPreferences } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { SlidersHorizontal, Grid, LayoutList, Check, X, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export const ExploreScreen: React.FC<{ onSelect: (profile: Profile) => void }> = ({ onSelect }) => {
  const { exploreProfiles, preferences, setPreferences } = useApp();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="h-full flex flex-col px-6 py-4 space-y-6 overflow-hidden">
      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-serif italic text-[#2D2926]">Explore</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">Discover more connections</p>
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
                src={profile.photos[0]} 
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
            onClose={() => setShowFilters(false)} 
            onApply={(prefs) => { setPreferences(prefs); setShowFilters(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const FilterDrawer: React.FC<{ 
  preferences: DiscoveryPreferences, 
  onClose: () => void, 
  onApply: (prefs: DiscoveryPreferences) => void 
}> = ({ preferences, onClose, onApply }) => {
  const [localPrefs, setLocalPrefs] = useState(preferences);

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
          
          <div className="space-y-4">
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
                value={localPrefs.ageRange[1]}
                onChange={(e) => setLocalPrefs({ ...localPrefs, ageRange: [localPrefs.ageRange[0], parseInt(e.target.value)] })}
              />
              <div className="flex items-center gap-2 text-[9px] text-[#8C7E6E] font-bold uppercase tracking-widest">
                <div className="w-1 h-1 bg-[#D4AF37] rounded-full" />
                <span>Pool impact: High</span>
              </div>
            </div>

            <div className="p-6 bg-white border border-[#F3EFEA] rounded-[24px] flex justify-between items-center shadow-sm">
              <div className="space-y-1">
                <span className="text-sm font-bold text-[#2D2926]">Verified Only</span>
                <p className="text-[10px] text-[#8C7E6E] font-medium italic">Only show profiles with ID verification</p>
              </div>
              <button 
                onClick={() => setLocalPrefs({ ...localPrefs, hardFilters: localPrefs.hardFilters.includes('verified') ? [] : ['verified'] })}
                className={cn(
                  "w-12 h-6 rounded-full transition-all relative",
                  localPrefs.hardFilters.includes('verified') ? "bg-[#2D2926]" : "bg-[#F3EFEA]"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                  localPrefs.hardFilters.includes('verified') ? "left-7" : "left-1"
                )} />
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#2D2926]">Soft Preferences</h4>
            <span className="text-[9px] font-bold text-[#8C7E6E] uppercase tracking-widest">Ranking biases</span>
          </div>

          <div className="flex flex-wrap gap-3">
            {['Urban', 'Outdoorsy', 'Artistic', 'Tech-focused', 'Traditional', 'Secular'].map(tag => (
              <button 
                key={tag}
                onClick={() => setLocalPrefs({ ...localPrefs, softPreferences: localPrefs.softPreferences.includes(tag) ? localPrefs.softPreferences.filter(t => t !== tag) : [...localPrefs.softPreferences, tag] })}
                className={cn(
                  "px-6 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all border",
                  localPrefs.softPreferences.includes(tag) ? "bg-[#2D2926] text-white border-[#2D2926]" : "bg-white text-[#8C7E6E] border-[#F3EFEA] hover:border-[#D4AF37]/30"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#2D2926]">Recommendation Mode</h4>
            <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-widest">Learned taste</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'values_first', label: 'Values' },
              { id: 'balanced', label: 'Balanced' },
              { id: 'chemistry_first', label: 'Chemistry' }
            ].map(mode => (
              <button 
                key={mode.id}
                onClick={() => setLocalPrefs({ ...localPrefs, recommendationMode: mode.id as any })}
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
        </section>

        <div className="pt-4">
          <Button 
            className="w-full h-16 text-lg font-bold rounded-[24px] bg-[#2D2926] text-white hover:bg-[#1A1816] shadow-xl shadow-black/10 transition-all" 
            onClick={() => onApply(localPrefs)}
          >
            Apply Filters
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};
