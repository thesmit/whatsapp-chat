"use client"

import { useMemo } from "react"

import { useChatSimulator } from "@/hooks/use-chat-simulator"
import { useIsMobile } from "@/hooks/use-mobile"
import { useChatStore } from "@/lib/chat/state"
import type { Chat, Contact, MediaAttachment, Message } from "@/lib/chat/types"
import { cn } from "@/lib/utils"

import { ChatPanel } from "./chat-panel"
import { ChatSidebar } from "./sidebar"

export function ChatApp() {
  const isMobile = useIsMobile()

  const chats = useChatStore((state) => state.chats)
  const contacts = useChatStore((state) => state.contacts)
  const profile = useChatStore((state) => state.profile)
  const messages = useChatStore((state) => state.messages)
  const activeChatId = useChatStore((state) => state.activeChatId)
  const searchQuery = useChatStore((state) => state.searchQuery)
  const searchHistory = useChatStore((state) => state.searchHistory)
  const drafts = useChatStore((state) => state.drafts)
  const typingIndicators = useChatStore((state) => state.typingIndicators)
  const setActiveChat = useChatStore((state) => state.setActiveChat)
  const setSearchQuery = useChatStore((state) => state.setSearchQuery)
  const pushSearchHistory = useChatStore((state) => state.pushSearchHistory)
  const sendComposerPayload = useChatStore((state) => state.sendComposerPayload)
  const updateDraft = useChatStore((state) => state.updateDraft)
  const clearDraft = useChatStore((state) => state.clearDraft)
  const markChatAsRead = useChatStore((state) => state.markChatAsRead)

  const chatList = useMemo(() => sortChats(Object.values(chats), contacts), [
    chats,
    contacts,
  ])

  const typingChatIds = useMemo(() => new Set(typingIndicators.map((indicator) => indicator.chatId)), [
    typingIndicators,
  ])

  useChatSimulator()

  const activeChat = activeChatId ? chats[activeChatId] : undefined
  const activeMessages = useMemo(() => {
    if (!activeChatId) return [] as Message[]
    const chat = chats[activeChatId]
    if (!chat) return [] as Message[]
    return chat.messageIds
      .map((id) => messages[id])
      .filter((message): message is Message => Boolean(message))
  }, [activeChatId, chats, messages])

  const activeDraft = activeChatId ? drafts[activeChatId] : undefined
  const typingForActive = useMemo(
    () => typingIndicators.some((indicator) => indicator.chatId === activeChatId),
    [typingIndicators, activeChatId]
  )

  const handleSelectChat = (chatId: string) => {
    setActiveChat(chatId)
    markChatAsRead(chatId)
  }

  const handleSendMessage = (
    chatId: string,
    payload: { text?: string; media?: MediaAttachment }
  ) => {
    sendComposerPayload(chatId, payload)
  }

  const content = (
    <div className="flex h-screen w-full overflow-hidden bg-app-surface">
      <div
        className={cn(
          "hidden h-full w-full max-w-sm shrink-0 border-border/60 md:flex",
          (!isMobile || !activeChatId) && "flex"
        )}
      >
        <ChatSidebar
          chats={chatList}
          contacts={contacts}
          profile={profile}
          activeChatId={activeChatId}
          searchQuery={searchQuery}
          searchHistory={searchHistory}
          typingChatIds={typingChatIds}
          onSelectChat={handleSelectChat}
          onSearchChange={setSearchQuery}
          onSearchSubmit={pushSearchHistory}
          onStartNewChat={() => {
            // Placeholder for future new chat flow
          }}
        />
      </div>

      <div
        className={cn(
          "flex h-full flex-1 bg-background",
          isMobile && !activeChatId && "hidden"
        )}
      >
        {activeChat && contacts[activeChat.contactId] ? (
          <ChatPanel
            chat={activeChat}
            contact={contacts[activeChat.contactId]}
            messages={activeMessages}
            profileId={profile.id}
            draft={activeDraft}
            typing={typingForActive}
            onBack={isMobile ? () => setActiveChat(undefined) : undefined}
            onChangeDraft={updateDraft}
            onClearDraft={clearDraft}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <EmptyConversationState />
        )}
      </div>
    </div>
  )

  return content
}

function sortChats(chats: Chat[], contacts: Record<string, Contact>) {
  return [...chats].sort((a, b) => {
    const contactA = contacts[a.contactId]
    const contactB = contacts[b.contactId]
    const pinnedA = contactA?.pinned ? 1 : 0
    const pinnedB = contactB?.pinned ? 1 : 0
    if (pinnedA !== pinnedB) {
      return pinnedB - pinnedA
    }
    return a.lastActivityAt > b.lastActivityAt ? -1 : 1
  })
}

function EmptyConversationState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-gradient-to-br from-secondary/60 via-background to-background">
      <div className="rounded-full bg-primary/10 p-6">
        <span className="text-4xl">💬</span>
      </div>
      <div className="max-w-sm text-center">
        <h2 className="text-lg font-semibold text-foreground">Select a conversation</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a chat to read messages, share updates, and keep conversations moving.
        </p>
      </div>
    </div>
  )
}
