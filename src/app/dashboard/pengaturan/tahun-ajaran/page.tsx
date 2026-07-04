'use client';

import React, { useState } from 'react';
import { ArrowLeft, Calendar, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import Link from 'next/link';

export default function TahunAjaranPage() {
  const [data, setData] = useState([
    { id: '1', tahun: '2025/2026', status: 'Aktif' },
    { id: '2', tahun: '2024/2025', status: 'Tidak Aktif' },
    { id: '3', tahun: '2023/2024', status: 'Tidak Aktif' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const handleOpenModal = (item: any = null) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="max-w-3xl mx-auto pb-24 relative min-h-[80vh]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 md:mb-8">
        <Link href="/dashboard/profil" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Tahun Ajaran</h1>
          <p className="text-[13px] md:text-sm text-gray-400">Kelola daftar tahun ajaran sekolah</p>
        </div>
      </div>

      {/* List Container */}
      <div className="bg-[#1c1c1e] md:bg-[#242426] rounded-3xl border border-white/5 overflow-hidden shadow-lg">
        <div className="divide-y divide-white/5">
          {data.map((item) => (
            <div key={item.id} className="p-4 md:p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  item.status === 'Aktif' ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-gray-500'
                }`}>
                  <Calendar size={22} />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-white">{item.tahun}</h3>
                  {item.status === 'Aktif' ? (
                     <span className="inline-block mt-1 text-[11px] font-bold bg-green-500/20 text-green-400 px-2.5 py-0.5 rounded-md border border-green-500/20">
                       Aktif Sekarang
                     </span>
                  ) : (
                     <span className="text-[12px] text-gray-500">{item.status}</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleOpenModal(item)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button 
          onClick={() => handleOpenModal()}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center text-white shadow-[0_4px_20px_rgba(37,99,235,0.4)] hover:scale-105 transition-all"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md bg-[#1c1c1e] rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
               <h2 className="text-[16px] font-bold text-white">
                 {editingItem ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran'}
               </h2>
               <button 
                 onClick={handleCloseModal}
                 className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
               >
                 <X size={16} />
               </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-5">
               <div className="space-y-2">
                 <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Tahun Ajaran</label>
                 <input 
                   type="text"
                   defaultValue={editingItem?.tahun || ''}
                   placeholder="Contoh: 2026/2027"
                   className="w-full rounded-2xl bg-black/20 border border-white/10 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Status</label>
                 <select 
                   defaultValue={editingItem?.status || 'Tidak Aktif'}
                   className="w-full rounded-2xl bg-[#1c1c1e] border border-white/10 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                 >
                   <option value="Aktif">Aktif Sekarang</option>
                   <option value="Tidak Aktif">Tidak Aktif</option>
                 </select>
               </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/5 flex gap-3 bg-white/[0.02]">
              <button 
                onClick={handleCloseModal}
                className="flex-1 py-3 rounded-xl font-bold text-[14px] text-gray-300 hover:bg-white/5 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleCloseModal}
                className="flex-1 py-3 rounded-xl font-bold text-[14px] text-white bg-blue-600 hover:bg-blue-500 transition-colors flex justify-center items-center gap-2 shadow-lg shadow-blue-600/30"
              >
                <Save size={16} />
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
