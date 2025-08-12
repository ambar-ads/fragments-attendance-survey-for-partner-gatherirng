-- Tabel RSVP untuk acara
-- Jalankan di SQL editor Supabase Anda
create table if not exists public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  company text not null,
  attending boolean not null,
  created_at timestamptz not null default now()
);

-- (Opsional) Index untuk pencarian / laporan
create index if not exists event_rsvps_created_at_idx on public.event_rsvps(created_at desc);
create index if not exists event_rsvps_attending_idx on public.event_rsvps(attending);

-- (Opsional) Policy RLS jika ingin mengaktifkan Row Level Security
-- alter table public.event_rsvps enable row level security;
-- create policy "Allow inserts" on public.event_rsvps for insert with check (true);
