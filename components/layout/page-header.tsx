import type { ReactNode } from "react"

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex w-full flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 flex-1 space-y-1">
        <h1 className="font-heading text-2xl tracking-tight text-[var(--rx-ink)] sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  )
}
