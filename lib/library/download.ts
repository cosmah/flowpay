import { ensureGraphicMarkup } from "@/lib/library/graphic"
import type { LibraryItem } from "@/types"

export function slugifyTitle(title: string) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "asset"
  )
}

function triggerDownload(href: string, filename: string) {
  const anchor = document.createElement("a")
  anchor.href = href
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

export function downloadTextFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  triggerDownload(url, filename)
  URL.revokeObjectURL(url)
}

export function downloadSvgFile(svg: string, filename: string) {
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  triggerDownload(url, filename)
  URL.revokeObjectURL(url)
}

async function downloadRemoteImage(url: string, filenameBase: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("Could not download banner image.")
  }
  const blob = await response.blob()
  const extFromType = blob.type.split("/")[1]?.replace("jpeg", "jpg")
  const extFromUrl = url.split(".").pop()?.split("?")[0]
  const ext =
    (extFromType && extFromType.length <= 5 ? extFromType : null) ||
    (extFromUrl && /^[a-z0-9]+$/i.test(extFromUrl) ? extFromUrl : "png")
  const objectUrl = URL.createObjectURL(blob)
  triggerDownload(objectUrl, `${filenameBase}.${ext}`)
  URL.revokeObjectURL(objectUrl)
}

/** Render SVG markup to a PNG download; falls back to .svg on failure. */
export async function downloadGraphic(item: LibraryItem) {
  const svg = ensureGraphicMarkup(item.content, item.title)
  const base = slugifyTitle(item.title)

  try {
    const pngUrl = await svgToPngDataUrl(svg)
    triggerDownload(pngUrl, `${base}.png`)
  } catch {
    downloadSvgFile(svg, `${base}.svg`)
  }
}

export async function downloadLibraryItem(item: LibraryItem) {
  const base = slugifyTitle(item.title)
  let downloaded = false

  if (item.imageUrl) {
    await downloadRemoteImage(item.imageUrl, `${base}-banner`)
    downloaded = true
  }

  if (item.content?.trim()) {
    downloadTextFile(item.content, `${base}.txt`)
    downloaded = true
  }

  if (!downloaded && item.type === "graphic") {
    await downloadGraphic(item)
  }
}

function svgToPngDataUrl(svg: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const image = new Image()
    image.onload = () => {
      try {
        const canvas = document.createElement("canvas")
        canvas.width = image.naturalWidth || 800
        canvas.height = image.naturalHeight || 450
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          URL.revokeObjectURL(url)
          reject(new Error("Canvas unavailable"))
          return
        }
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(image, 0, 0)
        URL.revokeObjectURL(url)
        resolve(canvas.toDataURL("image/png"))
      } catch (error) {
        URL.revokeObjectURL(url)
        reject(error)
      }
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("SVG render failed"))
    }
    image.src = url
  })
}
