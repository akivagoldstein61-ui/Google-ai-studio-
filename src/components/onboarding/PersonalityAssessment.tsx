import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { Brain, ChevronRight, Check, AlertCircle } from 'lucide-react';

// Using public domain IPIP items for a short-form Big Five + 10 Aspects assessment.
const QUESTIONS = [
  // Extraversion
  { id: 'e_ent1', domain: 'Extraversion', aspect: 'Enthusiasm', text: 'I make friends easily.', reverse: false },
  { id: 'e_ent2', domain: 'Extraversion', aspect: 'Enthusiasm', text: 'I keep in the background.', reverse: true },
  { id: 'e_ass1', domain: 'Extraversion', aspect: 'Assertiveness', text: 'I take charge.', reverse: false },
  { id: 'e_ass2', domain: 'Extraversion', aspect: 'Assertiveness', text: 'I wait for others to lead the way.', reverse: true },
  // Neuroticism
  { id: 'n_vol1', domain: 'Neuroticism', aspect: 'Volatility', text: 'I get angry easily.', reverse: false },
  { id: 'n_vol2', domain: 'Neuroticism', aspect: 'Volatility', text: 'I rarely get irritated.', reverse: true },
  { id: 'n_wit1', domain: 'Neuroticism', aspect: 'Withdrawal', text: 'I am filled with doubts about things.', reverse: false },
  { id: 'n_wit2', domain: 'Neuroticism', aspect: 'Withdrawal', text: 'I feel comfortable with myself.', reverse: true },
  // Agreeableness
  { id: 'a_com1', domain: 'Agreeableness', aspect: 'Compassion', text: 'I feel others\' emotions.', reverse: false },
  { id: 'a_com2', domain: 'Agreeableness', aspect: 'Compassion', text: 'I am not interested in other people\'s problems.', reverse: true },
  { id: 'a_pol1', domain: 'Agreeableness', aspect: 'Politeness', text: 'I respect authority.', reverse: false },
  { id: 'a_pol2', domain: 'Agreeableness', aspect: 'Politeness', text: 'I believe that I am better than others.', reverse: true },
  // Conscientiousness
  { id: 'c_ind1', domain: 'Conscientiousness', aspect: 'Industriousness', text: 'I carry out my plans.', reverse: false },
  { id: 'c_ind2', domain: 'Conscientiousness', aspect: 'Industriousness', text: 'I waste my time.', reverse: true },
  { id: 'c_ord1', domain: 'Conscientiousness', aspect: 'Orderliness', text: 'I like order.', reverse: false },
  { id: 'c_ord2', domain: 'Conscientiousness', aspect: 'Orderliness', text: 'I leave my belongings around.', reverse: true },
  // Openness
  { id: 'o_int1', domain: 'Openness', aspect: 'Intellect', text: 'I am quick to understand things.', reverse: false },
  { id: 'o_int2', domain: 'Openness', aspect: 'Intellect', text: 'I have difficulty understanding abstract ideas.', reverse: true },
  { id: 'o_ope1', domain: 'Openness', aspect: 'Openness', text: 'I enjoy the beauty of nature.', reverse: false },
  { id: 'o_ope2', domain: 'Openness', aspect: 'Openness', text: 'I do not like art.', reverse: true },
];

const OPTIONS = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
];

export const PersonalityAssessment: React.FC<{ onComplete: (scores: Record<string, number>) => void }> = ({ onComplete }) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleAnswer = (value: number) => {
    const currentQ = QUESTIONS[currentIndex];
    setAnswers(prev => ({ ...prev, [currentQ.id]: value }));
    
    if (currentIndex < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentIndex(prev => prev + 1), 300);
    }
  };

  const handleComplete = () => {
    // Deterministic scoring pipeline
    const scores: Record<string, number> = {};
    const counts: Record<string, number> = {};

    QUESTIONS.forEach(q => {
      if (answers[q.id]) {
        let val = answers[q.id];
        if (q.reverse) {
          val = 6 - val; // Reverse score (1->5, 5->1)
        }
        
        // Domain score
        scores[q.domain] = (scores[q.domain] || 0) + val;
        counts[q.domain] = (counts[q.domain] || 0) + 1;
        
        // Aspect score
        const aspectKey = `${q.domain}_${q.aspect}`;
        scores[aspectKey] = (scores[aspectKey] || 0) + val;
        counts[aspectKey] = (counts[aspectKey] || 0) + 1;
      }
    });

    // Convert to 0-100 percentile approximation
    const finalScores: Record<string, number> = {};
    Object.keys(scores).forEach(key => {
      const avg = scores[key] / counts[key];
      // Map 1-5 to 0-100
      finalScores[key] = Math.round(((avg - 1) / 4) * 100);
    });

    onComplete(finalScores);
  };

  if (!hasStarted) {
    return (
      <div className="p-8 bg-white border border-[#F3EFEA] rounded-[32px] space-y-6 shadow-sm">
        <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center text-[#D4AF37]">
          <Brain size={32} />
        </div>
        <div className="space-y-4">
          <h3 className="text-2xl font-serif italic text-[#2D2926]">Dating Style Profile</h3>
          <p className="text-sm text-[#8C7E6E] leading-relaxed">
            This short reflection helps us understand how you approach relationships. 
            It is <strong>private by default</strong> and is used to provide you with insights and communication suggestions, not to rank you or determine your "soulmate."
          </p>
          <div className="p-4 bg-[#F7F2EE] rounded-2xl flex gap-3 items-start">
            <AlertCircle size={16} className="text-[#8C7E6E] shrink-0 mt-0.5" />
            <p className="text-xs text-[#8C7E6E] leading-relaxed">
              This is a reflective tool, not a clinical diagnosis. You control what this influences, and you can reset or delete your profile at any time.
            </p>
          </div>
        </div>
        <Button 
          onClick={() => setHasStarted(true)}
          className="w-full h-14 rounded-full bg-[#2D2926] text-white hover:bg-[#1A1816] font-bold uppercase tracking-widest text-xs"
        >
          Begin Reflection
        </Button>
      </div>
    );
  }

  const currentQ = QUESTIONS[currentIndex];
  const isComplete = Object.keys(answers).length === QUESTIONS.length;

  if (isComplete) {
    return (
      <div className="p-8 bg-white border border-[#F3EFEA] rounded-[32px] space-y-6 shadow-sm text-center">
        <div className="w-16 h-16 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto text-[#D4AF37]">
          <Check size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-serif italic text-[#2D2926]">Reflection Complete</h3>
          <p className="text-sm text-[#8C7E6E] italic">Thank you for sharing. We're generating your private profile.</p>
        </div>
        <Button 
          onClick={handleComplete}
          className="w-full h-14 rounded-full bg-[#2D2926] text-white hover:bg-[#1A1816] font-bold uppercase tracking-widest text-xs"
        >
          View Private Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white border border-[#F3EFEA] rounded-[32px] space-y-8 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#D4AF37]">
          <Brain size={18} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Dating Style</span>
        </div>
        <span className="text-xs text-[#8C7E6E] font-mono">{currentIndex + 1} / {QUESTIONS.length}</span>
      </div>

      <div className="w-full h-1.5 bg-[#F7F2EE] rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-[#D4AF37] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex) / QUESTIONS.length) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-8 min-h-[200px]"
        >
          <h4 className="text-xl font-serif italic text-[#2D2926] text-center leading-relaxed">
            "{currentQ.text}"
          </h4>

          <div className="space-y-2">
            {OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleAnswer(opt.value)}
                className={`w-full p-4 rounded-2xl border text-sm transition-all ${
                  answers[currentQ.id] === opt.value 
                    ? 'border-[#D4AF37] bg-[#D4AF37]/5 text-[#D4AF37] font-bold' 
                    : 'border-[#F3EFEA] text-[#8C7E6E] hover:border-[#D4AF37]/30 hover:bg-[#F7F2EE]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
