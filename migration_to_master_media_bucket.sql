-- Script untuk setup bucket asus-pvp-master-media dengan folder ACP
-- Jalankan di Supabase SQL Editor

-- 1. Pastikan bucket 'asus-pvp-master-media' sudah dibuat dan public
-- 2. Pastikan folder 'asus-acp-registration-form-store-photo-submission' sudah dibuat

-- Hapus policy lama jika ada (jika sebelumnya menggunakan bucket terpisah)
DROP POLICY IF EXISTS "Allow public file uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public file access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public file updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow public file deletes" ON storage.objects;

-- Buat policy baru untuk bucket asus-pvp-master-media dengan folder ACP
CREATE POLICY "Allow public ACP photo uploads" ON storage.objects
FOR INSERT TO public
WITH CHECK (
    bucket_id = 'asus-pvp-master-media' 
    AND (storage.foldername(name))[1] = 'asus-acp-registration-form-store-photo-submission'
);

CREATE POLICY "Allow public ACP photo access" ON storage.objects
FOR SELECT TO public
USING (
    bucket_id = 'asus-pvp-master-media'
    AND (storage.foldername(name))[1] = 'asus-acp-registration-form-store-photo-submission'
);

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

CREATE POLICY "Allow public ACP photo deletes" ON storage.objects
FOR DELETE TO public
USING (
    bucket_id = 'asus-pvp-master-media'
    AND (storage.foldername(name))[1] = 'asus-acp-registration-form-store-photo-submission'
);

-- Verifikasi policies
SELECT 
    policyname, 
    cmd,
    with_check,
    qual
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%ACP photo%';

-- Function untuk cleanup dengan bucket/folder baru
CREATE OR REPLACE FUNCTION cleanup_old_acp_store_photos()
RETURNS void AS $$
BEGIN
    DELETE FROM storage.objects 
    WHERE bucket_id = 'asus-pvp-master-media'
    AND (storage.foldername(name))[1] = 'asus-acp-registration-form-store-photo-submission'
    AND created_at < NOW() - INTERVAL '30 days'
    AND name NOT IN (
        SELECT SUBSTRING(store_photo_url FROM '[^/]+$') 
        FROM acp_registrations 
        WHERE store_photo_url IS NOT NULL
        AND store_photo_url LIKE '%asus-pvp-master-media%'
        AND store_photo_url LIKE '%asus-acp-registration-form-store-photo-submission%'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_old_acp_store_photos() IS 'Function untuk membersihkan file foto toko ACP dari bucket asus-pvp-master-media yang sudah tidak digunakan lebih dari 30 hari';

-- Test query untuk melihat file di bucket baru
/*
SELECT name, bucket_id, created_at 
FROM storage.objects 
WHERE bucket_id = 'asus-pvp-master-media'
AND (storage.foldername(name))[1] = 'asus-acp-registration-form-store-photo-submission'
LIMIT 10;
*/
