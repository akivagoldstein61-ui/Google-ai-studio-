import React from 'react';
import { motion } from 'motion/react';
import { Database, Shield, AlertCircle, CheckCircle, Activity, Settings, Terminal, Search, Sparkles, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { aiOpsService } from '@/services/aiOpsService';

export const AIOpsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const health = aiOpsService.getSystemHealth();
  const features = aiOpsService.getFeatureStatus();
  const interventions = aiOpsService.getRecentInterventions();

  return (
    <div className="h-full flex flex-col bg-[#FDFCFB]">
      <header className="px-6 py-4 border-b border-[#F3EFEA] bg-white flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
          <ChevronLeft size={20} className="text-[#2D2926]" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#2D2926] text-[#D4AF37] rounded-lg flex items-center justify-center">
            <Terminal size={18} />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-[#2D2926]">AI Ops & Moderation</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">Internal System Console</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-8 pb-24">
        {/* System Health */}
        <section className="grid grid-cols-2 gap-4">
          <StatCard icon={Activity} label="AI Latency" value={health.latency} color="text-emerald-600" />
          <StatCard icon={AlertCircle} label="Safety Blocks" value={health.safetyBlocks.toString()} color="text-amber-600" />
          <StatCard icon={CheckCircle} label="Success Rate" value={health.successRate} color="text-blue-600" />
          <StatCard icon={Database} label="Token Usage" value={health.tokenUsage} color="text-slate-600" />
        </section>

        {/* Feature Registry Status */}
        <section className="space-y-4">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E] px-2">Feature Registry Status</h4>
          <div className="bg-white border border-[#F3EFEA] rounded-[32px] overflow-hidden shadow-sm">
            {features.map((feature, i) => (
              <div 
                key={feature.id}
                className={cn(
                  "p-4 flex flex-col gap-2 border-b border-[#F3EFEA] last:border-none",
                  i % 2 === 0 ? "bg-white" : "bg-[#FDFCFB]"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#2D2926]">{feature.name}</span>
                      <span className={cn(
                        "text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full",
                        feature.risk_level === 'high' ? "bg-red-50 text-red-700" : 
                        feature.risk_level === 'medium' ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                      )}>
                        {feature.risk_level} risk
                      </span>
                    </div>
                    <p className="text-[9px] text-[#8C7E6E] font-mono">{feature.id}</p>
                  </div>
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    feature.default_enabled ? "bg-emerald-500" : "bg-slate-300"
                  )} />
                </div>
                <div className="flex flex-wrap gap-1">
                  <span className="text-[8px] font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                    Route: {feature.runtime_model_route}
                  </span>
                  <span className="text-[8px] font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                    Model: {feature.actual_model_string}
                  </span>
                  {feature.capability_exception && (
                    <span className="text-[8px] font-mono bg-purple-100 px-1.5 py-0.5 rounded text-purple-700">
                      Exception: {feature.exception_reason}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Moderation Queue Stub */}
        <section className="space-y-4">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E] px-2">Moderation Queue (AI Assisted)</h4>
          <div className="space-y-4">
            {interventions.map((intervention) => (
              <div key={intervention.id} className="p-6 bg-white border border-[#F3EFEA] rounded-[32px] space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
                      <Shield size={20} />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-sm font-bold text-[#2D2926]">{intervention.type}</span>
                      <p className="text-[10px] text-[#8C7E6E] italic">Reported {intervention.time}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="text-[10px] font-bold uppercase tracking-widest">Review</Button>
                </div>
                <div className="p-4 bg-[#F7F2EE] rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-[9px] font-bold text-[#8C7E6E] uppercase tracking-widest">
                    <Sparkles size={12} className="text-[#D4AF37]" />
                    <span>AI Action</span>
                  </div>
                  <p className="text-xs text-[#2D2926] leading-relaxed italic">
                    "{intervention.action}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: any, label: string, value: string, color: string }> = ({ icon: Icon, label, value, color }) => (
  <div className="p-4 bg-white border border-[#F3EFEA] rounded-2xl space-y-2 shadow-sm">
    <div className="flex items-center gap-2 text-[#8C7E6E]">
      <Icon size={14} />
      <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
    </div>
    <p className={cn("text-lg font-bold", color)}>{value}</p>
  </div>
);
