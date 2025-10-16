"use client"

import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import { derivePreview, generateMessageId } from "./helpers"
import { mockChatState, mockProfile } from "./mock-data"
import type {
  Chat,
  ChatStateSnapshot,
  DraftMessage,
  MediaAttachment,
  Message,
  MessageContentType,
  MessageStatus,
  Profile,
  TypingIndicator,
} from "./types"

type ComposerPayload = {
  text?: string
  contentType?: MessageContentType
  media?: MediaAttachment
}

type DraftUpdate = Partial<DraftMessage>

export interface ChatStore extends ChatStateSnapshot {
  profile: Profile
  searchQuery: string
  showArchived: boolean
  setActiveChat: (chatId?: string) => void
  setSearchQuery: (value: string) => void
  pushSearchHistory: (value: string) => void
  updateDraft: (chatId: string, values: DraftUpdate) => void
  clearDraft: (chatId: string) => void
  sendComposerPayload: (chatId: string, payload: ComposerPayload) => string | undefined
  receiveMessage: (chatId: string, message: Message) => void
  markChatAsRead: (chatId: string) => void
  setTypingIndicator: (chatId: string, authorId: string, isTyping: boolean) => void
  toggleArchive: (chatId: string) => void
  resetStore: () => void
}

const noopStorage = () => ({
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
})

const statusTimers = new Map<string, ReturnType<typeof setTimeout>>()
function scheduleLifecycle(
  messageId: string,
  get: () => ChatStore,
  set: (updater: (state: ChatStore) => ChatStore | Partial<ChatStore>) => void,
  initialDelay = 350
) {
  const steps: MessageStatus[] = ["queued", "sending", "sent", "delivered", "read"]

  steps.forEach((status, idx) => {
    const delay = initialDelay + idx * 450
    const timer = setTimeout(() => {
      set((state) => {
        const existing = state.messages[messageId]
        if (!existing || existing.status === "error") {
          return state
        }

        const alreadyAtStatus = existing.status === status
        const statusOrder = steps.indexOf(existing.status)
        if (alreadyAtStatus || statusOrder > idx) {
          return state
        }

        const nextMessage: Message = {
          ...existing,
          status,
          updatedAt: new Date().toISOString(),
        }

        const chat = state.chats[nextMessage.chatId]
        if (!chat) return state

        return {
          ...state,
          messages: { ...state.messages, [messageId]: nextMessage },
          chats: {
            ...state.chats,
            [chat.id]: {
              ...chat,
              lastMessagePreview: derivePreview(nextMessage),
              lastActivityAt: nextMessage.createdAt,
            },
          },
        }
      })
    }, delay)

    statusTimers.set(`${messageId}-${status}`, timer)
  })
}

type StoreBaseState = ChatStateSnapshot & {
  profile: Profile
  searchQuery: string
  showArchived: boolean
}

const initialState: StoreBaseState = {
  ...mockChatState,
  profile: mockProfile,
  searchQuery: "",
  showArchived: false,
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      setActiveChat: (chatId) => {
        set((state) => {
          if (!chatId) {
            return { ...state, activeChatId: undefined }
          }
          if (!state.chats[chatId]) {
            return state
          }
          const nextChats: Record<string, Chat> = {
            ...state.chats,
            [chatId]: {
              ...state.chats[chatId],
              unreadCount: 0,
            },
          }
          return {
            ...state,
            chats: nextChats,
            activeChatId: chatId,
          }
        })
      },
      setSearchQuery: (value) => {
        set({ searchQuery: value })
      },
      pushSearchHistory: (value) => {
        set((state) => {
          const existing = state.searchHistory.find((item) => item.value === value)
          const timestamp = new Date().toISOString()

          if (existing) {
            return {
              ...state,
              searchHistory: state.searchHistory
                .map((item) =>
                  item.id === existing.id ? { ...item, lastUsedAt: timestamp } : item
                )
                .sort((a, b) => (a.lastUsedAt > b.lastUsedAt ? -1 : 1)),
            }
          }

          const id = generateMessageId("search")
          return {
            ...state,
            searchHistory: [
              { id, value, lastUsedAt: timestamp },
              ...state.searchHistory.slice(0, 4),
            ],
          }
        })
      },
      updateDraft: (chatId, values) => {
        set((state) => {
          const prev = state.drafts[chatId] ?? { chatId, text: "", attachments: [] }
          return {
            ...state,
            drafts: {
              ...state.drafts,
              [chatId]: {
                ...prev,
                ...values,
                attachments: values.attachments ?? prev.attachments ?? [],
              },
            },
          }
        })
      },
      clearDraft: (chatId) => {
        set((state) => {
          const nextDrafts = { ...state.drafts }
          delete nextDrafts[chatId]
          return { ...state, drafts: nextDrafts }
        })
      },
      sendComposerPayload: (chatId, payload) => {
        const chat = get().chats[chatId]
        if (!chat) return undefined

        const id = generateMessageId()
        const timestamp = new Date().toISOString()
        const message: Message = {
          id,
          chatId,
          authorId: get().profile.id,
          contentType: payload.contentType ?? (payload.media ? payload.media.type : "text"),
          text: payload.text,
          media: payload.media,
          status: "queued",
          createdAt: timestamp,
          updatedAt: timestamp,
        }

        set((state) => {
          const nextMessages = { ...state.messages, [id]: message }
          const nextChat: Chat = {
            ...state.chats[chatId],
            messageIds: [...state.chats[chatId].messageIds, id],
            unreadCount: 0,
            lastActivityAt: timestamp,
            lastMessagePreview: derivePreview(message),
          }

          return {
            ...state,
            messages: nextMessages,
            chats: { ...state.chats, [chatId]: nextChat },
            drafts: { ...state.drafts, [chatId]: { chatId, text: "", attachments: [] } },
          }
        })

        scheduleLifecycle(id, get, set)
        return id
      },
      receiveMessage: (chatId, message) => {
        set((state) => {
          const nextMessages = { ...state.messages, [message.id]: message }
          const chat = state.chats[chatId]
          if (!chat) return state

          const nextChat: Chat = {
            ...chat,
            messageIds: [...chat.messageIds, message.id],
            unreadCount:
              state.activeChatId === chatId ? 0 : Math.min(chat.unreadCount + 1, 99),
            lastActivityAt: message.createdAt,
            lastMessagePreview: derivePreview(message),
          }

          return {
            ...state,
            messages: nextMessages,
            chats: { ...state.chats, [chatId]: nextChat },
          }
        })
      },
      markChatAsRead: (chatId) => {
        set((state) => {
          const chat = state.chats[chatId]
          if (!chat) return state

          return {
            ...state,
            chats: {
              ...state.chats,
              [chatId]: {
                ...chat,
                unreadCount: 0,
              },
            },
          }
        })
      },
      setTypingIndicator: (chatId, authorId, isTyping) => {
        set((state) => {
          const exists = state.typingIndicators.find(
            (indicator) => indicator.chatId === chatId && indicator.authorId === authorId
          )

          if (isTyping && !exists) {
            const indicator: TypingIndicator = {
              chatId,
              authorId,
              startedAt: new Date().toISOString(),
            }
            return { ...state, typingIndicators: [...state.typingIndicators, indicator] }
          }

          if (!isTyping && exists) {
            return {
              ...state,
              typingIndicators: state.typingIndicators.filter(
                (indicator) => !(indicator.chatId === chatId && indicator.authorId === authorId)
              ),
            }
          }

          return state
        })
      },
      toggleArchive: (chatId) => {
        set((state) => {
          const chat = state.chats[chatId]
          if (!chat) return state
          return {
            ...state,
            chats: {
              ...state.chats,
              [chatId]: { ...chat, archived: !chat.archived },
            },
          }
        })
      },
      resetStore: () => {
        statusTimers.forEach((timer) => clearTimeout(timer))
        statusTimers.clear()
        set({ ...initialState })
      },
    }),
    {
      name: "chat-store",
      version: 1,
      storage: createJSONStorage(() => (typeof window === "undefined" ? noopStorage() : localStorage)),
      partialize: (state) => ({
        chats: state.chats,
        messages: state.messages,
        contacts: state.contacts,
        drafts: state.drafts,
        searchHistory: state.searchHistory,
        profile: state.profile,
        activeChatId: state.activeChatId,
        showArchived: state.showArchived,
      }),
    }
  )
)

export const chatSelectors = {
  chatList: (state: ChatStore) => Object.values(state.chats),
  activeChat: (state: ChatStore) =>
    state.activeChatId ? state.chats[state.activeChatId] : undefined,
  activeMessages: (state: ChatStore) => {
    if (!state.activeChatId) return []
    const chat = state.chats[state.activeChatId]
    return chat.messageIds.map((id) => state.messages[id]).filter(Boolean)
  },
  contacts: (state: ChatStore) => Object.values(state.contacts),
}
