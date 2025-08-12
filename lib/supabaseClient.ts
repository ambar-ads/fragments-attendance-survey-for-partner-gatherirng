// Simple browser Supabase client. For server components / route handlers you can
// create a separate client if you need admin operations (using service key on server only).
import { createClient } from '@supabase/supabase-js';

// These will be provided via env variables. Ensure you add them to .env.local
// NEXT_PUBLIC_SUPABASE_URL=...
// NEXT_PUBLIC_SUPABASE_ANON_KEY=...
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
});
