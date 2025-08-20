# Migration Guide: Perubahan Bucket Storage

## Perubahan Konfigurasi

Telah dilakukan perubahan lokasi penyimpanan foto dari:

**Sebelum:**
- Bucket: `asus-acp-registration-form-store-photo-submission`
- Folder: root bucket

**Sekarang:**
- Bucket: `asus-pvp-master-media`
- Folder: `asus-acp-registration-form-store-photo-submission`

## Langkah Migration

### 1. Setup Bucket Baru

1. **Buat/Pastikan Bucket Tersedia**
   - Nama bucket: `asus-pvp-master-media`
   - Setting: Public bucket
   - Location: Sesuai region project

2. **Buat Folder di Bucket**
   ```
   asus-pvp-master-media/
   └── asus-acp-registration-form-store-photo-submission/
   ```

### 2. Jalankan Migration SQL

Jalankan file `migration_to_master_media_bucket.sql` di Supabase SQL Editor:

```sql
-- Script ini akan:
-- 1. Hapus policy lama (jika ada)
-- 2. Buat policy baru untuk bucket asus-pvp-master-media
-- 3. Update function cleanup
-- 4. Verifikasi setup
```

### 3. Update Environment (Jika Diperlukan)

Environment variables tetap sama, tidak perlu perubahan:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Testing Setelah Migration

1. **Test Upload Baru**
   ```bash
   npm run dev
   ```
   - Akses form ACP registration
   - Upload foto baru
   - Pastikan tersimpan di `asus-pvp-master-media/asus-acp-registration-form-store-photo-submission/`

2. **Test Akses File**
   - URL format: `https://[project].supabase.co/storage/v1/object/public/asus-pvp-master-media/asus-acp-registration-form-store-photo-submission/[filename]`

## File yang Diupdate

1. ✅ `lib/supabaseStorage.ts` - Default bucket dan folder path
2. ✅ `supabase_storage_policies.sql` - Policy untuk bucket baru
3. ✅ `lib/SupabaseStorageTest.tsx` - Test component
4. ✅ `SUPABASE_STORAGE_SETUP.md` - Documentation update
5. ✅ `TESTING_GUIDE.md` - Testing procedures update
6. ✅ `migration_to_master_media_bucket.sql` - Migration script

## Backward Compatibility

⚠️ **Penting:** File yang sudah diupload ke bucket lama tidak akan otomatis dipindah. 

**Jika ada data existing:**
1. File lama tetap bisa diakses di bucket lama
2. File baru akan disimpan di bucket/folder baru
3. Untuk migration data lama, perlu script terpisah

## Struktur File Baru

```
asus-pvp-master-media/
├── asus-acp-registration-form-store-photo-submission/
│   ├── 1641234567_abc123.jpg
│   ├── 1641234568_def456.png
│   └── ...
└── (folder lain untuk fitur lain jika ada)
```

## Verifikasi Migration

Pastikan hal berikut setelah migration:

- [ ] Bucket `asus-pvp-master-media` ada dan public
- [ ] Folder `asus-acp-registration-form-store-photo-submission` ada
- [ ] Storage policies aktif untuk bucket/folder baru
- [ ] Upload test berhasil ke lokasi baru
- [ ] URL file bisa diakses public
- [ ] Database menyimpan URL yang benar

## Troubleshooting

### Upload Gagal ke Bucket Baru
1. Periksa bucket name dan folder name
2. Periksa storage policies
3. Periksa bucket visibility (harus public)

### File Tidak Bisa Diakses
1. Test URL langsung di browser
2. Periksa CORS settings
3. Periksa policy SELECT

### Error saat Migration SQL
1. Periksa apakah RLS enabled di storage.objects
2. Pastikan sebagai owner/admin project
3. Coba jalankan policy satu per satu
