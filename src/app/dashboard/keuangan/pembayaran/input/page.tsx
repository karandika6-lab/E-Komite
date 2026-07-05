'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Search, CheckCircle2, ChevronRight, FileText, ArrowLeft, User, Receipt, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'sonner';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function InputPembayaranPage() {
  const router = useRouter();
  const supabase = createClient();
  const [search, setSearch] = useState('');
  const [siswaResults, setSiswaResults] = useState<any[]>([]);
  const [selectedSiswa, setSelectedSiswa] = useState<any>(null);
  const [tagihanList, setTagihanList] = useState<any[]>([]);
  const [selectedTagihan, setSelectedTagihan] = useState<any>(null);
  const [nominalBayar, setNominalBayar] = useState('');
  const [metode, setMetode] = useState('TUNAI');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch siswa based on search
  React.useEffect(() => {
    const searchSiswa = async () => {
      if (search.length > 2) {
        const { data } = await supabase
          .from('siswa')
          .select('*')
          .or(`nama_lengkap.ilike.%${search}%,nis.ilike.%${search}%`)
          .limit(5);
        setSiswaResults(data || []);
      } else {
        setSiswaResults([]);
      }
    };
    const timeoutId = setTimeout(searchSiswa, 500);
    return () => clearTimeout(timeoutId);
  }, [search]);

  // Fetch tagihan when siswa is selected
  React.useEffect(() => {
    if (selectedSiswa) {
      const fetchTagihan = async () => {
        const { data } = await supabase
          .from('tagihan')
          .select(`*, jenis_pembayaran(nama)`)
          .eq('siswa_id', selectedSiswa.id)
          .neq('status', 'LUNAS');
        setTagihanList(data || []);
      };
      fetchTagihan();
    } else {
      setTagihanList([]);
      setSelectedTagihan(null);
    }
  }, [selectedSiswa]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Create no_kwitansi format KW-YYYYMMDD-Random
      const dateStr = new Date().toISOString().slice(0,10).replace(/-/g,'');
      const randomStr = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const no_kwitansi = `KW-${dateStr}-${randomStr}`;

      const { data: newPembayaran, error: errInsert } = await (supabase
        .from('pembayaran') as any)
        .insert([{
          tagihan_id: selectedTagihan.id,
          siswa_id: selectedSiswa.id,
          no_kwitansi: no_kwitansi,
          jumlah: parseFloat(nominalBayar),
          metode: metode
        }])
        .select()
        .single();

      if (errInsert) throw errInsert;

      toast.success('Pembayaran berhasil dicatat!');
      router.push('/dashboard/keuangan/pembayaran');
    } catch (error: any) {
      toast.error('Gagal mencatat pembayaran: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = selectedSiswa && selectedTagihan && nominalBayar && Number(nominalBayar) > 0;

  return (
    <div className="max-w-2xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 md:mb-8">
        <Link href="/dashboard/keuangan/pembayaran" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Terima Dana</h1>
          <p className="text-[13px] md:text-sm text-gray-400">Input pembayaran masuk dari siswa</p>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Section 1: Siswa */}
        <div className="bg-[#1c1c1e] md:bg-[#242426] rounded-3xl p-5 border border-white/5 shadow-lg">
          <div className="flex items-center gap-3 mb-4 text-white">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <User size={16} />
            </div>
            <h2 className="font-semibold text-[15px]">1. Detail Siswa</h2>
          </div>

          {!selectedSiswa ? (
            <div>
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari Nama atau NIS Siswa..." 
                  className="w-full bg-black/20 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              
              {siswaResults.length > 0 && (
                <div className="mt-3 space-y-2">
                  {siswaResults.map(siswa => (
                    <div 
                      key={siswa.id} 
                      onClick={() => { setSelectedSiswa(siswa); setSearch(''); }}
                      className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-white text-[15px]">{siswa.nama_lengkap}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{siswa.nis} • Kelas {siswa.kelas}</p>
                      </div>
                      <ChevronRight size={18} className="text-gray-500" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5">
              <div>
                <p className="text-xs text-blue-300 font-medium mb-1">Siswa Terpilih</p>
                <p className="font-bold text-white text-[15px]">{selectedSiswa.nama_lengkap}</p>
                <p className="text-xs text-gray-400 mt-0.5">{selectedSiswa.nis} • Kelas {selectedSiswa.kelas}</p>
              </div>
              <button onClick={() => setSelectedSiswa(null)} className="text-[13px] text-blue-400 font-medium px-3 py-1.5 rounded-full hover:bg-blue-500/10 transition-colors">
                Ganti
              </button>
            </div>
          )}
        </div>

        {/* Section 2: Tagihan (Show only if Siswa is selected) */}
        <div className={`bg-[#1c1c1e] md:bg-[#242426] rounded-3xl p-5 border border-white/5 shadow-lg transition-opacity duration-300 ${!selectedSiswa ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center gap-3 mb-4 text-white">
            <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Receipt size={16} />
            </div>
            <h2 className="font-semibold text-[15px]">2. Tagihan Pembayaran</h2>
          </div>
          
          <div className="space-y-3">
            {tagihanList.length === 0 ? (
              <p className="text-sm text-gray-400 p-4 border border-white/5 rounded-2xl bg-white/[0.02]">Tidak ada tagihan yang belum lunas untuk siswa ini.</p>
            ) : (
              tagihanList.map(tagihan => (
                <label 
                  key={tagihan.id} 
                className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedTagihan?.id === tagihan.id ? 'border-blue-500 bg-blue-500/10' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04]'
                }`}
              >
                <input 
                  type="radio" 
                  name="tagihan" 
                  className="mt-1 w-4 h-4 text-blue-500 bg-black/20 border-white/20 focus:ring-blue-500 focus:ring-offset-0"
                  checked={selectedTagihan?.id === tagihan.id}
                  onChange={() => {
                    setSelectedTagihan(tagihan);
                    setNominalBayar(tagihan.sisa_tagihan.toString());
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <p className="font-bold text-white text-[14px] truncate">{tagihan.jenis_pembayaran?.nama || 'Tagihan'}</p>
                    <span className="text-[11px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md whitespace-nowrap">
                      Sisa: Rp {tagihan.sisa_tagihan.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <p className="text-[12px] text-gray-400">{tagihan.periode}</p>
                </div>
              </label>
            )))}
          </div>
        </div>

        {/* Section 3: Nominal & Metode (Show only if Tagihan is selected) */}
        <div className={`bg-[#1c1c1e] md:bg-[#242426] rounded-3xl p-5 border border-white/5 shadow-lg transition-opacity duration-300 ${!selectedTagihan ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center gap-3 mb-6 text-white">
            <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
              <CreditCard size={16} />
            </div>
            <h2 className="font-semibold text-[15px]">3. Nominal & Metode</h2>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-xs text-gray-400 font-medium mb-3">Nominal Pembayaran</p>
              <div className="flex items-center border-b-2 border-white/10 focus-within:border-blue-500 transition-colors pb-2">
                <span className="text-2xl text-gray-400 font-medium mr-3">Rp</span>
                <input 
                  type="number" 
                  value={nominalBayar}
                  onChange={(e) => setNominalBayar(e.target.value)}
                  placeholder="0"
                  className="w-full bg-transparent text-4xl font-bold text-white placeholder-gray-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 font-medium mb-3">Metode Pembayaran</p>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {['TUNAI', 'TRANSFER', 'QRIS'].map(m => (
                  <button
                    key={m}
                    onClick={() => setMetode(m)}
                    className={`flex-1 min-w-[100px] py-3 px-4 rounded-xl font-medium text-[13px] transition-all border ${
                      metode === m 
                        ? 'border-blue-500 bg-blue-500/10 text-white shadow-lg shadow-blue-500/20' 
                        : 'border-white/5 bg-white/[0.02] text-gray-400 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button for Mobile / Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-[#111]/80 backdrop-blur-xl border-t border-white/5 z-40 md:relative md:bg-transparent md:border-none md:p-0 md:mt-8 md:block">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <div className="hidden md:block flex-1">
             <p className="text-sm text-gray-400">Total Nominal</p>
             <p className="text-xl font-bold text-white">Rp {nominalBayar ? Number(nominalBayar).toLocaleString('id-ID') : '0'}</p>
          </div>
          <button 
            onClick={handleSubmit} 
            disabled={!isFormValid || isSubmitting}
            className={`flex-1 md:flex-none w-full md:w-auto py-4 md:py-3.5 px-8 rounded-2xl font-bold text-[15px] transition-all flex justify-center items-center gap-2 ${
              isFormValid && !isSubmitting
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30' 
                : 'bg-white/5 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Simpan & Cetak <span className="hidden md:inline">Kwitansi</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
