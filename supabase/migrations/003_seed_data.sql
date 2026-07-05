-- 003_seed_data.sql
-- Seed initial master data for prototype testing

-- 1. Seed Tahun Ajaran
INSERT INTO tahun_ajaran (nama, tanggal_mulai, tanggal_selesai, is_active)
VALUES 
    ('2024/2025', '2024-07-01', '2025-06-30', false),
    ('2025/2026', '2025-07-01', '2026-06-30', true)
ON CONFLICT DO NOTHING;

-- 2. Seed Jenis Pembayaran
INSERT INTO jenis_pembayaran (kode, nama, deskripsi, nominal_default, tipe)
VALUES 
    ('KOMITE', 'Uang Komite (Bulanan)', 'Iuran komite wajib bulanan', 250000, 'BULANAN'),
    ('SPP', 'SPP Tahunan', 'Sumbangan Pembinaan Pendidikan', 1500000, 'TAHUNAN'),
    ('SERAGAM', 'Seragam Sekolah', 'Paket seragam lengkap', 800000, 'SEKALI'),
    ('UJIAN', 'Biaya Ujian', 'Biaya pelaksanaan ujian semester', 150000, 'SEMESTER')
ON CONFLICT (kode) DO NOTHING;

-- 3. Seed Kategori Pengeluaran
INSERT INTO kategori_pengeluaran (kode, nama, icon, warna)
VALUES 
    ('GAJI', 'Gaji Guru & Staf', 'Users', 'blue'),
    ('OPR', 'Operasional Sekolah', 'Settings', 'orange'),
    ('FAS', 'Fasilitas & Gedung', 'Building', 'green'),
    ('EVT', 'Kegiatan & Acara', 'Calendar', 'purple')
ON CONFLICT (kode) DO NOTHING;
