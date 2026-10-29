export async function sendEmail(input: {
  to: string
  subject: string
  html: string
  text?: string
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
      text: input.text,
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
  const loginUrl = input.loginUrl
  const password = input.password

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;color:#14212b;background:#ffffff;padding:24px;max-width:560px;">
    <h1 style="font-size:22px;margin:0 0 16px;color:#14212b;">You're invited to FlowPay</h1>
    <p style="margin:0 0 12px;color:#14212b;">Hi ${escapeHtml(input.name)},</p>
    <p style="margin:0 0 16px;color:#14212b;">
      ${escapeHtml(input.inviterName)} invited you to join
      <strong>${escapeHtml(input.companyName)}</strong> as a
      <strong>${escapeHtml(input.role)}</strong>.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 20px;border:1px solid #d7dee3;border-radius:12px;background:#f4f7f8;">
      <tr>
        <td style="padding:16px 18px;">
          <p style="margin:0 0 8px;font-size:13px;color:#5b6b76;text-transform:uppercase;letter-spacing:0.04em;">
            Sign-in details
          </p>
          <p style="margin:0 0 8px;color:#14212b;">
            Email:<br/>
            <strong style="font-size:16px;">${escapeHtml(input.email)}</strong>
          </p>
          <p style="margin:0;color:#14212b;">
            Temporary password:<br/>
            <strong style="font-size:18px;font-family:Consolas,Monaco,monospace;letter-spacing:0.04em;">
              ${escapeHtml(password)}
            </strong>
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 18px;">
      <a href="${escapeAttr(loginUrl)}"
         style="display:inline-block;background:#14212b;color:#ffffff;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:600;">
        Sign in to FlowPay
      </a>
    </p>

    <p style="margin:0 0 8px;font-size:13px;color:#5b6b76;">
      Sign-in page (copy if the button does not work):<br/>
      <a href="${escapeAttr(loginUrl)}" style="color:#0b6e4f;word-break:break-all;">${escapeHtml(loginUrl)}</a>
    </p>
    <p style="margin:0;font-size:13px;color:#5b6b76;">
      Use the temporary password above on first sign-in, then change it from Account.
    </p>
  </div>`
}

export function inviteEmailText(input: {
  name: string
  email: string
  password: string
  companyName: string
  role: string
  loginUrl: string
  inviterName: string
}) {
  return [
    `You're invited to FlowPay`,
    ``,
    `Hi ${input.name},`,
    ``,
    `${input.inviterName} invited you to join ${input.companyName} as a ${input.role}.`,
    ``,
    `Sign-in details`,
    `Email: ${input.email}`,
    `Temporary password: ${input.password}`,
    ``,
    `Sign in here: ${input.loginUrl}`,
    ``,
    `Change your password after your first sign-in.`,
  ].join("\n")
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
