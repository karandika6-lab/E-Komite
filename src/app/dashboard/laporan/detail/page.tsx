'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/Table';
import { 
  ArrowLeft, Download, Printer, Loader2, FileText, 
  TrendingUp, TrendingDown, User, Calendar
} from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { exportToExcel, exportToPDF } from '@/utils/reportGenerator';
import { format, isSameMonth, subMonths } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface KategoriInfo {
  id: string;
  nama: string;
  tipe: 'MASUK' | 'KELUAR';
  perlu_siswa: boolean;
}

interface LaporanRow {
  id: string;
  tanggal: string;
  uraian: string;
  nominal: number;
  siswa_nama?: string;
  siswa_angkatan?: number;
  siswa_nis?: string;
}

function LaporanContent() {
  const searchParams = useSearchParams();
  const kategoriId = searchParams.get('kategori');

  const [kategori, setKategori] = useState<KategoriInfo | null>(null);
  const [dataLaporan, setDataLaporan] = useState<LaporanRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [draftFilter, setDraftFilter] = useState({
    periode: 'semua',
    start: '',
    end: '',
  });
  const [appliedFilter, setAppliedFilter] = useState({
    periode: 'semua',
    start: '',
    end: '',
  });

  const supabase = createClient();

  useEffect(() => {
    if (kategoriId) {
      fetchKategoriInfo();
      fetchLaporanData();
    } else {
      setIsLoading(false);
    }
  }, [kategoriId]);

  const fetchKategoriInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('kategori_buku_kas')
        .select('id, nama, tipe, perlu_siswa')
        .eq('id', kategoriId as string)
        .single();

      if (error) throw error;
      setKategori(data as KategoriInfo);
    } catch (err: any) {
      toast.error('Gagal memuat info kategori: ' + err.message);
    }
  };

  const fetchLaporanData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('buku_kas')
        .select(`
          id, tanggal, uraian, kas_masuk, kas_keluar,
          siswa (nama_lengkap, angkatan, nis),
          kategori_buku_kas (tipe)
        `)
        .eq('kategori_id', kategoriId as string)
        .order('tanggal', { ascending: false });

      if (error) throw error;

      const formatted: LaporanRow[] = (data || []).map((item: any) => ({
        id: item.id,
        tanggal: item.tanggal,
        uraian: item.uraian,
        nominal: item.kategori_buku_kas?.tipe === 'MASUK'
          ? Number(item.kas_masuk)
          : Number(item.kas_keluar),
        siswa_nama: item.siswa?.nama_lengkap,
        siswa_angkatan: item.siswa?.angkatan,
        siswa_nis: item.siswa?.nis,
      }));

      setDataLaporan(formatted);
    } catch (err: any) {
      toast.error('Gagal memuat data laporan: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!kategoriId) {
    return (
      <div className="py-20 text-center">
        <p className="text-text-tertiary">Kategori tidak ditemukan. Silakan kembali ke halaman laporan.</p>
        <Link href="/dashboard/laporan" className="text-neon-blue hover:underline mt-4 inline-block">
          Kembali ke Pusat Laporan
        </Link>
      </div>
    );
  }

  // Filtered data
  const displayData = dataLaporan.filter(d => {
    const itemDate = new Date(d.tanggal);
    const today = new Date();

    if (appliedFilter.periode === 'bulan_ini') {
      if (!isSameMonth(itemDate, today)) return false;
    } else if (appliedFilter.periode === 'bulan_lalu') {
      if (!isSameMonth(itemDate, subMonths(today, 1))) return false;
    } else if (appliedFilter.periode === 'custom') {
      if (appliedFilter.start && itemDate < new Date(appliedFilter.start)) return false;
      if (appliedFilter.end) {
        const endDate = new Date(appliedFilter.end);
        endDate.setHours(23, 59, 59, 999);
        if (itemDate > endDate) return false;
      }
    }

    return true;
  });

  const total = displayData.reduce((sum, item) => sum + item.nominal, 0);

  const handleApplyFilter = () => setAppliedFilter(draftFilter);
  const handleReset = () => {
    const resetState = { periode: 'semua', start: '', end: '' };
    setDraftFilter(resetState);
    setAppliedFilter(resetState);
  };

  // Build columns dynamically based on whether this category involves students
  const baseColumns: ColumnDef<LaporanRow>[] = [
    {
      accessorKey: 'tanggal',
      header: 'Tanggal',
      cell: ({ row }) => format(new Date(row.getValue('tanggal')), 'dd MMM yyyy', { locale: localeId }),
    },
  ];

  // Add siswa columns if this kategori involves students
  if (kategori?.perlu_siswa) {
    baseColumns.push(
      {
        accessorKey: 'siswa_nama',
        header: 'Nama Siswa',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-neon-blue/10 flex items-center justify-center text-[10px] font-bold text-neon-blue border border-neon-blue/10">
              {row.original.siswa_nama?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <div className="font-medium text-white text-sm">{row.original.siswa_nama || '-'}</div>
              <div className="text-[10px] text-text-tertiary">NIS: {row.original.siswa_nis || '-'}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'siswa_angkatan',
        header: 'Angkatan',
        cell: ({ row }) => (
          <span className="bg-neon-blue/10 text-neon-blue px-2 py-0.5 rounded text-xs font-medium border border-neon-blue/20">
            {row.original.siswa_angkatan || '-'}
          </span>
        ),
      }
    );
  }

  baseColumns.push(
    {
      accessorKey: 'uraian',
      header: 'Uraian',
      cell: ({ row }) => <span className="text-white font-medium">{row.getValue('uraian')}</span>,
    },
    {
      accessorKey: 'nominal',
      header: 'Nominal',
      cell: ({ row }) => {
        const nominal = row.getValue('nominal') as number;
        const isMasuk = kategori?.tipe === 'MASUK';
        return (
          <span className={`font-bold ${isMasuk ? 'text-neon-green' : 'text-red-400'}`}>
            {isMasuk ? '' : '- '}Rp {nominal.toLocaleString('id-ID')}
          </span>
        );
      },
    }
  );

  // Export handlers
  const handleExportExcel = () => {
    const cols = [
      { header: 'Tanggal', key: 'tanggal', width: 18 },
      ...(kategori?.perlu_siswa ? [
        { header: 'Nama Siswa', key: 'siswa_nama', width: 30 },
        { header: 'NIS', key: 'siswa_nis', width: 15 },
        { header: 'Angkatan', key: 'siswa_angkatan', width: 12 },
      ] : []),
      { header: 'Uraian', key: 'uraian', width: 35 },
      { header: 'Nominal', key: 'nominal', width: 20 },
    ];

    const exportData = displayData.map(d => ({
      ...d,
      tanggal: format(new Date(d.tanggal), 'dd MMM yyyy', { locale: localeId }),
    }));

    const safeName = (kategori?.nama || 'Laporan').replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_');
    exportToExcel(`Laporan ${kategori?.nama}`, cols, exportData, `Laporan_${safeName}_EKomite`);
    toast.success('Berhasil export ke Excel');
  };

  const handleExportPDF = () => {
    const cols = [
      { header: 'Tanggal', key: 'tanggal' },
      ...(kategori?.perlu_siswa ? [
        { header: 'Nama Siswa', key: 'siswa_nama' },
        { header: 'NIS', key: 'siswa_nis' },
        { header: 'Angkatan', key: 'siswa_angkatan' },
      ] : []),
      { header: 'Uraian', key: 'uraian' },
      { header: 'Nominal (Rp)', key: 'nominalStr' },
    ];

    const exportData = displayData.map(d => ({
      ...d,
      tanggal: format(new Date(d.tanggal), 'dd MMM yyyy', { locale: localeId }),
      nominalStr: d.nominal.toLocaleString('id-ID'),
    }));

    const safeName = (kategori?.nama || 'Laporan').replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_');
    exportToPDF(`Laporan ${kategori?.nama}`, cols, exportData, `Laporan_${safeName}_EKomite`);
    toast.success('Berhasil export ke PDF');
  };

  const isMasuk = kategori?.tipe === 'MASUK';

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/laporan" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">
                Laporan {kategori?.nama || '...'}
              </h1>
              {kategori && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                  isMasuk
                    ? 'bg-neon-green/10 text-neon-green border-neon-green/20'
                    : 'bg-neon-pink/10 text-neon-pink border-neon-pink/20'
                }`}>
                  {isMasuk ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {isMasuk ? 'Pemasukan' : 'Pengeluaran'}
                </span>
              )}
            </div>
            <p className="text-sm text-text-secondary mt-0.5">
              {kategori?.perlu_siswa
                ? 'Data transaksi per siswa untuk kategori ini.'
                : 'Data transaksi untuk kategori ini.'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleExportPDF} variant="outline" size="sm" className="text-neon-pink border-neon-pink/30 hover:bg-neon-pink/10">
            <FileText size={16} className="mr-2" />
            Export PDF
          </Button>
          <Button onClick={handleExportExcel} size="sm" className="bg-green-600 hover:bg-green-700">
            <Download size={16} className="mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filters + Summary */}
      <div className="flex flex-col xl:flex-row gap-4 items-stretch">
        <Card glass className="!p-4 flex-1 flex flex-col justify-center">
          <div className="flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <label className="text-[10px] uppercase tracking-wider text-text-secondary mb-1 block">Periode Laporan</label>
              <select
                value={draftFilter.periode}
                onChange={(e) => setDraftFilter({...draftFilter, periode: e.target.value})}
                className="w-full h-9 rounded-lg bg-bg-elevated border border-white/10 px-3 text-sm text-text-primary focus:outline-none focus:border-neon-blue transition-all"
              >
                <option value="semua">Semua Waktu</option>
                <option value="bulan_ini">Bulan Ini</option>
                <option value="bulan_lalu">Bulan Kemarin</option>
                <option value="custom">Pilih Tanggal Kustom...</option>
              </select>
            </div>

            {draftFilter.periode === 'custom' && (
              <>
                <div className="flex-1 w-full">
                  <label className="text-[10px] uppercase tracking-wider text-text-secondary mb-1 block">Mulai</label>
                  <input
                    type="date"
                    value={draftFilter.start}
                    onChange={(e) => setDraftFilter({...draftFilter, start: e.target.value})}
                    className="w-full h-9 rounded-lg bg-bg-elevated border border-white/10 px-3 text-sm text-text-primary focus:outline-none focus:border-neon-blue transition-all"
                  />
                </div>
                <div className="flex-1 w-full">
                  <label className="text-[10px] uppercase tracking-wider text-text-secondary mb-1 block">Selesai</label>
                  <input
                    type="date"
                    value={draftFilter.end}
                    onChange={(e) => setDraftFilter({...draftFilter, end: e.target.value})}
                    className="w-full h-9 rounded-lg bg-bg-elevated border border-white/10 px-3 text-sm text-text-primary focus:outline-none focus:border-neon-blue transition-all"
                  />
                </div>
              </>
            )}

            <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
              <Button onClick={handleReset} variant="ghost" size="sm" className="h-9 px-3 text-text-secondary hover:text-white">Reset</Button>
              <Button onClick={handleApplyFilter} size="sm" className="h-9 px-4">Terapkan Filter</Button>
            </div>
          </div>
        </Card>

        <Card glass className={`!p-4 xl:w-64 flex flex-row xl:flex-col justify-between xl:justify-center items-center xl:items-start border-l-4 ${
          isMasuk ? 'border-l-neon-green' : 'border-l-neon-pink'
        }`}>
          <p className="text-[11px] uppercase tracking-wider text-text-secondary mb-0 xl:mb-1">
            Total {isMasuk ? 'Pemasukan' : 'Pengeluaran'}
          </p>
          <p className={`text-xl font-bold ${isMasuk ? 'text-neon-green' : 'text-neon-pink'}`}>
            Rp {total.toLocaleString('id-ID')}
          </p>
          <p className="text-[10px] text-text-tertiary mt-0.5">
            {displayData.length} transaksi
          </p>
        </Card>
      </div>

      {/* Data Table */}
      <div className="mt-4">
        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 size={32} className="animate-spin text-neon-blue mx-auto mb-3" />
            <p className="text-text-tertiary">Memuat laporan...</p>
          </div>
        ) : displayData.length === 0 ? (
          <Card glass className="py-16 text-center">
            <Calendar size={40} className="mx-auto text-text-tertiary mb-3 opacity-50" />
            <p className="text-text-secondary font-medium">Belum ada data transaksi</p>
            <p className="text-xs text-text-tertiary mt-1">
              Data akan muncul setelah Anda input transaksi dengan kategori ini di Buku Kas.
            </p>
          </Card>
        ) : (
          <DataTable columns={baseColumns} data={displayData} />
        )}
      </div>
    </div>
  );
}

export default function LaporanKategoriPage() {
  return (
    <Suspense fallback={
      <div className="py-20 text-center">
        <Loader2 size={32} className="animate-spin text-neon-blue mx-auto mb-3" />
        <p className="text-text-tertiary">Memuat laporan...</p>
      </div>
    }>
      <LaporanContent />
    </Suspense>
  );
}
