import React, { useState } from 'react';
import { Beaker, ChevronLeft, ToggleLeft, ToggleRight } from 'lucide-react';
import { FEATURE_FLAGS } from '@/ai/featureFlags';
import { cn } from '@/lib/utils';

export const ExperimentsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [flags, setFlags] = useState(FEATURE_FLAGS);

  const toggleFlag = (key: keyof typeof FEATURE_FLAGS) => {
    setFlags(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="h-full flex flex-col bg-[#FDFCFB]">
      <header className="px-6 py-4 flex items-center gap-4 border-b border-[#F3EFEA]">
        <button onClick={onBack} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
          <ChevronLeft size={20} className="text-[#2D2926]" />
        </button>
        <div className="space-y-0.5">
          <h2 className="text-xl font-serif italic text-[#2D2926]">AI Experiments</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">Internal Feature Flags</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
        <section className="space-y-4">
          <div className="p-6 bg-[#2D2926] rounded-[32px] text-white space-y-4">
            <div className="flex items-center gap-2 text-[#D4AF37]">
              <Beaker size={18} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Labs & Beta</span>
            </div>
            <h3 className="text-lg font-serif italic leading-snug">Test new capabilities safely.</h3>
            <p className="text-sm text-white/60 leading-relaxed italic">
              Toggle experimental AI features for internal testing. These settings only affect your local session.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E] px-2">Feature Flags</h3>
          <div className="space-y-2">
            {Object.entries(flags).map(([key, value]) => (
              <div key={key} className="p-4 bg-white border border-[#F3EFEA] rounded-2xl flex justify-between items-center shadow-sm">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#2D2926]">{key.replace('ENABLE_AI_', '').replace(/_/g, ' ')}</p>
                  <p className="text-[10px] text-[#8C7E6E] uppercase tracking-widest font-mono">{key}</p>
                </div>
                <button
                  onClick={() => toggleFlag(key as keyof typeof FEATURE_FLAGS)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-all relative shrink-0",
                    value ? "bg-[#2D2926]" : "bg-[#F7F2EE]"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                    value ? "right-1" : "left-1"
                  )} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
