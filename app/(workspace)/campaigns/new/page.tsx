import { PageHeader } from "@/components/layout/page-header"
import { EmptyState } from "@/components/shared/empty-state"

export default function NewCampaignPage() {
  return (
    <div>
      <PageHeader
        title="New campaign"
        description="Fill in the brief. Missing fields will surface clear validation messages before generate."
      />
      <EmptyState
        title="Brief form coming next"
        description="This screen will hold the campaign form, field validation, and the generate action for 2 texts + 1 visual."
      />
    </div>
  )
}
