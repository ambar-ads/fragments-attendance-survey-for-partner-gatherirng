"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { generatePDF, uploadPDFToStorage, FormData as PDFFormData } from '../../lib/pdfGenerator';
import { uploadFileToStorage } from '../../lib/supabaseStorage';

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
  submissionId?: string; // ID dari database setelah submit berhasil
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
    agreement: false,
    submissionId: undefined
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExampleModal, setShowExampleModal] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

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
      
      // Store submission ID for PDF generation
      setForm(prev => ({ ...prev, submissionId: data.id, photoUrl }));
      setSuccess(true);
      
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message); 
      else setError('Terjadi kesalahan tak terduga');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!form.submissionId) {
      setError('Tidak dapat men-generate PDF: ID submission tidak ditemukan');
      return;
    }

    setPdfLoading(true);
    setError(null);

    try {
      // Prepare data for PDF generation
      const pdfData: PDFFormData = {
        id: form.submissionId,
        acpName: form.acpName,
        acpAddress: form.acpAddress,
        city: form.city,
        state: form.state,
        postCode: form.postCode,
        telephoneNo: form.telephoneNo,
        faxNo: form.faxNo,
        photoUrl: form.photoUrl,
        idCardNo: form.idCardNo,
        taxId: form.taxId,
        sbnNib: form.sbnNib,
        pkp: form.pkp,
        contacts: form.contacts,
        agreement: form.agreement,
        createdAt: new Date().toISOString()
      };

      // Generate PDF
      const { blob, filename } = await generatePDF(pdfData);

      // Upload PDF to Supabase Storage
      const uploadResult = await uploadPDFToStorage(blob, filename);
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Gagal mengupload PDF ke storage');
      }

      // Update database dengan URL PDF
      const updateRes = await fetch('/api/update-pdf-url', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: form.submissionId,
          pdfUrl: uploadResult.data?.publicUrl
        })
      });

      if (!updateRes.ok) {
        const updateData = await updateRes.json();
        throw new Error(updateData.error || 'Gagal menyimpan URL PDF');
      }

      // Download the PDF file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Terjadi kesalahan saat membuat PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
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
              <ACPTnCAccordionAdditional />
              <ACPProgramInfoAccordion />
              <div className="flex justify-start">
                <button
                  type="button"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = '/Asus-Commercial-Partner-Contract-Q3-2025.pdf';
                    link.download = 'Asus-Commercial-Partner-Contract-Q3-2025.pdf';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="text-asus-primary hover:text-asus-primary/80 text-xs underline font-bold"
                >
                  Download Terms & Conditions
                </button>
              </div>
            </div>
          </div>

          {success ? (
            /* Success State - Show thank you message and PDF download */
            <div className="relative bg-white border border-neutral-200/80 rounded-xl shadow-sm overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500" />
              <div className="p-6 sm:p-8 text-center space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold text-neutral-800">Pendaftaran Berhasil!</h2>
                  <p className="text-neutral-600 leading-relaxed">
                    Terima kasih. Pendaftaran ACP Anda telah berhasil dikirim dan akan diproses oleh tim kami.
                  </p>
                  <p className="text-sm text-neutral-500">
                    Silahkan unduh form anda dalam format PDF sebagai bukti pendaftaran.
                  </p>
                </div>

                {error && <Alert tone="error" message={error} />}

                <div className="pt-4 space-y-4">
                  <button
                    onClick={handleDownloadPDF}
                    disabled={pdfLoading}
                    className="inline-flex w-full justify-center items-center gap-2 rounded-lg bg-emerald-600 px-5 h-12 text-sm font-medium tracking-wide text-white shadow-sm disabled:opacity-60 disabled:cursor-not-allowed hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/30 transition-colors"
                  >
                    {pdfLoading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Membuat PDF...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download Form PDF
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      setSuccess(false);
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
                        agreement: false,
                        submissionId: undefined
                      });
                      setError(null);
                    }}
                    className="text-sm text-neutral-600 hover:text-neutral-800 underline font-medium"
                  >
                    Daftar lagi untuk ACP baru
                  </button>
                </div>

                <div className="bg-neutral-50 rounded-lg p-4 text-left">
                  <h3 className="text-sm font-medium text-neutral-800 mb-2">Langkah Selanjutnya:</h3>
                  <ul className="text-xs text-neutral-600 space-y-1 list-disc list-inside">
                    <li>Tim ASUS akan meninjau pendaftaran Anda dalam 3-5 hari kerja</li>
                    <li>Anda akan dihubungi melalui email atau telepon untuk proses verifikasi</li>
                    <li>Simpan PDF form sebagai bukti pendaftaran</li>
                    <li>Pastikan data kontak yang diberikan aktif dan dapat dihubungi</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            /* Form State - Show registration form */

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
                  <SelectField 
                    label="Province" 
                    value={form.state} 
                    onChange={(value) => handleInputChange('state', value)}
                    options={[
                      { value: 'Jabodetabek', label: 'Jabodetabek' },
                      { value: 'West Java', label: 'West Java' },
                      { value: 'Central Java', label: 'Central Java' },
                      { value: 'East Java', label: 'East Java' },
                      { value: 'North Sumatera', label: 'North Sumatera' },
                      { value: 'Central Sumatera', label: 'Central Sumatera' },
                      { value: 'South Sumatera', label: 'South Sumatera' },
                      { value: 'Kalimantan', label: 'Kalimantan' },
                      { value: 'Sulawesi', label: 'Sulawesi' },
                      { value: 'Bali Nusra', label: 'Bali Nusra' }
                    ]}
                    placeholder="Pilih Provinsi"
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
                  setShowExampleModal={setShowExampleModal}
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

              {/* Error Messages */}
              {error && <Alert tone="error" message={error} />}

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
          )}
        </div>
      </main>
      <Footer />

      {/* Example Modal */}
      {showExampleModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-70 transition-opacity" onClick={() => setShowExampleModal(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="flex items-center justify-between p-4 border-b border-neutral-200">
                <h3 className="text-lg font-medium text-neutral-800">Example of Store Photo</h3>
                <button
                  type="button"
                  onClick={() => setShowExampleModal(false)}
                  className="text-neutral-400 hover:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-asus-primary rounded-full p-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <Image
                  src="/example_of_store_photo.jpeg"
                  alt="Example of store photo"
                  width={600}
                  height={400}
                  className="w-full h-auto rounded-lg"
                />
                <p className="mt-3 text-sm text-neutral-600">
                  Contoh foto toko yang baik: menampilkan tampak depan toko dengan jelas, 
                  terlihat nama toko/signage, dan kondisi pencahayaan yang cukup.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
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

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
}

function SelectField({ label, value, onChange, options, placeholder, required = false }: SelectFieldProps) {
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
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        aria-required={required}
        className="block w-full rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-800 shadow-inner focus:border-asus-primary focus:ring-4 focus:ring-asus-primary/25 outline-none transition"
      >
        <option value="">{placeholder || `Pilih ${label}`}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
  setShowExampleModal?: (show: boolean) => void;
}

function PhotoUploadField({ label, value, onChange, photoUrl, onPhotoUrlChange, required = false, setShowExampleModal }: PhotoUploadFieldProps) {
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
      <label htmlFor={id} className="text-sm font-medium text-neutral-700 flex items-center gap-2">
        {label} 
        {required && (
          <>
            <span className="text-red-600" aria-hidden> *</span>
            <span className="sr-only">(wajib)</span>
          </>
        )}
        <button
          type="button"
          onClick={() => setShowExampleModal?.(true)}
          className="text-asus-primary hover:text-asus-primary/80 text-xs underline font-bold"
        >
          Example
        </button>
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

// Accordion untuk Additional ASUS Commercial Partner (ACP) Program Registration
function ACPTnCAccordionAdditional() {
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
          (<strong>Additional</strong>) ASUS Commercial Partner (ACP) Program Terms Q3 2025
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
        <div className="px-5 pb-5 pt-2 text-sm text-neutral-700 space-y-6 border-t border-neutral-200 leading-relaxed">
          
          {/* Section 1 */}
          <section>
            <h3 className="font-semibold text-neutral-800">1. Target of Q3 (July 1st - Sept 30th) 2025</h3>
            <p>____________</p>
          </section>

          {/* Section 2 */}
          <section>
            <h3 className="font-semibold text-neutral-800">2. Rebate Scheme</h3>
            <p>
              ASUS offers rebate schemes as below detail. ASUS will monitor the result on weekly basis, all the rebate will be processed by end of Quarter. ACP will receive the rebate quarterly based.
            </p>
          </section>

          {/* Section 3 - A1 */}
          <section>
            <h3 className="font-semibold text-neutral-800">A1. Scan Serial Number & Check Number to ASUS eSales Apps Rebate</h3>
            <p><strong>ASUS Commercial Partner will be rewarded with eSales Rebate with Condition as below:</strong></p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Q3 upload period on the e-Sales system is <strong>July 1st, 2025 at 00:01 to Sept 30th, 2025 at 22:55 WIB</strong>.</li>
              <li>The serial number is declared valid only in the event of H-14 activation from the scan time.</li>
              <li>ACP will only get rebates if ACP achieves Greater than or Equal to 100% of accumulated sales in July, August, and September 2025.</li>
              <li>The sales target will be determined by ASUS based on the respective ACP Capacity.</li>
              <li>Products or SKUs that are dedicated to tenders or projects, will not get rebates from Uploads and will not be counted as achievements for any program.</li>
              <li><strong>ASUS Commercial Partners will receive rebate for every valid Serial Number (SN) and Check Number scanned in the ASUS e-Sales Apps as below:</strong></li>
            </ul>

            <table className="w-full border border-neutral-300 mt-3 text-sm">
              <thead className="bg-neutral-100">
                <tr>
                  <th className="border px-2 py-1">Category</th>
                  <th className="border px-2 py-1">Models</th>
                  <th className="border px-2 py-1">Requirement</th>
                  <th className="border px-2 py-1">Remarks</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border px-2 py-1 align-top">Non-premium Models: IDR 25,000/unit</td>
                  <td className="border px-2 py-1 align-top">NX: BR1100, P1412, P1512</td>
                  <td className="border px-2 py-1 align-top" rowSpan={3}>
                    Scan VALID Serial Number & Check Number via ASUS eSales Apps on a daily basis
                  </td>
                  <td className="border px-2 py-1 align-top">All Models not mentioned in Premium & Deluxe Models are regarded as Non-Premium Models</td>
                </tr>
                <tr>
                  <td className="border px-2 py-1 align-top">Premium Models: IDR 75,000/unit</td>
                  <td className="border px-2 py-1 align-top">
                    NX: P1403, P1503, PM1403, PM1503, P2451, B3000, B1402, B1403, BM1403, B1502, B1503, BM1503, L1400, B1400, B1500, BG1408, BG1409, CX1405<br />
                    AIO: A41, E1600, A6432, A6521, A3202, A3402, E3202, M3402, E3402, EG3408, P440<br />
                    DT: S500, S501, S503, D500, D501, P500, DG500, PG500
                  </td>
                  <td className="border px-2 py-1 align-top">Tender Product or special SKU Project are excluded from all kinds of incentive program or rebate calculation</td>
                </tr>
                <tr>
                  <td className="border px-2 py-1 align-top">Deluxe Models: IDR 150,000/unit</td>
                  <td className="border px-2 py-1 align-top">
                    NX: P3405, PM3406, P5405, B3402, B3404, B3405, B5302, B5402, B5404, B5405, B5602, B5604, B5605, B6602, B7402, B9402, B9400, B9403, CX3402<br />
                    AIO: A5402, A5702, P470, E5401, F5401, E5202, E5402, E5702<br />
                    DT: D700, D800, D900, P5000, G10, G13, G22, G35
                  </td>
                  <td className="border px-2 py-1 align-top"></td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Example */}
          <section>
            <h3 className="font-semibold text-neutral-800">Example Rebate Calculation</h3>
            <p>The following data is made to simulate the rebate calculation:</p>

            <table className="border border-neutral-300 mt-3 text-sm w-full">
              <tbody>
                <tr><td className="border px-2 py-1">Target Qty Uploaded</td><td className="border px-2 py-1">250</td></tr>
                <tr><td className="border px-2 py-1">Achievement Qty</td><td className="border px-2 py-1">300</td></tr>
                <tr><td className="border px-2 py-1">Hitrate</td><td className="border px-2 py-1">120%</td></tr>
              </tbody>
            </table>

            <table className="border border-neutral-300 mt-3 text-sm w-full">
              <thead className="bg-neutral-100">
                <tr>
                  <th className="border px-2 py-1">Notebook/Desktop/All in one</th>
                  <th className="border px-2 py-1">Rebate %</th>
                  <th className="border px-2 py-1">Rebate Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border px-2 py-1">Not Qualified</td><td className="border px-2 py-1">&lt;100%</td><td className="border px-2 py-1">-</td></tr>
                <tr><td className="border px-2 py-1">Safety - Tier 1</td><td className="border px-2 py-1">&gt;100%</td><td className="border px-2 py-1">13.500.000</td></tr>
              </tbody>
            </table>

            <p className="mt-2"><strong>Q3 2025 ACP Rebate: 13.500.000</strong></p>

            <table className="border border-neutral-300 mt-3 text-sm w-full">
              <thead className="bg-neutral-100">
                <tr>
                  <th className="border px-2 py-1">Product Segment Category</th>
                  <th className="border px-2 py-1">July</th>
                  <th className="border px-2 py-1">Aug</th>
                  <th className="border px-2 py-1">Sep</th>
                  <th className="border px-2 py-1">Total Q3 2025</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border px-2 py-1">Valid All Product Scan</td><td className="border px-2 py-1">100</td><td className="border px-2 py-1">100</td><td className="border px-2 py-1">100</td><td className="border px-2 py-1">300</td></tr>
                <tr><td className="border px-2 py-1">Valid Non-premium Models</td><td className="border px-2 py-1">30</td><td className="border px-2 py-1">20</td><td className="border px-2 py-1">53</td><td className="border px-2 py-1">225</td></tr>
                <tr><td className="border px-2 py-1">Valid Premium Models</td><td className="border px-2 py-1">3</td><td className="border px-2 py-1">10</td><td className="border px-2 py-1">10</td><td className="border px-2 py-1">45</td></tr>
                <tr><td className="border px-2 py-1">Valid High End Models</td><td className="border px-2 py-1">5</td><td className="border px-2 py-1">5</td><td className="border px-2 py-1">5</td><td className="border px-2 py-1">30</td></tr>
              </tbody>
            </table>

            <table className="border border-neutral-300 mt-3 text-sm w-full">
              <thead className="bg-neutral-100">
                <tr>
                  <th className="border px-2 py-1">Rebate/Unit</th>
                  <th className="border px-2 py-1">Valid Scan Unit</th>
                  <th className="border px-2 py-1">Rebate Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border px-2 py-1">Non Premium Model 25.000</td><td className="border px-2 py-1">225</td><td className="border px-2 py-1">5.625.000</td></tr>
                <tr><td className="border px-2 py-1">Premium Model 75.000</td><td className="border px-2 py-1">45</td><td className="border px-2 py-1">3.375.000</td></tr>
                <tr><td className="border px-2 py-1">Deluxe Model 150.000</td><td className="border px-2 py-1">30</td><td className="border px-2 py-1">4.500.000</td></tr>
                <tr className="font-semibold"><td className="border px-2 py-1">Total eSales Rebate</td><td className="border px-2 py-1">300</td><td className="border px-2 py-1">13.500.000</td></tr>
              </tbody>
            </table>
          </section>

          {/* Section 4 */}
          <section>
            <h3 className="font-semibold text-neutral-800">4. ASUS Official Distributors in Indonesia</h3>
            <ol className="list-decimal ml-5 space-y-1">
              <li>PT. SYNNEX METRODATA INDONESIA</li>
              <li>PT. DATASCRIP</li>
              <li>PT. ADAKOM INTERNATIONAL TECHNOLOGY</li>
              <li>PT. ASTRINDO SENAYASA</li>
              <li>PT. TECH DATA ADVANCED SOLUTION INDONESIA</li>
              <li>PT. INGRAM MICRO INDONESIA</li>
            </ol>
          </section>

          {/* Section 5 */}
          <section>
            <h3 className="font-semibold text-neutral-800">5. ASUS Sales and Marketing Assistance</h3>
            <ul className="list-disc ml-5 space-y-1">
              <li>An ASUS official distributor will be designated by ASUS to work as ACP contact window.</li>
              <li>The monthly suggested price list will be updated by ASUS official distributors.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h3 className="font-semibold text-neutral-800">6. Price Protection (PP)</h3>
            <ul className="list-disc ml-5 space-y-2">
              <li>In the event that ASUS reduces the selling price of ASUS Products, ASUS will credit the difference between the original selling price and the reduced price to ASUS distributors for ASUS Products that (1) have been purchased by ACP within 30 days and (2) have not been sold out to ACP’s end-user customers.</li>
              <li>The aforesaid credit amount will be paid by credit note issued by ASUS Distributors to ACP.</li>
              <li><strong>ACP must provide ASUS with weekly stock reports, prior to 6:00 pm every Monday</strong> to ERP Esales System and email to <em>Consumer.Salesforce@asus.com</em> CC: ASUS Area Account Manager.</li>
              <li>Only ASUS Products bought from ASUS Distributors will be entitled to price protection.</li>
              <li>Final Rebate will be decided by ASUS based on checking and audits and the <strong>ASUS right is absolute</strong>.</li>
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}