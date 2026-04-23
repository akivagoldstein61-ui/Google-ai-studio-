import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Clock, Wallet, Sparkles, Loader2, ShieldCheck, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { aiDatePlannerService } from '@/services/aiDatePlannerService';
import { cn } from '@/lib/utils';

export const DatePlannerModal: React.FC<{
  onClose: () => void;
  partnerName: string;
}> = ({ onClose, partnerName }) => {
  const [step, setStep] = useState<'form' | 'loading' | 'results'>('form');
  const [locationScope, setLocationScope] = useState<'city' | 'neighborhood' | 'exact'>('city');
  const [locationValue, setLocationValue] = useState('');
  const [budget, setBudget] = useState<'low' | 'medium' | 'high'>('medium');
  const [vibe, setVibe] = useState('');
  const [time, setTime] = useState('');
  const [transport, setTransport] = useState('');
  const [constraints, setConstraints] = useState('');
  const [results, setResults] = useState<any>(null);

  const handlePlan = async () => {
    if (!locationValue || !time) return;
    setStep('loading');
    try {
      const plan = await aiDatePlannerService.planDate({
        locationScope,
        locationValue,
        budget,
        vibe,
        time,
        transport,
        constraints
      });
      setResults(plan);
      setStep('results');
    } catch (error) {
      console.error("Failed to plan date:", error);
      setStep('form');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] bg-[#2D2926]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto"
    >
      <div className="w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl relative my-auto">
        <div className="p-6 border-b border-[#F3EFEA] flex justify-between items-center bg-[#FDFCFB]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
              <Sparkles size={14} />
              <span>Date Planner</span>
            </div>
            <h2 className="text-xl font-serif italic text-[#2D2926]">Plan with {partnerName}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
            <X size={20} className="text-[#8C7E6E]" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 'form' && (
              <motion.div 
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#8C7E6E]">Location</label>
                  <div className="flex gap-2 bg-[#F7F2EE] p-1 rounded-xl">
                    {(['city', 'neighborhood', 'exact'] as const).map((scope) => (
                      <button
                        key={scope}
                        onClick={() => setLocationScope(scope)}
                        className={cn(
                          "flex-1 py-2 text-xs font-medium rounded-lg transition-all capitalize",
                          locationScope === scope ? "bg-white shadow-sm text-[#2D2926]" : "text-[#8C7E6E] hover:text-[#2D2926]"
                        )}
                      >
                        {scope}
                      </button>
                    ))}
                  </div>
                  <input 
                    type="text" 
                    placeholder={locationScope === 'exact' ? "Enter exact address (requires consent)" : `Enter ${locationScope}`}
                    value={locationValue}
                    onChange={(e) => setLocationValue(e.target.value)}
                    className="w-full bg-[#F7F2EE] border-none rounded-xl p-4 text-sm focus:ring-2 focus:ring-[#D4AF37]/50 transition-all"
                  />
                  {locationScope === 'exact' && (
                    <div className="flex items-start gap-2 text-[10px] text-amber-600 bg-amber-50 p-3 rounded-xl">
                      <ShieldCheck size={14} className="shrink-0 mt-0.5" />
                      <p>Exact location is only used for this search and is not saved to your profile.</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#8C7E6E]">Time</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Thursday 8PM"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-[#F7F2EE] border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#D4AF37]/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#8C7E6E]">Budget</label>
                    <select 
                      value={budget}
                      onChange={(e) => setBudget(e.target.value as any)}
                      className="w-full bg-[#F7F2EE] border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#D4AF37]/50"
                    >
                      <option value="low">Low ($)</option>
                      <option value="medium">Medium ($$)</option>
                      <option value="high">High ($$$)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#8C7E6E]">Vibe & Transport</label>
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="e.g., Quiet, Coffee"
                      value={vibe}
                      onChange={(e) => setVibe(e.target.value)}
                      className="w-full bg-[#F7F2EE] border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#D4AF37]/50"
                    />
                    <input 
                      type="text" 
                      placeholder="e.g., Near train"
                      value={transport}
                      onChange={(e) => setTransport(e.target.value)}
                      className="w-full bg-[#F7F2EE] border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#D4AF37]/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#8C7E6E]">Observance / Constraints (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Kosher Mehadrin, Shomer Negiah friendly"
                    value={constraints}
                    onChange={(e) => setConstraints(e.target.value)}
                    className="w-full bg-[#F7F2EE] border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#D4AF37]/50"
                  />
                </div>

                <Button 
                  onClick={handlePlan}
                  disabled={!locationValue || !time}
                  className="w-full h-14 rounded-xl bg-[#2D2926] text-white font-bold hover:bg-[#1A1816] shadow-lg shadow-black/10"
                >
                  Generate Plan
                </Button>
              </motion.div>
            )}

            {step === 'loading' && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12 flex flex-col items-center justify-center space-y-4"
              >
                <Loader2 size={32} className="animate-spin text-[#D4AF37]" />
                <p className="text-sm text-[#8C7E6E] italic font-serif">Finding the perfect spots...</p>
              </motion.div>
            )}

            {step === 'results' && results && (
              <motion.div 
                key="results"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Recommended Venues</h3>
                  {results.venues?.map((venue: any, i: number) => (
                    <div key={i} className="p-4 bg-[#F7F2EE] rounded-2xl space-y-2 relative">
                      {i === (results.venues?.length || 0) - 1 && (
                        <div className="absolute -top-2 -right-2 bg-[#2D2926] text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">
                          Backup Plan
                        </div>
                      )}
                      <h4 className="font-bold text-[#2D2926]">{venue.name}</h4>
                      <p className="text-sm text-[#2D2926]/80 italic font-serif">{venue.why_good}</p>
                      {venue.safety_note && (
                        <div className="flex items-start gap-2 mt-2 text-[10px] text-[#8C7E6E]">
                          <ShieldCheck size={12} className="shrink-0 mt-0.5" />
                          <p>{venue.safety_note}</p>
                        </div>
                      )}
                      {venue.source_url && (
                        <a href={venue.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] hover:text-[#B8962E]">
                          <ExternalLink size={10} />
                          View Source
                        </a>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-[#D4AF37]/10 rounded-2xl border border-[#D4AF37]/20">
                  <p className="text-xs text-[#D4AF37] italic font-serif leading-relaxed">
                    "{results.how_to_choose_tip}"
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="outline"
                    onClick={() => setStep('form')}
                    className="flex-1 rounded-xl border-[#E5DED5] text-[#2D2926]"
                  >
                    Adjust
                  </Button>
                  <Button 
                    onClick={onClose}
                    className="flex-1 rounded-xl bg-[#2D2926] text-white"
                  >
                    Done
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
