# Setup Supabase Storage untuk Upload Foto Toko

Panduan ini akan membantu Anda mengatur Supabase Storage untuk fitur upload foto toko pada formulir pendaftaran ASUS Commercial Partner (ACP).

## Prerequisites

1. Akun Supabase yang sudah dibuat
2. Project Supabase yang sudah disetup
3. Storage bucket yang sudah dibuat dengan nama: `asus-pvp-master-media`
4. Folder di dalam bucket: `asus-acp-registration-form-store-photo-submission`

## Langkah-langkah Setup

### 1. Setup Environment Variables

Buat file `.env.local` di root project dan tambahkan konfigurasi Supabase:

```bash
cp .env.example .env.local
```

Edit `.env.local` dan isi dengan nilai dari dashboard Supabase Anda:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Cara mendapatkan keys:**
1. Buka dashboard Supabase project Anda
2. Pergi ke Settings → API
3. Copy URL project, anon key, dan service role key

### 2. Setup Database Schema

Jalankan script SQL berikut di Supabase SQL Editor:

#### a. Schema Utama (jika belum ada)
```sql
-- Jalankan file acp_schema.sql terlebih dahulu
-- File ini berisi struktur tabel utama
```

#### b. Migration untuk Kolom Photo URL
```sql
-- Jalankan file add_store_photo_url_migration.sql
-- File ini menambahkan kolom store_photo_url ke tabel acp_registrations
```

### 3. Setup Supabase Storage

#### a. Buat Storage Bucket

1. Buka dashboard Supabase project Anda
2. Pergi ke Storage
3. Klik "Create a new bucket" (jika belum ada)
4. Nama bucket: `asus-pvp-master-media`
5. Set bucket sebagai **Public** (agar foto bisa diakses publik)

#### b. Buat Folder di Bucket

1. Buka bucket `asus-pvp-master-media`
2. Klik "Create folder"
3. Nama folder: `asus-acp-registration-form-store-photo-submission`

#### c. Setup Storage Policies

Jalankan SQL berikut di SQL Editor untuk mengatur policy storage:

```sql
-- Policy untuk upload file ke folder ACP (public bisa upload)
CREATE POLICY "Allow public ACP photo uploads" ON storage.objects
FOR INSERT TO public
WITH CHECK (
    bucket_id = 'asus-pvp-master-media' 
    AND (storage.foldername(name))[1] = 'asus-acp-registration-form-store-photo-submission'
);

-- Policy untuk read file dari folder ACP (semua orang bisa baca)
CREATE POLICY "Allow public ACP photo access" ON storage.objects
FOR SELECT TO public
USING (
    bucket_id = 'asus-pvp-master-media'
    AND (storage.foldername(name))[1] = 'asus-acp-registration-form-store-photo-submission'
);
```

### 4. Setup CORS (jika diperlukan)

Jika mengalami CORS error, tambahkan domain Anda ke CORS settings:

1. Pergi ke Settings → API
2. Scroll ke bagian CORS
3. Tambahkan domain Anda (misalnya: `http://localhost:3000` untuk development)

### 5. Testing Setup

Untuk memastikan setup berjalan dengan baik:

1. Jalankan aplikasi: `npm run dev`
2. Buka halaman ACP registration
3. Coba upload foto di bagian "Upload Photo of the Store"
4. Periksa apakah foto berhasil diupload ke bucket Supabase
5. Periksa apakah URL foto tersimpan di database

## Struktur File Upload

Foto yang diupload akan disimpan dengan struktur berikut:

```
bucket: asus-pvp-master-media/
└── asus-acp-registration-form-store-photo-submission/
    ├── 1641234567_abc123.jpg
    ├── 1641234568_def456.png
    └── ...
```

**Nama file format:**
- `{timestamp}_{random_string}.{extension}`
- Contoh: `1641234567_abc123.jpg`

## Konfigurasi Storage

### File Size Limit
- Maximum: 5MB per file
- Format yang didukung: JPG, JPEG, PNG

### Security
- File diupload ke bucket public
- URL yang dihasilkan bisa diakses langsung
- Tidak ada enkripsi tambahan

## Troubleshooting

### Problem: CORS Error
**Solution:** 
1. Pastikan domain sudah ditambahkan ke CORS settings
2. Untuk development, tambahkan `http://localhost:3000`

### Problem: Upload Gagal dengan Error 403
**Solution:**
1. Periksa policy storage bucket
2. Pastikan bucket setting adalah public
3. Periksa apakah anon key sudah benar

### Problem: File Tidak Muncul di Preview
**Solution:**
1. Periksa apakah URL yang direturn valid
2. Test URL langsung di browser
3. Periksa network tab untuk error CORS

### Problem: Database Error saat Simpan URL
**Solution:**
1. Pastikan migration `add_store_photo_url_migration.sql` sudah dijalankan
2. Periksa apakah kolom `store_photo_url` sudah ada di tabel
3. Periksa service role key di environment variables

## API Endpoints yang Terpengaruh

- `POST /api/acp-registration` - Updated untuk menerima `photoUrl`

## Files yang Dimodifikasi

1. `lib/supabaseStorage.ts` - Utility functions untuk storage
2. `app/acp-registration/page.tsx` - Form dengan upload functionality
3. `app/api/acp-registration/route.ts` - API untuk simpan data dengan photo URL
4. `acp_schema.sql` - Schema database utama
5. `add_store_photo_url_migration.sql` - Migration untuk kolom photo

## Security Notes

⚠️ **Penting:**
1. Jangan pernah commit file `.env.local` ke repository
2. Service Role Key hanya untuk server-side, jangan expose ke client
3. Gunakan RLS (Row Level Security) untuk data sensitif
4. Pertimbangkan untuk add virus scanning untuk file upload di production

## Production Checklist

- [ ] Environment variables sudah diset di hosting platform
- [ ] Database migration sudah dijalankan
- [ ] Storage bucket sudah dibuat dan dikonfigurasi
- [ ] CORS sudah dikonfigurasi untuk domain production
- [ ] File size limits sudah sesuai kebutuhan
- [ ] Monitoring dan logging sudah disetup
