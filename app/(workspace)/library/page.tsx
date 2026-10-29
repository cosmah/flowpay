import { PageHeader } from "@/components/layout/page-header"
import { LibraryList } from "@/components/library/library-list"

export default function LibraryPage() {
  return (
    <div>
      <PageHeader
        title="Library"
        description="Approved items only. Search, copy, download, or run a simulated test send."
      />
      <LibraryList />
    </div>
  )
}
