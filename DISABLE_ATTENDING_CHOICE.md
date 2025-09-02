# Temporary Disable AttendingChoice Field

## Perubahan yang Dibuat

### Field AttendingChoice Dinonaktifkan Sementara

**Status**: TEMPORARILY DISABLED
**Alasan**: Tidak diperlukan untuk sementara waktu
**Kapan akan diaktifkan kembali**: Nanti jika diperlukan

### Perubahan pada Kode

1. **Form UI** (`app/page.tsx`):
   - Komponen `<AttendingChoice>` di-comment dalam form
   - Ditambahkan komentar untuk memudahkan reaktivasi di masa depan

2. **Validasi Form**:
   - Field `attending` tidak lagi divalidasi sebagai required
   - Form akan valid tanpa input attending choice

3. **API Call**:
   - Nilai `attending` diset default ke `true` 
   - Asumsi: semua yang mendaftar otomatis tertarik hadir

4. **Komponen AttendingChoice**:
   - **TETAP ADA** dalam kode untuk keperluan masa depan
   - Ditambahkan komentar dokumentasi
   - Siap digunakan kembali kapan saja

### Cara Mengaktifkan Kembali

Jika suatu saat perlu mengaktifkan kembali field AttendingChoice:

1. **Uncomment komponen dalam form**:
   ```tsx
   // Ubah ini:
   {/* <AttendingChoice value={form.attending} onChange={v => setForm(f => ({ ...f, attending: v }))} /> */}
   
   // Menjadi:
   <AttendingChoice value={form.attending} onChange={v => setForm(f => ({ ...f, attending: v }))} />
   ```

2. **Aktifkan kembali validasi**:
   ```tsx
   // Ubah ini:
   if (!form.name || !form.phone || !form.email || !form.company || !form.foodPreference) {
   
   // Menjadi:
   if (!form.name || !form.phone || !form.email || !form.company || !form.foodPreference || !form.attending) {
   ```

3. **Kembalikan API call**:
   ```tsx
   // Ubah ini:
   attending: true // Default value since AttendingChoice is disabled
   
   // Menjadi:
   attending: form.attending === 'yes'
   ```

### Status Database

- Tabel `event_rsvps` masih memiliki kolom `attending`
- Data yang masuk akan memiliki `attending = true` untuk semua entry baru
- Tidak ada perubahan pada database schema

### Form Fields Aktif Saat Ini

1. **Nama** (wajib)
2. **Nomor Telepon** (wajib)  
3. **Email** (wajib)
4. **Preferensi Makanan** (wajib) - Radio button: Daging/Ikan/Vegan
5. **Nama Perusahaan** (wajib)
6. ~~**Apakah Anda tertarik untuk hadir?**~~ (DISABLED)

Form sekarang lebih sederhana dengan 5 field aktif saja.
