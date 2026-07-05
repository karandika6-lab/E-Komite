'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, Download, Upload, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function SiswaPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dataSiswa, setDataSiswa] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchSiswa();
  }, []);

  const fetchSiswa = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('siswa')
        .select('*')
        .order('nama_lengkap', { ascending: true });

      if (error) throw error;
      
      const formatted = data?.map((item: any) => ({
        id: item.id,
        nis: item.nis,
        nama: item.nama_lengkap,
        kelas: item.kelas,
        angkatan: item.angkatan,
        status: item.status,
        statusBayar: 'Lunas' // Placeholder until tagihan logic is ready
      })) || [];
      
      setDataSiswa(formatted);
    } catch (error: any) {
      toast.error('Gagal mengambil data siswa: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = dataSiswa.filter(item => 
    item.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.nis.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'nis',
      header: 'NIS',
    },
    {
      accessorKey: 'nama',
      header: 'Nama Lengkap',
      cell: ({ row }) => (
        <div className="font-medium text-white">{row.getValue('nama')}</div>
      ),
    },
    {
      accessorKey: 'kelas',
      header: 'Kelas',
    },
    {
      accessorKey: 'angkatan',
      header: 'Angkatan',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <Badge variant={status === 'Aktif' ? 'success' : 'default'}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'statusBayar',
      header: 'Status Pembayaran',
      cell: ({ row }) => {
        const status = row.getValue('statusBayar') as string;
        let variant: 'success' | 'warning' | 'danger' = 'success';
        if (status === 'Tunggakan') variant = 'danger';
        if (status === 'Cicilan') variant = 'warning';
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => (
        <Link href={`/dashboard/siswa/detail?id=${row.original.id}`}>
          <Button variant="ghost" size="sm" className="text-neon-blue hover:text-white">
            Detail
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Data Siswa</h1>
          <p className="text-sm text-text-secondary">Kelola daftar siswa dan status pembayaran.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href="/dashboard/siswa/import">
            <Button variant="outline" size="sm" className="hidden md:flex">
              <Upload size={16} className="mr-2" />
              Import
            </Button>
          </Link>
          <Link href="/dashboard/pengaturan/export">
            <Button variant="outline" size="sm" className="hidden md:flex">
              <Download size={16} className="mr-2" />
              Export
            </Button>
          </Link>
          <Link href="/dashboard/siswa/tambah">
            <Button size="sm">
              <Plus size={16} className="mr-2" />
              Tambah Siswa
            </Button>
          </Link>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="Cari nama atau NIS..."
              icon={Search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/* Add more filters here later (Kelas, Angkatan) */}
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <Loader2 size={32} className="text-blue-500 animate-spin mb-4" />
            <p className="text-sm text-gray-400">Memuat data siswa...</p>
          </div>
        ) : (
          <DataTable columns={columns} data={filteredData} />
        )}
      </div>
    </div>
  );
}
