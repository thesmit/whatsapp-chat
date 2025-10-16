"use client"

import Image from "next/image"
import { memo } from "react"
import {
  Check,
  Checks,
  Clock,
  ClockCountdown,
  WarningCircle,
} from "@phosphor-icons/react"
import { format } from "date-fns"

import type { MediaAttachment, Message } from "@/lib/chat/types"
import { cn } from "@/lib/utils"

interface MessageBubbleProps {
  message: Message
  isOutgoing: boolean
  showAvatar?: boolean
  contactInitials?: string
  onMediaPreview?: (media: MediaAttachment) => void
}

const statusIcon = {
  queued: ClockCountdown,
  sending: Clock,
  sent: Check,
  delivered: Checks,
  read: Checks,
  error: WarningCircle,
} as const

const statusColor: Record<Message["status"], string> = {
  queued: "text-muted-foreground",
  sending: "text-muted-foreground",
  sent: "text-muted-foreground",
  delivered: "text-status-delivered",
  read: "text-status-read",
  error: "text-destructive",
}

const MessageBubbleComponent = ({
  message,
  isOutgoing,
  showAvatar,
  contactInitials,
  onMediaPreview,
}: MessageBubbleProps) => {
  const StatusIcon = statusIcon[message.status]

  const timeLabel = format(new Date(message.createdAt), "HH:mm")
  const bubbleClasses = cn(
    "relative rounded-3xl px-4 py-2 shadow-sm transition-colors",
    isOutgoing
      ? "rounded-br-lg bg-bubble-outgoing text-foreground"
      : "rounded-bl-lg bg-bubble-incoming text-foreground"
  )

  return (
    <div
      className={cn("flex gap-2", isOutgoing ? "justify-end" : "justify-start")}
      data-message-id={message.id}
    >
      {!isOutgoing && showAvatar ? (
        <div className="mt-auto h-7 w-7 shrink-0 rounded-full bg-secondary text-xs font-semibold uppercase text-secondary-foreground"
          aria-hidden
        >
          <span className="flex h-full w-full items-center justify-center">
            {contactInitials}
          </span>
        </div>
      ) : (
        <span className="w-7" aria-hidden />
      )}

      <div className={cn("max-w-[82%] md:max-w-[68%]", isOutgoing && "items-end")}
        role="group"
      >
        <div className={bubbleClasses}>
          {message.replyToId ? (
            <div className="mb-2 rounded-2xl bg-black/5 px-3 py-2 text-xs text-muted-foreground">
              Replying to message
            </div>
          ) : null}

          {message.contentType === "image" && message.media ? (
            <button
              type="button"
              onClick={() => onMediaPreview?.(message.media as MediaAttachment)}
              className="group mb-2 block overflow-hidden rounded-2xl border border-border/40 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Image
                src={message.media.url}
                alt={message.media.caption ?? "Shared media"}
                width={message.media.width ?? 640}
                height={message.media.height ?? 360}
                className="h-auto max-h-[320px] w-full object-cover transition duration-500 group-hover:scale-[1.02]"
              />
              {message.media.caption ? (
                <p className="px-3 pb-2 pt-2 text-sm text-foreground/90">
                  {message.media.caption}
                </p>
              ) : null}
            </button>
          ) : null}

          {message.text ? (
            <p className="text-sm leading-snug text-foreground/90 whitespace-pre-wrap">
              {message.text}
            </p>
          ) : null}

          {message.reactions?.length ? (
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-black/10 px-2 py-0.5 text-xs text-foreground/80">
              {message.reactions.map((reaction) => (
                <span key={reaction.authorId + reaction.emoji}>{reaction.emoji}</span>
              ))}
            </div>
          ) : null}

          <footer className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
            <span>{timeLabel}</span>
            {isOutgoing ? (
              <StatusIcon
                className={cn("h-3.5 w-3.5", message.status === "read" ? "text-status-read" : statusColor[message.status])}
                weight={message.status === "read" || message.status === "delivered" ? "fill" : "regular"}
                aria-label={`Message ${message.status}`}
              />
            ) : null}
          </footer>
        </div>

        {message.isForwarded ? (
          <span className="mt-1 inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            Forwarded
          </span>
        ) : null}
      </div>
    </div>
  )
}

export const MessageBubble = memo(MessageBubbleComponent)

MessageBubble.displayName = "MessageBubble"
