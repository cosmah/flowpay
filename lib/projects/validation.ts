import { z } from "zod"
import { sanitizeAuthInput } from "@/lib/auth/validation"
import type { ProjectStatus } from "@/types"

export const PROJECT_STATUSES: ProjectStatus[] = ["active", "paused", "archived"]

export const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Project name is required")
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be 80 characters or fewer")
    .refine((value) => !/[<>$]/.test(value), "Name contains invalid characters"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(280, "Description must be 280 characters or fewer"),
  status: z.enum(["active", "paused", "archived"]),
})

export type ProjectFormValues = z.infer<typeof projectSchema>

export function sanitizeProjectInput(input: {
  name: string
  description: string
  status: ProjectStatus
}): ProjectFormValues | { fields: Record<string, string>; message: string } {
  const parsed = projectSchema.safeParse({
    name: sanitizeAuthInput(input.name),
    description: sanitizeAuthInput(input.description),
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
      message: "Fix the highlighted project fields and try again.",
    }
  }

  return parsed.data
}
