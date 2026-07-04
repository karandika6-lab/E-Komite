'use client';

import React from 'react';
import { ArrowLeft, Activity, User, Save, Trash2, Search } from 'lucide-react';
import Link from 'next/link';

export default function LogAktivitasPage() {
  const logs = [
    { id: 1, action: 'Membuat tagihan baru (Uang Komite)', user: 'Admin Utama', time: '10:45', icon: Save, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 2, action: 'Login ke sistem', user: 'Admin Utama', time: '08:00', icon: User, color: 'text-green-400', bg: 'bg-green-500/10' },
    { id: 3, action: 'Menghapus data siswa (NIS 24200)', user: 'Kepala TU', time: 'Kemarin, 15:30', icon: Trash2, color: 'text-red-400', bg: 'bg-red-500/10' },
    { id: 4, action: 'Import data siswa (150 baris)', user: 'Admin Utama', time: 'Kemarin, 10:15', icon: Save, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  ];

  return (
    <div className="max-w-3xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 md:mb-8">
        <Link href="/dashboard/profil" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Log Aktivitas</h1>
          <p className="text-[13px] md:text-sm text-gray-400">Jejak rekam operasi yang terjadi di sistem</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Cari aktivitas..." 
          className="w-full bg-[#1c1c1e] md:bg-black/20 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Timeline List */}
      <div className="bg-[#1c1c1e] md:bg-transparent rounded-[24px] md:rounded-none border border-white/5 md:border-none overflow-hidden space-y-0 md:space-y-3">
        {logs.map((log, index) => {
          const Icon = log.icon;
          return (
            <div key={log.id} className={`flex items-start gap-4 p-4 md:rounded-2xl md:bg-[#242426] md:border md:border-white/5 hover:bg-white/[0.03] transition-colors ${
              index !== logs.length - 1 ? 'border-b border-white/5 md:border-none' : ''
            }`}>
              {/* Icon */}
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-1 ${log.bg} ${log.color}`}>
                <Icon size={18} />
              </div>
              
              {/* Details */}
              <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-white mb-1 leading-snug">{log.action}</p>
                  <div className="flex items-center gap-3">
                    <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                      <User size={12} /> {log.user}
                    </p>
                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                    <p className="text-[11px] text-gray-500">{log.time}</p>
                  </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
