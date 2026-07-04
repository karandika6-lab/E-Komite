'use client';

import React from 'react';
import { Bell, Search, User as UserIcon } from 'lucide-react';
import { Input } from '@/components/ui/Input';

export function TopBar() {
  return (
    <header className="h-20 glass-nav sticky top-0 z-30 hidden md:flex items-center justify-between px-8">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-tertiary">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Cari siswa, tagihan, atau kwitansi..."
            className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-neon-blue focus:bg-white/10 transition-all placeholder:text-text-tertiary"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-white/10 text-text-secondary hover:text-text-primary transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-neon-pink rounded-full shadow-[0_0_8px_rgba(255,0,110,0.8)]" />
        </button>
        
        <div className="h-8 w-[1px] bg-white/10 mx-2" />
        
        <div className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-colors">
          <div className="text-right hidden lg:block">
            <p className="text-sm font-medium text-text-primary">Admin TU</p>
            <p className="text-xs text-text-tertiary">admin@ma.sch.id</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-purple-600 flex items-center justify-center shadow-lg shadow-neon-purple/20">
            <UserIcon size={20} className="text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
