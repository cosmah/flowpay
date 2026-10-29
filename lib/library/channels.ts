import type { CampaignChannel } from "@/lib/campaigns/validation"

export const CHANNEL_LABELS: Record<string, string> = {
  email: "Email",
  linkedin: "LinkedIn",
  x: "X",
  instagram: "Instagram",
  sms: "SMS",
  web: "Web",
}

export function channelLabel(channel: string) {
  return CHANNEL_LABELS[channel] ?? channel
}

export function formatChannelVersion(
  title: string,
  channel: string | undefined
) {
  if (!channel) return title
  return `${title} · ${channelLabel(channel)}`
}

export type ShareTarget = CampaignChannel | "x"

export function shareUrlForChannel(
  channel: string,
  input: { title: string; content: string; imageUrl?: string }
): { href?: string; hint?: string } {
  const text = input.content.trim()
  const encoded = encodeURIComponent(text)
  const title = encodeURIComponent(input.title)
  const page = encodeURIComponent(input.imageUrl || "https://example.com")

  switch (channel) {
    case "linkedin":
      return {
        href: `https://www.linkedin.com/sharing/share-offsite/?url=${page}`,
        hint: "LinkedIn opens with a link share — paste your caption after opening.",
      }
    case "x":
      return {
        href: `https://twitter.com/intent/tweet?text=${encoded}`,
      }
    case "email":
      return {
        href: `mailto:?subject=${title}&body=${encoded}`,
      }
    case "sms":
      return {
        href: `sms:?&body=${encoded}`,
      }
    case "instagram":
      return {
        hint: "Instagram does not allow web publishing. Copy the caption, then post with your banner in the Instagram app.",
      }
    case "web":
      return {
        hint: "Copy the caption and banner, then publish on your site or CMS.",
      }
    default:
      return {
        hint: "Copy the caption and publish on the selected channel.",
      }
  }
}
