/**
 * Canonical brief field list and workspace screen map for the content workflow.
 */
export const BRIEF_FIELDS = [
  "objective",
  "audience",
  "productService",
  "channels",
  "tone",
  "customerAction",
] as const

export const CORE_SCREENS = [
  "campaigns",
  "campaign-new",
  "campaign-detail",
  "tasks",
  "review",
  "library",
  "library-item",
  "dashboard",
] as const

/** @deprecated Use BRIEF_FIELDS */
export const RELWORX_BRIEF_FIELDS = BRIEF_FIELDS
/** @deprecated Use CORE_SCREENS */
export const RELWORX_CORE_SCREENS = CORE_SCREENS
