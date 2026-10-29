import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/** Green approved chip for library assets (distinct from Draft badges). */
export function ApprovedBadge({ className }: { className?: string }) {
  return (
    <Badge
      className={cn(
        "border-transparent bg-emerald-500/90 font-medium text-white",
        className
      )}
    >
      Approved
    </Badge>
  )
}
