-- 006_integrasi_tagihan.sql
-- Trigger untuk memotong tagihan siswa saat uang masuk dicatat di buku_kas

CREATE OR REPLACE FUNCTION process_tagihan_from_buku_kas()
RETURNS TRIGGER AS $$
DECLARE
    v_sisa_bayar DECIMAL;
    v_tagihan RECORD;
    v_potong DECIMAL;
    v_kategori_perlu_siswa BOOLEAN;
BEGIN
    -- Hanya jalankan jika ada kas masuk dan dikaitkan ke siswa tertentu
    IF NEW.kas_masuk > 0 AND NEW.siswa_id IS NOT NULL THEN
        
        -- Cek apakah kategori transaksi ini memang diperuntukkan untuk memotong tagihan (perlu_siswa = true)
        SELECT perlu_siswa INTO v_kategori_perlu_siswa 
        FROM kategori_buku_kas 
        WHERE id = NEW.kategori_id;
        
        IF v_kategori_perlu_siswa THEN
            v_sisa_bayar := NEW.kas_masuk;
            
            -- Cari semua tagihan aktif (belum lunas) untuk siswa tersebut
            -- Diurutkan dari tagihan terlama
            FOR v_tagihan IN 
                SELECT id, sisa_tagihan 
                FROM tagihan 
                WHERE siswa_id = NEW.siswa_id AND sisa_tagihan > 0
                ORDER BY created_at ASC
            LOOP
                IF v_sisa_bayar <= 0 THEN
                    EXIT;
                END IF;
                
                -- Tentukan jumlah yang dialokasikan untuk memotong tagihan ini
                IF v_sisa_bayar >= v_tagihan.sisa_tagihan THEN
                    v_potong := v_tagihan.sisa_tagihan;
                ELSE
                    v_potong := v_sisa_bayar;
                END IF;
                
                -- Insert ke tabel pembayaran
                -- (Trigger lama 'trg_update_tagihan_after_pembayaran' akan secara otomatis 
                -- ter-trigger dan mengurangi 'sisa_tagihan' di tabel 'tagihan')
                INSERT INTO pembayaran (
                    tagihan_id, siswa_id, no_kwitansi, jumlah, metode_bayar, keterangan
                ) VALUES (
                    v_tagihan.id, 
                    NEW.siswa_id, 
                    'BK-' || substring(CAST(NEW.id AS VARCHAR) from 1 for 8) || '-' || substring(CAST(v_tagihan.id AS VARCHAR) from 1 for 4),
                    v_potong, 
                    'TUNAI', 
                    'Otomatis dari Buku Kas: ' || NEW.uraian
                );
                
                -- Kurangi sisa dana yang belum dialokasikan
                v_sisa_bayar := v_sisa_bayar - v_potong;
            END LOOP;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_buku_kas_bayar_tagihan ON buku_kas;
CREATE TRIGGER trg_buku_kas_bayar_tagihan
AFTER INSERT ON buku_kas
FOR EACH ROW
EXECUTE FUNCTION process_tagihan_from_buku_kas();
