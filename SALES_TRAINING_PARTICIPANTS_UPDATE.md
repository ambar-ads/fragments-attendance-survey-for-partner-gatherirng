# Sales Training Participants Database Update (Simple Column Approach)

## Ringkasan Perubahan

Pembaruan database untuk menampung data "Peserta yang hadir Sales Training" pada tabel `event_rsvps` dengan pendekatan kolom terpisah yang sederhana.

## Perubahan Database

### 1. Kolom-Kolom Baru untuk Sales Training Participants

#### Sales Training Participant 1 (WAJIB):
- `st_participant_01_name` (TEXT NOT NULL) - Nama peserta 1
- `st_participant_01_phone` (TEXT NOT NULL) - No. telepon peserta 1  
- `st_participant_01_email` (TEXT NOT NULL) - Email peserta 1
- `st_participant_01_food_preference` (TEXT NOT NULL) - Preferensi makanan peserta 1

#### Sales Training Participant 2 (OPSIONAL):
- `st_participant_02_name` (TEXT) - Nama peserta 2
- `st_participant_02_phone` (TEXT) - No. telepon peserta 2
- `st_participant_02_email` (TEXT) - Email peserta 2
- `st_participant_02_food_preference` (TEXT) - Preferensi makanan peserta 2

### 2. Constraints dan Validasi

- **Food Preference Constraint:** Memastikan nilai hanya "Daging", "Ikan", "Vegan", atau "" (kosong)
- **Default Values:** Participant 1 fields memiliki default empty string
- **Nullable:** Participant 2 fields dapat NULL

### 3. Index Database

- Index pada `st_participant_01_name` dan `st_participant_01_email`
- Index pada `st_participant_02_name` dan `st_participant_02_email`

### 4. View dan Functions

#### View: `event_rsvps_with_training_participants`
Mempermudah query data dengan format yang flat dan mudah dibaca:
```sql
SELECT * FROM event_rsvps_with_training_participants;
```

#### Function: `get_training_participants_count_by_company()`
Menghitung jumlah peserta training per perusahaan:
```sql
SELECT * FROM get_training_participants_count_by_company();
```

#### Function: `get_all_training_participants()`
Mengambil daftar semua peserta training:
```sql
SELECT * FROM get_all_training_participants();
```

## Perubahan API

### Endpoint: `/api/rsvp` (POST)

**Request Body:**
```json
{
  "name": "string",
  "phone": "string", 
  "email": "string",
  "company": "string",
  "foodPreference": "Daging|Ikan|Vegan",
  "attending": boolean,
  "salesTrainingParticipants": {
    "participant1": {
      "name": "string",
      "phone": "string",
      "email": "string", 
      "foodPreference": "Daging|Ikan|Vegan"
    },
    "participant2": {
      "name": "string",
      "phone": "string",
      "email": "string",
      "foodPreference": "Daging|Ikan|Vegan"
    }
  }
}
```

**Database Mapping:**
- `salesTrainingParticipants.participant1.name` → `st_participant_01_name`
- `salesTrainingParticipants.participant1.phone` → `st_participant_01_phone`
- `salesTrainingParticipants.participant1.email` → `st_participant_01_email`
- `salesTrainingParticipants.participant1.foodPreference` → `st_participant_01_food_preference`
- `salesTrainingParticipants.participant2.name` → `st_participant_02_name`
- `salesTrainingParticipants.participant2.phone` → `st_participant_02_phone`
- `salesTrainingParticipants.participant2.email` → `st_participant_02_email`
- `salesTrainingParticipants.participant2.foodPreference` → `st_participant_02_food_preference`

### Validasi API

1. **salesTrainingParticipants** harus ada
2. **participant1** harus lengkap (name, phone, email, foodPreference)
3. **participant2** opsional, tapi jika diisi harus lengkap
4. **foodPreference** harus salah satu dari: "Daging", "Ikan", "Vegan"

## Cara Menjalankan Migration

### 1. Jalankan Migration SQL

```sql
-- Jalankan file: add_sales_training_participants_migration.sql
-- di Supabase SQL Editor atau psql
```

### 2. Deploy API Changes

API sudah diupdate untuk memetakan data dari frontend ke kolom database yang baru.

### 3. Testing

**Contoh Request untuk Testing:**
```bash
curl -X POST http://localhost:3000/api/rsvp \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "08123456789",
    "email": "john@company.com", 
    "company": "PT Test Company",
    "foodPreference": "Daging",
    "attending": true,
    "salesTrainingParticipants": {
      "participant1": {
        "name": "Alice Smith",
        "phone": "08111111111",
        "email": "alice@company.com",
        "foodPreference": "Vegan"
      },
      "participant2": {
        "name": "Bob Johnson", 
        "phone": "08222222222",
        "email": "bob@company.com",
        "foodPreference": "Ikan"
      }
    }
  }'
```

## Query Examples

### 1. Ambil Semua Data dengan Peserta Training
```sql
SELECT * FROM event_rsvps_with_training_participants;
```

### 2. Hitung Peserta Training per Perusahaan
```sql
SELECT * FROM get_training_participants_count_by_company();
```

### 3. Daftar Semua Peserta Training
```sql
SELECT * FROM get_all_training_participants();
```

### 4. Cari Berdasarkan Nama Peserta
```sql
SELECT * FROM event_rsvps 
WHERE st_participant_01_name ILIKE '%alice%'
   OR st_participant_02_name ILIKE '%alice%';
```

### 5. Filter Berdasarkan Food Preference Peserta
```sql
SELECT * FROM event_rsvps 
WHERE st_participant_01_food_preference = 'Vegan'
   OR st_participant_02_food_preference = 'Vegan';
```

### 6. Query Raw Data dengan Peserta Training
```sql
SELECT 
  name, company,
  st_participant_01_name, st_participant_01_email, st_participant_01_food_preference,
  st_participant_02_name, st_participant_02_email, st_participant_02_food_preference
FROM event_rsvps 
WHERE st_participant_01_name IS NOT NULL AND st_participant_01_name != '';
```

## Keuntungan Pendekatan Sederhana

### ✅ Kelebihan:
- **Simple & Clear:** Kolom terpisah mudah dipahami dan di-maintain
- **Fast Queries:** Index langsung pada kolom, tidak perlu parsing JSON
- **Easy Reporting:** Dapat langsung digunakan di tools BI/reporting
- **Type Safety:** PostgreSQL native types dengan validasi yang jelas
- **Backward Compatible:** Data lama tetap valid
- **No JSON Complexity:** Tidak perlu menguasai JSON operators

### 📊 Struktur Database Final:
```sql
-- Kolom existing
id, name, phone, email, company, food_preference, attending, created_at

-- Kolom baru untuk Sales Training
st_participant_01_name, st_participant_01_phone, st_participant_01_email, st_participant_01_food_preference
st_participant_02_name, st_participant_02_phone, st_participant_02_email, st_participant_02_food_preference
```

## Files yang Diubah

1. `add_sales_training_participants_migration.sql` - Migration script (simplified)
2. `app/api/rsvp/route.ts` - API endpoint update (direct column mapping)
3. `test_sales_training_participants.sql` - Testing script (updated)
4. `SALES_TRAINING_PARTICIPANTS_UPDATE.md` - Dokumentasi ini

## Next Steps

1. Jalankan migration di Supabase
2. Test API endpoint dengan data baru
3. Verifikasi data tersimpan dengan benar menggunakan query sederhana
4. Monitor untuk error atau issues

Migration ini menggunakan pendekatan yang lebih sederhana dan mudah di-maintain dibandingkan dengan JSON/JSONB approach!
