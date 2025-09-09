import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    console.log('Starting PDF upload process...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string;
    const folder = formData.get('folder') as string;

    if (!file) {
      console.error('No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!bucket || !folder) {
      console.error('Bucket and folder are required');
      return NextResponse.json({ error: 'Bucket and folder are required' }, { status: 400 });
    }

    console.log(`Uploading file: ${file.name}, size: ${file.size} bytes`);

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${folder}/${timestamp}-${file.name}`;

    console.log(`Uploading to Supabase storage: ${bucket}/${fileName}`);

    // Upload to Supabase Storage with optimized options
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: 'application/pdf',
        upsert: false,
        cacheControl: '3600', // Cache for 1 hour
        duplex: 'half' // Add duplex setting for better compatibility
      });

    if (error) {
      console.error('Supabase storage error:', error);
      return NextResponse.json({ 
        error: `Storage upload failed: ${error.message}` 
      }, { status: 500 });
    }

    console.log('File uploaded successfully, generating public URL...');

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    console.log('Upload completed successfully');

    return NextResponse.json({
      success: true,
      data: {
        path: data.path,
        publicUrl: publicUrlData.publicUrl,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
        return NextResponse.json(
          { error: 'Upload timeout - please try again with a smaller file or better connection' },
          { status: 408 }
        );
      }
      
      return NextResponse.json(
        { error: `Upload failed: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
