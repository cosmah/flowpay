import { NextResponse } from "next/server"
import { generateInvitePassword } from "@/lib/auth/password"
import {
  fieldErrorsFromZod,
  inviteMemberSchema,
  sanitizeAuthInput,
} from "@/lib/auth/validation"
import { inviteEmailHtml, sendEmail } from "@/lib/email/resend"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { ROLE_LABELS } from "@/types"

function siteOrigin(request: Request) {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (envUrl) return envUrl.replace(/\/$/, "")
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host")
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
      name: sanitizeAuthInput(String(body.name ?? "")),
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

    const { name, email, role } = parsed.data

    const { data: company } = await supabase
      .from("companies")
      .select("id, name")
      .eq("id", profile.company_id)
      .maybeSingle()

    if (!company) {
      return NextResponse.json({ error: "Company not found." }, { status: 404 })
    }

    const { data: existingMember } = await supabase
      .from("profiles")
      .select("id")
      .eq("company_id", company.id)
      .ilike("email", email)
      .maybeSingle()

    if (existingMember) {
      return NextResponse.json(
        { error: "A member with that email already exists in your company." },
        { status: 409 }
      )
    }

    // Replace any stale pending invite for this email in the company.
    await supabase
      .from("invitations")
      .delete()
      .eq("company_id", company.id)
      .eq("status", "pending")
      .ilike("email", email)

    const { data: invite, error: inviteError } = await supabase
      .from("invitations")
      .insert({
        company_id: company.id,
        email,
        role,
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

    const password = generateInvitePassword()
    const admin = createAdminClient()

    const { data: created, error: createError } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name,
          role,
          invite_token: invite.token,
        },
      })

    if (createError || !created.user) {
      await supabase.from("invitations").delete().eq("id", invite.id)
      const message = createError?.message ?? "Could not create member account."
      const status = /already|registered|exists/i.test(message) ? 409 : 400
      return NextResponse.json(
        {
          error: /already|registered|exists/i.test(message)
            ? "That email is already registered."
            : message,
        },
        { status }
      )
    }

    const origin = siteOrigin(request)
    const loginUrl = `${origin}/login`

    try {
      await sendEmail({
        to: email,
        subject: `Join ${company.name} on FlowPay`,
        html: inviteEmailHtml({
          name,
          email,
          password,
          companyName: company.name,
          role: ROLE_LABELS[role],
          loginUrl,
          inviterName: profile.name,
        }),
      })
    } catch (emailError) {
      await admin.auth.admin.deleteUser(created.user.id)
      await supabase.from("invitations").delete().eq("id", invite.id)
      const message =
        emailError instanceof Error
          ? emailError.message
          : "Could not send invite email."
      return NextResponse.json({ error: message }, { status: 502 })
    }

    const { data: memberProfile } = await admin
      .from("profiles")
      .select("*")
      .eq("id", created.user.id)
      .maybeSingle()

    return NextResponse.json({
      ok: true,
      member: memberProfile
        ? {
            id: memberProfile.id,
            name: memberProfile.name,
            email: memberProfile.email,
            role: memberProfile.role,
            status: memberProfile.status,
          }
        : {
            id: created.user.id,
            name,
            email,
            role,
            status: "active" as const,
          },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invite failed."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
