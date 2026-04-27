import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, AlertTriangle, UserX, Trash2, MessageSquare, ArrowLeft, Search, Sparkles, Loader2, CheckCircle2, PhoneCall, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { aiSafetyService } from '@/services/aiSafetyService';
import { cn } from '@/lib/utils';
import { ReportFlow } from '@/features/safety/ReportFlow';
import { useApp } from '@/context/AppContext';

export const SafetyCenter: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user } = useApp();
  const [safetyQuestion, setSafetyQuestion] = useState('');
  const [safetyAdvice, setSafetyAdvice] = useState<string | null>(null);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [showReportFlow, setShowReportFlow] = useState(false);

  const handleAskSafety = async () => {
    if (!safetyQuestion.trim() || isLoadingAdvice) return;
    setIsLoadingAdvice(true);
    try {
      const advice = await aiSafetyService.getSafetyAdvice(safetyQuestion);
      setSafetyAdvice(advice);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingAdvice(true);
      // Simulate a bit more for effect
      setTimeout(() => setIsLoadingAdvice(false), 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#FDFCFB] flex flex-col overflow-hidden">
      <header className="px-6 pt-14 pb-6 flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-[#F3EFEA] relative z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all"
          >
            <ArrowLeft size={20} className="text-[#2D2926]" />
          </button>
          <div className="space-y-0.5">
            <h2 className="text-xl font-serif italic text-[#2D2926]">Safety Center</h2>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C7E6E]">Your well-being is our priority</p>
          </div>
        </div>
        <div className="w-10 h-10 bg-[#F7F2EE] text-[#D4AF37] rounded-full flex items-center justify-center shadow-sm">
          <Shield size={20} />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-12">
        {/* Trust Philosophy */}
        <section className="space-y-4 text-center">
          <h3 className="text-2xl font-serif italic text-[#2D2926]">Kesher's Trust Philosophy</h3>
          <p className="text-sm text-[#8C7E6E] leading-relaxed italic max-w-sm mx-auto">
            We believe dating should be respectful, safe, and serious. We prioritize trust over growth, and human control over AI autonomy. Your safety and discretion matter here.
          </p>
        </section>

        {/* AI Safety Assistant */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
            <Sparkles size={16} />
            <span>AI Safety Assistant</span>
          </div>
          <div className="p-8 bg-white border border-[#F3EFEA] rounded-[40px] space-y-6 shadow-sm">
            <div className="space-y-2">
              <h3 className="text-xl font-serif italic text-[#2D2926]">Have a safety question?</h3>
              <p className="text-sm text-[#8C7E6E] leading-relaxed italic">Ask anything about dating safety, meeting in person, or red flags.</p>
            </div>
            <div className="flex gap-3">
              <input 
                placeholder="e.g., How to stay safe on a first date?" 
                className="flex-1 bg-[#F7F2EE] border border-transparent rounded-full px-6 py-3 text-sm focus:outline-none focus:border-[#D4AF37] transition-all italic font-serif"
                value={safetyQuestion}
                onChange={(e) => setSafetyQuestion(e.target.value)}
              />
              <Button 
                size="icon" 
                onClick={handleAskSafety}
                disabled={!safetyQuestion.trim() || isLoadingAdvice}
                className="rounded-full bg-[#2D2926] text-white shrink-0"
              >
                {isLoadingAdvice ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              </Button>
            </div>
            <AnimatePresence>
              {safetyAdvice && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-6 bg-[#F7F2EE]/50 border border-[#E5DED5] rounded-[32px] space-y-3 overflow-hidden"
                >
                  <p className="text-sm text-[#2D2926] leading-relaxed italic font-serif">{safetyAdvice}</p>
                  <div className="flex items-center gap-2 text-[9px] text-[#8C7E6E] font-bold uppercase tracking-widest">
                    <CheckCircle2 size={12} className="text-[#D4AF37]" />
                    <span>Grounded in safety best practices</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Safety Explanations */}
        <section className="space-y-6">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#8C7E6E]">How Safety Works</h3>
          <div className="space-y-4">
            <div className="p-6 bg-white border border-[#F3EFEA] rounded-[32px] space-y-3 shadow-sm">
              <div className="flex items-center gap-3 text-[#2D2926]">
                <AlertTriangle size={20} className="text-amber-600" />
                <h4 className="font-bold">Reporting</h4>
              </div>
              <p className="text-sm text-[#8C7E6E] leading-relaxed">
                Reporting helps protect the community. When you report someone, our moderation team reviews the context securely. The reported user is not notified that you reported them.
              </p>
            </div>
            
            <div className="p-6 bg-white border border-[#F3EFEA] rounded-[32px] space-y-3 shadow-sm">
              <div className="flex items-center gap-3 text-[#2D2926]">
                <UserX size={20} className="text-red-600" />
                <h4 className="font-bold">Blocking</h4>
              </div>
              <p className="text-sm text-[#8C7E6E] leading-relaxed">
                Blocking severs the connection immediately. They can no longer contact you or see your profile. This action is currently permanent.
              </p>
            </div>

            <div className="p-6 bg-white border border-[#F3EFEA] rounded-[32px] space-y-3 shadow-sm">
              <div className="flex items-center gap-3 text-[#2D2926]">
                <Trash2 size={20} className="text-[#8C7E6E]" />
                <h4 className="font-bold">Unmatching</h4>
              </div>
              <p className="text-sm text-[#8C7E6E] leading-relaxed">
                Unmatching removes the chat from your active relationship flow. It is separate from reporting. If you need to report someone, do so before unmatching, or report directly from the chat.
              </p>
            </div>
          </div>
        </section>

        {/* Meeting Safely */}
        <section className="space-y-6">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#8C7E6E]">Meeting Safely</h3>
          <div className="p-6 bg-[#F7F2EE] border border-[#E5DED5] rounded-[32px] space-y-4">
            <ul className="space-y-3 text-sm text-[#2D2926] italic">
              <li className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
                <span>Meet in public, well-lit places for the first few dates.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
                <span>Tell a friend or family member where you are going.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
                <span>Never send money or share financial information.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
                <span>Trust your instincts. If something feels off, leave.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Emergency Contacts */}
        <section className="space-y-6">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#8C7E6E]">Emergency Support</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-6 bg-white border border-[#F3EFEA] rounded-[32px] flex flex-col items-center gap-3 shadow-sm hover:border-[#D4AF37]/30 transition-all">
              <div className="w-10 h-10 bg-[#F7F2EE] text-[#D4AF37] rounded-full flex items-center justify-center">
                <PhoneCall size={20} />
              </div>
              <span className="text-xs font-bold text-[#2D2926]">Call Police (100)</span>
            </button>
            <button className="p-6 bg-white border border-[#F3EFEA] rounded-[32px] flex flex-col items-center gap-3 shadow-sm hover:border-[#D4AF37]/30 transition-all">
              <div className="w-10 h-10 bg-[#F7F2EE] text-[#D4AF37] rounded-full flex items-center justify-center">
                <MessageSquare size={20} />
              </div>
              <span className="text-xs font-bold text-[#2D2926]">Contact Support</span>
            </button>
          </div>
        </section>

        {/* Reporting Tools */}
        <section className="space-y-6">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#8C7E6E]">Reporting Tools</h3>
          <div className="space-y-3">
            <button 
              onClick={() => setShowReportFlow(true)}
              className="w-full p-6 bg-white border border-[#F3EFEA] rounded-[32px] flex items-center justify-between shadow-sm hover:bg-[#F7F2EE] transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
                  <AlertTriangle size={20} />
                </div>
                <span className="font-bold text-[#2D2926]">Report an Issue</span>
              </div>
              <ArrowLeft size={18} className="text-[#8C7E6E] rotate-180 opacity-0 group-hover:opacity-100 transition-all" />
            </button>
          </div>
        </section>

        <div className="pt-8 text-center space-y-4">
          <p className="text-[10px] text-[#8C7E6E]/60 leading-relaxed max-w-[240px] mx-auto italic">
            Your safety reports are handled with complete discretion by our human moderation team.
          </p>
          <div className="h-px w-12 bg-[#2D2926] opacity-10 mx-auto" />
          <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#8C7E6E]">Kesher Trust Stack</p>
        </div>
      </div>

      <ReportFlow isOpen={showReportFlow} onClose={() => setShowReportFlow(false)} reporterId={user?.id} />
    </div>
  );
};
