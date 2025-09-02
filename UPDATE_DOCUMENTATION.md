# Update: Menambahkan Field Email dan Preferensi Makanan

## Perubahan yang Dibuat

### 1. Database Schema Update

**File Migration**: `add_email_food_preference_migration.sql`
- Menambahkan kolom `email` (TEXT NOT NULL) ke tabel `event_rsvps`
- Menambahkan kolom `food_preference` (TEXT NOT NULL) dengan constraint CHECK untuk nilai: 'Daging', 'Ikan', 'Vegan'
- Menambahkan index untuk performa query pada kedua kolom baru
- Menambahkan komentar dokumentasi untuk kolom baru

**File Schema Update**: `supabase_schema.sql` (diperbarui)
- Schema utama telah diperbarui untuk mencerminkan struktur tabel terbaru

### 2. Frontend Update

**File**: `app/page.tsx`
- **Interface FormState**: Ditambahkan field `email` dan `foodPreference`
- **Form UI**: 
  - Field email ditambahkan di bawah nomor telepon
  - Radio button preferensi makanan ditambahkan di bawah email dengan 3 opsi: Daging, Ikan, Vegan
- **Validasi**: Semua field baru diwajibkan diisi
- **State Management**: Updated untuk menangani field baru

### 3. Backend API Update

**File**: `app/api/rsvp/route.ts`
- Menambahkan validasi untuk field `email` dan `foodPreference`
- Menambahkan validasi khusus untuk memastikan `foodPreference` hanya menerima nilai yang valid
- Updated database insert untuk menyimpan field baru

## Cara Menjalankan Migration

1. Buka Supabase Dashboard untuk project Anda
2. Masuk ke SQL Editor
3. Copy dan jalankan isi file `add_email_food_preference_migration.sql`
4. Atau jika lebih suka, Anda bisa recreate tabel dengan schema baru di `supabase_schema.sql`

## Struktur Tabel Event_RSVPs Setelah Update

```sql
CREATE TABLE public.event_rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,                    -- FIELD BARU
    company TEXT NOT NULL,
    food_preference TEXT NOT NULL           -- FIELD BARU
        CHECK (food_preference IN ('Daging', 'Ikan', 'Vegan')),
    attending BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Form Layout Baru

1. **Nama** (wajib)
2. **Nomor Telepon** (wajib)  
3. **Email** (wajib) - BARU
4. **Preferensi Makanan** (wajib) - BARU (Radio button: Daging/Ikan/Vegan)
5. **Nama Perusahaan** (wajib)
6. **Apakah Anda tertarik untuk hadir?** (wajib)

## Testing

Setelah menjalankan migration, pastikan untuk test:
- [ ] Form validation berjalan dengan benar untuk semua field
- [ ] Data tersimpan dengan benar ke database
- [ ] Email field menerima format email yang valid
- [ ] Food preference hanya menerima opsi yang valid
- [ ] Semua field wajib diisi sebelum form bisa disubmit

## Notes

- Email field menggunakan `inputMode="email"` untuk UX yang lebih baik di mobile
- Preferensi makanan menggunakan radio button (bukan dropdown) untuk kemudahan akses
- Semua field baru bersifat wajib diisi (required)
- Database constraint memastikan data consistency untuk food preference
