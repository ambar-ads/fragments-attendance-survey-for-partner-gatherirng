-- Migration: Add Sales Training Participants to event_rsvps table
-- Menambahkan kolom sederhana untuk menyimpan data peserta sales training
-- Tanggal: 2 September 2025

-- ========================================
-- Kolom untuk Sales Training Participant 1 (WAJIB)
-- ========================================
ALTER TABLE public.event_rsvps 
ADD COLUMN IF NOT EXISTS st_participant_01_name TEXT NOT NULL DEFAULT '';

ALTER TABLE public.event_rsvps 
ADD COLUMN IF NOT EXISTS st_participant_01_phone TEXT NOT NULL DEFAULT '';

ALTER TABLE public.event_rsvps 
ADD COLUMN IF NOT EXISTS st_participant_01_email TEXT NOT NULL DEFAULT '';

ALTER TABLE public.event_rsvps 
ADD COLUMN IF NOT EXISTS st_participant_01_food_preference TEXT NOT NULL DEFAULT '';

-- ========================================
-- Kolom untuk Sales Training Participant 2 (OPSIONAL)
-- ========================================
ALTER TABLE public.event_rsvps 
ADD COLUMN IF NOT EXISTS st_participant_02_name TEXT;

ALTER TABLE public.event_rsvps 
ADD COLUMN IF NOT EXISTS st_participant_02_phone TEXT;

ALTER TABLE public.event_rsvps 
ADD COLUMN IF NOT EXISTS st_participant_02_email TEXT;

ALTER TABLE public.event_rsvps 
ADD COLUMN IF NOT EXISTS st_participant_02_food_preference TEXT;

-- ========================================
-- Constraint untuk validasi food preference
-- ========================================
ALTER TABLE public.event_rsvps 
ADD CONSTRAINT st_participant_01_food_preference_check 
CHECK (st_participant_01_food_preference IN ('Daging', 'Ikan', 'Vegan', ''));

ALTER TABLE public.event_rsvps 
ADD CONSTRAINT st_participant_02_food_preference_check 
CHECK (st_participant_02_food_preference IS NULL OR st_participant_02_food_preference IN ('Daging', 'Ikan', 'Vegan', ''));

-- ========================================
-- Index untuk performa query
-- ========================================
CREATE INDEX IF NOT EXISTS event_rsvps_st_participant_01_name_idx 
ON public.event_rsvps(st_participant_01_name);

CREATE INDEX IF NOT EXISTS event_rsvps_st_participant_01_email_idx 
ON public.event_rsvps(st_participant_01_email);

CREATE INDEX IF NOT EXISTS event_rsvps_st_participant_02_name_idx 
ON public.event_rsvps(st_participant_02_name);

CREATE INDEX IF NOT EXISTS event_rsvps_st_participant_02_email_idx 
ON public.event_rsvps(st_participant_02_email);

-- ========================================
-- Komentar untuk dokumentasi
-- ========================================
COMMENT ON COLUMN public.event_rsvps.st_participant_01_name IS 'Nama peserta 1 sales training (wajib diisi)';
COMMENT ON COLUMN public.event_rsvps.st_participant_01_phone IS 'No. telepon peserta 1 sales training (wajib diisi)';
COMMENT ON COLUMN public.event_rsvps.st_participant_01_email IS 'Email peserta 1 sales training (wajib diisi)';
COMMENT ON COLUMN public.event_rsvps.st_participant_01_food_preference IS 'Preferensi makanan peserta 1: Daging, Ikan, atau Vegan (wajib diisi)';

COMMENT ON COLUMN public.event_rsvps.st_participant_02_name IS 'Nama peserta 2 sales training (opsional)';
COMMENT ON COLUMN public.event_rsvps.st_participant_02_phone IS 'No. telepon peserta 2 sales training (opsional)';
COMMENT ON COLUMN public.event_rsvps.st_participant_02_email IS 'Email peserta 2 sales training (opsional)';
COMMENT ON COLUMN public.event_rsvps.st_participant_02_food_preference IS 'Preferensi makanan peserta 2: Daging, Ikan, atau Vegan (opsional)';

-- ========================================
-- View untuk mempermudah query
-- ========================================
CREATE OR REPLACE VIEW event_rsvps_with_training_participants AS
SELECT 
  r.id,
  r.name as registrant_name,
  r.phone as registrant_phone,
  r.email as registrant_email,
  r.company,
  r.food_preference as registrant_food_preference,
  r.attending,
  r.created_at,
  -- Sales Training Participant 1
  r.st_participant_01_name,
  r.st_participant_01_phone,
  r.st_participant_01_email,
  r.st_participant_01_food_preference,
  -- Sales Training Participant 2  
  r.st_participant_02_name,
  r.st_participant_02_phone,
  r.st_participant_02_email,
  r.st_participant_02_food_preference,
  -- Helper column untuk menghitung total peserta
  CASE 
    WHEN r.st_participant_02_name IS NOT NULL AND TRIM(r.st_participant_02_name) != ''
    THEN 2 
    ELSE 1 
  END as total_training_participants
FROM public.event_rsvps r;

-- Grant permission untuk view
GRANT SELECT ON event_rsvps_with_training_participants TO public;

-- ========================================
-- Function untuk statistik per perusahaan
-- ========================================
CREATE OR REPLACE FUNCTION get_training_participants_count_by_company()
RETURNS TABLE (
  company_name TEXT,
  total_registrants BIGINT,
  total_training_participants BIGINT,
  participant1_count BIGINT,
  participant2_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.company as company_name,
    COUNT(*) as total_registrants,
    COUNT(*) + COUNT(CASE 
      WHEN r.st_participant_02_name IS NOT NULL AND TRIM(r.st_participant_02_name) != ''
      THEN 1 
    END) as total_training_participants,
    COUNT(*) as participant1_count,
    COUNT(CASE 
      WHEN r.st_participant_02_name IS NOT NULL AND TRIM(r.st_participant_02_name) != ''
      THEN 1 
    END) as participant2_count
  FROM public.event_rsvps r
  WHERE r.st_participant_01_name IS NOT NULL AND TRIM(r.st_participant_01_name) != ''
  GROUP BY r.company
  ORDER BY total_training_participants DESC;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- Function untuk daftar semua peserta training
-- ========================================
CREATE OR REPLACE FUNCTION get_all_training_participants()
RETURNS TABLE (
  registration_id UUID,
  registrant_name TEXT,
  registrant_email TEXT,
  company TEXT,
  participant_number INTEGER,
  participant_name TEXT,
  participant_phone TEXT,
  participant_email TEXT,
  participant_food_preference TEXT,
  registration_date TIMESTAMPTZ
) AS $$
BEGIN
  -- Return participant 1 data
  RETURN QUERY
  SELECT 
    r.id as registration_id,
    r.name as registrant_name,
    r.email as registrant_email,
    r.company,
    1 as participant_number,
    r.st_participant_01_name as participant_name,
    r.st_participant_01_phone as participant_phone,
    r.st_participant_01_email as participant_email,
    r.st_participant_01_food_preference as participant_food_preference,
    r.created_at as registration_date
  FROM public.event_rsvps r
  WHERE r.st_participant_01_name IS NOT NULL AND TRIM(r.st_participant_01_name) != ''

  UNION ALL

  -- Return participant 2 data (if exists)
  SELECT 
    r.id as registration_id,
    r.name as registrant_name,
    r.email as registrant_email,
    r.company,
    2 as participant_number,
    r.st_participant_02_name as participant_name,
    r.st_participant_02_phone as participant_phone,
    r.st_participant_02_email as participant_email,
    r.st_participant_02_food_preference as participant_food_preference,
    r.created_at as registration_date
  FROM public.event_rsvps r
  WHERE r.st_participant_02_name IS NOT NULL AND TRIM(r.st_participant_02_name) != ''
  
  ORDER BY registration_date DESC, participant_number;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- Komentar untuk dokumentasi functions
-- ========================================
COMMENT ON FUNCTION get_training_participants_count_by_company() IS 
'Function untuk menghitung jumlah peserta training per perusahaan';

COMMENT ON FUNCTION get_all_training_participants() IS 
'Function untuk mengambil daftar semua peserta training dengan detail lengkap';

-- ========================================
-- Contoh Query yang Bisa Digunakan
-- ========================================
-- 1. Ambil semua data dengan peserta training:
-- SELECT * FROM event_rsvps_with_training_participants;

-- 2. Statistik per perusahaan:
-- SELECT * FROM get_training_participants_count_by_company();

-- 3. Daftar semua peserta training:
-- SELECT * FROM get_all_training_participants();

-- 4. Cari berdasarkan nama peserta:
-- SELECT * FROM event_rsvps 
-- WHERE st_participant_01_name ILIKE '%john%' OR st_participant_02_name ILIKE '%john%';

-- 5. Filter berdasarkan food preference peserta:
-- SELECT * FROM event_rsvps 
-- WHERE st_participant_01_food_preference = 'Vegan' OR st_participant_02_food_preference = 'Vegan';
