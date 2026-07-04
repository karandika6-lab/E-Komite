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

const dummyPembayaran = [
  { id: '1', no_kwitansi: 'KW-20260524-001', siswa: 'Ahmad Faisal', kelas: 'X-1', jenis: 'Uang Komite', jumlah: 250000, metode: 'TUNAI', tanggal: new Date().toISOString() },
  { id: '2', no_kwitansi: 'KW-20260524-002', siswa: 'Siti Aminah', kelas: 'XI-IPA', jenis: 'Semesteran', jumlah: 1500000, metode: 'TRANSFER', tanggal: new Date().toISOString() },
];

export default function PembayaranPage() {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'no_kwitansi',
      header: 'No. Kwitansi',
      cell: ({ row }) => <span className="font-mono text-sm text-neon-blue">{row.getValue('no_kwitansi')}</span>,
    },
    {
      accessorKey: 'tanggal',
      header: 'Tanggal',
      cell: ({ row }) => (
        <span className="text-sm">
          {format(new Date(row.getValue('tanggal')), 'dd MMM yyyy, HH:mm', { locale: id })}
        </span>
      ),
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
      header: 'Pembayaran',
    },
    {
      accessorKey: 'metode',
      header: 'Metode',
      cell: ({ row }) => {
        const metode = row.getValue('metode') as string;
        return <Badge variant={metode === 'TUNAI' ? 'info' : 'warning'}>{metode}</Badge>;
      }
    },
    {
      accessorKey: 'jumlah',
      header: 'Jumlah',
      cell: ({ row }) => <span className="text-neon-green font-semibold">Rp ${(row.getValue('jumlah') as number).toLocaleString('id-ID')}</span>,
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
          <h1 className="text-2xl font-bold text-white">Pembayaran Masuk</h1>
          <p className="text-sm text-text-secondary">Daftar transaksi penerimaan pembayaran.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="hidden md:flex">
            <Download size={16} className="mr-2" />
            Export Data
          </Button>
          <Link href="/dashboard/keuangan/pembayaran/input">
            <Button size="sm">
              <Plus size={16} className="mr-2" />
              Input Pembayaran
            </Button>
          </Link>
        </div>
      </div>

      <Card glass className="p-0 border-none bg-transparent">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="Cari no kwitansi atau siswa..."
              icon={Search}
            />
          </div>
          <Button variant="outline" className="md:w-auto w-full">
            <Filter size={16} className="mr-2" />
            Filter Periode
          </Button>
        </div>

        <DataTable columns={columns} data={dummyPembayaran} />
      </Card>
    </div>
  );
}
