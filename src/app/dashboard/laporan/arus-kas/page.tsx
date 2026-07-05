'use client';
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Printer, Download, Filter, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { exportToExcel, exportToPDF } from '@/utils/reportGenerator';
import { createClient } from '@/lib/supabase/client';
import { format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export default function LaporanArusKasPage() {
  const [dataArusKas, setDataArusKas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  React.useEffect(() => {
    fetchArusKas();
  }, []);

  const fetchArusKas = async () => {
    setIsLoading(true);
    try {
      const { data: dataMasuk, error: errMasuk } = await supabase
        .from('pembayaran')
        .select('tanggal_bayar, jumlah');
        
      const { data: dataKeluar, error: errKeluar } = await supabase
        .from('pengeluaran')
        .select('tanggal, jumlah');

      if (errMasuk) throw errMasuk;
      if (errKeluar) throw errKeluar;

      // Group by YYYY-MM
      const grouped: Record<string, { masuk: number, keluar: number }> = {};
      
      (dataMasuk as any[])?.forEach(d => {
        if(!d.tanggal_bayar) return;
        const bln = d.tanggal_bayar.substring(0, 7); // YYYY-MM
        if(!grouped[bln]) grouped[bln] = { masuk: 0, keluar: 0 };
        grouped[bln].masuk += d.jumlah;
      });

      (dataKeluar as any[])?.forEach(d => {
        if(!d.tanggal) return;
        const bln = d.tanggal.substring(0, 7); // YYYY-MM
        if(!grouped[bln]) grouped[bln] = { masuk: 0, keluar: 0 };
        grouped[bln].keluar += d.jumlah;
      });

      // Sort keys chronologically
      const sortedKeys = Object.keys(grouped).sort();
      
      let currentSaldo = 0;
      const finalData = sortedKeys.map(k => {
        const monthName = format(parseISO(`${k}-01`), 'MMMM yyyy', { locale: localeId });
        currentSaldo += grouped[k].masuk - grouped[k].keluar;
        return {
          id: k,
          rawBulan: k,
          bulan: monthName,
          masuk: grouped[k].masuk,
          keluar: grouped[k].keluar,
          saldo: currentSaldo
        };
      });

      setDataArusKas(finalData);
    } catch (error: any) {
      toast.error('Gagal mengambil laporan arus kas: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  const [tahunFilter, setTahunFilter] = useState('');

  const displayData = dataArusKas.filter(d => {
    if (tahunFilter) return d.rawBulan.startsWith(tahunFilter);
    return true;
  });

  const totalMasuk = displayData.reduce((acc, curr) => acc + curr.masuk, 0);
  const totalKeluar = displayData.reduce((acc, curr) => acc + curr.keluar, 0);
  const saldoAkhir = totalMasuk - totalKeluar;

  const handleExportExcel = () => {
    const exportCols = [
      { header: 'Bulan', key: 'bulan', width: 20 },
      { header: 'Kas Masuk', key: 'masuk', width: 25 },
      { header: 'Kas Keluar', key: 'keluar', width: 25 },
      { header: 'Saldo Kas', key: 'saldo', width: 25 },
    ];
    exportToExcel('Laporan Arus Kas', exportCols, displayData, 'Laporan_Arus_Kas_EKomite');
  };

  const handleExportPDF = () => {
    const exportCols = [
      { header: 'Bulan', key: 'bulan' },
      { header: 'Kas Masuk (Rp)', key: 'masukStr' },
      { header: 'Kas Keluar (Rp)', key: 'keluarStr' },
      { header: 'Saldo Kas (Rp)', key: 'saldoStr' },
    ];
    const data = displayData.map(d => ({
      bulan: d.bulan,
      masukStr: d.masuk.toLocaleString('id-ID'),
      keluarStr: d.keluar.toLocaleString('id-ID'),
      saldoStr: d.saldo.toLocaleString('id-ID')
    }));
    exportToPDF('Laporan Arus Kas', exportCols, data, 'Laporan_Arus_Kas_EKomite');
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/laporan" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Arus Kas (Cash Flow)</h1>
            <p className="text-sm text-text-secondary">Laporan mutasi pergerakan dana bulanan.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative hidden md:flex items-center">
             <Filter size={16} className="absolute left-3 text-gray-400" />
             <select 
               value={tahunFilter}
               onChange={(e) => setTahunFilter(e.target.value)}
               className="appearance-none pl-9 pr-8 py-2 rounded-md bg-transparent border border-white/20 text-sm text-white focus:outline-none focus:border-white/40 cursor-pointer"
             >
               <option value="" className="bg-bg-elevated text-white">Semua Tahun</option>
               <option value="2025" className="bg-bg-elevated text-white">Tahun 2025</option>
               <option value="2026" className="bg-bg-elevated text-white">Tahun 2026</option>
             </select>
           </div>
           <Button onClick={handleExportExcel} variant="outline" size="sm"><Download size={16} className="mr-2" /> Excel</Button>
           <Button onClick={handleExportPDF} size="sm"><Printer size={16} className="mr-2" /> Cetak PDF</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
             <div className="flex items-center gap-3 mb-2">
               <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400"><TrendingUp size={16}/></div>
               <p className="text-sm text-gray-300 font-medium">Total Pemasukan</p>
            </div>
            <h3 className="text-2xl font-bold text-green-400 tracking-tight">Rp {totalMasuk.toLocaleString('id-ID')}</h3>
         </Card>
         <Card className="bg-gradient-to-br from-pink-500/10 to-transparent border-pink-500/20">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400"><TrendingDown size={16}/></div>
               <p className="text-sm text-gray-300 font-medium">Total Pengeluaran</p>
            </div>
            <h3 className="text-2xl font-bold text-pink-400 tracking-tight">Rp {totalKeluar.toLocaleString('id-ID')}</h3>
         </Card>
         <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400"><DollarSign size={16}/></div>
               <p className="text-sm text-gray-300 font-medium">Saldo Akhir</p>
            </div>
            <h3 className="text-2xl font-bold text-blue-400 tracking-tight">Rp {saldoAkhir.toLocaleString('id-ID')}</h3>
         </Card>
      </div>

      <div className="bg-[#1c1c1e] rounded-3xl border border-white/5 shadow-lg mt-8 overflow-x-auto">
        <div className="min-w-[600px] divide-y divide-white/5">
          <div className="p-4 grid grid-cols-4 gap-4 text-xs font-bold text-gray-400 uppercase tracking-wider bg-white/[0.02]">
            <div>Bulan</div>
            <div className="text-right">Kas Masuk</div>
            <div className="text-right">Kas Keluar</div>
            <div className="text-right">Saldo Kas</div>
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Memuat laporan arus kas...</div>
          ) : displayData.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Belum ada transaksi pada periode ini.</div>
          ) : (
            displayData.map((item) => (
              <div key={item.id} className="p-4 grid grid-cols-4 gap-4 items-center hover:bg-white/[0.02] transition-colors">
                 <div className="font-bold text-white text-sm">{item.bulan}</div>
                 <div className="text-right font-medium text-sm text-green-400">+ Rp {item.masuk.toLocaleString('id-ID')}</div>
                 <div className="text-right font-medium text-sm text-pink-400">- Rp {item.keluar.toLocaleString('id-ID')}</div>
                 <div className="text-right font-bold text-sm text-blue-400">Rp {item.saldo.toLocaleString('id-ID')}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
