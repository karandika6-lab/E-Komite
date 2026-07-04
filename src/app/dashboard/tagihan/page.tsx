'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, Filter } from 'lucide-react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';

const dummyTagihan = [
  { id: '1', siswa: 'Ahmad Faisal', kelas: 'X-1', jenis: 'Uang Komite', periode: 'Tahun 2025/2026', nominal: 3000000, dibayar: 3000000, sisa: 0, status: 'LUNAS' },
  { id: '2', siswa: 'Budi Santoso', kelas: 'X-2', jenis: 'Uang Komite', periode: 'Tahun 2025/2026', nominal: 3000000, dibayar: 1000000, sisa: 2000000, status: 'CICILAN' },
  { id: '3', siswa: 'Siti Aminah', kelas: 'XI-IPA', jenis: 'PNB', periode: 'Semester 1', nominal: 500000, dibayar: 0, sisa: 500000, status: 'BELUM_LUNAS' },
];

export default function TagihanPage() {
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
          <div className="text-xl font-bold text-white">Rp 8.500.000</div>
        </Card>
        <Card glass className="p-4">
          <div className="text-sm text-text-secondary mb-1">Total Terbayar</div>
          <div className="text-xl font-bold text-neon-green">Rp 4.000.000</div>
        </Card>
        <Card glass className="p-4">
          <div className="text-sm text-text-secondary mb-1">Total Tunggakan</div>
          <div className="text-xl font-bold text-neon-pink">Rp 4.500.000</div>
        </Card>
      </div>

      <Card glass className="p-0 border-none bg-transparent">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="Cari siswa..."
              icon={Search}
            />
          </div>
          <Button variant="outline" className="md:w-auto w-full">
            <Filter size={16} className="mr-2" />
            Filter
          </Button>
        </div>

        <DataTable columns={columns} data={dummyTagihan} />
      </Card>
    </div>
  );
}
