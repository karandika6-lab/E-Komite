'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { User, Mail, Phone, MapPin, ArrowLeft, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

export default function EditProfilPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Profil berhasil diperbarui!');
      router.push('/dashboard/profil');
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/profil" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Edit Profil</h1>
          <p className="text-[13px] md:text-sm text-gray-400">Perbarui informasi data diri Anda</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Avatar Section */}
        <div className="bg-[#1c1c1e] md:bg-[#242426] rounded-3xl p-6 border border-white/5 shadow-lg flex flex-col items-center justify-center">
          <div className="relative mb-4 group cursor-pointer">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-1 shadow-lg">
              <div className="w-full h-full rounded-full bg-[#1c1c1e] flex items-center justify-center relative overflow-hidden">
                <User size={40} className="text-white group-hover:opacity-0 transition-opacity" />
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Camera size={24} className="text-white" />
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-2 border-[#1c1c1e] text-white shadow-md">
              <Camera size={14} />
            </div>
          </div>
          <p className="text-sm font-medium text-white">Ubah Foto Profil</p>
          <p className="text-xs text-gray-500 mt-1">Format JPG, PNG max 2MB</p>
        </div>

        {/* Form Fields Section */}
        <div className="bg-[#1c1c1e] md:bg-[#242426] rounded-3xl p-5 border border-white/5 shadow-lg space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Nama Lengkap</label>
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                defaultValue="Admin E-Komite"
                required
                className="w-full rounded-2xl bg-black/20 border border-white/10 py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="email"
                defaultValue="admin@madrasah.sch.id"
                required
                className="w-full rounded-2xl bg-black/20 border border-white/10 py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Nomor Telepon</label>
            <div className="relative">
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="tel"
                placeholder="Contoh: 08123456789"
                className="w-full rounded-2xl bg-black/20 border border-white/10 py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Floating Action Button / Fixed Bottom Bar */}
        <div className="fixed bottom-0 left-0 w-full p-4 bg-[#111]/80 backdrop-blur-xl border-t border-white/5 z-40 md:relative md:bg-transparent md:border-none md:p-0 md:mt-8 md:block">
          <div className="max-w-2xl mx-auto flex items-center gap-4">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full py-4 md:py-3.5 px-8 rounded-2xl font-bold text-[15px] transition-all flex justify-center items-center gap-2 ${
                !isSubmitting
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30' 
                  : 'bg-white/5 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Simpan Perubahan'
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
