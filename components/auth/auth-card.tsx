import type { ReactNode } from "react"

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-border/70 bg-[var(--rx-paper)] p-6 shadow-sm sm:p-8">
      <div className="mb-6 space-y-2">
        <h1 className="font-heading text-2xl tracking-tight text-[var(--rx-ink)]">
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
