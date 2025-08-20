-- Supabase Storage Setup untuk ACP Registration Form
-- Jalankan script ini di Supabase SQL Editor setelah membuat bucket

-- 1. Pastikan bucket sudah dibuat dengan nama: asus-pvp-master-media
-- 2. Set bucket menjadi PUBLIC di dashboard Supabase
-- 3. Pastikan folder: asus-acp-registration-form-store-photo-submission sudah ada

-- Setup RLS policies untuk storage bucket
-- Policy untuk mengizinkan upload file (INSERT) ke folder ACP
CREATE POLICY "Allow public ACP photo uploads" ON storage.objects
FOR INSERT TO public
WITH CHECK (
    bucket_id = 'asus-pvp-master-media' 
    AND (storage.foldername(name))[1] = 'asus-acp-registration-form-store-photo-submission'
);

-- Policy untuk mengizinkan akses file (SELECT) dari folder ACP
CREATE POLICY "Allow public ACP photo access" ON storage.objects
FOR SELECT TO public
USING (
    bucket_id = 'asus-pvp-master-media'
    AND (storage.foldername(name))[1] = 'asus-acp-registration-form-store-photo-submission'
);

-- Policy untuk mengizinkan update file (jika diperlukan) di folder ACP
CREATE POLICY "Allow public ACP photo updates" ON storage.objects
FOR UPDATE TO public
USING (
    bucket_id = 'asus-pvp-master-media'
    AND (storage.foldername(name))[1] = 'asus-acp-registration-form-store-photo-submission'
)
WITH CHECK (
    bucket_id = 'asus-pvp-master-media'
    AND (storage.foldername(name))[1] = 'asus-acp-registration-form-store-photo-submission'
);

-- Policy untuk mengizinkan delete file (jika diperlukan) di folder ACP
CREATE POLICY "Allow public ACP photo deletes" ON storage.objects
FOR DELETE TO public
USING (
    bucket_id = 'asus-pvp-master-media'
    AND (storage.foldername(name))[1] = 'asus-acp-registration-form-store-photo-submission'
);

-- Verifikasi policies sudah dibuat
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%ACP photo%';

-- Optional: Buat function untuk cleanup file lama (untuk maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_acp_store_photos()
RETURNS void AS $$
BEGIN
    -- Hapus file yang lebih dari 30 hari dan tidak ada referensi di database
    DELETE FROM storage.objects 
    WHERE bucket_id = 'asus-pvp-master-media'
    AND (storage.foldername(name))[1] = 'asus-acp-registration-form-store-photo-submission'
    AND created_at < NOW() - INTERVAL '30 days'
    AND name NOT IN (
        SELECT SUBSTRING(store_photo_url FROM '[^/]+$') 
        FROM acp_registrations 
        WHERE store_photo_url IS NOT NULL
        AND store_photo_url LIKE '%asus-acp-registration-form-store-photo-submission%'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Komentar untuk dokumentasi
COMMENT ON FUNCTION cleanup_old_acp_store_photos() IS 'Function untuk membersihkan file foto toko ACP yang sudah tidak digunakan lebih dari 30 hari';

-- Grant permission untuk function (jika diperlukan untuk automated cleanup)
-- GRANT EXECUTE ON FUNCTION cleanup_old_acp_store_photos() TO service_role;
