export async function sendEmail(input: {
  to: string
  subject: string
  html: string
}) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"

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
    throw new Error(`Resend failed: ${text}`)
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
      <a href="${input.verifyUrl}"
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
  companyName: string
  role: string
  inviteUrl: string
  inviterName: string
}) {
  return `
  <div style="font-family: system-ui, sans-serif; line-height: 1.5; color: #14212b;">
    <h1 style="font-size: 20px;">You're invited to FlowPay</h1>
    <p>
      ${escapeHtml(input.inviterName)} invited you to join
      <strong>${escapeHtml(input.companyName)}</strong> as a
      <strong>${escapeHtml(input.role)}</strong>.
    </p>
    <p>
      <a href="${input.inviteUrl}"
         style="display:inline-block;background:#14212b;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none;">
        Accept invite
      </a>
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
