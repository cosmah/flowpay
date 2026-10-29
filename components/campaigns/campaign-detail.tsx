"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { useDb } from "@/hooks/use-db"
import { ROUTES } from "@/lib/constants/routes"
import { handleClientError } from "@/lib/errors"

export function CampaignDetail({ campaignId }: { campaignId: string }) {
  const router = useRouter()
  const { db, deleteCampaign } = useDb()
  const campaign = db.campaigns.find((c) => c.id === campaignId)
  const drafts = db.drafts.filter((d) => d.campaignId === campaignId)

  if (!campaign) {
    return (
      <EmptyState
        title="Campaign not found"
        description="This campaign is missing from the current H2 snapshot."
        action={
          <Button asChild variant="outline">
            <Link href={ROUTES.campaigns}>Back to campaigns</Link>
          </Button>
        }
      />
    )
  }

  function onDelete() {
    const confirmed = window.confirm(
      `Delete “${campaign!.brief.title}”? Related drafts and tasks will be removed from this demo session.`
    )
    if (!confirmed) return

    try {
      const ok = deleteCampaign(campaign!.id)
      if (!ok) {
        toast.error("Could not delete this campaign.")
        return
      }
      toast.success("Campaign deleted.")
      router.push(ROUTES.campaigns)
    } catch (error) {
      handleClientError(error)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-[var(--rx-paper)] px-5 py-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-heading text-xl text-[var(--rx-ink)]">
              {campaign.brief.title}
            </h2>
            <StatusBadge status={campaign.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            Updated {new Date(campaign.updatedAt).toLocaleString()} · Created by{" "}
            {campaign.createdBy}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={ROUTES.campaignEdit(campaign.id)}>Edit</Link>
          </Button>
          <Button type="button" variant="destructive" onClick={onDelete}>
            Delete
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-[var(--rx-paper)] px-5 py-5">
        <h3 className="font-heading text-lg text-[var(--rx-ink)]">Brief</h3>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Objective</dt>
            <dd className="mt-1 text-foreground">{campaign.brief.objective}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Audience</dt>
            <dd className="mt-1 text-foreground">{campaign.brief.audience}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Tone</dt>
            <dd className="mt-1 text-foreground">{campaign.brief.tone}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Key message</dt>
            <dd className="mt-1 text-foreground">{campaign.brief.keyMessage}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Channels</dt>
            <dd className="mt-1 capitalize text-foreground">
              {campaign.brief.channels.join(", ")}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Deadline</dt>
            <dd className="mt-1 text-foreground">
              {campaign.brief.deadline
                ? new Date(campaign.brief.deadline).toLocaleDateString()
                : "Not set"}
            </dd>
          </div>
        </dl>
      </div>

      <section>
        <h3 className="mb-3 font-heading text-lg text-[var(--rx-ink)]">Drafts</h3>
        {drafts.length === 0 ? (
          <EmptyState
            title="No drafts yet"
            description="Generate caption, email, and visual drafts from the brief."
          />
        ) : (
          <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-[var(--rx-paper)]">
            {drafts.map((draft) => (
              <li
                key={draft.id}
                className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-heading capitalize text-[var(--rx-ink)]">
                    {draft.format}
                  </p>
                  <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                    {draft.content}
                  </p>
                </div>
                <StatusBadge status={draft.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
