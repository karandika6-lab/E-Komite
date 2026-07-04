'use client';

import React, { useState } from 'react';
import { ArrowLeft, FolderOpen, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import Link from 'next/link';

export default function KategoriPengeluaranPage() {
  const [data, setData] = useState([
    { id: '1', nama: 'Operasional' },
    { id: '2', nama: 'Honor Pegawai / Guru' },
    { id: '3', nama: 'Alat Tulis Kantor (ATK)' },
    { id: '4', nama: 'Kegiatan Kesiswaan' },
    { id: '5', nama: 'Pemeliharaan Gedung' },
    { id: '6', nama: 'Lain-lain' },
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
          <h1 className="text-xl md:text-2xl font-bold text-white">Kategori Pengeluaran</h1>
          <p className="text-[13px] md:text-sm text-gray-400">Kelola daftar pos pengeluaran dana sekolah</p>
        </div>
      </div>

      {/* List Container */}
      <div className="bg-[#1c1c1e] md:bg-[#242426] rounded-3xl border border-white/5 overflow-hidden shadow-lg">
        <div className="divide-y divide-white/5">
          {data.map((item) => (
            <div key={item.id} className="p-4 md:p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                  <FolderOpen size={22} />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-white">{item.nama}</h3>
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
          className="w-14 h-14 bg-orange-600 hover:bg-orange-500 rounded-full flex items-center justify-center text-white shadow-[0_4px_20px_rgba(234,88,12,0.4)] hover:scale-105 transition-all"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md bg-[#1c1c1e] rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
               <h2 className="text-[16px] font-bold text-white">
                 {editingItem ? 'Edit Kategori' : 'Tambah Kategori'}
               </h2>
               <button 
                 onClick={handleCloseModal}
                 className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
               >
                 <X size={16} />
               </button>
            </div>
            
            <div className="p-6 space-y-5">
               <div className="space-y-2">
                 <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Nama Kategori</label>
                 <input 
                   type="text"
                   defaultValue={editingItem?.nama || ''}
                   placeholder="Contoh: Operasional Sekolah"
                   className="w-full rounded-2xl bg-black/20 border border-white/10 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                 />
               </div>
            </div>

            <div className="px-6 py-4 border-t border-white/5 flex gap-3 bg-white/[0.02]">
              <button 
                onClick={handleCloseModal}
                className="flex-1 py-3 rounded-xl font-bold text-[14px] text-gray-300 hover:bg-white/5 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleCloseModal}
                className="flex-1 py-3 rounded-xl font-bold text-[14px] text-white bg-orange-600 hover:bg-orange-500 transition-colors flex justify-center items-center gap-2 shadow-lg shadow-orange-600/30"
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
