import { AccountView } from "@/components/account/account-view"
import { PageHeader } from "@/components/layout/page-header"

export default function AccountPage() {
  return (
    <div>
      <PageHeader
        title="Account"
        description="Your workspace identity, role, and session controls."
      />
      <AccountView />
    </div>
  )
}
