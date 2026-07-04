-- E-Komite Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. admin
CREATE TABLE admin (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. tahun_ajaran
CREATE TABLE tahun_ajaran (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama VARCHAR(50) NOT NULL, -- e.g., "2025/2026"
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. siswa
CREATE TABLE siswa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nis VARCHAR(50) UNIQUE NOT NULL,
    nisn VARCHAR(50),
    nama_lengkap VARCHAR(255) NOT NULL,
    jenis_kelamin VARCHAR(20) CHECK (jenis_kelamin IN ('Laki-laki', 'Perempuan')),
    kelas VARCHAR(50) NOT NULL,
    angkatan INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Lulus', 'Keluar', 'Pindah')),
    nama_ortu VARCHAR(255),
    no_hp_ortu VARCHAR(50),
    alamat TEXT,
    catatan TEXT,
    tahun_ajaran_id UUID REFERENCES tahun_ajaran(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. jenis_pembayaran
CREATE TABLE jenis_pembayaran (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kode VARCHAR(50) UNIQUE NOT NULL, -- e.g., "KOMITE", "PNB", "SEMESTER"
    nama VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    nominal_default DECIMAL(15, 2) NOT NULL DEFAULT 0,
    tipe VARCHAR(50) CHECK (tipe IN ('TAHUNAN', 'SEMESTER', 'BULANAN', 'SEKALI')),
    is_active BOOLEAN DEFAULT true,
    urutan INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. tagihan
CREATE TABLE tagihan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    siswa_id UUID REFERENCES siswa(id) ON DELETE CASCADE,
    jenis_pembayaran_id UUID REFERENCES jenis_pembayaran(id) ON DELETE RESTRICT,
    tahun_ajaran_id UUID REFERENCES tahun_ajaran(id) ON DELETE RESTRICT,
    periode VARCHAR(100), -- e.g., "2025-01" or "Semester 1"
    nominal DECIMAL(15, 2) NOT NULL,
    diskon DECIMAL(15, 2) DEFAULT 0,
    total_tagihan DECIMAL(15, 2) NOT NULL, -- nominal - diskon
    total_dibayar DECIMAL(15, 2) DEFAULT 0,
    sisa_tagihan DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'BELUM_LUNAS' CHECK (status IN ('LUNAS', 'BELUM_LUNAS', 'CICILAN')),
    jatuh_tempo DATE,
    catatan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. pembayaran
CREATE TABLE pembayaran (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tagihan_id UUID REFERENCES tagihan(id) ON DELETE CASCADE,
    siswa_id UUID REFERENCES siswa(id) ON DELETE CASCADE,
    no_kwitansi VARCHAR(100) UNIQUE NOT NULL,
    jumlah DECIMAL(15, 2) NOT NULL,
    metode_bayar VARCHAR(50) DEFAULT 'TUNAI' CHECK (metode_bayar IN ('TUNAI', 'TRANSFER', 'QRIS')),
    bukti_transfer_url TEXT,
    keterangan TEXT,
    created_by UUID REFERENCES admin(id) ON DELETE SET NULL,
    tanggal_bayar TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to update tagihan after pembayaran
CREATE OR REPLACE FUNCTION update_tagihan_after_pembayaran()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total_dibayar and sisa_tagihan
    UPDATE tagihan
    SET total_dibayar = total_dibayar + NEW.jumlah,
        sisa_tagihan = total_tagihan - (total_dibayar + NEW.jumlah)
    WHERE id = NEW.tagihan_id;

    -- Update status
    UPDATE tagihan
    SET status = CASE
        WHEN sisa_tagihan <= 0 THEN 'LUNAS'
        WHEN sisa_tagihan < total_tagihan THEN 'CICILAN'
        ELSE 'BELUM_LUNAS'
    END
    WHERE id = NEW.tagihan_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_tagihan_after_pembayaran
AFTER INSERT ON pembayaran
FOR EACH ROW
EXECUTE FUNCTION update_tagihan_after_pembayaran();


-- 7. kategori_pengeluaran
CREATE TABLE kategori_pengeluaran (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kode VARCHAR(50) UNIQUE NOT NULL,
    nama VARCHAR(255) NOT NULL,
    icon VARCHAR(100),
    warna VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. pengeluaran
CREATE TABLE pengeluaran (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kategori_id UUID REFERENCES kategori_pengeluaran(id) ON DELETE RESTRICT,
    tahun_ajaran_id UUID REFERENCES tahun_ajaran(id) ON DELETE RESTRICT,
    no_bukti VARCHAR(100) UNIQUE NOT NULL,
    nama_pengeluaran VARCHAR(255) NOT NULL,
    deskripsi TEXT,
    jumlah DECIMAL(15, 2) NOT NULL,
    tanggal DATE NOT NULL,
    penerima VARCHAR(255),
    bukti_url TEXT,
    created_by UUID REFERENCES admin(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. anggaran
CREATE TABLE anggaran (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tahun_ajaran_id UUID REFERENCES tahun_ajaran(id) ON DELETE RESTRICT,
    kategori_pengeluaran_id UUID REFERENCES kategori_pengeluaran(id) ON DELETE RESTRICT,
    jenis_pembayaran_id UUID REFERENCES jenis_pembayaran(id) ON DELETE SET NULL, -- sumber dana
    nominal_anggaran DECIMAL(15, 2) NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tahun_ajaran_id, kategori_pengeluaran_id) -- Only one budget per category per academic year
);

-- 10. google_sheet_sync
CREATE TABLE google_sheet_sync (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sheet_id VARCHAR(255),
    sheet_name VARCHAR(255),
    tipe VARCHAR(50) CHECK (tipe IN ('siswa', 'pembayaran', 'pengeluaran', 'tagihan')),
    last_sync TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) CHECK (status IN ('success', 'failed')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. activity_log
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES admin(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'EXPORT', 'SYNC'
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS (Row Level Security) - enable it later if needed, but for internal app we can keep it simple initially
-- But let's create a base setup for Auth
-- To authenticate admins using Supabase Auth (auth.users), we link the admin table to auth.users

-- Alter admin table to link with auth.users (Optional, if using custom table instead of just auth.users metadata)
-- For simplicity, if we rely on auth.users for login, we can keep the admin table for our app metadata.

ALTER TABLE admin ADD COLUMN IF NOT EXISTS auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create an admin on insertion to auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.admin (auth_id, email, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', 'Admin'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

