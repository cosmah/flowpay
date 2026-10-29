export type TestSendMode = "simulated" | "resend"
export type TestSendResult = "submitted" | "error"

export interface LibraryItem {
  id: string
  campaignId: string
  draftId: string
  title: string
  format: "caption" | "email" | "visual"
  content: string
  approvedAt: string
}

export interface TestSendLog {
  id: string
  libraryItemId: string
  mode: TestSendMode
  result: TestSendResult
  message: string
  createdAt: string
}
