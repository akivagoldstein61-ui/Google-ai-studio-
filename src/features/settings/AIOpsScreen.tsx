import React from 'react';
import { Shield, AlertTriangle, Activity, BarChart2, ChevronLeft } from 'lucide-react';

export const AIOpsScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="h-full flex flex-col bg-[#FDFCFB]">
      <header className="px-6 py-4 flex items-center gap-4 border-b border-[#F3EFEA]">
        <button onClick={onBack} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
          <ChevronLeft size={20} className="text-[#2D2926]" />
        </button>
        <div className="space-y-0.5">
          <h2 className="text-xl font-serif italic text-[#2D2926]">AI Ops Dashboard</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">Internal Monitoring</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24">
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Safety Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-[#F3EFEA] rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <AlertTriangle size={16} />
                <span className="text-xs font-bold">Flags Today</span>
              </div>
              <p className="text-2xl font-serif">12</p>
            </div>
            <div className="p-4 bg-white border border-[#F3EFEA] rounded-2xl shadow-sm">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <Shield size={16} />
                <span className="text-xs font-bold">Auto-Resolved</span>
              </div>
              <p className="text-2xl font-serif">8</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Model Performance</h3>
          <div className="p-4 bg-white border border-[#F3EFEA] rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-[#F3EFEA] pb-2">
              <span className="text-sm font-bold">gemini-3.1-pro-preview</span>
              <span className="text-xs text-green-600 font-bold">Healthy</span>
            </div>
            <div className="flex justify-between items-center border-b border-[#F3EFEA] pb-2">
              <span className="text-sm font-bold">gemini-2.5-flash</span>
              <span className="text-xs text-green-600 font-bold">Healthy</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold">gemini-3.1-flash-image-preview</span>
              <span className="text-xs text-amber-600 font-bold">Degraded</span>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">Recent Interventions</h3>
          <div className="space-y-2">
            {[
              { id: 1, type: 'Safety Scan', action: 'Blocked Message', time: '10m ago' },
              { id: 2, type: 'Bio Coach', action: 'Filtered PII', time: '1h ago' },
              { id: 3, type: 'Taste Profile', action: 'Reset by User', time: '2h ago' }
            ].map(event => (
              <div key={event.id} className="p-3 bg-white border border-[#F3EFEA] rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold">{event.type}</p>
                  <p className="text-xs text-[#8C7E6E]">{event.action}</p>
                </div>
                <span className="text-[10px] text-[#8C7E6E]">{event.time}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
