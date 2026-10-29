export async function sendEmail(input: {
  to: string
  subject: string
  html: string
}) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL || "noreply@example.com"

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured")
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Email delivery failed: ${text}`)
  }

  return response.json()
}

export function verificationEmailHtml(input: {
  name: string
  companyName: string
  verifyUrl: string
}) {
  return `
  <div style="font-family: system-ui, sans-serif; line-height: 1.5; color: #14212b;">
    <h1 style="font-size: 20px;">Verify your FlowPay account</h1>
    <p>Hi ${escapeHtml(input.name)},</p>
    <p>
      Confirm your email to activate <strong>${escapeHtml(input.companyName)}</strong>
      on FlowPay. You will be the company admin.
    </p>
    <p>
      <a href="${escapeAttr(input.verifyUrl)}"
         style="display:inline-block;background:#14212b;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none;">
        Verify email
      </a>
    </p>
    <p style="font-size: 13px; color: #5b6b76;">
      If the button does not work, copy this link:<br/>
      ${escapeHtml(input.verifyUrl)}
    </p>
  </div>`
}

export function inviteEmailHtml(input: {
  name: string
  email: string
  password: string
  companyName: string
  role: string
  loginUrl: string
  inviterName: string
}) {
  const loginUrl = input.loginUrl || "http://localhost:3000/login"

  return `
  <div style="font-family: system-ui, sans-serif; line-height: 1.5; color: #14212b; background:#ffffff; padding:24px;">
    <h1 style="font-size: 20px; color:#14212b;">You're invited to FlowPay</h1>
    <p style="color:#14212b;">Hi ${escapeHtml(input.name)},</p>
    <p style="color:#14212b;">
      ${escapeHtml(input.inviterName)} invited you to join
      <strong>${escapeHtml(input.companyName)}</strong> as a
      <strong>${escapeHtml(input.role)}</strong>.
    </p>
    <p style="color:#14212b;"><strong>Your sign-in details</strong></p>
    <p style="color:#14212b; margin: 0 0 8px;">
      Email: <strong>${escapeHtml(input.email)}</strong>
    </p>
    <p style="color:#14212b; margin: 0 0 16px;">
      Temporary password:
      <strong style="font-family: ui-monospace, monospace; letter-spacing: 0.02em;">
        ${escapeHtml(input.password)}
      </strong>
    </p>
    <p>
      <a href="${escapeAttr(loginUrl)}"
         style="display:inline-block;background:#14212b;color:#ffffff;padding:12px 18px;border-radius:10px;text-decoration:none;">
        Sign in to FlowPay
      </a>
    </p>
    <p style="font-size: 13px; color: #5b6b76;">
      Sign-in page: ${escapeHtml(loginUrl)}<br/>
      Change your password after your first sign-in.
    </p>
  </div>`
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function escapeAttr(value: string) {
  return escapeHtml(value).replaceAll("'", "&#39;")
}
