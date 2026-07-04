'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { RefreshCcw, Save, Link as LinkIcon, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function GoogleSheetsPage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [sheetId, setSheetId] = useState('1BxiMvs0XRYFgCE_8Dpvn1nis6B9jO1v_Iq123456');

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast.success('Sinkronisasi data ke Google Sheets berhasil!');
    }, 2500);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Konfigurasi Google Sheets disimpan');
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 md:pb-0 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/profil" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">Google Sheets Sync</h1>
            <p className="text-[13px] md:text-sm text-gray-400">Hubungkan database dengan spreadsheet eksternal</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column (Config & Sync) */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Connection Status Card (Mobile mostly) */}
          <div className="bg-[#1c1c1e] md:bg-[#242426] rounded-3xl p-5 border border-green-500/20 shadow-lg relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
             <div className="flex items-start justify-between">
                <div>
                   <h3 className="font-bold text-white mb-1 flex items-center gap-2">
                     Status Koneksi
                   </h3>
                   <p className="text-xs text-gray-400">Sinkronisasi terakhir: Hari ini, 10:45 AM</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-bold text-green-400">Terhubung</span>
                </div>
             </div>
          </div>

          <div className="bg-[#1c1c1e] md:bg-[#242426] rounded-3xl p-6 border border-white/5 shadow-lg">
            <h2 className="text-[15px] font-bold text-white mb-4">Konfigurasi Akses</h2>
            
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Google Sheet ID</label>
                <div className="relative">
                  <LinkIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text"
                    value={sheetId}
                    onChange={(e) => setSheetId(e.target.value)}
                    required
                    className="w-full rounded-2xl bg-black/20 border border-white/10 py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <p className="text-[11px] text-gray-500 px-1">ID bisa didapat dari URL spreadsheet Anda (antara /d/ dan /edit)</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">Service Account JSON (Opsional)</label>
                <textarea 
                  className="w-full rounded-2xl bg-black/20 border border-white/10 px-4 py-3.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors font-mono text-xs h-24 resize-y"
                  placeholder='{"type": "service_account", "project_id": "..."}'
                />
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  type="submit"
                  className="w-full md:w-auto px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-[14px] transition-colors flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Simpan Konfigurasi
                </button>
              </div>
            </form>
          </div>

          <div className="bg-[#1c1c1e] md:bg-[#242426] rounded-3xl p-6 border border-white/5 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-[15px] font-bold text-white mb-1">Manual Sinkronisasi</h2>
                <p className="text-xs text-gray-400">Paksa sistem untuk mensinkronkan data terbaru saat ini juga.</p>
              </div>
              <button 
                onClick={handleSync} 
                disabled={isSyncing}
                className="w-full md:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[14px] transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
              >
                {isSyncing ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <RefreshCcw size={18} />
                    Mulai Sync
                  </>
                )}
              </button>
            </div>

            <div className="space-y-2">
              {['Data Siswa', 'Data Tagihan', 'Riwayat Pembayaran', 'Riwayat Pengeluaran'].map((item) => (
                <div key={item} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <span className="font-semibold text-white text-[13px]">{item}</span>
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded-md">
                    <CheckCircle2 size={14} /> Sinkron
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Guide) */}
        <div className="space-y-6">
          <div className="bg-[#1c1c1e] md:bg-[#242426] rounded-3xl p-6 border border-white/5 shadow-lg">
            <h3 className="text-[15px] font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle size={18} className="text-blue-400" />
              Cara Pengaturan
            </h3>
            <ol className="list-decimal list-inside text-[13px] text-gray-400 space-y-3 leading-relaxed">
              <li>Buka <strong>Google Cloud Console</strong>.</li>
              <li>Buat <strong>Service Account</strong> baru.</li>
              <li>Buat Key berformat JSON.</li>
              <li>Aktifkan <strong>Google Sheets API</strong>.</li>
              <li>Buat Spreadsheet kosong di Google Drive Anda.</li>
              <li>Share spreadsheet tersebut ke email Service Account sebagai <strong>Editor</strong>.</li>
              <li>Copy ID spreadsheet ke form di samping.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
