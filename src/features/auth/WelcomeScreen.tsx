import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Shield, Heart, Globe, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { auth } from '@/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export const WelcomeScreen: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const { language, setLanguage } = useApp();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      // AppContext will handle the auth state change and call onNext if needed,
      // but since AppContext sets user and re-renders, this component will unmount.
    } catch (error) {
      console.error("Sign in failed", error);
      setIsSigningIn(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen px-8 py-14 justify-between bg-[#FDFCFB] overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-[60%] bg-gradient-to-b from-[#F7F2EE] to-transparent" />
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.15 }}
          transition={{ duration: 3, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1000" 
            className="w-full h-full object-cover grayscale opacity-40"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        <div className="absolute bottom-0 left-0 w-full h-[40%] bg-gradient-to-t from-[#FDFCFB] to-transparent" />
      </div>
      
      <header className="flex justify-between items-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-[#2D2926] rounded-[14px] flex items-center justify-center shadow-lg shadow-black/10">
            <Heart className="text-[#D4AF37]" size={20} fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold tracking-tighter text-[#2D2926]">KESHER</h1>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLanguage(language === 'en' ? 'he' : 'en')}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C7E6E] hover:bg-[#F7F2EE] rounded-full px-4"
          >
            <Globe size={14} />
            <span>{language === 'en' ? 'עברית' : 'English'}</span>
          </Button>
        </motion.div>
      </header>

      <main className="space-y-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8"
        >
          <div className="space-y-2">
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-[11px] font-bold uppercase tracking-[0.4em] text-[#D4AF37]"
            >
              {language === 'en' ? 'Welcome to Kesher' : 'ברוכים הבאים לקשר'}
            </motion.span>
            <h2 className="text-[72px] font-serif italic leading-[0.85] tracking-tight text-[#2D2926]">
              {language === 'en' ? 'Dating with intent.' : 'היכרויות עם כוונה.'}
            </h2>
          </div>
          <div className="h-px w-16 bg-[#2D2926] opacity-10" />
          <div className="space-y-4">
            <p className="text-xl text-[#8C7E6E] leading-relaxed max-w-[320px] font-medium italic">
              {language === 'en' 
                ? 'A refined space for serious Jewish singles in Israel.' 
                : 'מרחב מעודן לרווקים ורווקות יהודים בישראל.'}
            </p>
            <p className="text-sm text-[#8C7E6E] leading-relaxed max-w-[320px]">
              {language === 'en'
                ? 'Fewer, more intentional introductions. Guided by your private taste profile.'
                : 'פחות היכרויות, יותר כוונה. מודרך על ידי פרופיל הטעם הפרטי שלך.'}
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-center gap-2 text-[#8C7E6E] pb-2">
            <Sparkles size={14} className="text-[#D4AF37]" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              {language === 'en' ? 'Private AI • You stay in control' : 'בינה מלאכותית פרטית • אתה בשליטה'}
            </span>
          </div>
          <Button 
            className="w-full h-16 text-lg bg-[#2D2926] text-white hover:bg-[#1A1816] rounded-[24px] shadow-xl shadow-black/10 transition-all active:scale-[0.98]" 
            onClick={handleSignIn}
            disabled={isSigningIn}
          >
            {isSigningIn ? <Loader2 className="animate-spin" /> : (language === 'en' ? 'Begin your journey' : 'התחל את המסע')}
          </Button>
          <Button 
            variant="ghost" 
            className="w-full h-16 text-lg text-[#2D2926] hover:bg-[#F7F2EE] rounded-[24px] transition-all"
            onClick={handleSignIn}
            disabled={isSigningIn}
          >
            {language === 'en' ? 'Sign In' : 'התחבר'}
          </Button>
        </motion.div>
      </main>

      <footer className="space-y-8 text-center relative z-10">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-center gap-3 text-[#8C7E6E]">
            <Shield size={16} className="text-[#D4AF37]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Trust & Safety First</span>
          </div>
          <p className="text-[10px] text-[#8C7E6E]/50 px-10 leading-relaxed max-w-sm mx-auto">
            By continuing, you agree to our Terms of Service and Privacy Policy. We value your discretion and safety above all.
          </p>
        </div>
        
        <div className="flex justify-center gap-8">
          <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/30" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/30" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/30" />
        </div>
      </footer>
    </div>
  );
};
