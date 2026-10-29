import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string
  description: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 rounded-2xl border border-dashed border-border/80 bg-muted/30 px-6 py-10",
        className
      )}
    >
      <h2 className="font-heading text-lg tracking-tight text-foreground">
        {title}
      </h2>
      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  )
}
