'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { 
  TrendingUp, TrendingDown, Download, Loader2, ArrowRight,
  BookOpen, Clock, Wallet, GraduationCap, Heart, Shield,
  Users, Shirt, Award, TreePine, Sparkles, Building
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { exportLaporanLengkapToExcel } from '@/utils/reportGenerator';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

// Kategori Uang Masuk (4)
const laporanMasuk = [
  {
    title: 'Administrasi Tahun Berjalan',
    desc: 'Rekap pemasukan administrasi siswa tahun berjalan.',
    icon: BookOpen,
    color: 'green',
  },
  {
    title: 'Administrasi Tahun Lalu',
    desc: 'Rekap pemasukan administrasi siswa tahun sebelumnya.',
    icon: Clock,
    color: 'green',
  },
  {
    title: 'Kas Kegiatan',
    desc: 'Rekap pemasukan dari kegiatan madrasah.',
    icon: Sparkles,
    color: 'green',
  },
  {
    title: 'Lainnya',
    desc: 'Rekap pemasukan dari sumber lainnya.',
    icon: Wallet,
    color: 'green',
  },
];

// Kategori Uang Keluar (9)
const laporanKeluar = [
  {
    title: 'Pendaftaran',
    desc: 'Rekap pengeluaran untuk pendaftaran.',
    icon: GraduationCap,
    color: 'pink',
  },
  {
    title: 'Infak Yayasan',
    desc: 'Rekap pengeluaran untuk infak yayasan.',
    icon: Heart,
    color: 'pink',
  },
  {
    title: 'MPLM/MOS',
    desc: 'Rekap pengeluaran kegiatan MPLM/MOS.',
    icon: Users,
    color: 'orange',
  },
  {
    title: 'Atribut, Batik & Training',
    desc: 'Rekap pengeluaran atribut, batik & training.',
    icon: Shirt,
    color: 'orange',
  },
  {
    title: 'DPP',
    desc: 'Rekap pengeluaran Dana Pengembangan Pendidikan.',
    icon: Award,
    color: 'purple',
  },
  {
    title: 'UKS & OSIS',
    desc: 'Rekap pengeluaran UKS dan OSIS.',
    icon: Shield,
    color: 'purple',
  },
  {
    title: 'Pramuka',
    desc: 'Rekap pengeluaran kegiatan pramuka.',
    icon: TreePine,
    color: 'orange',
  },
  {
    title: 'Life Skill',
    desc: 'Rekap pengeluaran program life skill.',
    icon: Sparkles,
    color: 'purple',
  },
  {
    title: 'Komite Madrasah',
    desc: 'Rekap pengeluaran komite madrasah.',
    icon: Building,
    color: 'pink',
  },
];

const colors: Record<string, string> = {
  green: 'from-neon-green to-emerald-600 shadow-neon-green/20 text-neon-green',
  pink: 'from-neon-pink to-rose-600 shadow-neon-pink/20 text-neon-pink',
  orange: 'from-neon-orange to-orange-600 shadow-neon-orange/20 text-neon-orange',
  purple: 'from-neon-purple to-purple-600 shadow-neon-purple/20 text-neon-purple',
  blue: 'from-neon-blue to-blue-600 shadow-neon-blue/20 text-neon-blue',
};

function LaporanCard({ item, index, kategoriMap }: { item: typeof laporanMasuk[0]; index: number; kategoriMap: Record<string, string> }) {
  const Icon = item.icon;
  const colorStyles = colors[item.color];
  const bgGradient = `bg-gradient-to-br ${colorStyles.split(' ').slice(0, 2).join(' ')}`;
  const shadowColor = colorStyles.split(' ')[2];
  const textColor = colorStyles.split(' ')[3];

  // Resolve kategori_id from name
  const kategoriId = kategoriMap[item.title];
  const href = kategoriId
    ? `/dashboard/laporan/detail?kategori=${kategoriId}`
    : '#';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={href}>
        <Card glass className="h-full hover:border-white/20 transition-all group cursor-pointer flex flex-col">
          <div className={`w-11 h-11 rounded-xl ${bgGradient} flex items-center justify-center shadow-lg ${shadowColor} mb-3 transform group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={20} className="text-white" />
          </div>
          <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-neon-blue transition-colors leading-tight">
            {item.title}
          </h3>
          <p className="text-xs text-text-secondary flex-1 mb-3 leading-relaxed">
            {item.desc}
          </p>
          <div className={`flex items-center text-xs font-medium ${textColor} mt-auto`}>
            Lihat Laporan <ArrowRight size={14} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

export default function LaporanHubPage() {
  const [isExporting, setIsExporting] = React.useState(false);
  const [kategoriMap, setKategoriMap] = React.useState<Record<string, string>>({});
  const supabase = createClient();

  React.useEffect(() => {
    fetchKategoriMap();
  }, []);

  const fetchKategoriMap = async () => {
    try {
      const { data, error } = await supabase
        .from('kategori_buku_kas')
        .select('id, nama');
      
      if (error) throw error;
      
      const map: Record<string, string> = {};
      data?.forEach((kat: any) => {
        map[kat.nama] = kat.id;
      });
      setKategoriMap(map);
    } catch (err) {
      console.error('Failed to load kategori map:', err);
    }
  };

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      // Fetch all buku_kas data grouped by category
      const { data, error } = await supabase
        .from('buku_kas')
        .select(`
          *,
          kategori_buku_kas (nama, tipe),
          siswa (nama_lengkap, angkatan)
        `)
        .order('tanggal', { ascending: true });

      if (error) throw error;

      // Group data by kategori
      const grouped: Record<string, any[]> = {};
      const summaryMasuk: Record<string, number> = {};
      const summaryKeluar: Record<string, number> = {};
      let totalMasuk = 0;
      let totalKeluar = 0;

      // Initialize with 0 for all categories to ensure they appear in the summary
      laporanMasuk.forEach(k => summaryMasuk[k.title] = 0);
      laporanKeluar.forEach(k => summaryKeluar[k.title] = 0);

      (data || []).forEach((item: any) => {
        const kategoriNama = item.kategori_buku_kas?.nama || 'Tanpa Kategori';
        const tipe = item.kategori_buku_kas?.tipe;
        
        if (!grouped[kategoriNama]) grouped[kategoriNama] = [];
        grouped[kategoriNama].push(item);

        const m = Number(item.kas_masuk) || 0;
        const k = Number(item.kas_keluar) || 0;

        if (tipe === 'MASUK') {
          if (summaryMasuk[kategoriNama] === undefined) summaryMasuk[kategoriNama] = 0;
          summaryMasuk[kategoriNama] += m;
          totalMasuk += m;
        } else if (tipe === 'KELUAR') {
          if (summaryKeluar[kategoriNama] === undefined) summaryKeluar[kategoriNama] = 0;
          summaryKeluar[kategoriNama] += k;
          totalKeluar += k;
        }
      });

      const summaryData = {
        pemasukan: Object.keys(summaryMasuk).map(k => ({ nama: k, total: summaryMasuk[k] })),
        pengeluaran: Object.keys(summaryKeluar).map(k => ({ nama: k, total: summaryKeluar[k] })),
        totalPemasukan: totalMasuk,
        totalPengeluaran: totalKeluar,
        sisaKas: totalMasuk - totalKeluar
      };

      // Generate sheets
      const sheets = Object.entries(grouped).map(([kategoriNama, items]) => ({
        title: kategoriNama.substring(0, 31), // Excel sheet name max 31 chars
        columns: [
          { header: 'Tanggal', key: 'tanggal', width: 15 },
          { header: 'Uraian', key: 'uraian', width: 35 },
          { header: 'Siswa', key: 'siswa', width: 25 },
          { header: 'Kas Masuk', key: 'kas_masuk', width: 18 },
          { header: 'Kas Keluar', key: 'kas_keluar', width: 18 },
        ],
        data: items.map((item: any) => ({
          tanggal: format(new Date(item.tanggal), 'dd MMM yyyy', { locale: localeId }),
          uraian: item.uraian,
          siswa: item.siswa ? `${item.siswa.nama_lengkap} (Angkatan ${item.siswa.angkatan})` : '-',
          kas_masuk: item.kas_masuk > 0 ? item.kas_masuk : '',
          kas_keluar: item.kas_keluar > 0 ? item.kas_keluar : '',
        })),
      }));

      await exportLaporanLengkapToExcel(summaryData, sheets, 'Laporan_Keuangan_Lengkap_EKomite');
      toast.success('Berhasil export seluruh laporan');
    } catch (err: any) {
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
          <p className="text-sm text-text-secondary">13 laporan tersinkronisasi dengan data Buku Kas.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleExportAll} 
          disabled={isExporting} 
          className="text-sm font-medium border-white/20 text-text-primary hover:bg-white/5 hover:border-white/40 hover:text-white"
        >
          {isExporting ? <Loader2 size={16} className="mr-2 animate-spin text-text-secondary" /> : <Download size={16} className="mr-2 text-neon-blue" />}
          Unduh Semua (Excel)
        </Button>
      </div>

      {/* Pemasukan Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-neon-green/10 flex items-center justify-center border border-neon-green/20">
            <TrendingUp size={16} className="text-neon-green" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Laporan Pemasukan</h2>
            <p className="text-xs text-text-tertiary">4 kategori uang masuk</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {laporanMasuk.map((item, i) => (
            <LaporanCard key={item.title} item={item} index={i} kategoriMap={kategoriMap} />
          ))}
        </div>
      </div>

      {/* Pengeluaran Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-neon-pink/10 flex items-center justify-center border border-neon-pink/20">
            <TrendingDown size={16} className="text-neon-pink" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Laporan Pengeluaran</h2>
            <p className="text-xs text-text-tertiary">9 kategori uang keluar</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {laporanKeluar.map((item, i) => (
            <LaporanCard key={item.title} item={item} index={i + 4} kategoriMap={kategoriMap} />
          ))}
        </div>
      </div>
    </div>
  );
}
