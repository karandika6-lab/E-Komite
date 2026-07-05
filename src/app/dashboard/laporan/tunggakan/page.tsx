'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Printer, Download, Filter, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { DataTable } from '@/components/ui/Table';
import { exportToExcel, exportToPDF } from '@/utils/reportGenerator';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function LaporanTunggakanPage() {
  const [dataTunggakan, setDataTunggakan] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  React.useEffect(() => {
    fetchTunggakan();
  }, []);

  const fetchTunggakan = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tagihan')
        .select(`
          id, total_tagihan, sisa_tagihan, created_at,
          siswa (nama_lengkap, kelas, no_hp_ortu),
          jenis_pembayaran (nama)
        `)
        .gt('sisa_tagihan', 0)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const formatted = data?.map((item: any) => {
        // Hitung estimasi bulan menunggak
        const createdDate = new Date(item.created_at);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - createdDate.getTime());
        const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
        
        return {
          id: item.id,
          nama: item.siswa?.nama_lengkap || '-',
          kelas: item.siswa?.kelas || '-',
          no_hp: item.siswa?.no_hp_ortu || '',
          jenis: item.jenis_pembayaran?.nama || '-',
          total: item.total_tagihan,
          sisa: item.sisa_tagihan,
          bulan: diffMonths || 1, // minimal 1 bulan
        };
      }) || [];

      setDataTunggakan(formatted);
    } catch (error: any) {
      toast.error('Gagal mengambil data tunggakan: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  const columns = [
    { accessorKey: 'nama', header: 'Nama Siswa', cell: ({ row }: any) => <span className="font-bold text-white">{row.getValue('nama')}</span> },
    { accessorKey: 'kelas', header: 'Kelas' },
    { accessorKey: 'jenis', header: 'Jenis Tagihan', cell: ({ row }: any) => <span className="bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded text-xs">{row.getValue('jenis')}</span> },
    { accessorKey: 'total', header: 'Total Tagihan', cell: ({ row }: any) => <span>Rp {row.getValue('total').toLocaleString('id-ID')}</span> },
    { accessorKey: 'sisa', header: 'Sisa Tunggakan', cell: ({ row }: any) => <span className="font-bold text-red-400">Rp {row.getValue('sisa').toLocaleString('id-ID')}</span> },
    { accessorKey: 'bulan', header: 'Status', cell: ({ row }: any) => {
        const bln = row.getValue('bulan');
        return <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${bln >= 3 ? 'bg-red-500/20 text-red-400 border border-red-500/20' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20'}`}>Nunggak {bln} Bulan</span>
    }},
    { id: 'actions', header: 'Aksi', cell: ({ row }: any) => {
        const hp = row.original.no_hp;
        const msg = encodeURIComponent(`Halo Bpk/Ibu wali murid dari ${row.getValue('nama')}, mengingatkan bahwa terdapat tunggakan ${row.getValue('jenis')} sebesar Rp ${row.getValue('sisa').toLocaleString('id-ID')}. Mohon segera diselesaikan.`);
        return (
          <Button 
            onClick={() => {
              if(!hp) return toast.error('Nomor WA tidak tersedia');
              window.open(`https://wa.me/${hp}?text=${msg}`, '_blank');
            }} 
            variant="ghost" 
            size="sm" 
            className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
          >
            <MessageCircle size={14} className="mr-1.5"/> WhatsApp
          </Button>
        );
    }}
  ];

  const [kelasFilter, setKelasFilter] = useState('');

  const displayData = dataTunggakan.filter(d => {
    if (kelasFilter) return d.kelas.includes(kelasFilter);
    return true;
  });

  const totalPiutang = displayData.reduce((sum, item) => sum + item.sisa, 0);
  const totalSiswa = displayData.length;

  const handleExportExcel = () => {
    const exportCols = [
      { header: 'Nama Siswa', key: 'nama', width: 30 },
      { header: 'Kelas', key: 'kelas', width: 15 },
      { header: 'Jenis Tagihan', key: 'jenis', width: 25 },
      { header: 'Total Tagihan', key: 'total', width: 20 },
      { header: 'Sisa Tunggakan', key: 'sisa', width: 20 },
      { header: 'Menunggak (Bulan)', key: 'bulan', width: 20 },
    ];
    exportToExcel('Laporan Tunggakan', exportCols, displayData, 'Laporan_Tunggakan_EKomite');
  };

  const handleExportPDF = () => {
    const exportCols = [
      { header: 'Nama Siswa', key: 'nama' },
      { header: 'Kelas', key: 'kelas' },
      { header: 'Jenis Tagihan', key: 'jenis' },
      { header: 'Total Tagihan (Rp)', key: 'totalStr' },
      { header: 'Sisa Tunggakan (Rp)', key: 'sisaStr' },
      { header: 'Status', key: 'statusStr' },
    ];
    const data = displayData.map(d => ({
      ...d,
      totalStr: d.total.toLocaleString('id-ID'),
      sisaStr: d.sisa.toLocaleString('id-ID'),
      statusStr: `Nunggak ${d.bulan} Bulan`
    }));
    exportToPDF('Laporan Tunggakan', exportCols, data, 'Laporan_Tunggakan_EKomite');
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/laporan" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Daftar Piutang Siswa</h1>
            <p className="text-sm text-text-secondary">Rekapitulasi tunggakan pembayaran siswa.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative hidden md:flex items-center">
             <Filter size={16} className="absolute left-3 text-gray-400" />
             <select 
               value={kelasFilter}
               onChange={(e) => setKelasFilter(e.target.value)}
               className="appearance-none pl-9 pr-8 py-2 rounded-md bg-transparent border border-white/20 text-sm text-white focus:outline-none focus:border-white/40 cursor-pointer"
             >
               <option value="" className="bg-bg-elevated text-white">Semua Kelas</option>
               <option value="X" className="bg-bg-elevated text-white">Kelas X</option>
               <option value="XI" className="bg-bg-elevated text-white">Kelas XI</option>
               <option value="XII" className="bg-bg-elevated text-white">Kelas XII</option>
             </select>
           </div>
           <Button onClick={handleExportExcel} variant="outline" size="sm"><Download size={16} className="mr-2" /> Excel</Button>
           <Button onClick={handleExportPDF} size="sm"><Printer size={16} className="mr-2" /> Cetak PDF</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card className="bg-gradient-to-br from-bg-card to-[#1a1a1c] border-white/5 relative overflow-hidden">
            <p className="text-sm text-gray-400 mb-1">Total Estimasi Piutang</p>
            <h3 className="text-3xl font-bold text-white tracking-tight">Rp {totalPiutang.toLocaleString('id-ID')}</h3>
         </Card>
         <Card className="bg-gradient-to-br from-bg-card to-[#1a1a1c] border-white/5 relative overflow-hidden">
            <p className="text-sm text-gray-400 mb-1">Total Siswa Menunggak</p>
            <h3 className="text-3xl font-bold text-red-400 tracking-tight">{totalSiswa} <span className="text-lg text-gray-500 font-normal">Siswa</span></h3>
         </Card>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="py-20 text-center text-gray-400">Memuat data piutang...</div>
        ) : (
          <DataTable columns={columns} data={displayData} />
        )}
      </div>
    </div>
  );
}
