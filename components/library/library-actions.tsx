"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useLibrary } from "@/hooks/use-library"
import { channelLabel, shareUrlForChannel } from "@/lib/library/channels"
import { downloadLibraryItem } from "@/lib/library/download"
import { handleClientError } from "@/lib/errors"
import type { LibraryItem } from "@/types"

export function LibraryActions({
  item,
  showPush = true,
}: {
  item: LibraryItem
  showPush?: boolean
}) {
  const { logTestSend } = useLibrary()
  const [copied, setCopied] = useState(false)
  const [testing, setTesting] = useState(false)

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(item.content)
      setCopied(true)
      toast.success("Caption copied")
      window.setTimeout(() => setCopied(false), 1500)
    } catch (error) {
      handleClientError(error)
    }
  }

  async function onDownload() {
    try {
      await downloadLibraryItem(item)
      toast.success(
        item.imageUrl
          ? "Downloading banner image and caption"
          : "Download started"
      )
    } catch (error) {
      handleClientError(error)
    }
  }

  async function onTest() {
    if (testing) return
    setTesting(true)
    try {
      await logTestSend({
        libraryItemId: item.id,
        mode: "simulated",
        message: `Test send logged for “${item.title}”.`,
        result: "submitted",
        sentTo: "test@example.com",
      })
      toast.success("Test send logged.")
    } catch (error) {
      handleClientError(error)
    } finally {
      setTesting(false)
    }
  }

  function onPush() {
    if (!item.channel) {
      toast.message("No channel selected for this version.")
      return
    }
    const share = shareUrlForChannel(item.channel, {
      title: item.title,
      content: item.content,
      imageUrl: item.imageUrl,
    })
    if (share.href) {
      window.open(share.href, "_blank", "noopener,noreferrer")
    }
    if (share.hint) {
      toast.message(share.hint)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" size="sm" variant="outline" onClick={onCopy}>
        {copied ? "Copied" : "Copy"}
      </Button>
      <Button type="button" size="sm" variant="outline" onClick={onDownload}>
        Download
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={onTest}
        disabled={testing}
      >
        {testing ? "Sending…" : "Test"}
      </Button>
      {showPush && item.channel ? (
        <Button type="button" size="sm" onClick={onPush}>
          Push to {channelLabel(item.channel)}
        </Button>
      ) : null}
    </div>
  )
}
