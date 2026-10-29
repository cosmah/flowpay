import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export function AuthCard({
  title,
  description,
  children,
  wide = false,
}: {
  title: string
  description: string
  children: ReactNode
  /** Prefer landscape layout so the form fits without scrolling. */
  wide?: boolean
}) {
  return (
    <div
      className={cn(
        "w-full rounded-2xl border border-border/70 bg-[var(--rx-paper)] shadow-sm",
        wide
          ? "max-w-3xl px-6 py-6 sm:px-8 sm:py-7"
          : "mx-auto max-w-md p-6 sm:p-8"
      )}
    >
      <div className={cn("mb-5 space-y-1.5", wide && "max-w-2xl")}>
        <h1 className="font-heading text-2xl tracking-tight text-[var(--rx-ink)] sm:text-[1.65rem]">
          {title}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      {children}
    </div>
  )
}
