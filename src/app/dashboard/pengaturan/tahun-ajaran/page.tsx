'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Plus, Edit2, Trash2, X, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function TahunAjaranPage() {
  const supabase = createClient();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Form states
  const [nama, setNama] = useState('');
  const [isActive, setIsActive] = useState('false');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: rawData, error } = await supabase
        .from('tahun_ajaran')
        .select('*')
        .order('nama', { ascending: false });

      if (error) throw error;
      setData(rawData || []);
    } catch (error: any) {
      toast.error('Gagal mengambil data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (item: any = null) => {
    setEditingItem(item);
    if (item) {
      setNama(item.nama);
      setIsActive(item.is_active ? 'true' : 'false');
    } else {
      setNama('');
      setIsActive('false');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setNama('');
    setIsActive('false');
  };

  const handleSave = async () => {
    if (!nama) {
      toast.error('Tahun ajaran wajib diisi');
      return;
    }
    
    setIsSaving(true);
    try {
      const payload = {
        nama,
        is_active: isActive === 'true',
        // Dummy dates for now since UI doesn't ask for it, but DB requires it
        tanggal_mulai: `${nama.split('/')[0]}-07-01`,
        tanggal_selesai: `${nama.split('/')[1] || nama.split('/')[0]}-06-30`
      };

      // If this one is set to active, we might want to deactivate others
      if (payload.is_active) {
        await supabase.from('tahun_ajaran').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000'); // update all
      }

      if (editingItem) {
        const { error } = await supabase
          .from('tahun_ajaran')
          .update(payload)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast.success('Data berhasil diperbarui');
      } else {
        const { error } = await supabase
          .from('tahun_ajaran')
          .insert([payload]);
        if (error) throw error;
        toast.success('Data berhasil ditambahkan');
      }
      
      handleCloseModal();
      fetchData();
    } catch (error: any) {
      toast.error('Gagal menyimpan data: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus tahun ajaran ini?')) return;
    
    try {
      const { error } = await supabase
        .from('tahun_ajaran')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Data berhasil dihapus');
      fetchData();
    } catch (error: any) {
      toast.error('Gagal menghapus data: ' + error.message);
    }
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
      <div className="bg-[#1c1c1e] md:bg-[#242426] rounded-3xl border border-white/5 overflow-hidden shadow-lg min-h-[200px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 size={32} className="text-blue-500 animate-spin mb-4" />
            <p className="text-sm text-gray-400">Memuat data...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
             <p className="text-gray-400">Belum ada data tahun ajaran.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {data.map((item) => (
              <div key={item.id} className="p-4 md:p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    item.is_active ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-gray-500'
                  }`}>
                    <Calendar size={22} />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-white">{item.nama}</h3>
                    {item.is_active ? (
                       <span className="inline-block mt-1 text-[11px] font-bold bg-green-500/20 text-green-400 px-2.5 py-0.5 rounded-md border border-green-500/20">
                         Aktif Sekarang
                       </span>
                    ) : (
                       <span className="text-[12px] text-gray-500">Tidak Aktif</span>
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
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-40">
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
                   value={nama}
                   onChange={(e) => setNama(e.target.value)}
                   placeholder="Contoh: 2026/2027"
                   className="w-full rounded-2xl bg-black/20 border border-white/10 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Status</label>
                 <select 
                   value={isActive}
                   onChange={(e) => setIsActive(e.target.value)}
                   className="w-full rounded-2xl bg-[#1c1c1e] border border-white/10 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                 >
                   <option value="true">Aktif Sekarang</option>
                   <option value="false">Tidak Aktif</option>
                 </select>
               </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/5 flex gap-3 bg-white/[0.02]">
              <button 
                onClick={handleCloseModal}
                disabled={isSaving}
                className="flex-1 py-3 rounded-xl font-bold text-[14px] text-gray-300 hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-3 rounded-xl font-bold text-[14px] text-white bg-blue-600 hover:bg-blue-500 transition-colors flex justify-center items-center gap-2 shadow-lg shadow-blue-600/30 disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
