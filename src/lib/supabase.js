import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseKey.includes('placeholder')
);

if (!isSupabaseConfigured) {
  console.warn(
    '[TeamFlow] Supabase is not fully configured. Please provide real credentials in .env (VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY).'
  );
}

// Fallback dummy URL to allow client instantiation without runtime crash during initial setup
const validUrl = (supabaseUrl && supabaseUrl.startsWith('http')) ? supabaseUrl : 'https://placeholder.supabase.co';
const validKey = supabaseKey || 'placeholder-key';

export const supabase = createClient(validUrl, validKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
