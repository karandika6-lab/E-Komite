import React, { forwardRef, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', glass = false, children, ...props }, ref) => {
    const baseStyles = 'rounded-xl border bg-bg-card p-6';
    const glassStyles = glass ? 'border-white/10' : 'border-white/10';
    
    return (
      <div ref={ref} className={`${baseStyles} ${glassStyles} ${className}`} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };
