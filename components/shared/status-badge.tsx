import { Badge } from "@/components/ui/badge"
import {
  CAMPAIGN_STATUS_LABELS,
  DRAFT_STATUS_LABELS,
  TASK_STATUS_LABELS,
} from "@/lib/constants/status"
import type { CampaignStatus, DraftStatus, TaskStatus } from "@/types"
import { cn } from "@/lib/utils"

type Status = DraftStatus | CampaignStatus | TaskStatus

const tone: Record<Status, string> = {
  // Draft: muted outline — clearly different from the green Approved chip.
  draft:
    "border border-dashed border-slate-400/70 bg-slate-100/80 text-slate-700",
  in_review: "bg-[var(--rx-lagoon)]/15 text-[var(--rx-ink)] border-transparent",
  approved: "border-transparent bg-emerald-500/90 text-white",
  changes_requested:
    "bg-amber-100 text-amber-950 border-transparent dark:bg-amber-950/40 dark:text-amber-100",
  todo: "bg-[var(--rx-mist)] text-[var(--rx-ink)] border-transparent",
  in_progress: "bg-[var(--rx-lagoon)]/15 text-[var(--rx-ink)] border-transparent",
  done: "bg-[var(--rx-signal)]/20 text-[var(--rx-ink)] border-transparent",
}

const labels: Record<Status, string> = {
  ...DRAFT_STATUS_LABELS,
  ...CAMPAIGN_STATUS_LABELS,
  ...TASK_STATUS_LABELS,
}

export function StatusBadge({
  status,
  className,
}: {
  status: Status
  className?: string
}) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", tone[status], className)}
    >
      {labels[status]}
    </Badge>
  )
}
