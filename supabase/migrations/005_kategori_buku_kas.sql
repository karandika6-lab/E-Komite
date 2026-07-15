-- 005_kategori_buku_kas.sql
-- Tabel master kategori transaksi buku kas

CREATE TABLE IF NOT EXISTS kategori_buku_kas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama VARCHAR(255) NOT NULL UNIQUE,
    tipe VARCHAR(10) NOT NULL CHECK (tipe IN ('MASUK', 'KELUAR')),
    perlu_siswa BOOLEAN DEFAULT false,
    urutan INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Berikan hak akses
GRANT ALL PRIVILEGES ON TABLE kategori_buku_kas TO anon, authenticated;

-- Enable RLS
ALTER TABLE public.kategori_buku_kas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access" ON public.kategori_buku_kas;
CREATE POLICY "Allow all access" ON public.kategori_buku_kas FOR ALL USING (true) WITH CHECK (true);

-- Tambah kolom referensi ke buku_kas
ALTER TABLE buku_kas ADD COLUMN IF NOT EXISTS kategori_id UUID REFERENCES kategori_buku_kas(id);
ALTER TABLE buku_kas ADD COLUMN IF NOT EXISTS siswa_id UUID REFERENCES siswa(id);

-- Hapus kolom kode lama
ALTER TABLE buku_kas DROP COLUMN IF EXISTS kode;

-- Seed 13 kategori
INSERT INTO kategori_buku_kas (nama, tipe, perlu_siswa, urutan) VALUES
('Administrasi Tahun Berjalan', 'MASUK', true, 1),
('Administrasi Tahun Lalu', 'MASUK', true, 2),
('Kas Kegiatan', 'MASUK', false, 3),
('Lainnya', 'MASUK', false, 4),
('Pendaftaran', 'KELUAR', false, 5),
('Infak Yayasan', 'KELUAR', false, 6),
('MPLM/MOS', 'KELUAR', false, 7),
('Atribut, Batik & Training', 'KELUAR', false, 8),
('DPP', 'KELUAR', false, 9),
('UKS & OSIS', 'KELUAR', false, 10),
('Pramuka', 'KELUAR', false, 11),
('Life Skill', 'KELUAR', false, 12),
('Komite Madrasah', 'KELUAR', false, 13)
ON CONFLICT (nama) DO NOTHING;
