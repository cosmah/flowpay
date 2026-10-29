import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * Confirms a newly registered user so local/dev can sign in without mailbox setup.
 * Requires SUPABASE_SERVICE_ROLE_KEY (server-only).
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { userId?: string }
    if (!body.userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 })
    }

    const admin = createAdminClient()
    const { error } = await admin.auth.admin.updateUserById(body.userId, {
      email_confirm: true,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not confirm user"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
