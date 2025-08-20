-- ACP Registration Schema for Supabase
-- Jalankan script ini di Supabase SQL Editor

-- Tabel utama untuk pendaftaran ACP
CREATE TABLE acp_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    acp_name VARCHAR(255) NOT NULL,
    acp_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    post_code VARCHAR(20) NOT NULL,
    telephone_no VARCHAR(50) NOT NULL,
    fax_no VARCHAR(50),
    id_card_no VARCHAR(50),
    tax_id VARCHAR(50),
    sbn_nib VARCHAR(50),
    pkp VARCHAR(50),
    agreement BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel untuk informasi kontak
CREATE TABLE acp_contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    acp_registration_id UUID NOT NULL REFERENCES acp_registrations(id) ON DELETE CASCADE,
    contact_type VARCHAR(50) NOT NULL, -- 'Owner', 'Contact 1', 'Contact 2', 'Contact 3'
    name VARCHAR(255),
    mobile_phone VARCHAR(50),
    email VARCHAR(255),
    whatsapp_no VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk performa query
CREATE INDEX idx_acp_registrations_created_at ON acp_registrations(created_at);
CREATE INDEX idx_acp_registrations_acp_name ON acp_registrations(acp_name);
CREATE INDEX idx_acp_contacts_registration_id ON acp_contacts(acp_registration_id);
CREATE INDEX idx_acp_contacts_contact_type ON acp_contacts(contact_type);

-- Trigger untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_acp_registrations_updated_at 
    BEFORE UPDATE ON acp_registrations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) policies
ALTER TABLE acp_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE acp_contacts ENABLE ROW LEVEL SECURITY;

-- Policy untuk insert (public bisa insert)
CREATE POLICY "Allow public insert" ON acp_registrations
    FOR INSERT TO public
    WITH CHECK (true);

CREATE POLICY "Allow public insert" ON acp_contacts
    FOR INSERT TO public
    WITH CHECK (true);

-- Policy untuk select (hanya authenticated users yang bisa read)
CREATE POLICY "Allow authenticated select" ON acp_registrations
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated select" ON acp_contacts
    FOR SELECT TO authenticated
    USING (true);

-- Policy untuk update/delete (hanya authenticated users)
CREATE POLICY "Allow authenticated update" ON acp_registrations
    FOR UPDATE TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated delete" ON acp_registrations
    FOR DELETE TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated update" ON acp_contacts
    FOR UPDATE TO authenticated
    USING (true);

CREATE POLICY "Allow authenticated delete" ON acp_contacts
    FOR DELETE TO authenticated
    USING (true);

-- View untuk mempermudah query data lengkap
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
         r.telephone_no, r.fax_no, r.id_card_no, r.tax_id, r.sbn_nib, 
         r.pkp, r.agreement, r.created_at, r.updated_at
ORDER BY r.created_at DESC;

-- Grant permissions untuk view
GRANT SELECT ON acp_registrations_with_contacts TO authenticated;

-- Komentar untuk dokumentasi
COMMENT ON TABLE acp_registrations IS 'Tabel untuk menyimpan data pendaftaran ASUS Commercial Partner';
COMMENT ON TABLE acp_contacts IS 'Tabel untuk menyimpan informasi kontak dari setiap pendaftaran ACP';
COMMENT ON VIEW acp_registrations_with_contacts IS 'View yang menggabungkan data registrasi dengan informasi kontak';

-- Sample query untuk testing (tidak perlu dijalankan, hanya untuk referensi)
/*
-- Contoh query untuk melihat semua pendaftaran
SELECT * FROM acp_registrations_with_contacts;

-- Contoh query untuk melihat pendaftaran tertentu
SELECT * FROM acp_registrations_with_contacts WHERE id = 'your-uuid-here';

-- Contoh query untuk mencari berdasarkan nama perusahaan
SELECT * FROM acp_registrations_with_contacts WHERE acp_name ILIKE '%keyword%';

-- Contoh query untuk statistik
SELECT 
    COUNT(*) as total_registrations,
    COUNT(CASE WHEN agreement = true THEN 1 END) as agreed_registrations,
    DATE(created_at) as registration_date
FROM acp_registrations 
GROUP BY DATE(created_at) 
ORDER BY registration_date DESC;
*/
