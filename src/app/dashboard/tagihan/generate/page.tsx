'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, FileText, Send, CheckCircle2, Users, Receipt, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

export default function GenerateTagihanPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [targetType, setTargetType] = useState('kelas'); // 'kelas', 'angkatan', 'semua'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Tagihan massal berhasil di-generate!');
      router.push('/dashboard/tagihan');
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 md:mb-8">
        <Link href="/dashboard/tagihan" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Generate Tagihan Massal</h1>
          <p className="text-[13px] md:text-sm text-gray-400">Buat tagihan sekaligus untuk banyak siswa</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Step 1: Info Tagihan */}
        <div className="bg-[#1c1c1e] md:bg-[#242426] rounded-3xl p-6 border border-white/5 shadow-lg">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Receipt size={20} />
            </div>
            <h2 className="text-[16px] font-bold text-white">1. Rincian Tagihan</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Jenis Pembayaran</label>
              <select className="w-full rounded-2xl bg-[#1c1c1e] border border-white/10 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors">
                <option>Uang Komite (Bulanan)</option>
                <option>Uang Pangkal (Sekali Bayar)</option>
                <option>Seragam Sekolah</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Tahun Ajaran</label>
              <select className="w-full rounded-2xl bg-[#1c1c1e] border border-white/10 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors">
                <option>2025/2026</option>
                <option>2024/2025</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Bulan/Periode (Opsional)</label>
              <select className="w-full rounded-2xl bg-[#1c1c1e] border border-white/10 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors">
                <option>Juli</option>
                <option>Agustus</option>
                <option>September</option>
                <option>Semester 1</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Jatuh Tempo</label>
              <div className="relative">
                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="date" 
                  className="w-full rounded-2xl bg-black/20 border border-white/10 py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Target Siswa */}
        <div className="bg-[#1c1c1e] md:bg-[#242426] rounded-3xl p-6 border border-white/5 shadow-lg">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Users size={20} />
            </div>
            <h2 className="text-[16px] font-bold text-white">2. Target Penerima Tagihan</h2>
          </div>

          <div className="flex gap-4 mb-6 overflow-x-auto no-scrollbar pb-2">
             <button 
               type="button"
               onClick={() => setTargetType('kelas')}
               className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                 targetType === 'kelas' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'
               }`}
             >
               Berdasarkan Kelas
             </button>
             <button 
               type="button"
               onClick={() => setTargetType('angkatan')}
               className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                 targetType === 'angkatan' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'
               }`}
             >
               Berdasarkan Angkatan
             </button>
             <button 
               type="button"
               onClick={() => setTargetType('semua')}
               className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                 targetType === 'semua' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'
               }`}
             >
               Seluruh Siswa Aktif
             </button>
          </div>

          <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
             {targetType === 'kelas' && (
               <div className="space-y-4">
                 <p className="text-[13px] text-gray-400">Pilih satu atau beberapa kelas yang akan menerima tagihan ini.</p>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                   {['X-1', 'X-2', 'XI-IPA 1', 'XI-IPS 1', 'XII-IPA 1'].map((kls) => (
                     <label key={kls} className="flex items-center gap-3 p-3 rounded-xl bg-[#1c1c1e] border border-white/5 cursor-pointer hover:border-purple-500/30 transition-colors">
                       <input type="checkbox" className="w-4 h-4 rounded border-gray-600 text-purple-600 focus:ring-purple-600 focus:ring-offset-gray-900 bg-gray-700" />
                       <span className="text-sm font-medium text-white">{kls}</span>
                     </label>
                   ))}
                 </div>
               </div>
             )}
             {targetType === 'angkatan' && (
               <div className="space-y-4">
                 <p className="text-[13px] text-gray-400">Pilih tahun angkatan siswa.</p>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                   {['Angkatan 2024', 'Angkatan 2023', 'Angkatan 2022'].map((thn) => (
                     <label key={thn} className="flex items-center gap-3 p-3 rounded-xl bg-[#1c1c1e] border border-white/5 cursor-pointer hover:border-purple-500/30 transition-colors">
                       <input type="checkbox" className="w-4 h-4 rounded border-gray-600 text-purple-600 focus:ring-purple-600 focus:ring-offset-gray-900 bg-gray-700" />
                       <span className="text-sm font-medium text-white">{thn}</span>
                     </label>
                   ))}
                 </div>
               </div>
             )}
             {targetType === 'semua' && (
               <div className="flex flex-col items-center justify-center py-6 text-center">
                 <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
                   <CheckCircle2 size={32} className="text-green-500" />
                 </div>
                 <h3 className="font-bold text-white mb-1">Tagihan Untuk Semua Siswa Aktif</h3>
                 <p className="text-sm text-gray-400">Total estimasi: 450 Siswa</p>
               </div>
             )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex gap-4 pt-4 pb-12 md:pb-0">
          <Link href="/dashboard/tagihan" className="flex-1 md:flex-none">
            <Button variant="outline" type="button" className="w-full h-14 rounded-2xl font-bold">
              Batal
            </Button>
          </Link>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="flex-1 w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send size={18} className="mr-2" />
                Generate & Terbitkan
              </>
            )}
          </Button>
        </div>

      </form>
    </div>
  );
}
