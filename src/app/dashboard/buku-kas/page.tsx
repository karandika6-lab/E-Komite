'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { KategoriSelector, KategoriItem } from '@/components/ui/KategoriSelector';
import { SiswaPickerModal } from '@/components/ui/SiswaPickerModal';
import { Loader2, Save, Trash2, FileSpreadsheet, User, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

// Fungsi bantu format tanggal ke yyyy-mm-dd (local)
const getTodayDateStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface SelectedSiswa {
  id: string;
  nis: string;
  nama_lengkap: string;
  angkatan: number;
}

export default function BukuKasPage() {
  const [dataKas, setDataKas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // New row state
  const [newRow, setNewRow] = useState({
    tanggal: getTodayDateStr(),
    uraian: '',
    nominal: '',
  });
  const [selectedKategori, setSelectedKategori] = useState<KategoriItem | null>(null);
  const [selectedSiswa, setSelectedSiswa] = useState<SelectedSiswa | null>(null);
  const [showSiswaModal, setShowSiswaModal] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchBukuKas();
  }, []);

  // Auto-show siswa modal when kategori perlu_siswa is selected
  useEffect(() => {
    if (selectedKategori?.perlu_siswa && !selectedSiswa) {
      setShowSiswaModal(true);
    }
  }, [selectedKategori]);

  const fetchBukuKas = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('buku_kas')
        .select(`
          *,
          kategori_buku_kas (id, nama, tipe, perlu_siswa),
          siswa (id, nis, nama_lengkap, angkatan)
        `)
        .order('tanggal', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      let currentSaldo = 0;
      const formatted = data?.map((item: any) => {
        currentSaldo += Number(item.kas_masuk) - Number(item.kas_keluar);
        return {
          ...item,
          saldo: currentSaldo
        };
      }) || [];
      
      setDataKas(formatted);
    } catch (error: any) {
      toast.error('Gagal mengambil data buku kas: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRow = async () => {
    if (!selectedKategori) {
      toast.error('Pilih kategori terlebih dahulu');
      return;
    }
    if (!newRow.uraian) {
      toast.error('Uraian harus diisi');
      return;
    }
    if (!newRow.nominal || Number(newRow.nominal) <= 0) {
      toast.error('Nominal harus lebih dari 0');
      return;
    }
    if (!newRow.tanggal) {
      toast.error('Tanggal harus diisi');
      return;
    }
    if (selectedKategori.perlu_siswa && !selectedSiswa) {
      toast.error('Pilih siswa untuk kategori ini');
      return;
    }

    setIsSaving(true);
    try {
      const nominal = Number(newRow.nominal);
      const isKasMasuk = selectedKategori.tipe === 'MASUK';
      
      const insertData: any = {
        tanggal: newRow.tanggal,
        uraian: newRow.uraian,
        kas_masuk: isKasMasuk ? nominal : 0,
        kas_keluar: isKasMasuk ? 0 : nominal,
        kategori_id: selectedKategori.id,
      };

      if (selectedSiswa) {
        insertData.siswa_id = selectedSiswa.id;
      }

      const { error } = await supabase
        .from('buku_kas')
        .insert([insertData] as any);

      if (error) throw error;
      
      toast.success('Berhasil menambahkan data kas');
      
      // Reset form
      setNewRow({
        tanggal: newRow.tanggal,
        uraian: '',
        nominal: '',
      });
      setSelectedKategori(null);
      setSelectedSiswa(null);
      
      fetchBukuKas();
    } catch (error: any) {
      toast.error('Gagal menyimpan data: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Yakin ingin menghapus data ini?')) return;
    
    try {
      const { error } = await supabase.from('buku_kas').delete().eq('id', id);
      if (error) throw error;
      toast.success('Data berhasil dihapus');
      fetchBukuKas();
    } catch (error: any) {
      toast.error('Gagal menghapus data: ' + error.message);
    }
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  };

  const handleKategoriChange = (kat: KategoriItem | null) => {
    setSelectedKategori(kat);
    // Clear siswa if new category doesn't need it
    if (!kat?.perlu_siswa) {
      setSelectedSiswa(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="text-neon-blue" /> Buku Kas Umum
          </h1>
          <p className="text-sm text-text-secondary mt-1">Kelola pemasukan dan pengeluaran layaknya Excel.</p>
        </div>
      </div>

      {/* ===== FORM INPUT TRANSAKSI (DI ATAS TABEL) ===== */}
      <div className="rounded-xl border border-neon-blue/30 bg-gradient-to-r from-neon-blue/5 to-transparent p-5">
        <h2 className="text-sm font-bold text-neon-blue uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-neon-blue/20 flex items-center justify-center text-base">+</span>
          Tambah Transaksi Baru
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Kategori */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-text-secondary mb-1.5 block font-medium">
              Kategori <span className="text-neon-pink">*</span>
            </label>
            <KategoriSelector
              value={selectedKategori}
              onChange={handleKategoriChange}
            />
          </div>

          {/* Tanggal */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-text-secondary mb-1.5 block font-medium">
              Tanggal <span className="text-neon-pink">*</span>
            </label>
            <input 
              type="date" 
              value={newRow.tanggal}
              onChange={(e) => setNewRow({...newRow, tanggal: e.target.value})}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue text-white transition-all"
            />
          </div>

          {/* Uraian */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-text-secondary mb-1.5 block font-medium">
              Uraian <span className="text-neon-pink">*</span>
            </label>
            <input 
              type="text" 
              value={newRow.uraian}
              onChange={(e) => setNewRow({...newRow, uraian: e.target.value})}
              placeholder="Uraian transaksi..."
              className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue text-white transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleAddRow()}
            />
          </div>

          {/* Nominal */}
          <div>
            <label className="text-[11px] uppercase tracking-wider text-text-secondary mb-1.5 block font-medium">
              Nominal (Rp) <span className="text-neon-pink">*</span>
            </label>
            <input 
              type="number" 
              value={newRow.nominal}
              onChange={(e) => setNewRow({...newRow, nominal: e.target.value})}
              placeholder="0"
              className={`w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-right focus:outline-none transition-all font-mono ${
                selectedKategori?.tipe === 'MASUK'
                  ? 'focus:border-green-400 focus:ring-1 focus:ring-green-400 text-green-400'
                  : selectedKategori?.tipe === 'KELUAR'
                  ? 'focus:border-red-400 focus:ring-1 focus:ring-red-400 text-red-400'
                  : 'focus:border-neon-blue focus:ring-1 focus:ring-neon-blue text-white'
              }`}
              onKeyDown={(e) => e.key === 'Enter' && handleAddRow()}
            />
          </div>
        </div>

        {/* Siswa Picker (muncul jika kategori perlu siswa) */}
        {selectedKategori?.perlu_siswa && (
          <div className="mt-4 p-3 rounded-lg border border-neon-blue/20 bg-neon-blue/5">
            <label className="text-[11px] uppercase tracking-wider text-neon-blue mb-2 block font-medium">
              Pilih Siswa <span className="text-neon-pink">*</span>
            </label>
            {selectedSiswa ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-card border border-neon-blue/20">
                <div className="w-8 h-8 rounded-full bg-neon-blue/10 flex items-center justify-center text-sm font-bold text-neon-blue border border-neon-blue/10">
                  {selectedSiswa.nama_lengkap.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{selectedSiswa.nama_lengkap}</p>
                  <p className="text-[11px] text-text-tertiary">NIS: {selectedSiswa.nis} • Angkatan {selectedSiswa.angkatan}</p>
                </div>
                <button
                  onClick={() => setSelectedSiswa(null)}
                  className="text-text-tertiary hover:text-neon-pink transition-colors p-1 rounded hover:bg-white/10"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSiswaModal(true)}
                className="w-full px-4 py-2.5 rounded-lg bg-bg-card border border-dashed border-neon-blue/30 text-neon-blue text-sm hover:bg-neon-blue/10 hover:border-neon-blue/50 transition-all flex items-center justify-center gap-2"
              >
                <User size={16} />
                Klik untuk memilih siswa...
              </button>
            )}
          </div>
        )}

        {/* Tombol Simpan */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-[11px] text-text-tertiary">
            {selectedKategori 
              ? `Tipe: ${selectedKategori.tipe === 'MASUK' ? '💰 Uang Masuk' : '💸 Uang Keluar'} — ${selectedKategori.nama}`
              : 'Pilih kategori untuk memulai'
            }
          </p>
          <Button 
            onClick={handleAddRow}
            disabled={isSaving || !newRow.uraian || !selectedKategori || !newRow.nominal}
            className="px-6 bg-neon-blue text-black hover:bg-neon-blue/90 font-semibold"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
            Simpan Transaksi
          </Button>
        </div>
      </div>

      {/* ===== TABEL DATA ===== */}
      <div className="rounded-xl border border-white/10 bg-bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-white/5 text-text-secondary">
              <tr>
                <th className="px-4 py-4 border-b border-white/10 w-12">NO</th>
                <th className="px-4 py-4 border-b border-white/10 w-48">KATEGORI</th>
                <th className="px-4 py-4 border-b border-white/10 w-32">TGL TRANSAKSI</th>
                <th className="px-4 py-4 border-b border-white/10 min-w-[200px]">URAIAN</th>
                <th className="px-4 py-4 border-b border-white/10 text-right w-40">KAS KELUAR</th>
                <th className="px-4 py-4 border-b border-white/10 text-right w-40">KAS MASUK</th>
                <th className="px-4 py-4 border-b border-white/10 text-right w-40">SALDO</th>
                <th className="px-4 py-4 border-b border-white/10 text-center w-16">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <Loader2 size={32} className="animate-spin text-neon-blue mx-auto mb-3" />
                    <span className="text-text-tertiary">Memuat buku kas...</span>
                  </td>
                </tr>
              ) : dataKas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-text-tertiary">
                    Buku kas masih kosong. Gunakan form di atas untuk menambahkan transaksi.
                  </td>
                </tr>
              ) : (
                dataKas.map((item, index) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="px-4 py-3 text-text-secondary">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <Badge variant={item.kategori_buku_kas?.tipe === 'MASUK' ? 'success' : 'danger'}>
                          {item.kategori_buku_kas?.nama || '-'}
                        </Badge>
                        {item.siswa && (
                          <span className="text-[11px] text-neon-blue flex items-center gap-1">
                            <User size={10} />
                            {item.siswa.nama_lengkap} (Angkatan {item.siswa.angkatan})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{formatDate(item.tanggal)}</td>
                    <td className="px-4 py-3 text-white">{item.uraian}</td>
                    <td className="px-4 py-3 text-right text-red-400">
                      {item.kas_keluar > 0 ? formatRupiah(item.kas_keluar) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-green-400">
                      {item.kas_masuk > 0 ? formatRupiah(item.kas_masuk) : '-'}
                    </td>
                    <td className={`px-4 py-3 text-right font-bold ${item.saldo >= 0 ? 'text-neon-blue' : 'text-neon-pink'}`}>
                      {formatRupiah(item.saldo)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-300 p-1.5 rounded hover:bg-white/10"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Siswa Picker Modal */}
      <SiswaPickerModal
        isOpen={showSiswaModal}
        onClose={() => setShowSiswaModal(false)}
        onSelect={(siswa) => setSelectedSiswa(siswa)}
      />
    </div>
  );
}

