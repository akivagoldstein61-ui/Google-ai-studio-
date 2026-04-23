import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, UserX, Trash2, X } from 'lucide-react';

export const SafetyMenu: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onReport: () => void;
  onBlock: () => void;
  onUnmatch?: () => void;
  targetName: string;
}> = ({ isOpen, onClose, onReport, onBlock, onUnmatch, targetName }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4 sm:p-8"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-sm bg-[#FDFCFB] rounded-t-[40px] sm:rounded-[40px] p-8 space-y-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-serif italic text-[#2D2926]">Safety Options</h3>
            <button onClick={onClose} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
              <X size={20} className="text-[#2D2926]" />
            </button>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => { onClose(); onReport(); }}
              className="w-full p-5 bg-white border border-[#F3EFEA] rounded-[24px] flex items-center gap-4 hover:border-amber-200 hover:bg-amber-50 transition-all group"
            >
              <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                <AlertTriangle size={20} />
              </div>
              <div className="text-left">
                <span className="block font-bold text-[#2D2926]">Report {targetName}</span>
                <span className="block text-xs text-[#8C7E6E] italic mt-0.5">Notify our safety team</span>
              </div>
            </button>

            <button
              onClick={() => { onClose(); onBlock(); }}
              className="w-full p-5 bg-white border border-[#F3EFEA] rounded-[24px] flex items-center gap-4 hover:border-red-200 hover:bg-red-50 transition-all group"
            >
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center group-hover:bg-red-100 transition-colors">
                <UserX size={20} />
              </div>
              <div className="text-left">
                <span className="block font-bold text-[#2D2926]">Block {targetName}</span>
                <span className="block text-xs text-[#8C7E6E] italic mt-0.5">They won't be able to contact you</span>
              </div>
            </button>

            {onUnmatch && (
              <button
                onClick={() => { onClose(); onUnmatch(); }}
                className="w-full p-5 bg-white border border-[#F3EFEA] rounded-[24px] flex items-center gap-4 hover:bg-[#F7F2EE] transition-all group"
              >
                <div className="w-10 h-10 bg-[#F7F2EE] text-[#8C7E6E] rounded-full flex items-center justify-center group-hover:bg-[#E5DED5] transition-colors">
                  <Trash2 size={20} />
                </div>
                <div className="text-left">
                  <span className="block font-bold text-[#2D2926]">Unmatch</span>
                  <span className="block text-xs text-[#8C7E6E] italic mt-0.5">Remove from your matches</span>
                </div>
              </button>
            )}
          </div>
          
          <p className="text-center text-[10px] text-[#8C7E6E] italic px-4">
            Your safety and discretion matter here. Actions are handled securely.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
