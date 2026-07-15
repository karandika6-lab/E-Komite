'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, User, GraduationCap } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SiswaItem {
  id: string;
  nis: string;
  nama_lengkap: string;
  angkatan: number;
}

interface SiswaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (siswa: SiswaItem) => void;
}

export function SiswaPickerModal({ isOpen, onClose, onSelect }: SiswaPickerModalProps) {
  const [siswaList, setSiswaList] = useState<SiswaItem[]>([]);
  const [filtered, setFiltered] = useState<SiswaItem[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (isOpen) {
      fetchSiswa();
      setSearch('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(siswaList);
    } else {
      const q = search.toLowerCase();
      setFiltered(
        siswaList.filter(s =>
          s.nama_lengkap.toLowerCase().includes(q) ||
          s.nis.toLowerCase().includes(q) ||
          s.angkatan.toString().includes(q)
        )
      );
    }
  }, [search, siswaList]);

  const fetchSiswa = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('siswa')
        .select('id, nis, nama_lengkap, angkatan')
        .eq('status', 'Aktif')
        .order('nama_lengkap', { ascending: true });

      if (error) throw error;
      setSiswaList(data || []);
    } catch (err) {
      console.error('Failed to fetch siswa:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (siswa: SiswaItem) => {
    onSelect(siswa);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-bg-card shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neon-blue/10 flex items-center justify-center border border-neon-blue/20">
              <GraduationCap size={20} className="text-neon-blue" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Pilih Siswa</h3>
              <p className="text-xs text-text-tertiary">Cari dan pilih siswa untuk transaksi ini</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-white/5">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, NIS, atau angkatan..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-elevated border border-white/10 text-sm text-white placeholder:text-text-tertiary focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all"
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-text-tertiary text-sm">
              Memuat data siswa...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center">
              <User size={32} className="mx-auto text-text-tertiary mb-2 opacity-50" />
              <p className="text-sm text-text-tertiary">
                {search ? 'Tidak ada siswa yang cocok' : 'Belum ada data siswa'}
              </p>
            </div>
          ) : (
            <div className="p-2">
              {filtered.map((siswa) => (
                <button
                  key={siswa.id}
                  onClick={() => handleSelect(siswa)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-neon-blue/5 transition-all group"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center text-sm font-bold text-neon-blue border border-neon-blue/10 group-hover:scale-110 transition-transform">
                    {siswa.nama_lengkap.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm truncate group-hover:text-neon-blue transition-colors">
                      {siswa.nama_lengkap}
                    </p>
                    <p className="text-[11px] text-text-tertiary">
                      NIS: {siswa.nis} • Angkatan {siswa.angkatan}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-white/5 bg-white/[0.02]">
          <p className="text-[11px] text-text-tertiary text-center">
            {filtered.length} siswa ditemukan {search && `untuk "${search}"`}
          </p>
        </div>
      </div>
    </div>
  );
}
