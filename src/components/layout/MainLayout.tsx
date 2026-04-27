import React from 'react';
import { Heart, Search, MessageCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: 'daily' | 'explore' | 'matches' | 'profile';
  setActiveTab: (tab: 'daily' | 'explore' | 'matches' | 'profile') => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="flex flex-col h-screen bg-[#FDFCFB]">
      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>
      
      <nav className="h-24 bg-white/80 backdrop-blur-2xl border-t border-[#F3EFEA] px-8 flex items-center justify-between safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.02)] relative z-30">
        <NavButton 
          active={activeTab === 'daily'} 
          onClick={() => setActiveTab('daily')} 
          icon={Heart} 
          label="Picks" 
        />
        <NavButton 
          active={activeTab === 'explore'} 
          onClick={() => setActiveTab('explore')} 
          icon={Search} 
          label="Explore" 
        />
        <NavButton 
          active={activeTab === 'matches'} 
          onClick={() => setActiveTab('matches')} 
          icon={MessageCircle} 
          label="Inbox" 
        />
        <NavButton 
          active={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')} 
          icon={User} 
          label="Profile" 
        />
      </nav>
    </div>
  );
};

const NavButton = ({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex flex-col items-center gap-1.5 transition-all relative group",
      active ? "text-[#D4AF37]" : "text-[#8C7E6E]"
    )}
  >
    <div className={cn(
      "p-2 rounded-2xl transition-all group-hover:bg-[#F7F2EE]",
      active ? "bg-[#F7F2EE]" : "bg-transparent"
    )}>
      <Icon size={24} fill={active ? "currentColor" : "none"} />
    </div>
    <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
    {active && (
      <motion.div 
        layoutId="nav-indicator"
        className="absolute -bottom-4 w-1 h-1 bg-[#D4AF37] rounded-full"
      />
    )}
  </button>
);
