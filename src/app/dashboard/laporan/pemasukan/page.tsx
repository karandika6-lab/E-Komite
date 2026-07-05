'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Download, FileText, Calendar } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { format, isSameMonth, subMonths } from 'date-fns';
import { id } from 'date-fns/locale';
import { exportToExcel, exportToPDF } from '@/utils/reportGenerator';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function LaporanPemasukanPage() {
  const [dataPemasukan, setDataPemasukan] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  React.useEffect(() => {
    fetchPemasukan();
  }, []);

  const fetchPemasukan = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('pembayaran')
        .select(`
          *,
          siswa (nama_lengkap, kelas),
          tagihan (jenis_pembayaran (nama))
        `)
        .order('tanggal_bayar', { ascending: false });

      if (error) throw error;
      
      const formatted = data?.map((item: any) => ({
        id: item.id,
        tanggal: item.tanggal_bayar || item.created_at,
        no_kwitansi: item.no_kwitansi,
        siswa: item.siswa?.nama_lengkap || '-',
        kelas: item.siswa?.kelas || '-',
        jenis: item.tagihan?.jenis_pembayaran?.nama || '-',
        jumlah: item.jumlah
      })) || [];

      setDataPemasukan(formatted);
    } catch (error: any) {
      toast.error('Gagal mengambil laporan pemasukan: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'tanggal',
      header: 'Tanggal',
      cell: ({ row }) => format(new Date(row.getValue('tanggal')), 'dd MMM yyyy', { locale: id }),
    },
    {
      accessorKey: 'no_kwitansi',
      header: 'No. Kwitansi',
      cell: ({ row }) => <span className="text-neon-blue font-mono text-sm">{row.getValue('no_kwitansi')}</span>,
    },
    {
      accessorKey: 'siswa',
      header: 'Siswa',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-white">{row.getValue('siswa')}</div>
          <div className="text-xs text-text-tertiary">Kelas: {row.original.kelas}</div>
        </div>
      ),
    },
    {
      accessorKey: 'jenis',
      header: 'Jenis Tagihan',
    },
    {
      accessorKey: 'jumlah',
      header: 'Jumlah',
      cell: ({ row }) => <span className="text-neon-green font-bold">Rp ${(row.getValue('jumlah') as number).toLocaleString('id-ID')}</span>,
    },
  ];

  const [draftFilter, setDraftFilter] = useState({
    jenis: '',
    periode: 'semua',
    start: '',
    end: ''
  });
  
  const [appliedFilter, setAppliedFilter] = useState({
    jenis: '',
    periode: 'semua',
    start: '',
    end: ''
  });

  const displayData = dataPemasukan.filter(d => {
    const itemDate = new Date(d.tanggal);
    const today = new Date();
    
    // Filter Jenis
    if (appliedFilter.jenis === 'komite' && !d.jenis.toLowerCase().includes('komite')) return false;
    if (appliedFilter.jenis === 'semester' && !d.jenis.toLowerCase().includes('semester')) return false;
    
    // Filter Periode
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

  const total = displayData.reduce((sum, item) => sum + item.jumlah, 0);

  const handleApplyFilter = () => setAppliedFilter(draftFilter);
  const handleReset = () => {
    const resetState = { jenis: '', periode: 'semua', start: '', end: '' };
    setDraftFilter(resetState);
    setAppliedFilter(resetState);
  };

  const handleExportExcel = () => {
    const columns = [
      { header: 'Tanggal', key: 'tanggal', width: 20 },
      { header: 'No. Kwitansi', key: 'no_kwitansi', width: 15 },
      { header: 'Siswa', key: 'siswa', width: 30 },
      { header: 'Kelas', key: 'kelas', width: 15 },
      { header: 'Jenis Tagihan', key: 'jenis', width: 25 },
      { header: 'Jumlah', key: 'jumlah', width: 20 },
    ];
    const data = displayData.map(d => ({
      ...d,
      tanggal: format(new Date(d.tanggal), 'dd MMM yyyy', { locale: id }),
    }));
    exportToExcel('Laporan Pemasukan', columns, data, 'Laporan_Pemasukan_EKomite');
  };

  const handleExportPDF = () => {
    const columns = [
      { header: 'Tanggal', key: 'tanggal' },
      { header: 'No. Kwitansi', key: 'no_kwitansi' },
      { header: 'Siswa', key: 'siswa' },
      { header: 'Kelas', key: 'kelas' },
      { header: 'Jenis Tagihan', key: 'jenis' },
      { header: 'Jumlah (Rp)', key: 'jumlahStr' },
    ];
    const data = displayData.map(d => ({
      ...d,
      tanggal: format(new Date(d.tanggal), 'dd MMM yyyy', { locale: id }),
      jumlahStr: d.jumlah.toLocaleString('id-ID')
    }));
    exportToPDF('Laporan Pemasukan', columns, data, 'Laporan_Pemasukan_EKomite');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Laporan Pemasukan</h1>
          <p className="text-sm text-text-secondary">Rekapitulasi pembayaran masuk per periode.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button onClick={handleExportPDF} variant="outline" size="sm" className="hidden md:flex text-neon-pink border-neon-pink hover:bg-neon-pink/10">
            <FileText size={16} className="mr-2" />
            Export PDF
          </Button>
          <Button onClick={handleExportExcel} size="sm" className="bg-green-600 hover:bg-green-700">
            <Download size={16} className="mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 mb-4 items-stretch">
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

            <div className="flex-1 w-full">
              <label className="text-[10px] uppercase tracking-wider text-text-secondary mb-1 block">Jenis Pembayaran</label>
              <select 
                value={draftFilter.jenis} 
                onChange={(e) => setDraftFilter({...draftFilter, jenis: e.target.value})}
                className="w-full h-9 rounded-lg bg-bg-elevated border border-white/10 px-3 text-sm text-text-primary focus:outline-none focus:border-neon-blue transition-all"
              >
                <option value="">Semua Jenis</option>
                <option value="komite">Uang Komite</option>
                <option value="semester">Semesteran</option>
              </select>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
              <Button onClick={handleReset} variant="ghost" size="sm" className="h-9 px-3 text-text-secondary hover:text-white">Reset</Button>
              <Button onClick={handleApplyFilter} size="sm" className="h-9 px-4">Terapkan Filter</Button>
            </div>
          </div>
        </Card>

        <Card glass className="!p-4 xl:w-64 flex flex-row xl:flex-col justify-between xl:justify-center items-center xl:items-start border-l-4 border-l-neon-green">
          <p className="text-[11px] uppercase tracking-wider text-text-secondary mb-0 xl:mb-1">Total Pemasukan</p>
          <p className="text-xl font-bold text-neon-green">Rp {total.toLocaleString('id-ID')}</p>
        </Card>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="py-20 text-center text-gray-400">Memuat laporan pemasukan...</div>
        ) : (
          <DataTable columns={columns} data={displayData} />
        )}
      </div>
    </div>
  );
}
