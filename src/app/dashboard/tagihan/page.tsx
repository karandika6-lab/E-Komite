'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, Filter } from 'lucide-react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';

import { createClient } from '@/lib/supabase/client';

export default function TagihanPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [dataTagihan, setDataTagihan] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  React.useEffect(() => {
    fetchTagihan();
  }, []);

  const fetchTagihan = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tagihan')
        .select(`
          *,
          siswa (nama_lengkap, kelas),
          jenis_pembayaran (nama)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formatted = data?.map((item: any) => ({
        id: item.id,
        siswa: item.siswa?.nama_lengkap || '-',
        kelas: item.siswa?.kelas || '-',
        jenis: item.jenis_pembayaran?.nama || '-',
        periode: item.periode || '-',
        nominal: item.total_tagihan,
        dibayar: item.total_dibayar,
        sisa: item.sisa_tagihan,
        status: item.status
      })) || [];

      setDataTagihan(formatted);
    } catch (error: any) {
      toast.error('Gagal mengambil data tagihan: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const displayTagihan = dataTagihan.filter(d => {
    if (statusFilter) return d.status === statusFilter;
    return true;
  });

  const totalTagihan = displayTagihan.reduce((acc, curr) => acc + curr.nominal, 0);
  const totalTerbayar = displayTagihan.reduce((acc, curr) => acc + curr.dibayar, 0);
  const totalTunggakan = displayTagihan.reduce((acc, curr) => acc + curr.sisa, 0);

  const columns: ColumnDef<any>[] = [
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
      cell: ({ row }) => (
        <div>
          <div className="text-sm">{row.getValue('jenis')}</div>
          <div className="text-xs text-text-tertiary">{row.original.periode}</div>
        </div>
      ),
    },
    {
      accessorKey: 'nominal',
      header: 'Nominal',
      cell: ({ row }) => `Rp ${(row.getValue('nominal') as number).toLocaleString('id-ID')}`,
    },
    {
      accessorKey: 'dibayar',
      header: 'Dibayar',
      cell: ({ row }) => <span className="text-neon-green">Rp ${(row.getValue('dibayar') as number).toLocaleString('id-ID')}</span>,
    },
    {
      accessorKey: 'sisa',
      header: 'Sisa',
      cell: ({ row }) => <span className="text-neon-pink">Rp ${(row.getValue('sisa') as number).toLocaleString('id-ID')}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        let variant: 'success' | 'warning' | 'danger' = 'success';
        if (status === 'BELUM_LUNAS') variant = 'danger';
        if (status === 'CICILAN') variant = 'warning';
        return <Badge variant={variant}>{status.replace('_', ' ')}</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Manajemen Tagihan</h1>
          <p className="text-sm text-text-secondary">Kelola daftar tagihan siswa.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href="/dashboard/tagihan/generate">
            <Button size="sm">
              <Plus size={16} className="mr-2" />
              Generate Tagihan
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card glass className="p-4">
          <div className="text-sm text-text-secondary mb-1">Total Tagihan Aktif</div>
          <div className="text-xl font-bold text-white">Rp {totalTagihan.toLocaleString('id-ID')}</div>
        </Card>
        <Card glass className="p-4">
          <div className="text-sm text-text-secondary mb-1">Total Terbayar</div>
          <div className="text-xl font-bold text-neon-green">Rp {totalTerbayar.toLocaleString('id-ID')}</div>
        </Card>
        <Card glass className="p-4">
          <div className="text-sm text-text-secondary mb-1">Total Tunggakan</div>
          <div className="text-xl font-bold text-neon-pink">Rp {totalTunggakan.toLocaleString('id-ID')}</div>
        </Card>
      </div>

      <div className="mt-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="Cari siswa..."
              icon={Search}
            />
          </div>
          <div className="relative md:w-auto w-full">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               className="w-full appearance-none pl-9 pr-8 py-2 rounded-lg bg-transparent border border-white/20 text-sm text-white focus:outline-none focus:border-white/40 cursor-pointer h-10"
            >
               <option value="" className="bg-bg-elevated text-white">Semua Status</option>
               <option value="LUNAS" className="bg-bg-elevated text-white">Lunas</option>
               <option value="CICILAN" className="bg-bg-elevated text-white">Cicilan</option>
               <option value="BELUM_LUNAS" className="bg-bg-elevated text-white">Belum Lunas</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-gray-400">Memuat data tagihan...</div>
        ) : (
          <DataTable columns={columns} data={displayTagihan} />
        )}
      </div>
    </div>
  );
}
