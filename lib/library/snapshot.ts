import { serializeVisualDraft, parseVisualDraft } from "@/lib/library/visual"
import type { Draft, LibraryItem, LibraryItemType } from "@/types"

function toLibraryType(format: Draft["format"]): LibraryItemType {
  return format === "visual" ? "graphic" : format
}

function titleFor(draft: Draft, campaignName: string) {
  const kind = draft.format === "visual" ? "Graphic" : draft.format
  return `${campaignName} — ${kind.charAt(0).toUpperCase()}${kind.slice(1)}`
}

/** Freeze a draft into a library snapshot at approval time. */
export function snapshotFromDraft(
  draft: Draft,
  campaignName: string,
  reviewer: string,
  approvedAt = new Date().toISOString()
): Omit<LibraryItem, "id"> {
  const type = toLibraryType(draft.format)
  const title = titleFor(draft, campaignName)
  const visual =
    type === "graphic"
      ? parseVisualDraft(draft.content, { title })
      : null
  const content = visual ? serializeVisualDraft(visual) : draft.content

  return {
    campaignId: draft.campaignId,
    campaignName,
    draftId: draft.id,
    type,
    title,
    content,
    approvedBy: reviewer,
    approvedAt,
    tags: [type, campaignName.toLowerCase().replace(/\s+/g, "-")],
  }
}
