'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, UserPlus, Save, User, MapPin, Phone, GraduationCap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function TambahSiswaPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    nis: '',
    jenis_kelamin: 'Laki-laki',
    status: 'Aktif',
    angkatan: new Date().getFullYear().toString(),
    nama_ortu: '',
    no_hp_ortu: '',
    alamat: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { data, error } = await (supabase as any)
        .from('siswa')
        .insert([
          {
            nama_lengkap: formData.nama_lengkap,
            nis: formData.nis,
            jenis_kelamin: formData.jenis_kelamin,
            status: formData.status,
            kelas: '-', // Default since kelas is removed from UI
            angkatan: parseInt(formData.angkatan),
            nama_ortu: formData.nama_ortu,
            no_hp_ortu: formData.no_hp_ortu,
            alamat: formData.alamat
          }
        ]);

      if (error) throw error;

      toast.success('Siswa berhasil ditambahkan');
      router.push('/dashboard/siswa');
      router.refresh();
    } catch (error: any) {
      toast.error('Gagal menambahkan siswa: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
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
                value={formData.nama_lengkap}
                onChange={(e) => setFormData({...formData, nama_lengkap: e.target.value})}
                placeholder="Masukkan nama lengkap siswa"
                className="w-full rounded-2xl bg-black/20 border border-white/10 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">NIS / NISN</label>
              <input 
                type="text" 
                required
                value={formData.nis}
                onChange={(e) => setFormData({...formData, nis: e.target.value})}
                placeholder="Nomor Induk Siswa"
                className="w-full rounded-2xl bg-black/20 border border-white/10 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Jenis Kelamin</label>
              <select 
                value={formData.jenis_kelamin}
                onChange={(e) => setFormData({...formData, jenis_kelamin: e.target.value})}
                className="w-full rounded-2xl bg-[#1c1c1e] border border-white/10 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Status Siswa</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full rounded-2xl bg-[#1c1c1e] border border-white/10 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
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

          <div className="grid grid-cols-1 md:grid-cols-1 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Angkatan / Tahun Masuk</label>
              <input 
                type="number" 
                required
                value={formData.angkatan}
                onChange={(e) => setFormData({...formData, angkatan: e.target.value})}
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
                value={formData.nama_ortu}
                onChange={(e) => setFormData({...formData, nama_ortu: e.target.value})}
                placeholder="Nama ayah atau ibu"
                className="w-full rounded-2xl bg-black/20 border border-white/10 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">No. WhatsApp Wali</label>
              <input 
                type="tel" 
                value={formData.no_hp_ortu}
                onChange={(e) => setFormData({...formData, no_hp_ortu: e.target.value})}
                placeholder="Contoh: 08123456789"
                className="w-full rounded-2xl bg-black/20 border border-white/10 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Alamat Lengkap</label>
            <textarea 
              rows={3}
              value={formData.alamat}
              onChange={(e) => setFormData({...formData, alamat: e.target.value})}
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
