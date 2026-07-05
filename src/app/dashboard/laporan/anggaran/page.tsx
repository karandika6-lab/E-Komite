'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Printer, Download, Filter } from 'lucide-react';
import Link from 'next/link';
import { exportToExcel, exportToPDF } from '@/utils/reportGenerator';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function LaporanAnggaranPage() {
  const [dataAnggaran, setDataAnggaran] = useState<any[]>([]);
  const [kategoriFilter, setKategoriFilter] = useState('');
  const [kategoriList, setKategoriList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  React.useEffect(() => {
    fetchAnggaran();
  }, []);

  const fetchAnggaran = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Master Kategori (for dropdown and matching)
      const { data: katData } = await supabase.from('kategori_pengeluaran').select('*');
      setKategoriList(katData || []);

      // 2. Fetch Anggaran List with relations
      const { data: angData, error: angErr } = await supabase
        .from('anggaran')
        .select(`
          id, nominal_anggaran, kategori_pengeluaran_id,
          kategori_pengeluaran(nama)
        `);
        
      if(angErr) throw angErr;

      // 3. Fetch Pengeluaran to calculate Realisasi
      const { data: pengData, error: pengErr } = await supabase
        .from('pengeluaran')
        .select('kategori_id, jumlah');
        
      if(pengErr) throw pengErr;

      // Group Pengeluaran by kategori_id
      const realisasiMap: Record<string, number> = {};
      (pengData as any[])?.forEach(p => {
        if(!realisasiMap[p.kategori_id]) realisasiMap[p.kategori_id] = 0;
        realisasiMap[p.kategori_id] += p.jumlah;
      });

      const formatted = angData?.map((a: any) => ({
        id: a.id,
        kategori_id: a.kategori_pengeluaran_id,
        kategori: a.kategori_pengeluaran?.nama || 'Tanpa Kategori',
        pagu: a.nominal_anggaran,
        realisasi: realisasiMap[a.kategori_pengeluaran_id] || 0
      })) || [];

      setDataAnggaran(formatted);
    } catch(err: any) {
      toast.error('Gagal memuat laporan anggaran: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const displayData = dataAnggaran.filter(d => {
    if (kategoriFilter) return d.kategori_id === kategoriFilter;
    return true;
  });

  const totalPagu = displayData.reduce((acc, curr) => acc + curr.pagu, 0);
  const totalRealisasi = displayData.reduce((acc, curr) => acc + curr.realisasi, 0);
  const totalPersen = totalPagu === 0 ? 0 : (totalRealisasi / totalPagu) * 100;

  const handleExportExcel = () => {
    const exportCols = [
      { header: 'Kategori Pengeluaran', key: 'kategori', width: 35 },
      { header: 'Pagu Anggaran', key: 'pagu', width: 25 },
      { header: 'Realisasi', key: 'realisasi', width: 25 },
      { header: 'Sisa', key: 'sisa', width: 25 },
      { header: 'Serapan (%)', key: 'serapan', width: 15 },
    ];
    const data = displayData.map(d => ({
      kategori: d.kategori,
      pagu: d.pagu,
      realisasi: d.realisasi,
      sisa: d.pagu - d.realisasi,
      serapan: ((d.realisasi / d.pagu) * 100).toFixed(1) + '%'
    }));
    exportToExcel('Laporan Anggaran', exportCols, data, 'Laporan_Anggaran_EKomite');
  };

  const handleExportPDF = () => {
    const exportCols = [
      { header: 'Kategori Pengeluaran', key: 'kategori' },
      { header: 'Pagu Anggaran (Rp)', key: 'paguStr' },
      { header: 'Realisasi (Rp)', key: 'realisasiStr' },
      { header: 'Sisa (Rp)', key: 'sisaStr' },
      { header: 'Serapan (%)', key: 'serapan' },
    ];
    const data = displayData.map(d => ({
      kategori: d.kategori,
      paguStr: d.pagu.toLocaleString('id-ID'),
      realisasiStr: d.realisasi.toLocaleString('id-ID'),
      sisaStr: (d.pagu - d.realisasi).toLocaleString('id-ID'),
      serapan: ((d.realisasi / d.pagu) * 100).toFixed(1) + '%'
    }));
    exportToPDF('Laporan Anggaran', exportCols, data, 'Laporan_Anggaran_EKomite');
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/laporan" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Realisasi Anggaran</h1>
            <p className="text-sm text-text-secondary">Laporan serapan dana sesuai RAB tahunan.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative hidden md:flex items-center">
             <Filter size={16} className="absolute left-3 text-gray-400" />
             <select 
               value={kategoriFilter}
               onChange={(e) => setKategoriFilter(e.target.value)}
               className="appearance-none pl-9 pr-8 py-2 rounded-md bg-transparent border border-white/20 text-sm text-white focus:outline-none focus:border-white/40 cursor-pointer"
             >
               <option value="" className="bg-bg-elevated text-white">Semua Kategori</option>
               {kategoriList.map(k => (
                 <option key={k.id} value={k.id} className="bg-bg-elevated text-white">{k.nama}</option>
               ))}
             </select>
           </div>
           <Button onClick={handleExportExcel} variant="outline" size="sm"><Download size={16} className="mr-2" /> Excel</Button>
           <Button onClick={handleExportPDF} size="sm"><Printer size={16} className="mr-2" /> Cetak PDF</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card className="bg-gradient-to-br from-[#1a1a1c] to-bg-card border-white/5">
            <p className="text-sm text-gray-400 mb-1">Total Pagu Anggaran (RAB)</p>
            <h3 className="text-2xl font-bold text-white tracking-tight">Rp {totalPagu.toLocaleString('id-ID')}</h3>
         </Card>
         <Card className="bg-gradient-to-br from-[#1a1a1c] to-bg-card border-white/5">
            <div className="flex justify-between items-start">
               <div>
                 <p className="text-sm text-gray-400 mb-1">Total Realisasi</p>
                 <h3 className="text-2xl font-bold text-blue-400 tracking-tight">Rp {totalRealisasi.toLocaleString('id-ID')}</h3>
               </div>
               <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg font-bold border border-blue-500/20">
                 {totalPersen.toFixed(1)}%
               </div>
            </div>
            <div className="w-full bg-white/5 h-2 rounded-full mt-4 overflow-hidden">
               <div className="bg-blue-500 h-full rounded-full" style={{ width: `${totalPersen}%` }} />
            </div>
         </Card>
      </div>

      <div className="bg-[#1c1c1e] rounded-3xl border border-white/5 shadow-lg mt-8 overflow-x-auto">
        <div className="min-w-[800px] divide-y divide-white/5">
          <div className="p-4 grid grid-cols-12 gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider bg-white/[0.02]">
            <div className="col-span-4">Kategori Pengeluaran</div>
            <div className="col-span-3 text-right">Pagu Anggaran</div>
            <div className="col-span-3 text-right">Realisasi</div>
            <div className="col-span-2 text-right">Sisa</div>
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Memuat realisasi anggaran...</div>
          ) : displayData.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Belum ada anggaran terdaftar.</div>
          ) : displayData.map((item) => {
            const persen = item.pagu === 0 ? 0 : (item.realisasi / item.pagu) * 100;
            const isWarning = persen > 90;
            return (
              <div key={item.id} className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-white/[0.02] transition-colors">
                <div className="col-span-4">
                  <h4 className="font-bold text-white text-sm">{item.kategori}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                       <div className={`h-full rounded-full ${isWarning ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(persen, 100)}%` }} />
                    </div>
                    <span className={`text-[10px] font-bold ${isWarning ? 'text-red-400' : 'text-green-400'}`}>{persen.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="col-span-3 text-right font-medium text-sm text-gray-300">Rp {item.pagu.toLocaleString('id-ID')}</div>
                <div className="col-span-3 text-right font-bold text-sm text-blue-400">Rp {item.realisasi.toLocaleString('id-ID')}</div>
                <div className="col-span-2 text-right font-bold text-sm text-gray-400">Rp {(item.pagu - item.realisasi).toLocaleString('id-ID')}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
