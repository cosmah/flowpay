"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useDb } from "@/hooks/use-db"
import { useRole } from "@/hooks/use-role"
import { useTasks } from "@/hooks/use-tasks"
import { useTeam } from "@/hooks/use-team"
import { ROUTES } from "@/lib/constants/routes"
import { handleClientError } from "@/lib/errors"

export function ReviewDraft({ draftId }: { draftId: string }) {
  const router = useRouter()
  const { canReview } = useRole()
  const { currentUser, getMarketers } = useTeam()
  const { db, approveDraft, requestDraftChanges } = useDb()
  const { handleDraftApproved, handleChangesRequested } = useTasks()
  const [comment, setComment] = useState("")
  const [busy, setBusy] = useState(false)

  const draft = db.drafts.find((item) => item.id === draftId)
  const campaign = draft
    ? db.campaigns.find((item) => item.id === draft.campaignId)
    : undefined

  if (!canReview) {
    return (
      <EmptyState
        title="Reviewer role required"
        description="Sign in with a reviewer or admin account to approve drafts or request changes."
        action={
          <Button asChild variant="outline">
            <Link href={ROUTES.review}>Back to review</Link>
          </Button>
        }
      />
    )
  }

  if (!draft) {
    return (
      <EmptyState
        title="Draft not found"
        description="This draft is not in the queue or is no longer pending review."
        action={
          <Button asChild variant="outline">
            <Link href={ROUTES.review}>Back to review</Link>
          </Button>
        }
      />
    )
  }

  async function onApprove() {
    if (!draft || busy) return
    setBusy(true)
    try {
      const updated = await approveDraft(draft.id, currentUser.email)
      if (!updated) {
        toast.error("Could not approve this draft.")
        return
      }
      handleDraftApproved(updated, {
        items: [],
        addItem: (item) => ({
          id: item.id ?? `lib_${crypto.randomUUID().slice(0, 8)}`,
          campaignId: item.campaignId,
          campaignName: item.campaignName,
          draftId: item.draftId,
          type: item.type,
          title: item.title,
          content: item.content,
          approvedBy: item.approvedBy,
          approvedAt: item.approvedAt,
          tags: item.tags,
        }),
        campaignName: campaign?.brief.title ?? "Unknown campaign",
        reviewer: currentUser.name,
      })
      toast.success("Draft approved.")
      router.push(ROUTES.library)
    } catch (error) {
      handleClientError(error)
    } finally {
      setBusy(false)
    }
  }

  async function onRequestChanges() {
    if (!draft || busy) return
    const body = comment.trim()
    if (!body) {
      toast.error("Add a comment for the marketer.")
      return
    }

    setBusy(true)
    try {
      const authorEmail =
        (campaign?.createdBy.includes("@") ? campaign.createdBy : null) ??
        getMarketers()[0]?.email ??
        undefined
      const updated = await requestDraftChanges(
        draft.id,
        body,
        currentUser.email,
        authorEmail
      )
      if (!updated) {
        toast.error("Could not request changes.")
        return
      }
      handleChangesRequested(updated, {
        authorName:
          updated.authorName ?? getMarketers()[0]?.name ?? "marketer",
      })
      toast.success("Changes requested.")
      router.push(ROUTES.campaign(draft.campaignId))
    } catch (error) {
      handleClientError(error)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid w-full gap-6 xl:grid-cols-12">
      <div className="space-y-4 rounded-2xl border border-border/70 bg-[var(--rx-paper)] px-5 py-5 xl:col-span-8">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-heading text-xl capitalize text-[var(--rx-ink)]">
            {draft.format} draft
          </h2>
          <StatusBadge status={draft.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          {campaign?.brief.title ?? draft.campaignId}
          {draft.authorName ? ` · by ${draft.authorName}` : ""}
        </p>

        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
          {draft.content}
        </pre>
        {(draft.imageUrl || (campaign?.brief.imageUrls.length ?? 0) > 0) && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              ...(draft.imageUrl ? [draft.imageUrl] : []),
              ...(campaign?.brief.imageUrls.filter(
                (url) => url !== draft.imageUrl
              ) ?? []),
            ].map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={url}
                alt="Campaign banner"
                className="aspect-[4/3] w-full rounded-lg border border-border/60 object-cover"
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-2xl border border-border/70 bg-[var(--rx-paper)] px-5 py-5 xl:col-span-4">
        <div className="space-y-2">
          <Label htmlFor="review-comment">Request changes comment</Label>
          <Textarea
            id="review-comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="What should the marketer change?"
            rows={6}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={onApprove} disabled={busy}>
            Approve
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onRequestChanges}
            disabled={busy}
          >
            Request changes
          </Button>
          <Button asChild type="button" variant="ghost">
            <Link href={ROUTES.review}>Back</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
