"use client"

import { useState, type FormEvent } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  PROJECT_STATUSES,
  sanitizeProjectInput,
  type ProjectFormValues,
} from "@/lib/projects/validation"
import { handleClientError } from "@/lib/errors"
import type { Project, ProjectStatus } from "@/types"
import { cn } from "@/lib/utils"

type Fields = Partial<Record<keyof ProjectFormValues | "form", string>>

const emptyValues: ProjectFormValues = {
  name: "",
  description: "",
  status: "active",
}

export function ProjectForm({
  mode,
  initial,
  submitLabel,
  onSubmit,
  onCancel,
  compact = false,
}: {
  mode: "create" | "edit"
  initial?: Project
  submitLabel: string
  onSubmit: (values: ProjectFormValues) => void | Promise<void>
  onCancel?: () => void
  compact?: boolean
}) {
  const [values, setValues] = useState<ProjectFormValues>(
    initial
      ? {
          name: initial.name,
          description: initial.description,
          status: initial.status,
        }
      : emptyValues
  )
  const [fields, setFields] = useState<Fields>({})
  const [submitting, setSubmitting] = useState(false)

  function update<K extends keyof ProjectFormValues>(
    key: K,
    value: ProjectFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (fields[key]) setFields((prev) => ({ ...prev, [key]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    setFields({})

    const result = sanitizeProjectInput(values)
    if ("fields" in result) {
      setFields(result.fields)
      toast.error(result.message)
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(result)
    } catch (error) {
      setFields({ form: handleClientError(error) })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={cn(
        "space-y-5",
        !compact &&
          "rounded-2xl border border-border/70 bg-[var(--rx-paper)] p-5 sm:p-6"
      )}
    >
      <div className="space-y-2">
        <Label htmlFor="name">Project name</Label>
        <Input
          id="name"
          className="h-10"
          value={values.name}
          aria-invalid={Boolean(fields.name)}
          placeholder="Growth 2026"
          onChange={(event) => update("name", event.target.value)}
        />
        {fields.name ? <p className="text-xs text-destructive">{fields.name}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={values.description}
          aria-invalid={Boolean(fields.description)}
          placeholder="What campaigns live in this project?"
          onChange={(event) => update("description", event.target.value)}
        />
        {fields.description ? (
          <p className="text-xs text-destructive">{fields.description}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          value={values.status}
          className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          onChange={(event) =>
            update("status", event.target.value as ProjectStatus)
          }
        >
          {PROJECT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {fields.form ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {fields.form}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2 border-t border-border/60 pt-4">
        <Button type="submit" className="h-10" disabled={submitting}>
          {submitting
            ? mode === "create"
              ? "Creating…"
              : "Saving…"
            : submitLabel}
        </Button>
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            className="h-10"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  )
}
