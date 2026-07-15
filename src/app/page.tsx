'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { motion } from 'framer-motion';
import { Download, ArrowRight, Smartphone, ShieldCheck, Zap, School, Wallet, Users, BarChart, RefreshCcw } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      router.replace('/login');
    } else {
      setIsChecking(false);
    }
  }, [router]);

  if (isChecking) return null; // Avoid flashing the landing page on Android

  const features = [
    {
      icon: Wallet,
      title: "Manajemen Tagihan & Pembayaran",
      description: "Buat tagihan massal dalam hitungan detik. Catat pembayaran uang komite, seragam, dan buku secara real-time.",
      color: "text-blue-400",
      bg: "bg-blue-500/10"
    },
    {
      icon: Users,
      title: "Data Siswa Tersinkron",
      description: "Kelola ribuan data siswa aktif, lulusan, hingga siswa mutasi dengan mudah beserta rekam jejak pembayaran mereka.",
      color: "text-purple-400",
      bg: "bg-purple-500/10"
    },
    {
      icon: BarChart,
      title: "Laporan Keuangan Otomatis",
      description: "Pantau arus kas harian, bulanan, hingga tahunan. Saldo bersih terhitung otomatis tanpa perlu buka Excel.",
      color: "text-green-400",
      bg: "bg-green-500/10"
    },
    {
      icon: RefreshCcw,
      title: "Integrasi Google Sheets",
      description: "Satu klik untuk mem-backup atau menarik data dari Google Sheets. Data aman dan bisa diakses pimpinan yayasan kapan saja.",
      color: "text-orange-400",
      bg: "bg-orange-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white overflow-x-hidden relative scroll-smooth">
      {/* Background Ornaments */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[150px] pointer-events-none" />
      
      {/* Navbar */}
      <nav className="w-full px-6 py-5 md:px-12 flex items-center justify-between sticky top-0 bg-[#0a0a0b]/80 backdrop-blur-xl z-50 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-[1px]">
            <div className="w-full h-full bg-[#1c1c1e] rounded-xl flex items-center justify-center">
              <School size={20} className="text-white" />
            </div>
          </div>
          <span className="font-bold text-lg tracking-wide hidden sm:block">E-Komite</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#fitur" className="text-sm font-medium text-gray-400 hover:text-white transition-colors hidden md:block mr-4">Fitur Utama</a>
          <Link href="/login" className="px-5 py-2.5 rounded-full text-sm font-bold bg-white/10 hover:bg-white/20 transition border border-white/10 flex items-center gap-2">
            Login Admin <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 pt-4 md:pt-12 pb-12 relative z-10 flex flex-col md:flex-row items-center gap-8 lg:gap-12 min-h-[calc(100vh-80px)]">
        
        {/* Left Content */}
        <div className="flex-1 text-center md:text-left mt-4 md:mt-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] md:text-sm font-bold uppercase tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Versi Mobile Telah Hadir
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight mb-4 bg-gradient-to-br from-white via-white to-gray-400 text-transparent bg-clip-text">
              Kelola Keuangan <br className="hidden lg:block" />
              Sekolah dengan <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Super Cepat.</span>
            </h1>
            
            <p className="text-gray-400 text-base md:text-lg mb-8 max-w-xl mx-auto md:mx-0 leading-relaxed">
              E-Komite adalah platform pintar bergaya fintech untuk digitalisasi perbendaharaan Madrasah. Pantau uang masuk, keluar, dan tagihan siswa langsung dari HP Anda.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start" id="download">
              <a href="/E-Komite-Release-Signed.apk" download className="w-full sm:w-auto">
                <button className="w-full px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold flex items-center justify-center gap-3 shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95">
                  <Download size={20} />
                  Unduh APK Android
                </button>
              </a>
              <Link href="/login" className="w-full sm:w-auto">
                <button className="w-full px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold flex items-center justify-center gap-2 border border-white/10 transition-all">
                  Buka Versi Web
                </button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Right Content (Mockup / Visual) */}
        <motion.div 
          className="flex-1 w-full max-w-xs sm:max-w-sm md:max-w-md relative flex justify-center"
          initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Abstract Phone Mockup */}
          <div className="relative w-[240px] h-[500px] bg-[#111] rounded-[40px] border-[6px] border-[#222] shadow-2xl shadow-blue-900/20 flex flex-col overflow-hidden">
             {/* Notch */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#222] rounded-b-xl z-20" />
             
             {/* Mockup Screen UI */}
             <div className="flex-1 bg-gradient-to-b from-[#0066b2] to-[#111] p-5 pt-12 relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <div className="w-8 h-8 rounded-full bg-white/20" />
                  <div className="w-8 h-8 rounded-full bg-white/20" />
                </div>
                
                <div className="mb-6">
                  <div className="w-24 h-3 bg-white/30 rounded-full mb-3" />
                  <div className="w-48 h-8 bg-white/90 rounded-lg mb-2" />
                </div>
                
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[1,2,3,4,5,6,7,8].map((i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-white/10 rounded-2xl" />
                      <div className="w-8 h-2 bg-white/10 rounded-full" />
                    </div>
                  ))}
                </div>
                
                <div className="w-full h-24 bg-white/5 rounded-3xl border border-white/10 mb-3" />
                <div className="w-full h-24 bg-white/5 rounded-3xl border border-white/10" />
             </div>
          </div>
          
          {/* Floating Badges */}
          <motion.div 
            animate={{ y: [0, -10, 0] }} 
            transition={{ repeat: Infinity, duration: 4 }}
            className="absolute top-16 -left-8 sm:-left-12 md:-left-16 bg-[#1c1c1e] p-3 md:p-4 rounded-2xl border border-white/10 shadow-xl flex items-center gap-3 backdrop-blur-md"
          >
            <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-white text-sm font-bold">100% Aman</p>
              <p className="text-gray-400 text-xs hidden sm:block">Data tersinkronisasi</p>
            </div>
          </motion.div>
          
          <motion.div 
            animate={{ y: [0, 10, 0] }} 
            transition={{ repeat: Infinity, duration: 5 }}
            className="absolute bottom-24 -right-4 sm:-right-8 md:-right-10 bg-[#1c1c1e] p-3 md:p-4 rounded-2xl border border-white/10 shadow-xl flex items-center gap-3 backdrop-blur-md"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Zap size={20} />
            </div>
            <div>
              <p className="text-white text-sm font-bold">Super Cepat</p>
              <p className="text-gray-400 text-xs hidden sm:block">Desain ala Fintech</p>
            </div>
          </motion.div>
          
        </motion.div>
      </main>

      {/* Features Section */}
      <section id="fitur" className="py-24 bg-[#111] relative border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Fitur Utama E-Komite</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Sistem perbendaharaan yang didesain khusus untuk menyelesaikan masalah administrasi sekolah yang rumit menjadi sangat sederhana.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-[#1c1c1e] p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6`}>
                    <Icon size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-white/5 bg-[#0a0a0b] text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-[1px]">
            <div className="w-full h-full bg-[#1c1c1e] rounded-lg flex items-center justify-center">
              <School size={16} className="text-white" />
            </div>
          </div>
          <span className="font-bold text-white">E-Komite</span>
        </div>
        <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Madrasah Aliyah. All rights reserved.</p>
        <p className="text-gray-600 text-xs mt-2">Dibuat khusus untuk tata kelola administrasi yang lebih baik.</p>
      </footer>
      
    </div>
  );
}
