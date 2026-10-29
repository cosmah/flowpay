import { RoleGate } from "@/components/auth/role-gate"
import { PageHeader } from "@/components/layout/page-header"
import { ReviewQueue } from "@/components/review/review-queue"

export default function ReviewPage() {
  return (
    <RoleGate allow="review">
      <div>
        <PageHeader
          title="Review queue"
          description="Pending drafts waiting for approve or changes requested."
        />
        <ReviewQueue />
      </div>
    </RoleGate>
  )
}
