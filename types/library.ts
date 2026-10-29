export type LibraryItemType = "caption" | "email" | "graphic"

export type TestSendMode = "simulated" | "resend"
export type TestSendResult = "submitted" | "error"

/** Snapshot of an approved draft. Later draft edits must not change this. */
export interface LibraryItem {
  id: string
  campaignId: string
  campaignName: string
  draftId: string
  type: LibraryItemType
  title: string
  content: string
  approvedBy: string
  approvedAt: string
  tags?: string[]
}

export interface TestSendLog {
  id: string
  libraryItemId: string
  mode: TestSendMode
  result: TestSendResult
  message: string
  createdAt: string
}
