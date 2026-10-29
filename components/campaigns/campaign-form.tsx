"use client"

import { useState, type FormEvent } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  CAMPAIGN_CHANNELS,
  CAMPAIGN_STATUSES,
  sanitizeBriefInput,
  toBrief,
  type CampaignFormValues,
} from "@/lib/campaigns/validation"
import { handleClientError } from "@/lib/errors"
import type { Campaign, CampaignStatus } from "@/types"
import { cn } from "@/lib/utils"

type Fields = Partial<Record<keyof CampaignFormValues | "form", string>>

const emptyValues: CampaignFormValues = {
  title: "",
  objective: "",
  audience: "",
  tone: "",
  keyMessage: "",
  channels: [],
  deadline: undefined,
  status: "draft",
}

function fromCampaign(campaign: Campaign): CampaignFormValues {
  return {
    title: campaign.brief.title,
    objective: campaign.brief.objective,
    audience: campaign.brief.audience,
    tone: campaign.brief.tone,
    keyMessage: campaign.brief.keyMessage,
    channels: campaign.brief.channels as CampaignFormValues["channels"],
    deadline: campaign.brief.deadline,
    status: campaign.status,
  }
}

export function CampaignForm({
  mode,
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  mode: "create" | "edit"
  initial?: Campaign
  submitLabel: string
  onSubmit: (values: {
    brief: ReturnType<typeof toBrief>
    status: CampaignStatus
  }) => void | Promise<void>
  onCancel?: () => void
}) {
  const [values, setValues] = useState<CampaignFormValues>(
    initial ? fromCampaign(initial) : emptyValues
  )
  const [fields, setFields] = useState<Fields>({})
  const [submitting, setSubmitting] = useState(false)

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
    const result = sanitizeBriefInput({
      ...values,
      deadline: values.deadline ?? "",
    })

    if ("fields" in result) {
      setFields(result.fields)
      toast.error(result.message)
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        brief: toBrief(result),
        status: result.status,
      })
    } catch (error) {
      const message = handleClientError(error)
      setFields({ form: message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6 rounded-2xl border border-border/70 bg-[var(--rx-paper)] p-5 sm:p-6"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">Campaign title</Label>
          <Input
            id="title"
            value={values.title}
            aria-invalid={Boolean(fields.title)}
            placeholder="Summer Launch 2026"
            className="h-10"
            onChange={(event) => update("title", event.target.value)}
          />
          {fields.title ? (
            <p className="text-xs text-destructive">{fields.title}</p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="objective">Objective</Label>
          <Textarea
            id="objective"
            value={values.objective}
            aria-invalid={Boolean(fields.objective)}
            placeholder="What should this campaign achieve?"
            onChange={(event) => update("objective", event.target.value)}
          />
          {fields.objective ? (
            <p className="text-xs text-destructive">{fields.objective}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="audience">Audience</Label>
          <Input
            id="audience"
            value={values.audience}
            aria-invalid={Boolean(fields.audience)}
            placeholder="Marketing managers at mid-size brands"
            className="h-10"
            onChange={(event) => update("audience", event.target.value)}
          />
          {fields.audience ? (
            <p className="text-xs text-destructive">{fields.audience}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tone">Tone</Label>
          <Input
            id="tone"
            value={values.tone}
            aria-invalid={Boolean(fields.tone)}
            placeholder="Confident, clear"
            className="h-10"
            onChange={(event) => update("tone", event.target.value)}
          />
          {fields.tone ? (
            <p className="text-xs text-destructive">{fields.tone}</p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="keyMessage">Key message</Label>
          <Textarea
            id="keyMessage"
            value={values.keyMessage}
            aria-invalid={Boolean(fields.keyMessage)}
            placeholder="The single idea every asset should reinforce"
            onChange={(event) => update("keyMessage", event.target.value)}
          />
          {fields.keyMessage ? (
            <p className="text-xs text-destructive">{fields.keyMessage}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="deadline">Deadline</Label>
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
          {fields.deadline ? (
            <p className="text-xs text-destructive">{fields.deadline}</p>
          ) : (
            <p className="text-xs text-muted-foreground">Optional</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={values.status}
            aria-invalid={Boolean(fields.status)}
            className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
          {fields.status ? (
            <p className="text-xs text-destructive">{fields.status}</p>
          ) : null}
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label>Channels</Label>
          <div className="flex flex-wrap gap-2">
            {CAMPAIGN_CHANNELS.map((channel) => {
              const active = values.channels.includes(channel)
              return (
                <button
                  key={channel}
                  type="button"
                  onClick={() => toggleChannel(channel)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors",
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
          {fields.channels ? (
            <p className="text-xs text-destructive">{fields.channels}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Choose where this campaign will publish.
            </p>
          )}
        </div>
      </div>

      {fields.form ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {fields.form}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
        <Button type="submit" disabled={submitting} className="h-10">
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
