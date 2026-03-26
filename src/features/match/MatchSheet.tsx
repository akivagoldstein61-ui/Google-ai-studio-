import React from 'react';
import { Profile } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageCircle, X, Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const MatchSheet: React.FC<{ 
  profile: Profile, 
  onClose: () => void,
  onMessage: () => void
}> = ({ profile, onClose, onMessage }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-[#2D2926]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center"
    >
      <button 
        onClick={onClose}
        className="absolute top-14 right-8 p-3 bg-white/10 backdrop-blur-xl rounded-full text-white border border-white/20 hover:bg-white/20 transition-all"
      >
        <X size={24} />
      </button>

      <div className="space-y-12 w-full max-w-sm">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className="relative"
        >
          <div className="flex justify-center -space-x-8">
            <div className="w-32 h-32 rounded-full border-4 border-[#D4AF37] overflow-hidden shadow-2xl shadow-black/20 rotate-[-6deg]">
              <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="w-32 h-32 rounded-full border-4 border-[#D4AF37] overflow-hidden shadow-2xl shadow-black/20 rotate-[6deg]">
              <img src={profile.photos[0]} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center text-white shadow-xl shadow-[#D4AF37]/40">
            <Heart size={32} fill="currentColor" />
          </div>
        </motion.div>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.4em] text-[#D4AF37]">
            <Sparkles size={16} />
            <span>It's a connection</span>
          </div>
          <h2 className="text-5xl font-serif italic text-white leading-tight">You and {profile.displayName}</h2>
          <p className="text-white/60 text-lg leading-relaxed italic max-w-[280px] mx-auto">
            A connection based on shared values and serious intent.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[40px] space-y-4">
          <div className="flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-widest text-[#D4AF37]">
            <ShieldCheck size={14} />
            <span>Trust Insight</span>
          </div>
          <p className="text-sm text-white/80 leading-relaxed italic font-serif">
            "You both prioritize {profile.tags[0].toLowerCase()} and have verified your identities. A great foundation for a first conversation."
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <Button 
            onClick={onMessage}
            className="w-full h-16 text-lg font-bold rounded-[24px] bg-white text-[#2D2926] hover:bg-[#F7F2EE] shadow-xl shadow-black/20 transition-all active:scale-[0.98] gap-3"
          >
            <MessageCircle size={24} />
            Send a message
          </Button>
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="w-full h-16 text-lg text-white/60 hover:text-white hover:bg-white/5 rounded-[24px] transition-all"
          >
            Keep exploring
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
