-- Tabel RSVP untuk acara
-- Jalankan di SQL editor Supabase Anda
create table if not exists public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text not null,
  company text not null,
  food_preference text not null check (food_preference in ('Daging', 'Ikan', 'Vegan')),
  attending boolean not null,
  created_at timestamptz not null default now()
);

-- (Opsional) Index untuk pencarian / laporan
create index if not exists event_rsvps_created_at_idx on public.event_rsvps(created_at desc);
create index if not exists event_rsvps_attending_idx on public.event_rsvps(attending);
create index if not exists event_rsvps_email_idx on public.event_rsvps(email);
create index if not exists event_rsvps_food_preference_idx on public.event_rsvps(food_preference);

-- (Opsional) Policy RLS jika ingin mengaktifkan Row Level Security
-- alter table public.event_rsvps enable row level security;
-- create policy "Allow inserts" on public.event_rsvps for insert with check (true);

-- Komentar untuk dokumentasi
comment on column public.event_rsvps.email is 'Email peserta acara (wajib diisi)';
comment on column public.event_rsvps.food_preference is 'Preferensi makanan peserta: Daging, Ikan, atau Vegan (wajib diisi)';

-- ========================================
-- ACP Registration Schema
-- ========================================

-- Tabel utama untuk pendaftaran ACP
CREATE TABLE IF NOT EXISTS public.acp_registrations (
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
CREATE TABLE IF NOT EXISTS public.acp_contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    acp_registration_id UUID NOT NULL REFERENCES acp_registrations(id) ON DELETE CASCADE,
    contact_type VARCHAR(50) NOT NULL, -- 'Owner', 'Contact 1', 'Contact 2', 'Contact 3'
    name VARCHAR(255),
    mobile_phone VARCHAR(50),
    email VARCHAR(255),
    whatsapp_no VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk performa query ACP
CREATE INDEX IF NOT EXISTS idx_acp_registrations_created_at ON acp_registrations(created_at);
CREATE INDEX IF NOT EXISTS idx_acp_registrations_acp_name ON acp_registrations(acp_name);
CREATE INDEX IF NOT EXISTS idx_acp_contacts_registration_id ON acp_contacts(acp_registration_id);
CREATE INDEX IF NOT EXISTS idx_acp_contacts_contact_type ON acp_contacts(contact_type);

-- Trigger untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Hapus trigger jika sudah ada
DROP TRIGGER IF EXISTS update_acp_registrations_updated_at ON acp_registrations;

CREATE TRIGGER update_acp_registrations_updated_at 
    BEFORE UPDATE ON acp_registrations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) policies untuk ACP
ALTER TABLE acp_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE acp_contacts ENABLE ROW LEVEL SECURITY;

-- Policy untuk insert (public bisa insert)
DROP POLICY IF EXISTS "Allow public insert" ON acp_registrations;
CREATE POLICY "Allow public insert" ON acp_registrations
    FOR INSERT TO public
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insert contacts" ON acp_contacts;
CREATE POLICY "Allow public insert contacts" ON acp_contacts
    FOR INSERT TO public
    WITH CHECK (true);

-- Policy untuk select (hanya authenticated users yang bisa read)
DROP POLICY IF EXISTS "Allow authenticated select" ON acp_registrations;
CREATE POLICY "Allow authenticated select" ON acp_registrations
    FOR SELECT TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Allow authenticated select contacts" ON acp_contacts;
CREATE POLICY "Allow authenticated select contacts" ON acp_contacts
    FOR SELECT TO authenticated
    USING (true);

-- View untuk mempermudah query data lengkap
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
         r.telephone_no, r.fax_no, r.id_card_no, r.tax_id, r.sbn_nib, 
         r.pkp, r.agreement, r.created_at, r.updated_at
ORDER BY r.created_at DESC;

-- Grant permissions untuk view
GRANT SELECT ON acp_registrations_with_contacts TO authenticated;

-- Komentar untuk dokumentasi
COMMENT ON TABLE acp_registrations IS 'Tabel untuk menyimpan data pendaftaran ASUS Commercial Partner';
COMMENT ON TABLE acp_contacts IS 'Tabel untuk menyimpan informasi kontak dari setiap pendaftaran ACP';
COMMENT ON VIEW acp_registrations_with_contacts IS 'View yang menggabungkan data registrasi dengan informasi kontak';
