import { LoadingState } from "@/components/shared"

export default function MarketingLoading() {
  return (
    <div className="flex flex-1 justify-center bg-[var(--rx-mist)] px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border/70 bg-[var(--rx-paper)] p-6 sm:p-8">
        <div className="mb-6 space-y-2">
          <div className="h-7 w-48 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-full animate-pulse rounded-md bg-muted" />
        </div>
        <LoadingState variant="form" label="Loading page" />
      </div>
    </div>
  )
}
