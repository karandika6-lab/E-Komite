'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { CreditCard, Upload, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function KeuanganHubPage() {
  const menus = [
    {
      title: 'Pembayaran Masuk',
      description: 'Catat pembayaran siswa, cetak kwitansi, dan lihat riwayat pemasukan.',
      icon: CreditCard,
      href: '/dashboard/keuangan/pembayaran',
      color: 'green'
    },
    {
      title: 'Pengeluaran',
      description: 'Catat dana keluar, upload nota bukti, dan pantau pengeluaran sekolah.',
      icon: Upload,
      href: '/dashboard/keuangan/pengeluaran',
      color: 'pink'
    },
    {
      title: 'Manajemen Anggaran',
      description: 'Kelola rencana anggaran (RAB) tahunan dan pantau realisasinya.',
      icon: Calendar,
      href: '/dashboard/keuangan/anggaran',
      color: 'blue'
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Pusat Keuangan</h1>
        <p className="text-sm text-text-secondary">Kelola arus kas masuk dan keluar secara terpusat.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {menus.map((menu, i) => {
          const Icon = menu.icon;
          const bgColors: Record<string, string> = {
            green: 'from-neon-green/20 to-transparent border-neon-green/20',
            pink: 'from-neon-pink/20 to-transparent border-neon-pink/20',
            blue: 'from-neon-blue/20 to-transparent border-neon-blue/20'
          };
          const iconColors: Record<string, string> = {
            green: 'text-neon-green bg-neon-green/10',
            pink: 'text-neon-pink bg-neon-pink/10',
            blue: 'text-neon-blue bg-neon-blue/10'
          };

          return (
            <motion.div
              key={menu.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={menu.href}>
                <Card glass className={`h-full border-t-2 bg-gradient-to-b hover:bg-white/5 transition-all group ${bgColors[menu.color]}`}>
                  <div className="flex flex-col h-full">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${iconColors[menu.color]}`}>
                      <Icon size={24} />
                    </div>
                    <h2 className="text-lg font-bold text-white mb-2 group-hover:text-neon-blue transition-colors">
                      {menu.title}
                    </h2>
                    <p className="text-sm text-text-secondary flex-1">
                      {menu.description}
                    </p>
                    <div className="mt-6 flex items-center text-sm font-medium text-text-primary group-hover:text-neon-blue transition-colors">
                      Buka Menu <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
