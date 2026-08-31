'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { 
  TrendingUp, TrendingDown, Download, Loader2, ArrowRight,
  BookOpen, Clock, Wallet, GraduationCap, Heart, Shield,
  Users, Shirt, Award, TreePine, Sparkles, Building,
  FileText, Share2, Filter, Printer, FileCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { exportLaporanLengkapToExcel, exportRekapTagihanPDFLandscape, RekapTagihanSiswaItem } from '@/utils/reportGenerator';
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
  const [isExportingPdf, setIsExportingPdf] = React.useState(false);
  const [kategoriMap, setKategoriMap] = React.useState<Record<string, string>>({});
  const [angkatanList, setAngkatanList] = React.useState<string[]>([]);
  const [selectedAngkatan, setSelectedAngkatan] = React.useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('Semua');
  const supabase = createClient();

  React.useEffect(() => {
    fetchKategoriMap();
    fetchAngkatanList();
  }, []);

  const fetchAngkatanList = async () => {
    try {
      const { data, error } = await supabase
        .from('siswa')
        .select('angkatan');
      if (!error && data) {
        const distinct = Array.from(new Set(data.map((item: any) => String(item.angkatan)).filter(Boolean))).sort().reverse();
        setAngkatanList(distinct);
      }
    } catch (err) {
      console.error('Failed to load angkatan list:', err);
    }
  };

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

  const handleExportRekapTagihanPDF = async () => {
    setIsExportingPdf(true);
    try {
      let query = supabase
        .from('siswa')
        .select(`
          id, nis, nama_lengkap, kelas, angkatan, status,
          tagihan (
            id, total_tagihan, total_dibayar, sisa_tagihan, status, periode,
            jenis_pembayaran (nama)
          )
        `)
        .order('nama_lengkap', { ascending: true });

      if (selectedAngkatan && selectedAngkatan !== 'Semua') {
        query = query.eq('angkatan', selectedAngkatan);
      }

      const { data: siswaList, error } = await query;
      if (error) throw error;

      if (!siswaList || siswaList.length === 0) {
        toast.error('Tidak ada data siswa ditemukan');
        return;
      }

      const formattedData: RekapTagihanSiswaItem[] = siswaList.map((item: any) => {
        const tagihanArr = item.tagihan || [];
        const totalTagihan = tagihanArr.reduce((sum: number, t: any) => sum + (Number(t.total_tagihan) || 0), 0);
        const totalDibayar = tagihanArr.reduce((sum: number, t: any) => sum + (Number(t.total_dibayar) || 0), 0);
        const sisaTagihan = tagihanArr.reduce((sum: number, t: any) => sum + (Number(t.sisa_tagihan) || 0), 0);

        let statusBayar = 'LUNAS';
        if (tagihanArr.length === 0) {
          statusBayar = 'TANPA TAGIHAN';
        } else {
          const adaBelumLunas = tagihanArr.some((t: any) => t.status === 'BELUM_LUNAS' || t.sisa_tagihan > 0);
          const adaCicilan = tagihanArr.some((t: any) => t.status === 'CICILAN');
          const semuaLunas = tagihanArr.every((t: any) => t.status === 'LUNAS' || t.sisa_tagihan === 0);

          if (semuaLunas) {
            statusBayar = 'LUNAS';
          } else if (adaCicilan) {
            statusBayar = 'CICILAN';
          } else if (adaBelumLunas) {
            statusBayar = 'BELUM LUNAS';
          }
        }

        const rincianTagihan = tagihanArr.map((t: any) => ({
          nama: (t.jenis_pembayaran?.nama || 'Tagihan') + (t.periode ? ` (${t.periode})` : ''),
          nominal: Number(t.total_tagihan) || 0,
          dibayar: Number(t.total_dibayar) || 0,
          sisa: Number(t.sisa_tagihan) || 0,
          status: t.status === 'LUNAS' ? 'Lunas' : (t.status === 'CICILAN' ? 'Cicilan' : 'Belum Lunas')
        }));

        return {
          id: item.id,
          nis: item.nis || '-',
          nama: item.nama_lengkap,
          kelas: item.kelas || '-',
          angkatan: item.angkatan,
          statusBayar,
          totalTagihan,
          totalDibayar,
          sisaTagihan,
          rincianTagihan
        };
      });

      let finalData = formattedData;
      if (selectedStatus && selectedStatus !== 'Semua') {
        if (selectedStatus === 'BELUM_LUNAS') {
          finalData = formattedData.filter(s => s.sisaTagihan > 0 || s.statusBayar === 'BELUM LUNAS' || s.statusBayar === 'CICILAN');
        } else if (selectedStatus === 'LUNAS') {
          finalData = formattedData.filter(s => s.statusBayar === 'LUNAS');
        } else if (selectedStatus === 'CICILAN') {
          finalData = formattedData.filter(s => s.statusBayar === 'CICILAN');
        }
      }

      if (finalData.length === 0) {
        toast.warning('Tidak ada data siswa yang sesuai dengan filter tersebut.');
        return;
      }

      exportRekapTagihanPDFLandscape(
        finalData,
        { angkatan: selectedAngkatan, status: selectedStatus },
        `Rekap_Tagihan_Siswa_${selectedAngkatan !== 'Semua' ? 'Angkatan_' + selectedAngkatan : 'Semua'}_${format(new Date(), 'yyyyMMdd')}`
      );

      toast.success(`Berhasil mengunduh PDF Rekap Tagihan (${finalData.length} siswa)`);
    } catch (err: any) {
      toast.error('Gagal mengunduh PDF: ' + err.message);
    } finally {
      setIsExportingPdf(false);
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

      {/* Featured Card: Unduh Rekap Tagihan Siswa (PDF Landscape) */}
      <Card glass className="p-5 border-neon-blue/30 bg-gradient-to-r from-neon-blue/10 via-blue-950/20 to-transparent relative overflow-hidden">
        <div className="flex flex-col gap-4 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-blue-600 flex items-center justify-center shadow-md shadow-neon-blue/20 shrink-0">
                <FileText size={20} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-base font-bold text-white tracking-wide">
                    Unduh Rekap Tagihan Siswa (PDF Landscape)
                  </h2>
                  <span className="whitespace-nowrap shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neon-blue/20 text-neon-blue border border-neon-blue/30">
                    Siap Share WA & Print
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-0.5">
                  Rekapitulasi PDF A4 Landscape berisi daftar seluruh siswa dan status pelunasannya.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Angkatan */}
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs">
                <Filter size={14} className="text-neon-blue shrink-0" />
                <span className="text-text-secondary font-medium">Angkatan:</span>
                <select
                  value={selectedAngkatan}
                  onChange={(e) => setSelectedAngkatan(e.target.value)}
                  className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer pr-1"
                >
                  <option value="Semua" className="bg-[#1e293b] text-white">Semua Angkatan</option>
                  {angkatanList.map((a) => (
                    <option key={a} value={a} className="bg-[#1e293b] text-white">Angkatan {a}</option>
                  ))}
                </select>
              </div>

              {/* Filter Status */}
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs">
                <span className="text-text-secondary font-medium">Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer pr-1"
                >
                  <option value="Semua" className="bg-[#1e293b] text-white">Semua Status</option>
                  <option value="BELUM_LUNAS" className="bg-[#1e293b] text-white">Belum Lunas / Tunggakan</option>
                  <option value="CICILAN" className="bg-[#1e293b] text-white">Cicilan</option>
                  <option value="LUNAS" className="bg-[#1e293b] text-white">Lunas</option>
                </select>
              </div>
            </div>

            {/* Download Button */}
            <Button
              onClick={handleExportRekapTagihanPDF}
              disabled={isExportingPdf}
              className="bg-gradient-to-r from-neon-blue to-blue-600 hover:from-blue-600 hover:to-neon-blue text-white shadow-md shadow-neon-blue/20 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 sm:ml-auto"
            >
              {isExportingPdf ? (
                <Loader2 size={15} className="animate-spin text-white" />
              ) : (
                <Download size={15} />
              )}
              Unduh PDF Landscape
            </Button>
          </div>
        </div>
      </Card>

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
