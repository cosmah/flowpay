import { NextResponse } from "next/server"
import {
  fieldErrorsFromZod,
  inviteMemberSchema,
  sanitizeAuthInput,
} from "@/lib/auth/validation"
import { inviteEmailHtml, sendEmail } from "@/lib/email/resend"
import { createClient } from "@/lib/supabase/server"

function siteOrigin(request: Request) {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (envUrl) return envUrl.replace(/\/$/, "")
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host")
  const proto = request.headers.get("x-forwarded-proto") || "http"
  return host ? `${proto}://${host}` : "http://localhost:3000"
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, name, role, company_id")
      .eq("id", user.id)
      .maybeSingle()

    if (!profile || profile.role !== "admin" || !profile.company_id) {
      return NextResponse.json(
        { error: "Only company admins can invite teammates." },
        { status: 403 }
      )
    }

    const body = await request.json()
    const parsed = inviteMemberSchema.safeParse({
      email: sanitizeAuthInput(String(body.email ?? "")),
      role: body.role,
    })

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid invite.",
          fields: fieldErrorsFromZod(parsed.error),
        },
        { status: 400 }
      )
    }

    const { data: company } = await supabase
      .from("companies")
      .select("id, name")
      .eq("id", profile.company_id)
      .maybeSingle()

    if (!company) {
      return NextResponse.json({ error: "Company not found." }, { status: 404 })
    }

    const { data: invite, error: inviteError } = await supabase
      .from("invitations")
      .insert({
        company_id: company.id,
        email: parsed.data.email,
        role: parsed.data.role,
        invited_by: profile.id,
      })
      .select("*")
      .single()

    if (inviteError || !invite) {
      return NextResponse.json(
        { error: inviteError?.message ?? "Could not create invite." },
        { status: 400 }
      )
    }

    const origin = siteOrigin(request)
    const inviteUrl = `${origin}/register?invite=${invite.token}&email=${encodeURIComponent(parsed.data.email)}`

    await sendEmail({
      to: parsed.data.email,
      subject: `Join ${company.name} on FlowPay`,
      html: inviteEmailHtml({
        companyName: company.name,
        role: parsed.data.role,
        inviteUrl,
        inviterName: profile.name,
      }),
    })

    return NextResponse.json({ ok: true, invite })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invite failed."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
