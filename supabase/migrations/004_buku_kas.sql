-- 12. buku_kas
CREATE TABLE IF NOT EXISTS buku_kas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tanggal DATE NOT NULL,
    kode VARCHAR(50),
    uraian TEXT NOT NULL,
    kas_masuk DECIMAL(15, 2) NOT NULL DEFAULT 0,
    kas_keluar DECIMAL(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Berikan hak akses ke role anon dan authenticated
GRANT ALL PRIVILEGES ON TABLE buku_kas TO anon, authenticated;

-- Enable RLS dan buat policy open (seperti tabel lainnya di 002)
ALTER TABLE public.buku_kas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access" ON public.buku_kas;
CREATE POLICY "Allow all access" ON public.buku_kas FOR ALL USING (true) WITH CHECK (true);
