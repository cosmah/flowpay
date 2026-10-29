import { Suspense, type ReactNode } from "react"

/** Wrap awaited `params` / `searchParams` so the route can stream a shell. */
export function RouteParams({
  children,
  fallback = (
    <p className="text-sm text-muted-foreground">Loading…</p>
  ),
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  return <Suspense fallback={fallback}>{children}</Suspense>
}
