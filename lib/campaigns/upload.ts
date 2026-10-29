import { createClient } from "@/lib/supabase/client"

const BUCKET = "campaign-banners"
const MAX_BYTES = 10 * 1024 * 1024

export function isImageFile(file: File) {
  return file.type.startsWith("image/") || /\.(jpe?g|png|gif|webp|svg|bmp|avif|heic|heif)$/i.test(file.name)
}

export async function uploadCampaignImages(
  files: File[],
  companyId: string
): Promise<{ urls: string[] } | { error: string }> {
  if (files.length === 0) return { urls: [] }

  for (const file of files) {
    if (!isImageFile(file)) {
      return { error: `“${file.name}” is not an image.` }
    }
    if (file.size > MAX_BYTES) {
      return { error: `“${file.name}” is larger than 10MB.` }
    }
  }

  const supabase = createClient()
  const urls: string[] = []

  for (const file of files) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "bin"
    const path = `${companyId}/${crypto.randomUUID()}.${ext}`
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    })
    if (error) {
      return { error: error.message || `Could not upload “${file.name}”.` }
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    urls.push(data.publicUrl)
  }

  return { urls }
}
