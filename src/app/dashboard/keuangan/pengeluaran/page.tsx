'use client';

import React from 'react';
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

const dummyPengeluaran = [
  { id: '1', no_bukti: 'PG-20260524-001', kategori: 'Operasional', nama: 'Beli ATK Kantor', penerima: 'Toko Buku Sejahtera', jumlah: 150000, tanggal: new Date().toISOString() },
  { id: '2', no_bukti: 'PG-20260523-001', kategori: 'Honor', nama: 'Honor Pembina Pramuka', penerima: 'Bpk. Ridwan', jumlah: 500000, tanggal: new Date(Date.now() - 86400000).toISOString() },
];

export default function PengeluaranPage() {
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
        <Button variant="ghost" size="sm" className="text-text-secondary hover:text-white">
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
          <Button variant="outline" size="sm" className="hidden md:flex">
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

      <Card glass className="p-0 border-none bg-transparent">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="Cari no bukti atau nama pengeluaran..."
              icon={Search}
            />
          </div>
          <Button variant="outline" className="md:w-auto w-full">
            <Filter size={16} className="mr-2" />
            Filter Periode
          </Button>
        </div>

        <DataTable columns={columns} data={dummyPengeluaran} />
      </Card>
    </div>
  );
}
