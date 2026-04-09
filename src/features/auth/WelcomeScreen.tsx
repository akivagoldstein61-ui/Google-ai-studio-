import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Shield, Heart, Globe, Loader2, ArrowLeft, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  ConfirmationResult,
} from 'firebase/auth';
import { auth } from '@/firebase';

type AuthStep = 'welcome' | 'phone' | 'otp' | 'email';

export const WelcomeScreen: React.FC = () => {
  const { language, setLanguage } = useApp();

  const [step, setStep] = useState<AuthStep>('welcome');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const confirmationRef = useRef<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement | null>(null);

  // Clean up recaptcha on unmount
  useEffect(() => {
    return () => {
      if (recaptchaRef.current) {
        recaptchaRef.current.clear();
        recaptchaRef.current = null;
      }
    };
  }, []);

  const handlePhoneSubmit = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    setError('');

    try {
      // Create invisible recaptcha verifier
      if (!recaptchaRef.current && recaptchaContainerRef.current) {
        recaptchaRef.current = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
          size: 'invisible',
        });
      }

      const confirmation = await signInWithPhoneNumber(auth, phone, recaptchaRef.current!);
      confirmationRef.current = confirmation;
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (!otp.trim() || !confirmationRef.current) return;
    setLoading(true);
    setError('');

    try {
      await confirmationRef.current.confirm(otp);
      // onAuthStateChanged in AppContext handles the rest
    } catch (err: any) {
      setError(err.message || 'Invalid verification code. Please try again.');
      setLoading(false);
    }
  };

  const handleEmailSubmit = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError('');

    try {
      // Try sign-in first, fall back to sign-up for new users
      await signInWithEmailAndPassword(auth, email, password);
    } catch (signInErr: any) {
      if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
        } catch (signUpErr: any) {
          setError(signUpErr.message || 'Failed to create account. Please try again.');
          setLoading(false);
          return;
        }
      } else {
        setError(signInErr.message || 'Sign-in failed. Please try again.');
        setLoading(false);
        return;
      }
    }
    // onAuthStateChanged in AppContext handles the rest
  };

  return (
    <div className="flex flex-col min-h-screen px-8 py-14 justify-between bg-[#FDFCFB] overflow-hidden relative">
      {/* Invisible recaptcha container */}
      <div ref={recaptchaContainerRef} />

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
          {step !== 'welcome' ? (
            <button
              onClick={() => { setStep('welcome'); setError(''); }}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F7F2EE] transition-all"
            >
              <ArrowLeft size={20} className="text-[#2D2926]" />
            </button>
          ) : (
            <div className="w-10 h-10 bg-[#2D2926] rounded-[14px] flex items-center justify-center shadow-lg shadow-black/10">
              <Heart className="text-[#D4AF37]" size={20} fill="currentColor" />
            </div>
          )}
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
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
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
              <p className="text-xl text-[#8C7E6E] leading-relaxed max-w-[320px] font-medium italic">
                {language === 'en'
                  ? 'A refined space for serious Jewish singles in Israel.'
                  : 'מרחב מעודן לרווקים ורווקות יהודים בישראל.'}
              </p>
            </motion.div>
          )}

          {step === 'phone' && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 bg-[#F7F2EE] text-[#D4AF37] rounded-[24px] flex items-center justify-center shadow-sm">
                  <Phone size={28} />
                </div>
                <h2 className="text-3xl font-serif italic tracking-tight text-[#2D2926]">
                  {language === 'en' ? 'Enter your phone number' : 'הזינו מספר טלפון'}
                </h2>
                <p className="text-[#8C7E6E] leading-relaxed italic">
                  {language === 'en' ? "We'll send you a verification code." : 'נשלח לך קוד אימות.'}
                </p>
              </div>
              <div className="space-y-4">
                <input
                  type="tel"
                  placeholder="+972 50 000 0000"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setError(''); }}
                  className="w-full px-6 py-4 bg-white border border-[#F3EFEA] rounded-[24px] text-lg focus:outline-none focus:border-[#D4AF37] transition-all shadow-sm"
                />
                {error && <p className="text-red-500 text-sm px-2">{error}</p>}
              </div>
            </motion.div>
          )}

          {step === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-3xl font-serif italic tracking-tight text-[#2D2926]">
                  {language === 'en' ? 'Enter verification code' : 'הזינו קוד אימות'}
                </h2>
                <p className="text-[#8C7E6E] leading-relaxed italic">
                  {language === 'en' ? `Code sent to ${phone}` : `קוד נשלח ל${phone}`}
                </p>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
                  className="w-full px-6 py-4 bg-white border border-[#F3EFEA] rounded-[24px] text-lg text-center tracking-[0.5em] focus:outline-none focus:border-[#D4AF37] transition-all shadow-sm"
                />
                {error && <p className="text-red-500 text-sm px-2">{error}</p>}
              </div>
            </motion.div>
          )}

          {step === 'email' && (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <div className="w-14 h-14 bg-[#F7F2EE] text-[#D4AF37] rounded-[24px] flex items-center justify-center shadow-sm">
                  <Mail size={28} />
                </div>
                <h2 className="text-3xl font-serif italic tracking-tight text-[#2D2926]">
                  {language === 'en' ? 'Sign in with email' : 'התחבר עם אימייל'}
                </h2>
                <p className="text-[#8C7E6E] leading-relaxed italic">
                  {language === 'en' ? 'Enter your email and password. New users will be registered automatically.' : 'הזינו אימייל וסיסמה.'}
                </p>
              </div>
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder={language === 'en' ? 'Email address' : 'כתובת אימייל'}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="w-full px-6 py-4 bg-white border border-[#F3EFEA] rounded-[24px] text-lg focus:outline-none focus:border-[#D4AF37] transition-all shadow-sm"
                />
                <input
                  type="password"
                  placeholder={language === 'en' ? 'Password' : 'סיסמה'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full px-6 py-4 bg-white border border-[#F3EFEA] rounded-[24px] text-lg focus:outline-none focus:border-[#D4AF37] transition-all shadow-sm"
                />
                {error && <p className="text-red-500 text-sm px-2">{error}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          {step === 'welcome' && (
            <>
              <Button
                className="w-full h-16 text-lg bg-[#2D2926] text-white hover:bg-[#1A1816] rounded-[24px] shadow-xl shadow-black/10 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                onClick={() => setStep('phone')}
              >
                <Phone size={20} />
                {language === 'en' ? 'Begin with phone' : 'התחל עם טלפון'}
              </Button>
              <Button
                variant="ghost"
                className="w-full h-16 text-lg text-[#2D2926] hover:bg-[#F7F2EE] rounded-[24px] transition-all flex items-center justify-center gap-3"
                onClick={() => setStep('email')}
              >
                <Mail size={20} />
                {language === 'en' ? 'Sign in with email' : 'התחבר עם אימייל'}
              </Button>
            </>
          )}

          {step === 'phone' && (
            <Button
              className="w-full h-16 text-lg bg-[#2D2926] text-white hover:bg-[#1A1816] rounded-[24px] shadow-xl shadow-black/10 transition-all"
              onClick={handlePhoneSubmit}
              disabled={!phone.trim() || loading}
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : (language === 'en' ? 'Send verification code' : 'שלח קוד אימות')}
            </Button>
          )}

          {step === 'otp' && (
            <Button
              className="w-full h-16 text-lg bg-[#2D2926] text-white hover:bg-[#1A1816] rounded-[24px] shadow-xl shadow-black/10 transition-all"
              onClick={handleOtpSubmit}
              disabled={otp.length < 6 || loading}
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : (language === 'en' ? 'Verify' : 'אמת')}
            </Button>
          )}

          {step === 'email' && (
            <Button
              className="w-full h-16 text-lg bg-[#2D2926] text-white hover:bg-[#1A1816] rounded-[24px] shadow-xl shadow-black/10 transition-all"
              onClick={handleEmailSubmit}
              disabled={!email.trim() || !password.trim() || loading}
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : (language === 'en' ? 'Continue' : 'המשך')}
            </Button>
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
