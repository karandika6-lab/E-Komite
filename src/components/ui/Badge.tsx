import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    success: 'bg-neon-green/10 text-neon-green border border-neon-green/20',
    warning: 'bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/20',
    danger: 'bg-neon-pink/10 text-neon-pink border border-neon-pink/20',
    info: 'bg-neon-blue/10 text-neon-blue border border-neon-blue/20',
    default: 'bg-white/10 text-text-secondary border border-white/10',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
