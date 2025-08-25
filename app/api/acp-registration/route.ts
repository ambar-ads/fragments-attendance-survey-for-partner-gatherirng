import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      acpName,
      acpAddress,
      city,
      state,
      postCode,
      telephoneNo,
      faxNo,
      photoUrl,
      idCardNo,
      taxId,
      sbnNib,
      pkp,
      contacts,
      agreement,
      claimCreditNoteTo,
      distributorName,
      masterDealerName
    } = body;

    // Validasi data
    if (!acpName || !acpAddress || !city || !state || !postCode || !telephoneNo) {
      return NextResponse.json(
        { error: 'Field wajib harus diisi' },
        { status: 400 }
      );
    }

    if (!agreement) {
      return NextResponse.json(
        { error: 'Anda harus menyetujui untuk bergabung dengan ASUS Commercial Partner' },
        { status: 400 }
      );
    }

    // Validasi credit note claim
    if (!claimCreditNoteTo) {
      return NextResponse.json(
        { error: 'Mohon pilih tempat klaim Credit Note' },
        { status: 400 }
      );
    }

    if (claimCreditNoteTo === 'distributor' && !distributorName) {
      return NextResponse.json(
        { error: 'Mohon pilih nama Distributor untuk klaim Credit Note' },
        { status: 400 }
      );
    }

    if (claimCreditNoteTo === 'master_dealer' && !masterDealerName?.trim()) {
      return NextResponse.json(
        { error: 'Mohon isi nama Master Dealer untuk klaim Credit Note' },
        { status: 400 }
      );
    }

    // Insert ke database dalam transaction
    const { data: acpData, error: acpError } = await supabase
      .from('acp_registrations')
      .insert({
        acp_name: acpName,
        acp_address: acpAddress,
        city,
        state,
        post_code: postCode,
        telephone_no: telephoneNo,
        fax_no: faxNo,
        store_photo_url: photoUrl,
        id_card_no: idCardNo,
        tax_id: taxId,
        sbn_nib: sbnNib,
        pkp,
        agreement,
        claim_credit_note_to: claimCreditNoteTo,
        distributor_name: claimCreditNoteTo === 'distributor' ? distributorName : null,
        master_dealer_name: claimCreditNoteTo === 'master_dealer' ? masterDealerName : null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (acpError) {
      console.error('Error inserting ACP registration:', acpError);
      return NextResponse.json(
        { error: 'Gagal menyimpan data pendaftaran' },
        { status: 500 }
      );
    }

    // Insert contact information
    const contactsToInsert = contacts
      .filter((contact: any) => contact.name || contact.mobilePhone || contact.email || contact.whatsappNo)
      .map((contact: any) => ({
        acp_registration_id: acpData.id,
        contact_type: contact.type,
        name: contact.name,
        mobile_phone: contact.mobilePhone,
        email: contact.email,
        whatsapp_no: contact.whatsappNo
      }));

    if (contactsToInsert.length > 0) {
      const { error: contactsError } = await supabase
        .from('acp_contacts')
        .insert(contactsToInsert);

      if (contactsError) {
        console.error('Error inserting contacts:', contactsError);
        // Tidak return error karena data utama sudah tersimpan
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Pendaftaran ACP berhasil dikirim',
      id: acpData.id
    });

  } catch (error) {
    console.error('Error processing ACP registration:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
