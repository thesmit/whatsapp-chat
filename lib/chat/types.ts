export type MessageStatus = "queued" | "sending" | "sent" | "delivered" | "read" | "error"

export type MessageContentType = "text" | "image" | "audio"

export interface MediaAttachment {
  id: string
  type: "image" | "audio"
  url: string
  thumbnailUrl?: string
  width?: number
  height?: number
  sizeInBytes?: number
  caption?: string
  waveform?: number[]
  localObjectUrl?: string
}

export interface Reaction {
  emoji: string
  authorId: string
  createdAt: string
}

export interface Message {
  id: string
  chatId: string
  authorId: string
  contentType: MessageContentType
  text?: string
  media?: MediaAttachment
  status: MessageStatus
  createdAt: string
  updatedAt?: string
  replyToId?: string
  isForwarded?: boolean
  reactions?: Reaction[]
}

export interface Contact {
  id: string
  name: string
  phoneNumber: string
  about: string
  avatarUrl: string
  isOnline: boolean
  lastSeenAt: string
  favorite?: boolean
  pinned?: boolean
}

export interface Chat {
  id: string
  contactId: string
  messageIds: string[]
  unreadCount: number
  archived?: boolean
  muted?: boolean
  lastActivityAt: string
  lastMessagePreview?: string
}

export interface ChatSearchHistoryItem {
  id: string
  value: string
  lastUsedAt: string
}

export interface DraftMessage {
  chatId: string
  text: string
  attachments: MediaAttachment[]
}

export interface TypingIndicator {
  chatId: string
  authorId: string
  startedAt: string
}

export interface PresenceMap {
  [contactId: string]: {
    isOnline: boolean
    lastSeenAt: string
  }
}

export interface ChatStateSnapshot {
  chats: Record<string, Chat>
  messages: Record<string, Message>
  contacts: Record<string, Contact>
  drafts: Record<string, DraftMessage>
  typingIndicators: TypingIndicator[]
  searchHistory: ChatSearchHistoryItem[]
  activeChatId?: string
}

export interface Profile {
  id: string
  name: string
  phoneNumber: string
  avatarUrl: string
  about: string
}
