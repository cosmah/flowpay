import { LibraryItemDetail } from "@/components/library/library-item-detail"
import { PageHeader } from "@/components/layout/page-header"

export default async function LibraryItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div>
      <PageHeader
        title="Approved item"
        description="Copy, download, or send a simulated test email for this library asset."
      />
      <LibraryItemDetail itemId={id} />
    </div>
  )
}
