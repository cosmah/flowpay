import { generateInvitePassword } from "@/lib/auth/password"
import {
  inviteEmailHtml,
  inviteEmailText,
  sendEmail,
} from "@/lib/email/resend"
import { resolveSiteOrigin } from "@/lib/site-url"
import { createAdminClient } from "@/lib/supabase/admin"
import type { ProfileRole } from "@/lib/supabase/types"
import { ROLE_LABELS, type UserRole } from "@/types"

function inviteLoginUrl(request: Request, email: string) {
  const origin = resolveSiteOrigin(request)
  const url = new URL("/login", origin)
  url.searchParams.set("email", email)
  return url.toString()
}

export async function provisionCompanyInvite(input: {
  request: Request
  company: { id: string; name: string }
  inviter: { id: string; name: string }
  name: string
  email: string
  role: ProfileRole
  /** Authenticated supabase client (for invitation row writes under RLS). */
  supabase: {
    from: (table: string) => any
  }
}) {
  const { request, company, inviter, name, email, role, supabase } = input
  const admin = createAdminClient()
  const password = generateInvitePassword()
  const loginUrl = inviteLoginUrl(request, email)

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
      invited_by: inviter.id,
    })
    .select("*")
    .single()

  if (inviteError || !invite) {
    throw new Error(inviteError?.message ?? "Could not create invite.")
  }

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
    const err = new Error(
      /already|registered|exists/i.test(message)
        ? "That email is already registered. Use Resend invite instead."
        : message
    )
    ;(err as Error & { status?: number }).status =
      /already|registered|exists/i.test(message) ? 409 : 400
    throw err
  }

  try {
    await sendInviteCredentialsEmail({
      request,
      to: email,
      name,
      password,
      companyName: company.name,
      role,
      inviterName: inviter.name,
    })
  } catch (emailError) {
    await admin.auth.admin.deleteUser(created.user.id)
    await supabase.from("invitations").delete().eq("id", invite.id)
    throw emailError
  }

  const { data: memberProfile } = await admin
    .from("profiles")
    .select("*")
    .eq("id", created.user.id)
    .maybeSingle()

  return {
    password,
    loginUrl,
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
  }
}

export async function resendMemberInvite(input: {
  request: Request
  member: {
    id: string
    name: string
    email: string
    role: ProfileRole
  }
  companyName: string
  inviterName: string
}) {
  const admin = createAdminClient()
  const password = generateInvitePassword()

  const { error } = await admin.auth.admin.updateUserById(input.member.id, {
    password,
    email_confirm: true,
    user_metadata: {
      name: input.member.name,
      role: input.member.role,
    },
  })

  if (error) {
    throw new Error(error.message || "Could not reset invite password.")
  }

  await sendInviteCredentialsEmail({
    request: input.request,
    to: input.member.email,
    name: input.member.name,
    password,
    companyName: input.companyName,
    role: input.member.role,
    inviterName: input.inviterName,
  })

  return { ok: true as const }
}

async function sendInviteCredentialsEmail(input: {
  request: Request
  to: string
  name: string
  password: string
  companyName: string
  role: ProfileRole
  inviterName: string
}) {
  if (!input.password?.trim()) {
    throw new Error("Invite password missing — email not sent.")
  }

  const loginUrl = inviteLoginUrl(input.request, input.to)
  const roleLabel = ROLE_LABELS[input.role as UserRole] ?? input.role
  const payload = {
    name: input.name,
    email: input.to,
    password: input.password,
    companyName: input.companyName,
    role: roleLabel,
    loginUrl,
    inviterName: input.inviterName,
  }

  await sendEmail({
    to: input.to,
    subject: `Join ${input.companyName} on FlowPay — your login details`,
    html: inviteEmailHtml(payload),
    text: inviteEmailText(payload),
  })
}
