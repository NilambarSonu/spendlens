import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

// Client-side/Public Client (uses public anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side/Admin Client (uses service role key to bypass RLS)
export const getSupabaseService = () => {
  return createClient(supabaseUrl, supabaseServiceRoleKey);
};
