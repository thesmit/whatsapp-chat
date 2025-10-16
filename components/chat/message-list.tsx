"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Virtuoso } from "react-virtuoso"
import { format, isSameDay, parseISO } from "date-fns"

import type { Message } from "@/lib/chat/types"

import { MessageBubble } from "./message-bubble"
import { TypingIndicator } from "./typing-indicator"

type TimelineItem =
  | { kind: "divider"; id: string; label: string }
  | { kind: "message"; message: Message; showAvatar: boolean }

interface MessageListProps {
  chatId: string
  messages: Message[]
  contactInitials: string
  profileId: string
  isTyping?: boolean
  typingLabel?: string
  onMediaPreview?: (media: NonNullable<Message["media"]>) => void
}

export function MessageList({
  chatId,
  messages,
  contactInitials,
  profileId,
  isTyping,
  typingLabel,
  onMediaPreview,
}: MessageListProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const timeline = useMemo<TimelineItem[]>(() => buildTimeline(messages, profileId), [
    messages,
    profileId,
  ])

  const previousChatRef = useRef<string>("")
  const initialIndexRef = useRef<number | null>(null)

  if (previousChatRef.current !== chatId) {
    previousChatRef.current = chatId
    initialIndexRef.current = timeline.length ? timeline.length - 1 : null
  }

  const initialIndex = initialIndexRef.current

  if (!isMounted) {
    return <div className="flex-1" />
  }

  const virtuosoInitialIndex = initialIndex ?? undefined
  initialIndexRef.current = null

  return (
    <Virtuoso
      className="flex-1"
      style={{ height: "100%" }}
      data={timeline}
      {...(virtuosoInitialIndex !== undefined ? { initialTopMostItemIndex: virtuosoInitialIndex } : {})}
      followOutput={"smooth"}
      alignToBottom
      itemContent={(index, item) => {
        if (item.kind === "divider") {
          return (
            <div className="flex justify-center py-3" key={item.id}>
              <span className="rounded-full bg-black/5 px-4 py-1 text-xs font-medium text-muted-foreground">
                {item.label}
              </span>
            </div>
          )
        }

        const isOutgoing = item.message.authorId === profileId
        return (
          <div className="px-3 py-1" key={item.message.id}>
            <MessageBubble
              message={item.message}
              isOutgoing={isOutgoing}
              showAvatar={!isOutgoing && item.showAvatar}
              contactInitials={contactInitials}
              onMediaPreview={item.message.media ? onMediaPreview : undefined}
            />
          </div>
        )
      }}
      components={{
        Footer: () => (
          <div className="pb-3 pt-1">
            {isTyping ? (
              <div className="px-4">
                <TypingIndicator label={typingLabel} />
              </div>
            ) : (
              <span className="block h-2" />
            )}
          </div>
        ),
      }}
    />
  )
}

function buildTimeline(messages: Message[], profileId: string): TimelineItem[] {
  const items: TimelineItem[] = []
  let previousMessage: Message | undefined

  for (const message of messages) {
    const currentDate = parseISO(message.createdAt)

    if (!previousMessage || !isSameDay(parseISO(previousMessage.createdAt), currentDate)) {
      items.push({
        kind: "divider",
        id: `divider-${message.id}`,
        label: format(currentDate, "EEEE, MMM d"),
      })
    }

    const showAvatar =
      message.authorId !== profileId && (!previousMessage || previousMessage.authorId === profileId)

    items.push({ kind: "message", message, showAvatar })
    previousMessage = message
  }

  return items
}
