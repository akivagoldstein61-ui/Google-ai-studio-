import React from 'react';
import { useApp } from '@/context/AppContext';
import { motion } from 'motion/react';
import { User, Shield, CreditCard, Bell, Globe, LogOut, ChevronRight, Sparkles, ShieldCheck, Terminal, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export const SettingsScreen: React.FC<{ 
  onShowSafety: () => void, 
  onShowAITrust: () => void,
  onShowAIOps: () => void,
  onShowExperiments: () => void
}> = ({ onShowSafety, onShowAITrust, onShowAIOps, onShowExperiments }) => {
  const { user, isPremium } = useApp();

  const [devClicks, setDevClicks] = React.useState(0);

  const handleDevClick = () => {
    setDevClicks(prev => prev + 1);
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
              <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#D4AF37] text-white p-2 rounded-full border-4 border-[#FDFCFB]">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-[#2D2926]">Akiva, 28</h3>
            <p className="text-sm text-[#8C7E6E] font-medium italic">Jerusalem • Modern Orthodox</p>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" size="sm" className="rounded-full bg-[#F7F2EE] text-[#2D2926] font-bold text-[10px] uppercase tracking-widest px-6">
              Edit Profile
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full bg-[#2D2926] text-[#D4AF37] font-bold text-[10px] uppercase tracking-widest px-6 flex items-center gap-2"
              onClick={() => alert("Profile Health Check is available in the Profile Builder during onboarding. In production, this would open the Profile Builder in edit mode.")}
            >
              <Sparkles size={12} />
              Health Check
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
            <MenuItem icon={ShieldCheck} label="Verification Status" />
            <MenuItem icon={Globe} label="Privacy Settings" />
          </MenuGroup>

          <MenuGroup title="Support">
            <MenuItem icon={Globe} label="Community Guidelines" />
            <MenuItem icon={Globe} label="Help Center" />
            <MenuItem icon={LogOut} label="Log Out" color="text-red-600" />
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
