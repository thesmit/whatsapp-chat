"use client"

import { useEffect, useMemo } from "react"

import { createInboundMediaMessage, createInboundTextMessage } from "@/lib/chat/helpers"
import { useChatStore } from "@/lib/chat/state"
import type { Chat, Contact } from "@/lib/chat/types"

const responseSnippets = [
  "Just synced the latest updates – take a look when you can.",
  "Love where this is headed!",
  "I'll package these assets and drop them in a bit.",
  "Can we align on the microcopy before handoff?",
  "Here's a quick mock to illustrate the interaction.",
]

const mediaSamples = [
  {
    type: "image" as const,
    url: "https://images.unsplash.com/photo-1662523710245-f3f5486fbffd?auto=format&fit=crop&w=800&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1662523710245-f3f5486fbffd?auto=format&fit=crop&w=320&q=80",
    caption: "Concept reference for the hero treatment",
  },
  {
    type: "image" as const,
    url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=320&q=80",
    caption: "Palette inspo that pairs nicely with our accent",
  },
]

export function useChatSimulator() {
  const contacts = useChatStore((state) => state.contacts)
  const chats = useChatStore((state) => state.chats)
  const receiveMessage = useChatStore((state) => state.receiveMessage)
  const setTypingIndicator = useChatStore((state) => state.setTypingIndicator)

  const chatList = useMemo(() => Object.values(chats), [chats])

  useEffect(() => {
    if (!chatList.length) return

    const typingTimers = new Set<ReturnType<typeof setTimeout>>()

    const interval = setInterval(() => {
      const chat = pickChat(chatList, contacts)
      if (!chat) return
      const contact = contacts[chat.contactId]
      if (!contact) return

      setTypingIndicator(chat.id, contact.id, true)

      const duration = 2200 + Math.random() * 1800
      const timer = setTimeout(() => {
        setTypingIndicator(chat.id, contact.id, false)
        const message = Math.random() > 0.75
          ? createInboundMediaMessage({
              chatId: chat.id,
              authorId: contact.id,
              media: {
                id: `media-${Date.now()}`,
                ...mediaSamples[Math.floor(Math.random() * mediaSamples.length)],
              },
            })
          : createInboundTextMessage({
              chatId: chat.id,
              authorId: contact.id,
              text: responseSnippets[Math.floor(Math.random() * responseSnippets.length)],
            })

        receiveMessage(chat.id, message)
      }, duration)

      typingTimers.add(timer)
    }, 18000)

    return () => {
      clearInterval(interval)
      typingTimers.forEach((timer) => clearTimeout(timer))
      typingTimers.clear()
    }
  }, [chatList, contacts, receiveMessage, setTypingIndicator])
}

function pickChat(chats: Chat[], contacts: Record<string, Contact>) {
  const active = chats.filter((chat) => contacts[chat.contactId])
  if (!active.length) return undefined
  const index = Math.floor(Math.random() * active.length)
  return active[index]
}
