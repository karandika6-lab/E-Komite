'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { 
  TrendingUp, TrendingDown, Users, Calendar, 
  BarChart, PieChart, FileText, Activity, ArrowRight 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LaporanHubPage() {
  const laporanList = [
    {
      title: 'Laporan Pemasukan',
      desc: 'Rekap pembayaran per periode, jenis, kelas, dan angkatan.',
      icon: TrendingUp,
      href: '/dashboard/laporan/pemasukan',
      color: 'green'
    },
    {
      title: 'Laporan Pengeluaran',
      desc: 'Rekap pengeluaran operasional sekolah per kategori.',
      icon: TrendingDown,
      href: '/dashboard/laporan/pengeluaran',
      color: 'pink'
    },
    {
      title: 'Laporan Tunggakan',
      desc: 'Daftar siswa yang belum lunas per jenis pembayaran.',
      icon: Users,
      href: '/dashboard/laporan/tunggakan',
      color: 'orange'
    },
    {
      title: 'Laporan Anggaran',
      desc: 'Perbandingan antara rencana anggaran (RAB) dan realisasi.',
      icon: PieChart,
      href: '/dashboard/laporan/anggaran',
      color: 'purple'
    },
    {
      title: 'Laporan Arus Kas',
      desc: 'Cash flow pergerakan dana masuk dan keluar per periode.',
      icon: Activity,
      href: '/dashboard/laporan/arus-kas',
      color: 'blue'
    },
    {
      title: 'Laporan Per Siswa',
      desc: 'Detail tagihan dan history pembayaran individu siswa.',
      icon: FileText,
      href: '/dashboard/laporan/per-siswa',
      color: 'blue'
    },
    {
      title: 'Laporan Per Kelas',
      desc: 'Rekap persentase pelunasan dan pembayaran per kelas.',
      icon: BarChart,
      href: '/dashboard/laporan/per-kelas',
      color: 'blue'
    },
    {
      title: 'Laporan Tahunan',
      desc: 'Executive summary keseluruhan satu tahun ajaran.',
      icon: Calendar,
      href: '/dashboard/laporan/tahunan',
      color: 'blue'
    }
  ];

  const colors = {
    green: 'from-neon-green to-emerald-600 shadow-neon-green/20 text-neon-green',
    pink: 'from-neon-pink to-rose-600 shadow-neon-pink/20 text-neon-pink',
    orange: 'from-neon-orange to-orange-600 shadow-neon-orange/20 text-neon-orange',
    purple: 'from-neon-purple to-purple-600 shadow-neon-purple/20 text-neon-purple',
    blue: 'from-neon-blue to-blue-600 shadow-neon-blue/20 text-neon-blue'
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Pusat Laporan Keuangan</h1>
        <p className="text-sm text-text-secondary">Pilih jenis laporan yang ingin Anda lihat atau cetak.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {laporanList.map((item, i) => {
          const Icon = item.icon;
          const colorStyles = colors[item.color as keyof typeof colors];
          const bgGradient = `bg-gradient-to-br ${colorStyles.split(' ').slice(0, 2).join(' ')}`;
          const shadowColor = colorStyles.split(' ')[2];
          const textColor = colorStyles.split(' ')[3];

          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={item.href}>
                <Card glass className="h-full hover:border-white/20 transition-all group cursor-pointer flex flex-col">
                  <div className={`w-12 h-12 rounded-xl ${bgGradient} flex items-center justify-center shadow-lg ${shadowColor} mb-4 transform group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-neon-blue transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-text-secondary flex-1 mb-4">
                    {item.desc}
                  </p>
                  <div className={`flex items-center text-sm font-medium ${textColor} mt-auto`}>
                    Lihat Laporan <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
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
