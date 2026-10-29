"use client"

import { useMemo, useState, type FormEvent, type ReactNode } from "react"
import {
  CalendarDays,
  Flag,
  FolderKanban,
  Gauge,
  MessageSquareText,
  MousePointerClick,
  Package,
  Radio,
  SlidersHorizontal,
  Target,
  Type,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import {
  CAMPAIGN_CHANNELS,
  CAMPAIGN_STATUSES,
  sanitizeBriefInput,
  toBrief,
  type CampaignFormValues,
} from "@/lib/campaigns/validation"
import { handleClientError } from "@/lib/errors"
import type { Campaign, CampaignStatus, Project } from "@/types"
import { cn } from "@/lib/utils"

type Fields = Partial<Record<keyof CampaignFormValues | "form", string>>

const PRIORITY_LABELS = ["Later", "Low", "Steady", "High", "Critical"] as const
const AMBITION_LABELS = ["Soft", "Warm", "Balanced", "Bold", "Disruptive"] as const

function emptyValues(projectId: string): CampaignFormValues {
  return {
    projectId,
    title: "",
    objective: "",
    audience: "",
    productService: "",
    tone: "",
    customerAction: "",
    channels: [],
    deadline: undefined,
    status: "draft",
  }
}

function fromCampaign(campaign: Campaign): CampaignFormValues {
  return {
    projectId: campaign.projectId,
    title: campaign.brief.title,
    objective: campaign.brief.objective,
    audience: campaign.brief.audience,
    productService: campaign.brief.productService,
    tone: campaign.brief.tone,
    customerAction: campaign.brief.customerAction,
    channels: campaign.brief.channels as CampaignFormValues["channels"],
    deadline: campaign.brief.deadline,
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
  compact = false,
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
  const [priority, setPriority] = useState(3)
  const [ambition, setAmbition] = useState(3)

  const priorityLabel = PRIORITY_LABELS[priority - 1]
  const ambitionLabel = AMBITION_LABELS[ambition - 1]

  const selectClassName = cn(
    "h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none",
    "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
    "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
  )

  const filledCount = useMemo(() => {
    const checks = [
      values.projectId,
      values.title.trim(),
      values.objective.trim(),
      values.audience.trim(),
      values.productService.trim(),
      values.tone.trim(),
      values.customerAction.trim(),
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    setFields({})
    const toneWithVoice = values.tone.trim() ? values.tone : ambitionLabel

    const result = sanitizeBriefInput({
      ...values,
      tone: toneWithVoice,
      deadline: values.deadline ?? "",
    })

    if ("fields" in result) {
      setFields(result.fields)
      toast.error(result.message)
      return
    }

    if (priority >= 4 && !result.deadline) {
      setFields({
        deadline: "High-priority campaigns should include a deadline.",
      })
      toast.error("Add a deadline for high-priority work.")
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
          {compact
            ? "Capture the brief essentials."
            : "Required fields are validated before save."}
        </p>
        <p className="shrink-0 text-sm font-medium tabular-nums text-[var(--rx-ink)]">
          {filledCount}/8 ready
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
          icon={<Target className="size-3.5" aria-hidden />}
          label="Objective"
          htmlFor="objective"
          error={fields.objective}
          hint="What should success look like for this campaign?"
        >
          <Textarea
            id="objective"
            value={values.objective}
            aria-invalid={Boolean(fields.objective)}
            placeholder="Drive qualified demos from product marketers in the next quarter."
            className="min-h-28"
            onChange={(event) => update("objective", event.target.value)}
          />
        </FieldShell>

        <FieldShell
          className="xl:col-span-4"
          icon={<Users className="size-3.5" aria-hidden />}
          label="Audience"
          htmlFor="audience"
          error={fields.audience}
        >
          <Input
            id="audience"
            value={values.audience}
            aria-invalid={Boolean(fields.audience)}
            placeholder="Who needs to hear this?"
            className="h-10"
            onChange={(event) => update("audience", event.target.value)}
          />
        </FieldShell>

        <FieldShell
          className="xl:col-span-4"
          icon={<Package className="size-3.5" aria-hidden />}
          label="Service or product"
          htmlFor="productService"
          error={fields.productService}
        >
          <Input
            id="productService"
            value={values.productService}
            aria-invalid={Boolean(fields.productService)}
            placeholder="Studio Plan"
            className="h-10"
            onChange={(event) => update("productService", event.target.value)}
          />
        </FieldShell>

        <FieldShell
          className="xl:col-span-4"
          icon={<MessageSquareText className="size-3.5" aria-hidden />}
          label="Tone"
          htmlFor="tone"
          error={fields.tone}
          hint={`Voice leans ${ambitionLabel.toLowerCase()} when empty.`}
        >
          <Input
            id="tone"
            value={values.tone}
            aria-invalid={Boolean(fields.tone)}
            placeholder="Confident, clear, human"
            className="h-10"
            onChange={(event) => update("tone", event.target.value)}
          />
        </FieldShell>

        <FieldShell
          className="xl:col-span-4"
          icon={<MousePointerClick className="size-3.5" aria-hidden />}
          label="Desired customer action"
          htmlFor="customerAction"
          error={fields.customerAction}
        >
          <Input
            id="customerAction"
            value={values.customerAction}
            aria-invalid={Boolean(fields.customerAction)}
            placeholder="Book a demo / Start a trial"
            className="h-10"
            onChange={(event) => update("customerAction", event.target.value)}
          />
        </FieldShell>

        <FieldShell
          className="xl:col-span-4"
          icon={<CalendarDays className="size-3.5" aria-hidden />}
          label="Deadline"
          htmlFor="deadline"
          error={fields.deadline}
          hint={priority >= 4 ? "Recommended for high priority." : "Optional"}
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
          className="xl:col-span-12"
          icon={<Radio className="size-3.5" aria-hidden />}
          label="Channels"
          error={fields.channels}
          hint="Select at least one channel."
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

        {!compact ? (
          <>
            <FieldShell
              className="xl:col-span-6"
              icon={<Gauge className="size-3.5" aria-hidden />}
              label={`Priority · ${priorityLabel}`}
              hint="High priority requires a deadline."
            >
              <div className="border border-border/70 bg-muted/20 px-4 py-4">
                <Slider
                  min={1}
                  max={5}
                  step={1}
                  value={[priority]}
                  onValueChange={(next) => setPriority(next[0] ?? 3)}
                  aria-label="Campaign priority"
                />
                <div className="mt-3 flex justify-between text-[10px] uppercase tracking-wide text-muted-foreground">
                  <span>Later</span>
                  <span>Critical</span>
                </div>
              </div>
            </FieldShell>

            <FieldShell
              className="xl:col-span-6"
              icon={<SlidersHorizontal className="size-3.5" aria-hidden />}
              label={`Creative ambition · ${ambitionLabel}`}
              hint="Used as tone when the tone field is empty."
            >
              <div className="border border-border/70 bg-muted/20 px-4 py-4">
                <Slider
                  min={1}
                  max={5}
                  step={1}
                  value={[ambition]}
                  onValueChange={(next) => setAmbition(next[0] ?? 3)}
                  aria-label="Creative ambition"
                />
                <div className="mt-3 flex justify-between text-[10px] uppercase tracking-wide text-muted-foreground">
                  <span>Soft</span>
                  <span>Disruptive</span>
                </div>
              </div>
            </FieldShell>
          </>
        ) : null}
      </div>

      {fields.form ? (
        <p className="bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {fields.form}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
        <Button type="submit" disabled={submitting} className="h-10 min-w-36">
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
