import { PageHeader } from "@/components/layout/page-header"
import { ReviewQueue } from "@/components/review/review-queue"

export default function ReviewPage() {
  return (
    <div>
      <PageHeader
        title="Review queue"
        description="Pending drafts waiting for approve or changes requested. Comments and history stay visible."
      />
      <ReviewQueue />
    </div>
  )
}
