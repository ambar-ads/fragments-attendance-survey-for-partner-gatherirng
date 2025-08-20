"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import Head from 'next/head';
import { uploadFileToStorage } from '@/lib/supabaseStorage';

interface ContactInfo {
  type: string;
  name: string;
  mobilePhone: string;
  email: string;
  whatsappNo: string;
}

interface ACPFormState {
  acpName: string;
  acpAddress: string;
  city: string;
  state: string;
  postCode: string;
  telephoneNo: string;
  faxNo: string;
  photo: File | null;
  photoUrl?: string; // URL foto yang sudah diupload ke Supabase Storage
  idCardNo: string;
  taxId: string;
  sbnNib: string;
  pkp: string;
  contacts: ContactInfo[];
  agreement: boolean;
}

const initialContactInfo: ContactInfo = {
  type: '',
  name: '',
  mobilePhone: '',
  email: '',
  whatsappNo: ''
};

export default function ACPRegistration() {
  const [form, setForm] = useState<ACPFormState>({
    acpName: '',
    acpAddress: '',
    city: '',
    state: '',
    postCode: '',
    telephoneNo: '',
    faxNo: '',
    photo: null,
    photoUrl: undefined,
    idCardNo: '',
    taxId: '',
    sbnNib: '',
    pkp: '',
    contacts: [
      { ...initialContactInfo, type: 'Owner' },
      { ...initialContactInfo, type: 'Contact 1' },
      { ...initialContactInfo, type: 'Contact 2' },
      { ...initialContactInfo, type: 'Contact 3' }
    ],
    agreement: false
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof ACPFormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleContactChange = (index: number, field: keyof ContactInfo, value: string) => {
    setForm(prev => ({
      ...prev,
      contacts: prev.contacts.map((contact, i) => 
        i === index ? { ...contact, [field]: value } : contact
      )
    }));
  };

  const handleAgreementChange = (checked: boolean) => {
    setForm(prev => ({ ...prev, agreement: checked }));
  };

  const handlePhotoChange = (file: File | null) => {
    setForm(prev => ({ ...prev, photo: file }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validasi required fields
    if (!form.acpName || !form.acpAddress || !form.city || !form.state || !form.postCode || !form.telephoneNo) {
      setError('Mohon lengkapi semua field yang wajib diisi.');
      return;
    }

    // Validasi owner contact (index 0)
    const ownerContact = form.contacts[0];
    if (!ownerContact.name || !ownerContact.mobilePhone || !ownerContact.email || !ownerContact.whatsappNo) {
      setError('Mohon lengkapi semua field Owner di Contact Information.');
      return;
    }

    if (!form.agreement) {
      setError('Anda harus menyetujui untuk bergabung dengan ASUS Commercial Partner.');
      return;
    }

    setLoading(true);
    try {
      let photoUrl = form.photoUrl;

      // Upload foto jika ada
      if (form.photo && !form.photoUrl) {
        const uploadResult = await uploadFileToStorage(form.photo);
        
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Gagal mengupload foto');
        }
        
        photoUrl = uploadResult.data?.publicUrl;
      }

      const res = await fetch('/api/acp-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          photoUrl
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengirim data');
      
      setSuccess(true);
      // Reset form
      setForm({
        acpName: '',
        acpAddress: '',
        city: '',
        state: '',
        postCode: '',
        telephoneNo: '',
        faxNo: '',
        photo: null,
        photoUrl: undefined,
        idCardNo: '',
        taxId: '',
        sbnNib: '',
        pkp: '',
        contacts: [
          { ...initialContactInfo, type: 'Owner' },
          { ...initialContactInfo, type: 'Contact 1' },
          { ...initialContactInfo, type: 'Contact 2' },
          { ...initialContactInfo, type: 'Contact 3' }
        ],
        agreement: false
      });
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message); 
      else setError('Terjadi kesalahan tak terduga');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Head>
        <title>ASUS | ACP Program Registration</title>
        <meta name="description" content="ASUS Commercial Partner (ACP) Program Registration Form" />
      </Head>
      <Header />
      <main className="flex-1 flex items-start justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-asus-primary flex items-center gap-3">
              <span className="inline-block h-9 w-1.5 bg-asus-accent rounded-full" />
              ASUS Commercial Partner Program (System Products)
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              Formulir pendaftaran resmi untuk bergabung dengan program ASUS Commercial Partner (ACP) Program. 
              Mohon isi dengan data yang valid dan lengkap.
            </p>
            <div className="mt-4 space-y-3">
              <ACPTnCAccordion />
              <ACPProgramInfoAccordion />
            </div>
          </div>

          <form onSubmit={submit} className="relative bg-white border border-neutral-200/80 rounded-xl shadow-sm overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-asus-primary via-asus-accent to-asus-primary" />
            <div className="p-6 sm:p-8 space-y-8">
              
              {/* Company Information Section */}
              <section className="space-y-6">
                <h2 className="text-lg font-medium text-neutral-800 border-b border-neutral-200 pb-2">
                  Company Information
                </h2>
                
                <Field 
                  label="ACP Name" 
                  value={form.acpName} 
                  onChange={(value) => handleInputChange('acpName', value)}
                  placeholder="Nama perusahaan, contoh: PT Laskar Cahaya Abadi"
                  required
                />

                <Field 
                  label="ACP Address" 
                  value={form.acpAddress} 
                  onChange={(value) => handleInputChange('acpAddress', value)}
                  placeholder="Alamat jalan"
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field 
                    label="City" 
                    value={form.city} 
                    onChange={(value) => handleInputChange('city', value)}
                    placeholder="Kota"
                    required
                  />
                  <Field 
                    label="Province" 
                    value={form.state} 
                    onChange={(value) => handleInputChange('state', value)}
                    placeholder="Provinsi"
                    required
                  />
                  <Field 
                    label="Post Code" 
                    value={form.postCode} 
                    onChange={(value) => handleInputChange('postCode', value)}
                    placeholder="Kode pos"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field 
                    label="ACP Telephone No." 
                    value={form.telephoneNo} 
                    onChange={(value) => handleInputChange('telephoneNo', value)}
                    placeholder="Nomor telepon"
                    inputMode="tel"
                    required
                  />
                  <Field 
                    label="ACP Fax No." 
                    value={form.faxNo} 
                    onChange={(value) => handleInputChange('faxNo', value)}
                    placeholder="Nomor fax"
                    inputMode="tel"
                  />
                </div>

                <PhotoUploadField 
                  label="Upload Photo of the Store" 
                  value={form.photo} 
                  onChange={handlePhotoChange}
                  photoUrl={form.photoUrl}
                  onPhotoUrlChange={(url) => setForm(prev => ({ ...prev, photoUrl: url }))}
                  required
                />
              </section>

              {/* Legal Information Section */}
              <section className="space-y-6">
                <h2 className="text-lg font-medium text-neutral-800 border-b border-neutral-200 pb-2">
                  Legal Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field 
                    label="ID Card No / KTP" 
                    value={form.idCardNo} 
                    onChange={(value) => handleInputChange('idCardNo', value)}
                    placeholder="Nomor KTP Owner"
                    required
                  />
                  <Field 
                    label="Tax ID / NPWP" 
                    value={form.taxId} 
                    onChange={(value) => handleInputChange('taxId', value)}
                    placeholder="Nomor NPWP"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field 
                    label="SBN / NIB" 
                    value={form.sbnNib} 
                    onChange={(value) => handleInputChange('sbnNib', value)}
                    placeholder="Nomor NIB"
                  />
                  <Field 
                    label="PKP" 
                    value={form.pkp} 
                    onChange={(value) => handleInputChange('pkp', value)}
                    placeholder="Nomor PKP"
                  />
                </div>
              </section>

              {/* Contact Information Section */}
              <section className="space-y-6">
                <h2 className="text-lg font-medium text-neutral-800 border-b border-neutral-200 pb-2">
                  Contact Information
                </h2>
                
                <div className="overflow-x-auto table-wrapper">
                  <table className="min-w-full border border-neutral-300 form-table">
                    <thead>
                      <tr className="bg-neutral-50">
                        <th className="border border-neutral-300 px-3 py-3 text-left text-xs sm:text-sm font-medium text-neutral-700 min-w-[100px]">
                          Type of Contact
                        </th>
                        <th className="border border-neutral-300 px-3 py-3 text-left text-xs sm:text-sm font-medium text-neutral-700 min-w-[120px]">
                          Name
                        </th>
                        <th className="border border-neutral-300 px-3 py-3 text-left text-xs sm:text-sm font-medium text-neutral-700 min-w-[120px]">
                          Mobile Phone
                        </th>
                        <th className="border border-neutral-300 px-3 py-3 text-left text-xs sm:text-sm font-medium text-neutral-700 min-w-[150px]">
                          Email Address
                        </th>
                        <th className="border border-neutral-300 px-3 py-3 text-left text-xs sm:text-sm font-medium text-neutral-700 min-w-[120px]">
                          WhatsApp No.
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.contacts.map((contact, index) => (
                        <tr key={index}>
                          <td className="border border-neutral-300 px-3 py-3 bg-neutral-50 font-medium text-xs sm:text-sm text-neutral-700">
                            {contact.type}
                            {index === 0 && (
                              <span className="text-red-600" aria-hidden> *</span>
                            )}
                          </td>
                          <td className="border border-neutral-300 px-2 py-2">
                            <input
                              type="text"
                              value={contact.name}
                              onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                              className="w-full min-w-[100px] border-0 bg-transparent px-2 py-1 text-xs sm:text-sm text-neutral-800 focus:ring-2 focus:ring-asus-primary/25 rounded placeholder:text-neutral-500"
                              placeholder="Nama"
                              required={index === 0}
                            />
                          </td>
                          <td className="border border-neutral-300 px-2 py-2">
                            <input
                              type="tel"
                              value={contact.mobilePhone}
                              onChange={(e) => handleContactChange(index, 'mobilePhone', e.target.value)}
                              className="w-full min-w-[100px] border-0 bg-transparent px-2 py-1 text-xs sm:text-sm text-neutral-800 focus:ring-2 focus:ring-asus-primary/25 rounded placeholder:text-neutral-500"
                              placeholder="08xxxxxxxxxx"
                              required={index === 0}
                            />
                          </td>
                          <td className="border border-neutral-300 px-2 py-2">
                            <input
                              type="email"
                              value={contact.email}
                              onChange={(e) => handleContactChange(index, 'email', e.target.value)}
                              className="w-full min-w-[120px] border-0 bg-transparent px-2 py-1 text-xs sm:text-sm text-neutral-800 focus:ring-2 focus:ring-asus-primary/25 rounded placeholder:text-neutral-500"
                              placeholder="email@domain.com"
                              required={index === 0}
                            />
                          </td>
                          <td className="border border-neutral-300 px-2 py-2">
                            <input
                              type="tel"
                              value={contact.whatsappNo}
                              onChange={(e) => handleContactChange(index, 'whatsappNo', e.target.value)}
                              className="w-full min-w-[100px] border-0 bg-transparent px-2 py-1 text-xs sm:text-sm text-neutral-800 focus:ring-2 focus:ring-asus-primary/25 rounded placeholder:text-neutral-500"
                              placeholder="08xxxxxxxxxx"
                              required={index === 0}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Agreement Section */}
              <section className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                  <input
                    type="checkbox"
                    id="agreement"
                    checked={form.agreement}
                    onChange={(e) => handleAgreementChange(e.target.checked)}
                    className="mt-0.5 h-4 w-4 text-asus-primary border-neutral-300 rounded focus:ring-asus-primary/25 focus:ring-2"
                    required
                  />
                  <label htmlFor="agreement" className="text-sm text-neutral-700 leading-relaxed">
                    <span className="font-medium">
                      <span className="text-red-600" aria-hidden>* </span>
                      Saya setuju untuk bergabung dengan ASUS Commercial Partner
                    </span>
                    <br />
                    <span className="text-neutral-600">
                      Dengan mencentang kotak ini, saya menyatakan bahwa informasi yang diberikan adalah benar dan akurat, 
                      serta menyetujui syarat dan ketentuan program ASUS Commercial Partner.
                    </span>
                  </label>
                </div>
              </section>

              {/* Error and Success Messages */}
              {error && <Alert tone="error" message={error} />}
              {success && <Alert tone="success" message="Terima kasih. Pendaftaran ACP Anda telah berhasil dikirim dan akan diproses oleh tim kami." />}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full justify-center items-center gap-2 rounded-lg bg-asus-primary px-5 h-12 text-sm font-medium tracking-wide text-white shadow-sm disabled:opacity-60 disabled:cursor-not-allowed hover:bg-asus-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-asus-primary/30 transition-colors"
                >
                  {loading ? 'Mengirim…' : 'Kirim Pendaftaran ACP'}
                </button>
                <p className="mt-3 text-[11px] leading-relaxed text-neutral-500">
                  Data yang Anda kirimkan akan digunakan untuk proses verifikasi dan pendaftaran program ASUS Commercial Partner. 
                  Informasi ini akan dijaga kerahasiaannya sesuai dengan kebijakan privasi ASUS.
                </p>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  required?: boolean;
}

function Field({ label, value, onChange, placeholder, inputMode, required = false }: FieldProps) {
  const id = `field-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-neutral-700">
        {label} 
        {required && (
          <>
            <span className="text-red-600" aria-hidden> *</span>
            <span className="sr-only">(wajib)</span>
          </>
        )}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        required={required}
        aria-required={required}
        className="block w-full rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-800 shadow-inner focus:border-asus-primary focus:ring-4 focus:ring-asus-primary/25 outline-none transition"
      />
    </div>
  );
}

interface PhotoUploadFieldProps {
  label: string;
  value: File | null;
  onChange: (file: File | null) => void;
  photoUrl?: string;
  onPhotoUrlChange?: (url: string | undefined) => void;
  required?: boolean;
}

function PhotoUploadField({ label, value, onChange, photoUrl, onPhotoUrlChange, required = false }: PhotoUploadFieldProps) {
  const id = `field-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const [uploading, setUploading] = useState(false);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Format file tidak didukung. Silakan pilih file JPG, JPEG, atau PNG.');
        return;
      }
      
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        alert('Ukuran file terlalu besar. Maksimal 5MB.');
        return;
      }

      // Set file to state
      onChange(file);

      // Upload file langsung ke Supabase Storage
      setUploading(true);
      try {
        const uploadResult = await uploadFileToStorage(file);
        
        if (uploadResult.success && uploadResult.data) {
          onPhotoUrlChange?.(uploadResult.data.publicUrl);
        } else {
          alert(uploadResult.error || 'Gagal mengupload foto');
          onChange(null);
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('Gagal mengupload foto');
        onChange(null);
      } finally {
        setUploading(false);
      }
    } else {
      onChange(null);
      onPhotoUrlChange?.(undefined);
    }
  };

  const handleRemove = () => {
    onChange(null);
    onPhotoUrlChange?.(undefined);
    const input = document.getElementById(id) as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-neutral-700">
        {label} 
        {required && (
          <>
            <span className="text-red-600" aria-hidden> *</span>
            <span className="sr-only">(wajib)</span>
          </>
        )}
      </label>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => document.getElementById(id)?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-asus-primary border border-transparent rounded-md shadow-sm hover:bg-asus-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-asus-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Choose File
              </>
            )}
          </button>
          <span className="text-sm text-neutral-600">
            {value ? value.name : 'No file chosen'}
          </span>
        </div>
        
        <input
          id={id}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileChange}
          required={required}
          aria-required={required}
          className="hidden"
          disabled={uploading}
        />
        
        {/* Show uploaded image preview */}
        {photoUrl && (
          <div className="mt-3">
            <p className="text-sm font-medium text-neutral-700 mb-2">Preview:</p>
            <div className="relative inline-block">
              <img 
                src={photoUrl} 
                alt="Store photo preview" 
                className="h-32 w-auto object-cover rounded-lg border border-neutral-200 shadow-sm"
              />
            </div>
          </div>
        )}
        
        {(value || photoUrl) && (
          <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-md border border-neutral-200">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-asus-primary/10 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-asus-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-700">
                  {value ? value.name : 'Uploaded photo'}
                  {photoUrl && (
                    <span className="ml-2 text-xs text-green-600 font-medium">✓ Uploaded</span>
                  )}
                </p>
                {value && (
                  <p className="text-xs text-neutral-500">{(value.size / 1024 / 1024).toFixed(2)} MB</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Hapus
            </button>
          </div>
        )}
        <p className="text-xs text-neutral-500">
          Supported format: JPG, JPEG, PNG. Maximum 5MB. File akan otomatis diupload ke server.
        </p>
      </div>
    </div>
  );
}

function Alert({ tone, message }: { tone: 'error' | 'success'; message: string; }) {
  const styles = tone === 'error'
    ? 'border-red-300 bg-red-50 text-red-700'
    : 'border-emerald-300 bg-emerald-50 text-emerald-700';
  return (
    <div className={`text-sm rounded-md border px-4 py-2 ${styles}`}>{message}</div>
  );
}

function Header() {
  return (
    <header className="bg-white border-b border-neutral-200/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        <a href="/" className="flex items-center gap-8 group" aria-label="ASUS ACP Registration Home">
          <Image
            src="/ASUS_Logo.svg"
            alt="ASUS Logo"
            width={90}
            height={20}
            priority
            className="h-6 w-auto transition-opacity group-hover:opacity-90"
          />
          <span className="hidden sm:inline-block text-base font-semibold tracking-tight text-neutral-700 group-hover:text-neutral-900">
            ASUS Commercial Partner (ACP) Program Registration
          </span>
        </a>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-neutral-200/80 bg-white/60 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 text-sm text-neutral-600 flex flex-wrap gap-x-8 gap-y-3 items-center justify-between leading-relaxed">
        <p className="font-medium">© {new Date().getFullYear()} ASUS. All rights reserved.</p>
        <p>Informasi ini digunakan untuk kepentingan program ACP ASUS.</p>
      </div>
    </footer>
  );
}

// Accordion untuk informasi ACP
function ACPTnCAccordion() {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-neutral-200 rounded-lg bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-asus-primary/30 transition"
      >
        <span className="text-sm font-medium text-neutral-800 flex items-center gap-2">
          <svg aria-hidden className="h-4 w-4 text-asus-primary" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 0 1 0-2h5V4a1 1 0 0 1 1-1Z" />
          </svg>
          Terms & Condition for ASUS Commercial Partner (ACP) Program
        </span>
        <span className={`inline-block transition-transform duration-300 text-neutral-500 ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {open && (
        <div className="px-5 pb-5 pt-2 text-sm text-neutral-700 space-y-5 border-t border-neutral-200 leading-relaxed">
          <p>
            This ASUS Commercial Partner Program (hereinafter as “Program”) is enforced by PT ASUS Technology Indonesia Jakarta. (hereinafter as “ASUS”) in order to establish a partnership with our partners (hereinafter as ASUS Commercial Partner or “ACP”) to spend their great efforts on selling ASUS brand commercial system products. To participate in this Program, ACP hereby agrees to comply with the guidelines of this Program as follows:
          </p>

          <section>
            <h3 className="font-semibold">1. ASUS Products Coverage</h3>
            <p>1.1. This Program covers all Asus Commercial System Product, including ASUS Commercial Notebooks, ASUS Commercial Desktop PCs, ASUS Commercial All-in-One PCs (hereinafter as “ASUS Products”).</p>
            <p>1.2. Only the new ASUS Commercial System Products purchased by ASUS Commercial Partner (ACP) from ASUS Business Partner (ABP) or ASUS’s distributing partner(s) specified in Appendix A (hereinafter as “ASUS Distributors”). The list of ASUS Distributors may be updated by ASUS from time to time.</p>
          </section>

          <section>
            <h3 className="font-semibold">2. Qualification</h3>
            <p>ACP will be entitled to apply to this Program on the following conditions:</p>
            <p>2.1. ACP shall at least sell and upload to ASUS e-Sales Apps for the minimum target qty of ASUS Products in the previous quarter.</p>
            <p>2.2. ACP doesn’t sell ASUS PI (Parallel Import) products, i.e. products not offered by ASUS Official Distributors specified in Appendix A.</p>
            <p>2.3. ACP shall submit Sales and Inventory reports to Asus system every Monday or first day of working day in every week before 18:00 local time. The report submitted must be completed and follow Asus format.</p>
          </section>

          <section>
            <h3 className="font-semibold">3. Program Benefits</h3>
            <p>3.1. The Rebate Scheme set forth in Appendix A will be offered by ASUS to ACP if ACP complies with all the terms and conditions under this Program.</p>
            <p>3.2. For the sake of ACP’s selling and marketing ASUS Products, ASUS will provide the following support:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Point of Sale (POS) materials; or</li>
              <li>Product information and ASUS’s suggested pricelist; or</li>
              <li>Proof of Concept (POC); or</li>
              <li>Other information/ assistance deemed necessary by ASUS in writing.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold">4. ACP’s Obligations</h3>
            <p>4.1. ACP has obligations to provide accurate purchase information for ASUS Products. ASUS reserves the right to check original purchase proof.</p>
            <p>4.2. ACP agrees to promote and sell ASUS Products to all potential end-user customers, including but not limited to the following performance:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Maintain ASUS Products image by utilizing POS material provided by ASUS.</li>
              <li>Maintain the correct and updated specifications, photos, complete product name/ information of ASUS Products in ACP’s website and/or shop.</li>
              <li>Recommend ASUS Products when ACP’s end-user customers have enquiries about purchasing the system products, where ASUS reserves the right to conduct a survey of recommendation rate.</li>
              <li>Display ASUS Products on the shelf of ACP’s shop/website</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold">5. Minimum Advertised Price (MAP) Policy</h3>
            <p>5.1. ACP’s Minimum Advertised Price shall not fall below MSRP (Manufacture Suggested Retail Price) when advertising to end user for ASUS Products.</p>
            <p>5.2. MAP applies to all forms of advertising, including third-party sites funded, sponsored, or placed by ACP. MAP applies only to advertised prices. For any violence of the policy, ASUS will implement the punishment based on the pricing policy no. SYS/SC/110421/001 (Appendix C)</p>
          </section>

          <section>
            <h3 className="font-semibold">6. Term and Termination</h3>
            <p>6.1. The Program is effective for one (1) Quarter during program Period, updated and renewed automatically until the ongoing year period is ended.</p>
            <p>6.2. ASUS reserves the right to modify or terminate this Program upon 30 days prior written notice to ACP.</p>
            <p>6.3. Any ACP’s breach or violation of the terms and conditions under this Program or any fraud information/document provided by ACP will result in the termination of this Program immediately.</p>
            <p>6.4. If there are 2 consecutive quarters with zero achievement, then ASUS have rights to cut off the partnership.</p>
            <p>6.5. Program & Benefit Scheme will be set Quarterly.</p>
          </section>

          <section>
            <h3 className="font-semibold">7. Miscellaneous</h3>
            <p>7.1. ACP shall comply with all applicable laws, statutes, rules, regulations and ordinances with respect to the reselling of ASUS Products.</p>
            <p>7.2. ACP shall have and maintain in effect all necessary approvals and permits to distribute ASUS Products and perform its obligations under (a) its agreement with ASUS Distributor(s) and (b) this Program.</p>
            <p>7.3. ASUS shall have the right to audit ACP during the term of this Program to determine whether ACP complies with the terms & conditions under this Program.</p>
            <p>7.4. If ACP receives any notice or becomes aware of any violation of any law, statute, rule, regulation, ACP shall promptly notify ASUS of such notice or violation.</p>
            <p>7.5. ACP is fully responsible for disputes or violations of laws caused by ACP. ASUS is not responsible for losses caused by disputes or violations committed by ACP.</p>
          </section>
        </div>
      )}
    </div>
  );
}

// Accordion untuk Suggested Retail Price & The Cross Territory Policies
function ACPProgramInfoAccordion() {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-neutral-200 rounded-lg bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-asus-primary/30 transition"
      >
        <span className="text-sm font-medium text-neutral-800 flex items-center gap-2">
          <svg
            aria-hidden
            className="h-4 w-4 text-asus-primary"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 0 1 0-2h5V4a1 1 0 0 1 1-1Z" />
          </svg>
          Suggested Retail Price & The Cross Territory Policies
        </span>
        <span
          className={`inline-block transition-transform duration-300 text-neutral-500 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {open && (
        <div className="px-5 pb-5 pt-2 text-sm text-neutral-700 space-y-5 border-t border-neutral-200 leading-relaxed">
          <div>
            <p><strong>Rules No.</strong> : SYS/SC/110421/001</p>
            <p><strong>Effective date</strong> : May 1st 2011</p>
            <p>
              <strong>Products</strong> : ASUS Commercial Notebooks, ASUS Desktop
              PCs, ASUS Commercial Desktop PCs, ASUS All-in-One PCs
            </p>
          </div>

          <section>
            <h3 className="font-semibold text-neutral-800">1. Suggested Retail Price (SRP) Policy</h3>
            <ol className="list-decimal ml-5 space-y-2">
              <li>
                All ASUS Business Partner (ABP) and ASUS Commercial Partner (ACP) are required to follow ASUS Suggested Retail Price (SRP) that published in ASUS Price list, released by ASUS Indonesia for any published marketing materials both online and written media. Publishing higher than ASUS SRP is not advisable but is acceptable.
              </li>
              <li>
                Failure to follow ASUS Suggested Retail Price (SRP) will have punishment as below items If the rules breaker is ABP / ACP:
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>1<sup>st</sup> break – warned by email</li>
                  <li>2<sup>nd</sup> break – warned by email</li>
                  <li>3<sup>rd</sup> break – warned by email and bonus for the target rebate of ABP/ACP will be canceled for the corresponding quarter</li>
                  <li>4<sup>th</sup> break – ASUS Authorized Distributors will stop all shipment or product delivery to the ABP/ACP for 1 month. If Distributor cannot stop the shipment, the target rebate of Distributor for the corresponding quarter will be cancelled. ASUS will ban Supporting Letter Request from Partner who Breach the policy.</li>
                </ul>
              </li>
            </ol>
          </section>

          <section>
            <h3 className="font-semibold text-neutral-800">2. The Cross Territory Policy</h3>
            <ol className="list-decimal ml-5 space-y-2">
              <li>All ASUS Business Partner (ABP) and ASUS Commercial Partner (ACP) are not allowed to sell ASUS Products to other territory.</li>
              <li>For ABP who have branches or shops outside their home territory, in this case, those branches are advised to register as local ABP, buy in the goods from local branch of ASUS authorized distributors and follow the local rules.</li>
              <li>For ACP who have branches or shops outside their home territory, in this case, those branches are advised to register as local ACP, buy in the goods from local ABP or local branch of ASUS authorized distributors and follow the local rules.</li>
              <li>Failure to follow The Cross Territory Policy will follow the punishment as point 1.2.1 and 1.2.2</li>
            </ol>
          </section>

          <section>
            <h3 className="font-semibold text-neutral-800">Description:</h3>
            <p>Territory means area defined by ASUS as breakdown below:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Jabodetabek – Jakarta, Bogor, Depok, Tangerang, Bekasi</li>
              <li>West Java</li>
              <li>Central Java and Yogyakarta</li>
              <li>East Java</li>
              <li>North Sumatera</li>
              <li>West Sumatera</li>
              <li>South Sumatera</li>
              <li>Kalimantan</li>
              <li>Bali & Nusa Tenggara</li>
              <li>Sulawesi</li>
              <li>East Indonesia Islands</li>
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
