"use client"

import { useMemo } from "react"
import { MagnifyingGlass, Plus } from "@phosphor-icons/react"
import { format, formatDistanceToNow, isToday } from "date-fns"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type {
  Chat,
  ChatSearchHistoryItem,
  Contact,
  Profile,
} from "@/lib/chat/types"
import { cn } from "@/lib/utils"

interface ChatSidebarProps {
  chats: Chat[]
  contacts: Record<string, Contact>
  profile: Profile
  activeChatId?: string
  searchQuery: string
  searchHistory: ChatSearchHistoryItem[]
  typingChatIds: Set<string>
  onSelectChat: (chatId: string) => void
  onSearchChange: (value: string) => void
  onSearchSubmit: (value: string) => void
  onStartNewChat: () => void
}

export function ChatSidebar({
  chats,
  contacts,
  profile,
  activeChatId,
  searchQuery,
  searchHistory,
  typingChatIds,
  onSelectChat,
  onSearchChange,
  onSearchSubmit,
  onStartNewChat,
}: ChatSidebarProps) {
  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) {
      return chats
    }

    return chats.filter((chat) => {
      const contact = contacts[chat.contactId]
      return (
        contact?.name.toLowerCase().includes(query) ||
        chat.lastMessagePreview?.toLowerCase().includes(query)
      )
    })
  }, [chats, contacts, searchQuery])

  return (
    <aside className="flex h-full w-full flex-col border-r border-sidebar-border/70 bg-sidebar/80 backdrop-blur-xl">
      <header className="flex items-center justify-between px-5 pb-4 pt-5">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 border border-border/60">
            <AvatarImage src={profile.avatarUrl} alt={profile.name} />
            <AvatarFallback>{initials(profile.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-sidebar-foreground">{profile.name}</p>
            <p className="text-xs text-muted-foreground">{profile.about}</p>
          </div>
        </div>
        <Button
          onClick={onStartNewChat}
          size="icon"
          variant="outline"
          className="h-10 w-10 rounded-full border-sidebar-border/80 bg-sidebar"
        >
          <Plus className="h-5 w-5" />
          <span className="sr-only">Start new chat</span>
        </Button>
      </header>

      <div className="px-5 pb-3">
        <div className="relative">
          <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                const value = event.currentTarget.value.trim()
                if (value) {
                  onSearchSubmit(value)
                }
              }
            }}
            className="h-10 rounded-full border border-sidebar-border bg-sidebar/30 pl-9 text-sm focus-visible:ring-2 focus-visible:ring-primary/40"
            placeholder="Search chats"
          />
        </div>

        {searchQuery.length === 0 && searchHistory.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {searchHistory.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSearchChange(item.value)}
                className="rounded-full bg-sidebar-accent px-3 py-1 text-xs font-medium text-sidebar-accent-foreground shadow-sm transition hover:bg-sidebar-accent/80"
              >
                {item.value}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="overflow-y-auto px-1">
        {filtered.map((chat) => {
          const contact = contacts[chat.contactId]
          if (!contact) return null
          const isActive = chat.id === activeChatId
          const isTyping = typingChatIds.has(chat.id)

          return (
            <button
              key={chat.id}
              type="button"
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition",
                isActive
                  ? "bg-sidebar-accent/70 text-sidebar-foreground shadow-sm"
                  : "hover:bg-sidebar-accent/40"
              )}
              onClick={() => onSelectChat(chat.id)}
            >
              <Avatar className="h-12 w-12 border border-border/60">
                <AvatarImage src={contact.avatarUrl} alt={contact.name} />
                <AvatarFallback>{initials(contact.name)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-sidebar-foreground">
                    {contact.name}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {formatActivity(chat.lastActivityAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-xs text-muted-foreground">
                    {isTyping ? "Typing…" : chat.lastMessagePreview ?? "No messages yet"}
                  </p>
                  {chat.unreadCount ? (
                    <Badge className="rounded-full bg-accent text-accent-foreground">
                      {chat.unreadCount}
                    </Badge>
                  ) : null}
                </div>
              </div>
            </button>
          )
        })}

        {filtered.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-muted-foreground">
            No chats match your search.
          </div>
        ) : null}
      </div>
    </aside>
  )
}

function initials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

function formatActivity(dateIso: string) {
  const date = new Date(dateIso)
  if (isToday(date)) {
    return format(date, "HH:mm")
  }
  return formatDistanceToNow(date, { addSuffix: true })
}
