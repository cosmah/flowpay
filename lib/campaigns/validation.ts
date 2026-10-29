import { z } from "zod"
import { sanitizeAuthInput } from "@/lib/auth/validation"
import type { CampaignBrief, CampaignStatus } from "@/types"

export const CAMPAIGN_CHANNELS = [
  "email",
  "linkedin",
  "instagram",
  "sms",
  "web",
] as const

export type CampaignChannel = (typeof CAMPAIGN_CHANNELS)[number]

export const CAMPAIGN_STATUSES: CampaignStatus[] = [
  "draft",
  "in_review",
  "approved",
  "changes_requested",
]

const requiredText = (label: string, min = 3, max = 200) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .min(min, `${label} must be at least ${min} characters`)
    .max(max, `${label} must be ${max} characters or fewer`)

/** Manual campaign: title, post content, channel, optional banners. */
export const campaignBriefSchema = z.object({
  projectId: z.string().trim().min(1, "Select a project"),
  title: requiredText("Title", 3, 80),
  content: requiredText("Content", 10, 4000),
  channels: z
    .array(z.enum(CAMPAIGN_CHANNELS))
    .min(1, "Select at least one channel"),
  deadline: z
    .string()
    .optional()
    .transform((value) => (value?.trim() ? value.trim() : undefined))
    .refine(
      (value) => !value || !Number.isNaN(Date.parse(value)),
      "Enter a valid deadline date"
    ),
  imageUrls: z.array(z.string().url()).default([]),
  status: z.enum([
    "draft",
    "in_review",
    "approved",
    "changes_requested",
  ] as const),
})

export type CampaignFormValues = z.infer<typeof campaignBriefSchema>

export function sanitizeBriefInput(input: {
  projectId?: string
  title: string
  content: string
  channels: string[]
  deadline?: string
  imageUrls?: string[]
  status: CampaignStatus
}): CampaignFormValues | { fields: Record<string, string>; message: string } {
  const parsed = campaignBriefSchema.safeParse({
    projectId: input.projectId ?? "",
    title: sanitizeAuthInput(input.title),
    content: input.content.replace(/\u0000/g, "").trim(),
    channels: input.channels,
    deadline: input.deadline,
    imageUrls: input.imageUrls ?? [],
    status: input.status,
  })

  if (!parsed.success) {
    const fields: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form")
      if (!fields[key]) fields[key] = issue.message
    }
    return {
      fields,
      message: "Missing campaign information. Fix the highlighted fields.",
    }
  }

  return parsed.data
}

export function toBrief(values: CampaignFormValues): CampaignBrief {
  return {
    title: values.title,
    content: values.content,
    channels: values.channels,
    deadline: values.deadline,
    imageUrls: values.imageUrls,
  }
}
