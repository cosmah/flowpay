import { LibraryItemDetail } from "@/components/library/library-item-detail"
import { PageHeader } from "@/components/layout/page-header"
import { RouteParams } from "@/components/shared/route-params"

export default function LibraryItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  return (
    <div>
      <PageHeader
        title="Approved item"
        description="Copy, download, or send a simulated test email for this library asset."
      />
      <RouteParams>
        <LibraryItemBody params={params} />
      </RouteParams>
    </div>
  )
}

async function LibraryItemBody({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <LibraryItemDetail itemId={id} />
}
