"use client"

import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { useDb } from "@/hooks/use-db"

export function CampaignDetail({ campaignId }: { campaignId: string }) {
  const { db } = useDb()
  const campaign = db.campaigns.find((c) => c.id === campaignId)
  const drafts = db.drafts.filter((d) => d.campaignId === campaignId)

  if (!campaign) {
    return (
      <EmptyState
        title="Campaign not found"
        description="This id is not in the seeded H2 snapshot. Reload to re-pour /data mock rows."
      />
    )
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border/70 bg-[var(--rx-paper)] px-5 py-5">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-heading text-xl text-[var(--rx-ink)]">
            {campaign.brief.title}
          </h2>
          <StatusBadge status={campaign.status} />
        </div>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
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
          <div>
            <dt className="text-muted-foreground">Channels</dt>
            <dd className="mt-1 text-foreground">
              {campaign.brief.channels.join(", ")}
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
