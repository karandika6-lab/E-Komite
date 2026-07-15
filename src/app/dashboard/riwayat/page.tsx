'use client';

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Search, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { format, isSameMonth } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

export default function RiwayatPage() {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense' | 'month'>('all');
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  React.useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('buku_kas')
        .select(`
          id, tanggal, uraian, kas_masuk, kas_keluar, 
          siswa (nama_lengkap, angkatan),
          kategori_buku_kas (nama)
        `);

      if (error) throw error;

      const formatted = ((data as any[]) || []).map(item => {
        const isIncome = item.kas_masuk > 0;
        return {
          id: `bk_${item.id}`,
          type: isIncome ? 'income' : 'expense',
          title: item.kategori_buku_kas?.nama || (isIncome ? 'Pemasukan' : 'Pengeluaran'),
          amount: isIncome ? item.kas_masuk : item.kas_keluar,
          name: item.siswa ? `${item.siswa.nama_lengkap} (Angkatan ${item.siswa.angkatan})` : item.uraian,
          date: item.tanggal,
          ref: 'BK-' + item.id.substring(0, 8)
        };
      });

      const sorted = formatted.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setHistoryData(sorted);
    } catch (error: any) {
      toast.error('Gagal mengambil histori: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = historyData.filter(item => {
    if (filter === 'month') return isSameMonth(new Date(item.date), new Date());
    if (filter === 'all') return true;
    return item.type === filter;
  });

  // Group by date
  const groupedData = filteredData.reduce((acc, item) => {
    const dateStr = format(new Date(item.date), 'dd MMMM yyyy', { locale: id });
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(item);
    return acc;
  }, {} as Record<string, typeof historyData>);

  const totalIncome = filteredData.filter(i => i.type === 'income').reduce((sum, i) => sum + i.amount, 0);
  const totalExpense = filteredData.filter(i => i.type === 'expense').reduce((sum, i) => sum + i.amount, 0);
  const netTotal = totalIncome - totalExpense;

  return (
    <div className="max-w-4xl mx-auto md:space-y-6 pb-20 md:pb-0">
      {/* Header Title (Desktop & Mobile) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-0">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 md:mb-2">Riwayat Transaksi</h1>
          <p className="text-[13px] md:text-sm text-text-secondary">Jejak lengkap arus kas masuk dan keluar.</p>
        </div>
      </div>

      {/* MOBILE Summary Card */}
      <div className="block md:hidden mb-8">
        <div className="bg-[#1c1c1e] rounded-[24px] p-6 border border-white/5 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500" />
           <p className="text-gray-400 text-xs text-center mb-1 font-medium">Selisih Bersih (Bulan Ini)</p>
           <p className="text-white text-[2rem] font-bold text-center mb-6 tracking-tight">Rp {netTotal.toLocaleString('id-ID')}</p>
           
           <div className="flex justify-between items-center border-t border-white/5 pt-5">
              <div className="flex-1 text-center border-r border-white/5">
                 <p className="text-gray-400 text-[10px] mb-1 font-medium">Pemasukan</p>
                 <p className="text-green-500 text-[13px] font-bold">+ {totalIncome.toLocaleString('id-ID')}</p>
              </div>
              <div className="flex-1 text-center">
                 <p className="text-gray-400 text-[10px] mb-1 font-medium">Pengeluaran</p>
                 <p className="text-red-500 text-[13px] font-bold">- {totalExpense.toLocaleString('id-ID')}</p>
              </div>
           </div>
        </div>
      </div>

      {/* DESKTOP Summary Cards */}
      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border border-white/10">
          <p className="text-xs text-text-secondary mb-1">Total Pemasukan</p>
          <p className="text-xl font-bold text-green-500">+ Rp {totalIncome.toLocaleString('id-ID')}</p>
        </Card>
        <Card className="p-4 border border-white/10">
          <p className="text-xs text-text-secondary mb-1">Total Pengeluaran</p>
          <p className="text-xl font-bold text-red-500">- Rp {totalExpense.toLocaleString('id-ID')}</p>
        </Card>
        <Card className="p-4 border border-white/10">
          <p className="text-xs text-text-secondary mb-1">Selisih Bersih</p>
          <p className="text-xl font-bold text-white">Rp {netTotal.toLocaleString('id-ID')}</p>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="bg-transparent md:bg-[#1a1a1c] md:border md:border-white/5 md:rounded-3xl md:p-6">
        
        {/* Search & Filter */}
        <div className="flex flex-col gap-5 mb-8">
          <div className="flex-1 relative">
             <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
             <input 
               type="text" 
               placeholder="Cari referensi atau deskripsi..." 
               className="w-full bg-[#1c1c1e] md:bg-black/20 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-[13px] text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
             />
          </div>
          
          {/* Pill Tabs */}
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 md:mx-0 md:px-0">
            <button 
              onClick={() => setFilter('all')}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-[13px] font-semibold transition-all ${
                filter === 'all' 
                  ? 'bg-white text-black shadow-md' 
                  : 'bg-[#1c1c1e] md:bg-white/5 text-gray-400 border border-white/10 hover:text-white'
              }`}
            >
              Semua
            </button>
            <button 
              onClick={() => setFilter('income')}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-[13px] font-semibold transition-all ${
                filter === 'income' 
                  ? 'bg-green-500 text-white shadow-md shadow-green-500/20' 
                  : 'bg-[#1c1c1e] md:bg-white/5 text-gray-400 border border-white/10 hover:text-white'
              }`}
            >
              Pemasukan
            </button>
            <button 
              onClick={() => setFilter('expense')}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-[13px] font-semibold transition-all ${
                filter === 'expense' 
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/20' 
                  : 'bg-[#1c1c1e] md:bg-white/5 text-gray-400 border border-white/10 hover:text-white'
              }`}
            >
              Pengeluaran
            </button>
            <button 
              onClick={() => setFilter('month')}
              className={`hidden md:flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-semibold transition-colors ml-2 ${
                filter === 'month' 
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' 
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
              }`}
            >
              <CalendarIcon size={14} />
              Bulan Ini
            </button>
          </div>
        </div>

        {/* Transaction List */}
        <div className="space-y-8">
          {isLoading ? (
            <div className="py-20 text-center text-gray-400">Memuat riwayat transaksi...</div>
          ) : (
            Object.entries(groupedData).map(([date, items]) => (
              <div key={date}>
              {/* Date Separator */}
              <h3 className="text-[11px] font-bold text-gray-400/80 uppercase tracking-widest mb-3 px-1 flex items-center gap-3">
                {date}
                <div className="h-px bg-white/5 flex-1 mt-0.5" />
              </h3>
              
              {/* List Wrapper */}
              <div className="bg-[#1c1c1e] md:bg-transparent rounded-[20px] md:rounded-none border border-white/5 md:border-none overflow-hidden space-y-0 md:space-y-3">
                {(items as any[]).map((item, index) => (
                  <div 
                    key={item.id} 
                    onClick={() => toast.info(`Menampilkan detail transaksi ${item.ref}`)}
                    className={`flex items-center gap-3 p-4 md:rounded-2xl md:bg-[#242426] md:border md:border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer ${
                    index !== (items as any[]).length - 1 ? 'border-b border-white/5 md:border-none' : ''
                  }`}>
                    {/* Icon */}
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      item.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {item.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                       <div className="flex items-center justify-between mb-0.5 gap-2">
                          <h4 className="text-[14px] font-bold text-white truncate">{item.title}</h4>
                          <span className={`text-[14px] font-bold whitespace-nowrap ${
                            item.type === 'income' ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {item.type === 'income' ? '+' : '-'} {item.amount.toLocaleString('id-ID')}
                          </span>
                       </div>
                       <div className="flex items-center justify-between gap-2">
                          <p className="text-[11px] text-gray-400 truncate">{item.name}</p>
                          <p className="text-[10px] text-gray-500 whitespace-nowrap">{format(new Date(item.date), 'HH:mm')}</p>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
              </div>
            ))
          )}
          {!isLoading && filteredData.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-gray-500">
              <Search size={32} className="mb-3 opacity-20" />
              <p className="text-sm">Tidak ada transaksi ditemukan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
