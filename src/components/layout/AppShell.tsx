import React from 'react';
import { Home, Compass, UserCircle2, ShieldCheck, HeartPulse } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AppShellProps {
  activeTab: 'daily_picks' | 'explore' | 'taste_profile' | 'ai_trust';
  onTabChange: (tab: 'daily_picks' | 'explore' | 'taste_profile' | 'ai_trust') => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ activeTab, onTabChange, children }) => {
  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-white shadow-xl overflow-hidden font-sans text-gray-900 border-x border-gray-100">
      <div className="flex-1 overflow-y-auto relative bg-gray-50/50">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      <nav className="h-16 bg-white border-t border-gray-100 flex items-center justify-around px-2 z-50">
        <NavItem 
          icon={<HeartPulse size={20} />} 
          label="Daily Picks" 
          isActive={activeTab === 'daily_picks'} 
          onClick={() => onTabChange('daily_picks')} 
        />
        <NavItem 
          icon={<Compass size={20} />} 
          label="Explore" 
          isActive={activeTab === 'explore'} 
          onClick={() => onTabChange('explore')} 
        />
        <NavItem 
          icon={<UserCircle2 size={20} />} 
          label="Taste Profile" 
          isActive={activeTab === 'taste_profile'} 
          onClick={() => onTabChange('taste_profile')} 
        />
        <NavItem 
          icon={<ShieldCheck size={20} />} 
          label="AI & Trust" 
          isActive={activeTab === 'ai_trust'} 
          onClick={() => onTabChange('ai_trust')} 
        />
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
        isActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      <div className={`${isActive ? 'scale-110' : 'scale-100'} transition-transform duration-200`}>
        {icon}
      </div>
      <span className="text-[10px] font-medium tracking-wide">{label}</span>
    </button>
  );
};
