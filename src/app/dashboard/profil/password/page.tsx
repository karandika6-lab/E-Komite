'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

export default function UbahPasswordPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Password berhasil diperbarui!');
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
          <h1 className="text-xl md:text-2xl font-bold text-white">Ubah Password</h1>
          <p className="text-[13px] md:text-sm text-gray-400">Pastikan akun Anda tetap aman</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Form Fields Section */}
        <div className="bg-[#1c1c1e] md:bg-[#242426] rounded-3xl p-5 border border-white/5 shadow-lg space-y-5">
          
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Password Saat Ini</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type={showCurrent ? "text" : "password"}
                placeholder="Masukkan password saat ini"
                required
                className="w-full rounded-2xl bg-black/20 border border-white/10 py-3.5 pl-11 pr-12 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button 
                type="button" 
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="h-px w-full bg-white/5 my-2" />

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Password Baru</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type={showNew ? "text" : "password"}
                placeholder="Minimal 8 karakter"
                required
                className="w-full rounded-2xl bg-black/20 border border-white/10 py-3.5 pl-11 pr-12 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button 
                type="button" 
                onClick={() => setShowNew(!showNew)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Konfirmasi Password Baru</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type={showConfirm ? "text" : "password"}
                placeholder="Ketik ulang password baru"
                required
                className="w-full rounded-2xl bg-black/20 border border-white/10 py-3.5 pl-11 pr-12 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button 
                type="button" 
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
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
                  ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-xl shadow-purple-600/30' 
                  : 'bg-white/5 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Perbarui Password'
              )}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
