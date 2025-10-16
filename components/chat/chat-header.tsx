"use client"

import { CaretLeft, DotsThreeVertical, Phone, VideoCamera } from "@phosphor-icons/react"
import { formatDistanceToNow } from "date-fns"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { Contact } from "@/lib/chat/types"
import { cn } from "@/lib/utils"

interface ChatHeaderProps {
  contact: Contact
  isOnline: boolean
  onBack?: () => void
}

export function ChatHeader({ contact, isOnline, onBack }: ChatHeaderProps) {
  return (
    <header className="flex h-20 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur">
      <div className="flex items-center gap-3">
        {onBack ? (
          <Button
            size="icon"
            variant="ghost"
            onClick={onBack}
            className="mr-1 h-9 w-9 text-muted-foreground"
          >
            <CaretLeft className="h-5 w-5" />
            <span className="sr-only">Back to chats</span>
          </Button>
        ) : null}

        <div className="relative">
          <Avatar className="h-11 w-11 border border-border/60">
            <AvatarImage src={contact.avatarUrl} alt={contact.name} />
            <AvatarFallback>{initials(contact.name)}</AvatarFallback>
          </Avatar>
          <span
            className={cn(
              "absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-background",
              isOnline ? "bg-accent" : "bg-muted"
            )}
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{contact.name}</p>
          <p className="text-xs text-muted-foreground">
            {isOnline ? "Online" : `last seen ${formatDistanceToNow(new Date(contact.lastSeenAt), { addSuffix: true })}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground">
          <Phone className="h-5 w-5" />
          <span className="sr-only">Start voice call</span>
        </Button>
        <Button size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground">
          <VideoCamera className="h-5 w-5" />
          <span className="sr-only">Start video call</span>
        </Button>
        <Button size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground">
          <DotsThreeVertical className="h-5 w-5" />
          <span className="sr-only">Conversation options</span>
        </Button>
      </div>
    </header>
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
