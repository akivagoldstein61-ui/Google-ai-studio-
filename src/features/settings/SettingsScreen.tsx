import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { User, Shield, CreditCard, Bell, Globe, LogOut, ChevronRight, Sparkles, ShieldCheck, Terminal, FlaskConical, EyeOff, Trash2, LifeBuoy, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

import { trustService } from '@/services/trustService';

export const SettingsScreen: React.FC<{ 
  onShowSafety: () => void, 
  onShowAITrust: () => void,
  onShowPersonalityProfile: () => void,
  onShowAIOps: () => void,
  onShowExperiments: () => void,
  onEditProfile: () => void
}> = ({ onShowSafety, onShowAITrust, onShowPersonalityProfile, onShowAIOps, onShowExperiments, onEditProfile }) => {
  const { user, isPremium } = useApp();

  const [devClicks, setDevClicks] = useState(0);
  const [showPauseSheet, setShowPauseSheet] = useState(false);
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);
  const [showPrivacySheet, setShowPrivacySheet] = useState(false);

  const handleDevClick = () => {
    setDevClicks(prev => prev + 1);
  };

  const handleContactSupport = async () => {
    if (!user) return;
    try {
      await trustService.contactSupport(user.id, "User requested support from settings", "general");
      alert("Support request sent. We will contact you soon.");
    } catch (error) {
      console.error('Failed to contact support', error);
      alert("Failed to contact support. Please try again.");
    }
  };

  return (
    <div className="h-full flex flex-col px-6 py-4 space-y-8 overflow-hidden">
      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-serif italic text-[#2D2926]">Profile</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7E6E]">Manage your presence</p>
        </div>
        <button className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
          <Globe size={20} className="text-[#2D2926]" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-20 space-y-10">
        {/* Profile Header */}
        <section className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-[40px] overflow-hidden border-4 border-white shadow-2xl shadow-black/10">
              <img src={user?.photos?.[0] || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300"} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#D4AF37] text-white p-2 rounded-full border-4 border-[#FDFCFB]">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-[#2D2926]">{user?.displayName}, {user?.age}</h3>
            <p className="text-sm text-[#8C7E6E] font-medium italic">{user?.city} • {user?.observance}</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full bg-[#F7F2EE] text-[#2D2926] font-bold text-[10px] uppercase tracking-widest px-6"
              onClick={onEditProfile}
            >
              Edit Profile
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full bg-[#2D2926] text-[#D4AF37] font-bold text-[10px] uppercase tracking-widest px-6 flex items-center gap-2"
              onClick={() => onShowPersonalityProfile()}
            >
              <Sparkles size={12} />
              Personality Profile
            </Button>
          </div>
        </section>

        {/* AI & Trust Hub Entry */}
        <section 
          onClick={() => onShowAITrust && onShowAITrust()}
          className="p-6 bg-gradient-to-br from-[#F7F2EE] to-white border border-[#F3EFEA] rounded-[32px] flex items-center justify-between cursor-pointer group hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#2D2926] text-[#D4AF37] rounded-full flex items-center justify-center shadow-lg">
              <Sparkles size={24} />
            </div>
            <div className="space-y-0.5">
              <h4 className="font-bold text-[#2D2926]">AI & Trust Hub</h4>
              <p className="text-[10px] text-[#8C7E6E] font-medium italic uppercase tracking-widest">Transparency & Control</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-[#8C7E6E] group-hover:translate-x-1 transition-transform" />
        </section>

        {/* Developer Options */}
        {devClicks >= 5 && (
          <MenuGroup title="Developer Options (Internal)">
            <MenuItem icon={Terminal} label="AI Ops Console" onClick={onShowAIOps} />
            <MenuItem icon={FlaskConical} label="Experiments & Eval" onClick={onShowExperiments} />
          </MenuGroup>
        )}

        {/* Premium Banner */}
        {!isPremium && (
          <section className="p-8 bg-[#2D2926] rounded-[40px] text-white space-y-6 relative overflow-hidden shadow-xl shadow-black/20">
            <div className="space-y-2 relative z-10">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                <Sparkles size={14} />
                <span>Kesher Premium</span>
              </div>
              <h4 className="text-2xl font-serif italic leading-tight">Deepen your search for intent.</h4>
              <p className="text-white/60 text-sm leading-relaxed italic">See who liked you, use advanced filters, and get more daily picks.</p>
            </div>
            <Button className="w-full h-14 bg-white text-[#2D2926] font-bold rounded-full relative z-10">
              Upgrade Now
            </Button>
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4AF37]/10 blur-3xl -mr-20 -mt-20" />
          </section>
        )}

        {/* Menu Groups */}
        <div className="space-y-8">
          <MenuGroup title="Account">
            <MenuItem icon={User} label="Personal Information" />
            <MenuItem icon={CreditCard} label="Subscription" />
            <MenuItem icon={Bell} label="Notifications" />
          </MenuGroup>

          <MenuGroup title="Safety & Privacy">
            <MenuItem icon={Shield} label="Safety Center" onClick={onShowSafety} />
            <MenuItem icon={ShieldCheck} label="Verification Status" onClick={() => alert("Verification Status: Verified. In production, this opens the verification details.")} />
            <MenuItem icon={EyeOff} label="Pause Profile" onClick={() => setShowPauseSheet(true)} />
            <MenuItem icon={Globe} label="Privacy Settings" onClick={() => setShowPrivacySheet(true)} />
          </MenuGroup>

          <MenuGroup title="Support">
            <MenuItem icon={Globe} label="Community Guidelines" />
            <MenuItem icon={LifeBuoy} label="Contact Support" onClick={handleContactSupport} />
            <MenuItem icon={LogOut} label="Log Out" color="text-red-600" />
            <MenuItem icon={Trash2} label="Delete Account" color="text-red-600" onClick={() => setShowDeleteSheet(true)} />
          </MenuGroup>
        </div>

        <div className="pt-4 text-center space-y-2">
          <p 
            onClick={handleDevClick}
            className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#8C7E6E] cursor-pointer"
          >
            Kesher v1.0.0
          </p>
          <p className="text-[8px] text-[#8C7E6E]/40 italic">Made with intent in Israel</p>
        </div>
      </div>

      <AnimatePresence>
        {showPauseSheet && (
          <PauseProfileSheet isOpen={showPauseSheet} onClose={() => setShowPauseSheet(false)} userId={user?.id} />
        )}
        {showDeleteSheet && (
          <DeleteAccountSheet isOpen={showDeleteSheet} onClose={() => setShowDeleteSheet(false)} userId={user?.id} />
        )}
        {showPrivacySheet && (
          <PrivacySettingsSheet isOpen={showPrivacySheet} onClose={() => setShowPrivacySheet(false)} userId={user?.id} />
        )}
      </AnimatePresence>
    </div>
  );
};

const MenuGroup: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-4">
    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8C7E6E] px-2">{title}</h4>
    <div className="bg-white border border-[#F3EFEA] rounded-[32px] overflow-hidden shadow-sm">
      {children}
    </div>
  </div>
);

const MenuItem: React.FC<{ icon: any, label: string, color?: string, onClick?: () => void }> = ({ icon: Icon, label, color, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full p-6 flex items-center justify-between hover:bg-[#F7F2EE] transition-all border-b border-[#F3EFEA] last:border-none group"
  >
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-[#F7F2EE] rounded-full flex items-center justify-center text-[#2D2926]">
        <Icon size={20} className={color} />
      </div>
      <span className={cn("font-bold text-sm text-[#2D2926]", color)}>{label}</span>
    </div>
    <ChevronRight size={18} className="text-[#8C7E6E] group-hover:translate-x-1 transition-transform" />
  </button>
);

const PauseProfileSheet: React.FC<{ isOpen: boolean, onClose: () => void, userId?: string }> = ({ isOpen, onClose, userId }) => {
  const [isPausing, setIsPausing] = useState(false);

  const handlePause = async () => {
    if (!userId) return;
    setIsPausing(true);
    try {
      await trustService.pauseProfile(userId, true);
      alert("Your profile is now paused.");
      onClose();
    } catch (error) {
      console.error('Failed to pause profile', error);
      alert("Failed to pause profile. Please try again.");
    } finally {
      setIsPausing(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center">
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-md bg-[#FDFCFB] rounded-t-[40px] p-8 space-y-8 shadow-2xl"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-serif italic text-[#2D2926]">Pause Profile</h3>
          <button onClick={onClose} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
            <X size={20} className="text-[#2D2926]" />
          </button>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-[#8C7E6E] leading-relaxed">
            Pausing your profile hides you from new discovery. You will not be shown to new people, but your existing matches and chats will remain active.
          </p>
          <p className="text-sm text-[#8C7E6E] leading-relaxed font-bold">
            You can unpause at any time.
          </p>
        </div>
        <div className="space-y-3">
          <Button 
            className="w-full h-14 bg-[#2D2926] text-white font-bold rounded-full"
            onClick={handlePause}
            disabled={isPausing}
          >
            {isPausing ? 'Pausing...' : 'Pause My Profile'}
          </Button>
          <Button 
            variant="ghost"
            className="w-full h-14 text-[#2D2926] font-bold rounded-full"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

const PrivacySettingsSheet: React.FC<{ isOpen: boolean, onClose: () => void, userId?: string }> = ({ isOpen, onClose, userId }) => {
  const { resetTasteProfile } = useApp();
  const [isSaving, setIsSaving] = useState(false);
  const [showResetTasteConfirm, setShowResetTasteConfirm] = useState(false);
  const [settings, setSettings] = useState({
    showOnlineStatus: true,
    readReceipts: true,
    showDistance: true,
    allowPersonalityMatching: true,
  });

  const handleSave = async () => {
    if (!userId) return;
    setIsSaving(true);
    try {
      await trustService.updatePrivacySettings(userId, settings);
      console.log("Saving privacy settings:", settings);
      alert("Privacy settings saved.");
      onClose();
    } catch (error) {
      console.error('Failed to save privacy settings', error);
      alert("Failed to save privacy settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center">
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-md bg-[#FDFCFB] rounded-t-[40px] p-8 space-y-8 shadow-2xl"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-serif italic text-[#2D2926]">Privacy Settings</h3>
          <button onClick={onClose} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
            <X size={20} className="text-[#2D2926]" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#2D2926]">Show Online Status</h4>
              <p className="text-xs text-[#8C7E6E]">Let others see when you are active.</p>
            </div>
            <input 
              type="checkbox" 
              checked={settings.showOnlineStatus} 
              onChange={(e) => setSettings({...settings, showOnlineStatus: e.target.checked})}
              className="w-5 h-5 accent-[#D4AF37]"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#2D2926]">Read Receipts</h4>
              <p className="text-xs text-[#8C7E6E]">Let others see when you've read their messages.</p>
            </div>
            <input 
              type="checkbox" 
              checked={settings.readReceipts} 
              onChange={(e) => setSettings({...settings, readReceipts: e.target.checked})}
              className="w-5 h-5 accent-[#D4AF37]"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-[#2D2926]">Show Distance</h4>
              <p className="text-xs text-[#8C7E6E]">Show your approximate distance to matches.</p>
            </div>
            <input 
              type="checkbox" 
              checked={settings.showDistance} 
              onChange={(e) => setSettings({...settings, showDistance: e.target.checked})}
              className="w-5 h-5 accent-[#D4AF37]"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#F3EFEA]">
            <div className="space-y-1 pr-4">
              <h4 className="text-sm font-bold text-[#2D2926]">Personality Matching</h4>
              <p className="text-xs text-[#8C7E6E]">Allow Kesher to use your personality profile to suggest better matches. This does not create a public score.</p>
            </div>
            <input 
              type="checkbox" 
              checked={settings.allowPersonalityMatching} 
              onChange={(e) => setSettings({...settings, allowPersonalityMatching: e.target.checked})}
              className="w-5 h-5 accent-[#D4AF37] flex-shrink-0"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#F3EFEA]">
            <div className="space-y-1 pr-4">
              <h4 className="text-sm font-bold text-[#2D2926]">Reset Taste Profile</h4>
              <p className="text-xs text-[#8C7E6E]">Clear what Kesher has learned about your preferences and start fresh.</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowResetTasteConfirm(true)}
              className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] border-[#D4AF37] hover:bg-[#D4AF37] hover:text-white flex-shrink-0"
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <Button 
            className="w-full h-14 bg-[#2D2926] text-white font-bold rounded-full"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showResetTasteConfirm && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-[#FDFCFB] rounded-[32px] p-6 space-y-6 shadow-2xl"
            >
              <div className="space-y-2 text-center">
                <div className="w-12 h-12 bg-[#F7F2EE] rounded-full flex items-center justify-center mx-auto mb-4 text-[#2D2926]">
                  <RefreshCw size={24} />
                </div>
                <h3 className="text-xl font-serif italic text-[#2D2926]">Reset Taste Profile?</h3>
                <p className="text-sm text-[#8C7E6E] leading-relaxed">
                  Are you sure you want to reset your taste learning? This will clear your private preference model.
                </p>
              </div>
              <div className="space-y-3">
                <Button 
                  className="w-full h-12 bg-[#2D2926] text-white font-bold rounded-full"
                  onClick={() => {
                    resetTasteProfile();
                    setShowResetTasteConfirm(false);
                  }}
                >
                  Yes, Reset
                </Button>
                <Button 
                  variant="ghost"
                  className="w-full h-12 text-[#2D2926] font-bold rounded-full"
                  onClick={() => setShowResetTasteConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
const DeleteAccountSheet: React.FC<{ isOpen: boolean, onClose: () => void, userId?: string }> = ({ isOpen, onClose, userId }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!userId) return;
    setIsDeleting(true);
    try {
      await trustService.requestAccountDeletion(userId, "User requested deletion from settings");
      alert("Account deletion requested. We will process this shortly.");
      onClose();
    } catch (error) {
      console.error('Failed to request deletion', error);
      alert("Failed to request deletion. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center">
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-md bg-[#FDFCFB] rounded-t-[40px] p-8 space-y-8 shadow-2xl"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-serif italic text-red-600">Delete Account</h3>
          <button onClick={onClose} className="p-2 hover:bg-[#F7F2EE] rounded-full transition-all">
            <X size={20} className="text-[#2D2926]" />
          </button>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-[#8C7E6E] leading-relaxed">
            Deleting your account is permanent. All your matches, messages, and profile data will be securely erased.
          </p>
          <p className="text-sm text-[#8C7E6E] leading-relaxed">
            If you just need a break, consider pausing your profile instead.
          </p>
        </div>
        <div className="space-y-3">
          <Button 
            className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Requesting...' : 'Delete Account'}
          </Button>
          <Button 
            variant="ghost"
            className="w-full h-14 text-[#2D2926] font-bold rounded-full"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
