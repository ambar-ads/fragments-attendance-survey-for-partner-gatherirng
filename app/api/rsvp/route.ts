import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase env vars not set');
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, company, attending } = body;

    if (!name || !phone || !company || typeof attending !== 'boolean') {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('event_rsvps').insert({
      name,
      phone,
      company,
      attending
    });

    if (error) {
      console.error('Supabase insert error', error);
      return NextResponse.json({ error: 'Gagal menyimpan data' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
