import type { LibraryItem, TestSendLog } from "@/types"
import { api } from "./client"

export const libraryApi = {
  list: (query?: string) =>
    api.get<LibraryItem[]>("/library", { params: { q: query } }),
  get: (id: string) => api.get<LibraryItem>(`/library/${id}`),
  sendTest: (id: string) =>
    api.post<TestSendLog>(`/library/${id}/test-send`),
}
