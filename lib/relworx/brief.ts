/**
 * Source of truth for Relworx Career Expo challenge requirements.
 * Main brief: Relworx_Marketing_Content_and_Workflow.pdf
 * Screen map: relworx_user_flows_v2.pdf
 */
export const RELWORX_BRIEF_FIELDS = [
  "objective",
  "audience",
  "productService",
  "channels",
  "tone",
  "customerAction",
] as const

export const RELWORX_CORE_SCREENS = [
  "campaigns",
  "campaign-new",
  "campaign-detail",
  "tasks",
  "review",
  "library",
] as const

export const RELWORX_DEMO_PATH = [
  "Create campaign brief",
  "Generate caption + email + visual",
  "Edit draft",
  "Submit for review",
  "Request changes / approve",
  "Auto-create review task",
  "Retrieve approved item from library",
] as const
