/** Build a promotional SVG from a visual draft brief (or pass through existing SVG / data URL). */
export function ensureGraphicMarkup(content: string, title = "Promotional graphic"): string {
  const trimmed = content.trim()
  if (trimmed.startsWith("<svg") || trimmed.startsWith("data:image")) {
    return trimmed
  }

  const safeTitle = escapeXml(title)
  const lines = wrapText(trimmed.replace(/^\[Visual brief\]\s*/i, ""), 48)
  const textNodes = lines
    .slice(0, 6)
    .map(
      (line, index) =>
        `<text x="48" y="${210 + index * 28}" fill="#e8f4f2" font-family="Georgia, serif" font-size="18">${escapeXml(line)}</text>`
    )
    .join("")

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b3d3a"/>
      <stop offset="100%" stop-color="#14635c"/>
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#bg)"/>
  <path d="M80 120 C220 40, 420 40, 560 120 S780 220, 720 320" fill="none" stroke="#7fd4c7" stroke-width="6" opacity="0.7"/>
  <text x="48" y="72" fill="#f4faf8" font-family="Georgia, serif" font-size="36" font-weight="700">Campaign</text>
  <text x="48" y="118" fill="#9be0d5" font-family="system-ui, sans-serif" font-size="16">${safeTitle}</text>
  <rect x="48" y="140" width="120" height="32" rx="16" fill="#6ee7b7"/>
  <text x="68" y="161" fill="#064e3b" font-family="system-ui, sans-serif" font-size="14" font-weight="600">Approved</text>
  ${textNodes}
</svg>`
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function wrapText(text: string, max: number): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ""
  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length > max && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  }
  if (current) lines.push(current)
  return lines.length ? lines : ["Promotional graphic"]
}
