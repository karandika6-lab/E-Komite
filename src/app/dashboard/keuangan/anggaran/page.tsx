'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Plus, Download, TrendingUp, PieChart, Wallet, X, Save } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function AnggaranPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataAnggaran, setDataAnggaran] = useState<any[]>([]);
  const [kategoriList, setKategoriList] = useState<any[]>([]);
  const [sumberDanaList, setSumberDanaList] = useState<any[]>([]);
  const [tahunAjaranList, setTahunAjaranList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [formTahun, setFormTahun] = useState('');
  const [formKategori, setFormKategori] = useState('');
  const [formSumber, setFormSumber] = useState('');
  const [formNominal, setFormNominal] = useState('');

  const supabase = createClient();

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Master Data for dropdowns
      const [resKategori, resSumber, resTahun] = await Promise.all([
        supabase.from('kategori_pengeluaran').select('*'),
        supabase.from('jenis_pembayaran').select('*'),
        supabase.from('tahun_ajaran').select('*').order('created_at', { ascending: false })
      ]);
      
      setKategoriList(resKategori.data || []);
      setSumberDanaList(resSumber.data || []);
      setTahunAjaranList(resTahun.data || []);
      
      if(resTahun.data && resTahun.data.length > 0) {
        setFormTahun((resTahun.data as any[])[0].id);
      }

      // 2. Fetch Anggaran List with relations
      const { data: anggaranData, error: angErr } = await supabase
        .from('anggaran')
        .select(`
          id, nominal_anggaran, kategori_pengeluaran_id,
          kategori_pengeluaran(nama),
          jenis_pembayaran(nama)
        `);
        
      if(angErr) throw angErr;

      // 3. Fetch Pengeluaran to calculate Realisasi
      const { data: pengeluaranData, error: pengErr } = await supabase
        .from('pengeluaran')
        .select('kategori_id, jumlah');
        
      if(pengErr) throw pengErr;

      // Group Pengeluaran by kategori_id
      const realisasiMap: Record<string, number> = {};
      (pengeluaranData as any[])?.forEach(p => {
        if(!realisasiMap[p.kategori_id]) realisasiMap[p.kategori_id] = 0;
        realisasiMap[p.kategori_id] += p.jumlah;
      });

      const formatted = anggaranData?.map((a: any) => ({
        id: a.id,
        kategori: a.kategori_pengeluaran?.nama || 'Tanpa Kategori',
        sumber: a.jenis_pembayaran?.nama || 'Bebas',
        anggaran: a.nominal_anggaran,
        realisasi: realisasiMap[a.kategori_pengeluaran_id] || 0
      })) || [];

      setDataAnggaran(formatted);
    } catch(err: any) {
      toast.error('Gagal memuat anggaran: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if(!formTahun || !formKategori || !formNominal) {
      return toast.error('Harap lengkapi semua field yang wajib');
    }

    setIsSaving(true);
    try {
      const { error } = await (supabase.from('anggaran') as any).insert([{
        tahun_ajaran_id: formTahun,
        kategori_pengeluaran_id: formKategori,
        jenis_pembayaran_id: formSumber || null,
        nominal_anggaran: parseFloat(formNominal)
      }]);
      if(error) {
        if(error.code === '23505') throw new Error('Anggaran untuk kategori ini sudah ada di tahun ajaran tersebut');
        throw error;
      }
      toast.success('RAB berhasil disimpan');
      setIsModalOpen(false);
      setFormNominal('');
      fetchData();
    } catch(err: any) {
      toast.error('Gagal menyimpan RAB: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Desktop Table Columns
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'kategori',
      header: 'Kategori Pengeluaran',
      cell: ({ row }) => <span className="font-bold text-white">{row.getValue('kategori')}</span>,
    },
    {
      accessorKey: 'sumber',
      header: 'Sumber Dana',
      cell: ({ row }) => <span className="text-xs bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-md font-medium border border-blue-500/20">{row.getValue('sumber')}</span>,
    },
    {
      accessorKey: 'anggaran',
      header: 'Anggaran (RAB)',
      cell: ({ row }) => `Rp ${(row.getValue('anggaran') as number).toLocaleString('id-ID')}`,
    },
    {
      accessorKey: 'realisasi',
      header: 'Realisasi',
      cell: ({ row }) => <span className="text-red-400">Rp ${(row.getValue('realisasi') as number).toLocaleString('id-ID')}</span>,
    },
    {
      id: 'sisa',
      header: 'Sisa Anggaran',
      cell: ({ row }) => {
        const sisa = row.original.anggaran - row.original.realisasi;
        return <span className="text-green-400 font-semibold">Rp {sisa.toLocaleString('id-ID')}</span>;
      },
    },
    {
      id: 'persentase',
      header: 'Progress',
      cell: ({ row }) => {
        const pct = (row.original.realisasi / row.original.anggaran) * 100;
        let colorClass = 'bg-green-500';
        if (pct > 75) colorClass = 'bg-yellow-500';
        if (pct > 90) colorClass = 'bg-red-500';
        
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden w-24">
              <div className={`h-full ${colorClass} transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
            </div>
            <span className="text-xs">{pct.toFixed(0)}%</span>
          </div>
        );
      },
    },
  ];

  const totalAnggaran = dataAnggaran.reduce((sum, a) => sum + a.anggaran, 0);
  const totalRealisasi = dataAnggaran.reduce((sum, a) => sum + a.realisasi, 0);
  const totalSisa = totalAnggaran - totalRealisasi;

  const totalProgress = totalAnggaran > 0 ? (totalRealisasi / totalAnggaran) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto md:space-y-6 pb-20 md:pb-0">
      
      {/* Header (Mobile & Desktop) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-0">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 md:mb-2">Manajemen Anggaran</h1>
          <p className="text-[13px] md:text-sm text-gray-400">Kelola Rencana Anggaran Belanja (RAB) per Tahun Ajaran.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select className="rounded-full bg-[#1c1c1e] md:bg-white/5 border border-white/10 px-4 py-2 text-[13px] font-medium text-white focus:outline-none transition-colors">
            <option className="bg-[#1c1c1e]">TA 2025/2026</option>
            <option className="bg-[#1c1c1e]">TA 2024/2025</option>
          </select>
          <Link href="/dashboard/pengaturan/export">
            <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[13px] font-medium hover:bg-white/10 transition-colors">
              <Download size={16} /> Export
            </button>
          </Link>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium shadow-lg shadow-blue-500/20 transition-all"
          >
            <Plus size={16} /> Set Anggaran
          </button>
        </div>
      </div>

      {/* MOBILE Summary Card */}
      <div className="block md:hidden mb-8">
        <div className="bg-[#1c1c1e] rounded-[24px] p-6 border border-white/5 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-teal-400 to-green-500" />
           <p className="text-gray-400 text-xs text-center mb-1 font-medium">Sisa Anggaran Tersedia</p>
           <p className="text-white text-[2rem] font-bold text-center mb-5 tracking-tight">Rp {totalSisa.toLocaleString('id-ID')}</p>
           
           {/* Progress Overall */}
           <div className="mb-6">
              <div className="flex justify-between text-[10px] text-gray-400 mb-1.5 font-medium">
                <span>Terpakai: {totalProgress.toFixed(1)}%</span>
                <span>Total: Rp {(totalAnggaran/1000000).toFixed(0)} Jt</span>
              </div>
              <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full" style={{ width: `${totalProgress}%` }} />
              </div>
           </div>

           <div className="flex justify-between items-center border-t border-white/5 pt-5">
              <div className="flex-1 text-center border-r border-white/5">
                 <p className="text-gray-400 text-[10px] mb-1 font-medium">Total Anggaran</p>
                 <p className="text-white text-[13px] font-bold">Rp {(totalAnggaran/1000000).toFixed(1)} Jt</p>
              </div>
              <div className="flex-1 text-center">
                 <p className="text-gray-400 text-[10px] mb-1 font-medium">Total Realisasi</p>
                 <p className="text-red-400 text-[13px] font-bold">Rp {(totalRealisasi/1000000).toFixed(1)} Jt</p>
              </div>
           </div>
        </div>
      </div>

      {/* DESKTOP Summary Cards */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1c1c1e] md:bg-[#242426] rounded-2xl p-5 border border-white/5 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400 mb-1">Total Anggaran</div>
            <div className="text-xl font-bold text-white">Rp {totalAnggaran.toLocaleString('id-ID')}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Wallet size={20} />
          </div>
        </div>
        <div className="bg-[#1c1c1e] md:bg-[#242426] rounded-2xl p-5 border border-white/5 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400 mb-1">Total Realisasi</div>
            <div className="text-xl font-bold text-red-400">Rp {totalRealisasi.toLocaleString('id-ID')}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center">
            <PieChart size={20} />
          </div>
        </div>
        <div className="bg-[#1c1c1e] md:bg-[#242426] rounded-2xl p-5 border border-white/5 shadow-lg flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-400 mb-1">Sisa Anggaran</div>
            <div className="text-xl font-bold text-green-400">Rp {totalSisa.toLocaleString('id-ID')}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center">
            <TrendingUp size={20} />
          </div>
        </div>
      </div>

      {/* Mobile Flat List View */}
      <div className="block md:hidden space-y-4">
        <h3 className="text-[13px] font-bold text-gray-400 uppercase tracking-widest px-1">Rincian Per Kategori</h3>
        
        <div className="bg-[#1c1c1e] rounded-[24px] border border-white/5 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400">Memuat data RAB...</div>
          ) : dataAnggaran.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Belum ada anggaran untuk periode ini.</div>
          ) : dataAnggaran.map((item, index) => {
            const pct = item.anggaran > 0 ? (item.realisasi / item.anggaran) * 100 : 0;
            const sisa = item.anggaran - item.realisasi;
            let colorClass = 'bg-green-500';
            if (pct > 75) colorClass = 'bg-yellow-500';
            if (pct > 90) colorClass = 'bg-red-500';

            return (
              <div key={item.id} className={`p-5 ${index !== dataAnggaran.length - 1 ? 'border-b border-white/5' : ''}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-[15px] text-white leading-tight">{item.kategori}</h4>
                    <span className="inline-block mt-1 text-[10px] font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                      {item.sumber}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] font-bold text-green-400">Sisa: Rp {(sisa/1000000).toFixed(1)} Jt</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <div className={`h-full ${colorClass} rounded-full`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <span className="text-[11px] font-bold text-gray-400 w-8 text-right">{pct.toFixed(0)}%</span>
                </div>
                
                <div className="flex justify-between mt-3 text-[11px]">
                  <span className="text-gray-500">Anggaran: Rp {(item.anggaran/1000000).toFixed(1)} Jt</span>
                  <span className="text-red-400 font-medium">Realisasi: Rp {(item.realisasi/1000000).toFixed(1)} Jt</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-[#1a1a1c] border border-white/5 rounded-3xl p-6">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Memuat data RAB...</div>
        ) : (
          <DataTable columns={columns} data={dataAnggaran} />
        )}
      </div>

      {/* Floating Action Button for Mobile / Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-[#111]/80 backdrop-blur-xl border-t border-white/5 z-40 md:hidden flex gap-3">
        <Link href="/dashboard/pengaturan/export" className="flex-1">
          <button className="w-full py-3.5 px-4 rounded-2xl font-bold text-[14px] transition-all bg-white/10 text-white flex justify-center items-center gap-2 border border-white/10">
            <Download size={18} /> Export
          </button>
        </Link>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex-1 py-3.5 px-4 rounded-2xl font-bold text-[14px] transition-all bg-blue-600 text-white flex justify-center items-center gap-2 shadow-lg shadow-blue-600/30"
        >
          <Plus size={18} /> Set RAB
        </button>
      </div>

      {/* Modal Popup for Set Anggaran */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md bg-[#1c1c1e] rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
               <h2 className="text-[16px] font-bold text-white">Set Anggaran (RAB)</h2>
               <button 
                 onClick={() => setIsModalOpen(false)}
                 className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
               >
                 <X size={16} />
               </button>
            </div>
            
             <div className="p-6 space-y-5">
               <div className="space-y-2">
                 <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Tahun Ajaran</label>
                 <select 
                   value={formTahun} onChange={(e) => setFormTahun(e.target.value)}
                   className="w-full rounded-2xl bg-[#1c1c1e] border border-white/10 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                 >
                   <option value="">Pilih Tahun Ajaran...</option>
                   {tahunAjaranList.map(t => (
                     <option key={t.id} value={t.id}>{t.nama}</option>
                   ))}
                 </select>
               </div>
               
               <div className="space-y-2">
                 <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Kategori Pengeluaran</label>
                 <select 
                   value={formKategori} onChange={(e) => setFormKategori(e.target.value)}
                   className="w-full rounded-2xl bg-[#1c1c1e] border border-white/10 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                 >
                   <option value="">Pilih Kategori...</option>
                   {kategoriList.map(k => (
                     <option key={k.id} value={k.id}>{k.nama}</option>
                   ))}
                 </select>
               </div>

               <div className="space-y-2">
                 <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Sumber Dana (Opsional)</label>
                 <select 
                   value={formSumber} onChange={(e) => setFormSumber(e.target.value)}
                   className="w-full rounded-2xl bg-[#1c1c1e] border border-white/10 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                 >
                   <option value="">Bebas / Tanpa Sumber Spesifik</option>
                   {sumberDanaList.map(s => (
                     <option key={s.id} value={s.id}>{s.nama}</option>
                   ))}
                 </select>
               </div>
               
               <div className="space-y-2">
                 <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Nominal Anggaran (Rp)</label>
                 <input 
                   type="number"
                   value={formNominal} onChange={(e) => setFormNominal(e.target.value)}
                   placeholder="Contoh: 50000000"
                   className="w-full rounded-2xl bg-black/20 border border-white/10 py-3.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                 />
               </div>
            </div>

            <div className="px-6 py-4 border-t border-white/5 flex gap-3 bg-white/[0.02]">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 rounded-xl font-bold text-[14px] text-gray-300 hover:bg-white/5 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-3 rounded-xl font-bold text-[14px] text-white bg-blue-600 hover:bg-blue-500 transition-colors flex justify-center items-center gap-2 shadow-lg shadow-blue-600/30 disabled:opacity-50"
              >
                {isSaving ? <span className="animate-spin text-white">...</span> : <Save size={16} />}
                Simpan RAB
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
