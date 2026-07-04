'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Download, FileText, Calendar } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const dummyData = [
  { id: '1', tanggal: new Date().toISOString(), no_kwitansi: 'KW-001', siswa: 'Ahmad Faisal', kelas: 'X-1', jenis: 'Uang Komite', jumlah: 250000 },
  { id: '2', tanggal: new Date().toISOString(), no_kwitansi: 'KW-002', siswa: 'Siti Aminah', kelas: 'XI-IPA', jenis: 'Semesteran', jumlah: 1500000 },
];

export default function LaporanPemasukanPage() {
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

  const total = dummyData.reduce((sum, item) => sum + item.jumlah, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Laporan Pemasukan</h1>
          <p className="text-sm text-text-secondary">Rekapitulasi pembayaran masuk per periode.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="hidden md:flex text-neon-pink border-neon-pink hover:bg-neon-pink/10">
            <FileText size={16} className="mr-2" />
            Export PDF
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            <Download size={16} className="mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card glass className="p-4 md:col-span-3">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-text-secondary mb-1 block">Periode Mulai</label>
              <Input type="date" icon={Calendar} />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-text-secondary mb-1 block">Periode Selesai</label>
              <Input type="date" icon={Calendar} />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-text-secondary mb-1 block">Jenis Pembayaran</label>
              <select className="w-full rounded-xl bg-bg-elevated border border-white/10 px-4 py-2.5 text-text-primary focus:outline-none focus:border-neon-blue transition-all">
                <option value="">Semua Jenis</option>
                <option value="komite">Uang Komite</option>
                <option value="semester">Semesteran</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button>Terapkan Filter</Button>
            </div>
          </div>
        </Card>

        <Card glass className="p-4 flex flex-col justify-center border-l-4 border-l-neon-green">
          <p className="text-sm text-text-secondary mb-1">Total Pemasukan</p>
          <p className="text-2xl font-bold text-neon-green">Rp {total.toLocaleString('id-ID')}</p>
        </Card>
      </div>

      <Card glass className="p-0 border-none bg-transparent">
        <DataTable columns={columns} data={dummyData} />
      </Card>
    </div>
  );
}
