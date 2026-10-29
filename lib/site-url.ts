/** Never return an unusable origin (avoids `http://undefined/` in emails). */
export function resolveSiteOrigin(request?: Request): string {
  const fromEnv = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.SITE_URL,
  ]

  const fromRequest = request
    ? (() => {
        const host =
          request.headers.get("x-forwarded-host") ||
          request.headers.get("host")
        if (!host || host === "undefined") return null
        const proto =
          request.headers.get("x-forwarded-proto") ||
          (host.includes("localhost") ? "http" : "https")
        return `${proto}://${host}`
      })()
    : null

  for (const candidate of [...fromEnv, fromRequest]) {
    const origin = normalizeOrigin(candidate)
    if (origin) return origin
  }

  return "http://localhost:3000"
}

function normalizeOrigin(value: string | null | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed || /undefined|null/i.test(trimmed)) return null
  try {
    const url = new URL(trimmed.includes("://") ? trimmed : `http://${trimmed}`)
    if (url.protocol !== "http:" && url.protocol !== "https:") return null
    if (!url.hostname || url.hostname === "undefined") return null
    return url.origin
  } catch {
    return null
  }
}
