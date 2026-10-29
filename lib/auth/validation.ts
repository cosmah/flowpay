import { z } from "zod"

const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .max(254, "Email is too long")
  .email("Enter a valid email address")
  .transform((value) => value.toLowerCase())

const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be 72 characters or fewer")
  .regex(/[A-Z]/, "Include at least one uppercase letter")
  .regex(/[a-z]/, "Include at least one lowercase letter")
  .regex(/[0-9]/, "Include at least one number")
  .regex(/[^A-Za-z0-9]/, "Include at least one special character")
  .refine((value) => !/\s/.test(value), "Password cannot contain spaces")

const nameSchema = z
  .string()
  .trim()
  .min(1, "Full name is required")
  .min(2, "Name must be at least 2 characters")
  .max(80, "Name must be 80 characters or fewer")
  .refine((value) => /[a-zA-Z]/.test(value), "Name must include letters")
  .refine(
    (value) => !/[<>{}$]/.test(value),
    "Name contains invalid characters"
  )

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, "Password is required")
    .max(72, "Password is too long"),
})

export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
    role: z.enum(["marketer", "reviewer"], {
      message: "Choose a role",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      })
    }
  })

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>

export function fieldErrorsFromZod(
  error: z.ZodError
): Record<string, string> {
  const fields: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form")
    if (!fields[key]) fields[key] = issue.message
  }
  return fields
}

/** Strip control chars / weird paste mess before validation. */
export function sanitizeAuthInput(value: string) {
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim()
}
