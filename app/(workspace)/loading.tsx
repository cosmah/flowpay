export default function WorkspaceLoading() {
  return (
    <div className="animate-pulse space-y-4 py-2" aria-busy="true" aria-label="Loading">
      <div className="h-8 w-48 rounded-lg bg-muted" />
      <div className="h-4 w-80 max-w-full rounded bg-muted/70" />
      <div className="mt-6 h-40 rounded-2xl bg-muted/50" />
    </div>
  )
}
