import React from 'react';
import { Shield, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  type: 'verified' | 'intent' | 'observance';
  label: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ type, label, className }) => {
  const styles = {
    verified: 'bg-verified/10 text-verified border-verified/20',
    intent: 'bg-accent-romantic/10 text-accent-romantic border-accent-romantic/20',
    observance: 'bg-text-secondary/10 text-text-secondary border-text-secondary/20',
  };

  return (
    <div className={cn(
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase border',
      styles[type],
      className
    )}>
      {type === 'verified' && <CheckCircle2 size={12} />}
      {label}
    </div>
  );
};
