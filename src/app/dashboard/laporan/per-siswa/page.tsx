'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Printer, Download, Search, User } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { DataTable } from '@/components/ui/Table';
import { exportToExcel, exportToPDF } from '@/utils/reportGenerator';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function LaporanPerSiswaPage() {
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [siswaInfo, setSiswaInfo] = useState<any>(null);
  const [dataRiwayat, setDataRiwayat] = useState<any[]>([]);
  const supabase = createClient();

  const handleSearch = async () => {
    if (!search) return;
    setIsSearching(true);
    try {
      // 1. Find Siswa
      const { data: siswaData, error: siswaErr } = await supabase
        .from('siswa')
        .select('*')
        .or(`nis.eq.${search},nama_lengkap.ilike.%${search}%`)
        .limit(1)
        .single();
        
      if (siswaErr || !siswaData) {
        setSiswaInfo(null);
        setDataRiwayat([]);
        return toast.error('Siswa tidak ditemukan');
      }

      setSiswaInfo(siswaData);

      // 2. Fetch Tagihan history for this siswa
      const { data: tagihanData, error: tagihanErr } = await supabase
        .from('tagihan')
        .select(`
          *,
          jenis_pembayaran(nama),
          pembayaran(tanggal_bayar, jumlah, admin(full_name))
        `)
        .eq('siswa_id', (siswaData as any).id)
        .order('created_at', { ascending: false });

      if (tagihanErr) throw tagihanErr;

      const formatted = tagihanData?.map((t: any) => {
        const p = t.pembayaran?.[0]; // latest payment if any
        return {
          id: t.id,
          tagihan: t.jenis_pembayaran?.nama + (t.periode ? ` (${t.periode})` : ''),
          nominal: t.total_tagihan,
          tanggal: p?.tanggal_bayar ? format(new Date(p.tanggal_bayar), 'dd MMM yyyy', { locale: id }) : '-',
          status: t.status === 'LUNAS' ? 'Lunas' : (t.status === 'CICILAN' ? `Cicilan (Rp ${t.total_dibayar.toLocaleString('id-ID')})` : 'Belum Dibayar'),
          admin: p?.admin?.full_name || '-'
        };
      }) || [];

      setDataRiwayat(formatted);
    } catch (error: any) {
      toast.error('Terjadi kesalahan: ' + error.message);
    } finally {
      setIsSearching(false);
    }
  };

  const columns = [
    { accessorKey: 'tagihan', header: 'Jenis Tagihan', cell: ({ row }: any) => <span className="font-bold text-white">{row.getValue('tagihan')}</span> },
    { accessorKey: 'nominal', header: 'Nominal Tagihan', cell: ({ row }: any) => <span>Rp {row.getValue('nominal').toLocaleString('id-ID')}</span> },
    { accessorKey: 'tanggal', header: 'Tanggal Bayar' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }: any) => {
        const status = row.getValue('status');
        if (status === 'Lunas') return <span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs font-bold border border-green-500/20">{status}</span>;
        if (status === 'Belum Dibayar') return <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-xs font-bold border border-red-500/20">{status}</span>;
        return <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded text-xs font-bold border border-yellow-500/20">{status}</span>;
    }},
    { accessorKey: 'admin', header: 'Penerima' },
  ];

  const handleExportExcel = () => {
    const exportCols = [
      { header: 'Jenis Tagihan', key: 'tagihan', width: 25 },
      { header: 'Nominal Tagihan', key: 'nominal', width: 20 },
      { header: 'Tanggal Bayar', key: 'tanggal', width: 20 },
      { header: 'Status', key: 'status', width: 20 },
      { header: 'Penerima', key: 'admin', width: 25 },
    ];
    exportToExcel(`Laporan_Buku_Pribadi_${siswaInfo?.nis || search}`, exportCols, dataRiwayat, `Buku_Pribadi_${siswaInfo?.nis || search}_EKomite`);
  };

  const handleExportPDF = () => {
    const exportCols = [
      { header: 'Jenis Tagihan', key: 'tagihan' },
      { header: 'Nominal Tagihan (Rp)', key: 'nominalStr' },
      { header: 'Tanggal Bayar', key: 'tanggal' },
      { header: 'Status', key: 'status' },
      { header: 'Penerima', key: 'admin' },
    ];
    const data = dataRiwayat.map(d => ({
      ...d,
      nominalStr: d.nominal.toLocaleString('id-ID')
    }));
    exportToPDF(`Laporan Buku Pribadi - ${siswaInfo?.nama_lengkap || search}`, exportCols, data, `Buku_Pribadi_${siswaInfo?.nis || search}_EKomite`);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/laporan" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Buku Pribadi Siswa</h1>
            <p className="text-sm text-text-secondary">Detail mutasi pembayaran individu siswa.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Button onClick={handleExportExcel} variant="outline" size="sm"><Download size={16} className="mr-2" /> Excel</Button>
           <Button onClick={handleExportPDF} size="sm"><Printer size={16} className="mr-2" /> Cetak Kartu SPP</Button>
        </div>
      </div>

      <Card className="bg-[#1c1c1e] border-white/5 p-6 mb-8">
         <div className="max-w-md mb-6">
            <label className="text-sm text-gray-400 mb-2 block">Cari Berdasarkan NIS / Nama Siswa</label>
            <div className="flex gap-2">
               <Input 
                 placeholder="Masukkan NIS atau Nama..." 
                 value={search} 
                 onChange={(e) => setSearch(e.target.value)}
                 onKeyDown={(e: any) => e.key === 'Enter' && handleSearch()}
                 icon={Search}
               />
               <Button onClick={handleSearch} disabled={isSearching} className="shrink-0">
                 {isSearching ? 'Mencari...' : 'Cari'}
               </Button>
            </div>
         </div>

         {/* Profil Card */}
         {siswaInfo ? (
           <div className="bg-black/20 rounded-2xl border border-white/5 p-6 flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 border-2 border-blue-500/30">
                 <User size={40} />
              </div>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <p className="text-sm text-gray-500">Nama Lengkap</p>
                    <p className="text-lg font-bold text-white">{siswaInfo.nama_lengkap}</p>
                 </div>
                 <div>
                    <p className="text-sm text-gray-500">NIS</p>
                    <p className="text-lg font-bold text-white">{siswaInfo.nis}</p>
                 </div>
                 <div>
                    <p className="text-sm text-gray-500">Kelas</p>
                    <p className="text-lg font-bold text-white">{siswaInfo.kelas}</p>
                 </div>
                 <div>
                    <p className="text-sm text-gray-500">Angkatan</p>
                    <p className="text-lg font-bold text-white">{siswaInfo.angkatan}</p>
                 </div>
              </div>
           </div>
         ) : (
           <div className="bg-black/20 rounded-2xl border border-white/5 p-6 text-center text-gray-500">
             Silakan cari siswa terlebih dahulu untuk melihat mutasi tagihan.
           </div>
         )}
      </Card>

      {siswaInfo && (
        <div className="mt-4">
          <DataTable columns={columns} data={dataRiwayat} />
        </div>
      )}
    </div>
  );
}
