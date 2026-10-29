import { NextResponse } from "next/server"
import { resendMemberInvite } from "@/lib/team/invite"
import { createClient } from "@/lib/supabase/server"
import type { ProfileRole } from "@/lib/supabase/types"

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
        { error: "Only company admins can resend invites." },
        { status: 403 }
      )
    }

    const body = await request.json()
    const memberId = String(body.memberId ?? "").trim()
    if (!memberId) {
      return NextResponse.json(
        { error: "Member id is required." },
        { status: 400 }
      )
    }

    if (memberId === profile.id) {
      return NextResponse.json(
        { error: "You cannot resend an invite to yourself." },
        { status: 400 }
      )
    }

    const { data: member } = await supabase
      .from("profiles")
      .select("id, name, email, role, company_id")
      .eq("id", memberId)
      .eq("company_id", profile.company_id)
      .maybeSingle()

    if (!member) {
      return NextResponse.json(
        { error: "Member not found in your company." },
        { status: 404 }
      )
    }

    const { data: company } = await supabase
      .from("companies")
      .select("name")
      .eq("id", profile.company_id)
      .maybeSingle()

    if (!company) {
      return NextResponse.json({ error: "Company not found." }, { status: 404 })
    }

    await resendMemberInvite({
      request,
      member: {
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role as ProfileRole,
      },
      companyName: company.name,
      inviterName: profile.name,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not resend invite."
    return NextResponse.json(
      { error: message },
      { status: /email/i.test(message) ? 502 : 500 }
    )
  }
}
