// client-side
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/external/database/database.types'

export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)
