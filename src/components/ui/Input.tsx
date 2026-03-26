import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && <label className="text-sm font-medium text-text-secondary px-1">{label}</label>}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 bg-surface-raised border border-black/5 rounded-2xl text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-action-primary/10 transition-all',
            error && 'border-danger focus:ring-danger/10',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-danger px-1">{error}</p>}
      </div>
    );
  }
);
