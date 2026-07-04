import React from 'react';
import { ArrowLeft, User, Phone, MapPin, Receipt, CreditCard, Clock, CheckCircle2, History } from 'lucide-react';
import Link from 'next/link';

export function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];
}

export default function DetailSiswaPage({ params }: { params: { id: string } }) {
  // Dummy student data
  const student = {
    id: params.id,
    nis: '2425001',
    nama: 'Ahmad Faisal',
    kelas: 'X-1',
    angkatan: 2024,
    status: 'Aktif',
    ortu: 'Bpk. Supriyadi',
    phone: '081234567890',
    alamat: 'Jl. Merdeka No. 123, Jakarta Selatan',
  };

  const tagihanList = [
    { id: 'T1', nama: 'Uang Pangkal / PNB', nominal: 3500000, terbayar: 2000000, sisa: 1500000, status: 'Cicilan', tanggal: '10 Jul 2024' },
    { id: 'T2', nama: 'Uang Komite - Juli', nominal: 250000, terbayar: 250000, sisa: 0, status: 'Lunas', tanggal: '15 Jul 2024' },
    { id: 'T3', nama: 'Uang Komite - Agustus', nominal: 250000, terbayar: 0, sisa: 250000, status: 'Belum Lunas', tanggal: '15 Agu 2024' },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-24 md:pb-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2 md:mb-6">
        <Link href="/dashboard/siswa" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Profil Siswa</h1>
          <p className="text-[13px] md:text-sm text-gray-400">Rincian data dan rekap tagihan</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Kolom Kiri: Profil Card */}
        <div className="space-y-6">
          <div className="bg-[#1c1c1e] md:bg-[#242426] rounded-3xl p-6 border border-white/5 shadow-lg flex flex-col items-center text-center relative overflow-hidden">
             <div className="absolute top-0 w-full h-24 bg-gradient-to-br from-blue-600/40 to-purple-600/40 opacity-50 blur-xl" />
             
             <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1 mb-4 relative z-10 shadow-xl">
               <div className="w-full h-full rounded-full bg-[#1c1c1e] flex items-center justify-center">
                 <User size={40} className="text-blue-400" />
               </div>
             </div>
             
             <h2 className="text-xl font-bold text-white mb-1 relative z-10">{student.nama}</h2>
             <div className="flex items-center gap-2 mb-4 relative z-10">
               <span className="text-sm font-medium text-blue-400">{student.nis}</span>
               <span className="w-1 h-1 rounded-full bg-gray-600" />
               <span className="text-sm font-medium text-gray-400">Kelas {student.kelas}</span>
             </div>

             <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[11px] font-bold uppercase tracking-wider relative z-10">
               <CheckCircle2 size={14} /> {student.status}
             </div>

             <div className="w-full h-[1px] bg-white/5 my-6 relative z-10" />

             <div className="w-full space-y-4 text-left relative z-10">
               <div className="flex items-start gap-3">
                 <User size={16} className="text-gray-500 mt-0.5 shrink-0" />
                 <div>
                   <p className="text-[11px] text-gray-500 uppercase font-semibold">Orang Tua / Wali</p>
                   <p className="text-[13px] text-white font-medium">{student.ortu}</p>
                 </div>
               </div>
               <div className="flex items-start gap-3">
                 <Phone size={16} className="text-gray-500 mt-0.5 shrink-0" />
                 <div>
                   <p className="text-[11px] text-gray-500 uppercase font-semibold">No. WhatsApp</p>
                   <p className="text-[13px] text-white font-medium">{student.phone}</p>
                 </div>
               </div>
               <div className="flex items-start gap-3">
                 <MapPin size={16} className="text-gray-500 mt-0.5 shrink-0" />
                 <div>
                   <p className="text-[11px] text-gray-500 uppercase font-semibold">Alamat</p>
                   <p className="text-[13px] text-white font-medium leading-tight">{student.alamat}</p>
                 </div>
               </div>
             </div>
          </div>
          
          <button className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-colors border border-white/5">
             Edit Profil Siswa
          </button>
        </div>

        {/* Kolom Kanan: Rekap Tagihan */}
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1c1c1e] md:bg-[#242426] rounded-3xl p-5 border border-red-500/20 shadow-lg relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
               <div className="flex items-center gap-3 mb-2">
                 <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center">
                   <Receipt size={16} />
                 </div>
                 <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Tunggakan</p>
               </div>
               <p className="text-2xl md:text-3xl font-black text-white tracking-tight">Rp 1.750.000</p>
            </div>
            
            <div className="bg-[#1c1c1e] md:bg-[#242426] rounded-3xl p-5 border border-green-500/20 shadow-lg relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
               <div className="flex items-center gap-3 mb-2">
                 <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center">
                   <CreditCard size={16} />
                 </div>
                 <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Telah Dibayar</p>
               </div>
               <p className="text-2xl md:text-3xl font-black text-white tracking-tight">Rp 2.250.000</p>
            </div>
          </div>

          <div className="bg-[#1c1c1e] md:bg-[#242426] rounded-3xl p-6 border border-white/5 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[16px] font-bold text-white flex items-center gap-2">
                <History size={18} className="text-blue-400" />
                Rincian Tagihan
              </h3>
              <select className="rounded-full bg-black/20 border border-white/10 px-3 py-1.5 text-xs text-white focus:outline-none">
                <option>Semua Status</option>
                <option>Belum Lunas</option>
                <option>Cicilan</option>
              </select>
            </div>

            <div className="space-y-3">
              {tagihanList.map((tagihan) => (
                <div key={tagihan.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group cursor-pointer">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-[14px] text-white mb-1 group-hover:text-blue-400 transition-colors">{tagihan.nama}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium">
                        <Clock size={12} />
                        Diterbitkan: {tagihan.tanggal}
                      </div>
                    </div>
                    
                    <div className="flex items-end md:items-center justify-between md:justify-end gap-4 w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t border-white/5 md:border-none">
                      <div className="text-left md:text-right">
                        <p className="text-[10px] text-gray-500 font-medium mb-0.5">Sisa Tagihan</p>
                        <p className="text-[14px] font-bold text-white">Rp {tagihan.sisa.toLocaleString('id-ID')}</p>
                      </div>
                      
                      <div className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${
                        tagihan.status === 'Lunas' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        tagihan.status === 'Cicilan' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {tagihan.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-4 py-3 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-bold text-[13px] transition-colors border border-blue-500/20">
               Lihat Semua Riwayat
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
