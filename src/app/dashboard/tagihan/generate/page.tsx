'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, FileText, Send, CheckCircle2, Users, Receipt, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function GenerateTagihanPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [targetType, setTargetType] = useState('kelas'); // 'kelas', 'angkatan', 'semua'
  const [jenisList, setJenisList] = useState<any[]>([]);
  const [tahunList, setTahunList] = useState<any[]>([]);
  const [selectedJenis, setSelectedJenis] = useState('');
  const [selectedTahun, setSelectedTahun] = useState('');
  const [periode, setPeriode] = useState('Juli');
  const [jatuhTempo, setJatuhTempo] = useState('');
  const [selectedKelas, setSelectedKelas] = useState<string[]>([]);
  const [selectedAngkatan, setSelectedAngkatan] = useState<string[]>([]);

  React.useEffect(() => {
    const fetchMasterData = async () => {
      const [jenisRes, tahunRes] = await Promise.all([
        supabase.from('jenis_pembayaran').select('*').eq('is_active', true),
        supabase.from('tahun_ajaran').select('*').eq('is_active', true)
      ]);
      if (jenisRes.data) {
        setJenisList(jenisRes.data);
        if (jenisRes.data.length > 0) setSelectedJenis(jenisRes.data[0].id);
      }
      if (tahunRes.data) {
        setTahunList(tahunRes.data);
        if (tahunRes.data.length > 0) setSelectedTahun(tahunRes.data[0].id);
      }
    };
    fetchMasterData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJenis || !selectedTahun) return toast.error('Lengkapi data tagihan');
    if (targetType === 'kelas' && selectedKelas.length === 0) return toast.error('Pilih minimal satu kelas');
    if (targetType === 'angkatan' && selectedAngkatan.length === 0) return toast.error('Pilih minimal satu angkatan');

    setIsSubmitting(true);
    try {
      // Build query for students
      let query = supabase.from('siswa').select('id');
      if (targetType === 'kelas') query = query.in('kelas', selectedKelas);
      if (targetType === 'angkatan') query = query.in('angkatan', selectedAngkatan.map(Number));
      query = query.eq('status', 'Aktif');

      const { data: siswaData, error: siswaErr } = await query;
      if (siswaErr) throw siswaErr;
      if (!siswaData || siswaData.length === 0) throw new Error('Tidak ada siswa yang sesuai target');

      const jenis = jenisList.find(j => j.id === selectedJenis);

      // Mass insert tagihan
      const tagihanInserts = siswaData.map(s => ({
        siswa_id: s.id,
        jenis_pembayaran_id: selectedJenis,
        tahun_ajaran_id: selectedTahun,
        periode,
        nominal: jenis.nominal_default,
        total_tagihan: jenis.nominal_default,
        sisa_tagihan: jenis.nominal_default,
        jatuh_tempo: jatuhTempo || null
      }));

      const { error: insErr } = await supabase.from('tagihan').insert(tagihanInserts);
      if (insErr) throw insErr;

      toast.success(`Berhasil membuat ${tagihanInserts.length} tagihan!`);
      router.push('/dashboard/tagihan');
    } catch (error: any) {
      toast.error('Gagal generate: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 md:mb-8">
        <Link href="/dashboard/tagihan" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Generate Tagihan Massal</h1>
          <p className="text-[13px] md:text-sm text-gray-400">Buat tagihan sekaligus untuk banyak siswa</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Step 1: Info Tagihan */}
        <div className="bg-[#1c1c1e] md:bg-[#242426] rounded-3xl p-6 border border-white/5 shadow-lg">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Receipt size={20} />
            </div>
            <h2 className="text-[16px] font-bold text-white">1. Rincian Tagihan</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Jenis Pembayaran</label>
              <select 
                value={selectedJenis}
                onChange={e => setSelectedJenis(e.target.value)}
                className="w-full rounded-2xl bg-[#1c1c1e] border border-white/10 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                {jenisList.map(j => (
                  <option key={j.id} value={j.id}>{j.nama} - Rp{j.nominal_default.toLocaleString('id-ID')}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Tahun Ajaran</label>
              <select 
                value={selectedTahun}
                onChange={e => setSelectedTahun(e.target.value)}
                className="w-full rounded-2xl bg-[#1c1c1e] border border-white/10 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                {tahunList.map(t => (
                  <option key={t.id} value={t.id}>{t.nama}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Bulan/Periode (Opsional)</label>
              <select 
                value={periode}
                onChange={e => setPeriode(e.target.value)}
                className="w-full rounded-2xl bg-[#1c1c1e] border border-white/10 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                {['Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Semester 1', 'Semester 2', 'Tahun 2025'].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Jatuh Tempo</label>
              <div className="relative">
                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="date" 
                  value={jatuhTempo}
                  onChange={e => setJatuhTempo(e.target.value)}
                  className="w-full rounded-2xl bg-black/20 border border-white/10 py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Target Siswa */}
        <div className="bg-[#1c1c1e] md:bg-[#242426] rounded-3xl p-6 border border-white/5 shadow-lg">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Users size={20} />
            </div>
            <h2 className="text-[16px] font-bold text-white">2. Target Penerima Tagihan</h2>
          </div>

          <div className="flex gap-4 mb-6 overflow-x-auto no-scrollbar pb-2">
             <button 
               type="button"
               onClick={() => setTargetType('kelas')}
               className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                 targetType === 'kelas' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'
               }`}
             >
               Berdasarkan Kelas
             </button>
             <button 
               type="button"
               onClick={() => setTargetType('angkatan')}
               className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                 targetType === 'angkatan' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'
               }`}
             >
               Berdasarkan Angkatan
             </button>
             <button 
               type="button"
               onClick={() => setTargetType('semua')}
               className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${
                 targetType === 'semua' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-white/5 text-gray-400 hover:bg-white/10'
               }`}
             >
               Seluruh Siswa Aktif
             </button>
          </div>

          <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
             {targetType === 'kelas' && (
               <div className="space-y-4">
                 <p className="text-[13px] text-gray-400">Pilih satu atau beberapa kelas yang akan menerima tagihan ini.</p>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['X-1', 'X-2', 'XI-IPA 1', 'XI-IPS 1', 'XII-IPA 1'].map((kls) => (
                      <label key={kls} className="flex items-center gap-3 p-3 rounded-xl bg-[#1c1c1e] border border-white/5 cursor-pointer hover:border-purple-500/30 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={selectedKelas.includes(kls)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedKelas([...selectedKelas, kls]);
                            else setSelectedKelas(selectedKelas.filter(k => k !== kls));
                          }}
                          className="w-4 h-4 rounded border-gray-600 text-purple-600 focus:ring-purple-600 focus:ring-offset-gray-900 bg-gray-700" 
                        />
                        <span className="text-sm font-medium text-white">{kls}</span>
                      </label>
                    ))}
                 </div>
               </div>
             )}
             {targetType === 'angkatan' && (
               <div className="space-y-4">
                 <p className="text-[13px] text-gray-400">Pilih tahun angkatan siswa.</p>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['2025', '2024', '2023', '2022'].map((thn) => (
                      <label key={thn} className="flex items-center gap-3 p-3 rounded-xl bg-[#1c1c1e] border border-white/5 cursor-pointer hover:border-purple-500/30 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={selectedAngkatan.includes(thn)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedAngkatan([...selectedAngkatan, thn]);
                            else setSelectedAngkatan(selectedAngkatan.filter(a => a !== thn));
                          }}
                          className="w-4 h-4 rounded border-gray-600 text-purple-600 focus:ring-purple-600 focus:ring-offset-gray-900 bg-gray-700" 
                        />
                        <span className="text-sm font-medium text-white">Angkatan {thn}</span>
                      </label>
                    ))}
                 </div>
               </div>
             )}
             {targetType === 'semua' && (
               <div className="flex flex-col items-center justify-center py-6 text-center">
                 <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
                   <CheckCircle2 size={32} className="text-green-500" />
                 </div>
                 <h3 className="font-bold text-white mb-1">Tagihan Untuk Semua Siswa Aktif</h3>
                 <p className="text-sm text-gray-400">Total estimasi: 450 Siswa</p>
               </div>
             )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex gap-4 pt-4 pb-12 md:pb-0">
          <Link href="/dashboard/tagihan" className="flex-1 md:flex-none">
            <Button variant="outline" type="button" className="w-full h-14 rounded-2xl font-bold">
              Batal
            </Button>
          </Link>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="flex-1 w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send size={18} className="mr-2" />
                Generate & Terbitkan
              </>
            )}
          </Button>
        </div>

      </form>
    </div>
  );
}
