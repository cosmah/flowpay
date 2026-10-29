import type { Task } from "@/types"
import { api } from "./client"

export const tasksApi = {
  list: () => api.get<Task[]>("/tasks"),
  get: (id: string) => api.get<Task>(`/tasks/${id}`),
}
