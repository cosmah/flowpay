import { NextResponse } from "next/server"
import {
  fieldErrorsFromZod,
  inviteRegisterSchema,
  registerSchema,
  sanitizeAuthInput,
} from "@/lib/auth/validation"
import { sendEmail, verificationEmailHtml } from "@/lib/email/resend"
import { resolveSiteOrigin } from "@/lib/site-url"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const isInvite = Boolean(body.inviteToken)

    const parsed = isInvite
      ? inviteRegisterSchema.safeParse({
          name: sanitizeAuthInput(String(body.name ?? "")),
          email: sanitizeAuthInput(String(body.email ?? "")),
          password: body.password,
          confirmPassword: body.confirmPassword,
          inviteToken: sanitizeAuthInput(String(body.inviteToken ?? "")),
        })
      : registerSchema.safeParse({
          name: sanitizeAuthInput(String(body.name ?? "")),
          companyName: sanitizeAuthInput(String(body.companyName ?? "")),
          email: sanitizeAuthInput(String(body.email ?? "")),
          password: body.password,
          confirmPassword: body.confirmPassword,
        })

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: "Fix the highlighted fields and try again.",
          fields: fieldErrorsFromZod(parsed.error),
        },
        { status: 400 }
      )
    }

    const admin = createAdminClient()
    const origin = resolveSiteOrigin(request)
    const emailRedirectTo = `${origin}/auth/callback`

    const metadata = isInvite
      ? {
          name: parsed.data.name,
          role: "marketer",
          invite_token: (parsed.data as { inviteToken: string }).inviteToken,
        }
      : {
          name: parsed.data.name,
          role: "admin",
          company_name: (parsed.data as { companyName: string }).companyName,
        }

    // generateLink({ type: 'signup' }) creates the auth user + confirmation link.
    const { data: linkData, error: linkError } =
      await admin.auth.admin.generateLink({
        type: "signup",
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          redirectTo: emailRedirectTo,
          data: metadata,
        },
      })

    if (linkError || !linkData.properties?.action_link) {
      const message = linkError?.message ?? "Could not create account."
      const status = /already|registered|exists/i.test(message) ? 409 : 400
      return NextResponse.json(
        {
          ok: false,
          message,
          fields: /already|registered|exists/i.test(message)
            ? { email: "Email is already registered" }
            : { form: message },
        },
        { status }
      )
    }

    const companyName = isInvite
      ? "your team"
      : (parsed.data as { companyName: string }).companyName

    await sendEmail({
      to: parsed.data.email,
      subject: "Verify your FlowPay account",
      html: verificationEmailHtml({
        name: parsed.data.name,
        companyName,
        verifyUrl: linkData.properties.action_link,
      }),
    })

    return NextResponse.json({
      ok: true,
      needsVerification: true,
      message: "Check your email to verify your account before signing in.",
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Registration failed."
    return NextResponse.json({ ok: false, message }, { status: 500 })
  }
}
