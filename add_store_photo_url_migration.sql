-- Migration: Add store_photo_url column to acp_registrations table
-- Jalankan script ini di Supabase SQL Editor setelah schema utama

-- Tambah kolom store_photo_url
ALTER TABLE acp_registrations 
ADD COLUMN store_photo_url TEXT;

-- Tambah comment untuk dokumentasi
COMMENT ON COLUMN acp_registrations.store_photo_url IS 'URL foto toko yang disimpan di Supabase Storage';

-- Update view untuk include kolom baru
DROP VIEW IF EXISTS acp_registrations_with_contacts;

CREATE VIEW acp_registrations_with_contacts AS
SELECT 
    r.*,
    json_agg(
        json_build_object(
            'id', c.id,
            'contact_type', c.contact_type,
            'name', c.name,
            'mobile_phone', c.mobile_phone,
            'email', c.email,
            'whatsapp_no', c.whatsapp_no
        ) ORDER BY 
        CASE c.contact_type 
            WHEN 'Owner' THEN 1
            WHEN 'Contact 1' THEN 2
            WHEN 'Contact 2' THEN 3
            WHEN 'Contact 3' THEN 4
            ELSE 5
        END
    ) FILTER (WHERE c.id IS NOT NULL) AS contacts
FROM acp_registrations r
LEFT JOIN acp_contacts c ON r.id = c.acp_registration_id
GROUP BY r.id, r.acp_name, r.acp_address, r.city, r.state, r.post_code, 
         r.telephone_no, r.fax_no, r.store_photo_url, r.id_card_no, r.tax_id, 
         r.sbn_nib, r.pkp, r.agreement, r.created_at, r.updated_at
ORDER BY r.created_at DESC;

-- Grant permissions untuk view yang telah diupdate
GRANT SELECT ON acp_registrations_with_contacts TO authenticated;
