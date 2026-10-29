/**
 * Server Supabase client stub for Route Handlers / Server Components.
 * Partner owns backend wiring; keep all server access through this module.
 */

export async function createClient(): Promise<null> {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null
  }

  return null
}
