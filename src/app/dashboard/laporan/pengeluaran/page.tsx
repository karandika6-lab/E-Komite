'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Printer, Download, Filter } from 'lucide-react';
import Link from 'next/link';
import { DataTable } from '@/components/ui/Table';
import { exportToExcel, exportToPDF } from '@/utils/reportGenerator';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function LaporanPengeluaranPage() {
  const [dataPengeluaran, setDataPengeluaran] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  React.useEffect(() => {
    fetchPengeluaran();
  }, []);

  const fetchPengeluaran = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('pengeluaran')
        .select(`
          *,
          kategori_pengeluaran (nama)
        `)
        .order('tanggal', { ascending: false });

      if (error) throw error;
      
      const formatted = data?.map((item: any) => ({
        id: item.id,
        tanggal: item.tanggal,
        noBukti: item.no_bukti,
        uraian: item.nama_pengeluaran,
        kategori: item.kategori_pengeluaran?.nama || '-',
        nominal: item.jumlah
      })) || [];

      setDataPengeluaran(formatted);
    } catch (error: any) {
      toast.error('Gagal mengambil laporan pengeluaran: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  const columns = [
    { accessorKey: 'tanggal', header: 'Tanggal' },
    { accessorKey: 'noBukti', header: 'No. Bukti' },
    { accessorKey: 'uraian', header: 'Uraian Pengeluaran', cell: ({ row }: any) => <span className="font-medium text-white">{row.getValue('uraian')}</span> },
    { accessorKey: 'kategori', header: 'Kategori', cell: ({ row }: any) => <span className="bg-pink-500/10 text-pink-400 px-2.5 py-1 rounded-md text-xs font-semibold border border-pink-500/20">{row.getValue('kategori')}</span> },
    { accessorKey: 'nominal', header: 'Nominal (Rp)', cell: ({ row }: any) => <div className="text-right font-bold text-red-400">- {row.getValue('nominal').toLocaleString('id-ID')}</div> },
  ];

  const [bulanFilter, setBulanFilter] = useState('');

  const displayData = dataPengeluaran.filter(d => {
    if (bulanFilter) {
      // d.tanggal is 'YYYY-MM-DD', we split and check the month part
      const month = d.tanggal.split('-')[1];
      return month === bulanFilter;
    }
    return true;
  });

  const totalPengeluaran = displayData.reduce((sum, item) => sum + item.nominal, 0);

  const handleExportExcel = () => {
    const exportCols = [
      { header: 'Tanggal', key: 'tanggal', width: 20 },
      { header: 'No. Bukti', key: 'noBukti', width: 15 },
      { header: 'Uraian Pengeluaran', key: 'uraian', width: 40 },
      { header: 'Kategori', key: 'kategori', width: 20 },
      { header: 'Nominal', key: 'nominal', width: 20 },
    ];
    exportToExcel('Laporan Pengeluaran', exportCols, displayData, 'Laporan_Pengeluaran_EKomite');
  };

  const handleExportPDF = () => {
    const exportCols = [
      { header: 'Tanggal', key: 'tanggal' },
      { header: 'No. Bukti', key: 'noBukti' },
      { header: 'Uraian Pengeluaran', key: 'uraian' },
      { header: 'Kategori', key: 'kategori' },
      { header: 'Nominal (Rp)', key: 'nominalStr' },
    ];
    const data = displayData.map(d => ({
      ...d,
      nominalStr: d.nominal.toLocaleString('id-ID')
    }));
    exportToPDF('Laporan Pengeluaran', exportCols, data, 'Laporan_Pengeluaran_EKomite');
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/laporan" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Buku Kas Umum (Pengeluaran)</h1>
            <p className="text-sm text-text-secondary">Rekapitulasi pengeluaran operasional.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative hidden md:flex items-center">
             <Filter size={16} className="absolute left-3 text-gray-400" />
             <select 
               value={bulanFilter}
               onChange={(e) => setBulanFilter(e.target.value)}
               className="appearance-none pl-9 pr-8 py-2 rounded-md bg-transparent border border-white/20 text-sm text-white focus:outline-none focus:border-white/40 cursor-pointer"
             >
               <option value="" className="bg-bg-elevated text-white">Semua Bulan</option>
               <option value="04" className="bg-bg-elevated text-white">April 2026</option>
               <option value="05" className="bg-bg-elevated text-white">Mei 2026</option>
               <option value="06" className="bg-bg-elevated text-white">Juni 2026</option>
             </select>
           </div>
           <Button onClick={handleExportExcel} variant="outline" size="sm"><Download size={16} className="mr-2" /> Excel</Button>
           <Button onClick={handleExportPDF} size="sm"><Printer size={16} className="mr-2" /> Cetak PDF</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-bg-card to-[#1a1a1c] border-white/5 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><Filter size={40} /></div>
             <p className="text-sm text-gray-400 mb-1">Total Pengeluaran Bulan Ini</p>
             <h3 className="text-3xl font-bold text-white tracking-tight">Rp {totalPengeluaran.toLocaleString('id-ID')}</h3>
          </Card>
       </div>

       <div className="mt-8">
         {isLoading ? (
           <div className="py-20 text-center text-gray-400">Memuat laporan pengeluaran...</div>
         ) : (
           <DataTable columns={columns} data={displayData} />
         )}
       </div>
    </div>
  );
}
