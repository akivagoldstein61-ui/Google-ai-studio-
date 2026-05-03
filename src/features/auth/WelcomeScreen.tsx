import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Shield, Heart, Globe, Sparkles, Loader2, ExternalLink, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { auth } from '@/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import {
  getPrototypeDemoUrl,
  isCurrentDomainFirebaseAuthorized,
  redirectToCanonical,
} from '@/lib/prototypeMode';

export const WelcomeScreen: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const { language, setLanguage } = useApp();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [domainWarning, setDomainWarning] = useState(false);

  useEffect(() => {
    if (!isCurrentDomainFirebaseAuthorized()) {
      setDomainWarning(true);
    }
  }, []);

  const handleSignIn = async () => {
    if (!isCurrentDomainFirebaseAuthorized()) {
      redirectToCanonical();
      return;
    }

    setIsSigningIn(true);
    setSignInError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      const code: string = error?.code ?? 'unknown';
      console.error('Sign in failed', code, error);

      if (code === 'auth/unauthorized-domain') {
        redirectToCanonical();
        return;
      }

      let message =
        language === 'en'
          ? 'Sign in failed. Please try again.'
          : 'ההתחברות נכשלה. אנא נסה שנית.';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        message =
          language === 'en'
            ? 'Sign in was cancelled. Please try again.'
            : 'ההתחברות בוטלה. אנא נסה שנית.';
      } else if (code === 'auth/network-request-failed') {
        message =
          language === 'en'
            ? 'Network error. Please check your connection and try again.'
            : 'שגיאת רשת. אנא בדוק את החיבור שלך ונסה שנית.';
      }
      setSignInError(message);
      setIsSigningIn(false);
    }
  };

  const handleDemoMode = () => {
    if (typeof window === 'undefined') return;
    const localDemoUrl = new URL('/demo', window.location.origin);
    localDemoUrl.searchParams.set('demo', '1');
    window.location.assign(localDemoUrl.toString());
  };

  return (
    <div className="flex flex-col min-h-screen px-8 py-14 justify-between bg-[#FDFCFB] overflow-hidden relative">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-0 w-full h-[60%] bg-gradient-to-b from-[#F7F2EE] to-transparent" />
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.15 }}
          transition={{ duration: 3, ease: 'easeOut' }}
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

      {domainWarning && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-20 mb-4 flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800"
          role="alert"
        >
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />
          <div className="flex-1">
            <p className="font-semibold leading-snug">
              {language === 'en'
                ? 'Sign-in not available on this URL'
                : 'ההתחברות אינה זמינה בכתובת זו'}
            </p>
            <p className="mt-0.5 text-xs text-amber-700 leading-relaxed">
              {language === 'en'
                ? 'This preview URL is not authorized for Firebase Authentication. Open the official app or continue in demo mode.'
                : 'כתובת תצוגה מקדימה זו אינה מורשית ל-Firebase Authentication. פתח את האפליקציה הרשמית או המשך במצב דמו.'}
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              <button
                onClick={redirectToCanonical}
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 underline underline-offset-2 hover:text-amber-700"
              >
                {language === 'en' ? 'Open official app' : 'פתח את האפליקציה הרשמית'}
                <ExternalLink size={11} />
              </button>
              <button
                onClick={handleDemoMode}
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 underline underline-offset-2 hover:text-amber-700"
              >
                {language === 'en' ? 'View prototype demo' : 'צפה בדמו של הפרוטוטייפ'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

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
          <Button
            variant="ghost"
            className="w-full h-12 text-sm text-[#8C7E6E] hover:bg-[#F7F2EE] rounded-[24px] transition-all border border-[#F3EFEA]"
            onClick={handleDemoMode}
            disabled={isSigningIn}
          >
            {language === 'en' ? 'View prototype demo' : 'צפה בדמו של הפרוטוטייפ'}
          </Button>
          {domainWarning && (
            <a
              href={getPrototypeDemoUrl()}
              className="block text-center text-xs font-semibold text-[#8C7E6E] hover:text-[#2D2926] underline underline-offset-2"
            >
              {language === 'en' ? 'Preview URL? Open canonical demo mode instead' : 'בכתובת תצוגה מקדימה? פתח מצב דמו בכתובת הרשמית'}
            </a>
          )}
          {signInError && (
            <p className="text-sm text-red-600 text-center px-4" role="alert">
              {signInError}
            </p>
          )}
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
