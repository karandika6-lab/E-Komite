import React from 'react';
import { Card } from './Card';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtext?: string;
  colorClass: 'blue' | 'green' | 'pink' | 'purple' | 'orange';
  delay?: number;
}

export function StatCard({ title, value, icon: Icon, trend, subtext, colorClass, delay = 0 }: StatCardProps) {
  const bgGlowStyles = {
    blue: 'bg-blue-500/[0.05]',
    green: 'bg-emerald-500/[0.05]',
    pink: 'bg-rose-500/[0.05]',
    purple: 'bg-purple-500/[0.05]',
    orange: 'bg-orange-500/[0.05]',
  };
  
  const iconColors = {
    blue: 'text-blue-400',
    green: 'text-emerald-400',
    pink: 'text-rose-400',
    purple: 'text-purple-400',
    orange: 'text-orange-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="h-full"
    >
      <Card className={`flex flex-col h-full group hover:border-white/20 transition-all relative overflow-hidden ${bgGlowStyles[colorClass]}`}>
        {/* Subtle top-right glow */}
        <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-40 ${bgGlowStyles[colorClass].replace('[0.05]', '50')}`} />
        
        <div className="flex items-center justify-between mb-4 relative z-10">
          <p className="text-text-secondary text-sm font-medium">{title}</p>
          <Icon size={18} className={iconColors[colorClass]} />
        </div>
        
        <div className="flex flex-col mt-auto relative z-10">
          <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
          
          {/* Reserve space for trend / subtext */}
          <div className="h-6 mt-2 flex items-center">
            {subtext ? (
              <span className="text-xs text-text-tertiary font-medium">{subtext}</span>
            ) : trend ? (
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-medium ${
                  trend.isPositive ? 'text-green-500' : 'text-red-500'
                }`}>
                  {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-text-tertiary">dari bulan lalu</span>
              </div>
            ) : null}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
