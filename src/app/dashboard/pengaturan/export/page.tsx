'use client';

import React, { useState } from 'react';
import { ArrowLeft, Download, FileJson, FileSpreadsheet, Database } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ExportDataPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState('excel');
  
  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      toast.success('Data berhasil diexport dan diunduh!');
    }, 2500);
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
      <div className="fixed bottom-0 left-0 w-full p-4 bg-[#111]/80 backdrop-blur-xl border-t border-white/5 z-40 md:relative md:bg-transparent md:border-none md:p-0 md:mt-8 md:block">
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
