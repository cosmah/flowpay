"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { downloadLibraryItem } from "@/lib/library/download"
import { handleClientError } from "@/lib/errors"
import type { LibraryItem } from "@/types"

export function LibraryActions({ item }: { item: LibraryItem }) {
  const [copied, setCopied] = useState(false)

  async function onCopy() {
    if (item.type === "graphic") {
      toast.message("Use Download to export this graphic.")
      return
    }
    try {
      await navigator.clipboard.writeText(item.content)
      setCopied(true)
      toast.success("Copied")
      window.setTimeout(() => setCopied(false), 1500)
    } catch (error) {
      handleClientError(error)
    }
  }

  async function onDownload() {
    try {
      await downloadLibraryItem(item)
      toast.success("Download started")
    } catch (error) {
      handleClientError(error)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {item.type !== "graphic" ? (
        <Button type="button" size="sm" variant="outline" onClick={onCopy}>
          {copied ? "Copied" : "Copy"}
        </Button>
      ) : null}
      <Button type="button" size="sm" variant="outline" onClick={onDownload}>
        Download
      </Button>
    </div>
  )
}
