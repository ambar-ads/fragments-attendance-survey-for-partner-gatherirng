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
    const { name, phone, email, company, foodPreference, attending, salesTrainingParticipants } = body;

    if (!name || !phone || !email || !company || !foodPreference || typeof attending !== 'boolean') {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    // Validasi food preference
    if (!['Daging', 'Ikan', 'Vegan'].includes(foodPreference)) {
      return NextResponse.json({ error: 'Preferensi makanan tidak valid' }, { status: 400 });
    }

    // Validasi sales training participants
    if (!salesTrainingParticipants || !salesTrainingParticipants.participant1) {
      return NextResponse.json({ error: 'Data peserta sales training tidak lengkap' }, { status: 400 });
    }

    const { participant1, participant2 } = salesTrainingParticipants;

    // Validasi participant1 (wajib)
    if (!participant1.name || !participant1.phone || !participant1.email || !participant1.foodPreference) {
      return NextResponse.json({ error: 'Data Peserta 1 sales training tidak lengkap' }, { status: 400 });
    }

    // Validasi food preference participant1
    if (!['Daging', 'Ikan', 'Vegan'].includes(participant1.foodPreference)) {
      return NextResponse.json({ error: 'Preferensi makanan Peserta 1 tidak valid' }, { status: 400 });
    }

    // Validasi participant2 (opsional, tapi jika ada harus lengkap)
    if (participant2 && (participant2.name || participant2.phone || participant2.email || participant2.foodPreference)) {
      if (!participant2.name || !participant2.phone || !participant2.email || !participant2.foodPreference) {
        return NextResponse.json({ error: 'Jika mengisi Peserta 2, mohon lengkapi semua data' }, { status: 400 });
      }
      if (!['Daging', 'Ikan', 'Vegan'].includes(participant2.foodPreference)) {
        return NextResponse.json({ error: 'Preferensi makanan Peserta 2 tidak valid' }, { status: 400 });
      }
    }

    // Siapkan data sales training participants untuk disimpan
    const insertData = {
      name,
      phone,
      email,
      company,
      food_preference: foodPreference,
      attending,
      // Sales Training Participant 1 (wajib)
      st_participant_01_name: participant1.name.trim(),
      st_participant_01_phone: participant1.phone.trim(),
      st_participant_01_email: participant1.email.trim(),
      st_participant_01_food_preference: participant1.foodPreference,
      // Sales Training Participant 2 (opsional)
      st_participant_02_name: participant2 && participant2.name ? participant2.name.trim() : null,
      st_participant_02_phone: participant2 && participant2.phone ? participant2.phone.trim() : null,
      st_participant_02_email: participant2 && participant2.email ? participant2.email.trim() : null,
      st_participant_02_food_preference: participant2 && participant2.foodPreference ? participant2.foodPreference : null
    };

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('event_rsvps').insert(insertData);

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
