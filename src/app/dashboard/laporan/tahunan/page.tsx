'use client';
import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Printer, FileText, PieChart, TrendingUp, TrendingDown, Layers, Download } from 'lucide-react';
import Link from 'next/link';
import { exportToExcel, exportToPDF } from '@/utils/reportGenerator';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function LaporanTahunanPage() {
  const [metrics, setMetrics] = useState({
    pemasukan: 0,
    pengeluaran: 0,
    surplus: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  React.useEffect(() => {
    fetchTahunan();
  }, []);

  const fetchTahunan = async () => {
    setIsLoading(true);
    try {
      // Pemasukan
      const { data: dataPemasukan, error: errPemasukan } = await supabase
        .from('pembayaran')
        .select('jumlah');
      
      // Pengeluaran
      const { data: dataPengeluaran, error: errPengeluaran } = await supabase
        .from('pengeluaran')
        .select('jumlah');

      if (errPemasukan) throw errPemasukan;
      if (errPengeluaran) throw errPengeluaran;

      const totalPemasukan = ((dataPemasukan as any[]) || []).reduce((sum, item) => sum + item.jumlah, 0);
      const totalPengeluaran = ((dataPengeluaran as any[]) || []).reduce((sum, item) => sum + item.jumlah, 0);
      
      setMetrics({
        pemasukan: totalPemasukan,
        pengeluaran: totalPengeluaran,
        surplus: totalPemasukan - totalPengeluaran
      });
    } catch (err: any) {
      toast.error('Gagal mengambil laporan tahunan: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const reportData = [
    { uraian: 'Total Pemasukan Tahunan', nominal: metrics.pemasukan, keterangan: 'Berdasarkan seluruh transaksi pembayaran' },
    { uraian: 'Total Pengeluaran Tahunan', nominal: metrics.pengeluaran, keterangan: 'Berdasarkan pencatatan pengeluaran' },
    { uraian: 'Surplus (Saldo Akhir Tahun)', nominal: metrics.surplus, keterangan: 'Selisih Pemasukan & Pengeluaran' },
  ];
  const handleExportExcel = () => {
    const exportCols = [
      { header: 'Uraian Pertanggungjawaban', key: 'uraian', width: 40 },
      { header: 'Nominal', key: 'nominal', width: 25 },
      { header: 'Keterangan', key: 'keterangan', width: 40 },
    ];
    exportToExcel('Laporan Tahunan', exportCols, reportData, 'Laporan_Tahunan_EKomite');
  };

  const handleExportPDF = () => {
    const exportCols = [
      { header: 'Uraian Pertanggungjawaban', key: 'uraian' },
      { header: 'Nominal (Rp)', key: 'nominalStr' },
      { header: 'Keterangan', key: 'keterangan' },
    ];
    const data = reportData.map(d => ({
      ...d,
      nominalStr: d.nominal.toLocaleString('id-ID')
    }));
    exportToPDF('Laporan Tahunan', exportCols, data, 'Laporan_Tahunan_EKomite');
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/laporan" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Laporan Pertanggungjawaban (Tahunan)</h1>
            <p className="text-sm text-text-secondary">Ringkasan perbendaharaan untuk Tahun Ajaran 2025/2026.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <Button onClick={handleExportExcel} variant="outline" size="sm" className="hidden md:flex"><Download size={16} className="mr-2" /> Excel</Button>
           <Button onClick={handleExportPDF} size="sm" className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30">
             <Printer size={16} className="mr-2" /> Cetak Buku LPJ
           </Button>
        </div>
      </div>
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
         <Card className="bg-gradient-to-br from-green-500/20 to-transparent border-green-500/30 relative overflow-hidden p-6">
            <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp size={60} /></div>
            <p className="text-sm text-green-300 mb-1 font-bold">Total Pemasukan Tahunan</p>
            <h3 className="text-3xl font-black text-green-400 tracking-tight">Rp {metrics.pemasukan.toLocaleString('id-ID')}</h3>
            <p className="text-xs text-gray-400 mt-2">Berdasarkan seluruh transaksi pembayaran</p>
         </Card>
         <Card className="bg-gradient-to-br from-pink-500/20 to-transparent border-pink-500/30 relative overflow-hidden p-6">
            <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingDown size={60} /></div>
            <p className="text-sm text-pink-300 mb-1 font-bold">Total Pengeluaran Tahunan</p>
            <h3 className="text-3xl font-black text-pink-400 tracking-tight">Rp {metrics.pengeluaran.toLocaleString('id-ID')}</h3>
            <p className="text-xs text-gray-400 mt-2">Berdasarkan pencatatan pengeluaran</p>
         </Card>
         <Card className="bg-gradient-to-br from-blue-500/20 to-transparent border-blue-500/30 relative overflow-hidden p-6">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Layers size={60} /></div>
            <p className="text-sm text-blue-300 mb-1 font-bold">Surplus (Saldo Akhir Tahun)</p>
            <h3 className="text-3xl font-black text-blue-400 tracking-tight">Rp {metrics.surplus.toLocaleString('id-ID')}</h3>
            <p className="text-xs text-gray-400 mt-2">Dapat dilanjutkan ke T.A berikutnya</p>
         </Card>
      </div>

      {/* Visual representation layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <Card glass className="p-6 h-[400px] flex flex-col">
            <h3 className="font-bold text-white mb-6 flex items-center"><PieChart className="mr-2 text-blue-400" size={18} /> Komposisi Pemasukan</h3>
            <div className="flex-1 flex items-center justify-center relative">
               {/* Mock Donut Chart via CSS CSS */}
               <div className="w-48 h-48 rounded-full border-[16px] border-[#1c1c1e] bg-transparent flex-shrink-0"
                    style={{
                      background: 'conic-gradient(#3b82f6 0% 60%, #a855f7 60% 85%, #f59e0b 85% 100%)',
                    }}>
                   {/* Inner circle to make donut */}
                   <div className="w-full h-full rounded-full bg-bg-card flex items-center justify-center flex-col shadow-inner" style={{ transform: 'scale(0.8)' }}>
                      <p className="text-xs text-gray-400">Total</p>
                      <p className="font-bold text-white">100%</p>
                   </div>
               </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
               <div><div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-1"></div><p className="text-[10px] text-gray-400">Uang Pangkal (60%)</p></div>
               <div><div className="w-3 h-3 bg-purple-500 rounded-full mx-auto mb-1"></div><p className="text-[10px] text-gray-400">Uang Komite (25%)</p></div>
               <div><div className="w-3 h-3 bg-orange-500 rounded-full mx-auto mb-1"></div><p className="text-[10px] text-gray-400">Lain-lain (15%)</p></div>
            </div>
         </Card>
         
         <Card glass className="p-6">
            <h3 className="font-bold text-white mb-6 flex items-center"><FileText className="mr-2 text-blue-400" size={18} /> Dokumen Lampiran LPJ</h3>
            <div className="space-y-3">
               {[
                 'Buku Kas Umum (BKU) Lengkap 12 Bulan',
                 'Laporan Realisasi Anggaran (LRA) per Kategori',
                 'Daftar Piutang & Tunggakan Siswa Akhir Tahun',
                 'Rekening Koran Bank Sekolah',
                 'Berita Acara Serah Terima Saldo'
               ].map((doc, i) => (
                 <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between hover:bg-white/10 transition cursor-pointer">
                    <div className="flex items-center gap-3">
                       <FileText size={18} className="text-gray-400" />
                       <span className="text-sm text-gray-200">{doc}</span>
                    </div>
                    <Button onClick={() => toast.info(`Preview dokumen ${doc} belum tersedia.`)} variant="ghost" size="sm" className="h-8 text-blue-400 hover:text-blue-300">Preview</Button>
                 </div>
               ))}
            </div>
         </Card>
      </div>
    </div>
  );
}
