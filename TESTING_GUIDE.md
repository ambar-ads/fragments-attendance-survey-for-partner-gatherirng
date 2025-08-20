# Testing Supabase Storage Integration

Setelah mengikuti setup di `SUPABASE_STORAGE_SETUP.md`, gunakan panduan ini untuk testing.

## 1. Testing Environment Variables

Pastikan file `.env.local` sudah dibuat dengan nilai yang benar:

```bash
# Test di terminal
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Atau test di browser console (setelah app running):
```javascript
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
```

## 2. Testing Database Connection

Test koneksi database melalui browser console:

```javascript
// Import di component
import { supabase } from '@/lib/supabaseClient';

// Test query
const testDB = async () => {
  const { data, error } = await supabase
    .from('acp_registrations')
    .select('count')
    .limit(1);
  
  console.log('DB Test Result:', { data, error });
};

testDB();
```

## 3. Testing Storage Upload

### Method 1: Test Component

1. Import dan gunakan `SupabaseStorageTest` component:

```tsx
import SupabaseStorageTest from '@/lib/SupabaseStorageTest';

// Di dalam page component
<SupabaseStorageTest />
```

2. Buka browser, pilih image file, dan klik "Upload Test"
3. Periksa console untuk log detail
4. Jika berhasil, image akan muncul dalam preview

### Method 2: Manual Test via Browser Console

```javascript
// Test upload via console
import { uploadFileToStorage } from '@/lib/supabaseStorage';

const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'image/*';
fileInput.onchange = async (e) => {
  const file = e.target.files[0];
  const result = await uploadFileToStorage(
    file, 
    'asus-pvp-master-media', 
    'asus-acp-registration-form-store-photo-submission'
  );
  console.log('Upload result:', result);
};
fileInput.click();
```

## 4. Testing Bucket Access

Test apakah bucket bisa diakses:

```javascript
import { supabase } from '@/lib/supabaseClient';

const testBucket = async () => {
  const { data, error } = await supabase.storage
    .from('asus-pvp-master-media')
    .list('asus-acp-registration-form-store-photo-submission', { limit: 1 });
  
  console.log('Bucket test:', { data, error });
};

testBucket();
```

## 5. Testing Form Integration

1. Jalankan aplikasi: `npm run dev`
2. Buka: `http://localhost:3000/acp-registration`
3. Scroll ke bagian "Upload Photo of the Store"
4. Pilih image file
5. Periksa apakah:
   - File berhasil diupload (spinner muncul)
   - Preview image muncul
   - Status "✓ Uploaded" muncul
6. Submit form dan periksa database apakah `store_photo_url` tersimpan

## Expected Results

### ✅ Success Indicators

- Upload function return: `{ success: true, data: { path, fullPath, publicUrl } }`
- Image preview muncul setelah upload
- Public URL bisa diakses langsung di browser
- Database record menyimpan `store_photo_url` dengan benar
- No console errors

### ❌ Common Issues & Solutions

#### Issue: CORS Error
```
Access to fetch at 'https://xxx.supabase.co' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution:**
1. Buka Supabase Dashboard → Settings → API
2. Scroll ke CORS section
3. Add `http://localhost:3000` untuk development

#### Issue: 403 Forbidden
```
{ success: false, error: "Upload failed: new row violates row-level security policy" }
```

**Solution:**
1. Pastikan storage policies sudah dijalankan
2. Jalankan file `supabase_storage_policies.sql`
3. Periksa bucket setting (harus public)

#### Issue: File not found / 404
```
{ success: false, error: "Upload failed: Bucket not found" }
```

**Solution:**
1. Periksa nama bucket: `asus-pvp-master-media`
2. Periksa nama folder: `asus-acp-registration-form-store-photo-submission`
3. Buat bucket/folder baru jika belum ada
4. Set bucket visibility menjadi public

#### Issue: Database error saat save
```
column "store_photo_url" of relation "acp_registrations" does not exist
```

**Solution:**
1. Jalankan migration: `add_store_photo_url_migration.sql`
2. Restart aplikasi

## Manual Verification Checklist

- [ ] Environment variables loaded correctly
- [ ] Database connection working
- [ ] Storage bucket accessible
- [ ] Upload function working
- [ ] File URL accessible publicly
- [ ] Database saves photo URL correctly
- [ ] Form validation working
- [ ] File size/type validation working
- [ ] Preview showing correctly
- [ ] Error handling working

## Production Testing

Untuk production environment:

1. Update CORS settings dengan domain production
2. Test dengan real production URLs
3. Verify SSL certificates
4. Test file size limits
5. Test different file formats
6. Test upload under load
