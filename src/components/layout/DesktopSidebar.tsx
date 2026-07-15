'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Wallet, Clock, User, Users, FileText, 
  Settings, ChevronRight, School, LogOut, ChevronLeft, BookOpen, History, BarChart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const mainNavItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Siswa', href: '/dashboard/siswa', icon: Users },
  { name: 'Tagihan', href: '/dashboard/tagihan', icon: FileText },
  { name: 'Buku Kas', href: '/dashboard/buku-kas', icon: Wallet },
  { name: 'Riwayat', href: '/dashboard/riwayat', icon: History },
  { name: 'Laporan', href: '/dashboard/laporan', icon: BarChart },
];

const settingNavItems = [
  { name: 'Pengaturan & Profil', href: '/dashboard/profil', icon: Settings },
];

export function DesktopSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div 
      className={`hidden md:flex flex-col h-screen sticky top-0 glass-sidebar transition-all duration-300 z-40 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="h-20 flex items-center px-4 border-b border-white/5">
        <div className="w-10 h-10 min-w-[40px] rounded-xl bg-gradient-to-br from-neon-blue to-blue-600 flex items-center justify-center shadow-lg shadow-neon-blue/20">
          <School size={20} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="ml-3 overflow-hidden whitespace-nowrap"
            >
              <h2 className="text-lg font-bold text-white tracking-wide">E-KOMITE</h2>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Menu */}
      <div className="flex-1 py-6 px-3 overflow-y-auto no-scrollbar flex flex-col gap-1">
        <div className="mb-2 px-3">
          <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
            {!collapsed && 'Main Menu'}
          </span>
        </div>
        
        {mainNavItems.map((item) => {
          const isActive = 
            item.href === '/dashboard' 
              ? pathname === item.href
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`flex items-center px-3 py-3 rounded-xl transition-all group relative ${
                  isActive 
                    ? 'bg-neon-blue/10 text-neon-blue' 
                    : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-neon-blue rounded-r-full shadow-[0_0_10px_rgba(0,212,255,0.8)]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
                <Icon size={20} className={isActive ? 'drop-shadow-[0_0_8px_rgba(0,212,255,0.8)]' : ''} />
                
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="ml-3 font-medium whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}

        <div className="mt-8 mb-2 px-3">
          <span className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">
            {!collapsed && 'System'}
          </span>
        </div>

        {settingNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`flex items-center px-3 py-3 rounded-xl transition-all group relative ${
                  isActive 
                    ? 'bg-neon-purple/10 text-neon-purple' 
                    : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-sys"
                    className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-neon-purple rounded-r-full shadow-[0_0_10px_rgba(168,85,247,0.8)]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
                <Icon size={20} className={isActive ? 'drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]' : ''} />
                
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="ml-3 font-medium whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-white/5">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full p-2 rounded-lg text-text-tertiary hover:bg-white/5 transition-colors mb-2"
        >
          {collapsed ? <ChevronRight size={20} /> : <div className="flex items-center justify-between w-full"><span className="text-sm">Collapse</span><ChevronLeft size={20} /></div>}
        </button>
        
        <button className="flex items-center w-full px-3 py-3 rounded-xl text-text-secondary hover:bg-neon-pink/10 hover:text-neon-pink transition-all group">
          <LogOut size={20} className="group-hover:drop-shadow-[0_0_8px_rgba(255,0,110,0.8)]" />
          {!collapsed && <span className="ml-3 font-medium whitespace-nowrap">Logout</span>}
        </button>
      </div>
    </div>
  );
}
