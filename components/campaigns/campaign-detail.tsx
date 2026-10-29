"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { CampaignTasksPanel } from "@/components/tasks/campaign-tasks-panel"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { useDb } from "@/hooks/use-db"
import { useRole } from "@/hooks/use-role"
import { useTasks } from "@/hooks/use-tasks"
import { useTeam } from "@/hooks/use-team"
import { ROUTES } from "@/lib/constants/routes"
import { handleClientError } from "@/lib/errors"
import type { Draft } from "@/types"

export function CampaignDetail({ campaignId }: { campaignId: string }) {
  const router = useRouter()
  const { canMarket: isMarketer } = useRole()
  const { currentUser, getReviewer } = useTeam()
  const { db, deleteCampaign, submitDraft } = useDb()
  const { handleDraftSubmitted } = useTasks()
  const campaign = db.campaigns.find((c) => c.id === campaignId)
  const drafts = db.drafts.filter((d) => d.campaignId === campaignId)

  if (!campaign) {
    return (
      <EmptyState
        title="Campaign not found"
        description="This campaign is not available in Supabase."
        action={
          <Button asChild variant="outline">
            <Link href={ROUTES.campaigns}>Back to campaigns</Link>
          </Button>
        }
      />
    )
  }

  async function onDelete() {
    const confirmed = window.confirm(
      `Delete “${campaign!.brief.title}”? Related content will be removed.`
    )
    if (!confirmed) return

    try {
      const ok = await deleteCampaign(campaign!.id)
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

  async function onSubmitDraft(draft: Draft) {
    try {
      const updated = await submitDraft(draft.id, currentUser.email)
      if (!updated) {
        toast.error("This draft cannot be submitted.")
        return
      }
      handleDraftSubmitted(updated, {
        reviewerName: getReviewer().name,
      })
      toast.success("Draft submitted for review.")
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
            Owner: {campaign.createdBy} · Updated{" "}
            {new Date(campaign.updatedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isMarketer ? (
            <Button asChild variant="outline">
              <Link href={ROUTES.campaignEdit(campaign.id)}>Edit brief</Link>
            </Button>
          ) : null}
          {isMarketer ? (
            <Button type="button" variant="destructive" onClick={onDelete}>
              Delete
            </Button>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-border/70 bg-[var(--rx-paper)] px-5 py-5">
        <h3 className="font-heading text-lg text-[var(--rx-ink)]">
          Campaign brief
        </h3>
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
            <dt className="text-muted-foreground">Service or product</dt>
            <dd className="mt-1 text-foreground">
              {campaign.brief.productService}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Tone</dt>
            <dd className="mt-1 text-foreground">{campaign.brief.tone}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Desired customer action</dt>
            <dd className="mt-1 text-foreground">
              {campaign.brief.customerAction}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Channel</dt>
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
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-heading text-lg text-[var(--rx-ink)]">
            Drafts & visual
          </h3>
          <p className="text-xs text-muted-foreground">
            Relworx: 2 text formats + 1 visual
          </p>
        </div>
        {drafts.length === 0 ? (
          <EmptyState
            title="No drafts yet"
            description="Generate a social caption, email draft, and promotional graphic from this brief. AI or templates are allowed."
          />
        ) : (
          <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-[var(--rx-paper)]">
            {drafts.map((draft) => {
              const canSubmit =
                isMarketer &&
                (draft.status === "draft" ||
                  draft.status === "changes_requested")

              return (
                <li
                  key={draft.id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-heading capitalize text-[var(--rx-ink)]">
                      {draft.format}
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        via {draft.generationSource}
                      </span>
                    </p>
                    <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                      {draft.content}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={draft.status} />
                    {canSubmit ? (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => onSubmitDraft(draft)}
                      >
                        Submit for review
                      </Button>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <CampaignTasksPanel
        campaignId={campaign.id}
        campaignTitle={campaign.brief.title}
      />
    </div>
  )
}
