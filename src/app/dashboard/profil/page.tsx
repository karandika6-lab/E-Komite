'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { 
  User, Lock, Calendar, CreditCard, FolderOpen, 
  RefreshCcw, Download, Upload, Activity, Info, LogOut, ChevronRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ProfilPage() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Berhasil logout');
      router.push('/login');
      router.refresh();
    } catch (error) {
      toast.error('Gagal logout');
    }
  };

  const menuGroups = [
    {
      title: 'Akun',
      items: [
        { name: 'Edit Profil', icon: User, href: '/dashboard/profil/edit' },
        { name: 'Ubah Password', icon: Lock, href: '/dashboard/profil/password' },
      ]
    },
    {
      title: 'Master Data',
      items: [
        { name: 'Tahun Ajaran', icon: Calendar, href: '/dashboard/pengaturan/tahun-ajaran' },
        { name: 'Jenis Pembayaran', icon: CreditCard, href: '/dashboard/pengaturan/jenis-pembayaran' },
        { name: 'Kategori Pengeluaran', icon: FolderOpen, href: '/dashboard/pengaturan/kategori-pengeluaran' },
      ]
    },
    {
      title: 'Sistem & Data',
      items: [
        { name: 'Google Sheets Sync', icon: RefreshCcw, href: '/dashboard/pengaturan/google-sheets' },
        { name: 'Import Data Siswa', icon: Download, href: '/dashboard/siswa/import' },
        { name: 'Export Seluruh Data', icon: Upload, href: '/dashboard/pengaturan/export' },
        { name: 'Log Aktivitas', icon: Activity, href: '/dashboard/pengaturan/log-aktivitas' },
      ]
    },
    {
      title: 'Lainnya',
      items: [
        { name: 'Tentang Aplikasi', icon: Info, href: '/dashboard/tentang' },
      ]
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Profile Header */}
      <Card glass className="p-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-neon-blue/10 rounded-full blur-[60px]" />
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-blue to-purple-600 flex items-center justify-center p-1 shadow-[0_0_20px_rgba(0,212,255,0.3)] z-10">
          <div className="w-full h-full rounded-full bg-bg-card flex items-center justify-center">
            <User size={40} className="text-white" />
          </div>
        </div>
        <div className="text-center md:text-left z-10">
          <h1 className="text-2xl font-bold text-white mb-1">Admin E-Komite</h1>
          <p className="text-text-secondary mb-3">admin@madrasah.sch.id</p>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-text-tertiary">
            Bergabung sejak: Mei 2026
          </div>
        </div>
      </Card>

      {/* Menu List */}
      <div className="space-y-8 pb-20 md:pb-0">
        {menuGroups.map((group, index) => (
          <div key={index}>
            <h3 className="text-[13px] font-bold text-gray-400/80 uppercase tracking-widest mb-3 px-2 flex items-center gap-3">
              {group.title}
              <div className="h-px bg-white/5 flex-1 mt-0.5" />
            </h3>
            <div className="bg-[#1c1c1e] rounded-[24px] overflow-hidden shadow-lg border border-white/5">
              <div className="divide-y divide-white/5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.name} href={item.href}>
                      <div className="flex items-center justify-between p-4 hover:bg-white/[0.03] transition-colors cursor-pointer group/item">
                        <div className="flex items-center gap-4 text-gray-300 group-hover/item:text-white transition-colors">
                          <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center group-hover/item:bg-blue-500/10 group-hover/item:text-blue-400 transition-colors text-gray-400">
                            <Icon size={18} />
                          </div>
                          <span className="font-medium text-[15px]">{item.name}</span>
                        </div>
                        <ChevronRight size={18} className="text-gray-500 group-hover/item:text-blue-400 transition-transform group-hover/item:translate-x-1" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
        
        {/* Logout Button */}
        <div className="pt-2">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 p-4 rounded-[20px] bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 transition-all font-bold text-[15px]"
          >
            <LogOut size={20} />
            Keluar (Logout)
          </button>
        </div>
      </div>
    </div>
  );
}
