'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, UserPlus, Save, User, MapPin, Phone, GraduationCap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

export default function TambahSiswaPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Siswa berhasil ditambahkan');
      router.push('/dashboard/siswa');
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 md:mb-8">
        <Link href="/dashboard/siswa" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Tambah Siswa</h1>
          <p className="text-[13px] md:text-sm text-gray-400">Daftarkan siswa baru ke dalam sistem</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Identitas Siswa */}
        <div className="bg-[#1c1c1e] md:bg-[#242426] rounded-3xl p-6 border border-white/5 shadow-lg">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <User size={20} />
            </div>
            <h2 className="text-[16px] font-bold text-white">Identitas Siswa</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Nama Lengkap</label>
              <input 
                type="text" 
                required
                placeholder="Masukkan nama lengkap siswa"
                className="w-full rounded-2xl bg-black/20 border border-white/10 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">NIS / NISN</label>
              <input 
                type="text" 
                required
                placeholder="Nomor Induk Siswa"
                className="w-full rounded-2xl bg-black/20 border border-white/10 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Jenis Kelamin</label>
              <select className="w-full rounded-2xl bg-[#1c1c1e] border border-white/10 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors">
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Status Siswa</label>
              <select className="w-full rounded-2xl bg-[#1c1c1e] border border-white/10 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors">
                <option value="Aktif">Aktif (Masih Bersekolah)</option>
                <option value="Lulus">Lulus / Alumni</option>
                <option value="Keluar">Keluar / Pindah</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Akademik */}
        <div className="bg-[#1c1c1e] md:bg-[#242426] rounded-3xl p-6 border border-white/5 shadow-lg">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <GraduationCap size={20} />
            </div>
            <h2 className="text-[16px] font-bold text-white">Akademik</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Kelas Saat Ini</label>
              <select className="w-full rounded-2xl bg-[#1c1c1e] border border-white/10 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors">
                <option>X-1</option>
                <option>X-2</option>
                <option>XI-IPA 1</option>
                <option>XII-IPS 1</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Angkatan / Tahun Masuk</label>
              <input 
                type="number" 
                required
                placeholder="Contoh: 2024"
                className="w-full rounded-2xl bg-black/20 border border-white/10 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Data Kontak & Orang Tua */}
        <div className="bg-[#1c1c1e] md:bg-[#242426] rounded-3xl p-6 border border-white/5 shadow-lg">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center">
              <Phone size={20} />
            </div>
            <h2 className="text-[16px] font-bold text-white">Kontak Wali / Orang Tua</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Nama Orang Tua/Wali</label>
              <input 
                type="text" 
                placeholder="Nama ayah atau ibu"
                className="w-full rounded-2xl bg-black/20 border border-white/10 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">No. WhatsApp Wali</label>
              <input 
                type="tel" 
                placeholder="Contoh: 08123456789"
                className="w-full rounded-2xl bg-black/20 border border-white/10 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Alamat Lengkap</label>
            <textarea 
              rows={3}
              placeholder="Alamat domisili saat ini"
              className="w-full rounded-2xl bg-black/20 border border-white/10 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-green-500 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex gap-4 pt-4 pb-12 md:pb-0">
          <Link href="/dashboard/siswa" className="flex-1 md:flex-none">
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
                <Save size={18} className="mr-2" />
                Simpan Data Siswa
              </>
            )}
          </Button>
        </div>

      </form>
    </div>
  );
}
