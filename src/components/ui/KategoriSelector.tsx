'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ArrowUpCircle, ArrowDownCircle, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export interface KategoriItem {
  id: string;
  nama: string;
  tipe: 'MASUK' | 'KELUAR';
  perlu_siswa: boolean;
  urutan: number;
}

interface KategoriSelectorProps {
  value: KategoriItem | null;
  onChange: (kategori: KategoriItem | null) => void;
  compact?: boolean;
}

export function KategoriSelector({ value, onChange, compact = false }: KategoriSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'tipe' | 'kategori'>('tipe');
  const [selectedTipe, setSelectedTipe] = useState<'MASUK' | 'KELUAR' | null>(null);
  const [kategoriList, setKategoriList] = useState<KategoriItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchKategori();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // Reset step when closing
        if (!value) {
          setStep('tipe');
          setSelectedTipe(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value]);

  const fetchKategori = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('kategori_buku_kas')
        .select('*')
        .eq('is_active', true)
        .order('urutan', { ascending: true });

      if (error) throw error;
      setKategoriList(data || []);
    } catch (err) {
      console.error('Failed to fetch kategori:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTipeSelect = (tipe: 'MASUK' | 'KELUAR') => {
    setSelectedTipe(tipe);
    setStep('kategori');
  };

  const handleKategoriSelect = (kategori: KategoriItem) => {
    onChange(kategori);
    setIsOpen(false);
    setStep('tipe');
    setSelectedTipe(null);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setStep('tipe');
    setSelectedTipe(null);
  };

  const handleBack = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStep('tipe');
    setSelectedTipe(null);
  };

  const filteredKategori = kategoriList.filter(k => k.tipe === selectedTipe);

  const displayText = value 
    ? value.nama 
    : 'Pilih Kategori...';

  const badgeColor = value
    ? value.tipe === 'MASUK'
      ? 'bg-neon-green/10 text-neon-green border-neon-green/20'
      : 'bg-neon-pink/10 text-neon-pink border-neon-pink/20'
    : '';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && !value) {
            setStep('tipe');
            setSelectedTipe(null);
          }
        }}
        className={`
          w-full flex items-center justify-between gap-2 rounded-lg border transition-all text-left
          ${compact 
            ? 'px-3 py-2 text-sm' 
            : 'px-4 py-2.5 text-sm'
          }
          ${isOpen
            ? 'border-neon-blue ring-1 ring-neon-blue bg-black/40'
            : 'border-white/10 bg-black/40 hover:border-white/20'
          }
          ${value ? 'text-white' : 'text-text-tertiary'}
        `}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {value && (
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${badgeColor}`}>
              {value.tipe === 'MASUK' ? 'Masuk' : 'Keluar'}
            </span>
          )}
          <span className="truncate">{displayText}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {value && (
            <span
              onClick={handleClear}
              className="text-text-tertiary hover:text-white p-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
              title="Hapus pilihan"
              role="button"
            >
              ×
            </span>
          )}
          <ChevronDown size={14} className={`text-text-tertiary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1 w-72 rounded-xl border border-white/10 bg-bg-card shadow-xl shadow-black/40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {isLoading ? (
            <div className="p-4 text-center text-text-tertiary text-sm">Memuat kategori...</div>
          ) : step === 'tipe' ? (
            // Step 1: Pilih Tipe
            <div>
              <div className="px-4 py-2.5 border-b border-white/5">
                <p className="text-[11px] uppercase tracking-wider text-text-tertiary font-semibold">Pilih Jenis Transaksi</p>
              </div>
              <div className="p-2">
                <button
                  onClick={() => handleTipeSelect('MASUK')}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-neon-green/5 transition-all group text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-neon-green/10 flex items-center justify-center border border-neon-green/20 group-hover:scale-110 transition-transform">
                    <ArrowDownCircle size={20} className="text-neon-green" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm group-hover:text-neon-green transition-colors">Uang Masuk</p>
                    <p className="text-[11px] text-text-tertiary">Dana pemasukan (4 kategori)</p>
                  </div>
                </button>
                <button
                  onClick={() => handleTipeSelect('KELUAR')}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-neon-pink/5 transition-all group text-left"
                >
                  <div className="w-10 h-10 rounded-lg bg-neon-pink/10 flex items-center justify-center border border-neon-pink/20 group-hover:scale-110 transition-transform">
                    <ArrowUpCircle size={20} className="text-neon-pink" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm group-hover:text-neon-pink transition-colors">Uang Keluar</p>
                    <p className="text-[11px] text-text-tertiary">Pengeluaran (9 kategori)</p>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            // Step 2: Pilih Sub-Kategori
            <div>
              <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-wider text-text-tertiary font-semibold">
                  {selectedTipe === 'MASUK' ? '💰 Kategori Uang Masuk' : '💸 Kategori Uang Keluar'}
                </p>
                <button 
                  onClick={handleBack}
                  className="text-xs text-neon-blue hover:text-neon-blue/80 transition-colors"
                >
                  ← Kembali
                </button>
              </div>
              <div className="p-2 max-h-64 overflow-y-auto">
                {filteredKategori.map((kat) => {
                  const isSelected = value?.id === kat.id;
                  return (
                    <button
                      key={kat.id}
                      onClick={() => handleKategoriSelect(kat)}
                      className={`
                        w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left text-sm transition-all
                        ${isSelected 
                          ? selectedTipe === 'MASUK'
                            ? 'bg-neon-green/10 text-neon-green'
                            : 'bg-neon-pink/10 text-neon-pink'
                          : 'text-white hover:bg-white/5'
                        }
                      `}
                    >
                      <span className="font-medium">{kat.nama}</span>
                      {isSelected && <Check size={16} />}
                      {kat.perlu_siswa && !isSelected && (
                        <span className="text-[10px] text-neon-blue bg-neon-blue/10 px-1.5 py-0.5 rounded border border-neon-blue/20">
                          + Siswa
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
