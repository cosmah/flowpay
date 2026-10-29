import { RoleGate } from "@/components/auth/role-gate"
import { PageHeader } from "@/components/layout/page-header"
import { ReviewDraft } from "@/components/review/review-draft"
import { RouteParams } from "@/components/shared/route-params"

export default function ReviewDraftPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <RoleGate allow="review">
      <div className="w-full">
        <PageHeader
          title="Review draft"
          description="Check the content, then approve it or request changes with a comment."
        />
        <RouteParams>
          <ReviewDraftBody params={params} />
        </RouteParams>
      </div>
    </RoleGate>
  )
}

async function ReviewDraftBody({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ReviewDraft draftId={id} />
}
