/**
 * Browser Supabase client — wire this up once env keys are available.
 *
 * Partner backend owns schema/auth. Frontend should import from here only.
 *
 * Example (when ready):
 *   import { createBrowserClient } from "@supabase/ssr"
 *   export function createClient() {
 *     return createBrowserClient(
 *       process.env.NEXT_PUBLIC_SUPABASE_URL!,
 *       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
 *     )
 *   }
 */

export function createClient(): null {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null
  }

  // Replace stub when @supabase/ssr is installed and keys are set.
  return null
}
