"use client"

import Image from "next/image"
import { useMemo, useState } from "react"

import type {
  Chat,
  Contact,
  DraftMessage,
  MediaAttachment,
  Message,
} from "@/lib/chat/types"

import { Dialog, DialogContent } from "@/components/ui/dialog"

import { ChatHeader } from "./chat-header"
import { MessageComposer } from "./message-composer"
import { MessageList } from "./message-list"

interface ChatPanelProps {
  chat: Chat
  contact: Contact
  messages: Message[]
  profileId: string
  draft?: DraftMessage
  typing?: boolean
  onBack?: () => void
  onChangeDraft: (chatId: string, draft: { text?: string; attachments?: MediaAttachment[] }) => void
  onClearDraft: (chatId: string) => void
  onSendMessage: (chatId: string, payload: { text?: string; media?: MediaAttachment }) => void
}

export function ChatPanel({
  chat,
  contact,
  messages,
  profileId,
  draft,
  typing,
  onBack,
  onChangeDraft,
  onClearDraft,
  onSendMessage,
}: ChatPanelProps) {
  const contactInitials = useMemo(() => initials(contact.name), [contact.name])
  const [preview, setPreview] = useState<MediaAttachment | null>(null)

  return (
    <section className="flex h-full flex-1 flex-col bg-gradient-to-b from-background/90 to-background">
      <ChatHeader contact={contact} isOnline={contact.isOnline} onBack={onBack} />

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute inset-0 select-none bg-[radial-gradient(circle_at_top,rgba(67,160,71,0.1),transparent_60%)]" />
        <div className="relative z-10 flex flex-1 flex-col">
          <MessageList
            chatId={chat.id}
            messages={messages}
            contactInitials={contactInitials}
            profileId={profileId}
            isTyping={typing}
            typingLabel={`${contact.name} is typing`}
            onMediaPreview={(media) => setPreview(media)}
          />
        </div>
      </div>

      <MessageComposer
        chatId={chat.id}
        draftText={draft?.text}
        draftAttachments={draft?.attachments}
        onChangeDraft={onChangeDraft}
        onClearDraft={onClearDraft}
        onSend={onSendMessage}
      />

      <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="max-w-2xl border-none bg-background/95 p-0">
          {preview ? (
            <figure className="overflow-hidden rounded-2xl">
              <Image
                src={preview.url}
                alt={preview.caption ?? "Shared image"}
                width={preview.width ?? 1200}
                height={preview.height ?? 900}
                className="h-auto w-full object-cover"
                priority
              />
              {preview.caption ? (
                <figcaption className="px-4 py-3 text-sm text-muted-foreground">
                  {preview.caption}
                </figcaption>
              ) : null}
            </figure>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  )
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}
