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
  const { getReviewer } = useTeam()
  const { db, deleteCampaign, submitDraft } = useDb()
  const { handleDraftSubmitted } = useTasks()
  const campaign = db.campaigns.find((c) => c.id === campaignId)
  const drafts = db.drafts.filter((d) => d.campaignId === campaignId)

  if (!campaign) {
    return (
      <EmptyState
        title="Campaign not found"
        description="This campaign is not available or you do not have access."
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
      const reviewer = getReviewer()
      const updated = await submitDraft(draft.id, reviewer.email)
      if (!updated) {
        toast.error("This draft cannot be submitted.")
        return
      }
      handleDraftSubmitted(updated, {
        reviewerName: reviewer.name,
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
            Project:{" "}
            {db.projects.find((p) => p.id === campaign.projectId)?.name ??
              "Unassigned"}{" "}
            · Owner: {campaign.createdBy} · Updated{" "}
            {new Date(campaign.updatedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isMarketer ? (
            <Button asChild variant="outline">
              <Link href={ROUTES.campaignEdit(campaign.id)}>Edit</Link>
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
        <h3 className="font-heading text-lg text-[var(--rx-ink)]">Post</h3>
        <dl className="mt-4 grid gap-4 text-sm xl:grid-cols-12">
          <div className="xl:col-span-8">
            <dt className="text-muted-foreground">Content</dt>
            <dd className="mt-1 whitespace-pre-wrap text-foreground">
              {campaign.brief.content}
            </dd>
          </div>
          <div className="xl:col-span-4">
            <dt className="text-muted-foreground">Channels</dt>
            <dd className="mt-1 capitalize text-foreground">
              {campaign.brief.channels.join(", ")}
            </dd>
            <dt className="mt-4 text-muted-foreground">Deadline</dt>
            <dd className="mt-1 text-foreground">
              {campaign.brief.deadline
                ? new Date(campaign.brief.deadline).toLocaleDateString()
                : "Not set"}
            </dd>
          </div>
          {campaign.brief.imageUrls.length > 0 ? (
            <div className="xl:col-span-12">
              <dt className="text-muted-foreground">Banners</dt>
              <dd className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {campaign.brief.imageUrls.map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={url}
                    src={url}
                    alt="Campaign banner"
                    className="aspect-[4/3] w-full rounded-lg border border-border/60 object-cover"
                  />
                ))}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-heading text-lg text-[var(--rx-ink)]">
            Draft for review
          </h3>
        </div>
        {drafts.length === 0 ? (
          <EmptyState
            title="No draft yet"
            description="Edit and save this campaign to create a reviewable post draft."
          />
        ) : (
          <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-[var(--rx-paper)]">
            {drafts.map((draft) => {
              const canSubmit =
                isMarketer &&
                (draft.status === "draft" ||
                  draft.status === "changes_requested")
              const latestFeedback = draft.reviewComments.at(-1)
              const images = [
                ...(draft.imageUrl ? [draft.imageUrl] : []),
                ...campaign.brief.imageUrls.filter(
                  (url) => url !== draft.imageUrl
                ),
              ]

              return (
                <li key={draft.id} className="space-y-3 px-5 py-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-heading text-[var(--rx-ink)]">
                        Manual post
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          via {draft.generationSource}
                        </span>
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                        {draft.content}
                      </p>
                      {images.length > 0 ? (
                        <div className="mt-3 grid max-w-xl grid-cols-2 gap-2 sm:grid-cols-3">
                          {images.map((url) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              key={url}
                              src={url}
                              alt="Banner"
                              className="aspect-[4/3] w-full rounded-md border border-border/60 object-cover"
                            />
                          ))}
                        </div>
                      ) : null}
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
                      {draft.status === "in_review" ? (
                        <Button asChild size="sm" variant="outline">
                          <Link href={ROUTES.reviewDraft(draft.id)}>
                            Open review
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  {latestFeedback ? (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm">
                      <p className="text-xs font-medium uppercase tracking-wide text-amber-800 dark:text-amber-200">
                        Reviewer feedback
                      </p>
                      <p className="mt-1 text-foreground">{latestFeedback.body}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(latestFeedback.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ) : null}
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
