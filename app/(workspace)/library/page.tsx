import { PageHeader } from "@/components/layout/page-header"
import { LibraryList } from "@/components/library/library-list"

export default function LibraryPage() {
  return (
    <div>
      <PageHeader
        title="Library"
        description="Approved materials only. Search, filter, copy, or download — drafts never appear here."
      />
      <LibraryList />
    </div>
  )
}
