'use client';

import React from 'react';
import { 
  TrendingUp, TrendingDown, Wallet, Users, 
  CreditCard, Upload, FileText, BarChart, Calendar, RefreshCcw, Settings, AlertCircle, CheckCircle2,
  BookOpen, History, Info
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export default function DashboardPage() {
  const [stats, setStats] = React.useState({
    pemasukanBulanIni: 0,
    pengeluaranBulanIni: 0,
    saldoBersih: 0,
    totalSiswa: 0,
    tunggakanCount: 0
  });
  const [recentActivity, setRecentActivity] = React.useState<any[]>([]);
  const supabase = createClient();

  React.useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

      // Fetch Siswa Count
      const { count: siswaCount } = await supabase.from('siswa').select('*', { count: 'exact', head: true }).eq('status', 'Aktif');

      // Fetch Tunggakan Count
      const { count: tunggakanCount } = await supabase.from('tagihan').select('*', { count: 'exact', head: true }).gt('sisa_tagihan', 0);

      // Fetch Pemasukan & Pengeluaran Bulan Ini dari Buku Kas
      const { data: bukuKasData } = await supabase
        .from('buku_kas')
        .select('kas_masuk, kas_keluar')
        .gte('tanggal', firstDayOfMonth)
        .lte('tanggal', lastDayOfMonth);
      
      const pemasukanBulanIni = ((bukuKasData as any[]) || []).reduce((acc, curr) => acc + (curr.kas_masuk || 0), 0);
      const pengeluaranBulanIni = ((bukuKasData as any[]) || []).reduce((acc, curr) => acc + (curr.kas_keluar || 0), 0);

      // Fetch Semua Saldo
      const { data: allBukuKas } = await supabase.from('buku_kas').select('kas_masuk, kas_keluar');
      const totalPemasukan = ((allBukuKas as any[]) || []).reduce((acc, curr) => acc + (curr.kas_masuk || 0), 0);
      const totalPengeluaran = ((allBukuKas as any[]) || []).reduce((acc, curr) => acc + (curr.kas_keluar || 0), 0);
      const saldoBersih = totalPemasukan - totalPengeluaran;

      setStats({
        pemasukanBulanIni,
        pengeluaranBulanIni,
        saldoBersih,
        totalSiswa: siswaCount || 0,
        tunggakanCount: tunggakanCount || 0
      });

      // Fetch Recent Activity (5 terakhir dari Buku Kas)
      const { data: recentBukuKas } = await supabase
        .from('buku_kas')
        .select(`id, tanggal, uraian, kas_masuk, kas_keluar, siswa(nama_lengkap, angkatan), kategori_buku_kas(nama)`)
        .order('created_at', { ascending: false })
        .limit(5);

      const merged = ((recentBukuKas as any[]) || []).map(p => {
        const isIncome = p.kas_masuk > 0;
        return {
          id: p.id,
          type: isIncome ? 'income' : 'expense',
          title: p.kategori_buku_kas?.nama || (isIncome ? 'Pemasukan' : 'Pengeluaran'),
          amount: `${isIncome ? '+' : '-'} Rp ${(isIncome ? p.kas_masuk : p.kas_keluar).toLocaleString('id-ID')}`,
          name: p.siswa ? `${p.siswa.nama_lengkap} (Angkatan ${p.siswa.angkatan})` : p.uraian,
          time: format(new Date(p.tanggal), 'dd MMM HH:mm', { locale: localeId }),
          rawDate: new Date(p.tanggal).getTime()
        };
      });

      setRecentActivity(merged);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };
  const quickMenus = [
    { name: 'Buku Kas', icon: Wallet, href: '/dashboard/buku-kas', color: 'green' },
    { name: 'Riwayat', icon: History, href: '/dashboard/riwayat', color: 'pink' },
    { name: 'Tagihan', icon: FileText, href: '/dashboard/tagihan', color: 'orange' },
    { name: 'Data Siswa', icon: Users, href: '/dashboard/siswa', color: 'blue' },
    { name: 'Laporan', icon: BarChart, href: '/dashboard/laporan', color: 'purple' },
    { name: 'Sync Sheets', icon: RefreshCcw, href: '/dashboard/pengaturan/google-sheets', color: 'green' },
    { name: 'Pengaturan', icon: Settings, href: '/dashboard/profil', color: 'text-text-secondary' },
    { name: 'Tentang', icon: Info, href: '/dashboard/tentang', color: 'blue' },
  ];



  return (
    <>
      {/* =========================================================================
          MOBILE VIEW (GoPay Style)
          ========================================================================= */}
      <div className="block md:hidden -mx-4 -mt-4 relative pb-20">
        {/* Background Header - Premium Blue Gradient */}
        <div className="bg-gradient-to-b from-[#0066b2] via-[#004f8c] to-bg-primary pt-6 pb-28 px-5 rounded-b-[40px] relative overflow-hidden">
          {/* Subtle texture overlay */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          
          {/* Logo & Help Icon */}
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h1 className="text-white font-bold text-lg flex items-center gap-2">
              <div className="w-7 h-7 bg-white/20 rounded-md flex items-center justify-center font-black">E</div> E-Komite
            </h1>
            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white backdrop-blur-md">
              <span className="text-xs font-bold">?</span>
            </div>
          </div>

          {/* Balance Area */}
          <div className="relative z-10 flex justify-between items-start mt-2">
            <div>
              <p className="text-blue-100 text-[13px] font-medium mb-0.5">Saldo Bersih Total</p>
              <div className="flex items-start gap-1 text-white">
                <span className="text-base font-medium mt-1">Rp</span>
                <span className="text-3xl font-bold tracking-tight leading-none">{stats.saldoBersih.toLocaleString('id-ID')}</span>
              </div>
              
              <div className="flex items-center gap-1.5 mt-3 text-[11px] text-blue-50 bg-white/10 border border-white/10 backdrop-blur-md w-fit px-3 py-1.5 rounded-full">
                <TrendingUp size={12} className="text-green-300" />
                <span className="font-medium">Pemasukan: +Rp {(stats.pemasukanBulanIni/1000000).toFixed(1)}jt</span>
              </div>
            </div>

            {/* Action Buttons Right (Top Up style) */}
            <div className="flex flex-col gap-2">
              <Link href="/dashboard/keuangan/pembayaran/input">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl p-2 flex flex-col items-center justify-center w-[72px] h-[72px] hover:bg-white/20 transition shadow-lg">
                  <div className="w-6 h-6 rounded-full border border-white flex items-center justify-center mb-1"><span className="text-sm font-medium">+</span></div>
                  <span className="text-[10px] text-center font-medium leading-tight">Terima<br/>Dana</span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content Container Overlapping the header */}
        <div className="px-4 -mt-20 relative z-20 space-y-4">
          
          {/* Quick Menus Container (Dark Gray Card like GoPay) */}
          <div className="bg-[#242426] rounded-3xl p-5 shadow-2xl border border-white/5">
            <div className="grid grid-cols-4 gap-y-6 gap-x-2">
              {quickMenus.map((m, i) => {
                const Icon = m.icon;
                return (
                  <Link href={m.href} key={m.name}>
                    <div className="flex flex-col items-center gap-2 group">
                      <div className="w-12 h-12 rounded-[18px] bg-[#333335] flex items-center justify-center text-white shadow-inner border border-white/5 relative overflow-hidden group-hover:bg-[#404042] transition-colors">
                        <Icon size={22} className="relative z-10 text-white" />
                      </div>
                      <span className="text-[10px] font-medium text-center text-gray-300 leading-tight w-16 px-1 truncate">{m.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Promo Banner / Alerts */}
          <div className="bg-gradient-to-r from-red-900/30 to-[#242426] rounded-3xl p-4 shadow-lg border border-red-500/10 flex items-center gap-4">
            <div className="w-10 h-10 flex-shrink-0 rounded-full border border-red-500/50 flex items-center justify-center bg-red-500/10 text-red-400">
              <AlertCircle size={20} />
            </div>
            <div className="flex-1">
              <h4 className="text-white text-sm font-bold">{stats.tunggakanCount} Tagihan Menunggak</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">Segera cek rincian tagihan &gt;</p>
            </div>
          </div>

          {/* Spesial cuma buat kamu (Activity Feed) */}
          <div className="pt-2">
            <h3 className="text-white font-bold text-sm mb-3 px-1">Aktivitas Terbaru</h3>
            <div className="space-y-3">
              {recentActivity.slice(0, 3).map(act => (
                <div key={act.id} className="bg-[#242426] p-3.5 rounded-[20px] border border-white/5 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${act.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {act.type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-[13px] font-bold truncate mb-0.5">{act.title}</p>
                    <p className="text-gray-400 text-[11px] truncate">{act.name}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-[13px] font-bold ${act.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                      {act.amount}
                    </p>
                    <p className="text-gray-400 text-[11px] mt-0.5">{act.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-4 mb-8">
               <Link href="/dashboard/riwayat" className="text-xs font-bold text-[#0066b2]">Lihat Semua Riwayat &gt;</Link>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          DESKTOP VIEW (Vercel Style)
          ========================================================================= */}
      <div className="hidden md:block space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-1">Selamat Pagi, Admin 👋</h1>
            <p className="text-sm text-text-secondary">Berikut ringkasan data keuangan hari ini, 24 Mei 2026.</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.02] border border-white/10 rounded-lg text-text-secondary hover:text-white transition-colors cursor-pointer text-sm font-medium">
            <Calendar size={14} />
            <span>Tahun Ajaran 2025/2026</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Pemasukan (Bulan ini)"
            value={`Rp ${stats.pemasukanBulanIni.toLocaleString('id-ID')}`}
            icon={TrendingUp}
            colorClass="green"
            trend={{ value: 0, isPositive: true }}
            delay={0.1}
          />
          <StatCard
            title="Total Pengeluaran (Bulan ini)"
            value={`Rp ${stats.pengeluaranBulanIni.toLocaleString('id-ID')}`}
            icon={TrendingDown}
            colorClass="pink"
            trend={{ value: 0, isPositive: false }}
            delay={0.2}
          />
          <StatCard
            title="Saldo Bersih"
            value={`Rp ${stats.saldoBersih.toLocaleString('id-ID')}`}
            icon={Wallet}
            colorClass="blue"
            delay={0.3}
          />
          <StatCard
            title="Total Siswa Aktif"
            value={stats.totalSiswa.toString()}
            icon={Users}
            colorClass="purple"
            delay={0.4}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Quick Menu & Attention */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Menus */}
            <section>
              <h2 className="text-base font-semibold text-white mb-4">Akses Cepat</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quickMenus.map((menu, i) => {
                  const Icon = menu.icon;
                  return (
                    <Link key={menu.name} href={menu.href}>
                      <motion.div
                        whileHover={{ y: -2 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * i }}
                        className="flex flex-col items-start p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all cursor-pointer h-24"
                      >
                        <Icon size={20} className="mb-2 text-text-secondary" />
                        <span className="text-sm font-medium text-white">{menu.name}</span>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Attention Section */}
            <section>
              <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                <AlertCircle size={18} className="text-yellow-500" />
                Perlu Perhatian
              </h2>
              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white text-sm">{stats.tunggakanCount} Tagihan Menunggak</h4>
                    <p className="text-xs text-text-secondary mt-1">Cek riwayat pembayaran & piutang siswa.</p>
                  </div>
                  <Link href="/dashboard/laporan" className="text-sm text-text-secondary hover:text-white transition-colors">
                    Detail &rarr;
                  </Link>
                </div>
                <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white text-sm">12 Tagihan Mendekati Jatuh Tempo</h4>
                    <p className="text-xs text-text-secondary mt-1">Jatuh tempo dalam 7 hari kedepan.</p>
                  </div>
                  <Link href="/dashboard/tagihan" className="text-sm text-text-secondary hover:text-white transition-colors">
                    Cek &rarr;
                  </Link>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Recent Activity */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-semibold text-white">Aktivitas Terbaru</h2>
                <Link href="/dashboard/riwayat" className="text-sm text-text-secondary hover:text-white transition-colors">
                  Semua &rarr;
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 pb-4 border-b border-white/10 last:border-0 last:pb-0">
                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${activity.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-white truncate pr-2">{activity.title}</p>
                        <span className={`text-sm font-medium whitespace-nowrap ${activity.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                          {activity.amount}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-text-secondary truncate">{activity.name}</p>
                        <time className="text-xs text-text-tertiary whitespace-nowrap ml-2">{activity.time}</time>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          
        </div>
      </div>
    </>
  );
}
