export type ButtonFill =
  | { mode: "solid"; color: string }
  | { mode: "gradient"; from: string; to: string }

export type VisualDraftSpec = {
  version: 1
  kind: "visual"
  product: string
  cta: string
  background: string
  button: ButtonFill
  buttonTextColor: string
}

export const SOLID_BUTTON_PRESETS = [
  { label: "White", color: "#ffffff", text: "#0f766e" },
  { label: "Ink", color: "#0f172a", text: "#ffffff" },
  { label: "Lagoon", color: "#0d9488", text: "#ffffff" },
  { label: "Amber", color: "#f59e0b", text: "#1c1917" },
  { label: "Rose", color: "#e11d48", text: "#ffffff" },
] as const

export const GRADIENT_BUTTON_PRESETS = [
  {
    label: "Lagoon",
    from: "#0f766e",
    to: "#5eead4",
    text: "#042f2e",
  },
  {
    label: "Sunset",
    from: "#f97316",
    to: "#ef4444",
    text: "#ffffff",
  },
  {
    label: "Ocean",
    from: "#0369a1",
    to: "#22d3ee",
    text: "#ffffff",
  },
  {
    label: "Violet",
    from: "#6d28d9",
    to: "#c084fc",
    text: "#ffffff",
  },
] as const

export function createVisualDraftSpec(input: {
  product: string
  cta: string
  background?: string
  button?: ButtonFill
  buttonTextColor?: string
}): VisualDraftSpec {
  return {
    version: 1,
    kind: "visual",
    product: input.product.trim() || "Campaign",
    cta: input.cta.trim() || "Learn more",
    background: input.background ?? "#0f766e",
    button: input.button ?? { mode: "solid", color: "#ffffff" },
    buttonTextColor: input.buttonTextColor ?? "#0f766e",
  }
}

export function serializeVisualDraft(spec: VisualDraftSpec): string {
  return JSON.stringify(spec)
}

export function parseVisualDraft(
  content: string,
  fallback?: { product?: string; cta?: string; title?: string }
): VisualDraftSpec | null {
  const trimmed = content.trim()
  if (!trimmed) return null

  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as Partial<VisualDraftSpec>
      if (parsed.kind === "visual" && parsed.product && parsed.cta) {
        return createVisualDraftSpec({
          product: parsed.product,
          cta: parsed.cta,
          background: parsed.background,
          button: normalizeButton(parsed.button),
          buttonTextColor: parsed.buttonTextColor,
        })
      }
    } catch {
      // Fall through to SVG / plain text parsing.
    }
  }

  if (trimmed.startsWith("<svg") || trimmed.startsWith("data:image")) {
    const texts = [...trimmed.matchAll(/<text\b[^>]*>([^<]*)<\/text>/gi)].map(
      (match) => decodeXml(match[1].trim())
    )
    const product =
      texts[0] ||
      fallback?.product ||
      fallback?.title ||
      "Campaign"
    const cta = texts[1] || fallback?.cta || "Learn more"
    const bgMatch = trimmed.match(
      /<rect[^>]*fill="(#[0-9a-fA-F]{3,8}|rgb\([^)]+\))"/
    )
    return createVisualDraftSpec({
      product,
      cta,
      background: bgMatch?.[1] ?? "#0f766e",
    })
  }

  if (fallback?.product || fallback?.cta) {
    return createVisualDraftSpec({
      product: fallback.product ?? fallback.title ?? "Campaign",
      cta: fallback.cta ?? "Learn more",
    })
  }

  return null
}

export function buttonBackgroundCss(button: ButtonFill): string {
  if (button.mode === "gradient") {
    return `linear-gradient(135deg, ${button.from}, ${button.to})`
  }
  return button.color
}

export function visualDraftToSvg(spec: VisualDraftSpec): string {
  const product = escapeXml(spec.product)
  const cta = escapeXml(spec.cta)
  const textColor = escapeXml(spec.buttonTextColor)
  const bg = escapeXml(spec.background)

  const buttonFill =
    spec.button.mode === "gradient"
      ? "url(#ctaGradient)"
      : escapeXml(spec.button.color)

  const gradientDefs =
    spec.button.mode === "gradient"
      ? `<linearGradient id="ctaGradient" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0%" stop-color="${escapeXml(spec.button.from)}"/>
  <stop offset="100%" stop-color="${escapeXml(spec.button.to)}"/>
</linearGradient>`
      : ""

  // Approximate button width from CTA length for the export snapshot.
  const buttonWidth = Math.min(720, Math.max(280, spec.cta.length * 22 + 80))
  const buttonX = (1080 - buttonWidth) / 2

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs>${gradientDefs}</defs>
  <rect width="1080" height="1080" fill="${bg}"/>
  <text x="540" y="460" text-anchor="middle" fill="white" font-size="64" font-family="system-ui, sans-serif" font-weight="700">${product}</text>
  <rect x="${buttonX}" y="520" width="${buttonWidth}" height="88" rx="44" fill="${buttonFill}"/>
  <text x="540" y="576" text-anchor="middle" fill="${textColor}" font-size="36" font-family="system-ui, sans-serif" font-weight="600">${cta}</text>
</svg>`
}

function normalizeButton(button: Partial<ButtonFill> | undefined): ButtonFill {
  if (button?.mode === "gradient" && button.from && button.to) {
    return { mode: "gradient", from: button.from, to: button.to }
  }
  if (button?.mode === "solid" && button.color) {
    return { mode: "solid", color: button.color }
  }
  return { mode: "solid", color: "#ffffff" }
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function decodeXml(value: string) {
  return value
    .replaceAll("&quot;", '"')
    .replaceAll("&gt;", ">")
    .replaceAll("&lt;", "<")
    .replaceAll("&amp;", "&")
}
