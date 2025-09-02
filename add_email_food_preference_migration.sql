-- Migration untuk menambahkan field email dan food_preference ke tabel event_rsvps
-- Jalankan di SQL editor Supabase Anda

-- Tambahkan kolom email (wajib)
ALTER TABLE public.event_rsvps 
ADD COLUMN email TEXT NOT NULL DEFAULT '';

-- Tambahkan kolom food_preference (wajib) dengan nilai enum
ALTER TABLE public.event_rsvps 
ADD COLUMN food_preference TEXT NOT NULL DEFAULT 'Daging' 
CHECK (food_preference IN ('Daging', 'Ikan', 'Vegan'));

-- Hapus default value setelah kolom ditambahkan (untuk memastikan field wajib di form)
ALTER TABLE public.event_rsvps 
ALTER COLUMN email DROP DEFAULT;

ALTER TABLE public.event_rsvps 
ALTER COLUMN food_preference DROP DEFAULT;

-- Index untuk pencarian berdasarkan email dan food preference
CREATE INDEX IF NOT EXISTS event_rsvps_email_idx ON public.event_rsvps(email);
CREATE INDEX IF NOT EXISTS event_rsvps_food_preference_idx ON public.event_rsvps(food_preference);

-- Komentar untuk dokumentasi
COMMENT ON COLUMN public.event_rsvps.email IS 'Email peserta acara (wajib diisi)';
COMMENT ON COLUMN public.event_rsvps.food_preference IS 'Preferensi makanan peserta: Daging, Ikan, atau Vegan (wajib diisi)';
