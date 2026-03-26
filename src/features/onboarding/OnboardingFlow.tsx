import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Phone, Mail, Check, Shield, Heart, Sparkles, Loader2 } from 'lucide-react';
import { ProfileBuilder } from '@/components/onboarding/ProfileBuilder';
import { cn } from '@/lib/utils';

export const OnboardingFlow: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    goal: '',
    observance: '',
    displayName: '',
    age: '',
    city: '',
    photos: [],
    prompts: [],
    bio: ''
  });
  const { language, verifyAge, acceptTerms } = useApp();

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const updateData = (data: any) => setFormData(prev => ({ ...prev, ...data }));

  const handlePhoneSubmit = async () => {
    setLoading(true);
    // Simulate phone auth
    setTimeout(() => {
      setLoading(false);
      nextStep();
    }, 1500);
  };

  const totalSteps = 5;

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col overflow-hidden relative">
      <header className="px-6 pt-14 pb-6 flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-[#F3EFEA] relative z-20">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={step <= 1 ? undefined : prevStep} 
          className={cn("transition-all rounded-full hover:bg-[#F7F2EE]", step <= 1 ? 'opacity-0 pointer-events-none' : 'opacity-100')}
        >
          <ArrowLeft size={20} className="text-[#2D2926]" />
        </Button>
        
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "h-1.5 rounded-full transition-all duration-700 ease-out",
                i + 1 === step ? "w-10 bg-[#2D2926]" : i + 1 < step ? "w-3 bg-[#D4AF37]" : "w-3 bg-[#F3EFEA]"
              )} 
            />
          ))}
        </div>
        <div className="w-10" />
      </header>

      <main className="flex-1 overflow-y-auto relative z-10 no-scrollbar">
        <div className="max-w-md mx-auto px-8 py-12 h-full">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div 
                key="step0"
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -30 }}
                className="space-y-12 flex flex-col h-full"
              >
                <div className="space-y-8 flex-1">
                  <div className="w-20 h-20 bg-[#F7F2EE] text-[#D4AF37] rounded-[32px] flex items-center justify-center shadow-sm rotate-3">
                    <Shield size={36} />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-4xl font-serif italic tracking-tight text-[#2D2926]">Welcome to Kesher</h2>
                    <p className="text-[#8C7E6E] leading-relaxed text-lg italic">A refined space for serious Jewish singles. Before we begin, we need to ensure our community standards.</p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <div className="flex gap-5 p-6 bg-white rounded-[32px] border border-[#F3EFEA] shadow-sm">
                      <div className="w-7 h-7 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={16} />
                      </div>
                      <p className="text-sm font-semibold text-[#2D2926] leading-relaxed">I am at least 18 years old.</p>
                    </div>
                    <div className="flex gap-5 p-6 bg-white rounded-[32px] border border-[#F3EFEA] shadow-sm">
                      <div className="w-7 h-7 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={16} />
                      </div>
                      <p className="text-sm font-semibold text-[#2D2926] leading-relaxed">I agree to the Terms of Service and Privacy Policy, prioritizing respect and honesty.</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <Button className="w-full h-16 text-lg font-bold rounded-[24px] bg-[#2D2926] text-white hover:bg-[#1A1816] shadow-xl shadow-black/10 transition-all" onClick={() => {
                    verifyAge();
                    acceptTerms();
                    nextStep();
                  }}>
                    I Agree & Continue
                  </Button>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1 h-1 bg-[#D4AF37] rounded-full" />
                    <p className="text-[10px] text-center text-[#8C7E6E] uppercase tracking-[0.3em] font-bold">Safe • Private • Intentional</p>
                    <div className="w-1 h-1 bg-[#D4AF37] rounded-full" />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 30 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -30 }}
                className="space-y-12"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 bg-[#F7F2EE] text-[#D4AF37] rounded-[24px] flex items-center justify-center shadow-sm">
                    <Phone size={28} />
                  </div>
                  <h2 className="text-3xl font-serif italic tracking-tight text-[#2D2926]">Verify your identity</h2>
                  <p className="text-[#8C7E6E] leading-relaxed italic">We use phone verification to ensure a community of real people. No bots, no fakes.</p>
                </div>
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C7E6E] px-1">Phone Number</label>
                    <input 
                      placeholder="+972 50 000 0000" 
                      type="tel" 
                      className="w-full px-6 py-4 bg-white border border-[#F3EFEA] rounded-[24px] text-lg focus:outline-none focus:border-[#D4AF37] transition-all shadow-sm"
                      value={formData.phone}
                      onChange={(e) => updateData({ phone: e.target.value })}
                    />
                  </div>
                  <Button 
                    className="w-full h-16 text-lg font-bold rounded-[24px] bg-[#2D2926] text-white hover:bg-[#1A1816] shadow-xl shadow-black/10 transition-all" 
                    onClick={handlePhoneSubmit} 
                    disabled={!formData.phone || loading}
                  >
                    {loading ? <Loader2 className="animate-spin" /> : 'Send Verification Code'}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 30 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -30 }}
                className="space-y-12"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 bg-[#F7F2EE] text-[#D4AF37] rounded-[24px] flex items-center justify-center shadow-sm">
                    <Heart size={28} />
                  </div>
                  <h2 className="text-3xl font-serif italic tracking-tight text-[#2D2926]">What is your goal?</h2>
                  <p className="text-[#8C7E6E] leading-relaxed italic">Be clear about what you are looking for. Intent matters here.</p>
                </div>
                <div className="grid gap-5">
                  {[
                    { id: 'marriage', label: 'Marriage', desc: 'Looking for my life partner' },
                    { id: 'long_term', label: 'Long-term relationship', desc: 'Serious dating with a future' },
                    { id: 'open_to_possibilities', label: 'Open to possibilities', desc: 'Exploring where things go' }
                  ].map(goal => (
                    <motion.button 
                      key={goal.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { updateData({ goal: goal.id }); nextStep(); }}
                      className={cn(
                        "w-full p-8 text-left bg-white border rounded-[32px] transition-all shadow-sm relative group overflow-hidden",
                        formData.goal === goal.id ? "border-[#D4AF37] ring-1 ring-[#D4AF37]" : "border-[#F3EFEA] hover:border-[#D4AF37]/30"
                      )}
                    >
                      <div className="flex justify-between items-center relative z-10">
                        <div className="space-y-2">
                          <span className="font-bold text-xl block text-[#2D2926]">{goal.label}</span>
                          <span className="text-sm text-[#8C7E6E] font-medium">{goal.desc}</span>
                        </div>
                        {formData.goal === goal.id && (
                          <div className="w-8 h-8 bg-[#D4AF37] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#D4AF37]/20">
                            <Check size={18} />
                          </div>
                        )}
                      </div>
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 blur-3xl -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 30 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -30 }}
                className="space-y-12"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 bg-[#F7F2EE] text-[#D4AF37] rounded-[24px] flex items-center justify-center shadow-sm">
                    <Sparkles size={28} />
                  </div>
                  <h2 className="text-3xl font-serif italic tracking-tight text-[#2D2926]">Religious Observance</h2>
                  <p className="text-[#8C7E6E] leading-relaxed italic">This helps us find compatible matches for your lifestyle and values.</p>
                </div>
                <div className="grid gap-4">
                  {[
                    { id: 'secular', label: 'Secular', desc: 'Hiloni' },
                    { id: 'traditional', label: 'Traditional', desc: 'Masorti' },
                    { id: 'modern_orthodox', label: 'Modern Orthodox', desc: 'Dati Leumi' },
                    { id: 'dati', label: 'Religious', desc: 'Dati' },
                    { id: 'ultra_orthodox', label: 'Ultra Orthodox', desc: 'Haredi' }
                  ].map(level => (
                    <motion.button 
                      key={level.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { updateData({ observance: level.id }); nextStep(); }}
                      className={cn(
                        "w-full p-6 text-left bg-white border rounded-[24px] transition-all flex justify-between items-center group shadow-sm",
                        formData.observance === level.id ? "border-[#D4AF37] ring-1 ring-[#D4AF37]" : "border-[#F3EFEA] hover:border-[#D4AF37]/30"
                      )}
                    >
                      <div className="space-y-1">
                        <span className="font-bold block text-[#2D2926]">{level.label}</span>
                        <span className="text-[10px] text-[#8C7E6E] font-bold uppercase tracking-[0.2em] opacity-60">{level.desc}</span>
                      </div>
                      {formData.observance === level.id && (
                        <div className="w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center text-white">
                          <Check size={14} />
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 30 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -30 }}
                className="space-y-12"
              >
                <div className="space-y-4">
                  <h2 className="text-3xl font-serif italic tracking-tight text-[#2D2926]">Basic Details</h2>
                  <p className="text-[#8C7E6E] leading-relaxed italic">Let's get the essentials out of the way.</p>
                </div>
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C7E6E] px-1">First Name</label>
                    <input 
                      placeholder="Your name" 
                      className="w-full px-6 py-4 bg-white border border-[#F3EFEA] rounded-[24px] text-lg focus:outline-none focus:border-[#D4AF37] transition-all shadow-sm"
                      value={formData.displayName}
                      onChange={(e) => updateData({ displayName: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C7E6E] px-1">Age</label>
                      <input 
                        type="number" 
                        placeholder="24" 
                        className="w-full px-6 py-4 bg-white border border-[#F3EFEA] rounded-[24px] text-lg focus:outline-none focus:border-[#D4AF37] transition-all shadow-sm"
                        value={formData.age}
                        onChange={(e) => updateData({ age: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C7E6E] px-1">City</label>
                      <input 
                        placeholder="Tel Aviv" 
                        className="w-full px-6 py-4 bg-white border border-[#F3EFEA] rounded-[24px] text-lg focus:outline-none focus:border-[#D4AF37] transition-all shadow-sm"
                        value={formData.city}
                        onChange={(e) => updateData({ city: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button className="w-full h-16 text-lg font-bold rounded-[24px] bg-[#2D2926] text-white hover:bg-[#1A1816] shadow-xl shadow-black/10 transition-all mt-4" onClick={nextStep} disabled={!formData.displayName || !formData.age || !formData.city}>
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div 
                key="step5"
                initial={{ opacity: 0, x: 30 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -30 }}
              >
                <ProfileBuilder 
                  onComplete={() => onComplete()}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
