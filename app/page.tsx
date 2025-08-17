"use client";
import { useState } from 'react';
import Image from 'next/image';

interface FormState {
  name: string;
  phone: string;
  company: string;
  attending: 'yes' | 'no' | '';
}

export default function Home() {
  const [form, setForm] = useState<FormState>({ name: '', phone: '', company: '', attending: '' });
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
    if (!form.name || !form.phone || !form.company || !form.attending) {
      setError('Mohon lengkapi semua field.');
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
          company: form.company.trim(),
          attending: form.attending === 'yes'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengirim data');
      setSuccess(true);
      setForm({ name: '', phone: '', company: '', attending: '' });
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
              Survei Minat Kehadiran Acara
            </h1>
            <p className="mt-2 text-sm text-neutral-600">Formulir resmi ASUS untuk mengetahui minat Anda menghadiri acara kami. Mohon isi dengan data yang valid.</p>
            <div className="mt-4">
              <EventInfoAccordion />
            </div>
          </div>
          <form onSubmit={submit} className="relative bg-white border border-neutral-200/80 rounded-xl shadow-sm overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-asus-primary via-asus-accent to-asus-primary" />
            <div className="p-6 sm:p-8 space-y-6">
              <Field label="Nama" name="name" value={form.name} onChange={handleChange} placeholder="Nama lengkap" />
              <Field label="Nomor Telepon" name="phone" value={form.phone} onChange={handleChange} placeholder="08xxxxxxxxxx" inputMode="tel" />
              <Field label="Nama Perusahaan" name="company" value={form.company} onChange={handleChange} placeholder="PT Nama Perusahaan Anda" />
              <AttendingChoice value={form.attending} onChange={v => setForm(f => ({ ...f, attending: v }))} />
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
          <span className="hidden sm:inline-block text-base font-semibold tracking-tight text-neutral-700 group-hover:text-neutral-900">Pre-Event Survey: ASUS Commercial Partner Gathering Palembang</span>
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
            <p className="leading-relaxed">Sales Training: 28 Agustus 2025, 12:00–15:00 WIB</p>
            <p className="leading-relaxed">Dealer Gathering: 28 Agustus 2025, 17:00–21:00 WIB</p>
          </section>
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-1">Lokasi</h3>
            <p className="leading-relaxed font-bold">Novotel Palembang Hotel & Residence</p>
            <p className="leading-relaxed">Jl. R. Sukamto No.8A, 8 Ilir, Kec. Ilir Tim. II, Kota Palembang</p>
            <a 
              href="https://maps.app.goo.gl/URWoxFAJFdEQ3GGH9" 
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
              Rudy – WA{' '}
              <a 
              href="https://wa.me/6282118055558" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-asus-primary hover:text-asus-primary/80 font-medium transition-colors"
              >
              62 821-1805-5558
              </a>
              {' '}(
              <a 
              href="mailto:Rudy_Nurifansyah1@asus.com"
              className="text-asus-primary hover:text-asus-primary/80 font-medium transition-colors"
              >
              Rudy_Nurifansyah1@asus.com
              </a>
              )
            </p>
          </section>
          <p className="text-[11px] text-neutral-500">Silakan sesuaikan informasi ini sebelum dibagikan ke peserta.</p>
        </div>
      )}
    </div>
  );
}
