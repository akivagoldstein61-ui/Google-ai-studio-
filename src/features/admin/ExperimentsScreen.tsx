import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FlaskConical, BarChart3, Target, Users, Zap, Beaker, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { FEATURE_FLAGS } from '@/ai/featureFlags';
import { aiExperimentsService } from '@/services/aiExperimentsService';

export const ExperimentsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [flags, setFlags] = useState(aiExperimentsService.getFeatureFlags());
  const activeExperiments = aiExperimentsService.getActiveExperiments();
  const evalTools = aiExperimentsService.getEvalTools();

  const toggleFlag = (key: keyof typeof FEATURE_FLAGS) => {
    setFlags(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="h-full flex flex-col bg-[#FDFCFB]">
      <header className="px-6 py-4 border-b border-[#F3EFEA] bg-white flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
          <ChevronLeft size={20} className="text-[#2D2926]" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#2D2926] text-[#D4AF37] rounded-lg flex items-center justify-center">
            <FlaskConical size={18} />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-[#2D2926]">Experiments & Eval</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">AI Evaluation Console</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-24">
        {/* Feature Flags */}
        <section className="space-y-4">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E] px-2">Feature Flags</h4>
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

        {/* Active Experiments */}
        <section className="space-y-4">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E] px-2">Active Experiments</h4>
          <div className="space-y-4">
            {activeExperiments.map(exp => (
              <ExperimentCard 
                key={exp.id}
                title={exp.title}
                status={exp.status}
                traffic={exp.traffic}
                metric={exp.metric}
                lift={exp.lift}
                isPositive={exp.isPositive}
              />
            ))}
          </div>
        </section>

        {/* Evaluation Harness */}
        <section className="space-y-4">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E] px-2">Evaluation Harness</h4>
          <div className="bg-white border border-[#F3EFEA] rounded-[32px] overflow-hidden shadow-sm">
            {evalTools.map(tool => (
              <EvalTool 
                key={tool.id} 
                icon={tool.id === 'eval_prompt_regression' ? Target : tool.id === 'eval_ranking_fairness' ? Users : Zap} 
                title={tool.title} 
                description={tool.description} 
              />
            ))}
          </div>
        </section>

        {/* Golden Test Cases */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">Golden Test Cases</h4>
            <Button size="sm" variant="ghost" className="text-[9px] font-bold uppercase tracking-widest">View All</Button>
          </div>
          <div className="p-6 bg-white border border-[#F3EFEA] rounded-[32px] space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#F7F2EE] rounded-full flex items-center justify-center text-[#2D2926]">
                <Beaker size={16} />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#2D2926]">Case #402: Ambiguous Observance</span>
                <p className="text-[9px] text-[#8C7E6E] italic">Last tested: 2h ago • Status: Passed</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const ExperimentCard: React.FC<{ title: string, status: string, traffic: string, metric: string, lift: string, isPositive: boolean }> = ({ title, status, traffic, metric, lift, isPositive }) => (
  <div className="p-6 bg-white border border-[#F3EFEA] rounded-[32px] space-y-4 shadow-sm">
    <div className="flex justify-between items-start">
      <div className="space-y-1">
        <h5 className="font-bold text-[#2D2926] text-sm">{title}</h5>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">{status}</span>
          <span className="text-[9px] font-bold text-[#8C7E6E] uppercase tracking-widest">{traffic} Traffic</span>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[9px] font-bold text-[#8C7E6E] uppercase tracking-widest">{metric}</p>
        <p className={cn("text-lg font-bold", isPositive ? "text-emerald-600" : "text-red-600")}>{lift}</p>
      </div>
    </div>
  </div>
);

const EvalTool: React.FC<{ icon: any, title: string, description: string }> = ({ icon: Icon, title, description }) => (
  <button className="w-full p-6 flex items-center justify-between hover:bg-[#F7F2EE] transition-all border-b border-[#F3EFEA] last:border-none group">
    <div className="flex items-center gap-4 text-left">
      <div className="w-10 h-10 bg-[#F7F2EE] rounded-full flex items-center justify-center text-[#2D2926]">
        <Icon size={18} />
      </div>
      <div className="space-y-0.5">
        <span className="font-bold text-sm text-[#2D2926]">{title}</span>
        <p className="text-[10px] text-[#8C7E6E] italic">{description}</p>
      </div>
    </div>
    <ChevronRight size={18} className="text-[#8C7E6E] group-hover:translate-x-1 transition-transform" />
  </button>
);
