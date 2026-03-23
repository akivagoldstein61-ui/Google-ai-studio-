import React from 'react';
import { useApp } from '@/context/AppContext';
import { Conversation } from '@/types';
import { motion } from 'motion/react';
import { MessageCircle, ShieldCheck, Search, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export const InboxScreen: React.FC<{ onSelect: (conv: Conversation) => void }> = ({ onSelect }) => {
  const { conversations } = useApp();

  return (
    <div className="h-full flex flex-col px-6 py-4 space-y-6 overflow-hidden">
      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-serif italic text-[#2D2926]">Inbox</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">Meaningful conversations</p>
        </div>
        <button className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
          <Search size={20} className="text-[#2D2926]" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-20 space-y-8">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 opacity-40">
            <div className="w-16 h-16 bg-[#F7F2EE] text-[#8C7E6E] rounded-full flex items-center justify-center">
              <MessageCircle size={32} />
            </div>
            <p className="text-sm font-bold uppercase tracking-widest text-[#8C7E6E]">No conversations yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conv, i) => (
              <motion.button
                key={conv.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onSelect(conv)}
                className="w-full p-6 bg-white border border-[#F3EFEA] rounded-[32px] flex items-center gap-5 hover:border-[#D4AF37]/30 transition-all shadow-sm group relative overflow-hidden"
              >
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#F7F2EE] group-hover:border-[#D4AF37]/30 transition-all">
                    <img src={conv.participants[0].photos[0]} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  {conv.participants[0].isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-[#D4AF37] text-white p-1 rounded-full border-2 border-white">
                      <ShieldCheck size={10} />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-left space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#2D2926]">{conv.participants[0].displayName}</span>
                    <span className="text-[9px] font-bold text-[#8C7E6E] uppercase tracking-widest">
                      {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </span>
                  </div>
                  <p className="text-sm text-[#8C7E6E] line-clamp-1 italic font-serif">
                    {conv.lastMessage ? conv.lastMessage.text : "You've matched! Start a conversation."}
                  </p>
                </div>

                <div className="shrink-0 text-[#D4AF37] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                  <ArrowRight size={20} />
                </div>
                
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 blur-3xl -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            ))}
          </div>
        )}

        <div className="p-8 bg-[#F7F2EE]/50 border border-[#E5DED5] rounded-[40px] space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
            <Sparkles size={16} />
            <span>AI Safety Tip</span>
          </div>
          <p className="text-xs text-[#8C7E6E] leading-relaxed italic font-serif">
            "We prioritize your safety. If a conversation feels uncomfortable, you can report or block at any time. We recommend keeping early conversations within the app."
          </p>
        </div>
      </div>
    </div>
  );
};
