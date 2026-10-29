import { PageHeader } from "@/components/layout/page-header"
import { EmptyState } from "@/components/shared/empty-state"

export default function ReviewPage() {
  return (
    <div>
      <PageHeader
        title="Review queue"
        description="Pending drafts waiting for approve or changes requested. Comments and history stay visible."
      />
      <EmptyState
        title="Queue is empty"
        description="Switch to the Reviewer role when drafts are submitted. Approvals publish items into the library."
      />
    </div>
  )
}
