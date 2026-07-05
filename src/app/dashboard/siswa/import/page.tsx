'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertCircle, ArrowLeft, Download, FileSpreadsheet, UploadCloud } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { createClient } from '@/lib/supabase/client';

export default function ImportSiswaPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Silakan pilih file terlebih dahulu');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 1. Read file as ArrayBuffer
      const buffer = await file.arrayBuffer();
      
      // 2. Load into ExcelJS Workbook
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      
      // 3. Get first worksheet
      const worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new Error('Worksheet tidak ditemukan dalam file');
      }

      // 4. Extract Data
      const siswaData: any[] = [];
      worksheet.eachRow((row, rowNumber) => {
        // Skip header row
        if (rowNumber > 1) {
          const nis = row.getCell(1).text?.toString().trim();
          const nama = row.getCell(2).text?.toString().trim();
          const kelas = row.getCell(3).text?.toString().trim();
          const angkatan = row.getCell(4).text?.toString().trim();
          const noHp = row.getCell(5).text?.toString().trim() || null;
          const alamat = row.getCell(6).text?.toString().trim() || null;

          if (nis && nama && kelas && angkatan) {
             siswaData.push({
               nis: nis,
               nama_lengkap: nama,
               kelas: kelas,
               angkatan: parseInt(angkatan, 10),
               no_hp_ortu: noHp,
               alamat: alamat,
               status: 'Aktif'
             });
          }
        }
      });

      if (siswaData.length === 0) {
         throw new Error('Tidak ada data valid yang ditemukan (kolom wajib: NIS, Nama, Kelas, Angkatan)');
      }

      // 5. Insert to Supabase (Upsert to handle duplicates by NIS)
      const { error } = await (supabase as any)
        .from('siswa')
        .upsert(siswaData, { onConflict: 'nis' });

      if (error) {
        throw error;
      }

      toast.success(`${siswaData.length} Data siswa berhasil di-import!`);
      router.push('/dashboard/siswa'); // redirect to list siswa
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Terjadi kesalahan saat import data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Format Import Siswa', {
      views: [{ showGridLines: false }]
    });

    // Setup Header Row
    const columns = [
      { header: 'NIS', key: 'nis', width: 15 },
      { header: 'Nama Lengkap', key: 'nama', width: 35 },
      { header: 'Kelas', key: 'kelas', width: 15 },
      { header: 'Angkatan', key: 'angkatan', width: 15 },
      { header: 'Nomor HP Ortu', key: 'nohp', width: 20 },
      { header: 'Alamat', key: 'alamat', width: 45 }
    ];
    
    worksheet.columns = columns;

    // Style Header
    const headerRow = worksheet.getRow(1);
    headerRow.height = 25;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF0F172A' } // Dark blue/slate
      };
      cell.font = {
        color: { argb: 'FFFFFFFF' },
        bold: true,
        size: 11,
        name: 'Arial'
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF334155' } },
        left: { style: 'thin', color: { argb: 'FF334155' } },
        bottom: { style: 'thin', color: { argb: 'FF334155' } },
        right: { style: 'thin', color: { argb: 'FF334155' } }
      };
    });

    // Add Dummy Data
    worksheet.addRow({ nis: '2425001', nama: 'Ahmad Faisal', kelas: 'X-1', angkatan: '2024', nohp: '081234567890', alamat: 'Jl. Merdeka No. 10' });
    worksheet.addRow({ nis: '2425002', nama: 'Siti Aminah', kelas: 'X-1', angkatan: '2024', nohp: '081987654321', alamat: 'Jl. Mawar No. 5' });
    worksheet.addRow({ nis: '2425003', nama: 'Budi Santoso', kelas: 'X-2', angkatan: '2024', nohp: '082212345678', alamat: 'Jl. Melati No. 8' });

    // Style Data Rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
          };
          // Alternate row colors
          if (rowNumber % 2 === 0) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
          }
        });
        row.height = 22;
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "Template_Siswa_Profesional.xlsx");
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
                <button 
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[13px] font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  <Download size={16} className="text-blue-400 shrink-0" />
                  <span className="truncate">Template_Siswa.xlsx</span>
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
      <div className="fixed bottom-20 left-0 w-full p-4 bg-[#111]/80 backdrop-blur-xl border-t border-white/5 z-40 md:relative md:bottom-0 md:bg-transparent md:border-none md:p-0 md:mt-8 md:block">
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
