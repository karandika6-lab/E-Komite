import React, { forwardRef, InputHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, icon: Icon, ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-1.5 w-full">
        {label && (
          <label className="text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-tertiary">
              <Icon size={18} />
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full rounded-xl bg-bg-elevated border border-white/10 px-4 py-2.5 
              text-text-primary placeholder:text-text-tertiary
              focus:outline-none focus:ring-2 focus:ring-neon-blue focus:border-transparent
              transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
              ${Icon ? 'pl-10' : ''}
              ${error ? 'border-neon-pink focus:ring-neon-pink' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <span className="text-xs text-neon-pink mt-1">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
