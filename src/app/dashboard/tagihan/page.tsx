'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Plus, Filter, Download, Loader2, FileText } from 'lucide-react';
import Link from 'next/link';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';

import { createClient } from '@/lib/supabase/client';
import { exportRekapTagihanPDFLandscape, RekapTagihanSiswaItem } from '@/utils/reportGenerator';

export default function TagihanPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [dataTagihan, setDataTagihan] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const supabase = createClient();

  React.useEffect(() => {
    fetchTagihan();
  }, []);

  const handleExportPDF = async () => {
    setIsExportingPdf(true);
    try {
      const { data: siswaList, error } = await supabase
        .from('siswa')
        .select(`
          id, nis, nama_lengkap, kelas, angkatan, status,
          tagihan (
            id, total_tagihan, total_dibayar, sisa_tagihan, status, periode,
            jenis_pembayaran (nama)
          )
        `)
        .order('nama_lengkap', { ascending: true });

      if (error) throw error;
      if (!siswaList || siswaList.length === 0) {
        toast.error('Tidak ada data siswa.');
        return;
      }

      const formattedData: RekapTagihanSiswaItem[] = siswaList.map((item: any) => {
        const tagihanArr = item.tagihan || [];
        const totalTagihan = tagihanArr.reduce((sum: number, t: any) => sum + (Number(t.total_tagihan) || 0), 0);
        const totalDibayar = tagihanArr.reduce((sum: number, t: any) => sum + (Number(t.total_dibayar) || 0), 0);
        const sisaTagihan = tagihanArr.reduce((sum: number, t: any) => sum + (Number(t.sisa_tagihan) || 0), 0);

        let statusBayar = 'LUNAS';
        if (tagihanArr.length === 0) {
          statusBayar = 'TANPA TAGIHAN';
        } else {
          const adaBelumLunas = tagihanArr.some((t: any) => t.status === 'BELUM_LUNAS' || t.sisa_tagihan > 0);
          const adaCicilan = tagihanArr.some((t: any) => t.status === 'CICILAN');
          const semuaLunas = tagihanArr.every((t: any) => t.status === 'LUNAS' || t.sisa_tagihan === 0);

          if (semuaLunas) {
            statusBayar = 'LUNAS';
          } else if (adaCicilan) {
            statusBayar = 'CICILAN';
          } else if (adaBelumLunas) {
            statusBayar = 'BELUM LUNAS';
          }
        }

        const rincianTagihan = tagihanArr.map((t: any) => ({
          nama: (t.jenis_pembayaran?.nama || 'Tagihan') + (t.periode ? ` (${t.periode})` : ''),
          nominal: Number(t.total_tagihan) || 0,
          dibayar: Number(t.total_dibayar) || 0,
          sisa: Number(t.sisa_tagihan) || 0,
          status: t.status === 'LUNAS' ? 'Lunas' : (t.status === 'CICILAN' ? 'Cicilan' : 'Belum Lunas')
        }));

        return {
          id: item.id,
          nis: item.nis || '-',
          nama: item.nama_lengkap,
          kelas: item.kelas || '-',
          angkatan: item.angkatan,
          statusBayar,
          totalTagihan,
          totalDibayar,
          sisaTagihan,
          rincianTagihan
        };
      });

      exportRekapTagihanPDFLandscape(formattedData, {}, 'Rekap_Tagihan_Siswa_EKomite');
      toast.success('Berhasil mengunduh PDF Rekap Tagihan');
    } catch (err: any) {
      toast.error('Gagal unduh PDF: ' + err.message);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const fetchTagihan = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tagihan')
        .select(`
          *,
          siswa (nama_lengkap, angkatan),
          jenis_pembayaran (nama)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formatted = data?.map((item: any) => ({
        id: item.id,
        siswa: item.siswa?.nama_lengkap || '-',
        angkatan: item.siswa?.angkatan || '-',
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
          <div className="text-xs text-text-tertiary">Angkatan: {row.original.angkatan}</div>
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            disabled={isExportingPdf}
            className="border-white/20 text-white hover:bg-white/10"
          >
            {isExportingPdf ? <Loader2 size={16} className="mr-2 animate-spin text-text-secondary" /> : <Download size={16} className="mr-2 text-neon-blue" />}
            Unduh Rekap PDF
          </Button>
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
