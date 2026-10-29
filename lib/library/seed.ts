import { ensureGraphicMarkup } from "@/lib/library/graphic"
import type { LibraryItem } from "@/types"

/** First-load demo seed: 2 fictional approved items. */
export function createSeedLibraryItems(now = new Date()): LibraryItem[] {
  const approvedAt = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
  const graphicTitle = "Onboarding Welcome Series — Graphic"

  return [
    {
      id: "lib_seed_onboard_email",
      campaignId: "camp_onboarding",
      campaignName: "Onboarding Welcome Series",
      draftId: "draft_onboard_email",
      type: "email",
      title: "Onboarding Welcome Series — Email",
      content:
        "Subject: Welcome to Relworx\n\nCreate a brief, generate drafts, submit for review, and find approved assets in your library. That's the whole loop.",
      approvedBy: "Amina Reviewer",
      approvedAt,
      tags: ["email", "onboarding"],
    },
    {
      id: "lib_seed_onboard_graphic",
      campaignId: "camp_onboarding",
      campaignName: "Onboarding Welcome Series",
      draftId: "draft_seed_onboard_graphic",
      type: "graphic",
      title: graphicTitle,
      content: ensureGraphicMarkup(
        "[Visual brief] Brief → Review → Library pipeline with Relworx mark and Approved badge.",
        graphicTitle
      ),
      approvedBy: "Amina Reviewer",
      approvedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      tags: ["graphic", "onboarding"],
    },
  ]
}
