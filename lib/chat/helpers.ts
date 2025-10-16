import type { MediaAttachment, Message } from "./types"

export function generateMessageId(prefix = "msg") {
  try {
    const uuid = typeof globalThis !== "undefined" && "crypto" in globalThis
      ? globalThis.crypto?.randomUUID?.()
      : undefined
    if (uuid) return `${prefix}-${uuid}`
    throw new Error("no-crypto")
  } catch {
    return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
  }
}

export function derivePreview(message: Message) {
  if (message.contentType === "image") {
    return message.media?.caption ?? "📷 Photo"
  }
  if (message.contentType === "audio") {
    return "🎧 Audio message"
  }
  return message.text ?? "New message"
}

export function createInboundTextMessage(options: {
  chatId: string
  authorId: string
  text: string
  createdAt?: Date
}): Message {
  const createdAt = options.createdAt ?? new Date()
  const iso = createdAt.toISOString()
  return {
    id: generateMessageId(),
    chatId: options.chatId,
    authorId: options.authorId,
    contentType: "text",
    text: options.text,
    status: "read",
    createdAt: iso,
    updatedAt: iso,
  }
}

export function createInboundMediaMessage(options: {
  chatId: string
  authorId: string
  media: MediaAttachment
  createdAt?: Date
}): Message {
  const createdAt = options.createdAt ?? new Date()
  const iso = createdAt.toISOString()
  return {
    id: generateMessageId(),
    chatId: options.chatId,
    authorId: options.authorId,
    contentType: options.media.type,
    media: options.media,
    status: "read",
    createdAt: iso,
    updatedAt: iso,
  }
}
