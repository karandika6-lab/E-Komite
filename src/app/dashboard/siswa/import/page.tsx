'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Download, UploadCloud, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ImportSiswaPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Silakan pilih file terlebih dahulu');
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Data siswa berhasil di-import!');
      router.push('/dashboard/profil');
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 md:mb-8">
        <Link href="/dashboard/profil" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Import Data Siswa</h1>
          <p className="text-[13px] md:text-sm text-gray-400">Unggah data siswa massal via Excel/CSV</p>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Step 1: Template */}
        <div className="bg-[#1c1c1e] md:bg-[#242426] rounded-3xl p-5 border border-white/5 shadow-lg">
          <div className="flex items-start gap-4">
             <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
               <span className="font-bold">1</span>
             </div>
             <div className="flex-1">
                <h3 className="text-[15px] font-bold text-white mb-1">Unduh Template</h3>
                <p className="text-[13px] text-gray-400 mb-4">Gunakan format file template kami untuk memastikan data berhasil dimasukkan ke sistem.</p>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[13px] font-semibold text-white hover:bg-white/10 transition-colors">
                  <Download size={16} className="text-blue-400" />
                  Template_Siswa.xlsx
                </button>
             </div>
          </div>
        </div>

        {/* Step 2: Upload */}
        <div className="bg-[#1c1c1e] md:bg-[#242426] rounded-3xl p-5 border border-white/5 shadow-lg">
          <div className="flex items-start gap-4 mb-4">
             <div className="w-10 h-10 rounded-2xl bg-green-500/10 text-green-400 flex items-center justify-center shrink-0">
               <span className="font-bold">2</span>
             </div>
             <div>
                <h3 className="text-[15px] font-bold text-white mb-1">Unggah File</h3>
                <p className="text-[13px] text-gray-400">Upload file yang sudah diisi di sini.</p>
             </div>
          </div>

          <label className="relative flex flex-col items-center justify-center w-full h-48 rounded-2xl border-2 border-dashed border-white/10 bg-black/10 hover:bg-black/20 hover:border-blue-500/50 transition-all cursor-pointer group mt-2">
            <input 
              type="file" 
              className="hidden" 
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {file ? (
              <div className="flex flex-col items-center">
                 <FileSpreadsheet size={40} className="text-green-500 mb-3" />
                 <p className="text-[14px] font-semibold text-white text-center max-w-[200px] truncate">{file.name}</p>
                 <p className="text-[11px] text-gray-400 mt-1">Siap untuk di-import</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <UploadCloud size={24} className="text-blue-400" />
                </div>
                <p className="text-[14px] font-medium text-white mb-1">Klik untuk memilih file</p>
                <p className="text-[11px] text-gray-500">Mendukung .XLSX atau .CSV (Max. 10MB)</p>
              </div>
            )}
          </label>
        </div>

        {/* Warning Note */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
          <AlertCircle size={18} className="text-orange-400 shrink-0 mt-0.5" />
          <p className="text-[12px] text-orange-200/80 leading-relaxed">
            Peringatan: Pastikan kolom NIS tidak ada yang duplikat dengan siswa yang sudah terdaftar. Siswa dengan NIS yang sama akan diabaikan.
          </p>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-[#111]/80 backdrop-blur-xl border-t border-white/5 z-40 md:relative md:bg-transparent md:border-none md:p-0 md:mt-8 md:block">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !file}
            className={`w-full py-4 md:py-3.5 px-8 rounded-2xl font-bold text-[15px] transition-all flex justify-center items-center gap-2 ${
              !isSubmitting && file
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30' 
                : 'bg-white/5 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Mulai Proses Import'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
