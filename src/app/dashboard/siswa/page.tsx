'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, Download, Upload } from 'lucide-react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';

// Dummy data for now until we integrate Supabase fully
const dummySiswa = [
  { id: '1', nis: '2425001', nama: 'Ahmad Faisal', kelas: 'X-1', angkatan: 2024, status: 'Aktif', statusBayar: 'Lunas' },
  { id: '2', nis: '2425002', nama: 'Budi Santoso', kelas: 'X-2', angkatan: 2024, status: 'Aktif', statusBayar: 'Tunggakan' },
  { id: '3', nis: '2324015', nama: 'Siti Aminah', kelas: 'XI-IPA', angkatan: 2023, status: 'Aktif', statusBayar: 'Cicilan' },
  { id: '4', nis: '2223040', nama: 'Dewi Lestari', kelas: 'XII-IPS', angkatan: 2022, status: 'Aktif', statusBayar: 'Lunas' },
];

export default function SiswaPage() {
  const [searchQuery, setSearchQuery] = useState('');

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
        <Link href={`/dashboard/siswa/${row.original.id}`}>
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

      <Card glass className="p-0 border-none bg-transparent">
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

        <DataTable columns={columns} data={dummySiswa} />
      </Card>
    </div>
  );
}
