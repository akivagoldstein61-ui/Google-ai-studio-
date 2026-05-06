import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { trustService } from '@/services/trustService';

export const ReportFlow: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  targetName?: string;
  contextSnippet?: string;
  reporterId?: string;
  targetId?: string;
}> = ({ isOpen, onClose, targetName, contextSnippet, reporterId, targetId }) => {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!reporterId) {
      console.error("Missing reporterId for report");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await trustService.report(reporterId, targetId, reason, note, contextSnippet);
      setStep(3);
    } catch (error) {
      console.error("Failed to submit report:", error);
      // In a real app, show a toast here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setReason('');
    setNote('');
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-sm bg-[#FDFCFB] rounded-[40px] p-8 space-y-6 relative max-h-[90vh] overflow-y-auto no-scrollbar"
        >
          <button onClick={handleClose} className="absolute top-6 right-6 p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
            <X size={20} className="text-[#2D2926]" />
          </button>

          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-[20px] flex items-center justify-center mb-4">
                  <AlertTriangle size={24} />
                </div>
                <h3 className="text-2xl font-serif italic text-[#2D2926]">Report {targetName || 'User'}</h3>
                <p className="text-sm text-[#8C7E6E] italic">Please select the reason for your report. This helps our team review it quickly.</p>
              </div>
              <div className="space-y-3">
                {[
                  'Inappropriate sexual content',
                  'Harassment or disrespect',
                  'Scam / payment solicitation',
                  'Fake identity / suspicious behavior',
                  'Safety concern',
                  'Other'
                ].map(r => (
                  <button
                    key={r}
                    onClick={() => { setReason(r); setStep(2); }}
                    className="w-full p-4 text-left bg-white border border-[#F3EFEA] rounded-[20px] font-bold text-[#2D2926] hover:border-[#D4AF37] hover:bg-[#FDFCFB] transition-all text-sm"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <button onClick={() => setStep(1)} className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E] hover:text-[#2D2926] transition-colors mb-2 block">
                  ← Back to reasons
                </button>
                <h3 className="text-2xl font-serif italic text-[#2D2926]">Add Details</h3>
                <p className="text-sm text-[#8C7E6E] italic">Reason: {reason}</p>
              </div>

              {contextSnippet && (
                <div className="p-4 bg-[#F7F2EE] rounded-[20px] border border-[#E5DED5]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E] mb-2">Context Included</p>
                  <p className="text-sm text-[#2D2926] italic line-clamp-3">"{contextSnippet}"</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#2D2926]">Additional Note (Optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Provide any extra details..."
                  className="w-full h-24 p-4 bg-white border border-[#F3EFEA] rounded-[20px] text-sm focus:outline-none focus:border-[#D4AF37] transition-all resize-none"
                />
              </div>

              <Button onClick={handleSubmit} className="w-full h-12 rounded-full bg-[#2D2926] text-white font-bold">
                Submit Report
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-serif italic text-[#2D2926]">Report Recorded</h3>
                <p className="text-sm text-[#8C7E6E] leading-relaxed italic">
                  Thanks. Your report has been recorded. We'll review it according to Kesher's safety process.
                </p>
              </div>
              <Button onClick={handleClose} className="w-full h-12 rounded-full bg-[#2D2926] text-white font-bold mt-4">
                Done
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
