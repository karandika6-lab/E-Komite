'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { 
  TrendingUp, TrendingDown, Users, Calendar, 
  BarChart, PieChart, FileText, Activity, ArrowRight, Download 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { exportMultipleSheetsToExcel } from '@/utils/reportGenerator';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export default function LaporanHubPage() {
  const [isExporting, setIsExporting] = React.useState(false);
  const supabase = createClient();
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

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      // Fetch Pemasukan
      const { data: pemasukan } = await supabase.from('pembayaran').select(`
        id, jumlah, tanggal_bayar,
        siswa(nama_lengkap, kelas),
        tagihan(jenis_pembayaran(nama))
      `);
      
      // Fetch Pengeluaran
      const { data: pengeluaran } = await supabase.from('pengeluaran').select(`
        id, jumlah, tanggal, nama_pengeluaran,
        kategori_pengeluaran(nama)
      `);

      // Fetch Tunggakan (Tagihan)
      const { data: tagihan } = await supabase.from('tagihan').select(`
        id, sisa_tagihan, 
        siswa(nama_lengkap, kelas),
        jenis_pembayaran(nama)
      `).gt('sisa_tagihan', 0);

      // Fetch Anggaran
      const { data: anggaran } = await supabase.from('anggaran').select(`
        id, nominal_anggaran, kategori_pengeluaran_id,
        kategori_pengeluaran(nama)
      `);

      // Generate sheets data
      const sheets = [
        {
          title: 'Pemasukan',
          columns: [
            { header: 'Tanggal', key: 'tanggal', width: 20 },
            { header: 'Siswa', key: 'siswa', width: 30 },
            { header: 'Jenis Tagihan', key: 'jenis', width: 25 },
            { header: 'Jumlah', key: 'jumlah', width: 20 },
          ],
          data: ((pemasukan as any[]) || []).map(p => ({
            tanggal: format(new Date(p.tanggal_bayar), 'dd MMM yyyy', { locale: localeId }),
            siswa: `${p.siswa?.nama_lengkap} (${p.siswa?.kelas})`,
            jenis: p.tagihan?.jenis_pembayaran?.nama || '-',
            jumlah: p.jumlah
          }))
        },
        {
          title: 'Pengeluaran',
          columns: [
            { header: 'Tanggal', key: 'tanggal', width: 20 },
            { header: 'Uraian', key: 'uraian', width: 40 },
            { header: 'Kategori', key: 'kategori', width: 20 },
            { header: 'Nominal', key: 'nominal', width: 20 },
          ],
          data: ((pengeluaran as any[]) || []).map(p => ({
            tanggal: format(new Date(p.tanggal), 'dd MMM yyyy', { locale: localeId }),
            uraian: p.nama_pengeluaran,
            kategori: p.kategori_pengeluaran?.nama || '-',
            nominal: p.jumlah
          }))
        },
        {
          title: 'Tunggakan',
          columns: [
            { header: 'Nama Siswa', key: 'nama', width: 30 },
            { header: 'Kelas', key: 'kelas', width: 15 },
            { header: 'Jenis Tagihan', key: 'jenis', width: 20 },
            { header: 'Sisa Tunggakan', key: 'sisa', width: 20 },
          ],
          data: ((tagihan as any[]) || []).map(t => ({
            nama: t.siswa?.nama_lengkap,
            kelas: t.siswa?.kelas,
            jenis: t.jenis_pembayaran?.nama || '-',
            sisa: (t.jumlah_tagihan || 0) - (t.jumlah_bayar || 0)
          })),
        },
        {
          title: 'Tahunan',
          columns: [
            { header: 'Uraian', key: 'uraian', width: 40 },
            { header: 'Nominal', key: 'nominal', width: 25 },
          ],
          data: [
            { uraian: 'Total Pemasukan Tahunan', nominal: ((pemasukan as any[]) || []).reduce((a: any, b: any) => a + b.jumlah, 0) },
            { uraian: 'Total Pengeluaran Tahunan', nominal: ((pengeluaran as any[]) || []).reduce((a: any, b: any) => a + b.jumlah, 0) }
          ]
        }
      ];

      exportMultipleSheetsToExcel(sheets, 'Laporan_Keuangan_Terpadu_EKomite');
      toast.success('Berhasil export seluruh laporan');
    } catch(err: any) {
      toast.error('Gagal export laporan: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Pusat Laporan Keuangan</h1>
          <p className="text-sm text-text-secondary">Pilih jenis laporan yang ingin Anda lihat atau cetak.</p>
        </div>
        <Button onClick={handleExportAll} disabled={isExporting} size="lg" className="bg-green-600 hover:bg-green-700 disabled:opacity-50">
          {isExporting ? <span className="animate-spin text-white">...</span> : <Download size={18} className="mr-2" />}
          Unduh Seluruh Laporan (Excel)
        </Button>
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
