'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Calendar, Upload, FileText, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

export default function InputPengeluaranPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nominal, setNominal] = useState('');
  
  const dummyKategori = [
    'Operasional', 'Honor', 'ATK', 'Kegiatan Siswa', 'Pemeliharaan', 'Lain-lain'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Pengeluaran berhasil dicatat!');
      router.push('/dashboard/keuangan/pengeluaran');
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 md:mb-8">
        <Link href="/dashboard/keuangan/pengeluaran" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Catat Pengeluaran</h1>
          <p className="text-[13px] md:text-sm text-gray-400">Input data pengeluaran dan upload bukti</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Nominal Section */}
        <div className="bg-[#1c1c1e] md:bg-[#242426] rounded-3xl p-6 border border-white/5 shadow-lg flex flex-col items-center justify-center min-h-[140px]">
          <p className="text-sm text-gray-400 font-medium mb-2">Total Pengeluaran</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl text-gray-500 font-medium mt-1">Rp</span>
            <input 
              type="number" 
              value={nominal}
              onChange={(e) => setNominal(e.target.value)}
              placeholder="0"
              required
              className="w-[200px] bg-transparent text-center text-5xl font-bold text-white placeholder-gray-600 focus:outline-none"
            />
          </div>
          <div className="w-3/4 h-px bg-white/10 mt-4" />
        </div>

        {/* Details Section */}
        <div className="bg-[#1c1c1e] md:bg-[#242426] rounded-3xl p-5 border border-white/5 shadow-lg space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Kategori</label>
              <select required className="w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-3.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors appearance-none">
                <option value="" disabled selected>Pilih Kategori...</option>
                {dummyKategori.map(k => (
                  <option key={k} value={k} className="bg-[#242426] text-white">{k}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Tanggal</label>
              <div className="relative">
                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="date"
                  required
                  className="w-full rounded-2xl bg-black/20 border border-white/10 py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Nama Pengeluaran</label>
            <div className="relative">
              <FileText size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                placeholder="Contoh: Pembelian ATK untuk Ujian Akhir"
                required
                className="w-full rounded-2xl bg-black/20 border border-white/10 py-3.5 pl-11 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Penerima / Toko (Opsional)</label>
            <input 
              type="text"
              placeholder="Contoh: Toko Buku Sejahtera"
              className="w-full rounded-2xl bg-black/20 border border-white/10 py-3.5 px-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Keterangan / Deskripsi</label>
            <textarea 
              className="w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-3.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors min-h-[100px] resize-y"
              placeholder="Tambahkan detail pengeluaran jika diperlukan..."
            />
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-[#1c1c1e] md:bg-[#242426] rounded-3xl p-5 border border-white/5 shadow-lg">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 mb-3 block">Bukti / Nota (Opsional)</label>
          <div className="border border-dashed border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-black/10 hover:bg-black/20 transition-all cursor-pointer group">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:bg-red-500/10 transition-colors">
              <ImageIcon size={20} className="text-gray-400 group-hover:text-red-400 transition-colors" />
            </div>
            <p className="text-[13px] font-medium text-white mb-1">Klik untuk upload nota</p>
            <p className="text-[11px] text-gray-500">PNG, JPG atau PDF (Max. 5MB)</p>
          </div>
        </div>

        {/* Floating Action Button / Fixed Bottom Bar */}
        <div className="fixed bottom-0 left-0 w-full p-4 bg-[#111]/80 backdrop-blur-xl border-t border-white/5 z-40 md:relative md:bg-transparent md:border-none md:p-0 md:mt-8 md:block">
          <div className="max-w-2xl mx-auto flex items-center gap-4">
            <button 
              type="submit" 
              disabled={isSubmitting || !nominal}
              className={`w-full py-4 md:py-3.5 px-8 rounded-2xl font-bold text-[15px] transition-all flex justify-center items-center gap-2 ${
                !isSubmitting && nominal
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-600/30' 
                  : 'bg-white/5 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Simpan Pengeluaran'
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
