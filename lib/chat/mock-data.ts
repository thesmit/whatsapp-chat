import { addMinutes, formatISO, subMinutes } from "date-fns"
import type {
  Chat,
  ChatStateSnapshot,
  Contact,
  Message,
  MessageStatus,
  Profile,
} from "./types"

const baseTimestamp = new Date("2024-05-18T16:42:00Z")
let idCounter = 0
const nextId = (prefix: string) => `${prefix}-${++idCounter}`

const iso = (date: Date) => formatISO(date, { representation: "complete" })

const messageStatuses: MessageStatus[] = ["read", "delivered", "sent", "sending"]

function createSeededRandom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rng = createSeededRandom(1337)

const contacts: Contact[] = [
  {
    id: "carlos",
    name: "Carlos Mendes",
    phoneNumber: "+55 11 98888-1122",
    about: "Product designer • Rio",
    avatarUrl: "https://i.pravatar.cc/120?img=12",
    isOnline: true,
    lastSeenAt: iso(subMinutes(baseTimestamp, 2)),
    favorite: true,
  },
  {
    id: "sofia",
    name: "Sofia Patel",
    phoneNumber: "+44 7444 222333",
    about: "Mobile engineer • London",
    avatarUrl: "https://i.pravatar.cc/120?img=33",
    isOnline: false,
    lastSeenAt: iso(subMinutes(baseTimestamp, 12)),
    pinned: true,
  },
  {
    id: "li",
    name: "Li Wei",
    phoneNumber: "+86 139 8888 1212",
    about: "Traveling in Kyoto 🇯🇵",
    avatarUrl: "https://i.pravatar.cc/120?img=52",
    isOnline: true,
    lastSeenAt: iso(subMinutes(baseTimestamp, 1)),
  },
  {
    id: "helena",
    name: "Helena Becker",
    phoneNumber: "+49 1522 778899",
    about: "Photographer • Berlin",
    avatarUrl: "https://i.pravatar.cc/120?img=39",
    isOnline: false,
    lastSeenAt: iso(subMinutes(baseTimestamp, 45)),
  },
  {
    id: "kevin",
    name: "Kevin Wright",
    phoneNumber: "+1 917-220-1988",
    about: "Running the NYC marathon 🏃",
    avatarUrl: "https://i.pravatar.cc/120?img=14",
    isOnline: false,
    lastSeenAt: iso(subMinutes(baseTimestamp, 5)),
  },
  {
    id: "team",
    name: "Product Guild",
    phoneNumber: "",
    about: "Where experiments happen",
    avatarUrl: "https://i.pravatar.cc/120?img=58",
    isOnline: true,
    lastSeenAt: iso(baseTimestamp),
  },
]

const profile: Profile = {
  id: "self",
  name: "You",
  phoneNumber: "+1 555-0100",
  avatarUrl: "https://i.pravatar.cc/120?img=65",
  about: "Building great products",
}

const chats: Record<string, Chat> = {}
const messages: Record<string, Message> = {}

function seedChat(
  contact: Contact,
  opts: { messageCount: number; startMinutesAgo: number; includeMediaEvery?: number }
) {
  const chatId = `chat-${contact.id}`
  let lastCreatedAt = subMinutes(baseTimestamp, opts.startMinutesAgo)

  const messageIds: string[] = []

  for (let i = 0; i < opts.messageCount; i++) {
    const createdAt = addMinutes(lastCreatedAt, Math.floor(rng() * 9) + 1)
    lastCreatedAt = createdAt

    const authorId = i % 2 === 0 ? contact.id : profile.id
    const status = authorId === profile.id ? messageStatuses[i % messageStatuses.length] : "read"
    const isMedia = opts.includeMediaEvery && (i + 1) % opts.includeMediaEvery === 0

    const messageId = nextId("msg")
    const message: Message = {
      id: messageId,
      chatId,
      authorId,
      contentType: isMedia ? "image" : "text",
      text: isMedia ? undefined : sampleText(authorId === profile.id ? "outgoing" : "incoming", i),
      media: isMedia
        ? {
            id: nextId("media"),
            type: "image",
            url: mediaPool[i % mediaPool.length],
            thumbnailUrl: mediaPool[i % mediaPool.length] + "&w=320",
            width: 1280,
            height: 720,
            caption:
              authorId === profile.id
                ? captions[(i / (opts.includeMediaEvery ?? 1)) % captions.length]
                : undefined,
          }
        : undefined,
      status,
      createdAt: iso(createdAt),
      updatedAt: iso(addMinutes(createdAt, 2)),
      replyToId: i > 0 && rng() > 0.92 ? messageIds.at(-1) : undefined,
      isForwarded: rng() > 0.98,
      reactions:
        rng() > 0.9
          ? [
              {
                emoji: "👍",
                authorId: authorId === profile.id ? contact.id : profile.id,
                createdAt: iso(addMinutes(createdAt, 5)),
              },
            ]
          : undefined,
    }

    messages[messageId] = message
    messageIds.push(messageId)
  }

  chats[chatId] = {
    id: chatId,
    contactId: contact.id,
    messageIds,
    unreadCount: contact.isOnline ? 0 : Math.floor(rng() * 3),
    archived: false,
    muted: false,
    lastActivityAt: messageIds.length
      ? messages[messageIds.at(-1) as string].createdAt
      : contact.lastSeenAt,
    lastMessagePreview: messageIds.length
      ? derivePreview(messages[messageIds.at(-1) as string])
      : undefined,
  }
}

const mediaPool = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1529257414771-1960ab1f9c07?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1519120126473-8be7aedcd6c6?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=800&q=80",
]

const outgoingSnippets = [
  "On my way now!",
  "Let's add this to the deck later today.",
  "I'm looping in the team for feedback.",
  "Sounds good – scheduling it for tomorrow.",
  "Can we try a lighter shade of the accent?",
]

const incomingSnippets = [
  "Sharing the updated mockups here 👇",
  "That timeline works perfectly.",
  "Dropping a few inspiration shots for the visuals.",
  "Thanks! I'll review and send thoughts tonight.",
  "Absolutely – excited for this iteration.",
]

const captions = [
  "Sunset palette inspiration for the onboarding hero.",
  "Final assets for the launch story.",
  "Team meetup captures – use what you like!",
]

function sampleText(direction: "incoming" | "outgoing", index: number) {
  const pool = direction === "incoming" ? incomingSnippets : outgoingSnippets
  return pool[index % pool.length]
}

function derivePreview(message: Message) {
  if (message.contentType === "image") {
    return message.media?.caption ?? "📷 Photo"
  }
  return message.text ?? "Media attachment"
}


seedChat(contacts[0], { messageCount: 48, startMinutesAgo: 360, includeMediaEvery: 11 })
seedChat(contacts[1], { messageCount: 32, startMinutesAgo: 90, includeMediaEvery: 5 })
seedChat(contacts[2], { messageCount: 16, startMinutesAgo: 50 })
seedChat(contacts[3], { messageCount: 64, startMinutesAgo: 120, includeMediaEvery: 9 })
seedChat(contacts[4], { messageCount: 22, startMinutesAgo: 240 })
seedChat(contacts[5], { messageCount: 12, startMinutesAgo: 15 })

const initialState: ChatStateSnapshot = {
  chats: Object.fromEntries(
    Object.entries(chats).sort(([, a], [, b]) => (a.lastActivityAt > b.lastActivityAt ? -1 : 1))
  ),
  messages,
  contacts: contacts.reduce<Record<string, Contact>>((acc, contact) => {
    acc[contact.id] = contact
    return acc
  }, {}),
  drafts: {},
  typingIndicators: [],
  searchHistory: [
    {
      id: nextId("search"),
      value: "launch",
      lastUsedAt: iso(subMinutes(baseTimestamp, 70)),
    },
    {
      id: nextId("search"),
      value: "feedback",
      lastUsedAt: iso(subMinutes(baseTimestamp, 220)),
    },
  ],
  activeChatId: "chat-carlos",
}

export const mockProfile = profile
export const mockChatState = initialState
