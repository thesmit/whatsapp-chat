"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import dynamic from "next/dynamic"
import data from "@emoji-mart/data"
import type { PickerProps } from "@emoji-mart/react"
import { PaperPlaneTilt, Paperclip, Smiley } from "@phosphor-icons/react"
import { useDropzone } from "react-dropzone"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import type { MediaAttachment } from "@/lib/chat/types"
import { cn } from "@/lib/utils"

const EmojiPicker = dynamic<PickerProps>(() => import("@emoji-mart/react"), {
  ssr: false,
})

interface MessageComposerProps {
  chatId: string
  draftText?: string
  draftAttachments?: MediaAttachment[]
  onChangeDraft: (chatId: string, draft: { text?: string; attachments?: MediaAttachment[] }) => void
  onClearDraft: (chatId: string) => void
  onSend: (chatId: string, payload: { text?: string; media?: MediaAttachment }) => void
}

export function MessageComposer({
  chatId,
  draftText = "",
  draftAttachments = [],
  onChangeDraft,
  onClearDraft,
  onSend,
}: MessageComposerProps) {
  const [text, setText] = useState(draftText)
  const [attachments, setAttachments] = useState<MediaAttachment[]>(draftAttachments)
  const [isEmojiOpen, setIsEmojiOpen] = useState(false)

  useEffect(() => {
    setText(draftText)
  }, [draftText])

  useEffect(() => {
    setAttachments(draftAttachments)
  }, [])

  useEffect(() => {
    onChangeDraft(chatId, { text, attachments })
  }, [chatId, text, attachments, onChangeDraft])

  useEffect(() => {
    return () => {
      attachments.forEach((attachment) => {
        if (attachment.localObjectUrl) {
          URL.revokeObjectURL(attachment.localObjectUrl)
        }
      })
    }
  }, [attachments])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const media = acceptedFiles.map<MediaAttachment>((file) => {
        const objectUrl = URL.createObjectURL(file)
        return {
          id: `upload-${file.name}-${file.lastModified}`,
          type: "image",
          url: objectUrl,
          localObjectUrl: objectUrl,
          sizeInBytes: file.size,
          caption: file.name,
        }
      })

      setAttachments((prev) => [...prev, ...media])
    },
    []
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      "image/*": [],
    },
  })

  const canSend = useMemo(() => text.trim().length > 0 || attachments.length > 0, [
    text,
    attachments,
  ])

  const handleSend = useCallback(() => {
    if (!canSend) return

    attachments.forEach((attachment) => {
      onSend(chatId, { media: attachment })
      if (attachment.localObjectUrl) {
        URL.revokeObjectURL(attachment.localObjectUrl)
      }
    })

    const trimmed = text.trim()
    if (trimmed.length > 0) {
      onSend(chatId, { text: trimmed })
    }

    setText("")
    setAttachments([])
    onClearDraft(chatId)
  }, [attachments, canSend, chatId, onClearDraft, onSend, text])

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = useCallback(
    (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative border-t border-border/70 bg-background/95 px-4 pb-4 pt-3 transition-colors",
        isDragActive && "border-primary bg-primary/5"
      )}
    >
      <input {...getInputProps()} />

      {attachments.length > 0 ? (
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          {attachments.map((attachment) => (
            <figure
              key={attachment.id}
              className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border/60"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={attachment.url}
                alt={attachment.caption ?? "Attachment"}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault()
                  setAttachments((prev) =>
                    prev.filter((item) => {
                      if (item.id === attachment.id && item.localObjectUrl) {
                        URL.revokeObjectURL(item.localObjectUrl)
                      }
                      return item.id !== attachment.id
                    })
                  )
                }}
                className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white"
              >
                ✕
              </button>
            </figure>
          ))}
        </div>
      ) : null}

      <div className="flex items-end gap-3">
        <Popover open={isEmojiOpen} onOpenChange={setIsEmojiOpen}>
          <PopoverTrigger asChild>
            <Button size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground">
              <Smiley className="h-5 w-5" />
              <span className="sr-only">Open emoji picker</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="border-none bg-transparent p-0 shadow-2xl" align="start">
            <EmojiPicker
              data={data}
              onEmojiSelect={(emoji: { native?: string }) => {
                if (emoji?.native) {
                  setText((prev) => `${prev}${emoji.native}`)
                }
              }}
              theme="light"
              previewPosition="none"
            />
          </PopoverContent>
        </Popover>

        <Button
          size="icon"
          variant="ghost"
          className="h-10 w-10 text-muted-foreground"
          type="button"
          onClick={(event) => {
            event.preventDefault()
            const input = document.createElement("input")
            input.type = "file"
            input.accept = "image/*"
            input.multiple = true
            input.onchange = (e) => {
              const target = e.target as HTMLInputElement
              if (target.files) {
                onDrop(Array.from(target.files))
              }
            }
            input.click()
          }}
        >
          <Paperclip className="h-5 w-5" />
          <span className="sr-only">Attach media</span>
        </Button>

        <Textarea
          placeholder="Type a message"
          value={text}
          rows={1}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[48px] flex-1 resize-none rounded-2xl bg-background/90 px-4 py-3 text-sm shadow-inner"
        />

        <Button
          size="icon"
          disabled={!canSend}
          onClick={(event) => {
            event.preventDefault()
            handleSend()
          }}
          className="h-11 w-11 rounded-full bg-primary text-primary-foreground shadow-lg transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted"
        >
          <PaperPlaneTilt className="h-5 w-5" weight="fill" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </div>
  )
}
