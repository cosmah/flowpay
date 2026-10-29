"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { useDb } from "@/hooks/use-db"
import { ROUTES } from "@/lib/constants/routes"

export function CampaignList() {
  const { db } = useDb()
  const campaigns = db.campaigns

  if (campaigns.length === 0) {
    return (
      <EmptyState
        title="No campaigns yet"
        description="Start with a brief. Validated fields unlock generation of caption, email, and visual drafts."
        action={
          <Button asChild variant="outline">
            <Link href={ROUTES.campaignNew}>Create brief</Link>
          </Button>
        }
      />
    )
  }

  return (
    <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl border border-border/70 bg-[var(--rx-paper)]">
      {campaigns.map((campaign) => (
        <li key={campaign.id}>
          <Link
            href={ROUTES.campaign(campaign.id)}
            className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="font-heading text-base text-[var(--rx-ink)]">
                {campaign.brief.title}
              </p>
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {campaign.brief.objective}
              </p>
            </div>
            <StatusBadge status={campaign.status} />
          </Link>
        </li>
      ))}
    </ul>
  )
}
