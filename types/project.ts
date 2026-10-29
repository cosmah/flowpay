export type ProjectStatus = "active" | "paused" | "archived"

export interface Project {
  id: string
  name: string
  description: string
  status: ProjectStatus
  createdAt: string
  updatedAt: string
  createdBy: string
}
