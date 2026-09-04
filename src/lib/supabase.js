import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

/**
 * Checks if real/valid Supabase credentials are configured in environment variables.
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabasePublishableKey &&
  !supabaseUrl.includes('your-project') &&
  !supabasePublishableKey.includes('your-supabase-anon-key')
)

if (!isSupabaseConfigured) {
  console.warn(
    '[TeamFlow] Supabase credentials not found or placeholder values used.\n' +
    'To connect your backend, copy .env.example to .env.local and add your VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.'
  )
}

// Fallback dummy values to prevent createClient from throwing on initialization
const validUrl = supabaseUrl && supabaseUrl.startsWith('http')
  ? supabaseUrl
  : 'https://placeholder.supabase.co'
const validKey = supabasePublishableKey || 'placeholder-publishable-key'

/**
 * Shared Supabase client instance.
 * IMPORTANT: Uses ONLY the public publishable key. The service_role key must never be used on the client.
 */
export const supabase = createClient(validUrl, validKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
