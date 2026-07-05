'use client';

import React, { useState } from 'react';
import { ArrowLeft, Download, FileJson, FileSpreadsheet, Database } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

export default function ExportDataPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState('excel');
  const supabase = createClient();
  
  const handleExport = async () => {
    setIsExporting(true);
    try {
      // 1. Fetch Real Data
      const { data: siswaData } = await supabase.from('siswa').select('*');
      
      const { data: pemasukanData } = await supabase.from('pembayaran').select(`
        id, jumlah, tanggal_bayar, keterangan,
        tagihan(jenis_pembayaran(nama))
      `);
      
      const { data: pengeluaranData } = await supabase.from('pengeluaran').select(`
        id, jumlah, tanggal, nama_pengeluaran, keterangan,
        kategori_pengeluaran(nama)
      `);

      if (exportType === 'json') {
        const fullData = {
          siswa: siswaData || [],
          pemasukan: pemasukanData || [],
          pengeluaran: pengeluaranData || []
        };
        const content = JSON.stringify(fullData, null, 2);
        const blob = new Blob([content], { type: 'application/json' });
        saveAs(blob, `Backup_Database_EKomite_${format(new Date(), 'yyyyMMdd')}.json`);
      } else {
        // Export Professional Excel via ExcelJS
        const workbook = new ExcelJS.Workbook();
        
        // Helper function for styling sheets
        const styleSheet = (worksheet: ExcelJS.Worksheet) => {
          const headerRow = worksheet.getRow(1);
          headerRow.height = 25;
          headerRow.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF166534' } }; // Green
            cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11, name: 'Arial' };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
              top: { style: 'thin', color: { argb: 'FF14532D' } },
              left: { style: 'thin', color: { argb: 'FF14532D' } },
              bottom: { style: 'thin', color: { argb: 'FF14532D' } },
              right: { style: 'thin', color: { argb: 'FF14532D' } }
            };
          });

          worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
              row.height = 22;
              row.eachCell((cell) => {
                cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
                cell.border = {
                  top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                  left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                  bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                  right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
                };
                if (rowNumber % 2 === 0) {
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
                }
              });
            }
          });
        };

        // Sheet 1: Siswa
        const wsSiswa = workbook.addWorksheet('Data Siswa', { views: [{ showGridLines: false }] });
        wsSiswa.columns = [
          { header: 'NIS', key: 'nis', width: 15 },
          { header: 'Nama Lengkap', key: 'nama', width: 35 },
          { header: 'Kelas', key: 'kelas', width: 15 },
          { header: 'Angkatan', key: 'angkatan', width: 15 },
          { header: 'Status', key: 'status', width: 15 }
        ];
        
        (siswaData || []).forEach(s => {
          wsSiswa.addRow({ 
            nis: s.nis, 
            nama: s.nama_lengkap, 
            kelas: s.kelas, 
            angkatan: s.angkatan, 
            status: s.status
          });
        });
        styleSheet(wsSiswa);

        // Sheet 2: Transaksi Keuangan
        const wsTransaksi = workbook.addWorksheet('Buku Kas', { views: [{ showGridLines: false }] });
        wsTransaksi.columns = [
          { header: 'Tanggal', key: 'tanggal', width: 20 },
          { header: 'Tipe', key: 'tipe', width: 15 },
          { header: 'Kategori', key: 'kategori', width: 25 },
          { header: 'Nominal (Rp)', key: 'nominal', width: 20 },
          { header: 'Keterangan', key: 'keterangan', width: 45 }
        ];
        
        const allTransactions = [
          ...(pemasukanData || []).map((p: any) => ({
            rawDate: new Date(p.tanggal_bayar).getTime(),
            tanggal: format(new Date(p.tanggal_bayar), 'dd-MM-yyyy', { locale: localeId }),
            tipe: 'Pemasukan',
            kategori: p.tagihan?.jenis_pembayaran?.nama || 'Pembayaran',
            nominal: p.jumlah,
            keterangan: p.keterangan || '-'
          })),
          ...(pengeluaranData || []).map((p: any) => ({
            rawDate: new Date(p.tanggal).getTime(),
            tanggal: format(new Date(p.tanggal), 'dd-MM-yyyy', { locale: localeId }),
            tipe: 'Pengeluaran',
            kategori: p.kategori_pengeluaran?.nama || 'Pengeluaran',
            nominal: p.jumlah,
            keterangan: p.nama_pengeluaran
          }))
        ].sort((a, b) => a.rawDate - b.rawDate);

        allTransactions.forEach(t => {
          wsTransaksi.addRow({
            tanggal: t.tanggal,
            tipe: t.tipe,
            kategori: t.kategori,
            nominal: t.nominal,
            keterangan: t.keterangan
          });
        });
        
        styleSheet(wsTransaksi);

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `Backup_Database_EKomite_${format(new Date(), 'yyyyMMdd')}.xlsx`);
      }

      toast.success('Data berhasil diexport dan diunduh!');
    } catch (err: any) {
      toast.error('Gagal export data: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 md:mb-8">
        <Link href="/dashboard/profil" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Export Seluruh Data</h1>
          <p className="text-[13px] md:text-sm text-gray-400">Unduh backup data (Siswa, Tagihan, Transaksi)</p>
        </div>
      </div>

      <div className="bg-[#1c1c1e] md:bg-[#242426] rounded-3xl p-5 border border-white/5 shadow-lg space-y-6">
        
        {/* Illustration/Icon */}
        <div className="flex justify-center py-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Database size={40} className="text-blue-400" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[#1c1c1e] rounded-full flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <Download size={16} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="text-center px-4">
          <h2 className="text-[16px] font-bold text-white mb-2">Backup Database Lengkap</h2>
          <p className="text-[13px] text-gray-400">
            Proses ini akan mengekstrak seluruh data penting termasuk profil siswa, riwayat pembayaran masuk, pengeluaran, serta data master lainnya.
          </p>
        </div>

        <div className="pt-4 border-t border-white/5">
          <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Pilih Format File</p>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setExportType('excel')}
              className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-3 border transition-all ${
                exportType === 'excel' ? 'border-green-500 bg-green-500/10' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
              }`}
            >
              <FileSpreadsheet size={28} className={exportType === 'excel' ? 'text-green-400' : 'text-gray-500'} />
              <span className={`text-[13px] font-bold ${exportType === 'excel' ? 'text-green-400' : 'text-gray-400'}`}>Excel (.xlsx)</span>
            </button>
            <button 
              onClick={() => setExportType('json')}
              className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-3 border transition-all ${
                exportType === 'json' ? 'border-blue-500 bg-blue-500/10' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
              }`}
            >
              <FileJson size={28} className={exportType === 'json' ? 'text-blue-400' : 'text-gray-500'} />
              <span className={`text-[13px] font-bold ${exportType === 'json' ? 'text-blue-400' : 'text-gray-400'}`}>JSON (.json)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-20 left-0 w-full p-4 bg-[#111]/80 backdrop-blur-xl border-t border-white/5 z-40 md:relative md:bottom-0 md:bg-transparent md:border-none md:p-0 md:mt-8 md:block">
        <div className="max-w-2xl mx-auto">
          <button 
            onClick={handleExport} 
            disabled={isExporting}
            className={`w-full py-4 md:py-3.5 px-8 rounded-2xl font-bold text-[15px] transition-all flex justify-center items-center gap-2 ${
              !isExporting
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30' 
                : 'bg-white/5 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isExporting ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Mengekstrak Data...
              </>
            ) : (
              <>
                <Download size={20} />
                Mulai Export
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
