import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, pdfUrl } = body;

    if (!id || !pdfUrl) {
      return NextResponse.json(
        { error: 'ID and PDF URL are required' },
        { status: 400 }
      );
    }

    // Update PDF URL in the database
    const { data, error } = await supabase
      .from('acp_registrations')
      .update({ 
        form_submission_pdf_format: pdfUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating PDF URL:', error);
      return NextResponse.json(
        { error: 'Failed to update PDF URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'PDF URL updated successfully',
      data
    });

  } catch (error) {
    console.error('Error updating PDF URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
