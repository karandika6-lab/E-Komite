'use client';

import React from 'react';
import { ArrowLeft, Heart, Shield, Code, Smartphone, Database } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';

export default function TentangAplikasiPage() {
  return (
    <div className="max-w-2xl mx-auto pb-24 md:pb-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 md:mb-8">
        <Link href="/dashboard/profil" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Tentang Aplikasi</h1>
          <p className="text-[13px] md:text-sm text-gray-400">Informasi sistem E-Komite</p>
        </div>
      </div>

      {/* Main Branding Card */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center flex flex-col items-center justify-center min-h-[200px]">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-4 mx-auto border border-white/20 shadow-xl">
             <span className="text-3xl font-black text-white tracking-tighter">EK</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mb-1">E-Komite Pro</h2>
          <p className="text-blue-100 text-sm font-medium">Versi 2.1.0 (Stable Release)</p>
        </div>
      </div>

      {/* Info Sections */}
      <div className="bg-[#1c1c1e] md:bg-[#242426] rounded-3xl p-6 border border-white/5 shadow-lg space-y-6">
        <div>
          <h3 className="text-[15px] font-bold text-white mb-2">Sistem Perbendaharaan Digital</h3>
          <p className="text-[13px] text-gray-400 leading-relaxed">
            E-Komite adalah aplikasi berbasis web mutakhir yang dirancang khusus untuk memodernisasi tata kelola keuangan dan perbendaharaan di lingkungan Madrasah/Sekolah. Sistem ini menggantikan pencatatan manual dengan teknologi sinkronisasi *real-time* yang aman dan terstruktur.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Shield size={20} />
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-white mb-0.5">Keamanan Data</h4>
              <p className="text-[11px] text-gray-400">Enkripsi Supabase tingkat industri.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center shrink-0">
              <Database size={20} />
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-white mb-0.5">Cloud Database</h4>
              <p className="text-[11px] text-gray-400">Penyimpanan awan terpusat & anti hilang.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <Smartphone size={20} />
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-white mb-0.5">Mobile Optimized</h4>
              <p className="text-[11px] text-gray-400">Desain antarmuka setara aplikasi Fintech.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0">
              <Code size={20} />
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-white mb-0.5">Modern Tech Stack</h4>
              <p className="text-[11px] text-gray-400">Next.js 14, TailwindCSS, & React.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center pt-8 pb-4">
        <p className="text-[12px] text-gray-500 flex items-center justify-center gap-1">
          Dibuat dengan <Heart size={12} className="text-red-500 fill-red-500" /> untuk Pendidikan Indonesia.
        </p>
        <p className="text-[10px] text-gray-600 mt-1">© 2026 Hak Cipta Dilindungi Undang-Undang.</p>
      </div>
    </div>
  );
}
