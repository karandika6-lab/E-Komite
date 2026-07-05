'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, Filter, Download } from 'lucide-react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'sonner';
import { exportToExcel } from '@/utils/reportGenerator';
import { createClient } from '@/lib/supabase/client';

export default function PengeluaranPage() {
  const [periodeFilter, setPeriodeFilter] = useState('');
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
        no_bukti: item.no_bukti,
        tanggal: item.tanggal,
        kategori: item.kategori_pengeluaran?.nama || '-',
        nama: item.nama_pengeluaran,
        penerima: item.penerima || '-',
        jumlah: item.jumlah
      })) || [];

      setDataPengeluaran(formatted);
    } catch (error: any) {
      toast.error('Gagal mengambil data pengeluaran: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const displayPengeluaran = dataPengeluaran.filter(d => {
    if (periodeFilter) {
      const date = new Date(d.tanggal);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return month === periodeFilter;
    }
    return true;
  });

  const handleExport = () => {
    const exportCols = [
      { header: 'No. Bukti', key: 'no_bukti', width: 20 },
      { header: 'Tanggal', key: 'tanggal', width: 20 },
      { header: 'Kategori', key: 'kategori', width: 20 },
      { header: 'Nama Pengeluaran', key: 'nama', width: 30 },
      { header: 'Penerima', key: 'penerima', width: 25 },
      { header: 'Jumlah', key: 'jumlah', width: 20 },
    ];
    
    const dataToExport = displayPengeluaran.map(d => ({
      ...d,
      tanggal: format(new Date(d.tanggal), 'dd MMM yyyy', { locale: id }),
    }));
    
    exportToExcel('Data Pengeluaran', exportCols, dataToExport, 'Data_Pengeluaran_EKomite');
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'no_bukti',
      header: 'No. Bukti',
      cell: ({ row }) => <span className="font-mono text-sm text-neon-pink">{row.getValue('no_bukti')}</span>,
    },
    {
      accessorKey: 'tanggal',
      header: 'Tanggal',
      cell: ({ row }) => (
        <span className="text-sm">
          {format(new Date(row.getValue('tanggal')), 'dd MMM yyyy', { locale: id })}
        </span>
      ),
    },
    {
      accessorKey: 'nama',
      header: 'Nama Pengeluaran',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-white">{row.getValue('nama')}</div>
          <div className="text-xs text-text-tertiary">Penerima: {row.original.penerima}</div>
        </div>
      ),
    },
    {
      accessorKey: 'kategori',
      header: 'Kategori',
      cell: ({ row }) => <Badge variant="default">{row.getValue('kategori')}</Badge>,
    },
    {
      accessorKey: 'jumlah',
      header: 'Jumlah',
      cell: ({ row }) => <span className="text-neon-pink font-semibold">Rp ${(row.getValue('jumlah') as number).toLocaleString('id-ID')}</span>,
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => (
        <Button 
          onClick={() => toast.info(`Menampilkan detail transaksi ${row.getValue('no_bukti')}`)}
          variant="ghost" 
          size="sm" 
          className="text-text-secondary hover:text-white"
        >
          Detail
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Data Pengeluaran</h1>
          <p className="text-sm text-text-secondary">Daftar transaksi dana keluar sekolah.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button onClick={handleExport} variant="outline" size="sm" className="hidden md:flex">
            <Download size={16} className="mr-2" />
            Export Data
          </Button>
          <Link href="/dashboard/keuangan/pengeluaran/input">
            <Button size="sm" className="bg-gradient-to-r from-neon-pink to-rose-600 hover:shadow-[0_0_20px_rgba(255,0,110,0.4)] border-none">
              <Plus size={16} className="mr-2" />
              Catat Pengeluaran
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="Cari no bukti atau nama pengeluaran..."
              icon={Search}
            />
          </div>
          <div className="relative md:w-auto w-full">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
               value={periodeFilter}
               onChange={(e) => setPeriodeFilter(e.target.value)}
               className="w-full appearance-none pl-9 pr-8 py-2 rounded-lg bg-transparent border border-white/20 text-sm text-white focus:outline-none focus:border-white/40 cursor-pointer h-10"
            >
               <option value="" className="bg-bg-elevated text-white">Semua Periode</option>
               <option value="05" className="bg-bg-elevated text-white">Mei 2026</option>
               <option value="06" className="bg-bg-elevated text-white">Juni 2026</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          {isLoading ? (
            <div className="py-20 text-center text-gray-400">Memuat data pengeluaran...</div>
          ) : (
            <DataTable columns={columns} data={displayPengeluaran} />
          )}
        </div>
      </div>
    </div>
  );
}
