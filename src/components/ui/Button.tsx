import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-action-primary text-white hover:opacity-90 active:scale-95',
      secondary: 'bg-surface-raised text-text-primary border border-black/5 hover:bg-surface-base active:scale-95',
      outline: 'bg-transparent border border-text-primary text-text-primary hover:bg-black/5 active:scale-95',
      ghost: 'bg-transparent text-text-primary hover:bg-black/5 active:scale-95',
      danger: 'bg-danger text-white hover:opacity-90 active:scale-95',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm rounded-xl',
      md: 'px-6 py-3 text-base font-medium rounded-2xl',
      lg: 'px-8 py-4 text-lg font-semibold rounded-3xl',
      icon: 'p-3 rounded-full',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center transition-all disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          children
        )}
      </button>
    );
  }
);
