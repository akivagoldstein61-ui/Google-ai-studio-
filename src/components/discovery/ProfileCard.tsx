import React from 'react';
import { Profile } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { MapPin, Info, Shield, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileCardProps {
  profile: Profile;
  whyMatch?: string;
  onLike?: () => void;
  onPass?: () => void;
  onSelect?: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ 
  profile, 
  whyMatch, 
  onLike, 
  onPass,
  onSelect 
}) => {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative w-full aspect-[3/4] rounded-[40px] overflow-hidden shadow-2xl bg-surface-raised cursor-pointer group border border-black/5"
      onClick={onSelect}
    >
      <img 
        src={profile.photos?.[0]} 
        alt={profile.displayName}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        referrerPolicy="no-referrer"
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
      
      <div className="absolute bottom-0 left-0 right-0 p-8 text-white space-y-5">
        <div className="flex items-center gap-2 flex-wrap">
          {profile.isVerified && (
            <div className="flex items-center gap-1.5 bg-[#D4AF37]/20 backdrop-blur-md text-white border border-white/20 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-sm">
              <Shield size={12} fill="currentColor" />
              <span>Verified</span>
            </div>
          )}
          <div className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-sm">
            {profile.intent.replace('_', ' ')}
          </div>
        </div>
        
        <div className="space-y-1.5">
          <div className="flex items-end gap-2.5">
            <h3 className="text-4xl font-bold tracking-tight leading-none">{profile.displayName}</h3>
            <span className="text-2xl font-medium opacity-80 leading-none">{profile.age}</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/70 text-sm font-medium tracking-tight">
            <MapPin size={16} className="opacity-60" />
            <span>{profile.city}</span>
          </div>
        </div>

        {whyMatch && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: 'spring', damping: 20 }}
            className="bg-white/10 backdrop-blur-2xl rounded-[24px] p-5 flex items-start gap-4 border border-white/20 shadow-2xl"
          >
            <div className="w-10 h-10 bg-white/10 rounded-[14px] flex items-center justify-center shrink-0 border border-white/10">
              <Sparkles size={20} className="text-accent-romantic" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Why this match</p>
              <p className="text-[13px] leading-relaxed font-medium text-white/95">{whyMatch}</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
