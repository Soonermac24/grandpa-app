import { createClient } from '@supabase/supabase-js'

// Server-side client — uses env vars directly (not NEXT_PUBLIC_)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
