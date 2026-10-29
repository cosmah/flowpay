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
    .refine((value) => !/[<>$]/.test(value), `${label} contains invalid characters`)

export const campaignBriefSchema = z.object({
  title: requiredText("Title", 3, 80),
  objective: requiredText("Objective", 10, 280),
  audience: requiredText("Audience", 3, 120),
  tone: requiredText("Tone", 3, 80),
  keyMessage: requiredText("Key message", 10, 280),
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
  status: z.enum([
    "draft",
    "in_review",
    "approved",
    "changes_requested",
  ] as const),
})

export type CampaignFormValues = z.infer<typeof campaignBriefSchema>

export function sanitizeBriefInput(input: {
  title: string
  objective: string
  audience: string
  tone: string
  keyMessage: string
  channels: string[]
  deadline?: string
  status: CampaignStatus
}): CampaignFormValues | { fields: Record<string, string>; message: string } {
  const parsed = campaignBriefSchema.safeParse({
    title: sanitizeAuthInput(input.title),
    objective: sanitizeAuthInput(input.objective),
    audience: sanitizeAuthInput(input.audience),
    tone: sanitizeAuthInput(input.tone),
    keyMessage: sanitizeAuthInput(input.keyMessage),
    channels: input.channels,
    deadline: input.deadline,
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
      message: "Fix the highlighted brief fields and try again.",
    }
  }

  return parsed.data
}

export function toBrief(values: CampaignFormValues): CampaignBrief {
  return {
    title: values.title,
    objective: values.objective,
    audience: values.audience,
    tone: values.tone,
    keyMessage: values.keyMessage,
    channels: values.channels,
    deadline: values.deadline,
  }
}
