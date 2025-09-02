"use client";
import { useState } from 'react';
import Image from 'next/image';

interface FormState {
  name: string;
  phone: string;
  email: string;
  company: string;
  foodPreference: 'Daging' | 'Ikan' | 'Vegan' | '';
  attending: 'yes' | 'no' | '';
  salesTrainingParticipants: {
    participant1: {
      name: string;
      phone: string;
      email: string;
      foodPreference: 'Daging' | 'Ikan' | 'Vegan' | '';
    };
    participant2: {
      name: string;
      phone: string;
      email: string;
      foodPreference: 'Daging' | 'Ikan' | 'Vegan' | '';
    };
  };
}

export default function Home() {
  const [form, setForm] = useState<FormState>({ 
    name: '', 
    phone: '', 
    email: '', 
    company: '', 
    foodPreference: '', 
    attending: '',
    salesTrainingParticipants: {
      participant1: { name: '', phone: '', email: '', foodPreference: '' },
      participant2: { name: '', phone: '', email: '', foodPreference: '' }
    }
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    if (!form.name || !form.phone || !form.email || !form.company || !form.foodPreference) {
      setError('Mohon lengkapi semua field.');
      return;
    }
    
    // Validasi Sales Training Participant 1 (wajib)
    const st1 = form.salesTrainingParticipants.participant1;
    if (!st1.name || !st1.phone || !st1.email || !st1.foodPreference) {
      setError('Mohon lengkapi data Peserta 1 Sales Training.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          company: form.company.trim(),
          foodPreference: form.foodPreference,
          attending: true, // Default value since AttendingChoice is disabled
          salesTrainingParticipants: form.salesTrainingParticipants
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengirim data');
      setSuccess(true);
      setForm({ 
        name: '', 
        phone: '', 
        email: '', 
        company: '', 
        foodPreference: '', 
        attending: '',
        salesTrainingParticipants: {
          participant1: { name: '', phone: '', email: '', foodPreference: '' },
          participant2: { name: '', phone: '', email: '', foodPreference: '' }
        }
      });
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message); else setError('Terjadi kesalahan tak terduga');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Header />
      <main className="flex-1 flex items-start justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-asus-primary flex items-center gap-3">
              <span className="inline-block h-9 w-1.5 bg-asus-accent rounded-full" />
              ASUS Expert Hadir di Surabaya!
            </h1>
            <p className="mt-2 text-sm text-neutral-600">Kami mengundang Anda untuk hadir dalam event spesial ASUS Expert Series untuk langsung menguji ketangguhan dari produk ASUS Expert, mendapatkan insight bisnis, hiburan, dan juga networking bersama partner se-Jawa Timur.</p>
            <div className="mt-4 space-y-3">
              <EventInfoAccordion />
              <AdditionalInfoAccordion />
            </div>
          </div>
          <form onSubmit={submit} className="relative bg-white border border-neutral-200/80 rounded-xl shadow-sm overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-asus-primary via-asus-accent to-asus-primary" />
            <div className="p-6 sm:p-8 space-y-6">
              {/* Section 1: Informasi Peserta Partner Gathering */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-neutral-800 border-b border-neutral-200 pb-2">
                  1. Informasi Peserta Partner Gathering
                </h2>
                <Field label="Nama" name="name" value={form.name} onChange={handleChange} placeholder="Nama lengkap" />
                <Field label="Nomor Telepon" name="phone" value={form.phone} onChange={handleChange} placeholder="08xxxxxxxxxx" inputMode="tel" />
                <Field label="Email" name="email" value={form.email} onChange={handleChange} placeholder="email@perusahaan.com" inputMode="email" />
                <FoodPreferenceChoice value={form.foodPreference} onChange={(v: 'Daging' | 'Ikan' | 'Vegan') => setForm(f => ({ ...f, foodPreference: v }))} />
                <Field label="Nama Perusahaan" name="company" value={form.company} onChange={handleChange} placeholder="PT Nama Perusahaan Anda" />
              </div>
              
              {/* Section 2: Informasi Peserta Sales Training */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-neutral-800 border-b border-neutral-200 pb-2">
                  2. Informasi Peserta Sales Training
                </h2>
                <SalesTrainingParticipantsTable 
                  participants={form.salesTrainingParticipants} 
                  onChange={(participants) => setForm(f => ({ ...f, salesTrainingParticipants: participants }))} 
                />
              </div>
              
              {/* AttendingChoice temporarily disabled - uncomment when needed */}
              {/* <AttendingChoice value={form.attending} onChange={v => setForm(f => ({ ...f, attending: v }))} /> */}
              {error && <Alert tone="error" message={error} />}
              {success && <Alert tone="success" message="Terima kasih. Data Anda telah tersimpan." />}
              <div className="pt-2">
                <button
                  disabled={loading}
                  className="inline-flex w-full justify-center items-center gap-2 rounded-lg bg-asus-primary px-5 h-12 text-sm font-medium tracking-wide text-white shadow-sm disabled:opacity-60 disabled:cursor-not-allowed hover:bg-asus-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-asus-primary/30 transition-colors"
                >
                  {loading ? 'Mengirim…' : 'Kirim'}
                </button>
                <p className="mt-3 text-[11px] leading-relaxed text-neutral-500">Data yang Anda kirimkan akan digunakan secara internal oleh ASUS untuk perencanaan acara dan tidak akan dibagikan kepada pihak ketiga.</p>
              </div>
              
              {/* ACP Registration Banner - Temporarily Hidden */}
              {/* 
              <div className="mt-6 p-4 bg-gradient-to-r from-asus-primary/5 to-asus-accent/5 border border-asus-primary/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="h-5 w-5 text-asus-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-asus-primary mb-1">
                      Bergabung dengan ASUS Commercial Partner
                    </h3>
                    <p className="text-sm text-neutral-600 mb-3">
                      Tertarik untuk menjadi partner resmi ASUS? Daftarkan perusahaan Anda untuk bergabung dengan program ASUS Commercial Partner dan dapatkan benefit menarik.
                    </p>
                    <a 
                      href="/acp-registration"
                      className="inline-flex items-center gap-2 text-sm font-medium text-asus-primary hover:text-asus-primary/80 transition-colors"
                    >
                      Daftar ACP Sekarang
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
              */}
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
  name: keyof FormState;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}

function Field({ label, name, value, onChange, placeholder, inputMode }: FieldProps) {
  const id = `field-${name}`;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-neutral-700">
        {label} <span className="text-red-600" aria-hidden>*</span>
        <span className="sr-only">(wajib)</span>
      </label>
      <input
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        inputMode={inputMode}
        required
        aria-required="true"
        className="block w-full rounded-md border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-800 shadow-inner focus:border-asus-primary focus:ring-4 focus:ring-asus-primary/25 outline-none transition"
      />
    </div>
  );
}

// AttendingChoice component - temporarily disabled but kept for future use
// To re-enable: uncomment the component usage in the form above
function AttendingChoice({ value, onChange }: { value: FormState['attending']; onChange: (v: 'yes' | 'no') => void; }) {
  return (
    <fieldset className="space-y-2">
  <legend className="text-sm font-medium text-neutral-700">Apakah Anda tertarik untuk hadir? <span className="text-red-600" aria-hidden>*</span><span className="sr-only">(wajib)</span></legend>
      <div className="flex gap-4 flex-wrap">
        <ChoicePill selected={value === 'yes'} onClick={() => onChange('yes')}>Ya</ChoicePill>
        <ChoicePill selected={value === 'no'} onClick={() => onChange('no')}>Tidak</ChoicePill>
      </div>
    </fieldset>
  );
}

function FoodPreferenceChoice({ value, onChange }: { value: FormState['foodPreference']; onChange: (v: 'Daging' | 'Ikan' | 'Vegan') => void; }) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-neutral-700">Preferensi Makanan <span className="text-red-600" aria-hidden>*</span><span className="sr-only">(wajib)</span></legend>
      <div className="flex gap-4 flex-wrap">
        <ChoicePill selected={value === 'Daging'} onClick={() => onChange('Daging')}>Daging</ChoicePill>
        <ChoicePill selected={value === 'Ikan'} onClick={() => onChange('Ikan')}>Ikan</ChoicePill>
        <ChoicePill selected={value === 'Vegan'} onClick={() => onChange('Vegan')}>Vegan</ChoicePill>
      </div>
    </fieldset>
  );
}

function SalesTrainingParticipantsTable({ 
  participants, 
  onChange 
}: { 
  participants: FormState['salesTrainingParticipants']; 
  onChange: (participants: FormState['salesTrainingParticipants']) => void; 
}) {
  const updateParticipant = (participantKey: 'participant1' | 'participant2', field: string, value: string) => {
    onChange({
      ...participants,
      [participantKey]: {
        ...participants[participantKey],
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-neutral-700">
        Peserta yang hadir Sales Training <span className="text-red-600" aria-hidden>*</span>
        <span className="sr-only">(minimal Peserta 1 wajib diisi)</span>
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full border border-neutral-200 rounded-lg">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider border-b border-neutral-200">Peserta</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider border-b border-neutral-200">Nama</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider border-b border-neutral-200">No. Telepon</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider border-b border-neutral-200">Email</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider border-b border-neutral-200">Preferensi Makanan</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-neutral-200">
            <tr>
              <td className="px-3 py-2 text-sm text-neutral-700 font-medium">
                Peserta 1 <span className="text-red-600">*</span>
              </td>
              <td className="px-3 py-2">
                <input
                  type="text"
                  value={participants.participant1.name}
                  onChange={(e) => updateParticipant('participant1', 'name', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:border-asus-primary focus:ring-1 focus:ring-asus-primary/25 outline-none"
                  placeholder="Nama lengkap"
                  required
                />
              </td>
              <td className="px-3 py-2">
                <input
                  type="tel"
                  value={participants.participant1.phone}
                  onChange={(e) => updateParticipant('participant1', 'phone', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:border-asus-primary focus:ring-1 focus:ring-asus-primary/25 outline-none"
                  placeholder="08xxxxxxxxxx"
                  required
                />
              </td>
              <td className="px-3 py-2">
                <input
                  type="email"
                  value={participants.participant1.email}
                  onChange={(e) => updateParticipant('participant1', 'email', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:border-asus-primary focus:ring-1 focus:ring-asus-primary/25 outline-none"
                  placeholder="email@domain.com"
                  required
                />
              </td>
              <td className="px-3 py-2">
                <select
                  value={participants.participant1.foodPreference}
                  onChange={(e) => updateParticipant('participant1', 'foodPreference', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:border-asus-primary focus:ring-1 focus:ring-asus-primary/25 outline-none"
                  required
                >
                  <option value="">Pilih</option>
                  <option value="Daging">Daging</option>
                  <option value="Ikan">Ikan</option>
                  <option value="Vegan">Vegan</option>
                </select>
              </td>
            </tr>
            <tr>
              <td className="px-3 py-2 text-sm text-neutral-700 font-medium">
                Peserta 2 <span className="text-neutral-400">(opsional)</span>
              </td>
              <td className="px-3 py-2">
                <input
                  type="text"
                  value={participants.participant2.name}
                  onChange={(e) => updateParticipant('participant2', 'name', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:border-asus-primary focus:ring-1 focus:ring-asus-primary/25 outline-none"
                  placeholder="Nama lengkap"
                />
              </td>
              <td className="px-3 py-2">
                <input
                  type="tel"
                  value={participants.participant2.phone}
                  onChange={(e) => updateParticipant('participant2', 'phone', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:border-asus-primary focus:ring-1 focus:ring-asus-primary/25 outline-none"
                  placeholder="08xxxxxxxxxx"
                />
              </td>
              <td className="px-3 py-2">
                <input
                  type="email"
                  value={participants.participant2.email}
                  onChange={(e) => updateParticipant('participant2', 'email', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:border-asus-primary focus:ring-1 focus:ring-asus-primary/25 outline-none"
                  placeholder="email@domain.com"
                />
              </td>
              <td className="px-3 py-2">
                <select
                  value={participants.participant2.foodPreference}
                  onChange={(e) => updateParticipant('participant2', 'foodPreference', e.target.value)}
                  className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:border-asus-primary focus:ring-1 focus:ring-asus-primary/25 outline-none"
                >
                  <option value="">Pilih</option>
                  <option value="Daging">Daging</option>
                  <option value="Ikan">Ikan</option>
                  <option value="Vegan">Vegan</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ChoicePill({ selected, children, onClick }: { selected: boolean; children: React.ReactNode; onClick: () => void; }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-6 h-11 rounded-full border text-sm font-medium tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-asus-primary/30 shadow-sm inline-flex items-center justify-center ${selected ? 'bg-asus-primary text-white border-asus-primary' : 'bg-white text-neutral-700 border-neutral-300 hover:border-asus-primary/60 hover:text-asus-primary'}`}
      aria-pressed={selected}
    >
      {children}
    </button>
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
  <a href="/" className="flex items-center gap-8 group" aria-label="ASUS Attendance Form Home">
          <Image
            src="/ASUS_Logo.svg"
            alt="ASUS Logo"
            width={90}
            height={20}
            priority
            className="h-6 w-auto transition-opacity group-hover:opacity-90"
          />
          <span className="hidden sm:inline-block text-base font-semibold tracking-tight text-neutral-700 group-hover:text-neutral-900">Registration: ASUS Commercial Partner Gathering Surabaya</span>
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
        <p>Informasi ini digunakan untuk kepentingan internal acara.</p>
      </div>
    </footer>
  );
}

// Accordion untuk informasi acara (edit isi sesuai kebutuhan acara Anda)
function EventInfoAccordion() {
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
          <svg aria-hidden className="h-4 w-4 text-asus-primary" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 0 1 0-2h5V4a1 1 0 0 1 1-1Z" /></svg>
          Informasi Acara
        </span>
        <span className={`inline-block transition-transform duration-300 text-neutral-500 ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {open && (
        <div className="px-5 pb-5 pt-2 text-sm text-neutral-700 space-y-4 border-t border-neutral-200">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1">Tanggal & Waktu</h3>
            <p className="leading-relaxed">Sales Training: 18 September 2025, 12:00–15:00 WIB</p>
            <p className="leading-relaxed">Partner Gathering (Gala Dinner): 18 September 2025, 18:00–21:00 WIB</p>
          </section>
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1">Lokasi</h3>
            <p className="leading-relaxed font-bold">DoubleTree by Hilton Surabaya</p>
            <p className="leading-relaxed">Jl. Tunjungan No.12, Genteng, Kec. Genteng, Surabaya, Jawa Timur 60275</p>
            <a 
              href="https://maps.app.goo.gl/tWes8CtBiuLruray9" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-asus-primary hover:text-asus-primary/80 font-medium transition-colors"
            >
              Buka Maps
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </section>
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1">Kontak Info</h3>
            <p className="leading-relaxed">
              Erwin – WA{' '}
              <a 
              href="https://wa.me/628119991048" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-asus-primary hover:text-asus-primary/80 font-medium transition-colors"
              >
              62 811-999-1048
              </a>
              {' '}(
              <a 
              href="mailto:erwin_hadhiwaluyo@asus.com"
              className="text-asus-primary hover:text-asus-primary/80 font-medium transition-colors"
              >
              Erwin_Hadhiwaluyo@asus.com
              </a>
              )
            </p>
          </section>
        </div>
      )}
    </div>
  );
}

// Accordion untuk informasi tambahan
function AdditionalInfoAccordion() {
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
          <svg aria-hidden className="h-4 w-4 text-asus-primary" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 0 1 0-2h5V4a1 1 0 0 1 1-1Z" /></svg>
          Informasi Tambahan
        </span>
        <span className={`inline-block transition-transform duration-300 text-neutral-500 ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {open && (
        <div className="px-5 pb-5 pt-2 text-sm text-neutral-700 space-y-4 border-t border-neutral-200">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1">Untuk Owner dari Toko (ASUS Partner)</h3>
            <div className="leading-relaxed space-y-2">
              <p className="font-bold">Mendapatkan akomodasi penginapan dengan ketentuan:</p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>1 Kamar sharing dengan partner lain.</li>
                <li>Transportasi bisa di claim dengan menunjukkan invoice/resi asli, seperti resi dari SPBU, resi travel, Kereta dr KAI, dll.</li>
              </ul>
            </div>
          </section>
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1">Untuk Sales Toko / Frontliner</h3>
            <div className="leading-relaxed space-y-2">
              <ul className="list-disc list-inside space-y-1">
                <li>Transportasi bisa di claim dengan menunjukkan invoice/resi asli, seperti resi dari SPBU, resi travel, Kereta dr KAI, dll.</li>
              </ul>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
