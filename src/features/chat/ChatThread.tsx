import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Conversation, Message } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Send, ShieldCheck, Sparkles, X, Loader2, Info, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { aiService } from '@/services/aiService';
import { aiDatePlannerService } from '@/services/aiDatePlannerService';
import { aiSafetyService } from '@/services/aiSafetyService';
import { getFeatureById } from '@/ai/featureRegistry';
import { cn } from '@/lib/utils';

export const ChatThread: React.FC<{ 
  conversation: Conversation, 
  onBack: () => void 
}> = ({ conversation, onBack }) => {
  const { sendMessage } = useApp();
  const [inputText, setInputText] = useState('');
  const [isRephrasing, setIsRephrasing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [safetyAlert, setSafetyAlert] = useState<{ reason: string; suggestion: string } | null>(null);
  const [showSafetyTip, setShowSafetyTip] = useState(true);
  const [isPlanningDate, setIsPlanningDate] = useState(false);
  const [dateIdeas, setDateIdeas] = useState<any[]>([]);
  const [isGeneratingIcebreaker, setIsGeneratingIcebreaker] = useState(false);
  const [icebreakerPrompt, setIcebreakerPrompt] = useState('');
  const [showIcebreakerInput, setShowIcebreakerInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const icebreakerFeature = getFeatureById('visual_icebreaker');
  const isIcebreakerEnabled = icebreakerFeature?.category === 'core_enabled';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isScanning) return;
    
    // Safety Scan
    setIsScanning(true);
    try {
      const scanResult = await aiSafetyService.scanMessage({
        message_text: inputText,
        context: 'initial_chat'
      });
      
      if (!scanResult.is_safe) {
        setSafetyAlert({
          reason: scanResult.reason || 'Potential policy violation',
          suggestion: scanResult.suggestion || 'Try rephrasing to be more respectful.'
        });
        setIsScanning(false);
        return;
      }
    } catch (error) {
      console.error("Safety scan failed, proceeding with caution", error);
    } finally {
      setIsScanning(false);
    }

    sendMessage(conversation.id, inputText);
    setInputText('');
    setSafetyAlert(null);
  };

  const handleRephrase = async () => {
    if (!inputText.trim() || isRephrasing) return;
    setIsRephrasing(true);
    try {
      const rephrased = await aiService.rephraseMessage(inputText);
      setInputText(rephrased);
    } catch (error) {
      console.error(error);
    } finally {
      setIsRephrasing(false);
    }
  };

  const handleGenerateIcebreaker = async () => {
    if (!icebreakerPrompt.trim() || isGeneratingIcebreaker) return;
    setIsGeneratingIcebreaker(true);
    try {
      const imageUrl = await aiService.generateIcebreakerImage(icebreakerPrompt);
      if (imageUrl) {
        sendMessage(conversation.id, `[Visual Icebreaker]: ${icebreakerPrompt}`, true);
        // In a real app, we'd send the actual image
      }
      setIcebreakerPrompt('');
      setShowIcebreakerInput(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingIcebreaker(false);
    }
  };

  const handlePlanDate = async () => {
    setIsPlanningDate(true);
    try {
      const ideas = await aiDatePlannerService.planDate({
        area: 'Tel Aviv',
        time: 'Thursday Evening',
        preferences: 'Kosher, Quiet',
        budget: 'Moderate'
      });
      setDateIdeas(ideas.venues);
    } catch (error) {
      console.error(error);
    } finally {
      setIsPlanningDate(false);
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#F3EFEA]">
              <img src={conversation.participants[0].photos[0]} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#2D2926] text-sm">{conversation.participants[0].displayName}</span>
                {conversation.participants[0].isVerified && <ShieldCheck size={12} className="text-[#D4AF37]" />}
              </div>
              <span className="text-[9px] font-bold text-[#8C7E6E] uppercase tracking-widest">Active today</span>
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
          <Info size={20} className="text-[#2D2926]" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6 bg-[#FDFCFB]">
        <AnimatePresence>
          {safetyAlert && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-6 bg-red-50 border border-red-100 rounded-[32px] space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-red-600">Safety Alert</span>
                </div>
                <button onClick={() => setSafetyAlert(null)} className="p-1 hover:bg-red-100 rounded-full transition-all">
                  <X size={14} className="text-red-400" />
                </button>
              </div>
              <p className="text-xs text-red-800 font-medium">{safetyAlert.reason}</p>
              <p className="text-[11px] text-red-600 italic">{safetyAlert.suggestion}</p>
            </motion.div>
          )}

          {dateIdeas.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-emerald-50 border border-emerald-100 rounded-[32px] space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-600">
                  <Sparkles size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Date Suggestions</span>
                </div>
                <button onClick={() => setDateIdeas([])} className="p-1 hover:bg-emerald-100 rounded-full transition-all">
                  <X size={14} className="text-emerald-400" />
                </button>
              </div>
              <div className="space-y-3">
                {dateIdeas.map((idea, i) => (
                  <div key={i} className="p-4 bg-white rounded-2xl border border-emerald-100 shadow-sm">
                    <p className="font-bold text-sm text-emerald-900">{idea.venue}</p>
                    <p className="text-xs text-emerald-700 italic">{idea.activity}</p>
                    <p className="text-[10px] text-emerald-500 mt-1">{idea.why_it_works}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {showSafetyTip && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-6 bg-[#F7F2EE]/50 border border-[#E5DED5] rounded-[32px] space-y-3 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#D4AF37]">
                  <AlertCircle size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Safety Reminder</span>
                </div>
                <button onClick={() => setShowSafetyTip(false)} className="p-1 hover:bg-black/5 rounded-full transition-all">
                  <X size={14} className="text-[#8C7E6E]" />
                </button>
              </div>
              <p className="text-xs text-[#8C7E6E] leading-relaxed italic font-serif">
                Keep your personal contact info private for now. We recommend meeting in public places and sharing your plans with a friend.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col gap-4">
          {conversation.messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "max-w-[80%] p-5 rounded-[24px] text-sm leading-relaxed shadow-sm relative group",
                msg.senderId === 'me' 
                  ? "bg-[#2D2926] text-white self-end rounded-tr-none" 
                  : "bg-white border border-[#F3EFEA] text-[#2D2926] self-start rounded-tl-none"
              )}
            >
              {msg.aiAssisted && (
                <div className="absolute -top-2 -right-2 bg-[#D4AF37] text-white p-1 rounded-full shadow-lg">
                  <Sparkles size={10} />
                </div>
              )}
              <p className={cn(msg.senderId === 'me' ? "" : "italic font-serif")}>{msg.text}</p>
              <span className={cn(
                "text-[8px] font-bold uppercase tracking-widest mt-2 block opacity-40",
                msg.senderId === 'me' ? "text-right" : "text-left"
              )}>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <footer className="p-6 bg-white border-t border-[#F3EFEA] space-y-4 relative z-20">
        <AnimatePresence>
          {showIcebreakerInput && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="p-6 bg-[#F7F2EE] rounded-[32px] space-y-4 border border-[#E5DED5]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#D4AF37]">
                  <Sparkles size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Visual Icebreaker</span>
                </div>
                <button onClick={() => setShowIcebreakerInput(false)} className="p-1 hover:bg-black/5 rounded-full transition-all">
                  <X size={14} className="text-[#8C7E6E]" />
                </button>
              </div>
              <div className="flex gap-3">
                <input 
                  placeholder="Describe an illustration..." 
                  className="flex-1 bg-white border border-[#F3EFEA] rounded-full px-6 py-3 text-sm focus:outline-none focus:border-[#D4AF37] transition-all"
                  value={icebreakerPrompt}
                  onChange={(e) => setIcebreakerPrompt(e.target.value)}
                />
                <Button 
                  size="icon" 
                  onClick={handleGenerateIcebreaker}
                  disabled={!icebreakerPrompt.trim() || isGeneratingIcebreaker}
                  className="rounded-full bg-[#2D2926] text-white"
                >
                  {isGeneratingIcebreaker ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-3">
          <div className="flex-1 bg-[#F7F2EE] rounded-[32px] p-2 flex flex-col gap-2 transition-all focus-within:bg-white focus-within:ring-1 focus-within:ring-[#D4AF37]/30 border border-transparent focus-within:border-[#D4AF37]/30">
            <textarea 
              placeholder="Type a message..." 
              className="w-full bg-transparent border-none p-4 focus:ring-0 text-sm text-[#2D2926] placeholder:text-[#8C7E6E]/40 resize-none min-h-[56px] max-h-[120px] leading-relaxed italic font-serif"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <div className="flex justify-between items-center px-2 pb-2">
              <div className="flex gap-1">
                <button 
                  onClick={handleRephrase}
                  disabled={!inputText.trim() || isRephrasing || isScanning}
                  className="p-2 text-[#D4AF37] hover:bg-white rounded-full transition-all disabled:opacity-30"
                  title="AI Rephrase"
                >
                  {isRephrasing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                </button>
                {isIcebreakerEnabled && (
                  <button 
                    onClick={() => setShowIcebreakerInput(!showIcebreakerInput)}
                    className="p-2 text-[#D4AF37] hover:bg-white rounded-full transition-all"
                    title="Visual Icebreaker"
                  >
                    <Sparkles size={18} />
                  </button>
                )}
                <button 
                  onClick={handlePlanDate}
                  disabled={isPlanningDate}
                  className="p-2 text-[#D4AF37] hover:bg-white rounded-full transition-all"
                  title="Plan a Date"
                >
                  {isPlanningDate ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} className="rotate-12" />}
                </button>
              </div>
              {inputText.trim() && (
                <motion.button 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  onClick={handleSend}
                  disabled={isScanning}
                  className="w-10 h-10 bg-[#2D2926] text-white rounded-full flex items-center justify-center shadow-lg shadow-black/10 hover:bg-[#1A1816] transition-all disabled:opacity-50"
                >
                  {isScanning ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </motion.button>
              )}
            </div>
          </div>
        </div>
        
        <p className="text-center text-[8px] text-[#8C7E6E] font-bold uppercase tracking-[0.4em] opacity-40">Kesher • Trust-Forward Messaging</p>
      </footer>
    </div>
  );
};
