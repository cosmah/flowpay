"use client"

import { useMemo, useState, type FormEvent, type ReactNode } from "react"
import {
  CalendarDays,
  Flag,
  FolderKanban,
  ImagePlus,
  Radio,
  Type,
  FileText,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { uploadCampaignImages } from "@/lib/campaigns/upload"
import {
  CAMPAIGN_CHANNELS,
  CAMPAIGN_STATUSES,
  sanitizeBriefInput,
  toBrief,
  type CampaignFormValues,
} from "@/lib/campaigns/validation"
import { createClient } from "@/lib/supabase/client"
import { handleClientError } from "@/lib/errors"
import type { Campaign, CampaignStatus, Project } from "@/types"
import { cn } from "@/lib/utils"

type Fields = Partial<Record<keyof CampaignFormValues | "form" | "images", string>>

function emptyValues(projectId: string): CampaignFormValues {
  return {
    projectId,
    title: "",
    content: "",
    channels: [],
    deadline: undefined,
    imageUrls: [],
    status: "draft",
  }
}

function fromCampaign(campaign: Campaign): CampaignFormValues {
  return {
    projectId: campaign.projectId,
    title: campaign.brief.title,
    content: campaign.brief.content,
    channels: campaign.brief.channels as CampaignFormValues["channels"],
    deadline: campaign.brief.deadline,
    imageUrls: campaign.brief.imageUrls,
    status: campaign.status,
  }
}

function FieldShell({
  icon,
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  icon: ReactNode
  label: string
  htmlFor?: string
  hint?: string
  error?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label
        htmlFor={htmlFor}
        className="flex items-center gap-2 text-sm font-medium"
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border/70 bg-muted/40 text-muted-foreground">
          {icon}
        </span>
        {label}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

export function CampaignForm({
  mode,
  initial,
  projects,
  defaultProjectId,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  mode: "create" | "edit"
  initial?: Campaign
  projects: Project[]
  defaultProjectId?: string
  submitLabel: string
  onSubmit: (values: {
    projectId: string
    brief: ReturnType<typeof toBrief>
    status: CampaignStatus
  }) => void | Promise<void>
  onCancel?: () => void
  compact?: boolean
}) {
  const [values, setValues] = useState<CampaignFormValues>(
    initial
      ? fromCampaign(initial)
      : emptyValues(defaultProjectId ?? projects[0]?.id ?? "")
  )
  const [fields, setFields] = useState<Fields>({})
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)

  const selectClassName = cn(
    "h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none",
    "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
    "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
  )

  const filledCount = useMemo(() => {
    const checks = [
      values.projectId,
      values.title.trim(),
      values.content.trim(),
      values.channels.length > 0,
    ]
    return checks.filter(Boolean).length
  }, [values])

  function update<K extends keyof CampaignFormValues>(
    key: K,
    value: CampaignFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }))
    if (fields[key]) setFields((prev) => ({ ...prev, [key]: undefined }))
  }

  function toggleChannel(channel: (typeof CAMPAIGN_CHANNELS)[number]) {
    setValues((prev) => {
      const exists = prev.channels.includes(channel)
      return {
        ...prev,
        channels: exists
          ? prev.channels.filter((item) => item !== channel)
          : [...prev.channels, channel],
      }
    })
    if (fields.channels) setFields((prev) => ({ ...prev, channels: undefined }))
  }

  function removeImage(url: string) {
    setValues((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((item) => item !== url),
    }))
  }

  async function onPickImages(fileList: FileList | null) {
    if (!fileList?.length) return
    setUploading(true)
    setFields((prev) => ({ ...prev, images: undefined }))
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const { data: profile } = user
        ? await supabase
            .from("profiles")
            .select("company_id")
            .eq("id", user.id)
            .maybeSingle()
        : { data: null }

      if (!profile?.company_id) {
        setFields({ images: "Join a company before uploading images." })
        toast.error("Join a company before uploading images.")
        return
      }

      const result = await uploadCampaignImages(
        Array.from(fileList),
        profile.company_id
      )
      if ("error" in result) {
        setFields({ images: result.error })
        toast.error(result.error)
        return
      }

      setValues((prev) => ({
        ...prev,
        imageUrls: [...prev.imageUrls, ...result.urls],
      }))
      toast.success(
        result.urls.length === 1
          ? "Image uploaded."
          : `${result.urls.length} images uploaded.`
      )
    } catch (error) {
      handleClientError(error)
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting || uploading) return

    setFields({})
    const result = sanitizeBriefInput({
      ...values,
      deadline: values.deadline ?? "",
      imageUrls: values.imageUrls,
    })

    if ("fields" in result) {
      setFields(result.fields)
      toast.error(result.message)
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        projectId: result.projectId,
        brief: toBrief(result),
        status: result.status,
      })
    } catch (error) {
      setFields({ form: handleClientError(error) })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full space-y-6">
      <div className="flex w-full items-center justify-between gap-3 border-b border-border/60 pb-3">
        <p className="text-sm text-muted-foreground">
          Write the post content and attach banner images.
        </p>
        <p className="shrink-0 text-sm font-medium tabular-nums text-[var(--rx-ink)]">
          {filledCount}/4 ready
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-12 xl:gap-x-6 xl:gap-y-5">
        <FieldShell
          className="xl:col-span-4"
          icon={<FolderKanban className="size-3.5" aria-hidden />}
          label="Project"
          htmlFor="projectId"
          error={fields.projectId}
          hint="Every campaign belongs to a project."
        >
          <select
            id="projectId"
            value={values.projectId}
            aria-invalid={Boolean(fields.projectId)}
            className={selectClassName}
            onChange={(event) => update("projectId", event.target.value)}
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </FieldShell>

        <FieldShell
          className="xl:col-span-8"
          icon={<Type className="size-3.5" aria-hidden />}
          label="Campaign title"
          htmlFor="title"
          error={fields.title}
        >
          <Input
            id="title"
            value={values.title}
            aria-invalid={Boolean(fields.title)}
            placeholder="Summer Launch 2026"
            className="h-10"
            onChange={(event) => update("title", event.target.value)}
          />
        </FieldShell>

        <FieldShell
          className="xl:col-span-12"
          icon={<FileText className="size-3.5" aria-hidden />}
          label="Content"
          htmlFor="content"
          error={fields.content}
          hint="The message that will be posted with your banner images."
        >
          <Textarea
            id="content"
            value={values.content}
            aria-invalid={Boolean(fields.content)}
            placeholder="Write the exact post copy for this campaign…"
            className="min-h-40"
            onChange={(event) => update("content", event.target.value)}
          />
        </FieldShell>

        <FieldShell
          className="xl:col-span-12"
          icon={<ImagePlus className="size-3.5" aria-hidden />}
          label="Banner images"
          htmlFor="images"
          error={fields.images}
          hint="Upload any image type (JPG, PNG, GIF, WebP, SVG, and more). Multiple banners allowed."
        >
          <Input
            id="images"
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            className="h-10 cursor-pointer pt-1.5"
            onChange={(event) => {
              void onPickImages(event.target.files)
              event.target.value = ""
            }}
          />
          {values.imageUrls.length > 0 ? (
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {values.imageUrls.map((url) => (
                <li
                  key={url}
                  className="relative overflow-hidden rounded-lg border border-border/70 bg-muted/20"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt="Campaign banner"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute top-1.5 right-1.5 rounded-full bg-background/90 p-1 text-foreground shadow-sm"
                    aria-label="Remove image"
                  >
                    <X className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </FieldShell>

        <FieldShell
          className="xl:col-span-4"
          icon={<CalendarDays className="size-3.5" aria-hidden />}
          label="Deadline"
          htmlFor="deadline"
          error={fields.deadline}
          hint="Optional"
        >
          <Input
            id="deadline"
            type="date"
            value={values.deadline ?? ""}
            aria-invalid={Boolean(fields.deadline)}
            className="h-10"
            onChange={(event) =>
              update("deadline", event.target.value || undefined)
            }
          />
        </FieldShell>

        <FieldShell
          className="xl:col-span-4"
          icon={<Flag className="size-3.5" aria-hidden />}
          label="Status"
          htmlFor="status"
        >
          <select
            id="status"
            value={values.status}
            className={selectClassName}
            onChange={(event) =>
              update("status", event.target.value as CampaignStatus)
            }
          >
            {CAMPAIGN_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </FieldShell>

        <FieldShell
          className="xl:col-span-4"
          icon={<Radio className="size-3.5" aria-hidden />}
          label="Channels"
          error={fields.channels}
          hint="Where this post will go."
        >
          <div className="flex flex-wrap gap-2">
            {CAMPAIGN_CHANNELS.map((channel) => {
              const active = values.channels.includes(channel)
              return (
                <button
                  key={channel}
                  type="button"
                  onClick={() => toggleChannel(channel)}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                    active
                      ? "border-[var(--rx-ink)] bg-[var(--rx-ink)] text-[var(--rx-paper)]"
                      : "border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  {channel}
                </button>
              )
            })}
          </div>
        </FieldShell>
      </div>

      {fields.form ? (
        <p className="bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {fields.form}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
        <Button
          type="submit"
          disabled={submitting || uploading}
          className="h-10 min-w-36"
        >
          {uploading
            ? "Uploading…"
            : submitting
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
            disabled={submitting || uploading}
          >
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  )
}
