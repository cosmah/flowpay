import { createClient } from "@supabase/supabase-js"
import type { Database } from "./types"
import { getSupabaseUrl } from "./env"

/** Server-only admin client (service role). Never import from client components. */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY")
  }
  return createClient<Database>(getSupabaseUrl(), key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
