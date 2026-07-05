'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Plus, Edit2, Trash2, X, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function JenisPembayaranPage() {
  const supabase = createClient();
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form state
  const [nama, setNama] = useState('');
  const [nominal, setNominal] = useState('');
  const [tipe, setTipe] = useState('BULANAN');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: rawData, error } = await supabase
        .from('jenis_pembayaran')
        .select('*')
        .order('urutan', { ascending: true })
        .order('created_at', { ascending: true });

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
      setNominal(item.nominal_default.toString());
      setTipe(item.tipe || 'BULANAN');
    } else {
      setNama('');
      setNominal('');
      setTipe('BULANAN');
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setNama('');
    setNominal('');
    setTipe('BULANAN');
  };

  const handleSave = async () => {
    if (!nama || !nominal) {
      toast.error('Nama dan nominal wajib diisi');
      return;
    }
    
    setIsSaving(true);
    try {
      // Basic slug generator for kode
      const generateKode = (text: string) => text.toUpperCase().replace(/[^A-Z0-9]/g, '_').substring(0, 20);
      
      const payload = {
        nama,
        nominal_default: parseFloat(nominal),
        tipe,
        is_active: true
      };

      if (editingItem) {
        const { error } = await supabase
          .from('jenis_pembayaran')
          .update(payload)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast.success('Data berhasil diperbarui');
      } else {
        const { error } = await supabase
          .from('jenis_pembayaran')
          .insert([{ ...payload, kode: generateKode(nama) + '_' + Math.floor(Math.random()*1000) }]);
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
    if (!confirm('Yakin ingin menghapus jenis pembayaran ini? Data tagihan terkait mungkin akan terpengaruh.')) return;
    
    try {
      const { error } = await supabase
        .from('jenis_pembayaran')
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
          <h1 className="text-xl md:text-2xl font-bold text-white">Jenis Pembayaran</h1>
          <p className="text-[13px] md:text-sm text-gray-400">Daftar komponen tagihan untuk siswa</p>
        </div>
      </div>

      {/* List Container */}
      <div className="bg-[#1c1c1e] md:bg-[#242426] rounded-3xl border border-white/5 overflow-hidden shadow-lg min-h-[200px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 size={32} className="text-purple-500 animate-spin mb-4" />
            <p className="text-sm text-gray-400">Memuat data...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
             <p className="text-gray-400">Belum ada data jenis pembayaran.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {data.map((item) => (
              <div key={item.id} className="p-4 md:p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <CreditCard size={22} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-white">{item.nama}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[12px] font-medium text-gray-400">Rp {item.nominal_default?.toLocaleString('id-ID')}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-600" />
                      <span className="text-[11px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">{item.tipe}</span>
                    </div>
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
          className="w-14 h-14 bg-purple-600 hover:bg-purple-500 rounded-full flex items-center justify-center text-white shadow-[0_4px_20px_rgba(147,51,234,0.4)] hover:scale-105 transition-all"
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
                 {editingItem ? 'Edit Pembayaran' : 'Tambah Jenis Pembayaran'}
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
                 <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Nama Tagihan</label>
                 <input 
                   type="text"
                   value={nama}
                   onChange={(e) => setNama(e.target.value)}
                   placeholder="Contoh: Uang Komite"
                   className="w-full rounded-2xl bg-black/20 border border-white/10 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                 />
               </div>
               
               <div className="space-y-2">
                 <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Nominal Default (Rp)</label>
                 <input 
                   type="number"
                   value={nominal}
                   onChange={(e) => setNominal(e.target.value)}
                   placeholder="Contoh: 250000"
                   className="w-full rounded-2xl bg-black/20 border border-white/10 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                 />
               </div>

               <div className="space-y-2">
                 <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Periode Pembayaran</label>
                 <select 
                   value={tipe}
                   onChange={(e) => setTipe(e.target.value)}
                   className="w-full rounded-2xl bg-[#1c1c1e] border border-white/10 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                 >
                   <option value="BULANAN">Bulanan (Tiap Bulan)</option>
                   <option value="SEMESTER">Semester (Tiap 6 Bulan)</option>
                   <option value="TAHUNAN">Tahunan (Tiap Tahun Ajaran)</option>
                   <option value="SEKALI">Sekali Bayar (Selama Sekolah)</option>
                 </select>
               </div>
            </div>

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
                className="flex-1 py-3 rounded-xl font-bold text-[14px] text-white bg-purple-600 hover:bg-purple-500 transition-colors flex justify-center items-center gap-2 shadow-lg shadow-purple-600/30 disabled:opacity-50"
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
