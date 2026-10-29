import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type LoadingVariant = "page" | "list" | "form" | "detail" | "inline"

type LoadingStateProps = {
  variant?: LoadingVariant
  className?: string
  rows?: number
  label?: string
}

function PageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <div className="space-y-3 rounded-2xl border border-border/70 bg-[var(--rx-paper)] p-5">
        <Skeleton className="h-5 w-[33%]" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[83%]" />
        <Skeleton className="h-4 w-[66%]" />
      </div>
    </div>
  )
}

function ListSkeleton({ rows }: { rows: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-[var(--rx-paper)]">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-center justify-between gap-4 border-b border-border/60 px-5 py-4 last:border-b-0"
        >
          <div className="w-full space-y-2">
            <Skeleton className="h-4 w-[40%]" />
            <Skeleton className="h-3 w-[60%]" />
          </div>
          <Skeleton className="h-5 w-20 shrink-0 rounded-full" />
        </div>
      ))}
    </div>
  )
}

function FormSkeleton() {
  return (
    <div className="space-y-5">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ))}
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-2xl border border-border/70 bg-[var(--rx-paper)] p-5">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-7 w-[66%]" />
        <Skeleton className="mt-4 h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[80%]" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <ListSkeleton rows={3} />
      </div>
    </div>
  )
}

function InlineSkeleton() {
  return (
    <div className="flex items-center gap-3" aria-hidden>
      <Skeleton className="size-8 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}

/**
 * Reusable loading UI built on shadcn Skeleton.
 * @see https://ui.shadcn.com/docs/components/base/skeleton
 */
export function LoadingState({
  variant = "page",
  className,
  rows = 5,
  label = "Loading",
}: LoadingStateProps) {
  return (
    <div
      className={cn("w-full", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      <span className="sr-only">{label}…</span>
      {variant === "page" ? <PageSkeleton /> : null}
      {variant === "list" ? <ListSkeleton rows={rows} /> : null}
      {variant === "form" ? <FormSkeleton /> : null}
      {variant === "detail" ? <DetailSkeleton /> : null}
      {variant === "inline" ? <InlineSkeleton /> : null}
    </div>
  )
}

/** Tiny pulse block for custom layouts — re-export for one import path. */
export { Skeleton } from "@/components/ui/skeleton"
