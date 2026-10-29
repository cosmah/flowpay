import { LoadingState } from "@/components/shared"

/** Route-level and in-view dashboard placeholder ([Skeleton](https://ui.shadcn.com/docs/components/base/skeleton)). */
export function DashboardSkeleton() {
  return <LoadingState variant="dashboard" label="Loading dashboard" />
}
