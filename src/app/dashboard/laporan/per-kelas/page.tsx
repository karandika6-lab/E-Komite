'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Printer, Download, Filter } from 'lucide-react';
import Link from 'next/link';
import { exportToExcel, exportToPDF } from '@/utils/reportGenerator';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function LaporanPerKelasPage() {
  const [dataKelas, setDataKelas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [angkatanFilter, setAngkatanFilter] = useState('');
  const supabase = createClient();

  React.useEffect(() => {
    fetchDataKelas();
  }, []);

  const fetchDataKelas = async () => {
    setIsLoading(true);
    try {
      // Fetch all students with their tagihan
      const { data: siswaData, error } = await supabase
        .from('siswa')
        .select(`
          id, kelas,
          tagihan (total_tagihan, total_dibayar, sisa_tagihan)
        `);

      if (error) throw error;

      // Group by kelas
      const grouped: Record<string, any> = {};
      
      siswaData?.forEach((s: any) => {
        const k = s.kelas;
        if (!grouped[k]) {
          grouped[k] = {
            id: k,
            kelas: k,
            wali: '-',
            totalSiswa: 0,
            nunggakSiswa: 0,
            terkumpul: 0
          };
        }
        
        grouped[k].totalSiswa += 1;
        
        let hasNunggak = false;
        if (s.tagihan) {
          s.tagihan.forEach((t: any) => {
            grouped[k].terkumpul += (t.total_dibayar || 0);
            if (t.sisa_tagihan > 0) hasNunggak = true;
          });
        }
        
        if (hasNunggak) grouped[k].nunggakSiswa += 1;
      });

      // Calculate percentage and format
      const finalData = Object.values(grouped).map((g: any) => {
        const patuh = g.totalSiswa - g.nunggakSiswa;
        const lunasPersen = g.totalSiswa > 0 ? Math.round((patuh / g.totalSiswa) * 100) : 0;
        return {
          ...g,
          lunasPersen
        };
      }).sort((a, b) => a.kelas.localeCompare(b.kelas));

      setDataKelas(finalData);
    } catch (err: any) {
      toast.error('Gagal mengambil data per kelas: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const displayData = dataKelas.filter(d => {
    if (angkatanFilter) return d.kelas.startsWith(angkatanFilter);
    return true;
  });

  const handleExportExcel = () => {
    const exportCols = [
      { header: 'Kelas', key: 'kelas', width: 15 },
      { header: 'Wali Kelas', key: 'wali', width: 25 },
      { header: 'Total Siswa', key: 'totalSiswa', width: 15 },
      { header: 'Lunas (%)', key: 'lunasPersen', width: 15 },
      { header: 'Menunggak (Siswa)', key: 'nunggakSiswa', width: 20 },
      { header: 'Dana Terkumpul', key: 'terkumpul', width: 25 },
    ];
    const data = displayData.map(d => ({
      ...d,
      lunasPersen: `${d.lunasPersen}%`
    }));
    exportToExcel('Laporan Per Kelas', exportCols, data, 'Laporan_Per_Kelas_EKomite');
  };

  const handleExportPDF = () => {
    const exportCols = [
      { header: 'Kelas', key: 'kelas' },
      { header: 'Wali Kelas', key: 'wali' },
      { header: 'Total Siswa', key: 'totalSiswa' },
      { header: 'Lunas (%)', key: 'lunasPersen' },
      { header: 'Menunggak', key: 'nunggakSiswa' },
      { header: 'Dana Terkumpul (Rp)', key: 'terkumpulStr' },
    ];
    const data = displayData.map(d => ({
      ...d,
      lunasPersen: `${d.lunasPersen}%`,
      nunggakSiswa: `${d.nunggakSiswa} Siswa`,
      terkumpulStr: d.terkumpul.toLocaleString('id-ID')
    }));
    exportToPDF('Laporan Per Kelas', exportCols, data, 'Laporan_Per_Kelas_EKomite');
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/laporan" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Rekapitulasi Per Kelas</h1>
            <p className="text-sm text-text-secondary">Statistik kepatuhan pembayaran siswa per rombel.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative hidden md:flex items-center">
             <Filter size={16} className="absolute left-3 text-gray-400" />
             <select 
               value={angkatanFilter}
               onChange={(e) => setAngkatanFilter(e.target.value)}
               className="appearance-none pl-9 pr-8 py-2 rounded-md bg-transparent border border-white/20 text-sm text-white focus:outline-none focus:border-white/40 cursor-pointer"
             >
               <option value="" className="bg-bg-elevated text-white">Semua Angkatan</option>
               <option value="X" className="bg-bg-elevated text-white">Angkatan X</option>
               <option value="XI" className="bg-bg-elevated text-white">Angkatan XI</option>
               <option value="XII" className="bg-bg-elevated text-white">Angkatan XII</option>
             </select>
           </div>
           <Button onClick={handleExportExcel} variant="outline" size="sm"><Download size={16} className="mr-2" /> Excel</Button>
           <Button onClick={handleExportPDF} size="sm"><Printer size={16} className="mr-2" /> Cetak PDF</Button>
        </div>
      </div>

      <div className="bg-[#1c1c1e] rounded-3xl border border-white/5 shadow-lg mt-8 overflow-x-auto">
        <div className="min-w-[900px] divide-y divide-white/5">
          <div className="p-4 grid grid-cols-12 gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider bg-white/[0.02]">
            <div className="col-span-3">Kelas & Wali</div>
            <div className="col-span-2 text-center">Total Siswa</div>
            <div className="col-span-3 text-center">Tingkat Kepatuhan (Lunas)</div>
            <div className="col-span-2 text-center">Menunggak</div>
            <div className="col-span-2 text-right">Dana Terkumpul</div>
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Memuat rekapitulasi per kelas...</div>
          ) : displayData.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Tidak ada data untuk angkatan ini.</div>
          ) : (
            displayData.map((item) => (
              <div key={item.id} className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-white/[0.02] transition-colors">
                 <div className="col-span-3">
                    <h4 className="font-bold text-white text-md">{item.kelas}</h4>
                    <p className="text-xs text-gray-500">{item.wali}</p>
                 </div>
                 <div className="col-span-2 text-center font-bold text-gray-300">{item.totalSiswa}</div>
                 <div className="col-span-3">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-24 bg-white/10 h-2 rounded-full overflow-hidden">
                         <div className={`h-full rounded-full ${item.lunasPersen < 80 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${item.lunasPersen}%` }} />
                      </div>
                      <span className={`text-[11px] font-bold ${item.lunasPersen < 80 ? 'text-orange-400' : 'text-green-400'}`}>{item.lunasPersen}%</span>
                    </div>
                 </div>
                 <div className="col-span-2 text-center font-bold text-red-400">{item.nunggakSiswa} Siswa</div>
                 <div className="col-span-2 text-right font-bold text-blue-400">Rp {item.terkumpul.toLocaleString('id-ID')}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
