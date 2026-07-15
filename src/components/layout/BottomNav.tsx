'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet, BookOpen, User, History } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { name: 'Beranda', href: '/dashboard', icon: Home },
  { name: 'Buku Kas', href: '/dashboard/buku-kas', icon: Wallet },
  { name: 'Riwayat', href: '/dashboard/riwayat', icon: History },
  { name: 'Profil', href: '/dashboard/profil', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 glass-nav z-50 md:hidden pb-safe">
      <div className="flex items-center justify-around h-16 px-4">
        {navItems.map((item) => {
          const isActive = 
            item.href === '/dashboard' 
              ? pathname === item.href
              : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative flex flex-col items-center justify-center w-16 h-full"
            >
              <div
                className={`relative flex flex-col items-center justify-center transition-all duration-300 ${
                  isActive ? 'text-neon-blue' : 'text-text-tertiary'
                }`}
              >
                <Icon
                  size={24}
                  className={`mb-1 transition-transform duration-300 ${
                    isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(0,212,255,0.8)]' : ''
                  }`}
                />
                <span className="text-[10px] font-medium">{item.name}</span>
                
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-active"
                    className="absolute -top-2 w-8 h-1 bg-neon-blue rounded-full shadow-[0_0_10px_rgba(0,212,255,0.8)]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
