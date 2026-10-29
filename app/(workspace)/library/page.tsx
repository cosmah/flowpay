import { PageHeader } from "@/components/layout/page-header"
import { EmptyState } from "@/components/shared/empty-state"

export default function LibraryPage() {
  return (
    <div>
      <PageHeader
        title="Library"
        description="Approved items only. Search, copy, download, or run a simulated test send."
      />
      <EmptyState
        title="No approved assets"
        description="Drafts never appear here. Once a reviewer approves content, it shows up for export and test send."
      />
    </div>
  )
}
