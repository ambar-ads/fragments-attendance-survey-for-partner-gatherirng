# Update: Menambahkan Tabel Peserta Sales Training dan Partner Gathering

## Perubahan yang Dibuat

### 1. Interface FormState Update

Ditambahkan field baru untuk menyimpan data peserta:

```typescript
interface FormState {
  // ... field yang sudah ada
  salesTrainingParticipants: {
    participant1: { name: string; phone: string; email: string; foodPreference: 'Daging' | 'Ikan' | 'Vegan' | ''; };
    participant2: { name: string; phone: string; email: string; foodPreference: 'Daging' | 'Ikan' | 'Vegan' | ''; };
  };
  partnerGatheringParticipants: {
    participant1: { name: string; phone: string; email: string; foodPreference: 'Daging' | 'Ikan' | 'Vegan' | ''; };
  };
}
```

### 2. Komponen Tabel Baru

#### A. SalesTrainingParticipantsTable
- **Nama Field**: "Peserta yang hadir Sales Training"
- **Kolom**: Nama, No. Telepon, Email, Preferensi Makanan
- **Baris**: 
  - Peserta 1 (wajib diisi)
  - Peserta 2 (opsional)

#### B. PartnerGatheringParticipantsTable
- **Nama Field**: "Peserta yang hadir Partner Gathering"
- **Kolom**: Nama, No. Telepon, Email, Preferensi Makanan
- **Baris**: 
  - Peserta 1 (wajib diisi)

### 3. Validasi Form Update

Ditambahkan validasi untuk:
- Sales Training Participant 1 (semua field wajib)
- Partner Gathering Participant 1 (semua field wajib)
- Sales Training Participant 2 (opsional, tidak divalidasi)

### 4. Form Layout Terbaru

1. **Nama** (wajib)
2. **Nomor Telepon** (wajib)  
3. **Email** (wajib)
4. **Preferensi Makanan** (wajib) - Radio button: Daging/Ikan/Vegan
5. **Nama Perusahaan** (wajib)
6. **Peserta Sales Training** (wajib untuk Peserta 1) - BARU
7. **Peserta Partner Gathering** (wajib untuk Peserta 1) - BARU
8. ~~**Apakah Anda tertarik untuk hadir?**~~ (DISABLED)

### 5. Features Tabel

#### Design & UX:
- Responsive table design dengan scroll horizontal pada layar kecil
- Consistent styling dengan tema ASUS
- Clear visual indication untuk field wajib vs opsional
- Input validation dan focus states

#### Functionality:
- Input fields untuk setiap data peserta
- Dropdown untuk preferensi makanan
- Real-time state management
- Form validation terintegrasi

### 6. API Call Update

Data peserta akan dikirim ke backend dalam format:

```json
{
  "name": "...",
  "phone": "...",
  "email": "...",
  "company": "...",
  "foodPreference": "...",
  "attending": true,
  "salesTrainingParticipants": {
    "participant1": { "name": "...", "phone": "...", "email": "...", "foodPreference": "..." },
    "participant2": { "name": "...", "phone": "...", "email": "...", "foodPreference": "..." }
  },
  "partnerGatheringParticipants": {
    "participant1": { "name": "...", "phone": "...", "email": "...", "foodPreference": "..." }
  }
}
```

## Status Database

⚠️ **Database schema belum diupdate** - seperti yang diminta, update tabel Supabase akan dilakukan nanti.

## Testing Checklist

Setelah implementasi, pastikan untuk test:

- [ ] Form validation untuk Peserta 1 Sales Training (wajib)
- [ ] Form validation untuk Peserta 1 Partner Gathering (wajib)  
- [ ] Peserta 2 Sales Training tetap opsional
- [ ] Input fields berfungsi dengan baik di semua kolom
- [ ] Dropdown preferensi makanan berfungsi
- [ ] Data tersimpan dalam state dengan benar
- [ ] Responsive design di mobile devices
- [ ] Focus states dan accessibility
- [ ] Form reset setelah submit berhasil

## Struktur Data Peserta

### Sales Training
- **Peserta 1**: Wajib (name, phone, email, foodPreference)
- **Peserta 2**: Opsional (name, phone, email, foodPreference)

### Partner Gathering  
- **Peserta 1**: Wajib (name, phone, email, foodPreference)

Semua field dalam setiap peserta yang wajib harus diisi lengkap, tidak bisa parsial.
