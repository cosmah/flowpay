import { NextResponse } from "next/server"
import {
  fieldErrorsFromZod,
  inviteMemberSchema,
  sanitizeAuthInput,
} from "@/lib/auth/validation"
import { provisionCompanyInvite } from "@/lib/team/invite"
import { createClient } from "@/lib/supabase/server"

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
        {
          error:
            "A member with that email already exists. Use Resend invite to email a new password.",
        },
        { status: 409 }
      )
    }

    const result = await provisionCompanyInvite({
      request,
      company,
      inviter: { id: profile.id, name: profile.name },
      name,
      email,
      role,
      supabase,
    })

    return NextResponse.json({ ok: true, member: result.member })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invite failed."
    const status =
      (error as Error & { status?: number }).status ??
      (/already|registered|exists/i.test(message)
        ? 409
        : /email/i.test(message)
          ? 502
          : 500)
    return NextResponse.json({ error: message }, { status })
  }
}
